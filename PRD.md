PRD — Overview
•	Title: FoodDonate (India) — Donate excess food & raw items to NGOs & needy people.
•	Goal: Build a reliable mobile-first app to connect donors (restaurants, vendors, individuals) with verified receivers (NGOs, shelters) for same-day pickup/delivery of excess food or raw items to reduce waste and feed the needy.
•	Target users: Restaurants/caterers/grocery vendors/individual donors; NGOs/charities/volunteers; admin/moderators.
•	Platform: Mobile (React Native, Expo) + Backend API (Node/Express) + Postgres + Admin/Panel (Next.js optional). Deploy backend & admin to Vercel (serverless or hosted) and Postgres on managed DB (or use Docker/PostGIS for local dev).
Success metrics (MVP)
•	1st-month pilot: 50 active donors, 20 verified NGOs, 500 donations logged.
•	System-level: API uptime 99.5%, average match latency < 5 minutes, listing acceptance rate > 60%.
•	Safety / compliance: 100% of NGOs verified via admin flow in pilot.
Primary features (MVP)
•	Phone OTP login & account creation (mock for dev; SMS provider for prod).
•	Roles: Donor, Receiver (NGO), Both; Organization verification via document upload and admin approval.
•	Donors: Create listings (cooked/raw), quantity, pickup window, location (GPS), photos.
•	Receivers: Map/list view to find nearby available donations, request/reserve quantity, contact donor.
•	Reservation workflow: request → accept/reject → pickup → complete → auditlog.
•	Filters: radius, required quantity, pickup-by time, type (cooked/raw), veg/non-veg.
•	Admin panel: review verification docs, approve/reject users, moderate listings, ban users.
•	Background jobs: auto-expire listings after pickup_end, reminders, daily reports.
•	Logging & audit: store photo/time/party for accountability.
Security, privacy & compliance
•	Phone-based identity (OTP), document uploads for org verification; avoid storing Aadhaar numbers; secure file storage (S3 in prod).
•	HTTPS only; encrypt secrets; GDPR/Indian privacy guidelines compliance.
•	Food-safety disclaimers and simple in-app guidance.
User stories (short)
•	As a donor I can quickly create a listing with location and pickup-window so NGOs nearby can reserve leftovers.
•	As a receiver I can find donations near me filtered by quantity and pickup time and request a reservation.
•	As an admin I can review uploaded verification docs and approve organizations.
•	As a system I will expire listings after pickup_end and notify parties via push/SMS.
Non-functional requirements
•	Geo-search within 5–10 km with sub-second query times for small scale.
•	Scalable to thousands of users; design for eventual horizontal scaling and caching (Redis).
•	Secure storage of PII and uploaded files.
Acceptance criteria (MVP)
•	OTP login flow works and returns JWT.
•	Donors can create listings with lat/lng and listings appear in nearby search.
•	Receivers can request reservation; owner can mark completed.
•	Admin can approve a user and the verified badge is visible.
Data model (simplified)
•	users(id, phone, name, role, verified, created_at)
•	otp_codes(id, phone, code, expires_at, used)
•	listings(id, seller_id, title, description, item_type, veg, quantity, unit, pickup_start, pickup_end, address, location(geometry Point), status, images, created_at)
•	requests(id, listing_id, requester_id, quantity_requested, status, created_at, updated_at)
•	audits(id, user_id, action, payload jsonb, created_at)
•	verification_docs(id, user_id, file_path, status, created_at) — optional
API contract (key endpoints)
•	POST /auth/send-otp { phone } → 200 { message }
•	POST /auth/verify { phone, code, name?, role? } → 200 { token, user }
•	POST /listings (auth, multipart) fields: title, description, item_type, veg, quantity, unit, pickup_start, pickup_end, address, lat, lng, images[] → 201 listing
•	GET /listings/nearby?lat=&lng=&radius=&min_qty=&by_time= → 200 { listings[] }
•	POST /requests { listing_id, quantity_requested } (auth) → 201 request
•	POST /requests/:id/accept (auth) → 200
•	POST /requests/:id/complete (auth) → 200
•	POST /users/:id/verification (auth, multipart) → 200 (admin review)
•	Admin: GET /admin/pending-verifications, PATCH /admin/users/:id/verify
Deployment & hosting
•	Backend: Vercel (serverless functions) or Node server on a VPS; for Postgres use managed DB (Heroku Postgres, Supabase, Neon, DigitalOcean DB)
•	Frontend (mobile): Expo (deploy via app stores) or React Native build pipelines.
•	Admin/web panel: Next.js on Vercel (recommended).
•	Environment variables must be set in Vercel dashboard (JWT secret, DB URL, S3 creds, SMS provider keys).
•	For local dev use Docker Compose with PostGIS (manifest included below).
Vercel notes
•	For serverless Node endpoints hostable on Vercel use Next.js API routes or deploy an express app via serverless functions (small caveats: persistent connections to Postgres; prefer serverless-friendly pool or use Neon).
•	Add environment variables on Vercel: DATABASE_URL, JWT_SECRET, SMS_API_KEY, S3_BUCKET, S3_KEY, S3_SECRET, S3_REGION, NEXT_PUBLIC_MAPS_API_KEY.
CI & Repo
•	Use GitHub Actions to run lint & tests; Vercel will auto-deploy on push to main after integration.
•	Branching: main (production), develop (staging), feature/*.
Monitoring & Ops
•	Logs: central logging (Sentry) for frontend and backend.
•	Alerts for failed background jobs or DB outages.
•	Metrics: acceptance time, pickup completions, daily donations.
File manifest (create these files in your IDE) Below I list the essential files and the two most important file templates (backend package.json & index.js and frontend package.json & App.js). For the full code you already received earlier, reuse it — this manifest maps that scaffold into an organized repo ready to push to GitHub and deploy.
Top-level tree (recommended)
•	README.md (PRD summary + run instructions)
•	docker-compose.yml
•	.gitignore
•	backend/
o	package.json
o	.env.example
o	Dockerfile
o	migrations/init.sql
o	src/
	index.js
	db.js
	middleware/auth.js
	routes/auth.js
	routes/listings.js
	routes/requests.js
	uploads/ (gitignored)
o	README.md
•	frontend/
o	package.json
o	app.json
o	App.js
o	screens/
	LoginScreen.js
	MapScreen.js
	CreateListingScreen.js
o	README.md
•	admin/ (optional)
o	next.config.js
o	pages/
	index.js
	api/.... (admin API proxies to backend)
•	infra/
o	vercel.json
o	github/workflows/ci.yml (optional)
Important file templates (copy into files)
1.	Root README.md (short)
Markdown
# FoodDonate PRD + Scaffold
This repo contains the PRD and scaffold for FoodDonate MVP.
Follow backend/README.md and frontend/README.md to get started.
1.	
docker-compose.yml (local dev PostGIS + backend) (Use the same docker-compose.yml content from the scaffold I provided earlier.)
2.	
3.	
backend/package.json (use the package.json content included previously in the scaffold; ensures nodemon, dependencies)
4.	
5.	
backend/src/index.js (use the earlier index.js; it wires routes & starts Express)
6.	
7.	
backend/migrations/init.sql (use the earlier init.sql; creates tables & PostGIS extension)
8.	
9.	
frontend/package.json and frontend/App.js (use the earlier provided Expo package.json and App.js)
10.	
11.	
infra/vercel.json (example for Next.js admin)
12.	
JSON
{
  "version": 2,
  "builds": [
    { "src": "admin/package.json", "use": "@vercel/next" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" }
  ]}
1.	.gitignore
Code
node_modules
.env
backend/uploads
frontend/.expo
*.log
Environment variables (set these in Vercel and locally)
•	DATABASE_URL (postgres://user:pass@host:port/db)
•	JWT_SECRET
•	SMS_PROVIDER_API_KEY (for OTP provider)
•	SMS_PROVIDER_SENDER (optional)
•	S3_BUCKET, S3_KEY, S3_SECRET, S3_REGION (file storage)
•	NEXT_PUBLIC_MAPS_API_KEY (Google or Mapbox for frontend)
•	NODE_ENV
CI / GitHub Actions (simple lint & test) Create .github/workflows/ci.yml:
YAML
name: CIon: [push, pull_request]jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install backend deps
        run: |
          cd backend
          npm ci      - name: Run backend lint/test
        run: |
          cd backend
          npm run lint || true
(Expand with real tests as you build them.)
How to use this PRD to scaffold in your IDE (step-by-step)
1.	Create a new Git repository and copy the top-level tree structure above into it.
2.	Paste the provided file contents for the key templates (backend and frontend) into the corresponding files.
3.	In backend/.env (copy .env.example), set DATABASE_URL to your local Docker DB or managed DB.
4.	Start local dev (with Docker): docker compose up --build
5.	In frontend: cd frontend && npm install && expo start
6.	Connect your Expo device to the backend: replace BACKEND URL in frontend screens with http://<your-lan-ip>:4000 for real devices.
7.	Test OTP flow (backend logs OTP), create listing, verify nearby search.
Vercel deployment steps
•	Create a GitHub repo and push code.
•	Sign in to Vercel, import the repo.
•	For the frontend mobile app, Vercel is not used (mobile uses Expo). Use Vercel for web admin (Next.js).
•	Configure environment variables in Vercel dashboard (DATABASE_URL, JWT_SECRET, S3 creds, SMS keys, NEXT_PUBLIC_MAPS_API_KEY).
•	Link Vercel to your GitHub and select branch to deploy (main).
•	Confirm build logs and visit the Admin web app URL.
Acceptance checklist before push to main
•	  OTP provider integrated (replace mock console OTP)
•	  Database migrations tested (PostGIS available)
•	  File uploads stored in S3 in prod
•	  Admin user exists and can approve verifications
•	  Environment variables present in Vercel
•	  CI passes on push
