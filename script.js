tsParticles.load("tsparticles", {
  fullScreen: { enable: false },
  background: { color: { value: "#f8fafc" } },
  fpsLimit: 60,
  particles: {
    number: { value: 95, density: { enable: true, area: 800 } },
    color: { value: ["#60a5fa", "#38bdf8", "#a78bfa"] },
    links: { enable: true, distance: 145, color: "#bfdbfe", opacity: 0.42, width: 1 },
    move: { enable: true, speed: 0.75, outModes: { default: "bounce" } },
    opacity: { value: 0.68 },
    size: { value: { min: 1, max: 3.4 } }
  },
  interactivity: {
    events: { onHover: { enable: true, mode: ["repulse", "grab"] }, resize: true },
    modes: {
      repulse: { distance: 92, duration: 0.4 },
      grab: { distance: 165, links: { opacity: 0.48 } }
    }
  },
  detectRetina: true
});
