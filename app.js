(() => {
  const studySelect = document.querySelector('#studySelect');
  const seriesSelect = document.querySelector('#seriesSelect');
  const image = document.querySelector('#scanImage');
  const progress = document.querySelector('#progress');
  const badge = document.querySelector('#imageBadge');
  const readout = document.querySelector('#sliceReadout');
  const statusText = document.querySelector('#statusText');
  const viewer = document.querySelector('#viewer');
  let studyIndex = 0;
  let seriesIndex = 0;
  let sliceIndex = 0;
  let touchStartX = null;
  let wheelAccumulator = 0;
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let pointerState = null;

  function currentSeries() { return STUDIES[studyIndex].series[seriesIndex]; }
  function updateSeriesOptions() {
    seriesSelect.replaceChildren();
    STUDIES[studyIndex].series.forEach((series, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${series.label} · ${series.images.length} 张`;
      seriesSelect.append(option);
    });
    seriesSelect.value = seriesIndex;
  }
  function draw() {
    const series = currentSeries();
    const total = series.images.length;
    sliceIndex = Math.max(0, Math.min(total - 1, sliceIndex));
    const path = series.images[sliceIndex];
    image.src = path;
    image.alt = `${STUDIES[studyIndex].label} ${series.label} 第 ${sliceIndex + 1} 张`;
    progress.max = Math.max(0, total - 1);
    progress.value = sliceIndex;
    const label = `${sliceIndex + 1} / ${total}`;
    badge.textContent = label;
    readout.textContent = label;
    statusText.textContent = `${STUDIES[studyIndex].label} · ${series.label}`;
    [sliceIndex - 1, sliceIndex + 1].forEach(index => {
      if (index >= 0 && index < total) { const preload = new Image(); preload.src = series.images[index]; }
    });
    applyZoom();
  }
  function applyZoom() {
    applyTransform();
  }
  function clampPan() {
    if (zoom <= 1) { panX = 0; panY = 0; return; }
    const maxX = Math.max(0, (image.clientWidth * zoom - viewer.clientWidth) / 2);
    const maxY = Math.max(0, (image.clientHeight * zoom - viewer.clientHeight) / 2);
    panX = Math.max(-maxX, Math.min(maxX, panX));
    panY = Math.max(-maxY, Math.min(maxY, panY));
  }
  function applyTransform() {
    clampPan();
    image.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${zoom})`;
    document.querySelector('#zoomReadout').textContent = `${Math.round(zoom * 100)}%`;
  }
  function changeZoom(delta) {
    zoom = Math.max(.5, Math.min(3, Math.round((zoom + delta) * 10) / 10));
    applyZoom();
  }
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } else if (viewer.requestFullscreen) await viewer.requestFullscreen();
      else if (viewer.webkitRequestFullscreen) viewer.webkitRequestFullscreen();
    } catch (error) {
      statusText.textContent = '全屏不可用';
    }
  }
  function go(delta) {
    const total = currentSeries().images.length;
    sliceIndex = Math.max(0, Math.min(total - 1, sliceIndex + delta));
    draw();
  }
  function populateStudies() {
    STUDIES.forEach((study, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${study.label} · ${study.total} 张`;
      studySelect.append(option);
    });
    studySelect.value = studyIndex;
    updateSeriesOptions();
  }

  studySelect.addEventListener('change', () => { studyIndex = Number(studySelect.value); seriesIndex = 0; sliceIndex = 0; panX = 0; panY = 0; updateSeriesOptions(); draw(); });
  seriesSelect.addEventListener('change', () => { seriesIndex = Number(seriesSelect.value); sliceIndex = 0; panX = 0; panY = 0; draw(); });
  progress.addEventListener('input', () => { sliceIndex = Number(progress.value); draw(); });
  document.querySelector('#previous').addEventListener('click', () => go(-1));
  document.querySelector('#next').addEventListener('click', () => go(1));
  document.querySelector('#fullscreen').addEventListener('click', toggleFullscreen);
  document.querySelector('#zoomOut').addEventListener('click', () => changeZoom(-.1));
  document.querySelector('#zoomIn').addEventListener('click', () => changeZoom(.1));
  document.querySelector('#zoomReset').addEventListener('click', () => { zoom = 1; panX = 0; panY = 0; applyZoom(); });
  document.addEventListener('fullscreenchange', () => { document.querySelector('#fullscreen').textContent = document.fullscreenElement ? '⛶ 退出全屏' : '⛶ 全屏'; });
  document.addEventListener('webkitfullscreenchange', () => { document.querySelector('#fullscreen').textContent = document.webkitFullscreenElement ? '⛶ 退出全屏' : '⛶ 全屏'; });
  viewer.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); go(-1); }
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); go(1); }
    if (event.key === 'Home') { event.preventDefault(); sliceIndex = 0; draw(); }
    if (event.key === 'End') { event.preventDefault(); sliceIndex = currentSeries().images.length - 1; draw(); }
    if (event.key === '+' || event.key === '=') { event.preventDefault(); changeZoom(.1); }
    if (event.key === '-' || event.key === '_') { event.preventDefault(); changeZoom(-.1); }
    if (event.key === '0') { event.preventDefault(); zoom = 1; panX = 0; panY = 0; applyZoom(); }
    if (event.key.toLowerCase() === 'f') { event.preventDefault(); toggleFullscreen(); }
  });
  viewer.addEventListener('wheel', event => {
    event.preventDefault();
    wheelAccumulator += event.deltaY;
    if (Math.abs(wheelAccumulator) < 35) return;
    const direction = wheelAccumulator > 0 ? 1 : -1;
    wheelAccumulator = 0;
    go(direction);
  }, { passive: false });
  image.addEventListener('load', applyTransform);
  viewer.addEventListener('pointerdown', event => {
    touchStartX = event.clientX;
    pointerState = { x: event.clientX, y: event.clientY, startPanX: panX, startPanY: panY, dragging: zoom > 1 };
    if (pointerState.dragging) viewer.classList.add('is-dragging');
    viewer.setPointerCapture(event.pointerId);
  });
  viewer.addEventListener('pointermove', event => {
    if (!pointerState || !pointerState.dragging) return;
    panX = pointerState.startPanX + event.clientX - pointerState.x;
    panY = pointerState.startPanY + event.clientY - pointerState.y;
    applyTransform();
    event.preventDefault();
  });
  viewer.addEventListener('pointerup', event => {
    if (!pointerState || touchStartX === null) return;
    const wasDragging = pointerState.dragging;
    const distance = event.clientX - touchStartX;
    pointerState = null;
    touchStartX = null;
    viewer.classList.remove('is-dragging');
    if (wasDragging) return;
    if (Math.abs(distance) > 35) go(distance < 0 ? 1 : -1);
  });
  viewer.addEventListener('pointercancel', () => { pointerState = null; touchStartX = null; viewer.classList.remove('is-dragging'); });
  populateStudies();
  draw();
})();
