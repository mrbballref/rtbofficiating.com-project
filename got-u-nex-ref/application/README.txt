GOT U NEX REF — PERSONAL PROFILE PORTAL
=========================================

FILES
- index.html — personal profile portal
- styles.css
- script.js
- edit-profile.html — dedicated Edit Profile page
- edit-profile.css
- edit-profile.js
- admin-bridge-example.js
- assets/

PROFILE PAGE UPDATES
- No global top navigation menu or light/dark toggle is included.
- The supplied Got U Nex Ref logo is the only branding image at the top of the sidebar.
- Removed from the profile/edit-profile sidebars: My Schools, Reviews, Whiteboard, Vault, and Safe.
- Evaluations is retained as its own functional area so users can view completed evaluations without a Reviews feature.
- The Raising The Bar Officiating hero logo that previously appeared at the top-right of the profile page has been removed.
- The top-right of the profile hero now contains:
  * a notification bell with a combined unread alert badge for messages + notifications
  * the current user's profile icon/name/role; clicking it opens Edit Profile
- Two communication summary widgets now appear above Upcoming Assignments and Recent Documents:
  * Messages
  * Notifications
- The widgets summarize unread/latest items and are populated from profile state synchronized by the admin/backend messaging and notification services. No sample message/notification records are hard-coded.
- The Notifications view is accessible from the bell/widget but is intentionally not added as another sidebar item.
- The profile role is data-driven through profile.role. The same personal profile interface can therefore display an Official, Super Admin, Assignor, or other authorized role without turning this page into the administrative dashboard.
- The personal Dashboard remains a user/profile dashboard. It is not the Super Admin dashboard and exposes no administrator management controls.

SIDEBAR FEATURES
- Dashboard
- My Assignments
- Calendar
- Availability
- Messages
- My Profile
- Documents
- ID Card
- Evaluations
- Support
- Settings

FUNCTIONAL WORKFLOWS
- Accepted / Pending / Declined assignment views.
- Pending assignment accept/decline workflows, including decline reasons.
- Editable weekly availability with save/sync event.
- Calendar for accepted assignments.
- Message inbox, message reader, compose workflow, read state, and unread badge.
- Notification center, read state, mark-all-read, notification summary widget, and bell badge.
- Documents and required forms:
  * Vendor Information Form
  * Tax / W-9 Information
  * Independent Contractor / Season Contract
  * Game Report
  * Incident Report
  * completed document viewer/download record
  * user document uploads
- Evaluations view plus evaluation-request workflow.
- ID card view, print, and offline HTML download.
- Support request form.
- Account notification/privacy settings.
- Quick Actions remain functional and no longer route to Whiteboard.

EDIT PROFILE
- edit-profile.html uses the same sidebar feature set as the profile page.
- Street address, city, state, ZIP, email, phone, personal information, officiating information, profile image, and compliance/display fields are retained.
- Save Changes writes the profile state, emits the admin-integration event, and then automatically returns to index.html#profile.
- Cancel returns to the profile page without saving.
- The user's role is supplied by authenticated/admin state rather than being editable by the user. Profile previews display that role dynamically.

ADMIN DASHBOARD / BACKEND CONNECTION
The personal-profile frontend includes an integration bridge. This page can be connected to the Super Admin/admin dashboards without becoming the dashboard itself.

1. Optional direct adapter
Define window.GotUNexRefAdminAPI before script.js. Supported actions include:
- getOfficialPortalData(payload)
- profileUpdated(payload)
- availabilityUpdated(payload)
- assignmentAccepted(payload)
- assignmentDeclined(payload)
- documentCompleted(payload)
- documentDraftSaved(payload)
- documentUploaded(payload)
- uploadDeleted(payload)
- messageSent(payload)
- messageRead(payload)
- messagesMarkedRead(payload)
- notificationRead(payload)
- notificationsMarkedRead(payload)
- evaluationRequested(payload)
- supportTicketCreated(payload)
- settingsUpdated(payload)

