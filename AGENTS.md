# 📄 Golf Charity Subscription Platform

## 1. Project Overview

A **subscription-based web application** that combines:

* Golf score tracking (Stableford format)
* Monthly draw-based rewards system
* Charity contribution system

### Core Experience

Users:

* Subscribe (monthly/yearly)
* Enter last 5 golf scores
* Participate in monthly draws
* Contribute to a selected charity

---

## 2. Core Objectives

### 2.1 Subscription Engine

* Monthly & yearly plans
* Payment gateway integration (Stripe or equivalent)
* Subscription lifecycle handling:

  * Active
  * Cancelled
  * Expired
* Access restriction for non-subscribers
* Real-time validation on authenticated requests

### 2.2 Score Experience

* Simple UI for entering scores
* Maintain only last 5 scores per user
* Auto-replace oldest score when new one is added

### 2.3 Draw Engine

* Monthly draw system
* Two modes:

  * Random
  * Algorithmic (based on score frequency)

### 2.4 Charity Integration

* Charity selection at signup
* Minimum 10% contribution
* Optional increase by user

### 2.5 Admin Control

* Full dashboard for managing:

  * Users
  * Draws
  * Charities
  * Winners
  * Reports

---

## 3. User Roles

### 3.1 Public Visitor

* View platform concept
* Browse charities
* Understand draw mechanics
* Start subscription

### 3.2 Registered Subscriber

* Manage profile
* Enter/edit scores
* Select charity
* View draws & winnings
* Upload winner proof

### 3.3 Administrator

* Manage users & subscriptions
* Configure & run draws
* Manage charities
* Verify winners
* View analytics

---

## 4. Subscription & Payment System

### Features

* Plans:

  * Monthly
  * Yearly (discounted)
* Payment gateway (Stripe recommended)
* Subscription states:

  * Active
  * Cancelled
  * Expired
* Middleware must:

  * Validate subscription on every request

---

## 5. Score Management System

### Input Rules

* Exactly **last 5 scores**
* Score range: **1–45**
* Each score must include:

  * Value
  * Date

### Logic

* Store max 5 scores
* New score:
  → removes oldest score
* Display:
  → reverse chronological order

---

## 6. Draw & Reward System

### Draw Types

* 5-number match
* 4-number match
* 3-number match

### Draw Logic

* Option 1: Random (lottery style)
* Option 2: Algorithmic:

  * Based on score frequency patterns

### Execution

* Runs **once per month**
* Admin:

  * Can simulate before publishing
  * Controls final publish

### Special Rule

* 5-match jackpot rolls over if no winner

---

## 7. Prize Pool Logic

### Distribution

| Match Type | Share | Rollover |
| ---------- | ----- | -------- |
| 5 Match    | 40%   | Yes      |
| 4 Match    | 35%   | No       |
| 3 Match    | 25%   | No       |

### Rules

* Prize pool derived from subscriptions
* Split equally among winners
* Auto-calculated per month
* Jackpot carries forward if unclaimed

---

## 8. Charity System

### Contribution Model

* Default: ≥10% of subscription
* User can increase %

### Features

* Charity directory:

  * Search
  * Filter
* Charity profile:

  * Description
  * Images
  * Events
* Homepage:

  * Featured charity

### Additional

* Independent donations allowed

---

## 9. Winner Verification System

### Flow

1. User wins
2. Uploads proof (screenshot)
3. Admin reviews:

   * Approve / Reject
4. Payment status:

   * Pending → Paid

---

## 10. User Dashboard

Must include:

* Subscription status
* Score management UI
* Selected charity + %
* Draw participation summary
* Winnings overview:

  * Total earned
  * Payment status

---

## 11. Admin Dashboard

### 11.1 User Management

* View/edit users
* Edit scores
* Manage subscriptions

### 11.2 Draw Management

* Select draw type
* Run simulations
* Publish results

### 11.3 Charity Management

* Add/edit/delete charities
* Manage media/content

### 11.4 Winner Management

* View winners
* Verify proofs
* Mark payouts complete

### 11.5 Reports & Analytics

* Total users
* Total prize pool
* Charity contributions
* Draw stats

---

## 12. UI / UX Requirements

### Design Principles

* Emotion-driven (charity-first)
* Avoid traditional golf visuals

### Style

* Clean, modern UI
* Subtle animations
* Micro-interactions

### Homepage Must Communicate:

* What user does
* How they win
* Charity impact
* Clear CTA

### CTA

* Prominent “Subscribe” flow

---

## 13. Technical Requirements

### Frontend

* Mobile-first
* Fully responsive

### Backend

* Secure authentication:

  * JWT or session-based
* HTTPS required

### Performance

* Fast load times
* Optimized assets

### Notifications

* Email system:

  * Draw results
  * Subscription updates
  * Winner alerts

---

## 14. Scalability Requirements

System must support:

* Multi-country expansion
* Team/corporate accounts
* Future campaign module
* Mobile app compatibility

---

## 16. Deployment Requirements

* Deploy frontend/backend (e.g. Vercel)
* Use fresh environment:

  * New Vercel account
  * New database (Supabase recommended)
* Configure environment variables securely

---

## 17. Mandatory Deliverables

* Live deployed website
* Fully functional:

  * User panel
  * Admin panel
* Connected database
* Clean codebase

---

## 18. Testing Checklist

### Core Features

* Signup/Login
* Subscription flow
* Score entry (5-score logic)
* Draw system
* Charity selection
* Winner verification

### Dashboards

* User dashboard complete
* Admin dashboard complete

### Quality

* Data accuracy
* Responsive design
* Error handling
* Edge case handling