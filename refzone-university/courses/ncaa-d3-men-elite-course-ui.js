(()=>{
if(!window.NCAAD3MenEliteCourse||!window.RefZoneCourseUICore)return;
window.NCAAD3MenEliteCourseUI=window.RefZoneCourseUICore.create({
  trackId:'ncaa-d3-men',
  pathwayId:'elite',
  course:window.NCAAD3MenEliteCourse,
  icon:'assets/pathway-icons/rfzu_ncaadiiimbb.png',
  courseLabel:'NCAA Division III Men’s PhD · Complete 20-Course Doctoral Program',
  shortLabel:'RZU-NCAAD3M-D',
  routeBase:'#/course/ncaa-d3-men/elite',
  programHref:'#/program/ncaa-d3-men/elite',
  storePrefix:'ncaa-d3-men-phd',
  resourceFiles:[
    ['courses/NCAA-DIII-Men-PhD-Degree-Handbook.md','PhD program handbook'],
    ['courses/NCAA-DIII-Men-PhD-Coverage-Matrix.md','PhD coverage matrix'],
    ['courses/NCAA-DIII-Men-PhD-Source-Report.md','PhD source report'],
    ['courses/NCAA-DIII-Men-PhD-Review-Package.md','PhD review package']
  ]
});
})();
