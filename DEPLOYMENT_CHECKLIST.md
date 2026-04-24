# Simba 2.0 — Deployment Checklist

## Before Demo Day — Verify All of These

### 1. Vercel Environment Variables
Go to: vercel.com → simba2gad → Settings → Environment Variables

| Variable | Value | Status |
|----------|-------|--------|
| `NEXT_PUBLIC_API_URL` | `https://simba-backend-lg22.onrender.com` | Required |
| `NEXT_PUBLIC_SITE_URL` | `https://simba2gad.vercel.app` | Required |
| `JWT_SECRET` | `185320@Jules` | Required |
| `ADMIN_USERNAME` | `admin` | Required |
| `ADMIN_PASSWORD` | `admin123` | Required |
| `GROQ_API_KEY` | (from console.groq.com) | For AI search |
| `GOOGLE_CLIENT_ID` | (from Google Console) | For Google OAuth |
| `GOOGLE_CLIENT_SECRET` | (from Google Console) | For Google OAuth |

**After setting any variable → Redeploy Vercel (mandatory for NEXT_PUBLIC_* vars)**

### 2. Render Environment Variables
Go to: render.com → simba-backend-lg22 → Environment

| Variable | Value |
|----------|-------|
| `DB_HOST` | `shinkansen.proxy.rlwy.net` |
| `DB_PORT` | `28715` |
| `DB_USER` | `root` |
| `DB_PASSWORD` | `nqkbvGlLCaYAiIkgAUUDgWXuuPNlKDKs` |
| `DB_NAME` | `railway` |
| `DB_SSL` | `true` |
| `JWT_SECRET` | `185320@Jules` |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | `admin123` |
| `FRONTEND_URL` | `https://simba2gad.vercel.app` ← NO trailing slash |
| `PORT` | `4000` |

### 3. Pre-Demo Verification (30 min before)

Run through this checklist on the live site:

- [ ] Visit https://simba2gad.vercel.app — hero loads, value props visible
- [ ] Switch language to Kinyarwanda — UI translates
- [ ] Register new account — success message
- [ ] Login with that account — redirects, name shows in navbar
- [ ] Add 3 products to cart
- [ ] Click checkout — auth modal appears if not logged in
- [ ] Complete checkout: select Remera branch → ASAP → MTN MoMo → 780000000 → Pay
- [ ] Order success screen shows with review prompt
- [ ] Go to /branch/login → manager_remera / manager123 → order appears
- [ ] Assign order to staff
- [ ] Login as staff_remera / staff123 → order appears → mark ready
- [ ] Go to /admin/login → admin / admin123 → order appears in all orders
- [ ] AI search: type "Do you have fresh milk?" → products appear
- [ ] Switch to French → AI search in French works

### 4. Demo Credentials

| Role | Username | Password | URL |
|------|----------|----------|-----|
| Admin (HQ) | admin | admin123 | /admin/login |
| Branch Manager (Remera) | manager_remera | manager123 | /branch/login |
| Branch Staff (Remera) | staff_remera | staff123 | /branch/login |
| Branch Manager (Kimironko) | manager_kimironko | manager123 | /branch/login |

### 5. Known Limitations

- Product names show in English when FR/RW selected (Groq translates on-demand if API key set)
- Password reset email requires SMTP config on Render (reset link shows on screen as fallback)
- Branch inventory seeds from order history — first order at a branch triggers seeding

### 6. Emergency Fallbacks

If Render is down:
- Auth still works via Vercel's own routes (fallback to JWT from Google data)
- Orders still confirm (saved to client state even if DB unavailable)
- Branch dashboard won't work (depends entirely on Render)

If Groq API key missing:
- AI search falls back to keyword search
- Product names stay in English
- Simba Pulse chat uses local pattern engine
