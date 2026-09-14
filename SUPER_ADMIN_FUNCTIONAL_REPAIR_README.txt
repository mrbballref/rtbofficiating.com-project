RTBO SUPER ADMIN FUNCTIONAL REPAIR

WHAT THIS FIXES
- Restores the previously working Got U Nex Ref Super Admin application.
- Removes the static placeholder Super Admin dashboard from the active route.
- Makes SUPER_ADMIN_DASHBOARD.html redirect to the real functional dashboard.
- Makes got-u-nex-ref/super-admin-dashboard.html redirect to the real functional dashboard.
- Restores the complete known-good admin application folder, including:
  users, assignments, schools, officials, availability, master schedule,
  contract generator, invoice generator, payments, tax center, reports,
  resources, messages, notifications, settings, support, TBA games,
  Quick Assign, evaluations, incidents, and admin profile workflows.
- Preserves persistent Super Admin browser authority without requiring repeated login.
- Keeps Master CMS and Super Admin All-Access links available.

WHY IT BROKE
The combined master project routed Super Admin access into a newer static
placeholder dashboard shell instead of the older operational application.
This repair restores the operational application rather than rebuilding it.

INSTALL
Merge the included Raising_The_Bar_Officiating_Complete_Platform folder
over your existing master project folder.

Then serve the master project and open:
http://localhost:8080/SUPER_ADMIN_DASHBOARD.html

That route now opens:
got-u-nex-ref/application/admin-dashboard.html
