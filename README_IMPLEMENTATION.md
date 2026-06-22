# Simba 2.0 — Technical Reference

This document supplements the main `README.md` with developer-focused detail on architecture, data flow, and local setup.

---

## Local Development

### Prerequisites

- Node.js 18+
- A PostgreSQL-compatible database (Neon recommended)
- A Groq API key for AI features (optional — falls back to keyword search)

### Frontend

```bash
# Install dependencies
npm install

# Copy environment template and fill in values
cp .env.example .env.local

# Start development server
npm run dev
# http://localhost:3000
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with database credentials
npm run dev
# http://localhost:4000
```

### Required Environment Variables

**Frontend (`.env.local`)**

```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
JWT_SECRET=<your-secret>
GROQ_API_KEY=<optional>
GOOGLE_CLIENT_ID=<optional>
GOOGLE_CLIENT_SECRET=<optional>
```

**Backend (`.env`)**

```
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_SSL=true
JWT_SECRET=<same-value-as-frontend>
FRONTEND_URL=http://localhost:3000
PORT=4000
RESEND_API_KEY=<optional>
```

---

## Architecture

```
Browser
  │
  ├─ Next.js App Router (src/app/)
  │    ├─ Page components — SSR/SSG
  │    ├─ API Route Handlers — run on the Edge / Node.js runtime
  │    └─ Client components — hydrated after initial render
  │
  ├─ Zustand Store (src/store/useSimbaStore.ts)
  │    └─ Persisted to localStorage via zustand/middleware persist
  │
  └─ External APIs
       ├─ Groq — AI search and chat
       ├─ Resend — transactional email
       └─ Google OAuth — social sign-in
```

The Express backend (`backend/`) is a separate Node.js process that handles heavier database operations and is deployed independently on Render. The Next.js API routes handle auth, orders, search, chat, and inventory directly via `@/lib/db.ts` (mysql2 pool against Neon).

---

## State Management

All client-side state lives in a single Zustand store (`useSimbaStore`). The store is persisted under the key `simba-store-v2`.

Key state slices:

| Slice | Description |
|-------|-------------|
| `cart` | Active cart items |
| `savedItems` | Items moved out of the active cart |
| `orders` | Order history (also fetched from API) |
| `user` / `authToken` | Authenticated user and JWT |
| `pickupBranchId` | Currently selected branch |
| `branchInventory` | Per-product stock for the selected branch |
| `language` | Active locale (`en` / `fr` / `rw`) |
| `isDarkMode` | Theme preference |

---

## Validation

Input validation utilities are in `src/lib/validation.ts`:

- `validateEmail` — RFC-compatible email format check
- `validatePassword` — minimum 6 characters
- `validatePhone` — Rwandan mobile format (`07[2389]XXXXXXX` and variants)
- `validateName` — letters, spaces, hyphens, apostrophes
- `validateAddress` — minimum 5 characters
- `validateRating` — integer 1–5
- `validateQuantity` — positive integer
- `validatePromoCode` — alphanumeric, 3–20 characters
- `sanitizeText` — HTML entity escaping

Server-side route handlers call these utilities and return `{ ok: false, error: string }` with HTTP 400 on validation failure.

---

## AI Features

### Product Search (`/api/search`)

Accepts `{ query: string, language: 'en' | 'fr' | 'rw' }`. Sends the query plus a trimmed product catalogue (name, category, price) to Groq and returns `{ message, products, usedAI }`. Falls back to `smartSearchProducts` in `src/lib/smartSearch.ts` if the API key is absent or the request fails.

### Pulse Chat Assistant (`/api/chat`)

Accepts `{ messages: ChatMessage[], language: string }`. Maintains up to the last 10 messages for multi-turn context. When Pulse's reply contains a `[PRODUCTS:term1,term2]` tag, the endpoint resolves matching in-stock products and returns their IDs in `productIds`. Returns `{ message: '__NO_API_KEY__' }` when the key is not configured so the UI can display a graceful fallback.

---

## Database Schema

Tables created automatically via `ensureOrderSchema` / `ensureSchema` functions in the API routes:

| Table | Description |
|-------|-------------|
| `users` | Customer and staff accounts |
| `orders` | Pickup orders with status |
| `order_items` | Line items per order |
| `branch_inventory` | Per-branch stock counts |
| `branch_reviews` | Customer ratings and comments |
| `customer_flags` | No-show flags per customer/branch |
| `promo_codes` | Discount codes |
| `staff` | Branch staff accounts with roles |
| `password_reset_tokens` | One-time tokens for password reset |

---

## Translations

All user-visible strings are looked up via `translations[language]` from `src/lib/translations.ts`. The file contains 1 200+ keys across three locales. Hard-coded strings in components are a lint error (`no-hardcoded-strings` rule, enforced in code review).

---

## Deployment

See `DEPLOYMENT_CHECKLIST.md` for environment variable configuration and pre-launch verification steps.
