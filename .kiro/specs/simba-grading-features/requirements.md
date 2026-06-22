# Requirements Document

## Introduction

This document captures all requirements for the Simba Supermarket 2.0 grading feature set. Simba is a Next.js 14 / Tailwind CSS e-commerce platform for a Rwandan supermarket chain with 9 Kigali branches. Customers browse 700+ products, build a cart, and place a pick-up order secured by a 500 RWF deposit paid via MTN MoMo, Airtel Money, or card. The platform is fully multilingual (English · Français · Kinyarwanda) and backed by a Node.js/Express + Neon PostgreSQL API.



---

## Glossary

- **Checkout_Flow**: The multi-step process (Cart → Pickup Details → Payment → Success) through which a customer confirms and pays for an order.
- **CartDrawer**: The slide-in panel component that hosts the full Checkout_Flow on all pages.
- **Checkout_Page**: The dedicated `/checkout` route that mirrors the Checkout_Flow for full-page access.
- **CoD**: Cash on Delivery — a payment method where the customer pays the full order amount in cash at branch pick-up, requiring no online deposit.
- **Deposit**: The 500 RWF (or escalated 750 / 1 000 RWF) amount charged online to confirm an order.
- **MoMo**: MTN Mobile Money or Airtel Money — the two mobile payment providers used for the online deposit.
- **Order_Minimum**: The minimum basket subtotal (in RWF) required before checkout can proceed.
- **Delivery_Notes**: A free-text field on the Pickup Details step where the customer records special instructions for branch staff.
- **Phone_Validator**: The client-side and server-side routine that checks Rwandan mobile numbers (format: `+250 7XX XXX XXX`, 9 digits after `+250`).
- **AI_Search**: The Groq LLaMA 3.3 70B–powered endpoint (`/api/search`) that maps natural language queries to matching products.
- **AI_Assistant**: The Groq LLaMA 3.3 70B–powered chat endpoint (`/api/chat`) embodied as "Pulse", Simba's conversational service assistant.
- **Quick_View**: A modal overlay that displays a product's image, price, description, and add-to-cart controls without leaving the current page.
- **Share**: The native Web Share API or clipboard fallback for sharing a product URL.
- **Save_For_Later**: Persisting a cart item outside the active cart so the customer can restore it later.
- **Receipt**: A printer-friendly order confirmation page or printable section containing all order details.
- **Password_Toggle**: The eye-icon button that switches a password input between masked and plain-text display.
- **Branch_Hours**: Opening and closing times for each of the 9 Simba branches, displayed on the About and Contact pages.
- **About_Page**: The `/about` route containing company story, key stats, branch list with hours, and a contact CTA.
- **FAQ_Page**: The `/faq` route containing categorised accordion Q&A covering ordering, pickup, payment, accounts, and technical topics.
- **Contact_Page**: The `/contact` route containing phone, WhatsApp, email, head-office address, store hours, and a branch list.
- **Env_Vars**: Environment variables (e.g., `GROQ_API_KEY`, `DATABASE_URL`, `NEXT_PUBLIC_API_URL`) that must never appear in client-side bundles or public repositories.
- **LCP**: Largest Contentful Paint — a Core Web Vitals metric measuring perceived load speed.
- **Simba_Platform**: The combined Next.js frontend and Node.js/Express backend constituting the full application.

---

## Requirements

### Requirement 1: Minimum Order Threshold

**User Story:** As a customer, I want to be prevented from checking out with a basket below a minimum value, so that branch preparation time is not wasted on trivially small orders.

#### Acceptance Criteria

