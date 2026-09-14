import { supabase, requireRole } from '../../assets/auth.js';

const session = await requireRole(['site_admin']);
// requireRole already redirects unauthorized visitors away; guard below just
// avoids firing RPCs during that brief navigation.

const $=(s,r=document)=>r.querySelector(s);
function dateISO(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function rangeDates(mode){const now=new Date();now.setHours(0,0,0,0);let start=new Date(now),end=new Date(now);if(mode==='month'){start=new Date(now.getFullYear(),now.getMonth(),1);end=new Date(now.getFullYear(),now.getMonth()+1,0)}else{const days=Number(mode)||28;end.setDate(end.getDate()+days-1)}const out=[];for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1))out.push(dateISO(d));return out}
function pct(n,d){return d?Math.round((n/d)*100):0}

let officials = [];
let dayStatusByOfficial = {}; // { officialId: { date: status } }

async function loadData(){
  const dates = rangeDates($('#filterDateRange')?.value || '28');
  const [officialsRes, daysRes] = await Promise.all([
    supabase.rpc('admin_list_officials', { search_text: null }),
    supabase.rpc('admin_list_availability_days', { date_from: dates[0], date_to: dates[dates.length-1] }),
  ]);
  officials = officialsRes.data || [];
  dayStatusByOfficial = {};
  (daysRes.data || []).forEach(row => {
    dayStatusByOfficial[row.official_id] = dayStatusByOfficial[row.official_id] || {};
    dayStatusByOfficial[row.official_id][row.date] = row.status;
  });
}

function reportRecords(){
  const dates=rangeDates($('#filterDateRange')?.value||'28');
  return officials.filter(u => u.approved_role === 'official').map(u=>{
    const byDate = dayStatusByOfficial[u.id] || {};
    let available=0,unavailable=0,pending=0;
    dates.forEach(date=>{
      const s = byDate[date] || 'pending';
      if(s==='available'||s==='preferred')available++;
      else if(s==='unavailable'||s==='partial')unavailable++;
      else pending++;
    });
    const today = byDate[dateISO(new Date())] || 'pending';
    const status = today==='unavailable'?'Unavailable':(today==='available'||today==='preferred')?'Available':'Pending';
    return{
      id: u.id,
      name: [u.first_name,u.last_name].filter(Boolean).join(' ')||u.email||'Official',
      city: '',
      type: 'Official',
      level: u.preferred_level || 'Not Set',
      gender: 'Not Set',
      available, unavailable, pending, total: dates.length,
      status, updated: '', photo: 'assets/profile-placeholder.svg',
    };
  });
}

function fillSelect(id,values,allLabel){const el=$(id);const current=el.value;const vals=[...new Set(values.filter(Boolean))].sort();el.innerHTML=`<option>${allLabel}</option>`+vals.map(v=>`<option>${v}</option>`).join('');if([...el.options].some(o=>o.value===current))el.value=current}
function renderStats(data){const available=data.reduce((a,b)=>a+b.available,0),unavailable=data.reduce((a,b)=>a+b.unavailable,0),pending=data.reduce((a,b)=>a+b.pending,0),officials=data.length;const avg=officials?Math.round(available/officials):0;const total=available+unavailable+pending;const cards=[['stat-green','AVAILABLE',available,`${pct(available,total)}%`,'i-calendar'],['stat-red','UNAVAILABLE',unavailable,`${pct(unavailable,total)}%`,'i-calendar'],['stat-yellow','PENDING',pending,`${pct(pending,total)}%`,'i-clock'],['stat-white','TOTAL OFFICIALS',officials,'','i-user'],['stat-blue','AVG. AVAILABLE / OFFICIAL',avg,'SELECTED RANGE','i-calendar']];$('#statsGrid').innerHTML=cards.map(([cls,label,val,small,icon])=>`<article class="stat-card ${cls}"><div class="stat-icon"><svg><use href="#${icon}"></use></svg></div><div class="stat-copy"><strong>${label}</strong><b>${val}</b>${small?`<small>${small}</small>`:''}</div></article>`).join('')}
function formattedUpdated(v){if(!v)return'Not yet reported';const d=new Date(v);return Number.isNaN(d.getTime())?v:d.toLocaleString()}
function row(r){return `<tr><td><div class="official-cell"><div class="official-avatar"><img src="${r.photo}" alt=""></div><div class="official-meta"><strong>${r.name}</strong><span>${r.city||'Location not provided'}</span></div></div></td><td>${r.type}</td><td>${r.level}</td><td>${r.gender}</td><td class="value-green">${r.available} (${pct(r.available,r.total)}%)</td><td class="value-red">${r.unavailable} (${pct(r.unavailable,r.total)}%)</td><td class="value-yellow">${r.pending} (${pct(r.pending,r.total)}%)</td><td>${r.total}</td><td><span class="status-pill ${r.status.toLowerCase()}">${r.status}</span></td><td>${formattedUpdated(r.updated)}</td></tr>`}

function applyFilters(){
  const all=reportRecords();
  fillSelect('#filterLevel',all.map(r=>r.level),'All Levels');
  fillSelect('#filterGender',all.map(r=>r.gender),'All Genders');
  fillSelect('#filterType',all.map(r=>r.type),'All Types');
  const q=$('#filterSearch').value.trim().toLowerCase(),level=$('#filterLevel').value,gender=$('#filterGender').value,type=$('#filterType').value,status=$('#filterStatus').value;
  const data=all.filter(r=>{
    if(level!=='All Levels'&&r.level!==level)return false;
    if(gender!=='All Genders'&&r.gender!==gender)return false;
    if(type!=='All Types'&&r.type!==type)return false;
    if(status!=='All Statuses'&&r.status!==status)return false;
    if(q&&!(r.name+' '+r.city+' '+r.type+' '+r.level).toLowerCase().includes(q))return false;
    return true;
  });
  $('#reportRows').innerHTML=data.map(row).join('');
  $('#tableSummary').textContent=data.length?`Showing 1 to ${data.length} of ${data.length} officials`:'No officials match the current filters';
  renderStats(data.length?data:all);
}

async function refresh(){ await loadData(); applyFilters(); }

['filterLevel','filterGender','filterType','filterStatus','filterSearch'].forEach(id=>$('#'+id).addEventListener(id==='filterSearch'?'input':'change',applyFilters));
$('#filterDateRange').addEventListener('change', refresh);
$('#exportExcelBtn').addEventListener('click',()=>{const rows=reportRecords();const csv=[['Official','Location','Type','Level','Gender','Available','Unavailable','Pending','Total','Status','Last Updated'],...rows.map(r=>[r.name,r.city,r.type,r.level,r.gender,r.available,r.unavailable,r.pending,r.total,r.status,formattedUpdated(r.updated)])].map(row=>row.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='availability-report.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),0)});
$('#printReportBtn').addEventListener('click',()=>window.print());

if (session) await refresh();
