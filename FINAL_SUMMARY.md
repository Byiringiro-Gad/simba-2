# Simba 2.0 — Release Summary

## Status

All core features are implemented and the application is deployed to production.

- **Frontend:** https://simba2gad.vercel.app  
- **Backend API:** https://simba-backend-lg22.onrender.com

---

## What's Included

### Checkout Readiness
- Minimum order threshold of 1 000 RWF enforced on both CartDrawer and `/checkout`
- Delivery notes textarea on the pickup details step (300-character limit)
- Rwandan phone number validation (network prefixes 72, 73, 78, 79)
- Clear cart confirmation dialog before removing all items
- Cash on Delivery payment option alongside MTN MoMo, Airtel Money, and Card

### AI Shopping
- Natural language product search at `POST /api/search` (Groq LLaMA 3.3 70B, keyword fallback)
- Pulse conversational assistant at `POST /api/chat` with floating widget on homepage
- Multi-turn context (up to 10 messages) and `[PRODUCTS:...]` tag resolution
- Responds in the same language as the user's query (EN / FR / RW)

### Store Trust
- `/about` — company story, key stats, how online pickup works, branch list with hours, map embed
- `/contact` — tappable phone and WhatsApp links, mailto, head office address with Maps link, store hours table
- `/faq` — accordion-based Q&A across five categories with a contact CTA at the bottom

### Product UX
- Quick View modal on every product card (always visible on mobile, hover on desktop)
- Product sharing via Web Share API, clipboard fallback with toast confirmation
- Save for Later — moves items from the active cart to a persisted saved list
- Framer Motion animations: fade-up on scroll, +1 float on add, spring cart drawer, step transitions

### Usability Polish
- Print Receipt button on the order success screen (CartDrawer and `/checkout`)
- Password visibility toggle on new-password and confirm-password fields in `/reset-password`
- Mobile-first layout: full-width drawer on small viewports, 2-column product grid on mobile
- Confirmation dialog before clearing the cart

### Technical
- Zero TypeScript compilation errors
- All secrets stored in environment variables; `.gitignore` covers `.env`, `.env.local`, `backend/.env`
- Groq API key and payment credentials never hardcoded in source
- ErrorBoundary wraps major page sections; `not-found.tsx` handles unknown routes

---

## Dependencies Added

No new npm packages were added. All features use existing dependencies: `framer-motion`, `zustand`, `lucide-react`, `next/image`, and the browser-native Web Share and Clipboard APIs.

---

## Test Credentials

| Role | Username | Password | Path |
|------|----------|----------|------|
| Admin | admin | *(see env)* | `/admin/login` |
| Branch Manager (Remera) | manager_remera | manager123 | `/branch/login` |
| Branch Staff (Remera) | staff_remera | staff123 | `/branch/login` |

Promo codes: `SIMBA10` (10%), `WELCOME` (15%), `KIGALI5` (5%)
