/* HUD bindings. Updated each frame from engine. */
(function () {
  const els = {
    timer:    document.getElementById('hud-timer'),
    watts:    document.getElementById('hud-watts'),
    energyBar:document.querySelector('#energy-bar > span'),
    energyBarWrap: document.getElementById('energy-bar'),
    hr:       document.getElementById('hud-hr'),
    zones:    document.getElementById('cadence-zones'),
    monument: document.getElementById('hud-monument'),
    posMarker:document.getElementById('pos-marker'),
    profileSvg: document.getElementById('profile-svg'),
    speed:    document.getElementById('hud-speed'),
    distance: document.getElementById('hud-distance'),
    distanceTotal: document.getElementById('hud-distance-total'),
    score:    document.getElementById('hud-score')
  };

  let lastScore = 0;
  let scoreBumpTimeout = null;

  function fmtTime(s) {
    const m = Math.floor(s / 60);
    const sec = (s - m * 60).toFixed(2).padStart(5, '0');
    return `${String(m).padStart(2, '0')}:${sec}`;
  }

  /* Heart-rate zones (pro endurance) → reuse the 5-dot strip. */
  function hrZone(bpm) {
    if (bpm < 142)  return 'low';
    if (bpm < 156)  return 'below';
    if (bpm <= 168) return 'ideal';
    if (bpm <= 180) return 'above';
    return 'anaer';
  }

  function setHRZones(bpm) {
    if (!els.zones) return;
    const z = hrZone(bpm);
    els.zones.dataset.zone = z;
    const lit = { low: 1, below: 2, ideal: 3, above: 4, anaer: 5 }[z];
    [...els.zones.children].forEach((s, i) => s.classList.toggle('lit', i < lit));
  }

  function setEnergyBar(energy) {
    if (!els.energyBarWrap) return;
    els.energyBar.style.width = `${Math.max(0, Math.min(100, energy))}%`;
    els.energyBarWrap.classList.toggle('warn', energy < 50 && energy >= 25);
    els.energyBarWrap.classList.toggle('crit', energy < 25);
  }

  window.rcUI = {
    els,
    fmtTime,
    hrZone,
    setHRZones,
    setEnergyBar,
    setMonumentName(name) { if (els.monument) els.monument.textContent = name; },
    setTimer(seconds)     { if (els.timer)    els.timer.textContent = fmtTime(seconds); },
    /* Power reserve bar (glycogen) — keeps driving the bonk/pickup mechanic. */
    setEnergy(value)      { setEnergyBar(value); },
    setWatts(w)           { if (els.watts) els.watts.textContent = Math.round(w); },
    setHR(bpm)            { if (els.hr) els.hr.textContent = Math.round(bpm); setHRZones(bpm); },
    /* Back-compat: old calls to setCadence now feed the HR strip harmlessly. */
    setCadence()          {},
    setProgressPct(pct)   { if (els.posMarker) els.posMarker.style.left = `${Math.max(0, Math.min(100, pct))}%`; },
    setSpeed(kmh)         { if (els.speed) els.speed.textContent = Math.round(kmh); },
    setDistance(km, total) {
      if (els.distance) els.distance.textContent = km.toFixed(1);
      if (els.distanceTotal && total != null) els.distanceTotal.textContent = total;
    },
    setScore(value) {
      if (!els.score) return;
      const v = Math.round(value);
      if (v !== lastScore) {
        const delta = v - lastScore;
        els.score.textContent = v;
        els.score.classList.remove('bump', 'minus');
        if (delta > 0) els.score.classList.add('bump');
        else if (delta < 0) els.score.classList.add('minus');
        clearTimeout(scoreBumpTimeout);
        scoreBumpTimeout = setTimeout(() => {
          els.score.classList.remove('bump', 'minus');
        }, 600);
        lastScore = v;
      }
    }
  };
})();
