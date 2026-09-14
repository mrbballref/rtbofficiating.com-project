(()=>{
if(!window.NCAAD3WomenAdvancementCourse||!window.RefZoneCourseUICore)return;
window.NCAAD3WomenAdvancementCourseUI=window.RefZoneCourseUICore.create({
  trackId:'ncaa-d3-women',
  pathwayId:'advancement',
  course:window.NCAAD3WomenAdvancementCourse,
  icon:'assets/pathway-icons/rfzu_ncaadiiiwbb.png',
  courseLabel:'NCAA Division III Women Master’s-Level Advanced Officiating',
  shortLabel:'NCAA DIVISION III WOMEN MASTER’S',
  routeBase:'#/course/ncaa-d3-women/advancement',
  programHref:'#/program/ncaa-d3-women/advancement',
  storePrefix:'ncaa-d3-women-masters',
  resourceFiles:[
    ['courses/NCAA-DIII-Women-Masters-Degree-Handbook.md','Master’s degree-program handbook'],
    ['courses/NCAA-DIII-Women-Masters-Coverage-Matrix.md','Master’s coverage matrix'],
    ['courses/NCAA-DIII-Women-Masters-Source-Report.md','Master’s source report'],
    ['courses/NCAA-DIII-Women-Masters-Review-Package.md','Master’s review package']
  ]
});
})();
