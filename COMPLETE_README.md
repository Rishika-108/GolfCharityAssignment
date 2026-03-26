# Digital Heroes - Golf Charity Platform

A premium Next.js + Supabase application for a charity golf competition platform where players' golf scores determine their participation in monthly draws, with proceeds going to selected charities.

## 📋 Project Overview

**Phases Completed:**
- ✅ Phase 1-2: Discovery, Architecture, Database Schema, Infrastructure
- ✅ Phase 3-4: Auth, Subscriptions, Payments (Stripe)
- ✅ Phase 5-6: Prize Pool, Draw Engine, Winner Workflows
- ✅ Phase 7-9: Charity Module, Reporting, Admin Features
- ✅ Phase 10: UI/UX with Design System
- ✅ Phase 11-12: Security, QA, Testing, Post-launch Features

**Key Features:**
- User registration with charity selection (minimum 10% contribution)
- Monthly subscriptions (monthly/yearly plans via Stripe)
- Stableford score entry (5-score rolling window)
- Monthly draw with participants snapshot
- Prize pool allocation (40/35/25 split by tier)
- Winner proof upload & admin approval workflow
- Charity donation tracking
- Direct donation capability
- Advanced draw algorithms (weighted by history)
- Comprehensive reporting & CSV export
- Admin audit logs

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19 + Tailwind CSS 4
- **Backend**: Next.js API Routes + Supabase
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth + JWT
- **Payments**: Stripe (subscriptions)
- **Hosting**: Vercel (Next.js) + Supabase (DB)

---

## 📁 Project Structure

```
digital_heroes/
├── src/
│   ├── app/
│   │   ├── api/                    # All API endpoints
│   │   │   ├── register/
│   │   │   ├── subscription/
│   │   │   ├── stripe/webhook
│   │   │   ├── scores/
│   │   │   ├── draw/
│   │   │   ├── winners/
│   │   │   ├── charities/
│   │   │   ├── donations/
│   │   │   ├── reports/
│   │   │   ├── user/
│   │   │   ├── admin/
│   │   │   └── notifications/
│   │   ├── dashboard/              # User dashboard
│   │   ├── scores/                 # Score entry page
│   │   ├── layout.js
│   │   ├── page.js
│   │   └── globals.css             # Design system tokens
│   └── lib/
│       ├── supabaseClient.js       # Supabase initialization
│       ├── stripeClient.js         # Stripe initialization
│       ├── validation.js           # Input validation helpers
│       └── drawEngine.js           # Draw logic utilities
├── __tests__/                      # Test suites
│   ├── drawEngine.test.js
│   └── validation.test.js
├── middleware.js                   # Auth middleware
├── supabase_schema.sql             # Database schema DDL
├── supabase_rls.sql                # Row-level security policies
├── PHASE_11_12_SUMMARY.md          # Implementation summary
├── TESTING_GUIDE.md                # QA & testing instructions
├── package.json
└── README.md (this file)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- Supabase account (https://supabase.com)
- Stripe account (https://stripe.com)
- Environment variables configured

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create `.env.local`:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...

# Admin
ADMIN_API_TOKEN=your-secure-admin-token

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000 (or production domain)
```

### 3. Set up Database

```bash
# Apply schema
psql your-supabase-db-url -f supabase_schema.sql

# Apply RLS policies
psql your-supabase-db-url -f supabase_rls.sql

# Or use Supabase CLI
supabase db push
```

### 4. Run Development Server
```bash
npm run dev
```

Open http://localhost:3000

### 5. Run Tests
```bash
npm run test
npm run test:draw
npm run test:validation
```

---

## 📚 API Documentation

See `TESTING_GUIDE.md` for comprehensive API examples with curl commands.

### Core Endpoints

#### Registration & Subscriptions
- `POST /api/register` - Create user account
- `POST /api/subscription/create` - Create subscription + Stripe checkout
- `POST /api/subscription/manage` - Cancel/resume subscription
- `GET /api/subscription/list` - List user subscriptions

#### Scores
- `GET /api/scores?user_id=<id>` - List scores
- `POST /api/scores` - Add score (auto-rolling max 5)

#### Draws
- `POST /api/draw/run` - Execute monthly draw
- `POST /api/draw/finalize` - Calculate winners and prize pool
- `POST /api/draw/simulate` - Simulate draw without saving
- `POST /api/draw/advanced` - Run with weighted algorithm

