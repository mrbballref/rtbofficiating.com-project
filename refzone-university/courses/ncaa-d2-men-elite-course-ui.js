(()=>{
if(!window.NCAAD2MenEliteCourse||!window.RefZoneCourseUICore)return;
window.NCAAD2MenEliteCourseUI=window.RefZoneCourseUICore.create({
  trackId:'ncaa-d2-men',
  pathwayId:'elite',
  course:window.NCAAD2MenEliteCourse,
  icon:'assets/pathway-icons/rfzu_ncaadiimbb.png',
  courseLabel:'NCAA Division II Men’s PhD · Complete 20-Course Doctoral Program',
  shortLabel:'RZU-NCAAD2M-D',
  routeBase:'#/course/ncaa-d2-men/elite',
  programHref:'#/program/ncaa-d2-men/elite',
  storePrefix:'ncaa-d2-men-phd',
  resourceFiles:[
    ['courses/NCAA-DII-Men-PhD-Degree-Handbook.md','PhD program handbook'],
    ['courses/NCAA-DII-Men-PhD-Coverage-Matrix.md','PhD coverage matrix'],
    ['courses/NCAA-DII-Men-PhD-Source-Report.md','PhD source report'],
    ['courses/NCAA-DII-Men-PhD-Review-Package.md','PhD review package']
  ]
});
})();