getOfficialPortalData can return authenticated personal-profile data such as:
  {
    data: {
      profile: { role: "Official" | "Super Admin" | "Assignor" | ... },
      assignments,
      documents,
      requiredForms,
      evaluations,
      messages,
      notifications,
      availability,
      accountStats,
      settings
    }
  }

Message records can use fields such as:
  { id, from, sender, subject, body, date, read, direction }

Notification records can use fields such as:
  { id, title, body, sender, category, date, read, route }

The optional notification.route can point to a personal-profile route such as assignments, documents, evaluations, availability, messages, or profile.

2. Event-based connection
If a direct adapter is not present, portal writes dispatch:
  window event: "gotunexref:portal-action"
  event.detail = { action, payload, officialId, timestamp }

The connected application can push authenticated updates back with:
  window.GotUNexRefPortal.receiveAdminSync(data)

or:
  window.dispatchEvent(new CustomEvent('gotunexref:admin-sync', { detail: data }))

3. Public helper
window.GotUNexRefPortal exposes:
- getState()
- setState(data)
- receiveAdminSync(data)
- openView(viewName)
- resetLocalState()

PRODUCTION NOTES
- localStorage is only the standalone frontend persistence layer. Production should use authenticated API/database storage and server-side authorization.
- Role and permission values must come from the authenticated backend; do not trust client-side role changes for authorization.
- The Tax / W-9 workflow must connect to the approved tax-document/e-sign system in production.
- Do not store unencrypted SSN/TIN values in localStorage in production.
- Original archived document binaries must come from the authorized document repository/API.
- Uploaded binary files should be stored by the production upload service.

DEFAULT LOGIN LANDING
---------------------
My Profile is the default authenticated landing page.
After a successful login, route users to:
  index.html#profile

Loading index.html without a hash also opens My Profile automatically.
The Dashboard remains available from the sidebar, but it is not the login landing page.


NO SEEDED / FAKE USER DATA
--------------------------
This package does not seed a sample person, sample assignments, sample completed documents, sample evaluations, sample messages, sample notifications, or a fake credential QR code.
The storage key is v3 so older seeded prototype records do not reappear.

DEFAULT LOGIN + RETURN NAVIGATION
---------------------------------
My Profile is the default authenticated landing view. Route successful login to index.html#profile. Every non-profile portal section has a visible Back to My Profile control. Edit Profile also has a Back to My Profile control, and Save Changes returns to index.html#profile.

ASSIGNMENTS SECTION RECREATION
------------------------------
The My Assignments section has been rebuilt to mirror the supplied black/red/gold
Assignments reference layout. It includes:
- utility search, notifications, messages, and profile-return user control
- dynamic month selector
- All Assignments / My Assignments / Completed tabs
- assignment search, status/type/class-team filters
- New Assignment workflow
- sortable Due Date column
- responsive assignment table, status pills, row actions, and pagination

No sample assignment rows are seeded. The table renders only records supplied by
the authenticated/admin integration or records the user explicitly creates.


MY ASSIGNMENTS / MY GAMES
-------------------------
The "My Assignments" tab inside Assignments now opens a dedicated My Games
subsection recreated from the supplied reference.

The section includes:
- My Games heading and summary strip
- total / accepted / pending / travel-mile metrics
- Upcoming / Accepted / Pending / Declined / Past filters
- Filters drawer and date-sort control
- game cards with date, teams, venue, crew, status and event information
- View Details, Add to Calendar, Contact Crew and Get Directions actions
- pagination and timezone messaging

No sample games, teams, records, addresses, dates, crews, or mileage were seeded.
All rows and metrics are generated from actual state/backend assignment data.
Team-mark fallbacks are generated from the real team names when no team logo is
provided.


EXPLICIT MY PROFILE PAGE
------------------------
The user profile page is now included as:
  my-profile.html

