import { supabase, getSession } from '../../assets/auth.js';

const session = await getSession();
if (!session) { window.location.href = '/account/index.html?view=signin'; }
else (async () => {
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const params=new URLSearchParams(location.search);
  const id=params.get('id')||sessionStorage.getItem('gotUNexRef.selectedAssignmentId')||'';
  let a=null;
  if (id) {
    const { data: detail, error } = await supabase.rpc('official_get_assignment_detail', { target_assignment_officials_id: id });
    if (!error && detail) {
      a = {
        id: detail.assignment_officials_id,
        status: detail.my_status === 'assigned' ? 'published' : detail.my_status,
        date: detail.game_date, time: detail.game_time,
        level: detail.level,
        homeSchool: detail.home_team_name, homeTeam: detail.home_team_name,
        awaySchool: detail.visiting_team_name, awayTeam: detail.visiting_team_name,
        venue: detail.venue_name, address: detail.venue_address, venuePhone: detail.venue_phone,
        pay: typeof detail.my_pay_cents === 'number' ? detail.my_pay_cents/100 : undefined,
        notes: detail.notes,
        crew: (detail.crew||[]).map(c=>({name:c.name, position:c.position})),
      };
    }
  }
  let toastTimer=null;

  function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),1800)}
  function teams(){
    const home=a.homeTeam||a.homeSchool||a.teamHome||'';
    const away=a.awayTeam||a.awaySchool||a.teamAway||'';
    if(home||away)return{home,away};
    const m=String(a.matchup||a.title||'').match(/^(.*?)\s+(?:vs\.?|versus)\s+(.*?)$/i);
    return m?{home:m[1].trim(),away:m[2].trim()}:{home:'',away:''};
  }
  function initials(name){return String(name||'').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'—'}
  function dateText(v){
    if(!v)return'Not provided';
    const d=new Date(`${v}T12:00:00`);
    return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
  }
  function shortDate(v){
    if(!v)return'Not provided';
    const d=new Date(`${v}T12:00:00`);
    return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  }
  function logo(el,name,url){
    if(url){el.innerHTML=`<img src="${esc(url)}" alt="${esc(name||'Team')} logo">`;return}
    el.classList.add('fallback');el.innerHTML=`<b>${esc(initials(name))}</b>`;
  }
  function personHtml(p){
    if(!p)return`<div class="person-photo"><svg><use href="#i-user"/></svg></div><div><strong>Not provided</strong></div>`;
    const photo=p.photo||p.photoUrl||p.image||'';
    return`<div class="person-photo">${photo?`<img src="${esc(photo)}" alt="${esc(p.name||'Contact')}">`:`<svg><use href="#i-user"/></svg>`}</div><div><strong>${esc(p.name||'Not provided')}</strong>${p.email?`<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>`:''}${p.phone?`<a href="tel:${esc(p.phone)}">${esc(p.phone)}</a>`:''}</div>`;
  }
  function officialHtml(o,index,isAlternate=false){
    const defaults=['REFEREE','UMPIRE 1','UMPIRE 2'];
    const position=o.position||o.role||(isAlternate?'ALTERNATE':defaults[index]||'OFFICIAL');
    const photo=o.photo||o.photoUrl||o.image||'';
    const exp=o.experience||o.games||o.gameCount||'';
    return`<article class="official-card">
      <div class="official-photo">${photo?`<img src="${esc(photo)}" alt="${esc(o.name||'Official')}">`:`<svg><use href="#i-user"/></svg>`}</div>
      <div class="official-copy">
        <span>${esc(position)}</span>
        <strong>${esc(o.name||'Official not provided')}</strong>
        ${o.city||o.location?`<p>${esc(o.city||o.location)}</p>`:''}
        ${exp?`<small>${esc(String(exp))}${String(exp).toLowerCase().includes('game')?'':' Games'}</small>`:''}
      </div>
    </article>`;
  }
  function extra(icon,text){return`<div class="additional-item"><svg><use href="#${icon}"/></svg><span>${esc(text)}</span></div>`}
  function getCrew(){
    const raw=Array.isArray(a.crew)?a.crew:Array.isArray(a.officials)?a.officials:[];
    const alternates=raw.filter(o=>String(o.position||o.role||'').toLowerCase().includes('alternate'));
    const active=raw.filter(o=>!String(o.position||o.role||'').toLowerCase().includes('alternate')).slice(0,3);
    return {active,alternate:alternates[0]||a.alternate||null};
  }
  function downloadAssignment(){
    if(!a)return;
    const t=teams(),crew=getCrew();
    const lines=[
      'Got U Nex Ref - Published Game Assignment (3-Man Crew)','',
      `${t.home||'Home'} vs ${t.away||'Away'}`,
      `Date: ${a.date||a.gameDate||a.dueDate||''}`,
      `Time: ${a.time||a.gameTime||a.dueTime||''}`,
      `Level: ${a.level||a.classTeam||a.competitionLevel||''}`,
      `Location: ${a.venue||a.location||a.siteName||''}`,
      `Address: ${a.address||a.venueAddress||a.siteAddress||''}`,
      `Pay: ${a.pay??a.gamePay??a.fee??''}`,
      `Assigned: ${a.assignedDate||a.createdAt||''}`,
      '',
      'Officials:',
      ...crew.active.map((o,i)=>`${['Referee','Umpire 1','Umpire 2'][i]}: ${o.name||''}`),
      ...(crew.alternate?[`Alternate: ${crew.alternate.name||''}`]:[]),
      '',
      'Assignment Notes:',
      a.notes||a.assignmentNotes||''
    ];
    const blob=new Blob([lines.join('\n')],{type:'text/plain'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=`game-assignment-${a.id||'3man'}.txt`;link.click();
    setTimeout(()=>URL.revokeObjectURL(url),600);toast('Assignment downloaded.');
  }

  if(!a){
    $('#emptyState').hidden=false;
    document.body.style.overflow='hidden';
  }else{
    const t=teams();
    const date=a.date||a.gameDate||a.dueDate||'';
    const time=a.time||a.gameTime||a.dueTime||'Not provided';
    const status=String(a.status||a.workflowStatus||'').toLowerCase()||'published';
    const level=a.level||a.classTeam||a.competitionLevel||'Not provided';

    $('#statusBadge').textContent=status.toUpperCase();$('#statusBadge').classList.add(status);
    $('#summaryTime').textContent=time;$('#summaryDate').textContent=dateText(date);$('#summaryLevel').textContent=level;

    $('#homeSchool').textContent=a.homeSchool||t.home||'Home school not provided';
    $('#homeName').textContent=(a.homeMascot||a.homeNickname||t.home||'HOME TEAM').toUpperCase();
    $('#homeRecord').textContent=a.homeRecord||'';

    $('#awaySchool').textContent=a.awaySchool||t.away||'Visiting school not provided';
    $('#awayName').textContent=(a.awayMascot||a.awayNickname||t.away||'VISITING TEAM').toUpperCase();
    $('#awayRecord').textContent=a.awayRecord||'';

    logo($('#homeLogo'),t.home,a.homeLogo||a.homeTeamLogo);
    logo($('#awayLogo'),t.away,a.awayLogo||a.awayTeamLogo);

    $('#factDate').textContent=dateText(date);
    $('#factTime').textContent=time;
    $('#factLevel').textContent=level;
    $('#factLocation').textContent=a.venue||a.location||a.siteName||'Not provided';

    const pay=a.pay??a.gamePay??a.fee;
    $('#factPay').textContent=pay!==undefined&&pay!==null&&pay!==''?(typeof pay==='number'?`$${pay.toFixed(2)}`:String(pay)):'Not provided';
    $('#factCrew').textContent='3 Officials';
    $('#factAssigned').textContent=shortDate(a.assignedDate||a.assignmentDate||a.createdAt||'');

    const venue=a.venue||a.location||a.siteName||'Not provided';
    $('#venueName').textContent=venue;
    $('#venueStreet').textContent=a.address||a.venueAddress||a.siteAddress||'';
    $('#venueCity').textContent=a.cityStateZip||[a.city,a.state,a.postalCode].filter(Boolean).join(', ');
    $('#venuePhone').textContent=a.venuePhone||a.sitePhone||'Not provided';
    $('#parking').textContent=a.parkingInfo||a.parking||'Parking information not provided';
    $('#entrance').textContent=a.entranceInfo||a.entrance||'Entrance information not provided';
    $('#arrival').textContent=a.arrivalInfo||a.arrivalInstructions||'Arrival information not provided';

    if(a.venueImage||a.siteImage){
      $('#venueImage').src=a.venueImage||a.siteImage;
      $('#venueImage').hidden=false;
      $('#venuePlaceholder').hidden=true;
    }

    const crew=getCrew();
    const active=[0,1,2].map((_,i)=>crew.active[i]||{});
    const grid=$('#officialGrid');
    grid.innerHTML=active.map((o,i)=>officialHtml(o,i,false)).join('')+(crew.alternate?officialHtml(crew.alternate,3,true):'');
    grid.classList.toggle('has-alternate',!!crew.alternate);

    $('#homeCoach').innerHTML=personHtml(a.homeCoach);
    $('#awayCoach').innerHTML=personHtml(a.awayCoach||a.visitingCoach);
    $('#homeAD').innerHTML=personHtml(a.homeAthleticDirector||a.homeAD);
    $('#awayAD').innerHTML=personHtml(a.awayAthleticDirector||a.visitingAthleticDirector||a.awayAD);

    $('#notes').textContent=a.notes||a.assignmentNotes||'No assignment notes were provided.';

    const additions=[];
    if(a.concessionsInfo||a.concessions)additions.push(extra('i-concession',a.concessionsInfo||a.concessions));
    if(a.petPolicy)additions.push(extra('i-no',a.petPolicy));
    if(a.streamingInfo||a.streaming)additions.push(extra('i-video',a.streamingInfo||a.streaming));
    $('#additionalInfo').innerHTML=additions.length?additions.join(''):'<div class="additional-item"><svg><use href="#i-info"/></svg><span>No additional information was provided.</span></div>';
  }

  function goBack(){location.href='my-profile.html#assignments'}
  $('#backBtn').addEventListener('click',goBack);
  $('#emptyBackBtn').addEventListener('click',goBack);
  $('#scheduleBtn').addEventListener('click',()=>location.href='calendar.html');
  $('#downloadTopBtn').addEventListener('click',downloadAssignment);
  $('#mapBtn').addEventListener('click',()=>{
    if(!a)return;
    const dest=a.address||a.venueAddress||a.siteAddress||a.venue||a.location;
    if(!dest)return toast('No venue address is available.');
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest)}`,'_blank','noopener');
  });
})();