#### Winners
- `POST /api/winners/proof` - Upload proof
- `PATCH /api/winners/review` - Auto-approve/reject
- `POST /api/winners/payout` - Mark as paid

#### Charities
- `GET/POST /api/charities` - List/create charities
- `POST /api/donations/direct` - Direct donation

#### Reports
- `GET /api/reports/metrics` - Dashboard metrics
- `GET /api/reports/export` - Export (JSON/CSV)

#### Admin
- `POST /api/admin/scheduled` - Run scheduled tasks
- `GET/POST /api/admin/logs` - Audit trail

---

## 🧪 Testing

### Unit Tests
```bash
npm run test:draw       # Draw logic tests
npm run test:validation # Input validation tests
npm run test            # Run all tests
```

### Integration Testing
See `TESTING_GUIDE.md` for manual curl-based integration tests covering:
- Registration & subscription flows
- Score entry & 5-score rolling
- Draw execution & finalization
- Winner workflow
- Reporting & exports
- Security (auth tokens)

---

## 🔐 Security

### Authentication
- User routes protected with Bearer token (JWT from Supabase Auth)
- Admin routes protected with `x-admin-token` header
- Middleware validates auth on all `/api` routes

### Database
- Row-Level Security (RLS) enforced on all tables
- Users can only access their own data
- Admins have full access via `is_admin` flag

### Input Validation
- Email format validation
- Score range (1-45) and date checks
- UUID format validation
- Amount bounds (0.01 - 1,000,000)
- Charity contribution >= 10%

### Payment Security
- Stripe webhook signature verification
- Service role key kept server-side only
- Anon key restricted to public operations

---

## 📊 Database Schema

17 tables:
- `profiles` - User accounts
- `subscriptions` - Billing records
- `payments` - Payment transactions
- `subscription_allocations` - Revenue split
- `charities` - Charity directory
- `user_charities` - User charity preference
- `charity_transactions` - Donations
- `scores` - Golf scores
- `draws` - Monthly draw records
- `draw_participants` - Eligible users snapshot
- `draw_results` - Match results
- `draw_simulations` - Simulation results
- `prize_pools` - Prize distribution
- `winners` - Winner records
- `proofs` - Proof uploads
- `notifications` - User notifications
- `admin_logs` - Audit trail

---

## 🎨 Design System

**Brand Colors** (from `globals.css`):
- Deep Green: `#0B3D2E` - Navbar, headings
- Emerald: `#1F7A63` - Buttons, active states
- Gold: `#D4AF37` - CTA, rewards
- Navy: `#1F3A5F` - Analytics
- Neutrals: White, grays

**Components**:
- `.card` - Default card styling
- `.btn-primary` - Gold gradient button
- `.btn-secondary` - Green gradient button

---

## 📝 Business Logic Summary

1. **Registration**: User → Charity → Subscription → Payment
2. **Scoring**: Max 5 rolling scores (auto-remove oldest on new entry)
3. **Draw**: Monthly snapshot of active users → generate 5 numbers → match scores → winners
4. **Prize**: 40% match-5, 35% match-4, 25% match-3; rollover if no winners
5. **Charity**: 10-100% user contribution per payment + direct donations
6. **Winners**: Pending → Proof upload → Admin review → Approved/Rejected → Paid
7. **Admin**: Full control over draws, winners, charities, audit logs

---

## 🚢 Deployment

### Vercel (Frontend)
```bash
vercel deploy
```

### Supabase (Backend)
```bash
supabase db push
supabase functions deploy
```

### Environment Variables (Production)
Set all vars in Vercel project settings and Supabase edge functions.

---

## 📞 Support & Maintenance

### Scheduled Tasks (Daily)
Call `POST /api/admin/scheduled` to:
- Transition `past_due` → `expired` after 7 days
- Auto-reject pending proofs after 7 days

**Setup**:
- Vercel Cron: Add to `vercel.json`
- Or use external service (EasyCron, AWS EventBridge)

### Monitoring
- Stripe webhook delivery
- DB query performance (check indexes)
- API response times
- Error logs via console

---

## 🎯 Next Steps (Future)

- [ ] Email service integration (SendGrid)
- [ ] SMS notifications (Twilio)
- [ ] File upload handler for proofs
- [ ] More admin UI pages
- [ ] User onboarding wizard
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Affiliate/referral system

---

## 📄 License

Private project. All rights reserved.

---

**Built with ❤️ for digital heroes**