1. THE Checkout_Flow SHALL enforce a configurable minimum order subtotal of 1 000 RWF before permitting the customer to advance from the Cart step.
2. WHEN the cart subtotal is below the minimum, THE CartDrawer SHALL display an inline warning banner showing the current subtotal, the minimum required, and the shortfall amount, in the active language (EN / FR / RW).
3. WHEN the cart subtotal is below the minimum, THE CartDrawer SHALL disable the "Continue" button and render it in a visually distinct disabled state.
4. WHEN the customer adds items that bring the subtotal to or above the minimum, THE CartDrawer SHALL re-enable the "Continue" button and remove the warning banner without a page reload.
5. THE Checkout_Page SHALL enforce the same 1 000 RWF minimum and display the same warning copy as the CartDrawer.
6. IF a customer attempts to submit a checkout API request with a subtotal below the minimum, THEN THE orders API route SHALL reject the request with HTTP 400 and a structured JSON error body.

---

### Requirement 2: Delivery Notes Field

**User Story:** As a customer, I want to add a special instruction or delivery note at checkout, so that I can communicate specific needs (e.g., fragile items, preferred packaging) to branch staff.

#### Acceptance Criteria

1. THE Checkout_Flow SHALL render a "Delivery Notes" text area on the Pickup Details step, below the pickup-time selector.
2. THE Delivery_Notes field SHALL accept free-form text up to 300 characters and display a live character counter.
3. WHEN the customer submits the order, THE Checkout_Flow SHALL include the delivery notes text in the order payload sent to the orders API.
4. THE orders API route SHALL persist delivery notes alongside the order record in the database.
5. THE Branch Dashboard SHALL display the delivery notes for each order in the order detail view so branch staff can act on them.
6. WHERE delivery notes are empty, THE Checkout_Flow SHALL omit the field from the order payload and the Branch Dashboard SHALL show "No notes" in its place.

---

### Requirement 3: Rwandan Phone Number Validation

**User Story:** As a customer, I want clear, real-time feedback when I enter my phone number, so that I know immediately if the format is correct for Rwandan mobile numbers.

#### Acceptance Criteria

1. THE Phone_Validator SHALL accept numbers in the following canonical Rwandan formats: `07XXXXXXXX`, `7XXXXXXXX`, `+2507XXXXXXXX`, and `2507XXXXXXXX`, where the 7th digit (network prefix) must be 2, 3, 8, or 9.
2. WHEN the customer finishes typing a phone number on the Payment step, THE CartDrawer SHALL display a green check-mark indicator if the number is valid.
3. IF the customer enters a phone number that fails validation, THEN THE CartDrawer SHALL display an inline error message in the active language (EN / FR / RW) identifying the expected format.
4. THE "Place Order" button on the Payment step SHALL remain disabled until a valid Rwandan phone number has been entered, except when the payment method is CoD.
5. THE Phone_Validator SHALL apply the same rules in the registration form (AuthModal) for the optional phone field.
6. THE orders API route SHALL re-validate the phone number server-side and return HTTP 400 with a structured error if the format is invalid.

---

### Requirement 4: Clear Cart / Empty State

**User Story:** As a customer, I want an informative and actionable empty-cart state, so that I am guided back to shopping instead of seeing a blank panel.

#### Acceptance Criteria

1. WHEN the cart contains zero items, THE CartDrawer SHALL render an empty-state illustration, a headline in the active language, a sub-message, and a prominent "Shop Now" CTA button.
2. WHEN the customer clicks "Shop Now" from the empty-cart state, THE CartDrawer SHALL close and navigate the customer to the product catalog.
3. WHEN the customer clicks the "Clear Cart" button, THE CartDrawer SHALL request confirmation via an inline confirmation prompt before removing all items.
4. WHEN the cart has been cleared and the CartDrawer is still open, THE CartDrawer SHALL immediately transition to the empty-cart state.
5. THE Checkout_Page SHALL render the same empty-state content and "Shop Now" link when accessed directly with an empty cart.
6. WHILE the cart is empty, THE CartDrawer header SHALL NOT display an item-count badge.

---

### Requirement 5: Cash on Delivery (CoD) Checkout

**User Story:** As a customer who prefers not to pay online, I want a Cash on Delivery payment option, so that I can reserve my order and pay the full amount in cash at the branch.

#### Acceptance Criteria

