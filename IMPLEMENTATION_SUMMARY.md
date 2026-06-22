# Simba 2.0 — Implementation Summary

## Overview

Simba 2.0 is a full-stack e-commerce platform for a Rwandan supermarket chain. Customers browse 700+ products, build a cart, and place a pickup order secured by a small online deposit. Branch staff receive and prepare orders through a dedicated dashboard. The platform is fully multilingual (English, French, Kinyarwanda).

**Frontend:** Next.js 14, Tailwind CSS, Framer Motion, Zustand  
**Backend:** Next.js API Routes + Node.js/Express, Neon PostgreSQL  
**AI:** Groq LLaMA 3.3 70B  
**Auth:** Custom JWT + Google OAuth  
**Deployment:** Vercel (frontend), Render (backend)

---

## Features

### Authentication
- Email/password registration and login with JWT
- Google OAuth sign-in
- Forgot password with email reset link (Resend API)
- Session persistence via Zustand `persist` middleware

### Product Catalogue
- 700+ products across 11 categories
- Per-branch inventory tracking — stock decreases on order placement
- Recently viewed, saved favourites, product comparison
- AI-powered natural language search (Groq LLaMA 3.3 70B) with keyword fallback

### Checkout Flow
- Cart → Pickup Details → Payment → Order Tracking → Success
- 9 Kigali branch locations with real-time slot generation (Kigali timezone)
- Dynamic deposit escalation based on customer no-show history (500 / 750 / 1 000 RWF)
- Payment methods: MTN MoMo, Airtel Money, Card, Cash on Delivery
- Minimum order threshold: 1 000 RWF
- Delivery notes field on the pickup details step
- Promo code application with percentage discounts
- Save for Later — moves cart items to a persisted saved list
- Print receipt via browser print dialog on the success screen

### Branch Dashboard
- Separate login for branch managers and staff
- Manager: view all branch orders, assign to staff
- Staff: view assigned orders, update status (pending → preparing → ready)
- No-show customer flagging
- Per-branch inventory management

### Admin Panel
- Product management (add, edit, delete)
- Order overview across all branches
- Promo code management
- Staff account management
- Site settings

### Store Trust Pages
- `/about` — company overview, stats, how pickup works, branch map
- `/contact` — phone, WhatsApp, email, address, store hours, branch list
- `/faq` — accordion Q&A across five categories

### Usability
- Full trilingual UI (1 200+ translation keys)
- Dark mode
- Mobile-first responsive layout (320 px → 1920 px)
- Quick View modal on product cards
- Product sharing via Web Share API with clipboard fallback
- Password visibility toggle on all password fields
- Error boundary on major page sections

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Homepage
│   ├── about/                    # About page
│   ├── contact/                  # Contact page
│   ├── faq/                      # FAQ page
│   ├── products/                 # Product catalogue and detail pages
│   ├── checkout/                 # Standalone checkout page
│   ├── branch/                   # Branch dashboard
│   ├── admin/                    # Admin panel
│   └── api/                      # API route handlers
│       ├── auth/                 # Register, login, forgot/reset password, Google OAuth
│       ├── orders/               # Place and retrieve orders
│       ├── branch/               # Branch orders, staff, no-show flags
│       ├── inventory/            # Per-branch stock
│       ├── reviews/              # Branch reviews
│       ├── search/               # AI product search
│       ├── chat/                 # Pulse AI assistant
│       └── admin/                # Admin CRUD endpoints
├── components/                   # Shared UI components
├── lib/
│   ├── translations.ts           # 1 200+ keys, EN/FR/RW
│   ├── validation.ts             # Input validation utilities
│   ├── errors.ts                 # Error codes and messages
│   ├── api.ts                    # Typed API client
│   ├── branches.ts               # Branch data and deposit constants
│   ├── paymentMethods.ts         # Payment method config and labels
│   └── smartSearch.ts            # Local keyword search fallback
├── store/
│   └── useSimbaStore.ts          # Zustand global state
└── types/
    └── index.ts                  # Shared TypeScript types
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Authenticate, return JWT |
| GET | `/api/auth/me` | Return current user from token |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password` | Apply new password with token |
| GET | `/api/auth/google` | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | Google OAuth callback |
| POST | `/api/orders` | Place a pickup order |
| GET | `/api/orders` | List orders (filtered by userId) |
| POST | `/api/search` | AI natural language product search |
| POST | `/api/chat` | Pulse AI assistant conversation |
| GET | `/api/inventory/[branchId]` | Branch stock levels |
| PATCH | `/api/inventory/[branchId]/[productId]` | Update stock |
| POST | `/api/reviews` | Submit branch review |
| GET | `/api/reviews` | Aggregate branch ratings |
| GET | `/api/branch/orders` | Orders for the authenticated branch |
| PATCH | `/api/branch/orders/[id]/assign` | Assign order to staff |
| PATCH | `/api/branch/orders/[id]/status` | Update order status |
| POST | `/api/branch/flag` | Flag a customer no-show |

---

## Known Limitations

- MoMo and Airtel Money payments are simulated; no live payment gateway integration.
- Product names are stored in English; on-demand translation is handled by Groq when the API key is present.
- Password reset emails require `RESEND_API_KEY` to be configured. Without it, the reset link is displayed on screen.
- Branch inventory is initialised on first order at a given branch.
