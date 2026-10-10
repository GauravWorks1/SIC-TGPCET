/* ============================================================
   SIC — main.js  (anime.js v3)
   ============================================================ */

/* ---------- helpers ---------- */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============ COMPREHENSIVE ASSET PRELOADER (LOAD EVERYTHING FIRST) ============ */
const preloader = $('#preloader');
const statusEl = $('#preloaderStatus');
const preloaderPct = $('#preloaderPct');
const preloaderBar = $('#preloaderBar');
const preloaderSub = $('#preloaderSub');

let loadedAssets = 0;
let totalAssets = 0;
let isPreloadDone = false;

// Immediate core essentials list in case manifest is fetching
let preloadList = [
  'assets/tulsi.jpeg',
  'assets/spotmicro.jpg',
  'assets/inmoov.jpg',
  'assets/rover.jpg'
];

function updateLoaderUI(loaded, total, currentItem) {
  const pct = total > 0 ? Math.min(Math.round((loaded / total) * 100), 100) : 0;
  if (preloaderBar) preloaderBar.style.width = pct + '%';
  if (preloaderPct) preloaderPct.textContent = pct + '%';
  if (preloaderSub) preloaderSub.textContent = `CACHED ${loaded} / ${total} ASSETS`;
  if (statusEl && currentItem) {
    statusEl.textContent = `PRELOADING: ${currentItem.split('/').pop()}`;
  }
}

// Fetch all 520 site assets from assets_manifest.json and cache them
fetch('assets_manifest.json')
  .then(res => res.json())
  .then(manifest => {
    // Exclude oversized video binaries from blob-stalling to prevent browser memory exhaustion,
    // but preload all 240 InMoov frames, gallery photos, and project assets completely
    preloadList = manifest.filter(item => !item.endsWith('.mp4'));
    startComprehensivePreload();
  })
  .catch(() => {
    startComprehensivePreload();
  });

function startComprehensivePreload() {
  totalAssets = preloadList.length;
  updateLoaderUI(0, totalAssets, 'INITIALIZING ASSET REPOSITORY');

  let queue = [...preloadList];
  const CONCURRENCY = 14; // Fast parallel download pipeline

  function loadNext() {
    if (queue.length === 0) {
      if (loadedAssets >= totalAssets) {
        finishPreload();
      }
      return;
    }

    const src = queue.shift();
    const isImage = /\.(jpg|jpeg|png|svg|webp)$/i.test(src);

    if (isImage) {
      const img = new Image();
      img.onload = () => handleItemLoaded(src);
      img.onerror = () => handleItemLoaded(src);
      img.src = src;
    } else {
      // CSS, JS, data
      fetch(src)
        .then(() => handleItemLoaded(src))
        .catch(() => handleItemLoaded(src));
    }
  }

  function handleItemLoaded(src) {
    loadedAssets++;
    updateLoaderUI(loadedAssets, totalAssets, src);
    if (loadedAssets >= totalAssets) {
      finishPreload();
    } else {
      loadNext();
    }
  }

  // Launch initial concurrent workers
  for (let i = 0; i < Math.min(CONCURRENCY, totalAssets); i++) {
    loadNext();
  }
}

function finishPreload() {
  if (isPreloadDone) return;
  isPreloadDone = true;

  if (preloaderBar) preloaderBar.style.width = '100%';
  if (preloaderPct) preloaderPct.textContent = '100%';
  if (statusEl) statusEl.textContent = 'ALL ASSETS READY · SYSTEM ONLINE';
  if (preloaderSub) preloaderSub.textContent = `CACHED ${totalAssets} / ${totalAssets} ASSETS`;

  setTimeout(() => {
    anime({
      targets: preloader,
      opacity: [1, 0],
      duration: 600,
      easing: 'easeOutQuad',
      complete: () => {
        preloader.style.display = 'none';
        heroIntro();
      }
    });
  }, 400);
}

/* ============ HERO INTRO ============ */
/* split hero words into chars */
$$('[data-split]').forEach(word => {
  word.innerHTML = word.textContent
    .split('')
    .map(ch => `<span class="char">${ch}</span>`)
    .join('');
});

function heroIntro() {
  const tl = anime.timeline({ easing: 'easeOutExpo' });
  tl.add({
    targets: '.hero__word .char',
    translateY: ['110%', '0%'],
    rotateZ: [8, 0],
    opacity: [0, 1],
    duration: 900,
    delay: anime.stagger(28, { start: 100 })
  })
  .add({
    targets: ['#heroTag', '.hero__college', '#heroMotto', '.hero__sub', '.hero__actions', '.hero__scroll'],
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 700,
    delay: anime.stagger(90)
  }, '-=500')
  .add({
    targets: '.hero__deco',
    opacity: [0, 0.7],
    duration: 800
  }, '-=400');
}

