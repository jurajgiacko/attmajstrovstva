/* Rider-selection scene — pick one of the 17 ATT Investments riders (cosmetic).
   Stores the chosen rider on journey.rider, then advances to the route map. */
(function () {
  let overlay = null;

  /* Roster — slug matches /assets/scenes/characters/rider-<slug>.png */
  const RIDERS = [
    { slug: 'vanicek',      name: 'Šimon Vaníček',       role: 'Vrchař · cyklokros',  flag: '🇨🇿' },
    { slug: 'reha',         name: 'Filip Řeha',          role: 'Vrchař',              flag: '🇨🇿' },
    { slug: 'voltr',        name: 'Martin Voltr',        role: 'Všestranný',          flag: '🇨🇿' },
    { slug: 'neuman',       name: 'Dominik Neuman',      role: 'Zkušený elite',       flag: '🇨🇿' },
    { slug: 'riman',        name: 'Jakub Říman',         role: 'Elite',               flag: '🇨🇿' },
    { slug: 'pospisil',     name: 'Jiří Pospíšil',       role: 'Domestik',            flag: '🇨🇿' },
    { slug: 'barta',        name: 'Martin Bárta',        role: 'Mladá generace',      flag: '🇨🇿' },
    { slug: 'kral',         name: 'Kryštof Král',        role: 'Junior · talent',     flag: '🇨🇿' },
    { slug: 'banaszek',     name: 'Norbert Banaszek',    role: 'Sprinter',            flag: '🇵🇱' },
    { slug: 'boguslawski',  name: 'Marceli Bogusławski', role: 'Sprinter',            flag: '🇵🇱' },
    { slug: 'pomorski',     name: 'Michał Pomorski',     role: 'Klasikář',            flag: '🇵🇱' },
    { slug: 'pawlak',       name: 'Tobiasz Pawlak',      role: 'Boční vítr',          flag: '🇵🇱' },
    { slug: 'pekala',       name: 'Piotr Pękala',        role: 'Etapový jezdec',      flag: '🇵🇱' },
    { slug: 'budzinski',    name: 'Tomasz Budziński',    role: 'Elite',               flag: '🇵🇱' },
    { slug: 'gajdulewicz',  name: 'Mateusz Gajdulewicz', role: 'U23',                 flag: '🇵🇱' },
    { slug: 'heming',       name: 'Miká Heming',         role: 'Silničář',            flag: '🇩🇪' },
    { slug: 'monti',        name: 'Alberto Carlo Monti', role: 'GC · etapy',          flag: '🇮🇹' }
  ];

  function injectStyles() {
    if (document.getElementById('rider-select-styles')) return;
    const st = document.createElement('style');
    st.id = 'rider-select-styles';
    st.textContent = `
      #scene-rider-select { display:flex; flex-direction:column; align-items:center; overflow:hidden; }
      #scene-rider-select .rs-shell { width:100%; max-width:760px; display:flex; flex-direction:column; height:100%; padding:18px 14px 0; }
      #scene-rider-select .rs-head { text-align:center; flex:0 0 auto; }
      #scene-rider-select .rs-head .step-pill { display:inline-block; }
      #scene-rider-select .rs-head h2 { margin:.3em 0 .15em; }
      #scene-rider-select .rs-head .lead { margin:0 0 12px; opacity:.85; font-size:.95rem; }
      #scene-rider-select .rs-grid {
        flex:1 1 auto; overflow-y:auto; -webkit-overflow-scrolling:touch;
        display:grid; grid-template-columns:repeat(2, 1fr); gap:10px;
        padding:4px 2px 96px; align-content:start;
      }
      @media (min-width:520px){ #scene-rider-select .rs-grid { grid-template-columns:repeat(3,1fr); } }
      @media (min-width:720px){ #scene-rider-select .rs-grid { grid-template-columns:repeat(4,1fr); } }
      #scene-rider-select .rs-card {
        background:rgba(0,32,91,.55); border:2px solid rgba(241,204,126,.25);
        border-radius:16px; padding:8px 8px 10px; cursor:pointer; text-align:center;
        transition:transform .15s, border-color .15s, background .15s; color:#f0e4c8;
      }
      #scene-rider-select .rs-card:hover { transform:translateY(-3px); border-color:#f1cc7e; background:rgba(0,42,107,.7); }
      #scene-rider-select .rs-card.sel { border-color:#f1cc7e; background:rgba(0,42,107,.9); box-shadow:0 0 0 3px rgba(241,204,126,.3); }
      #scene-rider-select .rs-av {
        width:100%; aspect-ratio:1/1; border-radius:12px; background-size:cover; background-position:center top;
        background-color:#001230; margin-bottom:6px;
      }
      #scene-rider-select .rs-name { font-weight:700; font-size:.82rem; line-height:1.15; }
      #scene-rider-select .rs-role { font-size:.7rem; opacity:.7; margin-top:2px; }
      #scene-rider-select .rs-foot {
        position:absolute; left:0; right:0; bottom:0; padding:14px 16px calc(14px + env(safe-area-inset-bottom));
        display:flex; gap:10px; justify-content:center; align-items:center;
        background:linear-gradient(to top, rgba(0,17,46,.98), rgba(0,17,46,.0));
      }
      #scene-rider-select .rs-foot .rs-chosen { font-size:.85rem; opacity:.85; }
      #scene-rider-select .rs-foot .btn { min-width:170px; }
      #scene-rider-select .rs-foot .btn[disabled] { opacity:.4; pointer-events:none; }
    `;
    document.head.appendChild(st);
  }

  let chosen = null;

  function build() {
    if (overlay) return overlay;
    injectStyles();
    overlay = document.createElement('div');
    overlay.id = 'scene-rider-select';
    overlay.className = 'scene-overlay scene-prerace';
    overlay.innerHTML = `
      <div class="rs-shell">
        <div class="rs-head">
          <div class="step-pill">ATT Investments · sestava 2026</div>
          <h2 class="title-display">Vyber si jezdce</h2>
          <p class="lead">Za koho dnes pojedeš na MČR &amp; MSR? Celá sestava ATT Investments je na startu.</p>
        </div>
        <div class="rs-grid" id="rs-grid">
          ${RIDERS.map(r => `
            <button type="button" class="rs-card" data-slug="${r.slug}">
              <div class="rs-av" style="background-image:url('/assets/scenes/characters/rider-${r.slug}.png')"></div>
              <div class="rs-name">${r.flag} ${r.name}</div>
              <div class="rs-role">${r.role}</div>
            </button>
          `).join('')}
        </div>
      </div>
      <div class="rs-foot">
        <span class="rs-chosen" id="rs-chosen">Klepni na jezdce</span>
        <button type="button" class="btn btn-primary big" id="rs-go" disabled>Na trasu →</button>
      </div>
    `;
    document.body.appendChild(overlay);

    const grid = overlay.querySelector('#rs-grid');
    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.rs-card');
      if (!card) return;
      grid.querySelectorAll('.rs-card.sel').forEach(c => c.classList.remove('sel'));
      card.classList.add('sel');
      const r = RIDERS.find(x => x.slug === card.dataset.slug);
      chosen = r;
      overlay.querySelector('#rs-chosen').textContent = `${r.name} · ${r.role}`;
      const go = overlay.querySelector('#rs-go');
      go.disabled = false;
    });

    overlay.querySelector('#rs-go').addEventListener('click', () => {
      if (!chosen) return;
      const j = window.rcScenes.journey();
      j.rider = { id: chosen.slug, name: chosen.name, role: chosen.role, sprite: `rider-${chosen.slug}` };
      window.rcTrack && window.rcTrack('rider_picked', { rider: chosen.slug });
      window.rcScenes.go('map');
    });
    return overlay;
  }

  async function enter() {
    build();
    overlay.classList.add('show');
    const canvas = document.getElementById('game-canvas');
    canvas && (canvas.style.display = 'none');
  }
  async function exit() {
    overlay && overlay.classList.remove('show');
  }

  window.rcScenes.register('rider-select', { enter, exit });
})();
