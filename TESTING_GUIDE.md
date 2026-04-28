# Simba 2.0 - Quick Testing Guide

## 🧪 Critical User Flows to Test

### Flow 1: New User Registration & First Order (5 min)

**Steps:**
1. Open https://simba2gad.vercel.app
2. Click "Shop Now" or any "Start Shopping" button
3. Click your account icon → "Create Account"
4. Fill form:
   - Name: "Jean Pierre"
   - Email: "jean@example.com"
   - Phone: "+250 78X XXX XXX"
   - Password: "password123"
5. Click "Create Account"
6. See "Account created. Please sign in."
7. Auto-filled email, enter password, click "Sign In"
8. Should see "Welcome back, Jean Pierre!" toast
9. Navigate home, add 3 products to cart
10. Click cart → "Proceed to Checkout"
11. Select "Simba Supermarket Remera" branch
12. Select "ASAP" pickup time
13. See "500 RWF Deposit Required"
14. Mock MoMo payment screen appears
15. Click "Confirm Payment"
16. See "Order Confirmed!" screen with order ID
17. Order should appear in "Orders" tab

**Expected Result**: ✅ Order successfully placed and visible in order history

---

### Flow 2: AI Search Product Discovery (3 min)

**Steps:**
1. Go to home page
2. In Navbar search bar, type: "Do you have fresh milk?"
3. Wait 1-2 seconds for AI processing
4. Should see 5-8 milk-related products
5. Natural language message above results
6. Click on product → view details
7. Can add to cart from details page

**Expected Result**: ✅ AI search returns relevant products with natural language response

---

### Flow 3: Multi-Language Support (2 min)

**Steps:**
1. Open app on home page
2. Find language switcher (globe icon or top menu)
3. Click "Français" (French)
4. EVERY text should be in French:
   - Navbar items (Accueil, Recherche, etc.)
   - Product categories (Épicerie, Boulangerie, etc.)
   - Cart labels, buttons
   - Checkout steps
5. Switch to "Kinyarwanda"
6. Verify all UI translates to Rwandan
7. Switch back to "English"

**Expected Result**: ✅ Full UI translation works in all 3 languages

---

### Flow 4: Branch Operations (Manager & Staff) (5 min)

**Part A - Manager**:
1. Go to https://simba2gad.vercel.app/branch/login
2. Enter:
   - Username: `manager_remera`
   - Password: `manager123`
3. Click "Sign In"
4. See Branch Dashboard showing "Simba Supermarket Remera"
5. See list of pending orders
6. Click an order to expand
7. See "Assign to Staff" buttons
8. Click staff member name to assign
9. Order status should change to "preparing"
10. See "Mark Ready for Pickup" button appears

**Part B - Staff**:
1. Open new tab/window
2. Go to https://simba2gad.vercel.app/branch/login
3. Enter:
   - Username: `staff_remera`
   - Password: `staff123`
4. See only assigned orders (not all orders)
5. Expand an order
6. See "Mark Ready for Pickup" button
7. Click it
8. Order status changes to "ready"
9. Notification appears

**Expected Result**: ✅ Manager assigns, staff receives and completes orders

---

### Flow 5: Customer Review After Pickup (2 min)

**Steps:**
1. After completing order flow
2. Go to "Orders" tab
3. Click a completed order
4. See "Rate your experience" button/section
5. Click to open review form
6. Select 5-star rating (click stars)
7. Add comment: "Great service!"
8. Click "Submit"
9. See "Review submitted! Thank you." message
10. Review should appear in branch's review list

**Expected Result**: ✅ Reviews submit and display correctly

---

### Flow 6: Error Handling (2 min)

**Test Invalid Inputs**:

1. **Invalid Email**: 
   - Try to register with "notanemail"
   - See error: "Invalid email format"

2. **Weak Password**:
   - Try password "123"
   - See error: "Min. 6 characters"

3. **Mismatched Passwords**:
   - Register form, password and confirm don't match
   - See error: "Passwords do not match"

4. **Invalid Checkout**:
   - Try to checkout without selecting a branch
   - See validation error

5. **Network Error**:
   - Disable internet, try to place order
   - See "Network error" message with retry option

**Expected Result**: ✅ All errors show clear, helpful messages

---

### Flow 7: Dark Mode (1 min)

**Steps:**
1. Click sun/moon icon in navbar or menu
2. App switches to dark theme
3. All colors invert appropriately
4. Text remains readable
5. Toggle back to light mode

