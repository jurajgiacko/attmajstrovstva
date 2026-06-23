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
        <p class="lead">Tvůj závodní den na MČR &amp; MSR v silniční cyklistice — od snídaně přes Ramzovou až po cíl na Masarykově náměstí. 52&nbsp;km, 1&nbsp;200&nbsp;m převýšení, pět taktických rozhodnutí.</p>
        <div class="intro-stats">
          <div><strong>52</strong><span>km</span></div>
          <div><strong>1 200</strong><span>m ↑</span></div>
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