This is the intended authenticated landing page:
  my-profile.html#profile

The existing index.html is retained for compatibility and contains the same
full portal. Edit Profile Save/Cancel and its sidebar links now return to
my-profile.html so the profile page is explicit in the project ZIP.


PROFILE CONTENT REPAIR
----------------------
Fixed the HTML nesting error that caused the content area to appear completely
blank while the left sidebar remained visible.

The My Assignments / My Games insertion had introduced an extra closing
</section> tag. That prematurely closed #mainContent, leaving Calendar,
Availability, Messages, Notifications, My Profile, Documents, ID Card,
Evaluations, Support, and Settings outside the main application layout.

All 12 portal sections are now correctly contained inside #mainContent.
My Profile is again the visible default authenticated landing page.


STANDALONE NOTIFICATIONS CENTER
-------------------------------
notifications.html recreates the supplied Notifications page without the website
navigation menu or the profile sidebar.

It reads the same authenticated portal state from gotUNexRef.officialPortal.v3,
so no sample notifications are seeded. Notification rows, counts, unread state,
filters and pagination populate from actual connected/synchronized notification
records.

Profile notification buttons now route to notifications.html.


NOTIFICATIONS SIDEBAR FIX
-------------------------
Notifications is now a visible sidebar item directly below Messages on:
- index.html
- my-profile.html
- edit-profile.html

The main profile sidebar Notifications item routes to the dedicated
notifications.html page. Its badge displays the unread notification count.


2-MAN CREW GAME ASSIGNMENT
--------------------------
assignment-2man.html is the dedicated published-game assignment detail page for
game assignments with exactly two referees.

The page intentionally does not include the website navigation menu. It includes
the reference layout elements: back link, published assignment heading/status,
schedule/game-detail controls, game-time and level summary, team matchup, date/
time/location/pay strip, venue image/address/instructions, two-official crew
section, coaches, athletic directors, assignment notes, additional information,
and assignment download.

No sample schools, officials, coaches, addresses, dates, phone numbers, scores,
or other reference-image data are seeded. All values are populated from the real
assignment record in the profile/admin integration.

When My Assignments detects an assignment with crew size 2, View Details opens:
  assignment-2man.html?id=<assignment-id>


3-MAN CREW GAME ASSIGNMENT
--------------------------
assignment-3man.html is the dedicated published-game detail page for game
assignments with exactly three active referees.

The page intentionally does not include the website navigation menu. It recreates
the supplied 3-man reference structure with:
- Back to All Assignments
- View Schedule and Download Assignment
- published-assignment status
- game-time and level summary
- team matchup
- Date / Time / Level / Location / Pay / Assigned strip
- venue image, gym location, map, phone, parking, entrance, arrival information
- OFFICIALS (3-MAN CREW): Referee, Umpire 1, Umpire 2
- optional Alternate only when one is actually supplied
- home/visiting coaches
- home/visiting athletic directors
- assignment notes and additional information
- closing Got U Nex Ref professionalism message

No reference-image sample data is seeded. All schools, officials, contacts,
addresses, dates, records, pay, notes and venue information are populated from
the actual assignment record.

My Assignments View Details routing:
- 2 active referees -> assignment-2man.html
- 3 active referees -> assignment-3man.html


CALENDAR / AVAILABILITY SECTION
-------------------------------
calendar.html recreates the supplied Calendar Month View without the website
top navigation menu. The personal profile sidebar remains because Calendar is a
profile section.

The page includes month/week/day controls, Sync Calendar, dynamic month grid,
mini calendar, Upcoming Events, legend, monthly summary cards, and date-specific
availability editing.

Clicking a date lets the user set Available, Unavailable, Limited, or Clear.
Changes are stored in state.availability.byDate and notesByDate, dispatch the
availabilityUpdated portal event, and call GotUNexRefAdminAPI.availabilityUpdated
when the production adapter is connected. This is the data path the Super Admin
assigning workflow can use for its availability report.

