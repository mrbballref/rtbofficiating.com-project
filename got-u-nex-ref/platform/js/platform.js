
const modules={
assignments:{eyebrow:'Assignment operations',title:'Assignments',desc:'Build crews, apply scheduling rules, distribute assignments, track responses, and manage replacements from one controlled workflow.',icon:'▦',empty:'No production assignments yet',emptyDesc:'Create or import an approved game before assigning qualified officials.',action:'Create Assignment',features:['Master schedule management','Single and bulk assignment','R / U1 / U2 / Alternate positions','Acceptance and decline tracking','Rule-based conflict checks','Replacement-official search','Schedule-change notifications','Override audit logging']},
calendar:{eyebrow:'Master schedule',title:'Calendar',desc:'Coordinate games, assignment coverage, travel windows, observations, education, and organization events.',icon:'▣',empty:'No calendar selected',emptyDesc:'Choose an organization and date range to review its approved operational calendar.',action:'Add Game',features:['Month, week, agenda views','Multi-sport filters','Venue and organization filters','Coverage status','Conflict indicators','Calendar synchronization','Cancellation history','Responsive mobile agenda']},
availability:{eyebrow:'Official readiness',title:'Availability & Conflicts',desc:'Manage dates, recurring blocks, travel limits, preferences, and protected relationship conflicts.',icon:'◷',empty:'No availability entries yet',emptyDesc:'Add available or blocked dates and any school, employment, family, travel, or schedule conflicts.',action:'Add Availability',features:['Full and partial-day blocks','Recurring availability','Preferred game levels','Preferred sports and locations','Maximum assignment limits','School relationship conflicts','Travel radius settings','Role-restricted visibility']},
messages:{eyebrow:'Communication center',title:'Messages',desc:'Keep officials, crews, assignors, schools, observers, and administrators connected through role-aware conversations.',icon:'✉',empty:'No production messages yet',emptyDesc:'Start a direct, crew, assignment, organization, or support conversation.',action:'New Message',features:['Direct and group threads','Crew and assignment messages','Organization announcements','Read and delivery status','Message attachments','Conversation search','Role-aware recipients','Secure communication history']},
notifications:{eyebrow:'Attention center',title:'Notifications',desc:'Review assignment, schedule, message, evaluation, education, payment, document, conflict, and game-day alerts in one place.',icon:'●',empty:'No notifications to display',emptyDesc:'New authorized platform events will appear here when they require your attention.',action:'Notification Settings',features:['Assignment created and changed','Acceptance and decline alerts','Message and read-status alerts','Evaluation and education alerts','Payment and document alerts','Conflict warnings','Arrival and game-day alerts','Notification preferences']},
evaluations:{eyebrow:'Development system',title:'Evaluations & Observations',desc:'Assign observers, measure performance, deliver feedback, attach video, and track long-term development.',icon:'✓',empty:'No evaluation selected',emptyDesc:'Create an observation assignment or open an approved evaluation template.',action:'New Evaluation',features:['Custom templates','1–5 scoring','Written strengths and improvements','Video attachments and play tags','Crew and individual reviews','Historical averages','Ranking controls','Visibility permissions']},
education:{eyebrow:'Professional development',title:'Education Portal',desc:'Deliver rules courses, quizzes, film breakdown, certifications, and structured development pathways.',icon:'◈',empty:'No course selected',emptyDesc:'Create a course or connect approved RefZone University learning content.',action:'Create Course',features:['NFHS / NJCAA / NAIA / NCAA paths','Modules and lessons','Weekly quizzes','Video and film breakdown','Attempt history','Certification tracking','Instructor feedback','Live and recorded sessions']},
travel:{eyebrow:'Game-day mobility',title:'Travel Services',desc:'Plan routes, mileage, nearby services, reimbursements, and qualified replacement searches while protecting location privacy.',icon:'⌖',empty:'No travel itinerary selected',emptyDesc:'Choose an approved assignment to review venue mapping and travel details.',action:'Open Travel Planner',features:['OpenStreetMap venue mapping','Mileage and drive time','Nearby hotels and airports','Rental cars, fuel and food','Travel notes and documents','Reimbursement tracking','Multi-day itineraries','Permission-based replacement radius']},
payments:{eyebrow:'Financial operations',title:'Payments & Invoicing',desc:'Track game fees, reimbursements, invoices, approvals, payment status, reconciliation, and financial exports.',icon:'$',empty:'No production payment records',emptyDesc:'Payment records appear after approved assignments and configured payment-provider workflows.',action:'Create Invoice',features:['Official payment tracking','School and league invoices','Game fees and mileage','Approval workflow','Receipts and exports','Refunds and adjustments','Organization ledger','Tokenized provider integration']},
documents:{eyebrow:'Compliance center',title:'Tax & Documents',desc:'Securely manage tax forms, certifications, agreements, policies, expiration dates, signatures, and review history.',icon:'▤',empty:'No production documents yet',emptyDesc:'Upload an authorized document or request one from an organization member.',action:'Upload Document',features:['W-9 / W-2 / 1099 workflows','Direct-deposit authorization','Certifications and background checks','Agreements and policies','Expiration reminders','Electronic signatures','Version history','Private role-based access']},
reports:{eyebrow:'Post-game operations',title:'Game Reports',desc:'Capture game conditions, conduct, incidents, fouls, facility details, supporting media, review, and follow-up.',icon:'▧',empty:'No production reports yet',emptyDesc:'Select a completed assignment to submit an authorized game report.',action:'New Game Report',features:['NFHS / NJCAA / NAIA / NCAA templates','Final score and overtime','Crew and venue details','Conduct and sportsmanship','Technical / intentional / flagrant fouls','Incidents and injuries','Video and image evidence','Revision and review history']},
organizations:{eyebrow:'Multi-tenant administration',title:'Organizations',desc:'Securely isolate schools, conferences, leagues, tournaments, users, schedules, payments, reports, and settings.',icon:'▥',empty:'No production organizations yet',emptyDesc:'Create an authorized organization and assign verified administrators.',action:'Create Organization',features:['Organization switching','Independent data scopes','Custom sports and levels','Organization-specific rules','Brand settings','Billing configuration','Integration controls','Lifecycle and archival states']},
users:{eyebrow:'Access administration',title:'Users & Roles',desc:'Manage verified users under strict least-privilege controls. Role assignment authority belongs only to the Super Administrator and users explicitly delegated that authority by the Super Administrator.',icon:'♙',empty:'No production members yet',emptyDesc:'Verified users will appear here after account creation. No user may assign or change roles without explicit role-assignment authority.',action:'Invite User',features:['Super Admin role authority','Explicit delegated authority','Organization invitations','Role assignment controls','Permission grants','Suspension and deactivation','Access review','Administrative audit history']},
audit:{eyebrow:'Accountability',title:'Audit Logs',desc:'Review sensitive platform activity, assignment overrides, access changes, document events, and financial actions.',icon:'◎',empty:'No production audit events',emptyDesc:'Authorized platform activity will appear here with actor, organization, event, timestamp, and context.',action:'Export Authorized Log',features:['Assignment override history','Role and permission changes','Document access events','Payment workflow events','Cancellation and reschedule history','Authentication events','Filter and search','Authorized export']},
settings:{eyebrow:'Platform configuration',title:'Settings',desc:'Manage organization rules, notifications, privacy, integrations, branding assets, calendars, and operational preferences.',icon:'⚙',empty:'Choose a settings category',emptyDesc:'Configuration access changes according to your organization role and permissions.',action:'Save Settings',features:['Assignment rules','Notification preferences','Location privacy controls','Organization branding','Integration status','Calendar synchronization','Security settings','Data retention controls']},
support:{eyebrow:'Platform support',title:'Support Center',desc:'Submit, assign, review, and resolve platform requests under role-based access controls.',icon:'?',empty:'No open support requests',emptyDesc:'Submit an account, scheduling, payment, document, reporting, or technical request.',action:'Open Support Request',features:['Categorized requests','Priority and status','Assigned support owner','Secure attachments','Organization context','Activity timeline','Escalation tracking','Resolution history']}
};
const modulesRoot=document.getElementById('modules');
for(const [id,m] of Object.entries(modules)){
 const section=document.createElement('section');section.id=id;section.className='module-view';
 if(id==='users'){
   section.innerHTML=`<div class="module-hero"><div><div class="eyebrow">${m.eyebrow}</div><h1>${m.title}</h1><p>${m.desc}</p></div></div>
   <div class="authority-grid">
    <article class="panel authority-card"><span class="authority-mark">★</span><div><div class="eyebrow">Role assignment authority</div><h2>Super Admin controlled</h2><p>Only the Super Administrator may assign user roles by default. A user may gain this capability only when the Super Administrator explicitly grants the <strong>Assign User Roles</strong> permission.</p></div></article>
    <article class="panel authority-card"><span class="authority-mark">⌁</span><div><div class="eyebrow">Delegated administrators</div><h2>No standing delegation</h2><p>Delegated access must be explicit, revocable, organization-scoped where applicable, and written to the audit log. No other administrator role inherits this permission automatically.</p></div></article>
   </div>
   <div class="access-layout">
    <section class="panel access-panel"><div class="panel-title"><div><div class="eyebrow">Verified users</div><h2>User access management</h2></div><span class="pill accepted">Authorized view</span></div><div class="empty role-empty"><div class="big">♙</div><h2>${m.empty}</h2><p>${m.emptyDesc}</p><button class="btn" type="button" id="inviteUserBtn">${m.action}</button></div></section>
    <aside class="panel access-panel"><div class="panel-title"><div><div class="eyebrow">Permission policy</div><h2>Assign User Roles</h2></div></div><div class="permission-list"><div><b>Super Administrator</b><span>Allowed by default</span></div><div><b>Delegated user</b><span>Allowed only after explicit Super Admin grant</span></div><div><b>All other roles</b><span>Denied</span></div></div><div class="policy-note">Role changes and delegation changes must be audit logged. Frontend controls are hidden when access is denied; production authorization must also be enforced server-side.</div></aside>
   </div>`;
 } else {
   section.innerHTML=`<div class="module-hero"><div><div class="eyebrow">${m.eyebrow}</div><h1>${m.title}</h1><p>${m.desc}</p></div></div><div class="feature-grid">${m.features.map((f,i)=>`<article class="feature panel"><span class="ficon">${i===0?m.icon:['◷','✓','◎','▧'][i%4]}</span><b>${f}</b><p>Configured through secure, organization-scoped, role-aware platform workflows.</p></article>`).join('')}</div><div class="empty panel"><div class="big">${m.icon}</div><h2>${m.empty}</h2><p>${m.emptyDesc}</p><button class="btn" type="button">${m.action}</button></div>`;
 }
 modulesRoot.appendChild(section);
}
const ROLE_ASSIGNMENT_PERMISSION='users.assign_roles';
let currentReviewRole='Official';
let delegatedRoleAssignment=false;
function canAssignUserRoles(){return currentReviewRole==='Super Administrator'||delegatedRoleAssignment===true;}
function updateRoleAssignmentAccess(){
 const allowed=canAssignUserRoles();
 document.querySelectorAll('[data-requires-role-assignment]').forEach(el=>{el.hidden=!allowed;el.setAttribute('aria-hidden',String(!allowed));});
 if(!allowed && location.hash==='#users') showView('dashboard');
}
const navButtons=[...document.querySelectorAll('[data-view]')];
function showView(id){
 if(id==='users'&&!canAssignUserRoles()){id='dashboard';}
 document.querySelectorAll('.module-view').forEach(el=>el.classList.toggle('active',el.id===id));
 document.querySelectorAll('.nav-btn').forEach(el=>el.classList.toggle('active',el.dataset.view===id));
 document.getElementById('sidebar').classList.remove('open');document.getElementById('overlay').classList.remove('open');
 window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 history.replaceState(null,'',location.pathname+location.search+'#'+id);
}
navButtons.forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();showView(btn.dataset.view)}));
document.getElementById('menu').addEventListener('click',()=>{document.getElementById('sidebar').classList.add('open');document.getElementById('overlay').classList.add('open')});
document.getElementById('overlay').addEventListener('click',()=>{document.getElementById('sidebar').classList.remove('open');document.getElementById('overlay').classList.remove('open')});
const roleContent={
'Official':['Official Dashboard','Review assignments, availability, crew information, game-day details, development, payments, documents, and communication from one workspace.',[]],
'Assignor':['Assignor Dashboard','Control unfilled games, official responses, conflicts, replacements, crew coverage, evaluation status, payments, and schedule changes.',[]],
'School Administrator':['School Dashboard','Review upcoming home games, assigned crews, facility details, schedule changes, invoices, reports, and required actions.',[]],
'Observer / Evaluator':['Observer Dashboard','Manage observation assignments, incomplete evaluations, submitted feedback, video review, and official development history.',[]],
'Finance Administrator':['Finance Dashboard','Manage payment approvals, invoices, reimbursements, adjustments, exports, and reconciliation alerts.',[]],
'Super Administrator':['Super Administrator Dashboard','Oversee organizations, users, assignments, financial activity, support, security events, audit logs, and integration status.',[]]
};
function applyReviewRole(r){
 const c=roleContent[r]||roleContent['Official'];
 currentReviewRole=roleContent[r]?r:'Official';
 delegatedRoleAssignment=false;
 const select=document.getElementById('roleSelect');if(select)select.value=currentReviewRole;
 document.getElementById('dashboardTitle').textContent=c[0];
 document.getElementById('dashboardDescription').textContent=c[1];
 document.getElementById('roleLabel').textContent=currentReviewRole;
 document.getElementById('priorityList').innerHTML=c[2].length?c[2].map((x,i)=>`<div class="priority-item"><span class="num">${String(i+1).padStart(2,'0')}</span><span>${x}</span></div>`).join(''):'<div class="empty-inline">No priority actions.</div>';
 const profileLink=document.getElementById('profileLink');if(profileLink)profileLink.href=currentReviewRole==='Super Administrator'?'../super-admin-profile/index.html':'../user-profile/index.html';
 updateRoleAssignmentAccess();
}
document.getElementById('roleSelect').addEventListener('change',e=>applyReviewRole(e.target.value));
const requestedRole=new URLSearchParams(location.search).get('role');
if(requestedRole==='super-admin'||requestedRole==='Super Administrator')applyReviewRole('Super Administrator'); else applyReviewRole('Official');
const initial=location.hash.slice(1);if(initial&&(initial==='dashboard'||modules[initial]))showView(initial);