1. THE Checkout_Flow SHALL present "Cash on Delivery" as a selectable payment method on the Payment step, alongside MTN MoMo, Airtel Money, and Card.
2. WHEN the customer selects CoD, THE Checkout_Flow SHALL set the deposit amount to 0 RWF and display a note explaining that the full order total is due at pickup in cash.
3. WHEN the customer selects CoD, THE Checkout_Flow SHALL hide the phone-number input field, since no mobile payment is required.
4. WHEN the customer places a CoD order, THE Checkout_Flow SHALL submit the order with `paymentMethod: "cod"` and `depositAmount: 0` to the orders API.
5. THE orders API route SHALL accept `paymentMethod: "cod"` and store it in the order record without requiring a phone number.
6. THE Branch Dashboard SHALL display "Cash on Delivery" prominently on any order where `paymentMethod` is `cod`, so staff know to collect payment at the counter.
7. THE order success screen SHALL display the appropriate confirmation message for CoD orders, reminding the customer to bring the exact cash amount.

---

### Requirement 6: AI Natural Language Product Search

**User Story:** As a customer, I want to describe what I am looking for in natural language, so that I can find relevant products without knowing their exact catalogue names.

#### Acceptance Criteria

1. THE AI_Search endpoint (`POST /api/search`) SHALL accept a `query` string and a `language` field (`en` | `fr` | `rw`) and return a JSON payload containing a `message` string and a `products` array.
2. WHEN a valid Groq API key is present, THE AI_Search endpoint SHALL send the query plus a trimmed product catalogue to the Groq LLaMA 3.3 70B model and return AI-matched products.
3. IF the Groq API key is absent or the upstream call fails, THEN THE AI_Search endpoint SHALL fall back to the local `smartSearchProducts` function and return results with `usedAI: false`.
4. THE SearchTab component SHALL render AI search results as a horizontally scrollable product strip with product image, name, price, and an "Add to Cart" button for each result.
5. THE AI_Search endpoint SHALL respond in the same language as the `language` parameter supplied by the client.
6. WHEN the AI_Search endpoint returns zero products, THE SearchTab SHALL display the AI's `message` text and a suggestion to try a different query, rather than a blank area.
7. THE AI_Search endpoint SHALL limit product results to a maximum of 8 items per response.
8. WHEN the customer clears the AI search query, THE SearchTab SHALL reset the AI results panel and display the full product catalogue.

---

### Requirement 7: AI Service Assistant (Pulse)

**User Story:** As a customer, I want to chat with a conversational assistant that knows the store's products and policies, so that I can get instant answers to questions about ordering, branches, and promotions.

#### Acceptance Criteria

1. THE AI_Assistant endpoint (`POST /api/chat`) SHALL accept a `messages` array and a `language` field and return a `message` string reply from Pulse.
2. WHEN Pulse's response contains a `[PRODUCTS:term1,term2]` tag, THE AI_Assistant endpoint SHALL resolve matching in-stock products from the catalogue and return their IDs in a `productIds` array.
3. THE AI_Assistant endpoint SHALL instruct Pulse to respond in the same language as the most recent user message (EN / FR / RW).
4. IF the Groq API key is absent, THEN THE AI_Assistant endpoint SHALL return `{ message: "__NO_API_KEY__" }` so the UI can display a graceful fallback message.
5. THE chat UI component SHALL render Pulse's text reply alongside any matched product cards (image, name, price, add-to-cart), in a chat-bubble layout.
6. THE chat UI SHALL include a visible entry point (button or floating widget) accessible from the main store homepage without navigating away.
7. WHEN the customer sends a message, THE chat UI SHALL show a typing indicator while the AI_Assistant is processing.
8. THE AI_Assistant endpoint SHALL retain up to the last 10 messages of conversation context when calling the Groq API, to enable multi-turn conversations.

---

### Requirement 8: Branch Locations and Operating Hours

**User Story:** As a customer, I want to see all branch locations and their opening hours in one place, so that I can choose a convenient pickup branch and plan my visit.

