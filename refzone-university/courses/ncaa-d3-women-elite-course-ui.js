(()=>{
if(!window.NCAAD3WomenEliteCourse||!window.RefZoneCourseUICore)return;
window.NCAAD3WomenEliteCourseUI=window.RefZoneCourseUICore.create({
  trackId:'ncaa-d3-women',
  pathwayId:'elite',
  course:window.NCAAD3WomenEliteCourse,
  icon:'assets/pathway-icons/rfzu_ncaadiiiwbb.png',
  courseLabel:'NCAA Division III Women’s PhD · Complete 20-Course Doctoral Program',
  shortLabel:'RZU-NCAAD3W-D',
  routeBase:'#/course/ncaa-d3-women/elite',
  programHref:'#/program/ncaa-d3-women/elite',
  storePrefix:'ncaa-d3-women-phd',
  resourceFiles:[
    ['courses/NCAA-DIII-Women-PhD-Degree-Handbook.md','PhD program handbook'],
    ['courses/NCAA-DIII-Women-PhD-Coverage-Matrix.md','PhD coverage matrix'],
    ['courses/NCAA-DIII-Women-PhD-Source-Report.md','PhD source report'],
    ['courses/NCAA-DIII-Women-PhD-Review-Package.md','PhD review package']
  ]
});
})();
