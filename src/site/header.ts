// Sky canvas header — animated day/night cycle driven by real clock time.

type RGB = [number, number, number];

interface SkyKeyframe {
    hour: number;
    top: RGB;
    mid: RGB;
    bot: RGB;
}

interface Star {
    x: number;      // 0–1 normalized
    y: number;      // 0–1 normalized
    r: number;      // radius px
    phase: number;  // twinkle offset
    speed: number;  // twinkle speed
}

// ── Sky palette (Catppuccin Mocha + dawn/dusk tones) ──────────────────────────

const KEYFRAMES: SkyKeyframe[] = [
    { hour: 0,  top: [17,  17,  27],   mid: [30,  30,  46],   bot: [30,  30,  46]  }, // midnight
    { hour: 4,  top: [24,  24,  37],   mid: [36,  39,  58],   bot: [49,  50,  68]  }, // pre-dawn
    { hour: 6,  top: [69,  71,  90],   mid: [250, 179, 135],  bot: [235, 160, 172] }, // dawn
    { hour: 8,  top: [30,  102, 245],  mid: [116, 199, 236],  bot: [137, 220, 235] }, // morning
    { hour: 12, top: [30,  102, 245],  mid: [116, 199, 236],  bot: [137, 220, 235] }, // midday
    { hour: 17, top: [30,  102, 245],  mid: [116, 199, 236],  bot: [137, 220, 235] }, // late afternoon
    { hour: 18, top: [69,  71,  90],   mid: [250, 179, 135],  bot: [235, 160, 172] }, // dusk
    { hour: 20, top: [24,  24,  37],   mid: [36,  39,  58],   bot: [49,  50,  68]  }, // evening
    { hour: 24, top: [17,  17,  27],   mid: [30,  30,  46],   bot: [30,  30,  46]  }, // midnight (wrap)
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

function lerpRGB(a: RGB, b: RGB, t: number): RGB {
    return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function rgba(c: RGB, a = 1): string {
    return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
}

function getSkyAt(hour: number): { top: RGB; mid: RGB; bot: RGB } {
    hour = ((hour % 24) + 24) % 24;
    for (let i = 0; i < KEYFRAMES.length - 1; i++) {
        const a = KEYFRAMES[i], b = KEYFRAMES[i + 1];
        if (hour >= a.hour && hour < b.hour) {
            const t = (hour - a.hour) / (b.hour - a.hour);
            return { top: lerpRGB(a.top, b.top, t), mid: lerpRGB(a.mid, b.mid, t), bot: lerpRGB(a.bot, b.bot, t) };
        }
    }
    return { top: KEYFRAMES[0].top, mid: KEYFRAMES[0].mid, bot: KEYFRAMES[0].bot };
}

// 0 = full day, 1 = full night
function nightness(hour: number): number {
    const angle = Math.PI / 2 - ((hour - 12) / 12) * Math.PI;
    return Math.max(0, -Math.sin(angle));
}

// Inverse of: sunAngle = π/2 − (hour − 12) / 12 × π
function angleToHour(angle: number): number {
    return 12 + 12 * (Math.PI / 2 - angle) / Math.PI;
}

// ── Stars ─────────────────────────────────────────────────────────────────────

function makeStars(count: number): Star[] {
    const out: Star[] = [];
    for (let i = 0; i < count; i++) {
        out.push({
            x: Math.random(),
            y: Math.random() * 0.85,
            r: 0.5 + Math.random() * 1.5,
            phase: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 1.5,
        });
    }
    return out;
}

function drawStars(ctx: CanvasRenderingContext2D, stars: Star[], w: number, h: number, alpha: number, t: number): void {
    ctx.save();
    for (const s of stars) {
        const twinkle = 0.6 + 0.4 * Math.sin(t * s.speed * 0.001 + s.phase);
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(205,214,244,${alpha * twinkle})`;
        ctx.fill();
    }
    ctx.restore();
}

// ── Sun ───────────────────────────────────────────────────────────────────────

function drawSun(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
    const corona = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 3.5);
    corona.addColorStop(0, 'rgba(255,220,80,0.55)');
    corona.addColorStop(1, 'rgba(255,220,80,0)');
    ctx.beginPath();
    ctx.arc(x, y, r * 3.5, 0, Math.PI * 2);
    ctx.fillStyle = corona;
    ctx.fill();

    const disc = ctx.createRadialGradient(x, y, 0, x, y, r);
    disc.addColorStop(0, '#ffffff');
    disc.addColorStop(0.5, '#fff9d6');
    disc.addColorStop(1, '#ffd700');
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = disc;
    ctx.fill();
}

// ── Moon (crescent via offscreen canvas) ──────────────────────────────────────

function buildMoonCanvas(r: number): HTMLCanvasElement {
    const size = r * 8;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const mc = c.getContext('2d')!;
    const cx = size / 2, cy = size / 2;

    // Disc
    mc.beginPath();
    mc.arc(cx, cy, r, 0, Math.PI * 2);
    mc.fillStyle = 'rgba(205,214,244,0.95)';
    mc.fill();

    // Crescent cutout
    mc.globalCompositeOperation = 'destination-out';
    mc.beginPath();
    mc.arc(cx + r * 0.42, cy - r * 0.12, r * 0.88, 0, Math.PI * 2);
    mc.fillStyle = 'rgba(0,0,0,1)';
    mc.fill();

    return c;
}

function drawMoon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, moonImg: HTMLCanvasElement): void {
    const glow = ctx.createRadialGradient(x, y, r, x, y, r * 3);
    glow.addColorStop(0, 'rgba(205,214,244,0.25)');
    glow.addColorStop(1, 'rgba(205,214,244,0)');
    ctx.beginPath();
    ctx.arc(x, y, r * 3, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    const size = r * 8;
    ctx.drawImage(moonImg, x - size / 2, y - size / 2);
}

// ── Clouds ────────────────────────────────────────────────────────────────────

interface CloudPuff {
    dx: number;  // offset from cloud center, in canvas-height units
    dy: number;
    r: number;   // radius in canvas-height units
}

interface Cloud {
    x: number;      // 0–1 normalized horizontal position (wraps)
    y: number;      // 0–1 normalized vertical position
    speed: number;  // canvas-widths per second
    puffs: CloudPuff[];
    span: number;   // half-width in canvas-height units (for wrap margin)
}

function makeCloud(x: number): Cloud {
    const baseR = 0.055 + Math.random() * 0.065; // 0.055–0.12 * h
    const count = 4 + Math.floor(Math.random() * 3);
    const puffs: CloudPuff[] = [{ dx: 0, dy: 0, r: baseR }];
    let span = baseR;

    for (let i = 1; i < count; i++) {
        const dx = (Math.random() - 0.5) * baseR * 2.8;
        const dy = (Math.random() - 0.5) * baseR * 0.7;
        const r  = baseR * (0.5 + Math.random() * 0.75);
        puffs.push({ dx, dy, r });
        span = Math.max(span, Math.abs(dx) + r);
    }

    return {
        x,
        y: 0.06 + Math.random() * 0.42,
        speed: 0.004 + Math.random() * 0.008,
        puffs,
        span,
    };
}

function makeClouds(): Cloud[] {
    return Array.from({ length: 5 }, (_, i) =>
        makeCloud(i / 5 + Math.random() * 0.18)
    );
}

function updateClouds(clouds: Cloud[], dt: number): void {
    for (const c of clouds) {
        c.x += c.speed * dt;
        // wrap: when the right edge passes x=1, teleport to just off the left
        if (c.x - c.span > 1) c.x = -c.span;
    }
}

function drawClouds(ctx: CanvasRenderingContext2D, clouds: Cloud[], w: number, h: number, alpha: number): void {
    if (alpha < 0.01) return;
    ctx.save();
    for (const c of clouds) {
        const cx = c.x * w;
        const cy = c.y * h;
        for (const p of c.puffs) {
            const px = cx + p.dx * h;
            const py = cy + p.dy * h;
            const r  = p.r  * h;
            const g  = ctx.createRadialGradient(px, py, 0, px, py, r);
            g.addColorStop(0,   `rgba(255,255,255,${(alpha * 0.52).toFixed(3)})`);
            g.addColorStop(0.5, `rgba(255,255,255,${(alpha * 0.32).toFixed(3)})`);
            g.addColorStop(1,   'rgba(255,255,255,0)');
            ctx.beginPath();
            ctx.arc(px, py, r, 0, Math.PI * 2);
            ctx.fillStyle = g;
            ctx.fill();
        }
    }
    ctx.restore();
}

// ── Terrain silhouette ────────────────────────────────────────────────────────

interface HillSeg {
    x0: number; y0: number;
    cx1: number; cy1: number;
    cx2: number; cy2: number;
    x3: number; y3: number;
}

// Normalized cubic bezier segments (fractions of w / h) for the rolling hills
const HILL_SEGS: HillSeg[] = [
    { x0: 0,    y0: 0.86, cx1: 0.08, cy1: 0.56, cx2: 0.22, cy2: 0.62, x3: 0.30, y3: 0.80 },
    { x0: 0.30, y0: 0.80, cx1: 0.38, cy1: 0.95, cx2: 0.45, cy2: 0.62, x3: 0.55, y3: 0.70 },
    { x0: 0.55, y0: 0.70, cx1: 0.65, cy1: 0.78, cx2: 0.76, cy2: 0.54, x3: 0.86, y3: 0.66 },
    { x0: 0.86, y0: 0.66, cx1: 0.93, cy1: 0.75, cx2: 1.00, cy2: 0.82, x3: 1.00, y3: 0.84 },
];

function bezierAt(s: HillSeg, t: number): { x: number; y: number; dx: number; dy: number } {
    const mt = 1 - t, mt2 = mt * mt, mt3 = mt2 * mt, t2 = t * t, t3 = t2 * t;
    return {
        x:  mt3*s.x0 + 3*t*mt2*s.cx1 + 3*t2*mt*s.cx2 + t3*s.x3,
        y:  mt3*s.y0 + 3*t*mt2*s.cy1 + 3*t2*mt*s.cy2 + t3*s.y3,
        dx: 3*(mt2*(s.cx1-s.x0) + 2*t*mt*(s.cx2-s.cx1) + t2*(s.x3-s.cx2)),
        dy: 3*(mt2*(s.cy1-s.y0) + 2*t*mt*(s.cy2-s.cy1) + t2*(s.y3-s.cy2)),
    };
}

// Binary-search the bezier to find hill surface y and tangent angle at nx (0–1)
function hillSample(nx: number): { y: number; angle: number } {
    for (const seg of HILL_SEGS) {
        if (nx < seg.x0 || nx > seg.x3 + 1e-6) continue;
        let lo = 0, hi = 1;
        for (let i = 0; i < 24; i++) {
            const mid = (lo + hi) * 0.5;
            if (bezierAt(seg, mid).x < nx) lo = mid; else hi = mid;
        }
        const { y, dx, dy } = bezierAt(seg, (lo + hi) * 0.5);
        return { y, angle: Math.atan2(dy, dx) };
    }
    return { y: 0.80, angle: 0 };
}

// Draw a pine tree in local coords: base at (0,0), tip at (0,−tH), then rotated by caller
function drawPineTree(ctx: CanvasRenderingContext2D, tH: number): void {
    const tW = tH * 0.38;
    ctx.beginPath();
    ctx.moveTo(0, -tH);
    ctx.lineTo( tW * 0.60, -tH * 0.48);
    ctx.lineTo(-tW * 0.60, -tH * 0.48);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -tH * 0.72);
    ctx.lineTo( tW, 0);
    ctx.lineTo(-tW, 0);
    ctx.closePath();
    ctx.fill();
}

function drawSilhouette(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    ctx.save();
    ctx.fillStyle = 'rgba(17,17,27,0.93)';

    // Hill path driven by HILL_SEGS data
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(HILL_SEGS[0].x0 * w, HILL_SEGS[0].y0 * h);
    for (const s of HILL_SEGS) {
        ctx.bezierCurveTo(s.cx1*w, s.cy1*h, s.cx2*w, s.cy2*h, s.x3*w, s.y3*h);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Pine trees planted on the hill surface, perpendicular to slope
    // [normalized-x, height as fraction of canvas height]
    const trees: [number, number][] = [
        [0.06, 0.09], [0.13, 0.11], [0.20, 0.09],
        [0.48, 0.11], [0.53, 0.09],
        [0.77, 0.13], [0.83, 0.11], [0.91, 0.09],
    ];
    for (const [nx, hFrac] of trees) {
        const { y, angle } = hillSample(nx);
        ctx.save();
        ctx.translate(nx * w, y * h);
        ctx.rotate(angle);
        drawPineTree(ctx, hFrac * h);
        ctx.restore();
    }

    ctx.restore();
}

// ── Main draw loop ────────────────────────────────────────────────────────────

const SUN_R = 18;
const MOON_R = 14;

function init(): void {
    const canvas = document.getElementById('sky-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const stars = makeStars(180);
    const moonImg = buildMoonCanvas(MOON_R);
    const clouds = makeClouds();
    let lastTs = 0;

    // Drag / freeze state
    let frozen = false;
    let frozenAngle = 0;       // always the SUN angle; moon = frozenAngle + π
    let dragging = false;
    let grabbedMoon = false;   // true when the drag started on the moon
    let lastTapMs = 0;

    // Last-frame celestial positions for hit testing in event handlers
    let sunPx = 0, sunPy = 0, moonPx = 0, moonPy = 0;

    let bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();

    new MutationObserver(() => {
        bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    let cssW = 0, cssH = 0;

    function resize(): void {
        const header = canvas!.parentElement!;
        const dpr = window.devicePixelRatio || 1;
        cssW = header.offsetWidth;
        cssH = header.offsetHeight;
        canvas!.width = cssW * dpr;
        canvas!.height = cssH * dpr;
        canvas!.style.width = cssW + 'px';
        canvas!.style.height = cssH + 'px';
        ctx.resetTransform();
        ctx.scale(dpr, dpr);
    }

    new ResizeObserver(resize).observe(canvas.parentElement!);
    resize();

    // ── Drag interaction ──────────────────────────────────────────────────────

    const HIT_R = Math.max(SUN_R, MOON_R) * 3.5;
    canvas.style.touchAction = 'none';

    function toCanvas(e: PointerEvent): { x: number; y: number } {
        const rect = canvas!.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function dist2(ax: number, ay: number, bx: number, by: number): number {
        return (ax - bx) ** 2 + (ay - by) ** 2;
    }

    function computeAngle(x: number, y: number): number {
        return Math.atan2(cssH * 1.08 - y, x - cssW / 2);
    }

    canvas.addEventListener('pointerdown', (e) => {
        // Double-tap on touch to unfreeze
        if (e.pointerType === 'touch') {
            const now = performance.now();
            if (now - lastTapMs < 350 && frozen) {
                frozen = false;
                dragging = false;
                canvas!.style.cursor = '';
                return;
            }
            lastTapMs = now;
        }

        const { x, y } = toCanvas(e);
        const hitSun  = dist2(x, y, sunPx,  sunPy)  < HIT_R * HIT_R;
        const hitMoon = dist2(x, y, moonPx, moonPy) < HIT_R * HIT_R;
        if (!hitSun && !hitMoon) return;

        e.preventDefault();
        dragging = true;
        frozen = true;
        grabbedMoon = hitMoon && !hitSun;
        canvas!.setPointerCapture(e.pointerId);
        canvas!.style.cursor = 'grabbing';

        const raw = computeAngle(x, y);
        frozenAngle = grabbedMoon ? raw - Math.PI : raw;
    });

    canvas.addEventListener('pointermove', (e) => {
        const { x, y } = toCanvas(e);
        if (dragging) {
            const raw = computeAngle(x, y);
            frozenAngle = grabbedMoon ? raw - Math.PI : raw;
            return;
        }
        // Hover cursor
        const over = dist2(x, y, sunPx, sunPy) < HIT_R * HIT_R
                  || dist2(x, y, moonPx, moonPy) < HIT_R * HIT_R;
        canvas!.style.cursor = over ? 'grab' : '';
    });

    canvas.addEventListener('pointerup', () => {
        if (dragging) {
            dragging = false;
            canvas!.style.cursor = '';
        }
    });

    canvas.addEventListener('pointercancel', () => {
        dragging = false;
        canvas!.style.cursor = '';
    });

    canvas.addEventListener('dblclick', () => {
        frozen = false;
        dragging = false;
        canvas!.style.cursor = '';
    });

    function draw(timestamp: number): void {
        const dt = lastTs === 0 ? 0 : (timestamp - lastTs) / 1000;
        lastTs = timestamp;

        const clockHour = (() => { const d = new Date(); return d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600; })();
        const sunAngle  = frozen ? frozenAngle : Math.PI / 2 - ((clockHour - 12) / 12) * Math.PI;
        const hour      = frozen ? angleToHour(frozenAngle) : clockHour;
        const moonAngle = sunAngle + Math.PI;
        const w = cssW, h = cssH;

        ctx.clearRect(0, 0, w, h);

        // Sky gradient
        const sky = getSkyAt(hour);
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, rgba(sky.top));
        skyGrad.addColorStop(0.55, rgba(sky.mid));
        skyGrad.addColorStop(1, rgba(sky.bot));
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);

        // Stars
        const n = nightness(hour);
        if (n > 0.01) drawStars(ctx, stars, w, h, n, timestamp);

        // Arc geometry: horizon slightly below canvas bottom so bodies slide off smoothly
        const horizonY = h * 1.08;
        const arcR = h * 0.98;
        const cx = w / 2;

        const sunX = cx + arcR * Math.cos(sunAngle);
        const sunY = horizonY - arcR * Math.sin(sunAngle);
        const moonX = cx + arcR * Math.cos(moonAngle);
        const moonY = horizonY - arcR * Math.sin(moonAngle);

        // Store for hit testing
        sunPx = sunX; sunPy = sunY; moonPx = moonX; moonPy = moonY;

        if (Math.sin(sunAngle) > -0.08) drawSun(ctx, sunX, sunY, SUN_R);
        if (Math.sin(moonAngle) > -0.08) drawMoon(ctx, moonX, moonY, MOON_R, moonImg);

        // Clouds — fade in with daylight, invisible at night
        updateClouds(clouds, dt);
        drawClouds(ctx, clouds, w, h, 1 - n);

        // Terrain silhouette
        drawSilhouette(ctx, w, h);

        // Bottom fade to page background
        const fade = ctx.createLinearGradient(0, h * 0.5, 0, h);
        fade.addColorStop(0, 'rgba(0,0,0,0)');
        fade.addColorStop(1, bgColor);
        ctx.fillStyle = fade;
        ctx.fillRect(0, 0, w, h);

        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
