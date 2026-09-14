(()=>{
if(!window.NJCAAWomenEliteCourse||!window.RefZoneCourseUICore)return;
window.NJCAAWomenEliteCourseUI=window.RefZoneCourseUICore.create({
  trackId:'njcaa-women',
  pathwayId:'elite',
  course:window.NJCAAWomenEliteCourse,
  icon:'assets/pathway-icons/rfzu_njcaawbb.png',
  courseLabel:'NJCAA Women’s PhD · Complete 20-Course Doctoral Program',
  shortLabel:'RZU-NJCW-D',
  routeBase:'#/course/njcaa-women/elite',
  programHref:'#/program/njcaa-women/elite',
  storePrefix:'njcaa-women-phd',
  resourceFiles:[
    ['courses/NJCAA-Women-PhD-Degree-Handbook.md','PhD program handbook'],
    ['courses/NJCAA-Women-PhD-Coverage-Matrix.md','PhD coverage matrix'],
    ['courses/NJCAA-Women-PhD-Source-Report.md','PhD source report'],
    ['courses/NJCAA-Women-PhD-Review-Package.md','PhD review package']
  ]
});
})();
