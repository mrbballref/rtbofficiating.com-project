(() => {
  'use strict';

  const filmstrip = document.querySelector('[data-filmstrip]');
  const scrollFilmstrip = (direction) => {
    if (!filmstrip) return;
    const frame = filmstrip.querySelector('.lab-film-frame');
    const amount = (frame?.getBoundingClientRect().width || 300) * 1.8;
    filmstrip.scrollBy({ left: direction * amount, behavior: 'smooth' });
  };
  document.querySelector('[data-film-prev]')?.addEventListener('click', () => scrollFilmstrip(-1));
  document.querySelector('[data-film-next]')?.addEventListener('click', () => scrollFilmstrip(1));

  const fileInput = document.querySelector('[data-video-player] [data-player-file]');
  document.querySelector('.lab-hero__actions [data-player-upload]')?.addEventListener('click', () => fileInput?.click());
})();
