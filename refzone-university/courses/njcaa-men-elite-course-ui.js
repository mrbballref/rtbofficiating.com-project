(()=>{
if(!window.NJCAAMenEliteCourse||!window.RefZoneCourseUICore)return;
window.NJCAAMenEliteCourseUI=window.RefZoneCourseUICore.create({
  trackId:'njcaa-men',
  pathwayId:'elite',
  course:window.NJCAAMenEliteCourse,
  icon:'assets/pathway-icons/rfzu_njcaambb.png',
  courseLabel:'NJCAA Men’s PhD · Complete 20-Course Doctoral Program',
  shortLabel:'RZU-NJCM-D',
  routeBase:'#/course/njcaa-men/elite',
  programHref:'#/program/njcaa-men/elite',
  storePrefix:'njcaa-men-phd',
  resourceFiles:[
    ['courses/NJCAA-Men-PhD-Degree-Handbook.md','PhD program handbook'],
    ['courses/NJCAA-Men-PhD-Coverage-Matrix.md','PhD coverage matrix'],
    ['courses/NJCAA-Men-PhD-Source-Report.md','PhD source report'],
    ['courses/NJCAA-Men-PhD-Review-Package.md','PhD review package']
  ]
});
})();