No sample calendar dates, schools, games, clinics, or availability records are
seeded. Calendar contents are generated only from the authenticated user's
assignments, calendar events, and availability data.


CALENDAR / AVAILABILITY BLOCKING WORKFLOW
-----------------------------------------
calendar.html has been rebuilt to match the supplied "My Availability" reference
without the website top navigation menu.

The existing Got U Nex Ref profile sidebar remains available. Calendar and
Availability both open this dedicated calendar:
  Calendar     -> calendar.html
  Availability -> calendar.html#availability

Availability workflow:
- Select a calendar date to open a compact date menu.
- Mark the day Available or Preferred, clear the status, or choose Block Date / Time.
- The Block Date / Time modal captures:
  date, start time, optional end time, block reason, and optional note.
- Reasons include:
  Officiating another game, Family commitment, Work commitment, School / Class,
  Medical appointment, Vacation / Travel, Not available – No reason provided,
  and Other.
- A full-day block becomes Unavailable.
- A partial-time block becomes Partially Available.
- Real assignments are rendered as Assigned.

Super Admin / assignor synchronization:
state.availability.byDate stores the effective day status.
state.availability.blocksByDate stores the unavailable time range and reason.
state.availability.reportRows stores normalized availability-report rows.
Each change dispatches:
  gotunexref:portal-action
  gotunexref:availability-report-updated
and calls GotUNexRefAdminAPI.availabilityUpdated / availabilityCalendarUpdated
when the authenticated backend adapter is present.

No screenshot dates, availability statuses, reasons, assignments, or events are
seeded. The calendar uses the real user's synchronized profile/assignment data.


PENDING GAME ASSIGNMENT / ACCEPT-DECLINE WORKFLOW
-------------------------------------------------
pending-assignment.html is the dedicated detail page used when a game assignment
is still Pending. The website top navigation menu is intentionally omitted; the
personal-profile sidebar remains.

The page includes:
- Back to Game Assignments
- View on Calendar
- Accept Assignment
- Decline Assignment
- Game information, teams, venue, phone and pay
- Crew / assignment details
- Assignment notes
- Decline Game Assignment modal with the supplied reason list
- Optional note (required when "Other" is selected)

Decline reasons:
Scheduling Conflict, Personal Commitment, Work Commitment, Medical Reason,
School / Class, Travel, Not Enough Notice, Pay / Distance, and Other.

When the user declines:
1. The assignment status becomes Declined.
2. The selected reason, description and note are stored on the assignment.
3. The game date/time is written into availability.blocksByDate.
4. The effective availability becomes Partially Available when a game time is
   known, or Unavailable when no time is supplied.
5. availability.reportRows is rebuilt so the Super Admin / assignor report can
   display the exact reason for that date/time.
6. assignmentResponded, availabilityUpdated and availabilityCalendarUpdated are
   sent through the backend adapter when connected.

When the user accepts:
- The assignment becomes Accepted.
- The response is synchronized to the admin/assignor workflow.
- A 2-man game routes to assignment-2man.html.
- A 3-man game routes to assignment-3man.html.

No screenshot schools, officials, dates, pay amounts, phone numbers or decline
records are seeded. The page renders only the actual authenticated assignment.


ASSIGNMENT CREATION PERMISSIONS
-------------------------------
The user's profile no longer exposes "New Assignment" by default.

Creating game assignments is restricted to:
- Super Admin
- users explicitly authorized by the Super Admin

The New Assignment control is hidden unless the authenticated synchronized state
contains an authorized role/permission. The creation action and form submission
are also permission-checked, so hiding the button is not the only protection.

Supported frontend permission signals:
  permissions: ['assignments.create']
  profile.permissions: ['assignments.create']
  authorization.canCreateAssignments: true

Ordinary officials/users have no assignment-creation permission in the default
state and cannot open or submit the creation workflow.

