(()=>{
if(!window.NCAAD2WomenEliteCourse||!window.RefZoneCourseUICore)return;
window.NCAAD2WomenEliteCourseUI=window.RefZoneCourseUICore.create({
  trackId:'ncaa-d2-women',
  pathwayId:'elite',
  course:window.NCAAD2WomenEliteCourse,
  icon:'assets/pathway-icons/rfzu_ncaadiiwbb.png',
  courseLabel:'NCAA Division II Women’s PhD · Complete 20-Course Doctoral Program',
  shortLabel:'RZU-NCAAD2W-D',
  routeBase:'#/course/ncaa-d2-women/elite',
  programHref:'#/program/ncaa-d2-women/elite',
  storePrefix:'ncaa-d2-women-phd',
  resourceFiles:[
    ['courses/NCAA-DII-Women-PhD-Degree-Handbook.md','PhD program handbook'],
    ['courses/NCAA-DII-Women-PhD-Coverage-Matrix.md','PhD coverage matrix'],
    ['courses/NCAA-DII-Women-PhD-Source-Report.md','PhD source report'],
    ['courses/NCAA-DII-Women-PhD-Review-Package.md','PhD review package']
  ]
});
})();
