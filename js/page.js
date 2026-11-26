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

/* gallery filters & lightbox */
(() => {
  const grid = $('#galleryGrid');
  const filters = $$('.gallery-filter');
  const countEl = $('#galleryCount');
  const lightbox = $('#galleryLightbox');
  if (!grid || !lightbox) return;

  const items = $$('.gallery__item', grid);
  const featured = $('.gallery-featured__card');
  const lbImg = $('#lightboxImg');
  const lbCap = $('#lightboxCaption');
  const lbCount = $('#lightboxCounter');
  const lbClose = $('#lightboxClose');
  const lbPrev = $('#lightboxPrev');
  const lbNext = $('#lightboxNext');

  let activeList = [];
  let currentIndex = 0;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.filter;
      filters.forEach(b => b.classList.toggle('is-active', b === btn));
      let visible = 0;
      items.forEach(item => {
        const match = cat === 'all' || item.dataset.category === cat;
        item.classList.toggle('is-hidden', !match);
        if (match) {
          visible++;
          item.style.opacity = '1';
          item.style.transform = 'none';
        }
      });
      if (countEl) countEl.textContent = `SHOWING ${visible} PHOTO${visible === 1 ? '' : 'S'}`;
    });
  });

  function buildList() {
    const list = [];
    if (featured) {
      list.push({
        src: featured.dataset.lightboxSrc,
        alt: featured.dataset.lightboxAlt
      });
    }
    items.forEach(item => {
      if (!item.classList.contains('is-hidden')) {
        const img = item.querySelector('img');
        if (img) list.push({ src: img.getAttribute('src'), alt: img.getAttribute('alt') || '' });
      }
    });
    return list;
  }

  function showAt(idx) {
    if (!activeList.length) return;
    currentIndex = (idx + activeList.length) % activeList.length;
    const entry = activeList[currentIndex];
    lbImg.src = entry.src;
    lbImg.alt = entry.alt;
    lbCap.textContent = entry.alt;
    lbCount.textContent = `${currentIndex + 1} / ${activeList.length}`;
  }

  function openLightbox(src) {
    activeList = buildList();
    const idx = activeList.findIndex(e => e.src === src);
    showAt(idx >= 0 ? idx : 0);
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (featured) {
    featured.addEventListener('click', () => openLightbox(featured.dataset.lightboxSrc));
  }

  items.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) openLightbox(img.getAttribute('src'));
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => showAt(currentIndex - 1));
  lbNext.addEventListener('click', () => showAt(currentIndex + 1));
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  window.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showAt(currentIndex - 1);
    if (e.key === 'ArrowRight') showAt(currentIndex + 1);
  });

  let touchX = 0;
  lightbox.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 45) showAt(currentIndex + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();
