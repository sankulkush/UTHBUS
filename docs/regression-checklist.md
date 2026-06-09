# Pre-Production Regression Checklist

Run this before every prod deploy. Takes ~20 min. If any step fails, do not ship.

**Environments**
- Local: http://localhost:3000
- Preview: https://dev.uthbus.com
- Production: https://uthbus.com

**Test accounts** (fill in as you create them)
- User: `_______________`
- Operator: `_______________`
- Admin: `_______________`

---

## 1. Public surfaces (no login required)

- [ ] Homepage loads — search widget visible, no console errors
- [ ] City pickers show dropdown list (not free-text typos)
- [ ] Date picker rejects past dates, accepts tomorrow, allows +60 days
- [ ] Swap button atomically swaps From and To
- [ ] Submit with valid From/To/Date → lands on `/search?from=&to=&date=`
- [ ] Featured route cards on homepage are clickable and deep-link into search
- [ ] Six SEO route landing pages render (e.g. `/kathmandu-to-pokhara-bus`)
- [ ] Footer links work; `/contact` shows support number
- [ ] Stub routes return 404: `/user/billing`, `/user/credits`, `/user/notifications`, `/user/refer-friend`

## 2. Search → seat selection

- [ ] Search returns results in <3s
- [ ] Each card shows: operator, bus name, type, AC, amenities, times, fare, seats remaining
- [ ] Filters (bus type, AC, price, departure time) update results without reload
- [ ] Non-approved buses do NOT appear in results
- [ ] Clicking "View Seats" opens seat selection for that bus

## 3. Booking funnel (user flow)

- [ ] Pick a seat → continue → passenger details page
- [ ] Phone validation blocks invalid Nepali numbers
- [ ] Continue to Review & Pay
- [ ] "Confirm & Pay" creates the booking (writes to Firestore)
- [ ] E-ticket page loads with the right PNR
- [ ] **Payment Mode shows "Reserved — pay at counter"** (NOT "Online (UPI)")
- [ ] Print, Download, WhatsApp share buttons all work
- [ ] Copy PNR button works

## 4. My Bookings

- [ ] `/user/bookings` lists the booking just made
- [ ] Tabs: Upcoming / Past / Cancelled — counts are correct
- [ ] Search by name/PNR/route filters the list
- [ ] "Need Help?" opens WhatsApp with PNR pre-filled (not the old alert)
- [ ] Cancel Booking flips status to cancelled and shows in Cancelled tab

## 5. User profile / auth

- [ ] Login with email/password works
- [ ] Login with Google works
- [ ] Profile dropdown only shows: Profile, My Bookings, Log out (stubs removed)
- [ ] Logout clears session and redirects

## 6. Operator portal

- [ ] Operator login at `/operator/login` works
- [ ] Counter dashboard loads with KPIs
- [ ] Walk-in counter booking flow completes
- [ ] Fleet: add a new bus → appears with `verificationStatus = pending_verification`
- [ ] Newly-added bus does NOT appear in user search until admin approves it
- [ ] Edit bus saves changes
- [ ] Bookings tab shows operator's own bookings
- [ ] Routes / Trips / Seat Layouts pages load without errors

## 7. Admin portal

- [ ] Admin login at `/admin/login` works
- [ ] Non-admin user accessing `/admin/*` is denied/redirected
- [ ] Buses page — Pending tab shows the new bus from operator
- [ ] Approve → bus moves to Approved tab
- [ ] Approved bus now appears in user search
- [ ] Hold (Approved → Suspended), Reactivate, Reject, Delete all work
- [ ] Bookings page lists platform-wide bookings, newest first
- [ ] Search by name/phone/bus/route filters
- [ ] Cancel a booking from admin → flips to cancelled

## 8. Observability

- [ ] Sentry dashboard shows no spike in errors during the run
- [ ] Visit `/sentry-test` on preview (NOT prod) → all three buttons send events
- [ ] Events in Sentry are tagged with correct `environment` (preview vs production)

## 9. Backups

- [ ] Cloud Storage bucket `uthbus-prod-firestore-backups` has a fresh export from the last 24h
- [ ] Lifecycle rule deleting exports >30 days old is active

## 10. Final smoke (prod only, after deploy)

- [ ] uthbus.com homepage loads
- [ ] Browse to a route landing page
- [ ] Open an existing booking from My Bookings — ticket renders correctly
- [ ] No new Sentry errors in the 15 min after deploy
- [ ] Mobile (real device or Chrome devtools mobile mode) — homepage and search funnel render correctly

---

**If any item fails, file a ticket using the BA spec ID (e.g. USR-TICKET-R3) and fix before next deploy.**
