import { supabase, requireRole } from '../../assets/auth.js';

(async () => {
  'use strict';

  const session = await requireRole(['site_admin']);
  if (!session) return;

  const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let filter='all',statusFilter='',selectedId='';
  let allReports=[];

  async function load(){
    const { data, error } = await supabase.rpc('admin_list_incidents', { status_filter: null });
    allReports = error ? [] : (data || []).map(r => ({
      id: r.id,
      incidentNumber: r.incident_number,
      category: r.category,
      gameDate: r.game_date,
      incidentDate: r.game_date,
      incidentTime: r.incident_time,
      event: r.event,
      location: r.location,
      submittedByName: r.submitted_by_name,
      submittedAt: r.submitted_at,
      closedAt: r.closed_at,
      status: r.status,
      summary: r.summary,
      details: r.details,
      peopleInvolved: r.people_involved,
      actionsTaken: r.actions_taken,
      adminPublicResponse: r.admin_public_response,
      adminInternalNotes: r.admin_internal_notes,
      attachments: Array.isArray(r.attachments) ? r.attachments : [],
    }));
  }

  function reports(){return allReports}
  function catClass(v){v=String(v||'').toLowerCase();if(v.includes('fight'))return'fight';if(v.includes('altercation'))return'altercation';if(v.includes('player'))return'player';if(v.includes('coach'))return'coach';if(v.includes('spectator'))return'spectator';if(v.includes('facility'))return'facility';if(v.includes('injury'))return'injury';if(v.includes('safety')||v.includes('security'))return'safety';return'other'}
  function catGroup(v){v=String(v||'').toLowerCase();if(v.includes('fight')||v.includes('altercation'))return'fight';if(v.includes('player')||v.includes('coach'))return'conduct';if(v.includes('spectator'))return'spectator';if(v.includes('facility')||v.includes('safety')||v.includes('security')||v.includes('injury'))return'facility';return'other'}
  function statusLabel(s){s=String(s||'under-review').toLowerCase();return s==='closed'?'Closed':s==='needs-info'?'Needs Information':'Under Review'}
  function avgResolution(list){const vals=list.filter(r=>r.status==='closed'&&r.closedAt&&r.submittedAt).map(r=>(new Date(r.closedAt)-new Date(r.submittedAt))/86400000).filter(Number.isFinite);return vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1):'—'}
  function fileSize(n=0){n=Number(n)||0;return n<1024?`${n} B`:n<1048576?`${(n/1024).toFixed(1)} KB`:`${(n/1048576).toFixed(1)} MB`}
  function filtered(){return reports().filter(r=>(filter==='all'||catGroup(r.category)===filter)&&(!statusFilter||r.status===statusFilter)).sort((a,b)=>String(b.submittedAt||'').localeCompare(String(a.submittedAt||'')))}

  async function updateRecord(id,patch){
    const current = allReports.find(r=>r.id===id);
    const nextPublic = patch.adminPublicResponse ?? current?.adminPublicResponse ?? '';
    const nextInternal = patch.adminInternalNotes ?? current?.adminInternalNotes ?? '';
    const nextStatus = patch.status ?? current?.status ?? 'under-review';
    const { error } = await supabase.rpc('admin_update_incident', {
      target_id: id, new_status: nextStatus, public_response: nextPublic, internal_notes: nextInternal,
    });
    if (error) { alert(`Could not update: ${error.message}`); return; }
    await load();
    selectedId=id;
    render();
  }

  function detail(r){const panel=$('#adminIncidentDetail');if(!r){panel.innerHTML='<div class="incident-detail-placeholder"><h3>Select an incident report</h3><p>Review details and update the case status here.</p></div>';return;}const attachments=Array.isArray(r.attachments)?r.attachments:[];panel.innerHTML=`<div class="incident-detail-head"><div><h2>Incident Details</h2><div class="incident-detail-number">${esc(r.incidentNumber||'Incident')}</div></div><span class="incident-status-pill ${esc(r.status)}">${esc(statusLabel(r.status))}</span></div><dl class="incident-detail-list"><div class="incident-detail-row"><dt>Category:</dt><dd><span class="incident-category-pill ${catClass(r.category)}">${esc(r.category||'Not provided')}</span></dd></div><div class="incident-detail-row"><dt>Date / Time:</dt><dd>${esc(r.incidentDate||r.gameDate||'Not provided')} ${r.incidentTime?`• ${esc(r.incidentTime)}`:''}</dd></div><div class="incident-detail-row"><dt>Event:</dt><dd>${esc(r.event||'Not provided')}</dd></div><div class="incident-detail-row"><dt>Location:</dt><dd>${esc(r.location||'Not provided')}</dd></div><div class="incident-detail-row"><dt>Submitted By:</dt><dd>${esc(r.submittedByName||'Official')}</dd></div><div class="incident-detail-row"><dt>Submitted:</dt><dd>${r.submittedAt?esc(new Date(r.submittedAt).toLocaleString('en-US')):'Not provided'}</dd></div></dl><section class="incident-detail-section"><h3>Summary</h3><p>${esc(r.summary||'No summary provided.')}</p></section><section class="incident-detail-section"><h3>Details</h3><p>${esc(r.details||'No detailed narrative provided.')}</p></section>${r.peopleInvolved?`<section class="incident-detail-section"><h3>People Involved</h3><p>${esc(r.peopleInvolved)}</p></section>`:''}${r.actionsTaken?`<section class="incident-detail-section"><h3>Actions Taken</h3><p>${esc(r.actionsTaken)}</p></section>`:''}<section class="incident-detail-section"><h3>Attachments (${attachments.length})</h3><div class="incident-attachment-list">${attachments.length?attachments.map(f=>`<div class="incident-attachment"><span>▤</span><div><strong>${esc(f.name||'Attachment')}</strong><small>${esc(f.type||'File')} • ${esc(fileSize(f.size))}</small></div>${f.dataUrl?`<a href="${esc(f.dataUrl)}" download="${esc(f.name||'attachment')}">⇩</a>`:'<span></span>'}</div>`).join(''):'<p>No attachments submitted.</p>'}</div></section><section class="incident-detail-section"><h3>Super Admin Review</h3><label style="display:grid;gap:7px;color:#c8cdd1">Public response to official<textarea id="incidentPublicResponse" rows="4" style="background:#090c0e;color:#fff;border:1px solid #343a3e;border-radius:7px;padding:10px">${esc(r.adminPublicResponse||'')}</textarea></label><label style="display:grid;gap:7px;color:#c8cdd1;margin-top:10px">Internal supervisor notes<textarea id="incidentInternalNotes" rows="4" style="background:#090c0e;color:#fff;border:1px solid #343a3e;border-radius:7px;padding:10px">${esc(r.adminInternalNotes||'')}</textarea></label></section><div class="incident-detail-actions"><button class="incident-outline-btn" data-admin-incident-action="save-notes" data-id="${esc(r.id)}">Save Review Notes</button><button class="incident-outline-btn" data-admin-incident-action="needs-info" data-id="${esc(r.id)}">Request More Information</button><button class="incident-outline-btn" data-admin-incident-action="under-review" data-id="${esc(r.id)}">Mark Under Review</button><button class="incident-primary-btn" data-admin-incident-action="closed" data-id="${esc(r.id)}">Close Report</button></div>`}
  function render(){const list=reports();$('#adminIncidentTotal').textContent=list.length;$('#adminIncidentReview').textContent=list.filter(r=>r.status==='under-review'||r.status==='needs-info').length;$('#adminIncidentClosed').textContent=list.filter(r=>r.status==='closed').length;$('#adminIncidentAverage').textContent=avgResolution(list);$$('[data-admin-incident-filter]').forEach(b=>b.classList.toggle('active',b.dataset.adminIncidentFilter===filter));$('#adminIncidentStatus').value=statusFilter;const rows=filtered();$('#adminIncidentBody').innerHTML=rows.map(r=>`<tr class="${selectedId===r.id?'is-selected':''}" data-admin-incident-select="${esc(r.id)}"><td><strong>${esc(r.incidentNumber||'—')}</strong></td><td>${esc(r.gameDate||r.incidentDate||'—')}${r.incidentTime?`<br><small>${esc(r.incidentTime)}</small>`:''}</td><td><span class="incident-category-pill ${catClass(r.category)}">${esc(r.category||'Not provided')}</span></td><td>${esc(r.event||'Not provided')}</td><td>${esc(r.submittedByName||'Official')}</td><td><span class="incident-status-pill ${esc(r.status)}">${esc(statusLabel(r.status))}</span></td><td><button class="incident-eye-btn" data-admin-incident-select="${esc(r.id)}">◉</button></td></tr>`).join('');$('#adminIncidentEmpty').hidden=rows.length>0;$('#adminIncidentShowing').textContent=rows.length?`Showing ${rows.length} report${rows.length===1?'':'s'}`:'Showing 0 reports';const selected=list.find(r=>r.id===selectedId)||rows[0]||null;if(selected&&!selectedId)selectedId=selected.id;detail(selected)}

  document.addEventListener('click',async e=>{const tab=e.target.closest('[data-admin-incident-filter]');if(tab){filter=tab.dataset.adminIncidentFilter;render();return}const row=e.target.closest('[data-admin-incident-select]');if(row){selectedId=row.dataset.adminIncidentSelect;render();return}const action=e.target.closest('[data-admin-incident-action]');if(action){const id=action.dataset.id,type=action.dataset.adminIncidentAction,publicResponse=$('#incidentPublicResponse')?.value||'',internal=$('#incidentInternalNotes')?.value||'';if(type==='save-notes')await updateRecord(id,{adminPublicResponse:publicResponse,adminInternalNotes:internal});if(type==='needs-info')await updateRecord(id,{status:'needs-info',adminPublicResponse:publicResponse,adminInternalNotes:internal});if(type==='under-review')await updateRecord(id,{status:'under-review',adminPublicResponse:publicResponse,adminInternalNotes:internal});if(type==='closed')await updateRecord(id,{status:'closed',adminPublicResponse:publicResponse,adminInternalNotes:internal});return}});
  $('#adminIncidentStatus')?.addEventListener('change',e=>{statusFilter=e.target.value;render()});

  await load();
  render();
})();