The production backend must independently enforce the same permission before
creating any assignment.


OFFICIATING ANOTHER GAME — SECOND WINDOW
----------------------------------------
Selecting "Officiating another game" as the availability block reason now uses
a two-step workflow.

Step 1:
Choose the blocked date, start time, optional end time, and select
"Officiating another game."

Step 2:
The portal opens a dedicated Officiating Another Game window and requires:
- Level of Game:
  High School, NJCAA, NAIA, NCAA DIII, NCAA DII, NCAA DI
- Location of the game
- Home team
- Visiting team
- Game time
- Conference
- Supervisor's name

These values are saved in availability.blocksByDate under otherGameDetails and
are normalized into availability.reportRows for the Super Admin / assignor
availability report. This gives authorized administrators the specific reason
and game details behind the user's conflict rather than only showing
"Unavailable" or "Partially Available."


OFFICIATING ANOTHER GAME DISPLAY FIX
------------------------------------
The second-step Officiating Another Game form has been rebuilt as a fixed overlay window instead of a second native <dialog>. This prevents browser modal-stacking issues and guarantees the second window displays on the Availability Calendar.

After selecting Officiating another game, the primary button changes to Continue. Continue opens the required second window containing: Level of Game, Location of Game, Home Team, Visiting Team, Game Time, Conference, Supervisor's Name, plus the carried-forward blocked date and blocked time.


OFFICIATING ANOTHER GAME — SECOND WINDOW CORRECTION
----------------------------------------------------
The workflow now advances immediately when the official selects
"Officiating another game" from Block Reason. The first reason window closes
and the dedicated second window opens automatically; the official does not have
to click Continue just to reveal the required game-detail form.

The second window contains only the required conflict details plus its Back/Save
actions:
- Level of Game: High School, NJCAA, NAIA, NCAA DIII, NCAA DII, NCAA DI
- Location of Game
- Home Team
- Visiting Team
- Game Time
- Conference
- Supervisor's Name
- Carried-forward Blocked Date
- Carried-forward Blocked Time

The carried-forward values are populated from the first Block Date / Time window.
Existing saved Officiating another game conflicts also open directly in this
second-step editor.

ADMIN DASHBOARD — ADD USERS
---------------------------
New files:
  admin-add-user.html
  admin-add-user.css
  admin-add-user.js

The page recreates the supplied Add Users admin-dashboard reference with:
- top dashboard navigation and Got U Nex Ref branding
- Back to Users
- User Type / Role selection
- Personal Information
- Organization Details
- Address Details
- Access & Permissions
- Security & Login
- Profile Photo upload / drag-and-drop
- Notes / Internal Comments
- live User Preview
- live Permissions Summary
- Invitation Delivery summary
- Save Draft
- Create User
- Create & Send Invite

Roles included:
Official, Assignor, School Admin, Admin (Website), Coach, AD, Vendor,
Tournament Director, and Super Admin.

The page contains no sample user records. Preview values are generated only from
what the Super Admin enters. Organizations, schools/teams, and departments are
empty until supplied by the authenticated admin backend.

SECURITY REQUIREMENT
The production backend must verify that the current actor is the Super Admin or
has an explicit Super Admin-granted user-creation permission before creating a
user, assigning roles, changing permissions, or sending an invitation. The UI
permission model is not a substitute for server-side authorization.

ADMIN DASHBOARD INTEGRATION FIX
-------------------------------
This package now opens the Got U Nex Ref Super Admin Dashboard from index.html.

Admin pages:
- index.html / admin-dashboard.html — Super Admin dashboard overview
- admin-users.html — User management list, filtering, status controls and export
- admin-add-user.html — Add User / role / permission / invitation workflow

The Add User page is now part of the Admin Dashboard workflow. "Back to Users"
returns to admin-users.html, and the Home control returns to admin-dashboard.html.
All three pages use the same gotUNexRef.adminDashboard.v1 state so users created
in Add User immediately appear in the Admin Dashboard and Users section.

