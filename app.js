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

  studySelect.addEventListener('change', () => { studyIndex = Number(studySelect.value); seriesIndex = 0; sliceIndex = 0; updateSeriesOptions(); draw(); });
  seriesSelect.addEventListener('change', () => { seriesIndex = Number(seriesSelect.value); sliceIndex = 0; draw(); });
  progress.addEventListener('input', () => { sliceIndex = Number(progress.value); draw(); });
  document.querySelector('#previous').addEventListener('click', () => go(-1));
  document.querySelector('#next').addEventListener('click', () => go(1));
  viewer.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); go(-1); }
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); go(1); }
    if (event.key === 'Home') { event.preventDefault(); sliceIndex = 0; draw(); }
    if (event.key === 'End') { event.preventDefault(); sliceIndex = currentSeries().images.length - 1; draw(); }
  });
  viewer.addEventListener('wheel', event => {
    event.preventDefault();
    wheelAccumulator += event.deltaY;
    if (Math.abs(wheelAccumulator) < 35) return;
    const direction = wheelAccumulator > 0 ? 1 : -1;
    wheelAccumulator = 0;
    go(direction);
  }, { passive: false });
  viewer.addEventListener('pointerdown', event => { touchStartX = event.clientX; viewer.setPointerCapture(event.pointerId); });
  viewer.addEventListener('pointerup', event => {
    if (touchStartX === null) return;
    const distance = event.clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(distance) > 35) go(distance < 0 ? 1 : -1);
  });
  populateStudies();
  draw();
})();
