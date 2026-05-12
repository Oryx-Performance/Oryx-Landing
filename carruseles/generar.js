const puppeteer = require('puppeteer');
const path = require('path');

const slides = [
  // ── SLIDE 1 — Gancho ──
  {
    id: 1,
    bg: '#0a0a08',
    html: `
      <div class="slide">
        <div class="noise"></div>
        <div class="corner tl"></div>
        <div class="corner tr"></div>
        <div class="corner bl"></div>
        <div class="corner br"></div>
        <div class="glow"></div>

        <div class="content center">
          <div class="line-accent"></div>
          <h1 class="title-xl">Señales de que<br>tu audiencia ya<br>está lista para<br><span class="orange">comprarte.</span></h1>
          <p class="sub arrow">desliza &nbsp;→</p>
        </div>

        <div class="brand">ORYX PERFORMANCE</div>
      </div>
    `,
  },

  // ── SLIDE 2 — Señal 01 ──
  {
    id: 2,
    bg: '#0a0a08',
    html: `
      <div class="slide">
        <div class="noise"></div>
        <div class="corner tl"></div>
        <div class="corner tr"></div>
        <div class="corner bl"></div>
        <div class="corner br"></div>

        <div class="content top-left">
          <span class="tag">SEÑAL 01</span>
          <h1 class="title-lg">Te preguntan<br>cómo aprender<br>lo que haces.</h1>
          <div class="divider"></div>
          <p class="body-text">Cuando preguntan cómo aprender,<br>ya decidieron querer saber más.</p>
        </div>

        <div class="slide-num">01 / 06</div>
        <div class="brand">ORYX PERFORMANCE</div>
      </div>
    `,
  },

  // ── SLIDE 3 — Señal 02 y 03 ──
  {
    id: 3,
    bg: '#0a0a08',
    html: `
      <div class="slide">
        <div class="noise"></div>
        <div class="corner tl"></div>
        <div class="corner tr"></div>
        <div class="corner br"></div>

        <div class="content top-left">
          <span class="tag">SEÑAL 02 Y 03</span>

          <div class="signal-block">
            <div class="signal-num orange">02</div>
            <h2 class="title-md">Te escriben por DM<br>pidiendo recetas<br>o técnicas.</h2>
          </div>

          <div class="signal-block mt">
            <div class="signal-num yellow">03</div>
            <h2 class="title-md">Tu audiencia replica<br>lo que haces y<br>te etiqueta.</h2>
          </div>
        </div>

        <div class="slide-num">02 / 06</div>
        <div class="brand">ORYX PERFORMANCE</div>
      </div>
    `,
  },

  // ── SLIDE 4 — Señal 04 y 05 ──
  {
    id: 4,
    bg: '#0a0a08',
    html: `
      <div class="slide">
        <div class="noise"></div>
        <div class="corner tl"></div>
        <div class="corner tr"></div>
        <div class="corner br"></div>

        <div class="content top-left">
          <span class="tag">SEÑAL 04 Y 05</span>

          <div class="signal-block">
            <div class="signal-num orange">04</div>
            <h2 class="title-md">Tus posts tienen<br>más guardados<br>que likes.</h2>
          </div>

          <div class="signal-block mt">
            <div class="signal-num yellow">05</div>
            <h2 class="title-md">"Deberías hacer<br>un curso" — y lo<br>dejas para después.</h2>
          </div>
        </div>

        <div class="slide-num">03 / 06</div>
        <div class="brand">ORYX PERFORMANCE</div>
      </div>
    `,
  },

  // ── SLIDE 5 — Cierre ──
  {
    id: 5,
    bg: '#0a0a08',
    html: `
      <div class="slide">
        <div class="noise"></div>
        <div class="corner tl"></div>
        <div class="corner tr"></div>
        <div class="corner bl"></div>
        <div class="corner br"></div>
        <div class="glow glow-center"></div>

        <div class="content center">
          <div class="pill-count">
            <span>3 o más señales</span>
          </div>
          <h1 class="title-xl tight">Tu audiencia<br>ya está <span class="orange">lista.</span></h1>
          <div class="divider center-div"></div>
          <p class="sub">Solo falta el producto.</p>
        </div>

        <div class="slide-num">04 / 06</div>
        <div class="brand">ORYX PERFORMANCE</div>
      </div>
    `,
  },

  // ── SLIDE 6 — CTA ──
  {
    id: 6,
    bg: '#FF4500',
    html: `
      <div class="slide slide-cta">
        <div class="noise noise-cta"></div>
        <div class="corner-white tl"></div>
        <div class="corner-white tr"></div>
        <div class="corner-white bl"></div>
        <div class="corner-white br"></div>
        <div class="glow-white"></div>

        <div class="content center">
          <h1 class="title-xl white">En 30 días<br>lanzamos tu<br>infoproducto.</h1>
          <p class="sub white">Tú pones el talento.<br>Nosotros ponemos el resto.</p>
          <div class="pill-cta">
            <span>DM → @oryx.company</span>
          </div>
        </div>

        <div class="brand brand-cta">ORYX PERFORMANCE</div>
      </div>
    `,
  },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&display=swap');

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
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* Ruido sutil */
  .noise {
    position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    opacity: 0.06;
    pointer-events: none;
    z-index: 1;
  }
  .noise-cta { opacity: 0.08; }

  /* Esquinas decorativas */
  .corner {
    position: absolute;
    width: 28px; height: 28px;
    border-color: rgba(255,69,0,0.4);
    border-style: solid;
    z-index: 2;
  }
  .corner.tl { top: 48px; left: 48px; border-width: 1.5px 0 0 1.5px; }
  .corner.tr { top: 48px; right: 48px; border-width: 1.5px 1.5px 0 0; }
  .corner.bl { bottom: 80px; left: 48px; border-width: 0 0 1.5px 1.5px; }
  .corner.br { bottom: 80px; right: 48px; border-width: 0 1.5px 1.5px 0; }

  .corner-white {
    position: absolute;
    width: 28px; height: 28px;
    border-color: rgba(255,255,255,0.45);
    border-style: solid;
    z-index: 2;
  }
  .corner-white.tl { top: 48px; left: 48px; border-width: 1.5px 0 0 1.5px; }
  .corner-white.tr { top: 48px; right: 48px; border-width: 1.5px 1.5px 0 0; }
  .corner-white.bl { bottom: 80px; left: 48px; border-width: 0 0 1.5px 1.5px; }
  .corner-white.br { bottom: 80px; right: 48px; border-width: 0 1.5px 1.5px 0; }

  /* Glows */
  .glow {
    position: absolute;
    width: 700px; height: 700px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,69,0,0.12) 0%, transparent 65%);
    top: 50%; left: 50%;
    transform: translate(-50%, -40%);
    pointer-events: none;
    z-index: 0;
  }
  .glow-center {
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, rgba(255,184,0,0.1) 0%, transparent 65%);
  }
  .glow-white {
    position: absolute;
    width: 800px; height: 800px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 65%);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 0;
  }

  /* Contenido */
  .content {
    position: relative;
    z-index: 3;
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .content.center {
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 80px 80px 40px;
  }
  .content.top-left {
    justify-content: center;
    padding: 80px 80px 40px;
  }

  /* Línea accent */
  .line-accent {
    width: 48px; height: 2px;
    background: #FF4500;
    margin-bottom: 40px;
  }

  /* Tag */
  .tag {
    display: inline-block;
    font-family: 'Inter', sans-serif;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: #FF4500;
    border: 1.5px solid rgba(255,69,0,0.35);
    padding: 10px 22px;
    margin-bottom: 48px;
    text-transform: uppercase;
    align-self: flex-start;
  }

  /* Tipografías */
  .title-xl {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 112px;
    line-height: 0.95;
    color: #F5F0E8;
    letter-spacing: 0.01em;
    margin-bottom: 40px;
  }
  .title-xl.tight { font-size: 120px; margin-bottom: 32px; }
  .title-lg {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 96px;
    line-height: 0.95;
    color: #F5F0E8;
    letter-spacing: 0.01em;
    margin-bottom: 44px;
  }
  .title-md {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 66px;
    line-height: 0.97;
    color: #F5F0E8;
    letter-spacing: 0.01em;
  }
  .title-xl.white, .title-xl .white { color: #F5F0E8; }

  .orange { color: #FF4500; }
  .yellow { color: #FFB800; }

  .sub {
    font-size: 26px;
    font-weight: 300;
    color: rgba(245,240,232,0.6);
    letter-spacing: 0.01em;
    line-height: 1.5;
  }
  .sub.white { color: rgba(255,255,255,0.75); font-size: 28px; margin-bottom: 52px; }
  .sub.arrow {
    font-size: 24px;
    color: rgba(245,240,232,0.45);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 400;
  }

  .body-text {
    font-size: 24px;
    font-weight: 300;
    color: rgba(245,240,232,0.55);
    line-height: 1.65;
  }

  /* Divider */
  .divider {
    width: 40px; height: 1.5px;
    background: rgba(255,69,0,0.5);
    margin: 36px 0;
  }
  .center-div { margin: 36px auto; }

  /* Bloques señal */
  .signal-block {
    display: flex;
    align-items: flex-start;
    gap: 32px;
  }
  .signal-block.mt { margin-top: 56px; }
  .signal-num {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 80px;
    line-height: 0.85;
    flex-shrink: 0;
    padding-top: 4px;
  }

  /* Pill */
  .pill-count {
    display: inline-block;
    background: rgba(255,69,0,0.15);
    border: 1.5px solid rgba(255,69,0,0.4);
    padding: 12px 32px;
    margin-bottom: 44px;
    font-size: 20px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #FF4500;
  }
  .pill-cta {
    display: inline-block;
    background: #F5F0E8;
    padding: 20px 52px;
    font-size: 28px;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: #FF4500;
    text-transform: uppercase;
  }

  /* Slide CTA */
  .slide-cta { background: #FF4500; }

  /* Número de slide */
  .slide-num {
    position: absolute;
    top: 56px; right: 56px;
    font-size: 16px;
    font-weight: 400;
    letter-spacing: 0.16em;
    color: rgba(245,240,232,0.25);
    z-index: 3;
  }

  /* Marca */
  .brand {
    position: absolute;
    bottom: 34px;
    left: 0; right: 0;
    text-align: center;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.38em;
    text-transform: uppercase;
    color: rgba(255,69,0,0.45);
    z-index: 3;
  }
  .brand-cta { color: rgba(255,255,255,0.4); }
`;

async function generateSlides() {
  console.log('Iniciando Puppeteer...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  for (const slide of slides) {
    console.log(`Generando slide ${slide.id}...`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${css}</style>
</head>
<body style="background:${slide.bg};">
  ${slide.html}
</body>
</html>`;

    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    // Espera extra para que carguen las fuentes de Google
    await new Promise(r => setTimeout(r, 1200));

    const outputPath = path.join(__dirname, `slide-${slide.id}.png`);
    await page.screenshot({
      path: outputPath,
      type: 'png',
      clip: { x: 0, y: 0, width: 1080, height: 1080 },
    });

    console.log(`  ✓ slide-${slide.id}.png guardado`);
    await page.close();
  }

  await browser.close();
  console.log('\nListo — 6 slides generados en /carruseles/');
}

generateSlides().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