No sample users are seeded. Counts, role distribution, recent users and the user
table are populated from actual created/synchronized admin user records.

ADD USER FONT READABILITY UPDATE
--------------------------------
The Admin Dashboard Add User page has been updated so normal interface copy,
field labels, form controls, role buttons, permission labels, preview details,
invitation details, buttons, and helper text render at a minimum of 16px.
Headings remain larger. Layout dimensions and responsive breakpoints were also
expanded so the larger typography does not clip the form controls.


ADMIN NAVIGATION CORRECTION
---------------------------
The left Super Admin sidebar has been restored/retained.

The ONLY navigation removed is the horizontal website-style top menu from the
Add User section:
Home, Assignments, Schools, Payments, Resources, Shop, Support, Sign In, and
Create Account.

The sidebar remains available on:
- Admin Dashboard
- User Management
- Add User

The previously requested 16px Add User typography is preserved.


ADMIN DASHBOARD FONT SIZE
-------------------------
Admin Dashboard and User Management small UI text has been increased to a
minimum of 12px for readability.

This includes:
- sidebar labels and links
- dashboard profile copy
- overview descriptions
- stat labels/helper copy
- panel links and quick actions
- tables
- filters and status labels
- User Management footer copy
- toasts

Headings and large numeric metrics remain larger than 12px.
The Add User page retains its separate 16px readability settings.


ADMIN DASHBOARD FONT SIZE — 16PX
--------------------------------
The entire Admin Dashboard and User Management interface has been increased to
16px minimum typography.

Updated areas include:
- left Super Admin sidebar
- dashboard header and administrator profile
- overview copy
- stat cards
- quick actions
- role distribution
- recent-users tables
- User Management controls and tables
- filters, status pills and footer copy
- buttons, inputs, selects and toasts

Spacing and control heights were also increased where needed to prevent clipping.

The Add User page already uses the previously requested 16px readability rules
and remains at 16px.


GAME ASSIGNMENT ADMIN SECTION
-----------------------------
Added a complete Super Admin Game Assignment workflow based on the supplied
2-man and 3-man assignment references.

Pages:
- admin-game-assignments.html
- admin-create-assignment.html?crew=2
- admin-create-assignment.html?crew=3
- admin-master-schedule.html

Create Assignment includes:
- Date
- Start Time
- Level
- Gender
- Home Team
- Visiting Team
- Venue
- Dynamic Head Coach
- Dynamic Athletic Director
- Gym Address
- Gym Phone
- Assigning Official
- Required crew slots
- Optional Alternate
- Available / Unavailable official tabs
- Official search and filters
- Availability reason for unavailable officials
- Assignment Notes
- Estimated Total Pay
- Save as Draft
- Create Assignment

2-man required crew:
- Referee
- Umpire
- Alternate optional

3-man required crew:
- Referee
- Umpire 1
- Umpire 2
- Alternate optional

Publishing:
- Created assignments are written to gotUNexRef.adminAssignments.v1.
- Published assignments immediately appear in admin-master-schedule.html.
- script.js now synchronizes published assignments into the logged-in official's
  My Assignments view by matching profile.officialId against the assignment crew.
- Published assignments start with Pending status for the official to accept or decline.
- No fake users, games, schools, venues, pay amounts, or availability records are seeded.

CONTRACT GENERATOR INTEGRATION — AUGUST 10, 2026
--------------------------------------------------
The Super Admin Dashboard now includes a Contract Generator sidebar item and a
full embedded contract workspace at admin-contract-generator.html.

The integrated contract library contains 31 branded DOCX documents and 30
contract/form templates, including specialized sports-officiating agreements
for officials, independent contractors, vendors, organizations, schools,
programs, leagues/conferences, events, sponsors, celebrity games, showcase
tournaments, AAU tournaments, preseason tournaments, facilities, evaluators,
governmental entities, employment, privacy, media/publicity, and FCRA workflow.

