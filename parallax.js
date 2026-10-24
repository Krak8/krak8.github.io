// Gentle mouse parallax. Skipped for touch devices and reduced-motion users.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const K = 200; // px of travel per unit of depth at the screen edge
  const layers = [...document.querySelectorAll('#scene img')].map(el => ({
    el, dx: +el.dataset.dx || 0, dy: +el.dataset.dy || 0
  })).filter(l => l.dx || l.dy);

  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;

  addEventListener('pointermove', e => {
    tx = (e.clientX / innerWidth - .5) * 2;
    ty = (e.clientY / innerHeight - .5) * 2;
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });

  function tick() {
    cx += (tx - cx) * .08;
    cy += (ty - cy) * .08;
    for (const l of layers)
      l.el.style.transform = `translate3d(${(-cx * l.dx * K).toFixed(1)}px, ${(-cy * l.dy * K).toFixed(1)}px, 0)`;
    raf = (Math.abs(tx - cx) > .001 || Math.abs(ty - cy) > .001) ? requestAnimationFrame(tick) : 0;
  }
})();
