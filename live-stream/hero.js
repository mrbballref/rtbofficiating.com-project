(() => {
  const hero = document.querySelector(".tls-hero");
  if (!hero) return;

  // Only add a ready state after both supplied image assets have resolved.
  const images = Array.from(hero.querySelectorAll("img"));
  let pending = images.length;

  const finish = () => {
    pending -= 1;
    if (pending <= 0) hero.classList.add("is-ready");
  };

  if (pending === 0) {
    hero.classList.add("is-ready");
  } else {
    images.forEach((img) => {
      if (img.complete) finish();
      else {
        img.addEventListener("load", finish, { once: true });
        img.addEventListener("error", finish, { once: true });
      }
    });
  }
})();