Both user-approved transparent PNG logos are used in the contract-generator
interface, contract previews/downloads, and the first-page header of every DOCX
in contract-generator/library/docx/.

IMPORTANT LEGAL IMPLEMENTATION NOTE
-----------------------------------
These are substantive execution-ready contract templates, not a guarantee that
a particular agreement is enforceable in every jurisdiction or factual setting.
Complete all business terms, confirm party identities and signer authority,
select governing law/venue appropriate to the transaction, attach required
schedules/addenda, and obtain counsel review for the actual use case before
execution. Worker classification must reflect the actual relationship and law,
not merely the contract title.


INVOICE GENERATOR INTEGRATION
-----------------------------
- Added Admin Dashboard sidebar dropdown: Invoice Generator.
- Dropdown contains Invoice Dashboard, All Invoices, Create Invoice, Recurring Invoices, Drafts, Payments Received, Trash, Clients, Services, Invoice Reports, and Activity Log.
- Added admin-invoice-generator.html wrapper using the current Super Admin dashboard sidebar.
- Incorporated the supplied invoice-generator project under invoice-generator/.
- Added the exact supplied transparent Got U Nex Ref and Raising The Bar Officiating logos to each invoice.
- Invoice watermark/background logo is 200px.
- Invoice Generator UI has a 16px minimum font size.
- Added editable Mail-To fields: Name, Mailing Address, City, State (all 50 states + DC), and Zip.
- Added editable Payment Link field. The live invoice includes a clickable PAY INVOICE ONLINE control and exported PDF includes a URI link annotation when a valid http/https payment URL is supplied.

INVOICE TEMPLATE UPDATE — REFERENCE INVOICE LAYOUT
--------------------------------------------------
The Invoice Generator now uses the supplied reference invoice as the layout
basis for generated invoices, retaining its Bill To / Ship To structure,
invoice-detail block, Mail To area, line-item table, totals, terms, payment
workflow, footer treatment, and page numbering.

Header changes:
- Left: Raising The Bar Officiating title
- Directly below: "We Will Serve, And We Will Be Of Service To The Game"
  at 14px in burnt orange
- Center: selected approved transparent logo (RTBO by default)
- Right, centered contact block:
  Phone: (501) 240-4961
  Email: mrbballref1775@yahoo.com
  Website: rtbofficating.com
- INVOICE label remains visible at the top-right of the document body
- Background logo/watermark remains 200px

Invoice numbering:
- Every newly created invoice receives a new sequential invoice number
- Default format: RTBO-YYYY-###
- A persistent sequence counter prevents normal number reuse even if prior
  invoices are deleted
- The prefix can be changed in Admin Dashboard Settings

Optional DBA titles per invoice:
- DBA Raising The Bar Officiating
- DBA Got U Nex Ref
- Either, both, or neither may be selected
- DBA labels themselves are configurable in Admin Dashboard Settings

Admin Dashboard Settings now contains Invoice Header & Business Settings for:
- Invoice Header Title
- Slogan
- Phone
- Email
- Website
- Invoice Number Prefix
- Header Logo (RTBO or Got U Nex Ref)
- Legal Business Name
- DBA Raising The Bar label
- DBA Got U Nex Ref label

These global settings synchronize into the Invoice Generator. Finalized invoices
retain their locked header values while active drafts/non-finalized invoices can
receive updated global header settings.

REFERENCE INVOICE TEMPLATE CORRECTION
-------------------------------------
The invoice output was rebuilt to follow the supplied one-page reference-invoice.pdf
layout rather than using a generic invoice layout.

