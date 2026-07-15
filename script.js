const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const root = document.documentElement;

function loadImageWithFallback(image, sources, options = {}) {
  if (!image || !sources.length) return;

  let sourceIndex = 0;
  image.decoding = 'async';
  image.loading = options.loading || 'lazy';
  image.referrerPolicy = 'no-referrer';

  if (options.fetchPriority) image.fetchPriority = options.fetchPriority;
  if (options.alt) image.alt = options.alt;

  const loadNextSource = () => {
    if (sourceIndex >= sources.length) {
      image.onerror = null;
      return;
    }
    image.src = sources[sourceIndex++];
  };

  image.onerror = loadNextSource;
  loadNextSource();
}

loadImageWithFallback(
  document.querySelector('.profile img'),
  [
    './profile.jpg?v=20260715-local',
    '/profile.jpg?v=20260715-local',
    'https://cdn.jsdelivr.net/gh/jiahaozheng406/jiahaozheng406.github.io@main/profile.jpg?v=20260715-local',
    'https://raw.githubusercontent.com/jiahaozheng406/jiahaozheng406.github.io/main/profile.jpg?v=20260715-local'
  ],
  {
    loading: 'eager',
    fetchPriority: 'high',
    alt: 'Jiahao Zheng profile photo'
  }
);

loadImageWithFallback(
  document.querySelector('.interest-photo img'),
  [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Kylian_Mbappe_France_v_Senegal_16_June_2026-391_%28cropped%29.jpg/250px-Kylian_Mbappe_France_v_Senegal_16_June_2026-391_%28cropped%29.jpg?v=20260715',
    'https://upload.wikimedia.org/wikipedia/commons/9/95/Kylian_Mbappe_France_v_Senegal_16_June_2026-391_%28cropped%29.jpg?v=20260715'
  ],
  {
    loading: 'lazy',
    alt: 'Kylian Mbappe with France national team'
  }
);

function sortNewsNewestFirst() {
  const list = document.querySelector('.news-list');
  if (!list) return;

  const items = Array.from(list.children).map((item, index) => {
    const dateText = item.querySelector('span')?.textContent.trim() || '';
    const match = dateText.match(/^(\d{4})\.(\d{1,2})$/);
    const sortValue = match ? Number(match[1]) * 100 + Number(match[2]) : -1;
    return { item, index, sortValue };
  });

  items
    .sort((a, b) => b.sortValue - a.sortValue || a.index - b.index)
    .forEach(({ item }) => list.appendChild(item));
}

sortNewsNewestFirst();

let pointerFrame = null;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight * 0.3;

function updateSideBackground() {
  root.style.setProperty('--mouse-x', `${mouseX}px`);
  root.style.setProperty('--mouse-y', `${mouseY}px`);

  const ratio = Math.max(0, Math.min(1, mouseX / Math.max(window.innerWidth, 1)));
  const verticalRatio = Math.max(0, Math.min(1, mouseY / Math.max(window.innerHeight, 1)));
  root.style.setProperty('--side-hue-a', `${178 + ratio * 145}`);
  root.style.setProperty('--side-hue-b', `${326 - ratio * 118 + verticalRatio * 24}`);
  pointerFrame = null;
}

if (finePointer && !reducedMotion) {
  window.addEventListener('pointermove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    if (!pointerFrame) pointerFrame = requestAnimationFrame(updateSideBackground);
  }, { passive: true });
}

let particleContainer = null;
let magneticAnchors = [];
let pointerInsideSideField = false;
let magneticReturnFrame = null;
let magneticReturnActive = false;

function getParticles() {
  return particleContainer?.particles?.array || [];
}

function isInVisibleSideField(clientX) {
  const halfCenterWidth = Math.min(520, Math.max(0, window.innerWidth / 2 - 28));
  const centerLeft = window.innerWidth / 2 - halfCenterWidth;
  const centerRight = window.innerWidth / 2 + halfCenterWidth;
  return clientX < centerLeft || clientX > centerRight;
}

function snapshotParticleAnchors() {
  magneticAnchors = getParticles().map((particle) => ({
    particle,
    x: particle.position.x,
    y: particle.position.y,
    vx: Number(particle.velocity?.x) || 0,
    vy: Number(particle.velocity?.y) || 0
  }));
}

function stopMagneticReturn() {
  if (magneticReturnFrame) cancelAnimationFrame(magneticReturnFrame);
  magneticReturnFrame = null;
  magneticReturnActive = false;
}

