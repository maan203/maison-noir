'use strict';

/* ═══════════════════════════════════════════════════
   MAISON NOIR
   ═══════════════════════════════════════════════════ */

/* ── Frame count — update if you re-extract at a different fps ── */
var TOTAL_FRAMES = 240;

/* ═══════════════════════════════════════════════════
   HERO FRAME SCRUBBER
   ═══════════════════════════════════════════════════ */
(function () {

    var hero     = document.getElementById('hero');
    var canvas   = document.getElementById('heroCanvas');
    var overlay  = document.getElementById('heroOverlay');
    var content  = document.getElementById('heroContent');
    var cue      = document.getElementById('scrollCue');
    var loading  = document.getElementById('heroLoading');
    var fallback = document.getElementById('heroFallback');
    var fillBar  = document.getElementById('heroLoadFill');
    var pctLabel = document.getElementById('heroLoadPct');

    if (!canvas) { console.error('heroCanvas not found'); return; }
    if (!hero)   { console.error('hero not found'); return; }

    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;

    /* ── size canvas to viewport ── */
    function resize() {
        dpr = window.devicePixelRatio || 1;
        canvas.width  = Math.round(window.innerWidth  * dpr);
        canvas.height = Math.round(window.innerHeight * dpr);
        canvas.style.width  = window.innerWidth  + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (lastDrawn >= 0) paint(lastDrawn, true);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    /* ── cached scroll geometry ── */
    var heroTop  = 0;
    var heroSpan = 1;
    function cacheGeo() {
        heroTop  = hero.offsetTop;
        heroSpan = Math.max(1, hero.offsetHeight - window.innerHeight);
    }

    /* scale track to frame count */
    var trackVh = Math.max(300, Math.min(700, Math.round(100 + TOTAL_FRAMES * 3.5)));
    hero.style.height = trackVh + 'vh';
    cacheGeo();
    window.addEventListener('resize', cacheGeo, { passive: true });

    /* ── keyframe map ── */
    function interp(v, ins, outs) {
        if (v <= ins[0]) return outs[0];
        if (v >= ins[ins.length - 1]) return outs[outs.length - 1];
        for (var i = 0; i < ins.length - 1; i++) {
            if (v >= ins[i] && v <= ins[i + 1]) {
                var t = (v - ins[i]) / (ins[i + 1] - ins[i]);
                return outs[i] + (outs[i + 1] - outs[i]) * t;
            }
        }
        return outs[outs.length - 1];
    }

    /* ── draw frame to canvas (object-cover) ── */
    var lastDrawn = -1;
    function paint(idx, force) {
        var img = frames[idx];
        if (!img || !img.complete || !img.naturalWidth) return false;
        if (!force && idx === lastDrawn) return true;
        lastDrawn = idx;
        var cw = canvas.width / dpr, ch = canvas.height / dpr;
        var s  = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(img,
            (cw - img.naturalWidth  * s) / 2,
            (ch - img.naturalHeight * s) / 2,
            img.naturalWidth  * s,
            img.naturalHeight * s);
        return true;
    }

    /* ── overlays ── */
    function overlays(p) {
        if (overlay) overlay.style.opacity = interp(p, [0,.4,1], [.55,.22,.6]);
        if (content) {
            content.style.opacity   = interp(p, [0,.08,.35,.5], [1,1,.1,0]);
            content.style.transform = 'translateY(' + p * -60 + 'px)';
        }
        if (cue) cue.style.opacity = interp(p, [0,.05], [1,0]);
    }

    /* ── RAF tick ── */
    function tick() {
        requestAnimationFrame(tick);
        var p   = Math.max(0, Math.min(1, (window.scrollY - heroTop) / heroSpan));
        overlays(p);
        if (TOTAL_FRAMES > 0) {
            paint(Math.min(Math.round(p * (TOTAL_FRAMES - 1)), TOTAL_FRAMES - 1), false);
        }
    }
    requestAnimationFrame(tick);

    /* ── dismiss loading helper ── */
    function dismissLoading() {
        if (loading)  loading.classList.add('is-hidden');
        if (fallback) { fallback.style.transition = 'opacity .6s'; fallback.style.opacity = '0'; }
    }

    /* ── load all frames as plain Image objects ── */
    var frames   = [];
    var loaded   = 0;

    function pad(n) { return ('0000' + n).slice(-4); }

    for (var i = 0; i < TOTAL_FRAMES; i++) {
        (function (idx) {
            var img = new Image();
            frames[idx] = img;                      /* store before src so array is filled */
            img.onload = function () {
                loaded++;
                var pct = Math.round(loaded / TOTAL_FRAMES * 100);
                if (fillBar)  fillBar.style.width  = pct + '%';
                if (pctLabel) pctLabel.textContent  = pct + '%';
                if (idx === 0) dismissLoading();
            };
            img.onerror = function () {
                loaded++;
                if (idx === 0) dismissLoading();    /* dismiss even on error */
            };
            img.src = 'frames/' + pad(idx + 1) + '.jpg';
        }(i));
    }

    /* safety net — if frame 0 hasn't loaded in 8 s, dismiss anyway */
    setTimeout(function () {
        if (loading && !loading.classList.contains('is-hidden')) dismissLoading();
    }, 8000);

}());


/* ═══════════════════════════════════════════════════
   REVEAL ON SCROLL
   ═══════════════════════════════════════════════════ */
(function () {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
        els.forEach(function (e) { e.classList.add('is-visible'); });
        return;
    }
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            var el = en.target, delay = parseFloat(el.dataset.delay || 0) * 1000;
            setTimeout(function () { el.classList.add('is-visible'); }, delay);
            io.unobserve(el);
        });
    }, { rootMargin: '-80px 0px' });
    els.forEach(function (e) { io.observe(e); });
}());


