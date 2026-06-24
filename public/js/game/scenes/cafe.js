/* Mid-race café stop scene — fired at ~50% race progress.
   Local Moravian café terrace pop-in, three illustrated choices for
   what to grab. Each adds a different time / energy / score effect. */
(function () {
  let overlay = null;
  let armed = false;
  let timer = null;

  const OPTIONS = [
    {
      id:    'gel',
      label: 'Carbo Gel C2:1PRO',
      sub:   '+18 výkonu · rychlý boost',
      img:   '/assets/scenes/stations/item-gel-sachet.png',
      energy: 18, boost: 1.12, dur: 12, time: 0, score: 90
    },
    {
      id:    'isocarb',
      label: 'Isocarb C2:1PRO',
      sub:   '+14 výkonu · hydratace + boost',
      img:   '/assets/scenes/stations/item-isocarb-sachet.png',
      energy: 14, boost: 1.06, dur: 16, time: 0, score: 85
    },
    {
      id:    'bar',
      label: 'Carbo Bar C2:1PRO',
      sub:   '+28 výkonu · nejvíc kalorií',
      img:   '/assets/scenes/stations/item-bar-wrapped.png',
      energy: 28, boost: 1.0,  dur: 0,  time: 0, score: 110
    },
    {
      id:    'skip',
      label: 'Nestavím — držím tempo',
      sub:   'Žádné doplnění, žádný bonus',
      img:   null,
      energy: 0, boost: 1.0, dur: 0, time: 0, score: 0
    }
  ];

  function build() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'scene-cafe';
    overlay.className = 'scene-overlay scene-cafe';
    overlay.innerHTML = `
      <div class="bg-art" style="background-image:url('/assets/scenes/landscapes/cervenohorske-sedlo.png')"></div>
      <div class="prerace-shell">
        <div class="step-pill">~50 % okruhu · Občerstvovačka</div>
        <h2 class="title-display">Týmový vůz u silnice</h2>
        <p class="lead">Sportovní ředitel se vyklání z auta s lahví a gelem. Vezmeš si rychlé občerstvení?</p>
        <div class="food-cards" id="cafe-cards">
          ${OPTIONS.map(o => `
            <button type="button" class="food-card${o.id === 'skip' ? ' food-skip' : ''}" data-id="${o.id}">
              ${o.img ? `<div class="food-card-img" style="background-image:url('${o.img}')"></div>` : `<div class="food-card-img food-card-skip" aria-hidden="true">⌁</div>`}
              <div class="food-card-label">${o.label}</div>
              <div class="food-card-sub">${o.sub}</div>
            </button>
          `).join('')}
        </div>
        <div class="prerace-foot">5s na výběr · default Přeskočit</div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.style.zIndex = '1100';   /* above landmark/finish overlays */
    overlay.querySelectorAll('.food-card').forEach(btn => {
      let done = false;
      const pick = (e) => { if (done) return; done = true; e.preventDefault(); choose(btn.dataset.id); };
      btn.addEventListener('pointerup', pick);
      btn.addEventListener('touchend', pick);
      btn.addEventListener('click', pick);
    });
    return overlay;
  }

  function choose(id) {
    const opt = OPTIONS.find(o => o.id === id);
    if (!opt || !window.rcEngine) return;
    const state = window.rcEngine.getState();
    if (timer) { clearTimeout(timer); timer = null; }
    /* Apply effects */
    state.energy = Math.max(0, Math.min(100, state.energy + opt.energy));
    if (opt.boost > 1 && opt.dur > 0) {
      state.boostMul = Math.max(state.boostMul || 1, opt.boost);
      state.boostUntil = state.elapsed + opt.dur;
    }
    /* Time penalty: nudge elapsed forward (player loses N seconds) */
    if (opt.time > 0) state.elapsed += opt.time;
    /* Score */
    state.score = (state.score || 0) + opt.score;
    /* Resume race */
    state.paused = false;
    overlay && overlay.classList.remove('show');
    window.rcTrack && window.rcTrack('cafe_choice', { id, energy: opt.energy, time: opt.time });
  }

  function tick(state) {
    if (armed || !state || state.progressPct < 50 || state.paused || state.finished) return;
    armed = true;
    /* Pause race + open overlay */
    state.paused = true;
    build();
    /* Make sure no landmark card is left on top of the feed-zone overlay. */
    document.querySelectorAll('.landmark-card.show').forEach(e => e.classList.remove('show'));
    overlay.classList.add('show');
    /* auto-default to "skip" if no choice */
    timer = setTimeout(() => choose('skip'), 8000);
  }

  function reset() {
    armed = false;
    if (timer) { clearTimeout(timer); timer = null; }
    overlay && overlay.classList.remove('show');
  }

  window.rcCafe = { tick, reset };
})();
