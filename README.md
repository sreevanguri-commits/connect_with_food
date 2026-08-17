# Connect with Food 🍽️

A mobile-first platform connecting food donors (restaurants, vendors, individuals) with verified receivers (NGOs, shelters, volunteers) for same-day pickup/delivery of excess food to reduce waste and feed the needy.

## 🎯 Project Overview

**Problem**: Food waste + Hunger  
**Solution**: Real-time food donation matching platform

**Target Users**:
- Donors: Restaurants, caterers, grocery vendors, individuals
- Receivers: NGOs, food banks, volunteers, shelter workers
- Admins: Moderators for verification and compliance

---

## 📋 Key Features (MVP)

✅ **Authentication**: Phone OTP login with JWT tokens  
✅ **Listings**: Create food donations with location, timing, quantity, photos  
✅ **Map View**: Find nearby donations using GPS (5-10 km radius)  
✅ **Requests**: Reserve and confirm food pickups  
✅ **Verification**: Document-based NGO verification via admin  
✅ **Audit Logs**: Track all transactions for accountability  
✅ **Geolocation Search**: Sub-second queries for nearby items  

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Mobile** | React Native + Expo |
| **Backend** | Node.js + Express + PostgreSQL |
| **Admin** | Next.js (optional) |
| **Deployment** | Vercel (serverless) + Managed PostgreSQL |
| **Local Dev** | Docker Compose + PostGIS |

### Project Structure

```
connect-with-food/
├── PRD.md                    # Product Requirements Document
├── README.md                 # This file
├── docker-compose.yml        # Local dev environment
├── .gitignore               # Git ignore rules
│
├── backend/                 # Node.js API Server
│   ├── package.json
│   ├── .env.example
│   ├── Dockerfile
│   ├── src/
│   │   ├── index.js         # Server entry point
│   │   ├── db.js            # Database connection
│   │   ├── middleware/
│   │   │   └── auth.js      # JWT auth middleware
│   │   └── routes/
│   │       ├── auth.js      # OTP & login endpoints
│   │       ├── listings.js  # Create/search listings
│   │       └── requests.js  # Request management
│   ├── migrations/
│   │   └── init.sql         # Database schema
│   └── uploads/             # File storage (gitignored)
│
├── frontend/                # React Native Mobile App
│   ├── package.json
│   ├── app.json            # Expo config
│   ├── App.js              # Navigation & root component
│   ├── screens/
│   │   ├── LoginScreen.js       # OTP auth UI
│   │   ├── MapScreen.js         # Map + nearby listings
│   │   ├── CreateListingScreen.js # Form to share food
│   │   └── ProfileScreen.js     # User profile & settings
│   └── assets/             # Icons, splash images
│
└── admin/                   # Next.js Admin Panel (optional)
    └── (To be created)
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+
- **npm** or **yarn**
- **Docker & Docker Compose** (for local PostgreSQL)
- **Expo CLI**: `npm install -g expo-cli` (for mobile dev)

### Option 1: Local Development (Recommended)

#### 1. Start Database & Backend with Docker

```bash
# Navigate to project root
cd ~/my-mvp-app

# Start services (PostgreSQL, Backend, Redis)
docker-compose up

# In another terminal, set up backend
cd backend
npm install
# Database migrations run automatically via Docker

# Backend will be available at: http://localhost:3000
# Check health: curl http://localhost:3000/health
```

#### 2. Start Frontend

```bash
cd frontend
npm install
npm start

# Then press:
# 'i' for iOS simulator
# 'a' for Android emulator
# 'w' for web browser
```

#### 3. Test the App

- **Login**: 
  - Phone: any 10-digit number
  - OTP: Check backend logs (e.g., `OTP for 9876543210: 123456`)
  
- **Create Listing**: Share Food tab → Fill form → Submit
- **Find Donations**: Find Food tab → View map → Tap marker → Request

---

### Option 2: Production Deployment

#### Deploy Backend to Vercel

```bash
cd backend
npm install -g vercel
vercel deploy

