# Connect with Food - Backend API

Backend service for the Connect with Food platform - a food donation matching system connecting donors with NGOs and needy people.

## Features

- **Authentication**: Phone OTP-based login with JWT tokens
- **Listings**: Create food donation listings with location and timing
- **Requests**: Request and reserve food items
- **Admin Panel**: Manage users and verify organizations
- **Geolocation**: Find donations near you using lat/lng queries

## Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Initialize database**
   ```bash
   psql -U postgres -d connect_with_food -f migrations/init.sql
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

Server will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /auth/send-otp` - Request OTP
- `POST /auth/verify` - Verify OTP and login

### Listings
- `POST /listings` - Create listing (authenticated)
- `GET /listings` - Get all listings
- `GET /listings/:id` - Get listing details
- `GET /listings/nearby?lat=&lng=&radius=` - Find nearby donations

### Requests
- `POST /requests` - Create request (authenticated)
- `POST /requests/:id/accept` - Accept request (owner only)
- `POST /requests/:id/complete` - Mark as completed

## Database Schema

See `migrations/init.sql` for the complete schema including:
- Users (with roles: donor, receiver, both)
- Listings (food items available)
- Requests (reservations)
- OTP Codes (for authentication)
- Audit Logs (for accountability)
- Verification Docs (for NGO verification)

## Deployment

Deploy to Vercel:
```bash
vercel deploy
```

Set environment variables in Vercel dashboard:
- DATABASE_URL
- JWT_SECRET
- SMS_API_KEY
- S3_BUCKET (if using file uploads)

## Local Development with Docker

```bash
docker-compose up
```

## Contributing

Follow Git flow: `main` (prod) → `develop` (staging) → `feature/*` (features)

## License

MIT
