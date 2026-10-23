const photos = [
  ['profile.jpg', 'Jiahao Zheng outdoors', '55% 55%'],
  ['images/portrait-business.jpg', 'Jiahao Zheng in a shirt and tie', '50% 20%'],
  ['images/portrait-formal.jpg', 'Jiahao Zheng in formal attire', '50% 35%']
];
const host = document.querySelector('.portrait');
if (host) {
  const css = document.createElement('link');
  css.rel = 'stylesheet'; css.href = new URL('portrait-carousel.css', import.meta.url);
  document.head.append(css);
  host.classList.add('focus-carousel');
  host.setAttribute('role', 'group'); host.setAttribute('aria-label', 'Personal photos');
  host.tabIndex = 0;
  const stage = document.createElement('div'); stage.className = 'portrait-stage';
  const dots = document.createElement('div'); dots.className = 'portrait-dots';
  let current = 0, start = null, suppress = false;
  const slides = photos.map(([src, alt, position], i) => {
    const button = document.createElement('button'); button.type = 'button';
    button.className = 'portrait-slide'; button.setAttribute('aria-label', alt);
    const img = document.createElement('img'); img.src = new URL(src, import.meta.url);
    img.alt = alt; img.draggable = false; img.style.objectPosition = position;
    button.append(img); button.addEventListener('click', () => { if (!suppress) select(i); });
    stage.append(button);
    const dot = document.createElement('button'); dot.type = 'button';
    dot.setAttribute('aria-label', `Show photo ${i + 1}`);
    dot.addEventListener('click', () => select(i)); dots.append(dot);
    return button;
  });
  function select(index) {
    current = (index + photos.length) % photos.length;
    slides.forEach((slide, i) => {
      slide.dataset.slot = i === current ? 'center' : i === (current + 1) % photos.length ? 'right' : 'left';
      dots.children[i].setAttribute('aria-current', String(i === current));
    });
  }
  host.replaceChildren(stage, dots); select(0);
  host.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); select(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    suppress = false; start = [event.clientX, event.clientY];
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointerup', event => {
    if (!start) return;
    const dx = event.clientX - start[0], dy = event.clientY - start[1]; start = null;
    if (Math.abs(dx) > 24 && Math.abs(dx) > Math.abs(dy)) {
      suppress = true; select(current + (dx < 0 ? 1 : -1));
    } else {
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.portrait-slide');
      if (target) select(slides.indexOf(target));
    }
  });
  stage.addEventListener('pointercancel', () => { start = null; });
}
