# Simba Supermarket 2.0 — Full E-commerce Platform

Rwanda's modern online supermarket. Built for the A2SV "Build Simba 2.0" contest.

## 🌐 Live Demo
- **Main site:** https://simba2gad.vercel.app
- **French version:** https://simba2gad.vercel.app/fr
- **Kinyarwanda version:** https://simba2gad.vercel.app/rw
- **All products (server-rendered):** https://simba2gad.vercel.app/products
- **Branch dashboard (auto-login):** https://simba2gad.vercel.app/branch/demo
- **Staff portal:** https://simba2gad.vercel.app/staff

## 🌍 Multi-Language Support (EN · FR · RW)

The app is **fully translated** in 3 languages. Use the language switcher in the top navbar, or visit the dedicated language URLs:

| Language | URL | Description |
|----------|-----|-------------|
| 🇬🇧 English | `/` | Default |
| 🇫🇷 Français | `/fr` | Full French UI |
| 🇷🇼 Kinyarwanda | `/rw` | Full Kinyarwanda UI |

**What's translated:**
- All navigation, buttons, labels
- Checkout flow (cart → branch → MoMo deposit → confirmation)
- Auth modal (login, register, forgot password)
- Product pages, reviews, categories
- Error messages, empty states
- AI search responses
- Footer, contact info, hours

## 🛒 Buyer Experience

### Pick-up Flow
1. Browse 700+ products across 11 categories
2. Add to cart
3. Select pickup branch (9 Kigali branches)
4. Choose pickup time (ASAP / Morning / Afternoon / Evening)
5. Pay 500 RWF deposit via MTN MoMo or Airtel Money
6. Order sent to branch instantly
7. Pick up in 20-45 minutes

### Branches (9 real Kigali locations)
- Simba Supermarket Remera
- Simba Supermarket Kimironko
- Simba Supermarket Kacyiru
- Simba Supermarket Nyamirambo
- Simba Supermarket Gikondo
- Simba Supermarket Kanombe
- Simba Supermarket Kinyinya
- Simba Supermarket Kibagabaga
- Simba Supermarket Nyanza

## 🔐 Auth
- Email/password login & register
- Google OAuth
- Forgot password (email reset link via Resend)
- Persist login across page refreshes

## 🤖 AI Conversational Search (Groq)
- Powered by Groq LLaMA 3.3 70B
- Natural language: "Do you have fresh milk?" → returns matching products
- Responds in the user's language (EN/FR/RW)
- Fallback keyword search if API unavailable

## 🏪 Branch Dashboard
- **Auto-login demo:** `/branch/demo` (logs in as manager_remera)
- Manager assigns orders to staff
- Staff marks orders ready
- Per-branch inventory management
- No-show customer flagging

## 👤 Staff Portal (`/staff`)
**Branch credentials (click to fill):**
- Manager: `manager_remera` / `manager123`
- Staff: `staff_remera` / `staff123`
- Replace "remera" with: kimironko, kacyiru, nyamirambo, gikondo, kanombe

**Admin credentials:**
- Username: `admin` / Password: `admin123`

## 💰 Promo Codes
- `SIMBA10` — 10% off
- `WELCOME` — 15% off
- `KIGALI5` — 5% off

## 🛠️ Tech Stack
- **Frontend:** Next.js 14, Tailwind CSS, Framer Motion, Zustand
- **Backend:** Next.js API routes, Neon PostgreSQL
- **AI:** Groq LLaMA 3.3 70B
- **Auth:** Custom JWT + Google OAuth
- **Email:** Resend API
- **Deployment:** Vercel

## 📦 Project Structure
```
src/
  app/           — Next.js pages (/, /fr, /rw, /products, /staff, /branch, /admin)
  components/    — UI components (Navbar, CartDrawer, AuthModal, etc.)
  store/         — Zustand state (cart, auth, language, orders)
  lib/           — Data, translations, API helpers
  types/         — TypeScript definitions
```

---
Built by Byiringiro Gad (AUCA) for A2SV Build Simba 2.0 Contest.
