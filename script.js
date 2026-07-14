const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const root = document.documentElement;

const profileImage = document.querySelector('.profile img');
const interestImage = document.querySelector('.interest-photo img');
if (profileImage) {
  profileImage.src = 'PROFILE.jpg';
  profileImage.onerror = () => {
    profileImage.onerror = null;
    profileImage.src = 'https://raw.githubusercontent.com/jiahaozheng406/jiahaozheng2005/main/profile.jpg';
  };
}
if (interestImage) {
  interestImage.src = 'PROFILE.jpg';
  interestImage.alt = 'Jiahao Zheng';
  interestImage.onerror = () => {
    interestImage.onerror = null;
    interestImage.src = 'https://raw.githubusercontent.com/jiahaozheng406/jiahaozheng2005/main/profile.jpg';
  };
}

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

if (window.tsParticles) {
  tsParticles.load('tsparticles', {
    fullScreen: { enable: false },
    background: { color: { value: 'transparent' } },
    detectRetina: true,
    fpsLimit: reducedMotion ? 30 : 60,
    particles: {
      number: {
        value: reducedMotion ? 55 : 118,
        density: { enable: true, area: 820 }
      },
      color: {
        value: ['#22d3ee', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa', '#c084fc', '#f472b6']
      },
      shape: { type: 'circle' },
      opacity: {
        value: { min: 0.34, max: 0.82 },
        animation: {
          enable: !reducedMotion,
          speed: 0.42,
          minimumValue: 0.24,
          sync: false
        }
      },
      size: {
        value: { min: 1.8, max: 5.2 },
        animation: {
          enable: !reducedMotion,
          speed: 1.1,
          minimumValue: 1.3,
          sync: false
        }
      },
      links: {
        enable: true,
        distance: 168,
        color: 'random',
        opacity: 0.52,
        width: 1.8
      },
      move: {
        enable: true,
        speed: reducedMotion ? 0.22 : 0.66,
        direction: 'none',
        random: true,
        straight: false,
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
          distance: 205,
          links: { opacity: 0.86 }
        },
        bubble: {
          distance: 165,
          size: 7.2,
          duration: 0.42,
          opacity: 0.96
        },
        repulse: {
          distance: 105,
          duration: 0.42
        }
      }
    }
  });
}

updateSideBackground();