/* floating deco loop */
anime({
  targets: '.hero__deco',
  translateY: [-8, 8],
  direction: 'alternate',
  loop: true,
  duration: 2600,
  easing: 'easeInOutSine',
  delay: anime.stagger(400)
});

/* ============ PARTICLE FIELD (hero canvas) ============ */
(() => {
  const canvas = $('#particleCanvas');
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles;
  const COUNT = 60;
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  particles = Array.from({ length: COUNT }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 1.6 + 0.4
  }));

  canvas.parentElement.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  function tick() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,255,0,0.5)';
      ctx.fill();
    });
    // connect nearby particles + mouse
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 110) {
          ctx.strokeStyle = `rgba(200,255,0,${(1 - d / 110) * 0.15})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const dm = Math.hypot(particles[i].x - mouse.x, particles[i].y - mouse.y);
      if (dm < 160) {
        ctx.strokeStyle = `rgba(123,92,255,${(1 - dm / 160) * 0.35})`;
        ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    requestAnimationFrame(tick);
  }
  tick();
})();

/* ============ CUSTOM CURSOR ============ */
(() => {
  const cursor = $('#cursor');
  const follower = $('#cursorFollower');
  if (!cursor) return;
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

  $$('a, button, .project-card, .team-card').forEach(el => {
    el.addEventListener('mouseenter', () => follower.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => follower.classList.remove('is-hover'));
  });
})();

/* ============ MAGNETIC BUTTONS ============ */
$$('[data-magnetic]').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    anime({ targets: el, translateX: x * 0.25, translateY: y * 0.25, duration: 200, easing: 'easeOutQuad' });
  });
  el.addEventListener('mouseleave', () => {
    anime({ targets: el, translateX: 0, translateY: 0, duration: 500, easing: 'easeOutElastic(1, .5)' });
  });
});

/* ============ NAV SCROLL STATE ============ */
const nav = $('#nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('is-scrolled', window.scrollY > 40);
}, { passive: true });

/* mobile menu */
const burger = $('#burger');
const mobileMenu = $('#mobileMenu');
burger.addEventListener('click', () => mobileMenu.classList.toggle('is-open'));
$$('.mobile-menu a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('is-open')));

/* ============ SCROLL REVEAL ============ */
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

/* ============ COUNTERS ============ */
const statObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    anime({
      targets: el,
      innerHTML: [0, el.dataset.count],
      round: 1,
      duration: 1800,
      easing: 'easeOutExpo'
    });
    statObserver.unobserve(el);
  });
}, { threshold: 0.6 });
$$('[data-count]').forEach(el => statObserver.observe(el));

/* ============ MARQUEES ============ */
function marquee(id, dir = 1) {
  const track = $(id);
  if (!track) return;
  anime({
    targets: track,
    translateX: dir > 0 ? ['0%', '-50%'] : ['-50%', '0%'],
    duration: 22000,
    easing: 'linear',
    loop: true
  });
}
marquee('#marquee1', 1);
marquee('#marquee2', -1);

/* ============ TILT CARDS ============ */
$$('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -7;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 7;
    card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0)';
    card.style.transition = 'transform 0.5s ease';
    setTimeout(() => (card.style.transition = ''), 500);
  });
});

/* ============ IDEA LAB TERMINAL (typed) ============ */
(() => {
  const body = $('#terminalBody');
  if (!body) return;
  const lines = [
    { t: '$ whoami', c: 't-cmd' },
    { t: 'student_innovation_council', c: 't-accent' },
    { t: '$ ls idea-lab/', c: 't-cmd' },
    { t: '3d-printers/  electronics/  robotics/  caffeine/', c: '' },
    { t: '$ ./build --project=poppy-humanoid', c: 't-cmd' },
    { t: '[OK] servos calibrated', c: 't-dim' },
    { t: '[OK] joints printed & assembled', c: 't-dim' },
    { t: '[OK] poppy is alive 🤖', c: 't-accent' },
    { t: '$ echo "your idea here"', c: 't-cmd' },
    { t: 'your idea here_', c: 't-accent' }
  ];
  let started = false;

  const obs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || started) return;
    started = true;
    obs.disconnect();
    typeLines();
  }, { threshold: 0.4 });
  obs.observe(body);

  function typeLines() {
    let li = 0;
    function nextLine() {
      if (li >= lines.length) {
        body.insertAdjacentHTML('beforeend', '<span class="terminal__cursor"></span>');
        return;
      }
      const { t, c } = lines[li];
      const span = document.createElement('span');
      if (c) span.className = c;
      body.appendChild(span);
      let ci = 0;
      const iv = setInterval(() => {
        span.textContent += t[ci++];
        if (ci >= t.length) {
          clearInterval(iv);
          body.appendChild(document.createTextNode('\n'));
          li++;
          setTimeout(nextLine, 220);
        }
      }, t.startsWith('$') ? 40 : 12);
    }
    nextLine();
  }
})();
