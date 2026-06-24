/* Recovery scene — appears between finish stats and afterparty.
   Three illustrated choices, each unlocks a different evening mood and
   contributes a small bonus to the final score. */
(function () {
  let overlay = null;

  const OPTIONS = [
    {
      id:    'prosecco',
      label: 'Přípitek s týmem',
      sub:   'Oslava na podiu · +50 k náladě',
      img:   '/assets/scenes/finish/recovery-prosecco.png',
      mood:  'celebrate',
      bonus: 50
    },
    {
      id:    'pivo',
      label: 'České pivo',
      sub:   'Klasika po závodě · +30 regenerace',
      img:   '/assets/scenes/finish/recovery-beer.png',
      mood:  'classic',
      bonus: 30
    },
    {
      id:    'r2',
      label: 'Enervit R2 Recovery',
      sub:   'Profi regenerace · +60',
      img:   '/assets/scenes/finish/recovery-r2.png',
      mood:  'pro',
      bonus: 60
    }
  ];

  function build() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'scene-recovery';
    overlay.className = 'scene-overlay scene-prerace';
    overlay.innerHTML = `
      <div class="bg-art" style="background-image:url('/assets/scenes/finish/finish-celebration.png')"></div>
      <div class="prerace-shell">
        <div class="step-pill">V cíli · Recovery</div>
        <h2 class="title-display">Čím si připomeneš?</h2>
        <p class="lead">Zasloužíš si — ale i to, co si vybereš teď, ovlivní jak se cítíš večer.</p>
        <div class="food-cards" id="rec-cards">
          ${OPTIONS.map(o => `
            <button type="button" class="food-card" data-id="${o.id}">
              <div class="food-card-img" style="background-image:url('${o.img}')"></div>
              <div class="food-card-label">${o.label}</div>
              <div class="food-card-sub">${o.sub}</div>
            </button>
          `).join('')}
        </div>
        <div class="prerace-foot">Volba ovlivní afterparty atmosféru.</div>
      </div>
    `;
    document.body.appendChild(overlay);
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
    if (!opt) return;
    const j = window.rcScenes.journey();
    j.recovery = id;
    j.recoveryMood = opt.mood;
    j.recoveryBonus = opt.bonus;
    j.score = (j.score || 0) + opt.bonus;
    window.rcTrack && window.rcTrack('recovery_choice', { id, bonus: opt.bonus });
    window.rcScenes.go('afterparty');
  }

  async function enter() {
    build();
    /* Hide the finish modal + any leftover overlay so they can't sit on top
       of the recovery cards and steal taps. */
    document.querySelectorAll('.finish-modal.show, .tactic-modal.show, .landmark-card.show')
      .forEach(e => e.classList.remove('show'));
    const cf = document.getElementById('confetti'); if (cf) cf.innerHTML = '';
    overlay.classList.add('show');
  }
  async function exit() { overlay && overlay.classList.remove('show'); }

  window.rcScenes.register('recovery', { enter, exit });
})();