#### Acceptance Criteria

1. THE About_Page SHALL list all 9 Simba branches with their neighbourhood name, full address area, and operating hours.
2. THE Contact_Page SHALL list all 9 branches with their neighbourhood name and a Google Maps link for each.
3. THE About_Page SHALL display store hours for the standard schedule (Mon–Sat 08:00–21:00, Sun 09:00–18:00) and the Nyanza branch exception (08:00–20:00 daily) in a clearly labelled section.
4. WHEN a customer clicks a branch listing on the About_Page, THE About_Page SHALL open the Google Maps directions link for that branch in a new tab.
5. THE PickupBranchModal SHALL display each branch's operating hours alongside its name and area, so the customer can select a branch that is currently open.
6. IF it is outside a branch's operating hours at the time of checkout, THEN THE PickupBranchModal SHALL visually indicate that the branch is currently closed, while still allowing the customer to select it for a future pickup slot.

---

### Requirement 9: About Simba Page

**User Story:** As a prospective customer, I want a well-structured About page, so that I can understand who Simba is, what they offer, and how the online service works.

#### Acceptance Criteria

1. THE About_Page SHALL contain a hero section with the Simba logo, a one-sentence tagline, and a brief company description.
2. THE About_Page SHALL display key statistics: product count (700+), branch count (9), employee range (250–499), and average pickup time (20–45 min) in a stat-grid component.
3. THE About_Page SHALL include a "How Online Pickup Works" section with four numbered steps: Browse & Add → Choose Branch → Pay Deposit → Collect.
4. THE About_Page SHALL include a section showing a map embed and/or video embed contextualising Simba's presence in Kigali.
5. THE About_Page SHALL end with a Contact CTA section containing phone, email, and WhatsApp links.
6. THE About_Page SHALL be reachable via a footer link labelled "About Us" from every page on the platform.

---

### Requirement 10: Contact Information Page

**User Story:** As a customer with a query or complaint, I want a dedicated contact page with multiple communication channels, so that I can reach Simba's team using the method most convenient for me.

#### Acceptance Criteria

1. THE Contact_Page SHALL display the primary phone number (+250 788 386 386) as a tappable `tel:` link.
2. THE Contact_Page SHALL display a WhatsApp link (`wa.me/250788386386`) that opens in a new tab.
3. THE Contact_Page SHALL display the support email address (info@simbaonlineshopping.com) as a `mailto:` link.
4. THE Contact_Page SHALL display the head office address (Simba Centenary, KN 4 Ave, Kigali) with a Google Maps link.
5. THE Contact_Page SHALL display store opening hours in a structured table differentiating weekday, Saturday, Sunday, and the Nyanza exception.
6. THE Contact_Page SHALL be reachable via a footer link labelled "Contact" from every page on the platform.

---

### Requirement 11: FAQ Coverage

**User Story:** As a customer, I want a comprehensive FAQ covering ordering, payment, pickup, accounts, and technical topics, so that I can resolve common questions without contacting support.

#### Acceptance Criteria

1. THE FAQ_Page SHALL contain at minimum five categories: Ordering, Pickup & Branches, Payment & Deposit, Account & Loyalty, and Technical.
2. THE FAQ_Page SHALL implement each Q&A as an accessible `<details>`/`<summary>` accordion, with one item open at a time per category.
3. THE FAQ_Page SHALL cover the following topics: how to place an order, delivery vs. pick-up, order modification, branch availability, pickup timing, deposit purpose, refund policy, promo codes, loyalty points, language options, and customer support contact.
4. WHEN a customer opens an accordion item, THE FAQ_Page SHALL smoothly expand the answer without a page reload or scroll jump.
5. THE FAQ_Page SHALL include a "Still have questions?" CTA at the bottom with phone, email, and WhatsApp buttons.
6. THE FAQ_Page SHALL be reachable via a footer link labelled "FAQ" from every page on the platform.

---

### Requirement 12: Product Quick View