/* ═══════════════════════════════════════════════════
   ANCHOR SCROLLING
   ═══════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
        var t = document.querySelector(a.getAttribute('href'));
        if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: 'smooth' });
    });
});


/* ═══════════════════════════════════════════════════
   NUMBER COUNT-UP
   ═══════════════════════════════════════════════════ */
(function () {
    var els = document.querySelectorAll('.number-value[data-target]');
    if (!els.length) return;

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function countUp(el) {
        var target  = parseInt(el.dataset.target, 10);
        var start   = performance.now();
        var dur     = 1600;
        (function tick(now) {
            var p   = Math.min((now - start) / dur, 1);
            el.textContent = Math.round(easeOut(p) * target);
            if (p < 1) requestAnimationFrame(tick);
        }(start));
    }

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            countUp(en.target);
            io.unobserve(en.target);
        });
    }, { rootMargin: '-60px 0px' });
    els.forEach(function (el) { io.observe(el); });
}());


/* ═══════════════════════════════════════════════════
   CONTACT FORM
   ═══════════════════════════════════════════════════ */
(function () {
    var form = document.getElementById('contactForm');
    var ok   = document.getElementById('formSuccess');
    if (!form || !ok) return;
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        form.style.cssText += ';transition:opacity .4s;opacity:0;pointer-events:none';
        setTimeout(function () { form.style.display = 'none'; ok.classList.add('is-visible'); }, 420);
    });
}());


/* ═══════════════════════════════════════════════════
   GOLD CURSOR DOT
   ═══════════════════════════════════════════════════ */
(function () {
    if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    var dot = document.createElement('div');
    dot.style.cssText = 'position:fixed;top:0;left:0;width:6px;height:6px;border-radius:50%;background:#d4b896;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);opacity:0;transition:opacity .3s,transform .2s;will-change:left,top';
    document.body.appendChild(dot);
    var cx = 0, cy = 0, mx = 0, my = 0;
    (function loop() { requestAnimationFrame(loop); cx += (mx-cx)*.15; cy += (my-cy)*.15; dot.style.left = cx+'px'; dot.style.top = cy+'px'; }());
    window.addEventListener('mousemove', function (e) { mx=e.clientX; my=e.clientY; dot.style.opacity='.8'; });
    window.addEventListener('mouseleave', function () { dot.style.opacity='0'; });
    document.addEventListener('mouseover',  function (e) { if (e.target.closest('a,button')) { dot.style.transform='translate(-50%,-50%) scale(3.5)'; dot.style.opacity='.35'; } });
    document.addEventListener('mouseout',   function (e) { if (e.target.closest('a,button')) { dot.style.transform='translate(-50%,-50%) scale(1)';   dot.style.opacity='.8';  } });
}());
