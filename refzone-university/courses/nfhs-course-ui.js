(()=>{
if(!window.NFHSFoundationsCourse||!window.RefZoneCourseUICore)return;
window.NFHSCourseUI=window.RefZoneCourseUICore.create({
  trackId:'nfhs',
  course:window.NFHSFoundationsCourse,
  icon:'assets/pathway-icons/rfzu_nfhs.png',
  courseLabel:'NFHS Bachelor’s · Complete 24-Course Program',
  shortLabel:'RZU-NFHS-B',
  routeBase:'#/course/nfhs/foundations',
  programHref:'#/program/nfhs/foundations',
  storePrefix:'nfhs-bachelors'
});
})();
