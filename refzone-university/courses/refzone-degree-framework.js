(()=>{
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

const CONFIG={
  foundations:{
    id:'foundations',degree:'Bachelor’s',degreeShort:'BACHELOR’S',
    title:'Bachelor’s-Level Professional Foundations Program',
    credential:'Professional degree-level pathway',
    years:4,terms:8,courses:24,units:120,hours:1800,unitPerCourse:5,
    prerequisite:'Placement, program admission, or approved equivalent entry assessment',
    membership:'RefZone Foundations',
    summary:'A four-year, undergraduate-style sequence that develops complete rule literacy, mechanics, judgment, communication, game administration, film study, and applied officiating competence.',
    termThemes:[
      ['Year 1','Term 1','Professional Identity, Source Literacy, and Officiating Foundations'],
      ['Year 1','Term 2','Game Structure, Definitions, and Administration'],
      ['Year 2','Term 3','Violations, Fouls, and Penalties I'],
      ['Year 2','Term 4','Violations, Fouls, and Penalties II'],
      ['Year 3','Term 5','Applied Mechanics and Contact Judgment'],
      ['Year 3','Term 6','Communication, Leadership, and Game Management'],
      ['Year 4','Term 7','Advanced Practicum and Film Analysis'],
      ['Year 4','Term 8','Senior Capstone, Oral Defense, and Professional Portfolio']
    ],
    courseTitles:[
      'Professional Identity, Ethics, and the Role of the Official',
      'Governing Bodies, Source Authority, and Rulebook Literacy',
      'Definitions, Court, Equipment, and Game Personnel',
      'Timing, Scoring, Ball Status, Player Control, and Team Control',
      'Throw-Ins, Jump Balls, Alternating Possession, and Free Throws',
      'Violations I: Dribbling, Traveling, Pivoting, and Out of Bounds',
      'Violations II: Counts, Backcourt, Lane, and Basket Restrictions',
      'Foul Foundations and Penalty Administration',
      'Personal, Technical, Intentional, Flagrant, and Fighting Acts',
      'Two-Person Mechanics and Coverage',
      'Three-Person Mechanics I: Lead, Trail, and Center',
      'Three-Person Mechanics II: Rotations, Transitions, and Press',
      'Contact Judgment I: Ball Handler and Dribbler',
      'Contact Judgment II: Shooters and Airborne Shooters',
      'Contact Judgment III: Screens, Post Play, and Cutters',
      'Rebounding, Loose Balls, Verticality, and Landing Space',
      'Game Administration, Table Operations, Clock, and Shot Clock',
      'Communication with Players, Coaches, Partners, and Supervisors',
      'Pregame, Arrival, Crew Protocol, and Professional Preparation',
      'Film Study and Play Analysis Laboratory I',
      'Applied Officiating Practicum I',
      'Applied Officiating Practicum II',
      'Integrated Rules and Mechanics Seminar',
      'Senior Capstone, Oral Defense, and Professional Portfolio'
    ],
    categories:['Professional Foundations','Rules and Game Administration','Rules and Game Administration','Rules and Game Administration','Rules and Game Administration','Rules and Game Administration','Rules and Game Administration','Rules and Game Administration','Rules and Game Administration','Mechanics and Applied Officiating','Mechanics and Applied Officiating','Mechanics and Applied Officiating','Judgment and Play Analysis','Judgment and Play Analysis','Judgment and Play Analysis','Judgment and Play Analysis','Game Administration','Communication and Leadership','Communication and Leadership','Film and Applied Study','Practicum and Capstone','Practicum and Capstone','Practicum and Capstone','Practicum and Capstone'],
    courseDistribution:[3,3,3,3,3,3,3,3],
    completion:[
      'Complete all 24 required academic courses and earn 120 RefZone credit-equivalent units.',
      'Pass rules, penalties, mechanics, communication, safety, and source-literacy competency gates.',
      'Complete two applied officiating practicums with anchored performance rubrics.',
      'Submit a complete-game film analysis and professional self-evaluation.',
      'Pass the senior capstone, comprehensive examination, oral defense, and portfolio review.'
    ]
  },
  advancement:{
    id:'advancement',degree:'Master’s',degreeShort:'MASTER’S',
    title:'Master’s-Level Advanced Officiating Program',
    credential:'Professional graduate degree-level pathway',
    years:2,terms:4,courses:12,units:36,hours:540,unitPerCourse:3,
    prerequisite:'Completed Bachelor’s-Level Foundations pathway or verified equivalent rules, mechanics, and practical competency',
    membership:'RefZone Advancement',
    summary:'A graduate-style program emphasizing advanced interpretation, complex judgment, three-person mechanics, replay, crew-chief leadership, evaluation, film defense, and applied performance.',
    termThemes:[
      ['Year 1','Term 1','Advanced Rules Interpretation and Decision Frameworks'],
      ['Year 1','Term 2','Elite Mechanics, Replay, and Game Administration'],
      ['Year 2','Term 3','Crew-Chief Leadership, Evaluation, and Applied Practicum'],
      ['Year 2','Term 4','Graduate Capstone, Comprehensive Examination, and Oral Defense']
    ],
    courseTitles:[
      'Advanced Rules Interpretation Seminar',
      'Complex Case Plays and Penalty Sequencing',
      'Advanced Contact Judgment and Correct No-Call Philosophy',
      'Advanced Three-Person Mechanics and Coverage Extensions',
      'Transition, Press, End-of-Period, Clock, and Shot-Clock Administration',
      'Replay, Challenges, Correctable Errors, and Atypical Plays',
      'Advanced Game Management and Conflict Communication',
      'Crew-Chief Leadership and Crew Performance',
      'Evaluator, Observer, and Instructor Foundations',
      'Graduate Film Analysis and Performance Analytics',
      'Advanced Applied Officiating Practicum',
      'Master’s Capstone, Comprehensive Examination, and Oral Defense'
    ],
    categories:['Advanced Rules','Advanced Rules','Advanced Judgment','Advanced Mechanics','Game Administration','Replay and Atypical Plays','Communication and Leadership','Communication and Leadership','Evaluation and Instruction','Film and Analytics','Graduate Practicum','Graduate Capstone'],
    courseDistribution:[3,3,3,3],
    completion:[
      'Complete all 12 graduate courses and earn 36 RefZone graduate credit-equivalent units.',
      'Maintain advanced rules-and-penalty competency and pass complex case-play examinations.',
      'Complete the graduate film laboratory and defend rulings, mechanics, and communication decisions.',
      'Complete the advanced practicum and crew-chief leadership evaluation.',
      'Pass the comprehensive examination, master’s capstone, oral defense, and performance portfolio.'
    ]
  },
  elite:{
    id:'elite',degree:'PhD',degreeShort:'PhD',
    title:'PhD-Level Research, Leadership, and Elite Officiating Program',
    credential:'Professional doctoral degree-level pathway',
    years:4,terms:8,courses:20,units:60,hours:900,unitPerCourse:3,
    prerequisite:'Completed Master’s-Level Advanced pathway or verified equivalent elite officiating, leadership, evaluation, and research readiness',
    membership:'RefZone Elite or RefZone All-Access',
    summary:'A doctoral-style program for elite officials, crew chiefs, evaluators, assignors, instructors, and institutional leaders conducting original research and contributing to officiating policy and education.',
    termThemes:[
      ['Year 1','Term 1','Doctoral Foundations in Officiating Scholarship and Governance'],
      ['Year 1','Term 2','Decision Science, Visual Processing, and Performance Analytics'],
      ['Year 2','Term 3','Research Design, Quantitative, Qualitative, and Mixed Methods'],
      ['Year 2','Term 4','Comparative Rules, Policy, Sports Law, Ethics, and Integrity'],
      ['Year 3','Term 5','Evaluation, Supervision, Curriculum, and Instructor Development'],
      ['Year 3','Term 6','Technology, Artificial Intelligence, Replay, and Organizational Leadership'],
      ['Year 4','Term 7','Doctoral Candidacy, Dissertation Proposal, and Applied Research'],
      ['Year 4','Term 8','Dissertation, Oral Defense, and Professional Contribution Portfolio']
    ],
    courseTitles:[
      'Doctoral Foundations in Officiating Scholarship',
      'Governance, Ethics, Integrity, and Sports Law',
      'Comparative Rules Systems and Policy Analysis',
      'Decision Science and Visual Cognition',
      'Attention, Anticipation, Pattern Recognition, and Cognitive Load',
      'Performance Analytics and Evidence-Based Evaluation',
      'Quantitative Research Methods for Officiating',
      'Qualitative Research Methods for Officiating',
      'Mixed Methods, Applied Statistics, and Research Design',
      'Research Ethics, Source Control, and Academic Integrity',
      'Supervisor, Assignor, and Organizational Leadership',
      'Evaluator, Observer, Curriculum, and Instructor Development',
      'Replay Systems, Officiating Technology, and Artificial Intelligence',
      'Bias Awareness, Cultural Competence, and Decision Equity',
      'Rules-Change Impact Analysis and Institutional Policy Research',
      'Publication, Peer Review, and Scholarly Communication',
      'Doctoral Candidacy Examination',
      'Dissertation Proposal and Research Defense',
      'Applied Dissertation or Institutional Research Project',
      'Final Oral Defense and Professional Contribution Portfolio'
    ],
    categories:['Doctoral Foundations','Governance and Ethics','Comparative Policy','Decision Science','Decision Science','Analytics and Evaluation','Research Methods','Research Methods','Research Methods','Research Integrity','Leadership and Governance','Evaluation and Curriculum','Technology and AI','Equity and Professional Practice','Policy Research','Scholarship and Publication','Doctoral Candidacy','Dissertation','Dissertation','Doctoral Defense'],
    courseDistribution:[3,3,3,3,2,2,2,2],
    completion:[
      'Complete all 20 doctoral courses and earn 60 RefZone doctoral credit-equivalent units.',
      'Pass the doctoral candidacy examination in rules, mechanics, leadership, evaluation, research, and source control.',
      'Secure approval of an original dissertation or institutional research proposal.',
      'Complete an applied research project suitable for peer review, policy use, curriculum improvement, or professional publication.',
      'Pass the final oral defense and submit a professional contribution portfolio demonstrating sustained leadership and service to the game.'
    ]
  }
};

const prefixMap={
  'nfhs':'NFHS','njcaa-men':'NJCM','njcaa-women':'NJCW','naia-men':'NAIAM','naia-women':'NAIAW',
  'ncaa-d3-men':'D3M','ncaa-d3-women':'D3W','ncaa-d2-men':'D2M','ncaa-d2-women':'D2W','ncaa-d1-men':'D1M','ncaa-d1-women':'D1W',
  'usa-men':'USAM','usa-women':'USAW','euro-men':'EUROM','euro-women':'EUROW','fiba-men':'FIBAM','fiba-women':'FIBAW',
  'g-league':'GL','wnba':'WNBA','nba':'NBA'
};
const pathwayCode={foundations:'B',advancement:'M',elite:'D'};
function prefix(trackId,pathId){return `RZU-${prefixMap[trackId]||'BB'}-${pathwayCode[pathId]||'P'}`;}
function workload(cfg,index){
  if(cfg.id==='foundations')return {guided:18,independent:24,film:12,field:12,assessment:9,total:75};
  if(cfg.id==='advancement')return {guided:12,independent:15,film:8,field:6,assessment:4,total:45};
  const dissertation=index>=16;
  return dissertation?{seminar:8,research:24,field:8,writing:3,assessment:2,total:45}:{seminar:12,research:15,analysis:9,writing:6,assessment:3,total:45};
}
function deliverables(cfg,index){
  if(cfg.id==='foundations')return index>=20?['Applied performance evaluation','Complete-game film defense','Integrated rules and mechanics examination','Professional reflection or portfolio artifact']:['Source-controlled reading response','Original case-play analysis','Film or court-position laboratory','Knowledge examination','Professional reflection'];
  if(cfg.id==='advancement')return index>=9?['Graduate seminar paper','Advanced film or practical defense','Comprehensive examination component','Leadership or evaluation portfolio artifact']:['Advanced source analysis','Complex case-play memorandum','Graduate film laboratory','Oral seminar defense','Applied performance task'];
  if(index===16)return ['Written doctoral candidacy examination','Oral candidacy examination','Research-area competency review'];
  if(index===17)return ['Dissertation proposal','Literature review','Methods plan','Proposal defense'];
  if(index===18)return ['Original data or applied institutional evidence','Dissertation manuscript','Professional implementation artifact'];
  if(index===19)return ['Final dissertation or institutional research submission','Public or panel presentation','Oral defense','Professional contribution portfolio'];
  return ['Doctoral seminar paper','Critical source synthesis','Research or policy analysis','Peer-review response','Scholarly presentation'];
}
function prerequisites(cfg,index,courses){
  if(index===0)return cfg.prerequisite;
  const priorTermIndex=Math.max(0,Math.floor(index/(cfg.courseDistribution[0]||3))-1);
  if(cfg.id==='elite'&&index===16)return 'Completion of doctoral coursework and faculty approval for candidacy';
  if(cfg.id==='elite'&&index===17)return 'Successful doctoral candidacy';
  if(cfg.id==='elite'&&index===18)return 'Approved dissertation or institutional research proposal';
  if(cfg.id==='elite'&&index===19)return 'Completed dissertation or institutional research project';
  return courses[Math.max(0,index-(cfg.id==='elite'?2:3))]?.code||'Prior-term academic standing';
}
function assignTerms(cfg){
  const out=[];let idx=0;
  cfg.courseDistribution.forEach((count,termIndex)=>{for(let j=0;j<count;j++)out[idx++]=termIndex;});
  return out;
}
function makeBasePlan(track,pathId){
  const cfg=CONFIG[pathId]||CONFIG.foundations,termAssignment=assignTerms(cfg),courses=[];
  cfg.courseTitles.forEach((title,index)=>{
    const termIndex=termAssignment[index]??cfg.terms-1;
    const number=(pathId==='foundations'?100:pathId==='advancement'?500:700)+termIndex*10+(termAssignment.slice(0,index).filter(x=>x===termIndex).length+1);
    const term=cfg.termThemes[termIndex];
    const code=`${prefix(track.id,pathId)} ${number}`;
    const w=workload(cfg,index);
    courses.push({
      id:`${pathId}-course-${index+1}`,code,title:`${track.name}: ${title}`,shortTitle:title,index,termIndex,
      year:term[0],term:term[1],termTheme:term[2],units:cfg.unitPerCourse,category:cfg.categories[index]||'Program Requirement',
      prerequisite:prerequisites(cfg,index,courses),requirements:w,deliverables:deliverables(cfg,index),lessonIds:[],lessons:[]
    });
  });
  return finalizePlan(track,cfg,courses);
}
function distributeLessons(plan,course){
  const flat=[];(course.modules||[]).forEach((m,mi)=>(m.lessons||[]).forEach((l,li)=>flat.push({...l,module:m,moduleIndex:mi,lessonIndex:li})));
  if(!flat.length)return plan;
  if(Array.isArray(course.academicCourses)&&course.academicCourses.length){
    plan.courses.forEach((academic,index)=>{
      const meta=course.academicCourses[index]||{};
      const lessons=flat.filter(x=>Number(x.academicCourseIndex)===index);
      academic.code=meta.code||academic.code;
      academic.shortTitle=meta.shortTitle||meta.title||academic.shortTitle;
      academic.title=`${plan.trackName}: ${academic.shortTitle}`;
      academic.year=meta.year||academic.year;academic.term=meta.term||academic.term;academic.termTheme=meta.termTheme||academic.termTheme;
      academic.units=Number(meta.units)||academic.units;academic.hours=Number(meta.hours)||75;
      academic.category=meta.category||academic.category;academic.prerequisite=meta.prerequisite||academic.prerequisite;
      academic.description=meta.description||'';academic.learningOutcomes=meta.learningOutcomes||[];
      academic.workload=meta.workload||{};academic.grading=meta.grading||[];academic.completion=meta.completion||[];
      academic.requiredSubmissions=meta.requiredSubmissions||[];academic.deliverables=meta.requiredSubmissions||academic.deliverables||[];
      academic.requirements={
        guided:Number(meta.workload?.guidedVideoAndInteractive)||0,
        independent:Number(meta.workload?.sourceStudyAndReading)||0,
        film:Number(meta.workload?.caseAndCommunicationLabs)||0,
        field:Number(meta.workload?.fieldObservationAndPreparation)||0,
        assessment:Number(meta.workload?.assessmentAndPortfolio)||0,
        total:Number(meta.workload?.total)||Number(meta.hours)||75
      };
      academic.lessons=lessons;academic.lessonIds=lessons.map(x=>x.id);
      academic.productionStatus=lessons.length?'Available now':'Scheduled for production';
      academic.scriptAsset=meta.scriptAsset||'';academic.syllabusAsset=meta.syllabusAsset||'';
    });
    plan.byLesson={};plan.courses.forEach(c=>c.lessonIds.forEach(id=>plan.byLesson[id]=c));
    return plan;
  }
  if(course.academicCourse){
    const meta=course.academicCourse,index=Math.max(0,Math.min(plan.courses.length-1,Number(meta.index)||0)),academic=plan.courses[index];
    Object.assign(academic,meta);
    academic.shortTitle=meta.shortTitle||meta.title||academic.shortTitle;academic.title=`${plan.trackName}: ${academic.shortTitle}`;
    academic.lessons=flat;academic.lessonIds=flat.map(x=>x.id);academic.productionStatus='Available now';
    plan.courses.forEach((c,i)=>{if(i!==index)c.productionStatus='Scheduled for production'});
    plan.byLesson={};academic.lessonIds.forEach(id=>plan.byLesson[id]=academic);return plan;
  }
  const target=plan.courses.length,base=Math.floor(flat.length/target),extra=flat.length%target;let cursor=0;
  plan.courses.forEach((academic,index)=>{const size=base+(index<extra?1:0),lessons=flat.slice(cursor,cursor+size);cursor+=size;academic.lessons=lessons;academic.lessonIds=lessons.map(x=>x.id);academic.productionStatus=lessons.length?'Available now':'Scheduled for production'});
  plan.byLesson={};plan.courses.forEach(c=>c.lessonIds.forEach(id=>plan.byLesson[id]=c));return plan;
}
function finalizePlan(track,cfg,courses){
  const terms=cfg.termThemes.map((x,i)=>({year:x[0],term:x[1],theme:x[2],courses:courses.filter(c=>c.termIndex===i),units:courses.filter(c=>c.termIndex===i).reduce((s,c)=>s+c.units,0)}));
  const categoryMap={};courses.forEach(c=>categoryMap[c.category]=(categoryMap[c.category]||0)+c.units);
  return {trackId:track.id,trackName:track.name,pathwayId:cfg.id,degree:cfg.degree,degreeShort:cfg.degreeShort,programTitle:`${track.name} ${cfg.title}`,credential:cfg.credential,membership:cfg.membership,summary:cfg.summary,prerequisite:cfg.prerequisite,totalUnits:cfg.units,totalCourses:cfg.courses,totalTerms:cfg.terms,recommendedYears:cfg.years,totalEngagementHours:cfg.hours,terms,courses,byLesson:{},categories:Object.entries(categoryMap).map(([name,units])=>({name,units})),completion:cfg.completion,config:cfg};
}
function build(course,track,pathId='foundations'){
  const plan=makeBasePlan(track,pathId);
  return course?distributeLessons(plan,course):plan;
}
function degreeSelector(trackId,active){
  return `<nav class="rzu-degree-selector" aria-label="Degree program selector">${Object.values(CONFIG).map(cfg=>`<a class="${cfg.id===active?'active':''}" href="#/program/${esc(trackId)}/${cfg.id}"><span>${esc(cfg.degree)}</span><small>${cfg.id==='foundations'?'Professional Foundations':cfg.id==='advancement'?'Advanced Officiating':'Research & Leadership'}</small></a>`).join('')}</nav>`;
}
function courseHrefFor(plan,courseHref,c){return c.lessonIds?.length?`${courseHref}/${esc(c.lessonIds[0])}`:courseHref;}
function programMarkup(plan,sourceStatus,courseHref){
  const cfg=plan.config,first=plan.courses[0];
  const categoryTotal=Math.max(1,plan.totalUnits);
  return `<div class="rzu-degree-program rzu-degree-program--${esc(plan.pathwayId)}">
  ${degreeSelector(plan.trackId,plan.pathwayId)}
  <section class="rzu-degree-hero"><div><p class="rzu-course-eyebrow">${esc(cfg.degreeShort)} DEGREE STRUCTURE · ${esc(plan.trackName)}</p><h2>${esc(plan.programTitle)}</h2><p>${esc(plan.summary)}</p><div class="rzu-degree-badges"><span>${plan.recommendedYears}-year recommended sequence</span><span>${plan.totalTerms} academic terms</span><span>${plan.totalCourses} required courses</span><span>${plan.totalUnits} credit-equivalent units</span><span>${plan.totalEngagementHours.toLocaleString()} engagement hours</span></div></div><aside><strong>Credential status</strong><p>${esc(plan.credential)}. This curriculum mirrors degree-level academic organization but does not represent an accredited degree unless verified authority is recorded in the CMS.</p><a class="button" href="${courseHrefFor(plan,courseHref,first)}">Begin ${esc(first.year)}, ${esc(first.term)}</a></aside></section>
  <section class="rzu-degree-three-levels"><article><span>01</span><strong>Bachelor’s</strong><p>Professional foundations, complete rule literacy, mechanics, communication, film study, and practicum.</p><a href="#/program/${esc(plan.trackId)}/foundations">View Bachelor’s structure</a></article><article><span>02</span><strong>Master’s</strong><p>Advanced judgment, complex administration, crew-chief leadership, evaluation, and graduate practicum.</p><a href="#/program/${esc(plan.trackId)}/advancement">View Master’s structure</a></article><article><span>03</span><strong>PhD</strong><p>Original research, policy, governance, decision science, instructor development, and doctoral defense.</p><a href="#/program/${esc(plan.trackId)}/elite">View PhD structure</a></article></section>
  <nav class="rzu-degree-tabs" aria-label="Program sections"><a href="#degreeCurriculum">Curriculum map</a><a href="#degreeRequirements">Degree requirements</a><a href="#degreeAssessment">Assessment system</a><a href="#degreeCompletion">Completion standards</a></nav>
  <section class="rzu-degree-summary" id="degreeRequirements"><article><span>${plan.totalUnits}</span><strong>Credit-equivalent units</strong><p>Units describe RefZone learning volume and do not claim transferable or accredited college credit.</p></article><article><span>${plan.totalEngagementHours.toLocaleString()}</span><strong>Total engagement hours</strong><p>Guided instruction, source study, film laboratories, field application, assessment, research, and portfolio work.</p></article><article><span>${cfg.id==='foundations'?'2':cfg.id==='advancement'?'1':'1'}</span><strong>${cfg.id==='elite'?'Original research project':'Applied practicum requirement'}</strong><p>${cfg.id==='elite'?'A dissertation-style or institutional research contribution is required.':'Observable officiating performance is evaluated with anchored rubrics.'}</p></article><article><span>1</span><strong>${cfg.id==='elite'?'Doctoral defense':'Integrated capstone'}</strong><p>${cfg.id==='foundations'?'Rules, mechanics, film, oral defense, and portfolio.':cfg.id==='advancement'?'Comprehensive examination, film defense, leadership, and oral defense.':'Candidacy, dissertation, oral defense, publication, and professional contribution.'}</p></article></section>
  <section class="rzu-degree-requirements"><div><p class="rzu-course-eyebrow">PROGRAM OF STUDY</p><h2>${esc(cfg.degree)}-structured development for ${esc(plan.trackName)}</h2><p>Every competition level has three separate academic structures: a Bachelor’s program for professional foundations, a Master’s program for advanced officiating, and a PhD program for research, leadership, and elite institutional contribution.</p><div class="notice"><strong>Admission prerequisite:</strong> ${esc(plan.prerequisite)}</div></div><div class="rzu-degree-audit">${plan.categories.map(c=>`<div><span>${esc(c.name)}</span><strong>${c.units} units</strong><i style="width:${Math.max(4,c.units/categoryTotal*100)}%"></i></div>`).join('')}</div></section>
  <section class="rzu-degree-terms" id="degreeCurriculum">${plan.terms.map(term=>`<article class="rzu-degree-term"><header><div><p>${esc(term.year)} · ${esc(term.term)}</p><h3>${esc(term.theme)}</h3></div><span>${term.units} units</span></header><div>${term.courses.map(c=>{const available=!!c.lessonIds?.length,inner=`<div><span>${esc(c.code)}</span><strong>${esc(c.shortTitle)}</strong><small>${esc(c.category)} · ${available?`${c.lessons.length} lessons available`:'Course production scheduled'}</small></div><div><b>${c.units} units</b><small>${available?'Open course':'Prerequisite: '+esc(c.prerequisite)}</small></div>`;return available?`<a class="rzu-degree-course-card is-available" href="${courseHrefFor(plan,courseHref,c)}">${inner}</a>`:`<article class="rzu-degree-course-card is-planned" aria-label="${esc(c.shortTitle)} is scheduled for production">${inner}</article>`}).join('')}</div></article>`).join('')}</section>
  <section class="rzu-degree-assessment-grid" id="degreeAssessment"><article><p class="rzu-course-eyebrow">ACADEMIC ASSESSMENT</p><h3>${cfg.id==='foundations'?'Undergraduate-style mastery requirements':cfg.id==='advancement'?'Graduate seminar and comprehensive assessment':'Doctoral research and candidacy assessment'}</h3><ul>${(cfg.id==='foundations'?['Source-controlled reading responses','Original case-play analysis','Timed rules and penalty examinations','Written and oral explanation','Senior capstone preparation']:cfg.id==='advancement'?['Graduate rules seminars','Complex case-play memoranda','Advanced film defense','Comprehensive examination','Master’s capstone and oral defense']:['Doctoral seminar papers','Research-methods examinations','Candidacy examination','Dissertation proposal defense','Final dissertation and oral defense']).map(x=>`<li>${x}</li>`).join('')}</ul></article><article><p class="rzu-course-eyebrow">APPLIED ASSESSMENT</p><h3>Observable professional performance</h3><ul><li>Mechanics and positioning laboratories</li><li>Film judgment and communication defense</li><li>Practical-floor or evaluator performance</li><li>Incident-report and administrative writing</li><li>Supervisor, faculty, or review-panel rubric</li></ul></article><article><p class="rzu-course-eyebrow">ACADEMIC STANDING</p><h3>Progression gates control advancement</h3><ul><li>Minimum course standard established by program policy</li><li>Rules-and-penalty competency gate</li><li>All safety competencies passed</li><li>Prerequisites completed before upper terms</li><li>${cfg.id==='elite'?'Candidacy and dissertation committee approval':'Capstone eligibility review'}</li></ul></article></section>
  <section class="rzu-degree-completion" id="degreeCompletion"><div><p class="rzu-course-eyebrow">COMPLETION REQUIREMENTS</p><h2>${esc(cfg.degree)}-structured completion requires academic, applied, and professional evidence</h2></div><ol>${plan.completion.map((x,i)=>`<li><strong>${String(i+1).padStart(2,'0')}</strong><span>${esc(x)}</span></li>`).join('')}</ol></section>
  <section class="rzu-source-status"><p class="rzu-course-eyebrow">SOURCE AND PUBLICATION STATUS</p><h2>Program content remains controlled by validated ruleset sources</h2><p>${esc(sourceStatus)}</p><div class="notice">Course titles and degree structures may be displayed before publication. Student-facing rule instruction must remain draft until controlling sources and required human reviews are approved.</div></section>
  </div>`;
}
window.RefZoneDegreeFramework={CONFIG,build,programMarkup,degreeSelector};
})();
