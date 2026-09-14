(() => {
  'use strict';

  const STORAGE_KEY = 'gotUNexRef.adminDashboard.v1';
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  const ROLE_DEFS = [
    {id:'official',label:'Official',icon:'i-role',permissions:['dashboard','assignments','payments','documents','lab','tax-center','shop','notifications']},
    {id:'assignor',label:'Assignor',icon:'i-people',permissions:['dashboard','assignments','payments','documents','whiteboard','lab','reports','notifications']},
    {id:'school-admin',label:'School Admin',icon:'i-building',permissions:['dashboard','assignments','payments','documents','tax-center','reports','notifications','forms']},
    {id:'website-admin',label:'Admin (Website)',icon:'i-badge',permissions:['dashboard','assignments','payments','documents','whiteboard','lab','tax-center','shop','reports','notifications','user-management','forms']},
    {id:'coach',label:'Coach',icon:'i-coach',permissions:['dashboard','assignments','documents','lab','notifications']},
    {id:'athletic-director',label:'AD',icon:'i-shield',permissions:['dashboard','assignments','payments','documents','reports','notifications']},
    {id:'vendor',label:'Vendor',icon:'i-store',permissions:['dashboard','payments','documents','shop','notifications']},
    {id:'tournament-director',label:'Tournament Director',icon:'i-building',permissions:['dashboard','assignments','payments','documents','reports','notifications']},
    {id:'super-admin',label:'Super Admin',icon:'i-crown',permissions:['dashboard','assignments','payments','documents','whiteboard','lab','tax-center','shop','reports','notifications','user-management','forms']}
  ];

  const PERMISSIONS = [
    {id:'dashboard',label:'Dashboard Access'},
    {id:'assignments',label:'Assignments'},
    {id:'payments',label:'Payments'},
    {id:'documents',label:'Documents'},
    {id:'whiteboard',label:'Whiteboard'},
    {id:'lab',label:'Lab'},
    {id:'tax-center',label:'Tax Center'},
    {id:'shop',label:'Shop'},
    {id:'reports',label:'Reports'},
    {id:'notifications',label:'Notifications'},
    {id:'user-management',label:'User Management'},
    {id:'forms',label:'Forms'}
  ];

  const STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming','District of Columbia'];

  const emptyState = {users:[],drafts:[],options:{organizations:[],schoolsTeams:[],departments:[]}};
  let state = loadState();
  let selectedRole = 'official';
  let photoDataUrl = '';
  let toastTimer = null;

  function loadState(){
    try{
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      return saved && typeof saved === 'object'
        ? {...emptyState,...saved,options:{...emptyState.options,...(saved.options||{})}}
        : JSON.parse(JSON.stringify(emptyState));
    }catch{return JSON.parse(JSON.stringify(emptyState));}
  }

  function persist(action,payload={}){
    localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('gotunexref:admin-action',{detail:{action,payload,timestamp:new Date().toISOString()}}));
  }

  function toast(message){
    const el=$('#toast'); el.textContent=message; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),1900);
  }

  function roleDef(){return ROLE_DEFS.find(r=>r.id===selectedRole)||ROLE_DEFS[0];}
  function initials(){const a=$('#firstName').value.trim()[0]||'';const b=$('#lastName').value.trim()[0]||'';return (a+b).toUpperCase()||'—';}
  function textOr(value,fallback){return value && String(value).trim()?String(value).trim():fallback;}
  function selectedText(select,fallback){return select.value?select.options[select.selectedIndex]?.text||select.value:fallback;}

  function renderRoles(){
    $('#roleButtons').innerHTML=ROLE_DEFS.map(r=>`<button type="button" class="role-btn ${r.id===selectedRole?'active':''}" data-role="${r.id}" role="radio" aria-checked="${r.id===selectedRole}"><svg><use href="#${r.icon}"/></svg><span>${r.label}</span></button>`).join('');
  }

  function renderPermissions(){
    const defaults=new Set(roleDef().permissions);
    $('#permissionGrid').innerHTML=PERMISSIONS.map(p=>`<label class="permission-item"><input type="checkbox" data-permission="${p.id}" ${defaults.has(p.id)?'checked':''}><i></i><span>${p.label}</span></label>`).join('');
    updatePermissionSummary();
  }

  function enabledPermissions(){return $$('[data-permission]:checked').map(input=>input.dataset.permission);}
  function updatePermissionSummary(){
    const enabled=new Set(enabledPermissions());
    $('#permissionsEnabled').textContent=`${enabled.size} of ${PERMISSIONS.length} Enabled`;
    $('#permissionSummary').innerHTML=PERMISSIONS.map(p=>`<div class="summary-perm ${enabled.has(p.id)?'':'disabled'}"><i>${enabled.has(p.id)?'✓':'–'}</i><span>${p.label}</span></div>`).join('');
  }

  function populateSelect(select,items,placeholder,allowCustom=false){
    const current=select.value;
    select.innerHTML=`<option value="">${placeholder}</option>`+items.map(item=>{
      const value=typeof item==='string'?item:(item.id||item.value||item.name||'');
      const label=typeof item==='string'?item:(item.name||item.label||value);
      return `<option value="${escapeAttr(value)}">${escapeHtml(label)}</option>`;
    }).join('')+(allowCustom?'<option value="__custom__">+ Add new…</option>':'');
    if([...select.options].some(o=>o.value===current)) select.value=current;
  }

  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function escapeAttr(v){return escapeHtml(v);}

  function hydrateOptions(){
    populateSelect($('#organization'),state.options.organizations||[],'Select organization',true);
    populateSelect($('#schoolTeam'),state.options.schoolsTeams||[],'Select school or team',true);
    populateSelect($('#department'),state.options.departments||[],'Select department',true);
    populateSelect($('#stateSelect'),STATES,'Select state');
  }

  async function loadBackendOptions(){
    if(window.GotUNexRefAdminAPI?.getAddUserOptions){
      try{
        const result=await window.GotUNexRefAdminAPI.getAddUserOptions();
        if(result?.data){
          state.options={...state.options,...result.data};
          localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
          hydrateOptions();
        }
      }catch(err){console.error(err);}
    }
  }

  function handleCustomSelect(select,key,label){
    if(select.value!=='__custom__')return false;
    const entered=prompt(`Enter ${label}:`);
    if(!entered?.trim()){select.value='';return true;}
    const value=entered.trim();
    const list=state.options[key]||(state.options[key]=[]);
    if(!list.some(item=>String(typeof item==='string'?item:(item.name||item.label||item.value||item.id||'')).toLowerCase()===value.toLowerCase())) list.push(value);
    localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
    hydrateOptions();
    select.value=value;
    updatePreview();
    return true;
  }

  function usernameSuggestion(){
    const first=$('#firstName').value.trim().toLowerCase().replace(/[^a-z0-9]/g,'');
    const last=$('#lastName').value.trim().toLowerCase().replace(/[^a-z0-9]/g,'');
    return first && last ? `${first}.${last}` : first || last;
  }

  function updatePreview(){
    const name=[ $('#firstName').value.trim(), $('#lastName').value.trim() ].filter(Boolean).join(' ');
    $('#previewName').textContent=name||'No name entered';
    $('#previewRole').textContent=roleDef().label;
    $('#previewStatus').textContent=$('#accountActive').checked?'Active':'Inactive';
    $('#previewStatus').style.color=$('#accountActive').checked?'#63d26d':'#ff625b';
    $('#previewEmail').textContent=textOr($('#email').value,'Email not provided');
    $('#previewPhone').textContent=textOr($('#mobilePhone').value,'Phone not provided');
    $('#previewOrganization').textContent=selectedText($('#organization'),'Not selected');
    $('#previewPosition').textContent=textOr($('#positionTitle').value,'Not provided');
    $('#previewDepartment').textContent=selectedText($('#department'),'Not selected');
    $('#previewUsername').textContent=textOr($('#username').value,'Not provided');
    $('#accountStatusLabel').textContent=$('#accountActive').checked?'Active':'Inactive';
    $('#accountStatusLabel').style.color=$('#accountActive').checked?'#63d26d':'#ff625b';
    $('#inviteEmailSummary').textContent=$('#sendInvite').checked?'Yes':'No';
    $('#deliveryMethod').textContent=$('#sendInvite').checked?'Email':'None';
    const emailValid=$('#email').validity.valid && !!$('#email').value;
    $('#inviteStatus').textContent=$('#sendInvite').checked && emailValid?'Pending':'Not Scheduled';
    $('#inviteMessage').textContent=$('#sendInvite').checked
      ? (emailValid?`An invitation email will be prepared for ${$('#email').value.trim()} with login instructions and a temporary password.`:'Enter a valid email address to prepare the invitation.')
      : 'Invite email delivery is disabled for this user.';

    const init=initials(); $('#previewInitials').textContent=init; $('#photoInitials').textContent=init;
    if(photoDataUrl){
      $('#previewAvatar').innerHTML=`<img src="${photoDataUrl}" alt="User profile preview">`;
      $('#photoPreview').innerHTML=`<img src="${photoDataUrl}" alt="Selected profile photo">`;
    }else{
      $('#previewAvatar').innerHTML=`<span id="previewInitials">${init}</span>`;
      $('#photoPreview').innerHTML=`<span id="photoInitials">${init}</span>`;
    }
  }

  function generatePassword(){
    const chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
    const bytes=new Uint32Array(16); crypto.getRandomValues(bytes);
    return Array.from(bytes,n=>chars[n%chars.length]).join('');
  }

  function formData(){
    return {
      id:`user-${crypto.randomUUID?.()||Date.now()}`,
      role:selectedRole, roleLabel:roleDef().label,
      firstName:$('#firstName').value.trim(), lastName:$('#lastName').value.trim(),
      email:$('#email').value.trim(), mobilePhone:$('#mobilePhone').value.trim(), alternatePhone:$('#alternatePhone').value.trim(), dateOfBirth:$('#dateOfBirth').value,
      organization:$('#organization').value, organizationLabel:selectedText($('#organization'),''), schoolTeam:$('#schoolTeam').value, schoolTeamLabel:selectedText($('#schoolTeam'),''), department:$('#department').value, departmentLabel:selectedText($('#department'),''), positionTitle:$('#positionTitle').value.trim(),
      address:{street:$('#street').value.trim(),city:$('#city').value.trim(),state:$('#stateSelect').value,zipCode:$('#zipCode').value.trim()},
      permissions:enabledPermissions(), username:$('#username').value.trim(), temporaryPassword:$('#temporaryPassword').value,
      security:{sendInviteEmail:$('#sendInvite').checked,requirePasswordReset:$('#requireReset').checked,twoFactorAuthentication:$('#twoFactor').checked,accountActive:$('#accountActive').checked},
      profilePhoto:photoDataUrl, notes:$('#internalNotes').value.trim(), createdAt:new Date().toISOString()
    };
  }

  function validate(){
    const form=$('#addUserForm');
    if(!form.checkValidity()){form.reportValidity();return false;}
    if(!selectedRole){toast('Select a user role.');return false;}
    const data=formData();
    if(state.users.some(u=>u.email.toLowerCase()===data.email.toLowerCase())){toast('A user with this email already exists.');return false;}
    if(state.users.some(u=>u.username.toLowerCase()===data.username.toLowerCase())){toast('This username is already in use.');return false;}
    return true;
  }

  function saveDraft(){
    const draft=formData(); draft.id=`draft-${Date.now()}`; draft.savedAt=new Date().toISOString();
    state.drafts=[draft,...(state.drafts||[])].slice(0,20); persist('userDraftSaved',{draft});
    if(window.GotUNexRefAdminAPI?.saveUserDraft) Promise.resolve(window.GotUNexRefAdminAPI.saveUserDraft({draft})).catch(console.error);
    toast('User draft saved.');
  }

  async function createUser(sendInvite){
    if(!validate())return;
    const data=formData(); data.invitation={requested:!!sendInvite,status:sendInvite?'pending':'not-scheduled',deliveryMethod:sendInvite?'email':'none'};
    state.users.unshift(data); persist(sendInvite?'userCreatedAndInviteRequested':'userCreated',{user:data});
    try{
      if(window.GotUNexRefAdminAPI?.createUser) await window.GotUNexRefAdminAPI.createUser({user:data});
      if(sendInvite && window.GotUNexRefAdminAPI?.sendUserInvite) await window.GotUNexRefAdminAPI.sendUserInvite({userId:data.id,email:data.email,temporaryPassword:data.temporaryPassword,requirePasswordReset:data.security.requirePasswordReset});
    }catch(err){console.error(err); toast('User was saved locally, but the backend action needs attention.'); return;}
    $('#resultTitle').textContent=sendInvite?'User Created & Invite Requested':'User Created';
    $('#resultMessage').textContent=sendInvite?`The user record was created and the invitation workflow was requested for ${data.email}.`:'The user record was created without sending an invitation.';
    $('#resultDialog').showModal();
  }

  function readPhoto(file){
    if(!file)return; if(file.size>5*1024*1024){toast('Profile photo must be 5MB or smaller.');return;}
    if(!/^image\/(jpeg|png|gif|webp)$/.test(file.type)){toast('Choose a JPG, PNG, GIF, or WEBP image.');return;}
    const reader=new FileReader(); reader.onload=()=>{photoDataUrl=reader.result;updatePreview();}; reader.readAsDataURL(file);
  }

  function bind(){
    document.addEventListener('click',e=>{
      const role=e.target.closest('[data-role]'); if(role){selectedRole=role.dataset.role;renderRoles();renderPermissions();updatePreview();return;}
      const nav=e.target.closest('[data-admin-nav]'); if(nav){
        const destination=nav.dataset.adminNav;
        window.dispatchEvent(new CustomEvent('gotunexref:admin-navigation',{detail:{destination}}));
        const routes={home:'admin-dashboard.html',assignments:'admin-dashboard.html#assignments',schools:'admin-dashboard.html#schools',payments:'admin-dashboard.html#payments',resources:'admin-dashboard.html#resources',shop:'admin-dashboard.html#shop',support:'admin-dashboard.html#support'};
        if(routes[destination]){location.href=routes[destination];return;}
        toast(`${nav.textContent.trim()} navigation selected.`);return;
      }
    });
    document.addEventListener('input',e=>{
      if(e.target.matches('#firstName,#lastName')){
        if(!$('#username').dataset.manual){$('#username').value=usernameSuggestion();}
      }
      if(e.target.id==='username') $('#username').dataset.manual='true';
      if(e.target.id==='internalNotes') $('#notesCount').textContent=String(e.target.value.length);
      updatePreview();
    });
    document.addEventListener('change',e=>{
      if(e.target.id==='organization' && handleCustomSelect(e.target,'organizations','organization name'))return;
      if(e.target.id==='schoolTeam' && handleCustomSelect(e.target,'schoolsTeams','school or team name'))return;
      if(e.target.id==='department' && handleCustomSelect(e.target,'departments','department name'))return;
      if(e.target.matches('[data-permission]')) updatePermissionSummary();
      if(e.target.id==='profilePhoto') readPhoto(e.target.files?.[0]);
      updatePreview();
    });
    $('#togglePassword').addEventListener('click',()=>{const input=$('#temporaryPassword');input.type=input.type==='password'?'text':'password';});
    $('#temporaryPassword').addEventListener('focus',()=>{if(!$('#temporaryPassword').value){$('#temporaryPassword').value=generatePassword();updatePreview();}});
    $('#saveDraftBtn').addEventListener('click',saveDraft);
    $('#createUserBtn').addEventListener('click',()=>createUser(false));
    $('#createInviteBtn').addEventListener('click',()=>{if(!$('#sendInvite').checked){$('#sendInvite').checked=true;updatePreview();}createUser(true);});
    $('#backToUsers').addEventListener('click',()=>{window.dispatchEvent(new CustomEvent('gotunexref:admin-navigation',{detail:{destination:'users'}})); location.href='admin-users.html';});
    const zone=$('#uploadZone');
    ['dragenter','dragover'].forEach(type=>zone.addEventListener(type,e=>{e.preventDefault();zone.classList.add('dragover');}));
    ['dragleave','drop'].forEach(type=>zone.addEventListener(type,e=>{e.preventDefault();zone.classList.remove('dragover');}));
    zone.addEventListener('drop',e=>readPhoto(e.dataTransfer.files?.[0]));
  }

  window.addEventListener('gotunexref:admin-sync',e=>{
    if(!e.detail)return; state={...state,...e.detail,options:{...state.options,...(e.detail.options||{})}};localStorage.setItem(STORAGE_KEY,JSON.stringify(state));hydrateOptions();updatePreview();
  });

  renderRoles(); renderPermissions(); hydrateOptions(); bind(); updatePreview(); loadBackendOptions();
})();