# Set environment variables on Vercel dashboard:
# - DATABASE_URL (Heroku Postgres, Neon, Supabase, etc.)
# - JWT_SECRET (generate: openssl rand -base64 32)
# - SMS_API_KEY (Twilio, AWS SNS, etc. for prod)
# - S3_BUCKET, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY
```

#### Deploy Frontend to EAS (Expo Application Services)

```bash
cd frontend
npm install -g eas-cli
eas build --platform ios --auto-submit
eas build --platform android --auto-submit
```

#### Database: Choose One

- **Neon** (PostgreSQL SaaS): https://neon.tech
- **Supabase** (PostgreSQL + Auth): https://supabase.com
- **Heroku Postgres** (deprecated but still works): https://www.heroku.com/postgres
- **DigitalOcean Managed DB**: https://www.digitalocean.com

---

## 📡 API Endpoints

### Authentication
```
POST   /auth/send-otp     { phone }
POST   /auth/verify       { phone, code, name, role }
```

### Listings
```
POST   /listings                      (auth) → Create
GET    /listings                      → Get all
GET    /listings/:id                  → Get one
GET    /listings/nearby?lat=&lng=&radius= → Search
```

### Requests
```
POST   /requests                      (auth) → Create request
POST   /requests/:id/accept           (auth) → Accept
POST   /requests/:id/complete         (auth) → Mark done
```

### Admin (if implemented)
```
GET    /admin/pending-verifications
PATCH  /admin/users/:id/verify
POST   /admin/users/:id/ban
```

**Full API Spec**: See [PRD.md](./PRD.md)

---

## 🗄️ Database Schema

### Core Tables

**users**
```sql
id, phone, name, role (donor/receiver/both), verified, created_at
```

**listings**
```sql
id, seller_id, title, description, item_type (cooked/raw), 
veg (bool), quantity, unit, pickup_start, pickup_end, 
address, latitude, longitude, status, images, created_at
```

**requests**
```sql
id, listing_id, requester_id, quantity_requested, 
status (pending/accepted/rejected/completed), created_at
```

**audits**
```sql
id, user_id, action, payload (JSON), created_at
```

**verification_docs** (NGO verification)
```sql
id, user_id, file_path, status (pending/approved/rejected), created_at
```

---

## 🔐 Security & Compliance

- ✅ **OTP-based identity** (no password)
- ✅ **JWT tokens** with 7-day expiry
- ✅ **HTTPS only** (enforced in prod)
- ✅ **Document verification** for NGOs
- ✅ **Audit logs** for all transactions
- ✅ **No Aadhaar storage** (compliant with Indian privacy norms)
- ✅ **S3 encryption** for file uploads
- ✅ **GDPR/Privacy compliance** 

---

## 📊 Success Metrics (MVP)

| Metric | Target |
|--------|--------|
| Active Donors (Month 1) | 50+ |
| Verified NGOs | 20+ |
| Donations Logged | 500+ |
| API Uptime | 99.5% |
| Match Latency | < 5 mins |
| Listing Acceptance | > 60% |

---

## 🛠️ Development Workflow

### Git Flow

```
main (production)
├── hotfix/* (urgent fixes)
└── develop (staging)
    └── feature/* (features)
```

### Branching

```bash
# Start a feature
git checkout develop
git checkout -b feature/create-listing
git push origin feature/create-listing

# Create PR, merge to develop
# CI/CD tests automatically
```

### Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env

# Frontend (in app.json & API calls)
# Configure API_URL for your backend
```

---

## 📝 Configuration Files

### Backend `.env` Variables
```
DATABASE_URL=postgresql://user:password@host:5432/db
JWT_SECRET=your-super-secret-key
JWT_EXPIRY=7d
PORT=3000
NODE_ENV=development
OTP_EXPIRY=600
S3_BUCKET=your-bucket
SMS_API_KEY=your-sms-key
```

### Frontend `app.json` 
```json
{
  "expo": {
    "plugins": ["expo-location", "expo-permissions"],
    "ios": { "infoPlist": { "NSLocationWhenInUseUsageDescription": "..." } }
  }
}
```

---

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test

# End-to-End (Manual testing on emulator)
npm start  # Start both frontend & backend
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [PRD.md](./PRD.md) | Full product requirements |
| [backend/README.md](./backend/README.md) | Backend setup & API docs |
| [frontend/README.md](./frontend/README.md) | Mobile app setup guide |

---

## 🤝 Contributing

1. Clone the repo
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add feature"`
4. Push: `git push origin feature/your-feature`
5. Open PR

---

## 📞 Support & Issues

- **Issues**: Open GitHub issues
- **Discussions**: Use GitHub Discussions
- **Security**: Report to `security@connectwithfood.org`

---

## 📄 License

MIT License - See LICENSE file

---

## 🎉 Next Steps

1. ✅ Set up local dev environment (Docker)
2. ✅ Install dependencies & run backend
3. ✅ Run mobile app on emulator
4. ✅ Test OTP login & listing creation
5. Create admin verification panel (Next.js)
6. Integrate SMS provider (Twilio/AWS SNS)
7. Set up Sentry for error tracking
8. Launch pilot with 50 donors & 20 NGOs
9. Deploy to production (Vercel + EAS)

---

**Happy coding! Let's reduce food waste & feed the community.** 🌱