Reference-driven output structure:
- black full-width header band
- Raising The Bar Officiating business title at left
- requested 14px burnt-orange slogan directly below the title
- approved transparent logo centered in the header
- phone, email, and website contact block centered on the right
- Bill To and Ship To blocks on the left
- Invoice #, Invoice Date, Reference #, Due Date, Event, Game Level, and Mail To on the right
- maroon Description / Price / Quantity / Amount table header
- centered 200px RTBO watermark behind invoice content
- Sub-total and Total section on the lower-right
- Terms & Conditions on the lower-left
- centered italic service slogan and Thank You message near the footer
- business contact footer at lower-left
- page numbering at lower-right
- optional clickable online payment URL retained
- optional DBA Raising The Bar Officiating / DBA Got U Nex Ref titles retained

The HTML print preview and generated PDF canvas were both updated to the same
reference-template structure. The uploaded template PDF is included under:
reference/reference-invoice.pdf


ATTACHED ADMIN SECTIONS INTEGRATION
-----------------------------------
Integrated the user-supplied Master Schedule, Add School / Team, Basketball Game Report, and Basketball Referee Evaluation builds into the existing Admin Dashboard without removing the Contract Generator, Invoice Generator, Availability Report, user management, assignment creation, profile, or other current features.

New routes:
- admin-module.html?module=schools
- admin-module.html?module=add-school-team
- admin-module.html?module=school-contacts
- admin-module.html?module=availability
- admin-module.html?module=game-reports
- admin-module.html?module=referee-evaluations
- admin-module.html?module=reports
- admin-module.html?module=resources
- admin-module.html?module=messages
- admin-module.html?module=notifications
- admin-module.html?module=support

The embedded feature modules synchronize current admin users, schools, and game assignments into the supplied dashboard modules. Schools, game reports, and referee evaluations are synchronized back into Admin Dashboard option storage.


SUPER ADMIN PROFILE
-------------------
Added admin-profile.html as the personal profile page for the Super Admin.
The profile page is now the default landing page through index.html after login.
The existing operational dashboard remains admin-dashboard.html and all prior dashboard features are retained.

Profile features include:
- Super Admin identity and account status
- profile photo upload
- editable name, display name, email, phone, username, organization, title, department, city/state, time zone and bio
- account/security summary
- message and notification counts from admin storage
- recent administrator activity when audit records exist
- direct access to Dashboard and Admin Settings

A My Profile link was added to existing Admin Dashboard sidebars without removing the existing sidebar destinations.


TAX CENTER + PAYMENTS ROUTING UPDATE
------------------------------------
- Incorporated the supplied tax-center/form-generator files into the Admin Dashboard.
- Added Tax Center to the existing Admin Dashboard sidebar.
- Tax Center opens the dashboard Tax Center workflow and the supplied official PDF form generator.
- Corrected the outer Payments sidebar link so it opens the Payments section, not Invoice Generator > Payments Received.
- Invoice Generator > Payments Received remains available inside the Invoice Generator dropdown.
- Existing Admin Dashboard features were preserved.

REFEREE EVALUATION WORKFLOW UPDATE
---------------------------------
The Basketball Referee Evaluation section now includes:
- Separate comments visible to the evaluated official, hidden from the official, and supervisor-only comments.
- Review requirements selectable as none, assignor, Super/Site Admin, or both.
- Approval workflow that blocks finalization/delivery until required reviews are approved.
- Finalized evaluation delivery to the evaluated official's saved profile record.
- Email delivery hook via GotUNexRefAdminAPI.emailEvaluation with mail-client fallback when no backend mail service is connected.
- Evaluate All Crew Members workflow that creates separate evaluation drafts for each assigned crew member.
- Game Date + Game Location lookup that automatically loads matching saved game details, time, teams, level/gender, and crew.
- Official-facing evaluation documents exclude internal and supervisor-only comments.


MAIN SECTION PAGES UPDATE
- Sidebar dropdown menus were reduced to single top-level section links.
- Each sidebar section now has a dedicated main page with an in-page section navigation menu.
- New section landing pages use a streamlined row-based design rather than cards.
