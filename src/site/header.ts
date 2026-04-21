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

// ── Main draw loop ────────────────────────────────────────────────────────────

const SUN_R = 18;
const MOON_R = 14;

function init(): void {
    const canvas = document.getElementById('sky-canvas') as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    const stars = makeStars(180);
    const moonImg = buildMoonCanvas(MOON_R);

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

    function draw(timestamp: number): void {
        const now = new Date();
        const hour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
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
        const sunAngle = Math.PI / 2 - ((hour - 12) / 12) * Math.PI;
        const moonAngle = sunAngle + Math.PI;

        const sunX = cx + arcR * Math.cos(sunAngle);
        const sunY = horizonY - arcR * Math.sin(sunAngle);
        const moonX = cx + arcR * Math.cos(moonAngle);
        const moonY = horizonY - arcR * Math.sin(moonAngle);

        if (Math.sin(sunAngle) > -0.08) drawSun(ctx, sunX, sunY, SUN_R);
        if (Math.sin(moonAngle) > -0.08) drawMoon(ctx, moonX, moonY, MOON_R, moonImg);

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