**User Story:** As a customer browsing the product grid, I want to preview a product's details in a modal overlay, so that I can decide whether to add it to my cart without leaving the current page.

#### Acceptance Criteria

1. THE ProductCard SHALL display a "Quick View" trigger (button or overlay icon) that becomes visible on hover (desktop) and is always visible on mobile.
2. WHEN the customer activates "Quick View", THE Simba_Platform SHALL display a modal overlay containing the product image (full-size), product name, price, category, unit, stock status, star rating, review count, and an "Add to Cart" button.
3. WHEN the customer clicks "Add to Cart" in the Quick_View modal, THE Quick_View SHALL add the product to the cart, update the cart badge count, and show a brief success animation without closing the modal.
4. WHEN the customer closes the Quick_View modal (via Escape key or close button), THE Simba_Platform SHALL return focus to the ProductCard that triggered it.
5. THE Quick_View modal SHALL be accessible: it SHALL trap focus within the modal while open, use `role="dialog"` and `aria-modal="true"`, and have a visible close button.
6. WHERE a product is out of stock, THE Quick_View modal SHALL show the out-of-stock badge and disable the "Add to Cart" button while showing a "Notify Me" form.

---

### Requirement 13: Product Sharing

**User Story:** As a customer, I want to share a product page link with friends or family, so that I can recommend products or build a shopping list collaboratively.

#### Acceptance Criteria

1. THE ProductCard SHALL render a Share button (icon) visible on hover (desktop) or in the action row (mobile).
2. WHEN the customer clicks Share and the browser supports the Web Share API, THE Simba_Platform SHALL invoke `navigator.share()` with the product name as title and the canonical product URL as url.
3. IF the browser does not support the Web Share API, THEN THE Simba_Platform SHALL copy the product URL to the clipboard and display a brief toast notification confirming the copy.
4. THE product detail page (`/products/[id]`) SHALL render Open Graph meta tags (`og:title`, `og:description`, `og:image`) populated with the product's name, category, and image URL so that shared links display rich previews on social platforms.
5. THE Share button SHALL be present on both the ProductCard and the product detail page.

---

### Requirement 14: Save for Later

**User Story:** As a customer, I want to save a cart item for later without losing it, so that I can keep track of products I intend to buy on a future visit.

#### Acceptance Criteria

1. THE CartDrawer SHALL display a "Save for Later" action for each cart item, rendered as a labelled icon button.
2. WHEN the customer activates "Save for Later" on a cart item, THE Simba_Platform SHALL move that item from the active cart to a persisted "Saved Items" list in Zustand state (with `persist` middleware).
3. THE CartDrawer SHALL render a "Saved Items" collapsible section below the active cart items, listing all saved products with their image, name, price, and a "Move to Cart" button.
4. WHEN the customer clicks "Move to Cart" for a saved item, THE Simba_Platform SHALL move the item back to the active cart at quantity 1 and remove it from the saved list.
5. THE saved items list SHALL persist across page reloads and browser sessions using Zustand's persist middleware.
6. THE CartDrawer header item-count badge SHALL count only active cart items, excluding saved items.

---

### Requirement 15: Smooth Catalog and Cart Experience

**User Story:** As a customer, I want fluid animations and transitions throughout the catalog and cart, so that the platform feels polished and responsive.

#### Acceptance Criteria

1. THE ProductCard SHALL animate into view using Framer Motion's `whileInView` with a fade-up effect when it enters the viewport.
2. WHEN the customer adds a product to the cart, THE ProductCard SHALL display a floating "+1" animation originating from the add button.
3. WHEN the cart item count changes, THE cart-badge in the Navbar SHALL animate the count update with a brief scale-pop transition.
4. THE CartDrawer SHALL animate open and closed using a spring slide transition (`x: 100%` → `x: 0`) with a backdrop fade.
5. WHEN the customer advances between checkout steps, THE CartDrawer SHALL animate the step transition using Framer Motion's `AnimatePresence` with a directional slide.
6. WHEN the product grid is loading or filtering, THE Simba_Platform SHALL render ProductSkeleton placeholder cards rather than a blank area, maintaining layout stability.

