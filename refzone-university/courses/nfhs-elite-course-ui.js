(()=>{
if(!window.NFHSEliteCourse||!window.RefZoneCourseUICore)return;
window.NFHSEliteCourseUI=window.RefZoneCourseUICore.create({
  trackId:'nfhs',
  pathwayId:'elite',
  course:window.NFHSEliteCourse,
  icon:'assets/pathway-icons/rfzu_nfhs.png',
  courseLabel:'NFHS PhD · Complete 20-Course Doctoral Program',
  shortLabel:'RZU-NFHS-D',
  routeBase:'#/course/nfhs/elite',
  programHref:'#/program/nfhs/elite',
  storePrefix:'nfhs-phd',
  resourceFiles:[
    ['courses/NFHS-PhD-Degree-Handbook.md','PhD program handbook'],
    ['courses/NFHS-PhD-Coverage-Matrix.md','PhD coverage matrix'],
    ['courses/NFHS-PhD-Source-Report.md','PhD source report'],
    ['courses/NFHS-PhD-Review-Package.md','PhD review package']
  ]
});
})();
