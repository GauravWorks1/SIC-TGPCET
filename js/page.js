/* ============================================================
   SIC — page.js  (shared interactions for subpages)
   ============================================================ */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* page-load reveal of hero */
anime({
  targets: '.page-hero > *',
  opacity: [0, 1],
  translateY: [24, 0],
  duration: 800,
  easing: 'easeOutExpo',
  delay: anime.stagger(90, { start: 100 })
});

/* scroll reveal */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    anime({
      targets: entry.target,
      opacity: [0, 1],
      translateY: [40, 0],
      duration: 900,
      easing: 'easeOutExpo'
    });
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.15 });
$$('[data-reveal]').forEach(el => revealObserver.observe(el));

/* custom cursor */
(() => {
  const cursor = $('#cursor');
  const follower = $('#cursorFollower');
  if (!cursor || !follower) return;
  let fx = 0, fy = 0, tx = 0, ty = 0;
  window.addEventListener('mousemove', e => {
    tx = e.clientX; ty = e.clientY;
    cursor.style.left = tx + 'px';
    cursor.style.top = ty + 'px';
  });
  (function follow() {
    fx += (tx - fx) * 0.12;
    fy += (ty - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';
    requestAnimationFrame(follow);
  })();
  $$('a, button, .team-card, .gallery__item').forEach(el => {
    el.addEventListener('mouseenter', () => follower.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => follower.classList.remove('is-hover'));
  });
})();

/* mobile menu */
const burger = $('#burger');
const mobileMenu = $('#mobileMenu');
if (burger && mobileMenu) {
  burger.addEventListener('click', () => mobileMenu.classList.toggle('is-open'));
  $$('.mobile-menu a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('is-open')));
}
