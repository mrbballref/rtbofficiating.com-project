(()=>{
'use strict';
const LEGACY_KEY='gunr-dashboard-state-v3';
const ADMIN_KEY='gotUNexRef.adminDashboard.v1';
const ASSIGN_KEY='gotUNexRef.adminAssignments.v1';
const parse=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')||fallback}catch{return fallback}};
const admin=parse(ADMIN_KEY,{users:[],options:{}}); admin.options=admin.options||{};
const assignments=parse(ASSIGN_KEY,{assignments:[],drafts:[]});
const legacy=parse(LEGACY_KEY,{}); legacy.users=Array.isArray(legacy.users)?legacy.users:[]; legacy.schools=Array.isArray(legacy.schools)?legacy.schools:[]; legacy.masterGames=Array.isArray(legacy.masterGames)?legacy.masterGames:[];

function mergeById(base, incoming){const map=new Map(base.map(x=>[String(x.id||''),x])); incoming.forEach(x=>{const id=String(x.id||''); if(!id)return; map.set(id,{...(map.get(id)||{}),...x});}); return [...map.values()];}
const adminUsers=(Array.isArray(admin.users)?admin.users:[]).map(u=>({
  id:String(u.id||u.userId||u.officialId||''), firstName:u.firstName||'', lastName:u.lastName||'', email:u.email||'', phone:u.mobilePhone||u.phone||'',
  role:String(u.role||u.roleLabel||'').toLowerCase()==='official'?'official':String(u.role||u.roleLabel||'').toLowerCase(),
  roleLabel:u.roleLabel||u.role||'', organization:u.organizationLabel||u.organization||'', organizationName:u.organizationLabel||u.organization||'',
  city:u.address?.city||u.city||'', state:u.address?.state||u.state||'', profilePhoto:u.profilePhoto||u.photoDataUrl||''
})).filter(u=>u.id);
legacy.users=mergeById(legacy.users,adminUsers);

const schoolSource=admin.options.schoolsTeams||admin.options.schools||[];
const schools=(Array.isArray(schoolSource)?schoolSource:[]).map((s,i)=>typeof s==='string'?{id:`admin-school-${i}-${s}`,name:s,type:'School'}:{
  ...s,id:String(s.id||s.value||`admin-school-${i}`),name:s.name||s.label||s.value||'',schoolName:s.schoolName||s.name||s.label||s.value||'',
  mascotName:s.mascotName||s.mascot||'',type:s.type||'School',conference:s.conference||s.conferenceLevel||'',sport:s.sport||'Basketball'
}).filter(s=>s.name||s.schoolName);
legacy.schools=mergeById(legacy.schools,schools);

function roleId(crew, labels){const m=(crew||[]).find(c=>labels.includes(String(c.role||'').toLowerCase())); return m?.officialId?`user:${m.officialId}`:'';}
const currentGames=[...(assignments.assignments||[]),...(assignments.drafts||[])].map(a=>({
  id:String(a.id||''), sourceAdminAssignment:true, crewSize:Number(a.crewSize)===2?2:3, date:a.date||'', startTime:a.time||a.startTime||'', timeZone:a.timeZone||'',
  sport:a.sport||'Basketball', level:a.level||'', gender:a.gender||'', conferenceLevel:a.conference||a.conferenceLevel||'', school:a.homeTeam||'',
  homeTeam:a.homeTeam||'', awayTeam:a.visitingTeam||a.awayTeam||'', gymName:a.venue||a.location||'', address:a.address||'', venuePhone:a.phone||'',
  status:(a.published===true||String(a.publishStatus||a.status||'').toLowerCase()==='published')?'Published':(String(a.publishStatus||a.status||'').toLowerCase()==='draft'?'Draft':'Unpublished'),
  refereeId:roleId(a.crew,['referee']), umpire1Id:roleId(a.crew,['umpire','umpire 1']), umpire2Id:roleId(a.crew,['umpire 2']), alternateId:roleId(a.crew,['alternate']),
  notes:a.notes||'', publishedAt:a.publishedAt||'', completedAt:a.completedAt||''
})).filter(g=>g.id);
const retainedLegacy=legacy.masterGames.filter(g=>!g.sourceAdminAssignment);
legacy.masterGames=[...currentGames,...retainedLegacy];
localStorage.setItem(LEGACY_KEY,JSON.stringify(legacy));

const nativeSet=Storage.prototype.setItem;
Storage.prototype.setItem=function(key,value){
  nativeSet.call(this,key,value);
  if(this===localStorage && key===LEGACY_KEY){
    try{
      const l=JSON.parse(value||'{}'); const a=parse(ADMIN_KEY,{users:[],options:{}}); a.options=a.options||{};
      if(Array.isArray(l.schools)) a.options.schoolsTeams=l.schools;
      if(Array.isArray(l.gameReports)) a.options.basketballGameReports=l.gameReports;
      if(Array.isArray(l.gameEvaluations)) a.options.basketballRefereeEvaluations=l.gameEvaluations;
      nativeSet.call(localStorage,ADMIN_KEY,JSON.stringify(a));
    }catch(e){console.warn('Admin module sync skipped',e)}
  }
};
})();