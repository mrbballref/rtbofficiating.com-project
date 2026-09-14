(()=>{
if(!window.NCAAD1WomenEliteCourse||!window.RefZoneCourseUICore)return;
window.NCAAD1WomenEliteCourseUI=window.RefZoneCourseUICore.create({
  trackId:'ncaa-d1-women',
  pathwayId:'elite',
  course:window.NCAAD1WomenEliteCourse,
  icon:'assets/pathway-icons/rfzu_ncaadiwbb.png',
  courseLabel:'NCAA Division I Women’s PhD · Complete 20-Course Doctoral Program',
  shortLabel:'RZU-NCAAD1W-D',
  routeBase:'#/course/ncaa-d1-women/elite',
  programHref:'#/program/ncaa-d1-women/elite',
  storePrefix:'ncaa-d1-women-phd',
  resourceFiles:[
    ['courses/NCAA-DI-Women-PhD-Degree-Handbook.md','PhD program handbook'],
    ['courses/NCAA-DI-Women-PhD-Coverage-Matrix.md','PhD coverage matrix'],
    ['courses/NCAA-DI-Women-PhD-Source-Report.md','PhD source report'],
    ['courses/NCAA-DI-Women-PhD-Review-Package.md','PhD review package']
  ]
});
})();
