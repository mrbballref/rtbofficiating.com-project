(()=>{
if(!window.NFHSAdvancementCourse||!window.RefZoneCourseUICore)return;
window.NFHSAdvancementCourseUI=window.RefZoneCourseUICore.create({
  trackId:'nfhs',
  pathwayId:'advancement',
  course:window.NFHSAdvancementCourse,
  icon:'assets/pathway-icons/rfzu_nfhs.png',
  courseLabel:'NFHS Master’s · Complete 12-Course Graduate Program',
  shortLabel:'RZU-NFHS-M',
  routeBase:'#/course/nfhs/advancement',
  programHref:'#/program/nfhs/advancement',
  storePrefix:'nfhs-masters',
  resourceFiles:[
    ['courses/NFHS-Masters-Degree-Handbook.md','Master’s program handbook'],
    ['courses/NFHS-Masters-Coverage-Matrix.md','Master’s coverage matrix'],
    ['courses/NFHS-Masters-Source-Report.md','Master’s source report'],
    ['courses/NFHS-Masters-Review-Package.md','Master’s review package']
  ]
});
})();
