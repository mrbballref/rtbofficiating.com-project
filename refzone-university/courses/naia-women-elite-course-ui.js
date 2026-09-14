(()=>{
if(!window.NAIAWomenEliteCourse||!window.RefZoneCourseUICore)return;
window.NAIAWomenEliteCourseUI=window.RefZoneCourseUICore.create({
  trackId:'naia-women',
  course:window.NAIAWomenEliteCourse,
  icon:'assets/pathway-icons/rfzu_naiawbb.png',
  courseLabel:'NAIA Women PhD-Level Research, Leadership, and Elite Officiating',
  shortLabel:'NAIA WOMEN PhD',
  routeBase:'#/course/naia-women/elite',
  programHref:'#/program/naia-women/elite',
  storePrefix:'naia-women-phd'
});
})();