function startMagneticReturn() {
  if (!particleContainer || !magneticAnchors.length || reducedMotion) return;

  stopMagneticReturn();
  magneticReturnActive = true;

  const duration = 600;
  const startedAt = performance.now();
  const returnStarts = magneticAnchors.map((anchor) => ({
    anchor,
    x: anchor.particle.position.x,
    y: anchor.particle.position.y
  }));

  const animateReturn = (now) => {
    const t = Math.min(1, (now - startedAt) / duration);
    const spring = 1 - Math.exp(-8.8 * t) * Math.cos(11.2 * t);
    const resumeFactor = 0.16 + 0.84 * Math.pow(t, 0.72);

    returnStarts.forEach(({ anchor, x, y }) => {
      const particle = anchor.particle;
      if (!particle?.position) return;

      particle.position.x = x + (anchor.x - x) * spring;
      particle.position.y = y + (anchor.y - y) * spring;

      if (particle.velocity) {
        const dx = anchor.x - window.innerWidth / 2;
        const dy = anchor.y - window.innerHeight / 2;
        const swirlX = Math.max(-0.2, Math.min(0.2, -dy * 0.00024));
        const swirlY = Math.max(-0.2, Math.min(0.2, dx * 0.00024));
        particle.velocity.x = anchor.vx * resumeFactor + swirlX * t;
        particle.velocity.y = anchor.vy * resumeFactor + swirlY * t;
      }
    });

    if (t < 1) {
      magneticReturnFrame = requestAnimationFrame(animateReturn);
      return;
    }

    magneticAnchors.forEach((anchor) => {
      const particle = anchor.particle;
      if (!particle?.position) return;

      particle.position.x = anchor.x;
      particle.position.y = anchor.y;

      if (particle.velocity) {
        const dx = anchor.x - window.innerWidth / 2;
        const dy = anchor.y - window.innerHeight / 2;
        const swirlX = Math.max(-0.2, Math.min(0.2, -dy * 0.00024));
        const swirlY = Math.max(-0.2, Math.min(0.2, dx * 0.00024));
        particle.velocity.x = anchor.vx * 0.96 + swirlX;
        particle.velocity.y = anchor.vy * 0.96 + swirlY;
      }
    });

    magneticReturnFrame = null;
    magneticReturnActive = false;
    magneticAnchors = [];
  };

  magneticReturnFrame = requestAnimationFrame(animateReturn);
}

function handleMagneticPointerMove(event) {
  if (!finePointer || reducedMotion || !particleContainer) return;

  const isInside = isInVisibleSideField(event.clientX);

  if (isInside && !pointerInsideSideField) {
    pointerInsideSideField = true;
    if (magneticReturnActive) stopMagneticReturn();
    snapshotParticleAnchors();
  } else if (!isInside && pointerInsideSideField) {
    pointerInsideSideField = false;
    startMagneticReturn();
  }
}

if (finePointer && !reducedMotion) {
  window.addEventListener('pointermove', handleMagneticPointerMove, { passive: true });
  window.addEventListener('pointerleave', () => {
    if (!pointerInsideSideField) return;
    pointerInsideSideField = false;
    startMagneticReturn();
  }, { passive: true });
}

if (window.tsParticles) {
  tsParticles.load('tsparticles', {
    fullScreen: { enable: false },
    background: { color: { value: 'transparent' } },
    detectRetina: true,
    fpsLimit: reducedMotion ? 30 : 60,
    particles: {
      number: {
        value: reducedMotion ? 64 : 152,
        density: { enable: true, area: 760 }
      },
      color: {
        value: ['#22d3ee', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa', '#c084fc', '#f472b6']
      },
      shape: { type: 'circle' },
      opacity: {
        value: { min: 0.32, max: 0.8 },
        animation: {
          enable: !reducedMotion,
          speed: 0.42,
          minimumValue: 0.23,
          sync: false
        }
      },
      size: {
        value: { min: 1.7, max: 4.9 },
        animation: {
          enable: !reducedMotion,
          speed: 1.05,
          minimumValue: 1.25,
          sync: false
        }
      },
      links: {
        enable: true,
        distance: 182,
        color: 'random',
        opacity: 0.5,
        width: 1.7
      },
      move: {
        enable: true,
        speed: reducedMotion ? 0.22 : 1.28,
        direction: 'none',
        random: true,
        straight: false,
        attract: {
          enable: !reducedMotion,
          rotate: { x: 1120, y: 1120 }
        },
        outModes: { default: 'bounce' }
      }
    },
    interactivity: {
      detectsOn: 'window',
      events: {
        onHover: {
          enable: finePointer && !reducedMotion,
          mode: ['grab', 'bubble', 'repulse']
        },
        resize: true
      },
      modes: {
        grab: {
          distance: 198,
          links: { opacity: 0.84 }
        },
        bubble: {
          distance: 150,
          size: 6.6,
          duration: 0.2,
          opacity: 0.93
        },
        repulse: {
          distance: 102,
          duration: 0.18,
          factor: 108,
          speed: 1.2
        }
      }
    }
  }).then((container) => {
    particleContainer = container;
  }).catch(() => {
    particleContainer = null;
  });
}

updateSideBackground();