---

### Requirement 16: Printable Receipt

**User Story:** As a customer who has placed an order, I want to print or save a receipt of my order, so that I have a physical or PDF record for my own records or to show at the branch.

#### Acceptance Criteria

1. THE order success screen (both CartDrawer success step and Checkout_Page success view) SHALL include a "Print Receipt" button.
2. WHEN the customer clicks "Print Receipt", THE Simba_Platform SHALL open the browser's print dialog pre-scoped to a receipt layout containing: Simba logo, order ID, order date and time, list of items with quantities and prices, subtotal, discount (if any), deposit paid, total due at pickup, selected branch name, and pickup slot.
3. THE receipt print layout SHALL use a `@media print` CSS stylesheet that hides navigation, banners, and action buttons while preserving only the receipt content.
4. THE receipt SHALL be formatted to fit A4 paper in portrait orientation without horizontal overflow.
5. WHERE the customer has not yet placed an order, THE "Print Receipt" button SHALL NOT be displayed.

---

### Requirement 17: Password Visibility Toggle

**User Story:** As a customer filling in a password field, I want to toggle the visibility of my password, so that I can verify what I typed without submitting incorrect credentials.

#### Acceptance Criteria

1. THE AuthModal SHALL render an eye-icon toggle button inside every password input field (password and confirm-password on register; password on login).
2. WHEN the customer clicks the toggle, THE AuthModal SHALL switch the input's `type` attribute between `password` and `text`, immediately showing or hiding the characters.
3. THE toggle icon SHALL change from "eye" (hidden state) to "eye-off" (visible state) to clearly communicate the current visibility state.
4. THE Checkout_Page and CartDrawer SHALL NOT show password fields (not applicable), but any future forms adding password inputs SHALL apply the same toggle pattern.
5. THE reset-password page SHALL include a visibility toggle on its new-password and confirm-password inputs.

---

### Requirement 18: Mobile-First Responsive Polish

**User Story:** As a customer on a mobile device, I want all pages and interactions to be fully usable on small screens, so that I can shop comfortably without pinching, zooming, or encountering broken layouts.

#### Acceptance Criteria

1. THE Simba_Platform SHALL render all pages without horizontal scroll on viewport widths from 320 px to 428 px.
2. THE CartDrawer SHALL occupy the full viewport width on screens narrower than 640 px and at most 420 px on wider screens.
3. THE bottom navigation bar (BottomNav) SHALL be visible and sticky on mobile viewports and hidden on desktop (≥ 768 px) viewports.
4. THE product grid SHALL display 2 columns on mobile (< 640 px) and scale to 3, 4, or 5 columns on progressively wider breakpoints.
5. THE checkout step-progress indicator SHALL collapse to icon-only (no label text) on screens narrower than 400 px.
6. ALL tap targets (buttons, links, form controls) SHALL have a minimum touch-target size of 44 × 44 CSS pixels.
7. WHEN the on-screen keyboard appears on mobile during form input, THE CartDrawer and Checkout_Page SHALL NOT obscure the active input field with fixed UI elements.

---

### Requirement 19: No Broken States

**User Story:** As a customer or branch staff member, I want every UI state to display meaningful content, so that I never encounter blank screens, spinner loops, or raw error messages.

#### Acceptance Criteria

1. WHEN an API request fails, THE Simba_Platform SHALL display a user-friendly error toast or inline message in the active language rather than a raw HTTP status or stack trace.
2. THE ErrorBoundary component SHALL wrap all major page sections and render a fallback UI with a "Try Again" button if a React render error occurs.
3. WHEN product images fail to load, THE ProductCard SHALL display a branded placeholder image of the same dimensions.
4. WHEN the AI_Search or AI_Assistant endpoint is unavailable, THE SearchTab and chat UI SHALL fall back gracefully to local search results or a canned "I'm unavailable right now" message without throwing.
5. WHEN a user navigates to a non-existent route, THE `not-found.tsx` page SHALL render with navigation back to the homepage.
6. THE branch dashboard SHALL display a "No orders" empty state with a refresh button when there are no pending orders, rather than a blank list.
7. WHILE any data fetch is in progress, THE Simba_Platform SHALL show a loading skeleton or spinner to prevent content-flash or layout shift.

