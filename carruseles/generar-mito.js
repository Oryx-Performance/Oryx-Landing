const puppeteer = require('puppeteer');
const path = require('path');

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    width: 1080px;
    height: 1080px;
    overflow: hidden;
    background: #0a0a08;
    font-family: 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .slide {
    position: relative;
    width: 1080px;
    height: 1080px;
    background: #0a0a08;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* ── Ruido ── */
  .noise {
    position: absolute; inset: 0;
    opacity: 0.045;
    pointer-events: none;
    z-index: 1;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  /* ── Esquinas ── */
  .corner {
    position: absolute;
    width: 30px; height: 30px;
    border-color: rgba(255,69,0,0.35);
    border-style: solid;
    z-index: 4;
  }
  .tl { top: 50px; left: 50px; border-width: 1.5px 0 0 1.5px; }
  .tr { top: 50px; right: 50px; border-width: 1.5px 1.5px 0 0; }
  .bl { bottom: 76px; left: 50px; border-width: 0 0 1.5px 1.5px; }
  .br { bottom: 76px; right: 50px; border-width: 0 1.5px 1.5px 0; }

  .corner-w { border-color: rgba(255,255,255,0.35); }

  /* ── Línea inferior decorativa ── */
  .bottom-line {
    position: absolute;
    bottom: 56px; left: 50px; right: 50px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,69,0,0.45) 30%, rgba(255,69,0,0.45) 70%, transparent);
    z-index: 4;
  }
  .bottom-line-w {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35) 30%, rgba(255,255,255,0.35) 70%, transparent);
  }

  /* ── Marca ── */
  .brand {
    position: absolute;
    bottom: 22px; left: 0; right: 0;
    text-align: center;
    font-family: 'Inter', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.42em;
    text-transform: uppercase;
    color: rgba(255,69,0,0.5);
    z-index: 5;
  }
  .brand-w { color: rgba(255,255,255,0.4); }

  /* ── Número slide ── */
  .slide-num {
    position: absolute;
    top: 58px; right: 58px;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 0.18em;
    color: rgba(245,240,232,0.2);
    z-index: 5;
  }

  /* ── Contenido ── */
  .content {
    position: relative;
    z-index: 3;
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 70px 72px 80px;
  }
  .content.center {
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  /* ── Tag ── */
  .tag {
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #FF4500;
    border: 1.5px solid rgba(255,69,0,0.3);
    display: inline-block;
    padding: 10px 24px;
    margin-bottom: 52px;
    align-self: flex-start;
  }

  /* ── Títulos ── */
  .title-xl {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 116px;
    line-height: 0.93;
    color: #F5F0E8;
    letter-spacing: 0.01em;
    margin-bottom: 36px;
  }
  .title-lg {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 98px;
    line-height: 0.93;
    color: #F5F0E8;
    letter-spacing: 0.01em;
    margin-bottom: 0;
  }
  .title-orange {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 98px;
    line-height: 0.93;
    color: #FF4500;
    letter-spacing: 0.01em;
  }
  .title-w {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 108px;
    line-height: 0.93;
    color: #FFFFFF;
    letter-spacing: 0.01em;
    margin-bottom: 36px;
    text-align: center;
  }

  /* ── Sub / body ── */
  .sub {
    font-family: 'Inter', sans-serif;
    font-size: 26px;
    font-weight: 300;
    color: rgba(245,240,232,0.5);
    line-height: 1.55;
    letter-spacing: 0.01em;
  }
  .sub-arrow {
    font-size: 22px;
    font-weight: 400;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(245,240,232,0.38);
  }
  .sub-w {
    font-family: 'Inter', sans-serif;
    font-size: 28px;
    font-weight: 300;
    color: rgba(255,255,255,0.75);
    line-height: 1.6;
    text-align: center;
    margin-bottom: 52px;
  }

  /* ── Divider ── */
  .divider {
    width: 44px; height: 2px;
    background: #FF4500;
    margin: 40px 0;
    opacity: 0.7;
  }

  /* ── Glow ── */
  .glow {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }

  /* ── Comparación (slide 2) ── */
  .compare-wrap {
    display: flex;
    gap: 20px;
    flex: 1;
    align-items: stretch;
    margin-top: 0;
  }
  .compare-block {
    flex: 1;
    border: 1.5px solid rgba(255,69,0,0.15);
    padding: 40px 36px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    opacity: 0.38;
  }
  .compare-block.active {
    border-color: #FF4500;
    opacity: 1;
    background: rgba(255,69,0,0.05);
    box-shadow: 0 0 60px rgba(255,69,0,0.08) inset;
  }
  .compare-label {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 36px;
    letter-spacing: 0.08em;
    color: #F5F0E8;
  }
  .compare-stat {
    font-family: 'Inter', sans-serif;
    font-size: 20px;
    font-weight: 300;
    color: rgba(245,240,232,0.7);
    line-height: 1.5;
    letter-spacing: 0.02em;
  }
  .compare-stat span {
    display: block;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .compare-stat span:last-child { border-bottom: none; }
  .compare-result {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 32px;
    color: #FF4500;
    letter-spacing: 0.05em;
    margin-top: auto;
  }
  .compare-result.dim { color: rgba(245,240,232,0.3); }

  /* ── Bloques slide 4 ── */
  .block-wrap {
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
    margin-top: 0;
  }
  .block {
    flex: 1;
    border: 1.5px solid rgba(255,255,255,0.06);
    padding: 36px 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 12px;
    opacity: 0.4;
  }
  .block.lit {
    border-color: #FF4500;
    background: rgba(255,69,0,0.06);
    opacity: 1;
  }
  .block-head {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 48px;
    letter-spacing: 0.08em;
    color: #F5F0E8;
  }
  .block-body {
    font-family: 'Inter', sans-serif;
    font-size: 22px;
    font-weight: 300;
    color: rgba(245,240,232,0.6);
    letter-spacing: 0.02em;
  }
  .block.lit .block-body { color: rgba(245,240,232,0.8); }

  /* ── Pill CTA ── */
  .pill-cta {
    background: #F5F0E8;
    display: inline-block;
    padding: 20px 56px;
    font-family: 'Inter', sans-serif;
    font-size: 26px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #FF4500;
  }

  /* ── Slide 6 ── */
  .slide-cta { background: #FF4500; }
  .cta-glow {
    position: absolute;
    width: 900px; height: 900px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.14) 0%, transparent 65%);
    top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    z-index: 0;
    pointer-events: none;
  }
`;

const slides = [
  // ── SLIDE 1 — Gancho ──
  {
    id: 1,
    html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="corner tl"></div><div class="corner tr"></div>
      <div class="corner bl"></div><div class="corner br"></div>
      <div class="glow" style="width:700px;height:700px;background:radial-gradient(circle,rgba(255,69,0,0.1) 0%,transparent 65%);top:50%;left:50%;transform:translate(-50%,-45%);"></div>
      <div class="bottom-line"></div>

      <div class="content center">
        <h1 class="title-xl">Más seguidores<br>no significa<br><span style="color:#FF4500">más dinero.</span></h1>
        <p class="sub-arrow">Y los números lo prueban &nbsp;→&nbsp; desliza</p>
      </div>

      <div class="brand">ORYX PERFORMANCE</div>
    </div>`,
  },

  // ── SLIDE 2 — Comparación ──
  {
    id: 2,
    html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="corner tl"></div><div class="corner tr"></div>
      <div class="corner bl"></div><div class="corner br"></div>
      <div class="bottom-line"></div>
      <div class="slide-num">02 / 06</div>

      <div class="content" style="justify-content:flex-start;">
        <span class="tag">La comparación real</span>
        <div class="compare-wrap">
          <div class="compare-block">
            <div class="compare-label">CREADOR A</div>
            <div class="compare-stat">
              <span>500K seguidores</span>
              <span>0.5% engagement</span>
            </div>
            <div class="compare-result dim">= Ventas bajas</div>
          </div>
          <div class="compare-block active">
            <div class="compare-label">CREADOR B</div>
            <div class="compare-stat">
              <span>15K seguidores</span>
              <span>8% engagement</span>
            </div>
            <div class="compare-result">= Ventas altas</div>
          </div>
        </div>
      </div>

      <div class="brand">ORYX PERFORMANCE</div>
    </div>`,
  },

  // ── SLIDE 3 — ¿Por qué? ──
  {
    id: 3,
    html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="corner tl"></div><div class="corner tr"></div>
      <div class="corner bl"></div><div class="corner br"></div>
      <div class="glow" style="width:600px;height:600px;background:radial-gradient(circle,rgba(255,184,0,0.07) 0%,transparent 65%);bottom:-100px;right:-100px;"></div>
      <div class="bottom-line"></div>
      <div class="slide-num">03 / 06</div>

      <div class="content" style="justify-content:center;">
        <span class="tag">¿Por qué?</span>
        <div class="title-lg">La confianza<br>convierte.</div>
        <div class="divider"></div>
        <div class="title-orange">El alcance<br>solo alcanza.</div>
      </div>

      <div class="brand">ORYX PERFORMANCE</div>
    </div>`,
  },

  // ── SLIDE 4 — La diferencia ──
  {
    id: 4,
    html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="corner tl"></div><div class="corner tr"></div>
      <div class="corner bl"></div><div class="corner br"></div>
      <div class="bottom-line"></div>
      <div class="slide-num">04 / 06</div>

      <div class="content" style="justify-content:flex-start;">
        <span class="tag">La diferencia</span>
        <div class="block-wrap">
          <div class="block">
            <div class="block-head">AUDIENCIA</div>
            <div class="block-body">Consume. No compra.</div>
          </div>
          <div class="block lit">
            <div class="block-head">COMUNIDAD</div>
            <div class="block-body">Confía. Compra. Repite.</div>
          </div>
        </div>
      </div>

      <div class="brand">ORYX PERFORMANCE</div>
    </div>`,
  },

  // ── SLIDE 5 — Momento ──
  {
    id: 5,
    html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="corner tl"></div><div class="corner tr"></div>
      <div class="corner bl"></div><div class="corner br"></div>
      <div class="glow" style="width:650px;height:650px;background:radial-gradient(circle,rgba(255,69,0,0.09) 0%,transparent 65%);top:50%;left:50%;transform:translate(-50%,-50%);"></div>
      <div class="bottom-line"></div>
      <div class="slide-num">05 / 06</div>

      <div class="content center">
        <h1 class="title-xl" style="font-size:100px;margin-bottom:28px;">El mejor momento<br>para lanzar no es<br>cuando tengas más.</h1>
        <div class="title-orange" style="font-size:110px;line-height:0.93;">Es ahora.</div>
      </div>

      <div class="brand">ORYX PERFORMANCE</div>
    </div>`,
  },

  // ── SLIDE 6 — CTA ──
  {
    id: 6,
    html: `
    <div class="slide slide-cta">
      <div class="noise" style="opacity:0.07;"></div>
      <div class="corner tl corner-w"></div><div class="corner tr corner-w"></div>
      <div class="corner bl corner-w"></div><div class="corner br corner-w"></div>
      <div class="cta-glow"></div>
      <div class="bottom-line bottom-line-w"></div>

      <div class="content center">
        <h1 class="title-w">¿Cuántos<br>seguidores<br>tienes?</h1>
        <p class="sub-w">Escríbelo en comentarios.<br>Te decimos si ya estás listo.</p>
        <div class="pill-cta">DM → @oryx.company</div>
      </div>

      <div class="brand brand-w">ORYX PERFORMANCE</div>
    </div>`,
  },
];

async function generate() {
  console.log('Iniciando Puppeteer...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  for (const slide of slides) {
    console.log(`Generando mito-${slide.id}.png...`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });

    await page.setContent(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>${css}</style></head>
<body>${slide.html}</body></html>`, { waitUntil: 'networkidle0' });

    await new Promise(r => setTimeout(r, 1200));

    await page.screenshot({
      path: path.join(__dirname, `mito-${slide.id}.png`),
      type: 'png',
      clip: { x: 0, y: 0, width: 1080, height: 1080 },
    });

    console.log(`  ✓ mito-${slide.id}.png`);
    await page.close();
  }

  await browser.close();
  console.log('\nListo — 6 slides mito generados.');
}

generate().catch(err => { console.error(err); process.exit(1); });
