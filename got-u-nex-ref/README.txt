GOT U NEX REF — HTML/CSS/JS FRONTEND REVIEW PACKAGE

HOW TO VIEW
1. Unzip this folder.
2. Open index.html in Chrome, Edge, Firefox, or Safari.
3. Click “Log In” to open the user profile/home workspace.
4. Use the profile sidebar links to enter the platform workspace modules.

CONTENTS
- index.html + gunr.css + gunr.js: supplied Got U Nex Ref public homepage adapted for standalone review.
- user-profile/: Official user landing/profile page with game schedule, availability, notifications, messages, documents, editable personal information, and localStorage demo interactions.
- platform/: interactive multi-module platform workspace preview with Assignments, Calendar, Availability, Messages, Evaluations, Education, Travel, Payments, Documents, Reports, Organizations, Users, Audit, Settings, Support, and role switching.
- contact/: standalone Request Demo form for frontend review.
- assets/: exact supplied official Got U Nex Ref logo.

IMPORTANT
This ZIP is a frontend approval build. It runs without Node.js or React. Browser interactions use localStorage where needed. Backend/database/payment/email/SMS integrations remain intentionally deferred until the frontend redesign is approved.

Some photography and competition-level shield files referenced by the supplied homepage source were not included in the three uploaded homepage files. The review package uses coded fallback media panels instead of broken images; it does not invent replacement logos or clipart.

DATA POLICY FOR THIS REVIEW BUILD
- No fabricated users, organizations, games, schedules, messages, notifications, payments, documents, scores, course progress, or operational metrics are preloaded.
- Data-dependent screens open at zero/empty states.
- Any information that appears after interaction is information entered by the reviewer in that browser.


SIDEBAR LINKING UPDATE
----------------------
Every visible sidebar destination is linked to its matching platform feature.
The Official profile sidebar routes to: Assignments, Master Calendar, Availability, Messages, Notifications, Evaluations, Education, Travel Services, Payments & Invoices, Tax & Documents, Game Reports, Support Center, and Settings.
The platform workspace sidebar uses real hash links for each corresponding feature module, so destinations can be bookmarked and opened directly.
No fake production records were added.


ROLE ASSIGNMENT SECURITY UPDATE
- Only the Super Administrator has Assign User Roles authority by default.
- No other role inherits role-assignment rights.
- A non-Super-Admin user may receive role-assignment authority only through an explicit Super Admin permission grant.
- The Users & Roles navigation item is hidden when role-assignment authority is absent in this frontend review build.
- Production implementation must enforce the same rule server-side/database-side and audit all grants, revocations, and role changes.


SUPER ADMINISTRATOR PROFILE
---------------------------
Review: super-admin-profile/index.html
The Super Administrator profile includes:
- Open Super Admin Dashboard CTA
- RTBO Home CTA
- Editable personal/contact information
- Direct access to Organizations, Users & Roles, Audit Logs, Settings, Support, and platform operations
- Role-assignment authority notice

The standard user profile also includes the RTBO Home CTA.
The RTBO Home CTA currently points to https://rtbofficiating.com/home/.


SUPER ADMIN LOGIN ROUTING (FRONTEND REVIEW)
- Production behavior: authenticated role determines the destination after login.
- Super Administrator -> super-admin-profile/index.html
- Standard platform user -> user-profile/index.html
- For browser-only frontend review before backend integration, open:
  ../account/index.html?view=signin&role=super-admin
  and submit the Sign In form to verify the Super Admin profile landing page.
- Public account registration cannot grant the Super Administrator role.
- The Super Administrator profile includes:
  1. Go to Super Admin Dashboard CTA
  2. Raising The Bar Officiating Home CTA

SUPER ADMIN DASHBOARD FIX
-------------------------
The dedicated Super Administrator dashboard is now:
  super-admin-dashboard/index.html

The Super Administrator profile CTA links directly to this page. The dashboard is standalone HTML/CSS/JS and does not rely on a query-string role switch to render.
