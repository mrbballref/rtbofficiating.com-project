(()=>{
if(!window.NAIAMenEliteCourse||!window.RefZoneCourseUICore)return;
window.NAIAMenEliteCourseUI=window.RefZoneCourseUICore.create({
  trackId:'naia-men',
  pathwayId:'elite',
  course:window.NAIAMenEliteCourse,
  icon:'assets/pathway-icons/rfzu_naiambb.png',
  courseLabel:'NAIA Men’s PhD · Complete 20-Course Doctoral Program',
  shortLabel:'RZU-NAIAM-D',
  routeBase:'#/course/naia-men/elite',
  programHref:'#/program/naia-men/elite',
  storePrefix:'naia-men-phd',
  resourceFiles:[
    ['courses/NAIA-Men-PhD-Degree-Handbook.md','PhD program handbook'],
    ['courses/NAIA-Men-PhD-Coverage-Matrix.md','PhD coverage matrix'],
    ['courses/NAIA-Men-PhD-Source-Report.md','PhD source report'],
    ['courses/NAIA-Men-PhD-Review-Package.md','PhD review package']
  ]
});
})();