**Expected Result**: ✅ Dark mode works smoothly

---

## 🔍 Verification Checklist

### Frontend Features
- [ ] Landing page loads with animated hero
- [ ] Product grid shows 700+ products
- [ ] Categories sidebar works
- [ ] Search bar shows keyboard and AI search option
- [ ] AI search interprets natural language
- [ ] Cart opens/closes smoothly
- [ ] Checkout flow has 4 steps:
  1. Order Summary
  2. Branch Selection
  3. Payment Method (MoMo)
  4. Confirmation
- [ ] All forms have proper validation
- [ ] Error messages are clear and helpful
- [ ] Loading spinners appear during async operations
- [ ] Toast notifications work (top-right corner)
- [ ] Mobile navigation works (hamburger menu)

### Backend Endpoints
- [ ] `/auth/register` → Creates user, returns success/error
- [ ] `/auth/login` → Returns JWT token
- [ ] `/auth/me` → Requires token, returns user data
- [ ] `/orders` → Creates order, decreases inventory
- [ ] `/branch/login` → Returns staff token
- [ ] `/branch/orders` → Manager sees all, staff sees assigned
- [ ] `/inventory/{branchId}` → Returns stock levels
- [ ] `/reviews` → Submits and retrieves reviews

### Database
- [ ] Users table has all registrations
- [ ] Orders table has all orders placed
- [ ] Order items properly normalized
- [ ] Branch inventory tracks per-branch stock
- [ ] Reviews linked to orders correctly
- [ ] Branch staff seeded with demo accounts

### Responsive Design
- [ ] Mobile (375px): all elements visible, scrollable
- [ ] Tablet (768px): layout optimized
- [ ] Desktop (1920px): full-width, centered content

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Auth token not persisting | Check browser localStorage, clear cache |
| Search not working | Verify GROQ_API_KEY in .env, check browser console |
| Branch orders not loading | Verify backend is running on correct port |
| Promo code not applying | Use one of: SIMBA10, WELCOME, KIGALI5 |
| Translations missing | Check language setting, refresh page |
| Images not loading | Verify image URLs are accessible |
| Mobile view broken | Check viewport meta tag in layout |

---

## 📊 Load Testing

**Quick Performance Check**:

1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Check:
   - Initial load: < 3 seconds
   - Product images: lazy-loaded
   - API calls: < 1 second response time
5. Go to Performance tab
6. Record 10 seconds of interaction
7. Check:
   - No janky animations (60 FPS)
   - Smooth scrolling
   - Fast interactions (< 100ms)

---

## ✅ Sign-Off Checklist

Before demo day, ensure:

- [ ] All 7 flows complete successfully
- [ ] No console errors (F12 → Console)
- [ ] No network errors in DevTools
- [ ] All 3 languages display correctly
- [ ] Mobile and desktop both work
- [ ] Dark mode toggled on/off
- [ ] Account login persists on refresh
- [ ] Orders visible in order history
- [ ] Reviews submit without errors
- [ ] Branch dashboard loads quickly

---

## 🎯 Demo Script (3 minutes)

```
1. "Welcome to Simba Supermarket 2.0 - Rwanda's #1 Supermarket"
   
2. "Hero section: 700+ products, 9 branches in Kigali, pickup in 20-45 min"
   
3. "Let me create an account" (Registration)
   - "Seamless email/password signup"
   
4. "Now let's search for products using natural language" (AI Search)
   - "Do you have fresh milk?"
   - "Results appear instantly with AI understanding"
   
5. "Add 3 items to cart, select Remera branch, pay 500 RWF deposit"
   (Checkout Flow)
   
6. "Order placed! Now the manager assigns it to staff" (Branch Dashboard)
   - Switch to manager_remera login
   - Assign order to staff
   
7. "Staff member sees assigned order, marks it ready" (Staff Dashboard)
   - Switch to staff_remera
   - Mark order ready
   
8. "Customer rates the pickup experience" (Reviews)
   - 5 stars + comment
   - Review appears on branch page
   
9. "Multi-language support - Kinyarwanda" (Language)
   - Switch UI to RW
   
10. "Mobile responsive design" (Show phone view)
```

---

**Testing Duration**: ~20 minutes
**Difficulty**: Easy (just click through)
**Success Rate Target**: 100% (all flows complete)
