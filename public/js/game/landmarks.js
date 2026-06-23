/* Landmarks — full-screen chapter cards triggered by progressPct.
   When the player crosses into a new landmark zone, briefly pause the
   game and show the landscape illustration with the zone label.
   After ~1.6s the vignette fades out and the race resumes. */
(function () {
  /* 7 zones along the Pálava 124 km route, each tied to one landscape PNG */
  const ZONES = [
    { from: 0,  to: 12, art: 'jesenik-morning',        label: 'Start · Jeseník',          subtitle: 'Masarykovo náměstí, 10:00' },
    { from: 12, to: 25, art: 'lipova-lazne',           label: 'Lipová-lázně',             subtitle: '~10 km · údolí pod horami' },
    { from: 25, to: 38, art: 'ramzova-village',        label: 'Ostružná → Ramzová',       subtitle: '~22 km · před průsmykem' },
    { from: 38, to: 50, art: 'ramzova-climb',          label: 'Stoupání na Ramzovou',     subtitle: '~24 km · 8.5 % gradient' },
    { from: 50, to: 65, art: 'cervenohorske-sedlo',    label: 'Červenohorské sedlo',      subtitle: '~30 km · vítr přes hřeben' },
    { from: 65, to: 80, art: 'praded-vista',           label: 'Pod Pradědem',             subtitle: '~38 km · sjezd k Branné' },
    { from: 80, to: 100,art: 'jesenik-finish',         label: 'Cíl · Masarykovo nám.',    subtitle: '~52 km · dojezd v Jeseníku' }
  ];

  let currentZone = -1;
  let card = null;

  function buildCard() {
    if (card) return card;
    card = document.createElement('div');
    card.className = 'landmark-card';
    card.innerHTML = `
      <div class="lm-art" id="lm-art"></div>
      <div class="lm-text">
        <div class="lm-kicker" id="lm-kicker">Zóna 1 z 7</div>
        <h3 class="lm-title" id="lm-title">…</h3>
        <p class="lm-sub" id="lm-sub">…</p>
      </div>
      <div class="lm-actions">
        <button type="button" class="lm-btn lm-capture" id="lm-capture" title="Stáhnout jako wallpaper" aria-label="Stáhnout jako wallpaper">📷  Foto</button>
        <button type="button" class="lm-btn lm-continue" id="lm-continue" aria-label="Pokračuj v race">Pokračuj →</button>
      </div>
    `;
    document.body.appendChild(card);
    card.querySelector('#lm-capture').addEventListener('click', captureWallpaper);
    card.querySelector('#lm-continue').addEventListener('click', dismissCard);
    return card;
  }

  /* Active state of the card so dismiss can resume the right paused flag */
  let activeWasPaused = false;
  let activeStateRef = null;
  function dismissCard() {
    if (!card) return;
    card.classList.remove('show');
    if (activeStateRef) {
      setTimeout(() => { activeStateRef.paused = activeWasPaused; activeStateRef = null; }, 350);
    }
  }

  /* Generate a 1080×1920 mobile-wallpaper PNG from the current zone:
     landscape illustration as cover, brand badge top, footer caption.
     Triggers a download (or Web Share on mobile). */
  let activeZone = null;
  async function captureWallpaper(e) {
    e.stopPropagation();
    const zoneIdx = Math.max(0, ZONES.findIndex(z => z === activeZone));
    const z = ZONES[zoneIdx] || ZONES[0];
    const canvas = document.createElement('canvas');
    canvas.width  = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');

    /* Background: landscape illustration cover-fit */
    const land = await loadImg(`/assets/scenes/landscapes/${z.art}.png`);
    if (land) drawCover(ctx, land, 0, 0, 1080, 1920);

    /* Wine wash overlay */
    const wash = ctx.createLinearGradient(0, 0, 0, 1920);
    wash.addColorStop(0,   'rgba(8,2,8,0.55)');
    wash.addColorStop(0.4, 'rgba(8,2,8,0.15)');
    wash.addColorStop(1,   'rgba(8,2,8,0.85)');
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, 1080, 1920);

    /* Top badges */
    const rcLogo = await loadImg('/assets/logos/att_investments_logo.svg');
    const enLogo = await loadImg('/assets/logos/enervit_logo_white.svg');
    if (rcLogo) ctx.drawImage(rcLogo, 60, 90, 300, 73);
    if (enLogo) ctx.drawImage(enLogo, 760, 95, 240, 64);

    /* Big "×" between logos */
    ctx.fillStyle = '#f1cc7e';
    ctx.font = '700 40px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('×', 540, 130);

    /* Title block bottom */
    ctx.fillStyle = '#f6dca6';
    ctx.font = '900 88px "Fraunces", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(z.label, 540, 1620);

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '500 32px "Inter", sans-serif';
    ctx.fillText(z.subtitle, 540, 1690);

    ctx.fillStyle = 'rgba(241,204,126,0.75)';
    ctx.font = '700 24px "Inter", sans-serif';
    ctx.letterSpacing = '0.2em';
    ctx.fillText('JESENÍK · MČR & MSR SILNICE 2026', 540, 1820);

    /* Trigger download (or Web Share on mobile) */
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const filename = `att-jesenik-${z.art}.png`;
      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Jeseník · ${z.label}`,
            text: 'ATT Investments × Enervit · MČR & MSR Silnice 2026'
          });
        } catch { /* cancelled */ }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
      }
      window.rcTrack && window.rcTrack('wallpaper_saved', { zone: z.art });
    }, 'image/png');
  }

  function loadImg(src) {
    return new Promise(res => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => res(null);
      img.src = src;
    });
  }

  function drawCover(ctx, img, x, y, w, h) {
    const ar = img.width / img.height;
    const target = w / h;
    let dw, dh, dx, dy;
    if (ar > target) {
      dh = h; dw = h * ar; dx = x - (dw - w) / 2; dy = y;
    } else {
      dw = w; dh = w / ar; dx = x; dy = y - (dh - h) / 2;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  /* Show a vignette for the given zone index. Pauses the race; the player
     dismisses with the Pokračuj button (or 📷 to grab a wallpaper). */
  function show(idx, state) {
    const z = ZONES[idx];
    if (!z) return;
    activeZone = z;
    buildCard();
    document.getElementById('lm-art').style.backgroundImage = `url('/assets/scenes/landscapes/${z.art}.png')`;
    document.getElementById('lm-kicker').textContent = `Zóna ${idx + 1} z ${ZONES.length}`;
    document.getElementById('lm-title').textContent = z.label;
    document.getElementById('lm-sub').textContent = z.subtitle;

    activeWasPaused = state.paused;
    activeStateRef = state;
    state.paused = true;
    card.classList.add('show');
    window.rcTrack && window.rcTrack('landmark_enter', { zone: idx, art: z.art });
  }

  function tick(state) {
    if (!state || !state.monument) return;
    /* Skip while another overlay (tactic modal, café stop, finish) is up */
    if (state.paused || state.finished) return;
    const pct = state.progressPct || 0;
    const zoneAt = (p) => ZONES.findIndex(z => p >= z.from && p < z.to);
    const idx = zoneAt(pct);
    if (idx !== -1 && idx !== currentZone) {
      currentZone = idx;
      /* Skip the very first zone fanfare (player already saw intro/start),
         but show all subsequent ones */
      if (idx > 0) show(idx, state);
    }
  }

  function reset() { currentZone = -1; }

  function activeArt(pct) {
    const z = ZONES.find(z => pct >= z.from && pct < z.to) || ZONES[0];
    return z.art;
  }

  window.rcLandmarks = { tick, reset, activeArt, ZONES };
})();
