/* Intro scene — title + monument hero illustration + "Začať deň" CTA. */
(function () {
  const canvas = () => document.getElementById('game-canvas');
  let overlay = null;

  function buildOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'scene-intro';
    overlay.className = 'scene-overlay scene-intro';
    overlay.innerHTML = `
      <div class="bg-art" id="intro-bg"></div>
      <div class="intro-shell">
        <div class="kicker">ATT Investments × Enervit</div>
        <h1 class="title-display">Jeseník</h1>
        <p class="lead">Den mistrovství republiky. Jezdec týmu <strong>ATT Investments</strong> — zázemí, mechanici i sportovní ředitel jedou za tebou, ty řešíš jen výkon. Od týmového hotelu přes stoupání na Rejvíz až po cíl na Masarykově náměstí. Okruh 26,2&nbsp;km, 490&nbsp;m převýšení. (Muži Elite: 8 okruhů, 209&nbsp;km.)</p>
        <div class="intro-stats">
          <div><strong>26,2</strong><span>km / okruh</span></div>
          <div><strong>490</strong><span>m ↑ / okruh</span></div>
          <div><strong>~2</strong><span>min hra</span></div>
        </div>
        <button type="button" class="btn btn-primary big" id="intro-start">Vyber si jezdce</button>
        <a class="back" href="/">← zpět na šampionát</a>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#intro-start').addEventListener('click', () => {
      window.rcScenes.go('rider-select');
    });
    return overlay;
  }

  async function enter(journey) {
    buildOverlay();
    /* Set hero background to a landscape illustration */
    const bg = overlay.querySelector('#intro-bg');
    bg.style.backgroundImage = "url('/assets/scenes/landscapes/jesenik-morning.png')";
    overlay.classList.add('show');
    /* Hide the canvas — intro is HTML-only */
    canvas() && (canvas().style.display = 'none');
  }

  async function exit() {
    overlay && overlay.classList.remove('show');
    canvas() && (canvas().style.display = '');
  }

  window.rcScenes.register('intro', { enter, exit });
})();
