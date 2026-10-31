import { fairyDustCursor } from "./cursor-effects.js";

const wechatDialog = document.querySelector("#wechat-dialog");
document.querySelector(".wechat-trigger")?.addEventListener("click", () => wechatDialog.showModal());
wechatDialog?.addEventListener("click", (event) => {
  const bounds = wechatDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) wechatDialog.close();
});

// Keep the original star trail, without the old animated background.
if (matchMedia("(pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  new fairyDustCursor({ colors: ["#308b91", "#cfa657", "#a680a9"] });
  const canvas = document.querySelector("body > canvas");
  if (canvas) canvas.setAttribute("aria-hidden", "true");
}

const evaVideo = document.querySelector("#eva video");
if (evaVideo) evaVideo.defaultPlaybackRate = evaVideo.playbackRate = 0.4;
import './portrait-carousel.js';

const deferredVideos = document.querySelectorAll('video[data-src]');
function loadVideo(video) {
  if (!video.dataset.src) return;
  video.src = video.dataset.src;
  delete video.dataset.src;
  video.load();
}
if ('IntersectionObserver' in window) {
  const videoObserver = new IntersectionObserver(entries => {
    entries.forEach(({ target: video, isIntersecting }) => {
      if (isIntersecting) {
        loadVideo(video);
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { rootMargin: '300px 0px' });
  deferredVideos.forEach(video => videoObserver.observe(video));
} else {
  deferredVideos.forEach(loadVideo);
}
