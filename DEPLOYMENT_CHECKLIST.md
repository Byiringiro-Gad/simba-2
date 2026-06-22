# Simba 2.0 — Deployment Guide

## Environment Variables

### Vercel (Frontend)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_SITE_URL` | Frontend public URL |
| `JWT_SECRET` | Secret used to sign/verify JWT tokens |
| `ADMIN_USERNAME` | Admin portal username |
| `ADMIN_PASSWORD` | Admin portal password |
| `GROQ_API_KEY` | Groq API key for AI search and chat |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

> After updating any `NEXT_PUBLIC_*` variable, redeploy the Vercel project for the change to take effect.

### Render (Backend)

| Variable | Description |
|----------|-------------|
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_USER` | PostgreSQL user |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_NAME` | Database name |
| `DB_SSL` | Set to `true` for SSL connections |
| `JWT_SECRET` | Must match the frontend value |
| `ADMIN_USERNAME` | Admin portal username |
| `ADMIN_PASSWORD` | Admin portal password |
| `FRONTEND_URL` | Frontend URL without trailing slash |
| `PORT` | Server port (default: 4000) |

---

## Pre-Deployment Verification

- [ ] Homepage loads and hero section is visible
- [ ] Language switching works (EN → FR → RW)
- [ ] User registration and login complete successfully
- [ ] Products load and can be added to cart
- [ ] Checkout flow completes: branch selection → payment → order confirmation
- [ ] Branch dashboard accessible at `/branch/login`
- [ ] Orders appear in branch dashboard after placement
- [ ] Admin panel accessible at `/admin/login`
- [ ] AI search returns products for natural language queries
- [ ] Groq chat assistant responds via the Pulse widget

---

## Test Credentials

| Role | Username | Password | URL |
|------|----------|----------|-----|
| Admin | admin | *(set in env)* | `/admin/login` |
| Branch Manager (Remera) | manager_remera | manager123 | `/branch/login` |
| Branch Staff (Remera) | staff_remera | staff123 | `/branch/login` |
| Branch Manager (Kimironko) | manager_kimironko | manager123 | `/branch/login` |

---

## Promo Codes

| Code | Discount |
|------|----------|
| SIMBA10 | 10% off |
| WELCOME | 15% off |
| KIGALI5 | 5% off |

---

## Known Limitations

- Product names default to English when FR/RW is selected; Groq translates on demand if the API key is configured.
- Password reset emails require SMTP configuration on the backend. Without it, the reset link is displayed on screen as a fallback.
- Branch inventory is seeded from order history — the first order at a branch triggers the initial stock seed.
- The branch dashboard requires the backend to be running; it does not have a local fallback.

---

## Fallback Behaviour

**If the backend (Render) is unavailable:**
- Authentication via the frontend's own API routes continues to work.
- Orders are saved to the client Zustand store and displayed to the user even if the database write fails.
- The branch dashboard will not load.

**If `GROQ_API_KEY` is not set:**
- AI search falls back to keyword matching via `smartSearchProducts`.
- The Pulse chat assistant uses a local pattern-matching engine.
