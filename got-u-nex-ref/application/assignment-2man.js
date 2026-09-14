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
  function dateText(v){if(!v)return'Not provided';const d=new Date(`${v}T12:00:00`);return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})}
  function plainDate(v){if(!v)return'Not provided';const d=new Date(`${v}T12:00:00`);return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})}
  function logo(el,name,url){if(url){el.innerHTML=`<img src="${esc(url)}" alt="${esc(name||'Team')} logo">`;return}el.classList.add('fallback');el.innerHTML=`<b>${esc(initials(name))}</b>`}
  function personHtml(p){if(!p)return`<div class="person-photo"><svg><use href="#i-user"/></svg></div><div><strong>Not provided</strong></div>`;const photo=p.photo||p.photoUrl||p.image||'';return`<div class="person-photo">${photo?`<img src="${esc(photo)}" alt="${esc(p.name||'Contact')}">`:`<svg><use href="#i-user"/></svg>`}</div><div><strong>${esc(p.name||'Not provided')}</strong>${p.email?`<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>`:''}${p.phone?`<a href="tel:${esc(p.phone)}">${esc(p.phone)}</a>`:''}</div>`}
  function officialHtml(o,index){const position=o.position||o.role||(index===0?'REFEREE / CREW CHIEF':'UMPIRE');const photo=o.photo||o.photoUrl||o.image||'';const exp=o.experience||o.games||o.gameCount||'';return`<article class="official-card"><div class="official-photo">${photo?`<img src="${esc(photo)}" alt="${esc(o.name||'Official')}">`:`<svg><use href="#i-user"/></svg>`}</div><div class="official-copy"><span>${esc(position)}</span><strong>${esc(o.name||'Official not provided')}</strong>${o.city||o.location?`<p>${esc(o.city||o.location)}</p>`:''}${exp?`<small>${esc(String(exp))}${String(exp).toLowerCase().includes('game')?'':' Games'}</small>`:''}</div></article>`}
  function extra(icon,text){return`<div class="additional-item"><svg><use href="#${icon}"/></svg><span>${esc(text)}</span></div>`}

  if(!a){
    $('#emptyState').hidden=false;
    document.body.style.overflow='hidden';
  }else{
    const t=teams(),date=a.date||a.gameDate||a.dueDate||'',time=a.time||a.gameTime||a.dueTime||'Not provided',status=String(a.status||a.workflowStatus||'').toLowerCase()||'published';
    $('#statusBadge').textContent=status.toUpperCase();$('#statusBadge').classList.add(status);
    $('#summaryTime').textContent=time;$('#summaryDate').textContent=dateText(date);$('#summaryLevel').textContent=a.level||a.classTeam||a.competitionLevel||'Not provided';
    $('#homeSchool').textContent=a.homeSchool||t.home||'Home school not provided';$('#homeName').textContent=(a.homeMascot||a.homeNickname||t.home||'HOME TEAM').toUpperCase();$('#homeRecord').textContent=a.homeRecord||'';
    $('#awaySchool').textContent=a.awaySchool||t.away||'Visiting school not provided';$('#awayName').textContent=(a.awayMascot||a.awayNickname||t.away||'VISITING TEAM').toUpperCase();$('#awayRecord').textContent=a.awayRecord||'';
    logo($('#homeLogo'),t.home,a.homeLogo||a.homeTeamLogo);logo($('#awayLogo'),t.away,a.awayLogo||a.awayTeamLogo);
    $('#factDate').textContent=plainDate(date);$('#factTime').textContent=time;$('#factLocation').textContent=a.venue||a.location||a.siteName||'Not provided';
    const pay=a.pay??a.gamePay??a.fee;$('#factPay').textContent=pay!==undefined&&pay!==null&&pay!==''?(typeof pay==='number'?`$${pay.toFixed(2)}`:String(pay)):'Not provided';$('#factCrew').textContent='2 Officials';
    const venue=a.venue||a.location||a.siteName||'Not provided';$('#venueName').textContent=venue;$('#venueStreet').textContent=a.address||a.venueAddress||a.siteAddress||'';$('#venueCity').textContent=a.cityStateZip||[a.city,a.state,a.postalCode].filter(Boolean).join(', ');
    $('#venuePhone').textContent=a.venuePhone||a.sitePhone||'Not provided';$('#parking').textContent=a.parkingInfo||a.parking||'Parking information not provided';$('#entrance').textContent=a.entranceInfo||a.entrance||'Entrance information not provided';$('#arrival').textContent=a.arrivalInfo||a.arrivalInstructions||'Arrival information not provided';
    if(a.venueImage||a.siteImage){$('#venueImage').src=a.venueImage||a.siteImage;$('#venueImage').hidden=false;$('#venuePlaceholder').hidden=true}
    const officials=(Array.isArray(a.crew)?a.crew:Array.isArray(a.officials)?a.officials:[]).slice(0,2);$('#officialGrid').innerHTML=officials.length?officials.map(officialHtml).join(''):[0,1].map((_,i)=>officialHtml({},i)).join('');
    $('#homeCoach').innerHTML=personHtml(a.homeCoach);$('#awayCoach').innerHTML=personHtml(a.awayCoach||a.visitingCoach);$('#homeAD').innerHTML=personHtml(a.homeAthleticDirector||a.homeAD);$('#awayAD').innerHTML=personHtml(a.awayAthleticDirector||a.visitingAthleticDirector||a.awayAD);
    $('#notes').textContent=a.notes||a.assignmentNotes||'No assignment notes were provided.';
    const additions=[];if(a.concessionsInfo||a.concessions)additions.push(extra('i-concession',a.concessionsInfo||a.concessions));if(a.petPolicy)additions.push(extra('i-no',a.petPolicy));if(a.streamingInfo||a.streaming)additions.push(extra('i-video',a.streamingInfo||a.streaming));$('#additionalInfo').innerHTML=additions.length?additions.join(''):'<div class="additional-item"><svg><use href="#i-info"/></svg><span>No additional information was provided.</span></div>';
  }

  function goBack(){location.href='my-profile.html#assignments'}
  $('#backBtn').addEventListener('click',goBack);$('#emptyBackBtn').addEventListener('click',goBack);
  $('#scheduleBtn').addEventListener('click',()=>location.href='calendar.html');
  $('#detailsBtn').addEventListener('click',()=>toast('You are viewing the complete game assignment details.'));
  $('#mapBtn').addEventListener('click',()=>{if(!a)return;const dest=a.address||a.venueAddress||a.siteAddress||a.venue||a.location;if(!dest)return toast('No venue address is available.');window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dest)}`,'_blank','noopener')});
  $('#downloadBtn').addEventListener('click',()=>{if(!a)return;const t=teams();const text=[`Got U Nex Ref - Published Game Assignment`,``,`${t.home||'Home'} vs ${t.away||'Away'}`,`Date: ${a.date||a.gameDate||a.dueDate||''}`,`Time: ${a.time||a.gameTime||a.dueTime||''}`,`Level: ${a.level||a.classTeam||''}`,`Location: ${a.venue||a.location||''}`,`Address: ${a.address||a.venueAddress||''}`,`Pay: ${a.pay??a.gamePay??a.fee??''}`,`Crew Size: 2`,``,`Notes:`,a.notes||a.assignmentNotes||''].join('\n');const blob=new Blob([text],{type:'text/plain'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`game-assignment-${a.id||'2man'}.txt`;link.click();setTimeout(()=>URL.revokeObjectURL(url),600);toast('Assignment downloaded.')});
})();