---

### Requirement 20: Public Deployment

**User Story:** As a grader, I want to access the live Simba platform at a public URL, so that I can evaluate the application without running it locally.

#### Acceptance Criteria

1. THE Simba_Platform SHALL be deployed to a publicly accessible URL (e.g., Vercel) with HTTPS enforced.
2. THE deployed application SHALL serve the homepage (`/`) with a 200 HTTP response within 10 seconds from a cold start.
3. THE backend API SHALL be deployed to a publicly accessible host (e.g., Render) reachable from the frontend deployment.
4. THE deployment README SHALL document the live URL, the test credentials (admin, branch manager, branch staff), and promo codes.
5. IF the deployment requires environment variable configuration, THE README SHALL list all required variable names without exposing their values.

---

### Requirement 21: Secured Environment Variables

**User Story:** As a developer and security reviewer, I want all secrets to be stored in environment variables and excluded from the repository, so that API keys and database credentials are never exposed publicly.

#### Acceptance Criteria

1. THE Simba_Platform SHALL store all secrets — including `GROQ_API_KEY`, `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`, and `NEXT_PUBLIC_API_URL` — exclusively in environment variables, never in source code.
2. THE repository root `.gitignore` SHALL include `.env`, `.env.local`, and `backend/.env` to prevent accidental commits of secrets.
3. WHEN the application builds or starts, THE Simba_Platform SHALL validate that required environment variables are present and log a clear startup error if any are missing.
4. CLIENT-SIDE code (components, pages, client-side lib files) SHALL NOT reference `process.env` variables that do not begin with `NEXT_PUBLIC_`.
5. THE `.env.example` (or equivalent) file in both the frontend root and `backend/` SHALL list all required variable keys with placeholder values and instructions.

---

### Requirement 22: Performance

**User Story:** As a customer on a typical Kigali mobile connection, I want pages to load quickly, so that I am not discouraged from shopping by slow performance.

#### Acceptance Criteria

1. THE homepage SHALL achieve a Lighthouse LCP score of 2.5 seconds or better on a simulated mobile (4G) connection.
2. THE `/products` route SHALL use Next.js server-side rendering or static generation to deliver a pre-rendered product catalogue without client-side data fetching waterfall.
3. THE Simba_Platform SHALL lazy-load off-screen product images using Next.js `<Image>` with the `loading="lazy"` strategy for non-hero images.
4. THE frontend build SHALL produce no TypeScript compilation errors (`tsc --noEmit` exits 0).
5. THE frontend bundle SHALL not import unused large dependencies into the critical path (verified by Next.js build output showing no individual chunk over 500 kB gzip).

---

### Requirement 23: Code Quality

**User Story:** As a technical reviewer, I want the codebase to follow consistent TypeScript and React conventions, so that it is maintainable and demonstrates engineering best practices.

#### Acceptance Criteria

1. ALL TypeScript source files SHALL declare explicit types for function parameters, return values, and component props; usage of `any` SHALL be limited to unavoidable interop cases and documented with an inline comment.
2. THE Simba_Platform SHALL pass `next lint` with zero errors (warnings acceptable).
3. SHARED logic (validation, search, API helpers, translation lookup) SHALL be extracted into `src/lib/` utility modules rather than duplicated across components.
4. REACT components SHALL be functional components using hooks; class components SHALL NOT be introduced.
5. ALL user-visible strings in components SHALL reference the `translations` object keyed by the active `language` state rather than being hard-coded in English.
6. SERVER-SIDE route handlers SHALL validate request bodies before processing and return structured JSON error responses (with an `error` string field) for bad inputs.
