const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

const root = document.documentElement;
const container = document.querySelector('.container');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight * 0.28;
let cursorFrame = null;

function updatePointerEffects() {
  root.style.setProperty('--mouse-x', `${mouseX}px`);
  root.style.setProperty('--mouse-y', `${mouseY}px`);

  if (container) {
    const rect = container.getBoundingClientRect();
    container.style.setProperty('--spot-x', `${mouseX - rect.left}px`);
    container.style.setProperty('--spot-y', `${mouseY - rect.top}px`);
  }

  const cursor = document.querySelector('.cursor-orb');
  if (cursor) {
    cursor.style.transform = `translate3d(${mouseX - 12}px, ${mouseY - 12}px, 0)`;
  }

  cursorFrame = null;
}

if (finePointer && !reducedMotion) {
  const cursor = document.createElement('div');
  cursor.className = 'cursor-orb';
  cursor.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cursor);

  window.addEventListener('pointermove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    if (!cursorFrame) cursorFrame = requestAnimationFrame(updatePointerEffects);
  }, { passive: true });

  document.querySelectorAll('a, button, .mainline-step').forEach((element) => {
    element.addEventListener('pointerenter', () => document.body.classList.add('is-link-hover'));
    element.addEventListener('pointerleave', () => document.body.classList.remove('is-link-hover'));
  });
}

const interactiveCards = document.querySelectorAll('.entry, .pub-entry, .interest-card, .profile');

if (finePointer && !reducedMotion) {
  interactiveCards.forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const localX = event.clientX - rect.left;
      const localY = event.clientY - rect.top;
      const rotateY = ((localX / rect.width) - 0.5) * 4.5;
      const rotateX = (0.5 - (localY / rect.height)) * 4.0;

      card.style.setProperty('--spot-x', `${localX}px`);
      card.style.setProperty('--spot-y', `${localY}px`);
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
      card.style.setProperty('--spot-x', '50%');
      card.style.setProperty('--spot-y', '50%');
    });
  });
}

const revealTargets = document.querySelectorAll('.section, .pub-entry, .entry, .interest-card, .research-mainline');
if (!reducedMotion && 'IntersectionObserver' in window) {
  revealTargets.forEach((element) => element.classList.add('reveal'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -35px 0px' });
  revealTargets.forEach((element) => observer.observe(element));
} else {
  revealTargets.forEach((element) => element.classList.add('is-visible'));
}

if (window.tsParticles) {
  tsParticles.load('tsparticles', {
    fullScreen: { enable: false },
    background: { color: { value: 'transparent' } },
    detectRetina: true,
    fpsLimit: reducedMotion ? 30 : 60,
    particles: {
      number: {
        value: reducedMotion ? 48 : 112,
        density: { enable: true, area: 900 }
      },
      color: {
        value: ['#38bdf8', '#22d3ee', '#60a5fa', '#8b5cf6', '#c084fc', '#ec4899', '#f59e0b']
      },
      shape: {
        type: ['circle', 'triangle', 'star']
      },
      opacity: {
        value: { min: 0.24, max: 0.78 },
        animation: {
          enable: !reducedMotion,
          speed: 0.35,
          minimumValue: 0.18,
          sync: false
        }
      },
      size: {
        value: { min: 1, max: 4.2 },
        animation: {
          enable: !reducedMotion,
          speed: 1.4,
          minimumValue: 0.8,
          sync: false
        }
      },
      links: {
        enable: true,
        distance: 148,
        color: '#a5b4fc',
        opacity: 0.32,
        width: 1
      },
      move: {
        enable: true,
        speed: reducedMotion ? 0.22 : 0.62,
        direction: 'none',
        random: true,
        straight: false,
        outModes: { default: 'bounce' }
      },
      twinkle: {
        particles: {
          enable: !reducedMotion,
          frequency: 0.035,
          opacity: 0.95,
          color: { value: ['#ffffff', '#fef3c7', '#e0f2fe'] }
        }
      }
    },
    interactivity: {
      detectsOn: 'window',
      events: {
        onHover: {
          enable: finePointer && !reducedMotion,
          mode: ['grab', 'bubble', 'repulse']
        },
        onClick: {
          enable: finePointer && !reducedMotion,
          mode: 'push'
        },
        resize: true
      },
      modes: {
        grab: {
          distance: 185,
          links: { opacity: 0.60 }
        },
        bubble: {
          distance: 145,
          size: 6.3,
          duration: 0.35,
          opacity: 0.9
        },
        repulse: {
          distance: 92,
          duration: 0.35
        },
        push: {
          quantity: 4
        }
      }
    }
  });
}

updatePointerEffects();