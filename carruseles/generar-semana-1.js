const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

const OUTPUT = path.join(__dirname, '..', 'assets', 'semana-1');
const IMG_CACHE = path.join(OUTPUT, 'img-cache');
fs.mkdirSync(OUTPUT, { recursive: true });
fs.mkdirSync(IMG_CACHE, { recursive: true });

// ── Download with redirect support ───────────────────────────
function download(url, dest) {
  return new Promise((resolve, reject) => {
    function get(u) {
      const mod = u.startsWith('https') ? https : http;
      const req = mod.get(u, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
        if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
          res.resume();
          return get(res.headers.location);
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${u}`));
          return;
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
        file.on('error', reject);
      });
      req.on('error', reject);
    }
    get(url);
  });
}

// ── CSS (shared design system) ────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0a0a08; color: #F5F0E8; font-family: 'Inter', sans-serif; overflow: hidden; }

.slide {
  width: 1080px; height: 1080px;
  background: #0a0a08; position: relative;
  display: flex; flex-direction: column; overflow: hidden;
}
.story {
  width: 1080px; height: 1920px;
  background: #0a0a08; position: relative;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  overflow: hidden; text-align: center;
}
.slide-cta { background: #FF4500 !important; }

/* BG image */
.bg-img {
  position: absolute; inset: 0;
  background-size: cover; background-position: center; z-index: 0;
}
.bg-overlay { position: absolute; inset: 0; z-index: 1; }

/* Noise */
.noise {
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  opacity: 0.06; pointer-events: none; z-index: 2;
}
.noise-cta { opacity: 0.1; }

/* Corners — square slides */
.c { position: absolute; width: 30px; height: 30px; border-style: solid; z-index: 5; }
.c.tl { top: 48px; left: 48px; border-color: rgba(201,168,76,0.55); border-width: 1.5px 0 0 1.5px; }
.c.tr { top: 48px; right: 48px; border-color: rgba(201,168,76,0.55); border-width: 1.5px 1.5px 0 0; }
.c.bl { bottom: 68px; left: 48px; border-color: rgba(201,168,76,0.55); border-width: 0 0 1.5px 1.5px; }
.c.br { bottom: 68px; right: 48px; border-color: rgba(201,168,76,0.55); border-width: 0 1.5px 1.5px 0; }
/* White corners for CTA slides */
.cw { position: absolute; width: 30px; height: 30px; border-style: solid; z-index: 5; }
.cw.tl { top: 48px; left: 48px; border-color: rgba(255,255,255,0.5); border-width: 1.5px 0 0 1.5px; }
.cw.tr { top: 48px; right: 48px; border-color: rgba(255,255,255,0.5); border-width: 1.5px 1.5px 0 0; }
.cw.bl { bottom: 68px; left: 48px; border-color: rgba(255,255,255,0.5); border-width: 0 0 1.5px 1.5px; }
.cw.br { bottom: 68px; right: 48px; border-color: rgba(255,255,255,0.5); border-width: 0 1.5px 1.5px 0; }
/* Story corners */
.sc { position: absolute; width: 30px; height: 30px; border-style: solid; z-index: 5; }
.sc.tl { top: 80px; left: 60px; border-color: rgba(201,168,76,0.55); border-width: 1.5px 0 0 1.5px; }
.sc.tr { top: 80px; right: 60px; border-color: rgba(201,168,76,0.55); border-width: 1.5px 1.5px 0 0; }
.sc.bl { bottom: 80px; left: 60px; border-color: rgba(201,168,76,0.55); border-width: 0 0 1.5px 1.5px; }
.sc.br { bottom: 80px; right: 60px; border-color: rgba(201,168,76,0.55); border-width: 0 1.5px 1.5px 0; }

/* Glows */
.glow {
  position: absolute; width: 720px; height: 720px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,69,0,0.10) 0%, transparent 65%);
  top: 50%; left: 50%; transform: translate(-50%, -40%);
  pointer-events: none; z-index: 3;
}
.glow-c { transform: translate(-50%, -50%); background: radial-gradient(circle, rgba(255,184,0,0.08) 0%, transparent 65%); }
.glow-w {
  position: absolute; width: 800px; height: 800px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 55%);
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  pointer-events: none; z-index: 3;
}
.glow-story {
  position: absolute; width: 900px; height: 900px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,69,0,0.08) 0%, transparent 60%);
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  pointer-events: none; z-index: 3;
}

/* Bottom accent */
.bline {
  position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, transparent, rgba(255,69,0,0.5) 25%, rgba(255,69,0,0.5) 75%, transparent);
  z-index: 6;
}

/* Brand mark */
.brand {
  position: absolute; bottom: 28px; left: 0; right: 0;
  text-align: center;
  font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 300;
  letter-spacing: 0.3em; text-transform: uppercase;
  color: rgba(201,168,76,0.5); z-index: 6;
}
.brand.w { color: rgba(255,255,255,0.38); }

/* Slide number */
.snum {
  position: absolute; top: 56px; right: 56px;
  font-size: 16px; font-weight: 400; letter-spacing: 0.16em;
  color: rgba(245,240,232,0.2); z-index: 6;
}

/* Content — square */
.cnt {
  position: relative; z-index: 4;
  flex: 1; display: flex; flex-direction: column;
}
.cnt.center {
  align-items: center; justify-content: center;
  text-align: center; padding: 88px 88px 48px;
}
.cnt.tl { justify-content: center; padding: 88px 88px 48px; }

/* Content — story */
.scnt {
  position: relative; z-index: 4;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center; padding: 120px 100px;
  width: 100%;
}
.story-tag {
  display: inline-block;
  font-size: 14px; font-weight: 400; letter-spacing: 0.3em;
  text-transform: uppercase; color: rgba(201,168,76,0.7);
  border: 0.75px solid rgba(201,168,76,0.3);
  padding: 8px 20px; margin-bottom: 64px;
}

/* Typography */
.txl {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 116px; line-height: 0.93; color: #F5F0E8;
  letter-spacing: 0.01em; margin-bottom: 36px;
}
.tlg {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 96px; line-height: 0.93; color: #F5F0E8;
  letter-spacing: 0.01em; margin-bottom: 40px;
}
.stxl {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 128px; line-height: 0.95; color: #F5F0E8;
  letter-spacing: 0.01em; margin-bottom: 40px;
}
.stlg {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 96px; line-height: 0.95; color: #F5F0E8;
  letter-spacing: 0.01em; margin-bottom: 40px;
}
.or { color: #FF4500; }
.yw { color: #FFB800; }
.gld { color: #c9a84c; }

.sub { font-size: 24px; font-weight: 300; color: rgba(245,240,232,0.55); line-height: 1.55; }
.sub.w { color: rgba(255,255,255,0.82); font-size: 26px; margin-bottom: 48px; }
.sub.sm { font-size: 20px; color: rgba(245,240,232,0.32); letter-spacing: 0.04em; margin-top: 24px; }

.body {
  font-size: 23px; font-weight: 300;
  color: rgba(245,240,232,0.52); line-height: 1.65; margin-top: 28px;
}

.div { width: 40px; height: 1.5px; background: rgba(255,69,0,0.5); margin: 32px 0; }
.divc { width: 40px; height: 1.5px; background: rgba(255,69,0,0.5); margin: 32px auto; }

/* Dim background number */
.nbg {
  position: absolute;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 360px; line-height: 1;
  color: rgba(245,240,232,0.045);
  right: 32px; top: 50%; transform: translateY(-50%);
  pointer-events: none; z-index: 0; letter-spacing: -0.02em;
}

/* Line accents */
.la { width: 48px; height: 2px; background: rgba(201,168,76,0.6); margin-bottom: 44px; }
.lac { width: 48px; height: 2px; background: rgba(201,168,76,0.6); margin: 0 auto 44px; }

/* Badge */
.tag {
  display: inline-block;
  font-size: 16px; font-weight: 600; letter-spacing: 0.2em;
  color: #FF4500; border: 1.5px solid rgba(255,69,0,0.38);
  padding: 10px 24px; margin-bottom: 44px;
  text-transform: uppercase; align-self: flex-start;
}

/* Contrast slides */
.ctrst {
  position: relative; z-index: 4;
  flex: 1; display: flex; flex-direction: column;
  justify-content: center; padding: 80px; gap: 10px;
}
.ctrst.row { flex-direction: row; align-items: stretch; gap: 10px; }
.cb {
  padding: 32px 36px;
  border: 1.5px solid rgba(255,255,255,0.05);
  display: flex; flex-direction: column; justify-content: center;
}
.cb.dim { background: rgba(245,240,232,0.02); }
.cb.lit { background: rgba(255,69,0,0.08); border-color: rgba(255,69,0,0.28); }
.cb-label { font-size: 15px; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 14px; }
.cb-label.dim { color: rgba(245,240,232,0.2); }
.cb-label.or  { color: #FF4500; }
.cb-title { font-family: 'Bebas Neue', sans-serif; font-size: 38px; line-height: 1.05; letter-spacing: 0.01em; }
.cb-title.dim { color: rgba(245,240,232,0.2); }
.cb-title.or  { color: #FF4500; }
.vs-sep {
  display: flex; align-items: center; justify-content: center;
  font-family: 'Bebas Neue', sans-serif; font-size: 30px;
  color: rgba(245,240,232,0.1); letter-spacing: 0.08em;
  padding: 0 6px; flex-shrink: 0;
}

/* Pills */
.pill-cta {
  display: inline-block;
  background: #F5F0E8; padding: 20px 52px; margin-top: 40px;
  font-size: 26px; font-weight: 600; letter-spacing: 0.08em;
  color: #FF4500; text-transform: uppercase;
}
.pill-or {
  display: inline-block;
  background: rgba(255,69,0,0.12); border: 1.5px solid rgba(255,69,0,0.5);
  padding: 16px 48px; margin-top: 40px;
  font-size: 26px; font-weight: 500; letter-spacing: 0.08em;
  color: #FF4500; text-transform: uppercase;
}

/* Survey blocks */
.survey-block {
  width: 800px; padding: 32px 40px; margin: 12px 0;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Bebas Neue', sans-serif; font-size: 36px;
  letter-spacing: 0.04em; text-transform: uppercase;
}
.survey-a { background: #FF4500; color: #F5F0E8; }
.survey-b {
  background: rgba(245,240,232,0.04);
  border: 1.5px solid rgba(245,240,232,0.12);
  color: rgba(245,240,232,0.5);
}
`;

// ── Image paths (populated after download) ────────────────────
const imgPaths = { platoemplatado: '', chefcocinando: '', cocinaprofesional: '' };

// ── Piece definitions ─────────────────────────────────────────
function getPieces() {
  const toFileUrl = p => `file:///${p.replace(/\\/g, '/')}`;
  const p1 = toFileUrl(imgPaths.platoemplatado);
  const p2 = toFileUrl(imgPaths.chefcocinando);
  const p3 = toFileUrl(imgPaths.cocinaprofesional);

  return [

    // ════════════════════════════════════════════════════════
    // HISTORIAS (1080 × 1920)
    // ════════════════════════════════════════════════════════

    { id: 'historia-lunes', w: 1080, h: 1920, html: `
      <div class="story">
        <div class="noise"></div>
        <div class="sc tl"></div><div class="sc tr"></div>
        <div class="sc bl"></div><div class="sc br"></div>
        <div class="glow-story"></div>
        <div class="scnt">
          <span class="story-tag">ORYX · LUNES</span>
          <h1 class="stxl">EL ALGORITMO<br>TE DA ALCANCE.<br>TU AUDIENCIA<br>TE DA INGRESOS.</h1>
          <div class="divc"></div>
          <p style="font-size:30px;font-weight:300;color:#FFB800;letter-spacing:0.05em;margin-top:16px;">Son cosas distintas.</p>
        </div>
        <div class="brand">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    { id: 'historia-martes', w: 1080, h: 1920, html: `
      <div class="story">
        <div class="noise"></div>
        <div class="sc tl"></div><div class="sc tr"></div>
        <div class="sc bl"></div><div class="sc br"></div>
        <div class="glow-story"></div>
        <div class="scnt">
          <span class="story-tag">ORYX · REFLEXIÓN</span>
          <h1 class="stxl">LLEVAS AÑOS<br>ENSEÑANDO.<br>ES MOMENTO<br>DE QUE ALGUIEN<br>TE LO PAGUE.</h1>
          <div class="divc"></div>
          <p style="font-size:28px;font-weight:300;color:rgba(245,240,232,0.45);margin-top:16px;">Tu audiencia ya confía en ti.</p>
        </div>
        <div class="brand">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    { id: 'historia-miercoles', w: 1080, h: 1920, html: `
      <div class="story">
        <div class="noise"></div>
        <div class="sc tl"></div><div class="sc tr"></div>
        <div class="sc bl"></div><div class="sc br"></div>
        <div class="glow-story" style="background:radial-gradient(circle,rgba(255,184,0,0.07) 0%,transparent 60%);"></div>
        <div class="scnt">
          <span class="story-tag">ORYX · DATO</span>
          <p style="font-family:'Bebas Neue',sans-serif;font-size:220px;line-height:1;color:#c9a84c;margin-bottom:8px;">+54%</p>
          <h2 class="stlg" style="font-size:64px;margin-bottom:28px;">CREADORES DE CONTENIDO<br>GASTRONÓMICO<br>EN MÉXICO EN 2024</h2>
          <div class="divc"></div>
          <p style="font-size:26px;font-weight:300;color:#FF4500;margin-top:20px;">El nicho está creciendo. La ventana es ahora.</p>
          <p style="font-size:13px;font-weight:300;color:rgba(245,240,232,0.18);margin-top:28px;letter-spacing:0.12em;">FUENTE: HOTMART 2025</p>
        </div>
        <div class="brand">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    { id: 'historia-jueves', w: 1080, h: 1920, html: `
      <div class="story">
        <div class="noise"></div>
        <div class="sc tl"></div><div class="sc tr"></div>
        <div class="sc bl"></div><div class="sc br"></div>
        <div class="glow-story"></div>
        <div class="scnt">
          <span class="story-tag">ORYX · PREGUNTA</span>
          <h1 class="stlg" style="font-size:76px;margin-bottom:64px;">¿TIENES UNA AUDIENCIA<br>QUE CONFÍA EN TI<br>PERO NO SABES<br>CÓMO<br>MONETIZARLA?</h1>
          <div class="survey-block survey-a">SÍ, ES MI CASO</div>
          <div class="survey-block survey-b">TODAVÍA NO LO HE PENSADO</div>
        </div>
        <div class="brand">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    { id: 'historia-viernes', w: 1080, h: 1920, html: `
      <div class="story">
        <div class="noise"></div>
        <div class="sc tl"></div><div class="sc tr"></div>
        <div class="sc bl"></div><div class="sc br"></div>
        <div class="glow-story"></div>
        <div class="scnt">
          <span class="story-tag">ORYX · SISTEMA</span>
          <p style="font-family:'Bebas Neue',sans-serif;font-size:210px;line-height:1;color:#F5F0E8;margin-bottom:8px;">30</p>
          <p style="font-family:'Bebas Neue',sans-serif;font-size:100px;line-height:1;color:#FF4500;margin-bottom:40px;">DÍAS.</p>
          <div class="divc"></div>
          <p style="font-size:28px;font-weight:300;color:rgba(245,240,232,0.55);line-height:1.6;margin-top:28px;margin-bottom:52px;">De historia personal a lanzamiento completo.<br>Sin que el creador invierta un peso.</p>
          <div class="pill-or">📩 DM ABIERTO</div>
        </div>
        <div class="brand">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    { id: 'historia-sabado', w: 1080, h: 1920, html: `
      <div class="story">
        <div class="noise"></div>
        <div class="sc tl"></div><div class="sc tr"></div>
        <div class="sc bl"></div><div class="sc br"></div>
        <div class="glow-story"></div>
        <div class="scnt">
          <span class="story-tag">ORYX · DETRÁS</span>
          <h1 class="stxl">CONSTRUYENDO<br>EL SISTEMA QUE<br>CONVIERTE<br>CONOCIMIENTO<br>EN INGRESOS.</h1>
          <div class="divc"></div>
          <p style="font-size:26px;font-weight:300;color:#FFB800;letter-spacing:0.05em;margin-top:16px;">Esto es lo que hacemos cada día.</p>
        </div>
        <div class="brand">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    // ════════════════════════════════════════════════════════
    // POSTS CON IMAGEN (1080 × 1080)
    // ════════════════════════════════════════════════════════

    { id: 'post-normal-1', w: 1080, h: 1080, html: `
      <div class="slide">
        <div class="bg-img" style="background-image:url('${p1}');"></div>
        <div class="bg-overlay" style="background:rgba(10,10,8,0.78);"></div>
        <div class="noise"></div>
        <div class="c tl"></div><div class="c tr"></div>
        <div class="c bl"></div><div class="c br"></div>
        <div class="cnt center">
          <p style="font-size:12px;font-weight:400;letter-spacing:0.3em;text-transform:uppercase;color:rgba(201,168,76,0.55);margin-bottom:44px;">ORYX PERFORMANCE</p>
          <h1 class="txl" style="font-size:104px;">TU RECETA<br>MÁS COMPARTIDA<br>PUEDE SER TU<br>MEJOR PRODUCTO.</h1>
          <div class="divc"></div>
          <p style="font-size:22px;font-weight:300;color:rgba(245,240,232,0.45);margin-top:16px;">Solo necesitas el sistema correcto.</p>
        </div>
        <div class="brand">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    { id: 'post-normal-2', w: 1080, h: 1080, html: `
      <div class="slide">
        <div class="bg-img" style="background-image:url('${p2}');"></div>
        <div class="bg-overlay" style="background:rgba(10,10,8,0.80);"></div>
        <div class="noise"></div>
        <div class="c tl"></div><div class="c tr"></div>
        <div class="c bl"></div><div class="c br"></div>
        <div class="cnt center">
          <h1 class="txl" style="font-size:94px;">EL CONOCIMIENTO<br>QUE COMPARTES<br>GRATIS VALE MÁS<br>DE LO QUE CREES.</h1>
          <div class="divc"></div>
          <p style="font-size:26px;font-weight:300;color:#FFB800;margin-bottom:36px;">Estructúralo. Véndelo. Escálalo.</p>
          <div class="pill-or" style="font-size:20px;padding:14px 40px;margin-top:0;">📩 DM — @oryx.company</div>
        </div>
        <div class="brand">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    { id: 'post-normal-3', w: 1080, h: 1080, html: `
      <div class="slide">
        <div class="bg-img" style="background-image:url('${p3}');"></div>
        <div class="bg-overlay" style="background:rgba(10,10,8,0.82);"></div>
        <div class="noise"></div>
        <div class="c tl"></div><div class="c tr"></div>
        <div class="c bl"></div><div class="c br"></div>
        <div class="cnt center">
          <p style="font-family:'Bebas Neue',sans-serif;font-size:200px;line-height:1;color:#c9a84c;margin-bottom:8px;">30</p>
          <h1 class="tlg" style="font-size:80px;margin-bottom:20px;">DÍAS ES TODO LO QUE<br>NECESITA UN<br>LANZAMIENTO<br>BIEN HECHO.</h1>
          <div class="divc"></div>
          <p style="font-size:20px;font-weight:300;color:rgba(245,240,232,0.38);margin-top:16px;">Si tienes la audiencia, nosotros tenemos el sistema.</p>
        </div>
        <div class="brand">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    // ════════════════════════════════════════════════════════
    // POST SIN IMAGEN (1080 × 1080)
    // ════════════════════════════════════════════════════════

    { id: 'post-normal-4', w: 1080, h: 1080, html: `
      <div class="slide">
        <div class="noise"></div>
        <div class="c tl"></div><div class="c tr"></div>
        <div class="c bl"></div><div class="c br"></div>
        <div class="glow"></div>
        <div class="ctrst row">
          <div class="cb dim" style="flex:1;">
            <p class="cb-label dim">OPCIÓN A</p>
            <p class="cb-title dim" style="font-size:34px;text-decoration:line-through;text-decoration-color:rgba(245,240,232,0.12);">ESPERAR A QUE<br>EL ALGORITMO<br>TE PAGUE</p>
          </div>
          <div class="vs-sep">VS</div>
          <div class="cb lit" style="flex:1;">
            <p class="cb-label or">OPCIÓN B</p>
            <p class="cb-title or" style="font-size:34px;">VENDERLE<br>DIRECTAMENTE<br>A TU AUDIENCIA</p>
          </div>
        </div>
        <div style="position:absolute;bottom:56px;left:0;right:0;text-align:center;z-index:5;">
          <p style="font-size:17px;font-weight:300;color:rgba(245,240,232,0.3);letter-spacing:0.04em;">La diferencia no es el talento. Es el sistema.</p>
        </div>
        <div class="brand" style="bottom:30px;">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    // ════════════════════════════════════════════════════════
    // CARRUSEL C11 — POR QUÉ EL 99% NO MONETIZA
    // ════════════════════════════════════════════════════════

    { id: 'c11-slide-1', w: 1080, h: 1080, html: `
      <div class="slide">
        <div class="noise"></div>
        <div class="c tl"></div><div class="c tr"></div>
        <div class="c bl"></div><div class="c br"></div>
        <div class="glow"></div>
        <div class="nbg">C11</div>
        <div class="cnt center">
          <div class="lac"></div>
          <h1 class="txl" style="font-size:84px;">POR QUÉ EL 99%<br>DE LOS CREADORES<br>GASTRONÓMICOS<br>NO MONETIZA</h1>
          <h2 class="txl or" style="font-size:58px;margin-bottom:0;">(Y cómo cambiar eso)</h2>
        </div>
        <div class="brand">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    { id: 'c11-slide-2', w: 1080, h: 1080, html: `
      <div class="slide">
        <div class="noise"></div>
        <div class="c tl"></div><div class="c tr"></div><div class="c br"></div>
        <div class="nbg">01</div>
        <div class="cnt tl">
          <h2 class="tlg">CREEN QUE<br>NECESITAN MÁS<br>SEGUIDORES</h2>
          <div class="div"></div>
          <p class="body">Un creador con 10,000 seguidores comprometidos puede ganar más que uno con 500,000 sin sistema de ventas.</p>
        </div>
        <div class="snum">01 / 06</div>
        <div class="brand">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    { id: 'c11-slide-3', w: 1080, h: 1080, html: `
      <div class="slide">
        <div class="noise"></div>
        <div class="c tl"></div><div class="c tr"></div><div class="c br"></div>
        <div class="nbg">02</div>
        <div class="cnt tl">
          <h2 class="tlg">ESPERAN EL<br>MOMENTO<br>PERFECTO</h2>
          <div class="div"></div>
          <p class="body">No existe. El mejor momento para lanzar es cuando tienes una audiencia que ya confía en ti — y eso ya lo tienes.</p>
        </div>
        <div class="snum">02 / 06</div>
        <div class="brand">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    { id: 'c11-slide-4', w: 1080, h: 1080, html: `
      <div class="slide">
        <div class="noise"></div>
        <div class="c tl"></div><div class="c tr"></div><div class="c br"></div>
        <div class="nbg">03</div>
        <div class="cnt tl">
          <h2 class="tlg">NO SABEN<br>QUÉ VENDER</h2>
          <div class="div"></div>
          <p class="body">Tu audiencia ya te lo dice en los comentarios. "¿Cómo lo haces?", "¿enseñas esto?", "¿tienes un curso?" — eso es demanda real.</p>
        </div>
        <div class="snum">03 / 06</div>
        <div class="brand">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    { id: 'c11-slide-5', w: 1080, h: 1080, html: `
      <div class="slide">
        <div class="noise"></div>
        <div class="c tl"></div><div class="c tr"></div><div class="c br"></div>
        <div class="nbg">04</div>
        <div class="cnt tl">
          <h2 class="tlg">CREEN QUE<br>ES COMPLICADO</h2>
          <div class="div"></div>
          <p class="body">Lo es — si lo intentas solo. Con un sistema y un equipo detrás, el proceso es claro, paso a paso, en 30 días.</p>
        </div>
        <div class="snum">04 / 06</div>
        <div class="brand">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    { id: 'c11-slide-6', w: 1080, h: 1080, html: `
      <div class="slide slide-cta">
        <div class="noise noise-cta"></div>
        <div class="cw tl"></div><div class="cw tr"></div>
        <div class="cw bl"></div><div class="cw br"></div>
        <div class="glow-w"></div>
        <div class="cnt center">
          <h1 class="txl" style="font-size:88px;color:#F5F0E8;line-height:1.0;margin-bottom:32px;">¿EN CUÁL<br>DE ESTOS<br>TE IDENTIFICAS?</h1>
          <p class="sub w">Cuéntanos por DM — tiene solución.</p>
          <div class="pill-cta">📩 @oryx.company</div>
        </div>
        <div class="brand w">ORYX PERFORMANCE</div>
      </div>` },

    // ════════════════════════════════════════════════════════
    // CARRUSEL C12 — ANTES Y DESPUÉS
    // ════════════════════════════════════════════════════════

    { id: 'c12-slide-1', w: 1080, h: 1080, html: `
      <div class="slide">
        <div class="noise"></div>
        <div class="c tl"></div><div class="c tr"></div>
        <div class="c bl"></div><div class="c br"></div>
        <div class="glow"></div>
        <div class="nbg">C12</div>
        <div class="cnt center">
          <div class="lac"></div>
          <h1 class="txl" style="font-size:92px;">ANTES Y DESPUÉS<br>DE TENER UN<br>SISTEMA DE VENTAS</h1>
          <h2 class="txl or" style="font-size:62px;margin-bottom:0;">La diferencia es real.</h2>
        </div>
        <div class="brand">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    { id: 'c12-slide-2', w: 1080, h: 1080, html: `
      <div class="slide">
        <div class="noise"></div>
        <div class="c tl"></div><div class="c tr"></div>
        <div class="c bl"></div><div class="c br"></div>
        <div class="ctrst row">
          <div class="cb dim" style="flex:1;">
            <p class="cb-label dim">ANTES</p>
            <p class="cb-title dim" style="font-size:32px;">SUBIR CONTENIDO<br>Y ESPERAR<br>LIKES</p>
          </div>
          <div class="vs-sep">→</div>
          <div class="cb lit" style="flex:1;">
            <p class="cb-label or">DESPUÉS</p>
            <p class="cb-title or" style="font-size:28px;">SUBIR CONTENIDO<br>QUE CALIENTA<br>A TU AUDIENCIA<br>HACIA UNA COMPRA</p>
          </div>
        </div>
        <div class="snum">01 / 06</div>
        <div class="brand">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    { id: 'c12-slide-3', w: 1080, h: 1080, html: `
      <div class="slide">
        <div class="noise"></div>
        <div class="c tl"></div><div class="c tr"></div>
        <div class="c bl"></div><div class="c br"></div>
        <div class="ctrst row">
          <div class="cb dim" style="flex:1;">
            <p class="cb-label dim">ANTES</p>
            <p class="cb-title dim" style="font-size:30px;">DEPENDER DE<br>QUE UNA MARCA<br>TE CONTACTE</p>
          </div>
          <div class="vs-sep">→</div>
          <div class="cb lit" style="flex:1;">
            <p class="cb-label or">DESPUÉS</p>
            <p class="cb-title or" style="font-size:28px;">TENER TU PROPIO<br>PRODUCTO QUE<br>VENDE MIENTRAS<br>DUERMES</p>
          </div>
        </div>
        <div class="snum">02 / 06</div>
        <div class="brand">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    { id: 'c12-slide-4', w: 1080, h: 1080, html: `
      <div class="slide">
        <div class="noise"></div>
        <div class="c tl"></div><div class="c tr"></div>
        <div class="c bl"></div><div class="c br"></div>
        <div class="ctrst row">
          <div class="cb dim" style="flex:1;">
            <p class="cb-label dim">ANTES</p>
            <p class="cb-title dim" style="font-size:28px;">NO SABER SI<br>TU AUDIENCIA<br>COMPRARÍA<br>ALGO</p>
          </div>
          <div class="vs-sep">→</div>
          <div class="cb lit" style="flex:1;">
            <p class="cb-label or">DESPUÉS</p>
            <p class="cb-title or" style="font-size:26px;">USAR ENCUESTAS<br>Y TRIGGERS PARA<br>QUE TE LO PIDA<br>ANTES DE QUE<br>LO LANCES</p>
          </div>
        </div>
        <div class="snum">03 / 06</div>
        <div class="brand">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    { id: 'c12-slide-5', w: 1080, h: 1080, html: `
      <div class="slide">
        <div class="noise"></div>
        <div class="c tl"></div><div class="c tr"></div>
        <div class="c bl"></div><div class="c br"></div>
        <div class="glow glow-c"></div>
        <div class="cnt center">
          <h2 class="tlg" style="margin-bottom:16px;">EL SISTEMA<br>NO ES MAGIA</h2>
          <div class="divc"></div>
          <p class="txl yw" style="font-size:80px;margin-bottom:0;">Es método.</p>
          <p class="sub sm" style="margin-top:28px;">30 días de historias con psicología aplicada.<br>Guiones personalizados. Landing page. Funnels. Lanzamiento.</p>
        </div>
        <div class="snum">04 / 06</div>
        <div class="brand">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    { id: 'c12-slide-6', w: 1080, h: 1080, html: `
      <div class="slide slide-cta">
        <div class="noise noise-cta"></div>
        <div class="cw tl"></div><div class="cw tr"></div>
        <div class="cw bl"></div><div class="cw br"></div>
        <div class="glow-w"></div>
        <div class="cnt center">
          <h1 class="txl" style="font-size:76px;color:#F5F0E8;line-height:1.0;margin-bottom:32px;">¿QUIERES VER<br>CÓMO FUNCIONA<br>PARA TU CASO<br>ESPECÍFICO?</h1>
          <p class="sub w">Solo aceptamos 3 creadores por mes.</p>
          <div class="pill-cta" style="font-size:22px;">📩 DM ABIERTO · @oryx.company</div>
        </div>
        <div class="brand w">ORYX PERFORMANCE</div>
      </div>` },

    // ════════════════════════════════════════════════════════
    // CARRUSEL C13 — 5 SEÑALES
    // ════════════════════════════════════════════════════════

    { id: 'c13-slide-1', w: 1080, h: 1080, html: `
      <div class="slide">
        <div class="noise"></div>
        <div class="c tl"></div><div class="c tr"></div>
        <div class="c bl"></div><div class="c br"></div>
        <div class="glow"></div>
        <div class="nbg">C13</div>
        <div class="cnt center">
          <div class="lac"></div>
          <h1 class="txl" style="font-size:80px;">5 SEÑALES DE QUE<br>TU AUDIENCIA YA<br>ESTÁ LISTA PARA<br>COMPRARTE</h1>
          <h2 class="txl or" style="font-size:62px;margin-bottom:0;">¿Cuántas tienes?</h2>
        </div>
        <div class="brand">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    { id: 'c13-slide-2', w: 1080, h: 1080, html: `
      <div class="slide">
        <div class="noise"></div>
        <div class="c tl"></div><div class="c tr"></div><div class="c br"></div>
        <div class="nbg">01</div>
        <div class="cnt tl">
          <h2 class="tlg" style="font-size:78px;">TE PREGUNTAN<br>"¿CÓMO<br>LO HACES?"</h2>
          <div class="div"></div>
          <p class="body">Cuando la pregunta más frecuente en tus comentarios es sobre el proceso — no el resultado — hay deseo de aprender.</p>
        </div>
        <div class="snum">01 / 06</div>
        <div class="brand">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    { id: 'c13-slide-3', w: 1080, h: 1080, html: `
      <div class="slide">
        <div class="noise"></div>
        <div class="c tl"></div><div class="c tr"></div><div class="c br"></div>
        <div class="nbg">02</div>
        <div class="cnt tl">
          <h2 class="tlg" style="font-size:78px;">TE MANDAN<br>DMS PIDIENDO<br>CONSEJOS</h2>
          <div class="div"></div>
          <p class="body">Si ya responden tus DMs de forma orgánica, ya tienes relación. Eso es lo más difícil de construir — y ya lo tienes.</p>
        </div>
        <div class="snum">02 / 06</div>
        <div class="brand">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    { id: 'c13-slide-4', w: 1080, h: 1080, html: `
      <div class="slide">
        <div class="noise"></div>
        <div class="c tl"></div><div class="c tr"></div><div class="c br"></div>
        <div class="nbg">03</div>
        <div class="cnt tl">
          <h2 class="tlg" style="font-size:68px;">TUS SEGUIDORES<br>TE SIGUEN EN<br>MÚLTIPLES<br>PLATAFORMAS</h2>
          <div class="div"></div>
          <p class="body">Alguien que te sigue en IG, TikTok y YouTube no busca entretenimiento. Está buscando aprendizaje.</p>
        </div>
        <div class="snum">03 / 06</div>
        <div class="brand">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    { id: 'c13-slide-5', w: 1080, h: 1080, html: `
      <div class="slide">
        <div class="noise"></div>
        <div class="c tl"></div><div class="c tr"></div><div class="c br"></div>
        <div class="nbg" style="font-size:240px;letter-spacing:-0.04em;">04·05</div>
        <div class="cnt tl">
          <h2 class="tlg" style="font-size:80px;">TE ETIQUETAN<br>Y TE<br>RECOMIENDAN</h2>
          <div class="div"></div>
          <p class="body">Si tu audiencia habla de ti sin que se los pidas — tienen confianza real. Y la confianza es la única base que necesita un infoproducto para venderse.</p>
        </div>
        <div class="snum">04 / 06</div>
        <div class="brand">ORYX PERFORMANCE</div>
        <div class="bline"></div>
      </div>` },

    { id: 'c13-slide-6', w: 1080, h: 1080, html: `
      <div class="slide slide-cta">
        <div class="noise noise-cta"></div>
        <div class="cw tl"></div><div class="cw tr"></div>
        <div class="cw bl"></div><div class="cw br"></div>
        <div class="glow-w"></div>
        <div class="cnt center">
          <h1 class="txl" style="font-size:76px;color:#F5F0E8;line-height:1.0;margin-bottom:32px;">SI TIENES 3 O MÁS<br>DE ESTAS SEÑALES,<br>YA ESTÁS LISTO.</h1>
          <p class="sub w">El siguiente paso es el sistema.</p>
          <div class="pill-cta">📩 DM — @oryx.company</div>
        </div>
        <div class="brand w">ORYX PERFORMANCE</div>
      </div>` },
  ];
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  // 1. Download Unsplash images
  console.log('Descargando imágenes de Unsplash…');
  const downloads = [
    ['platoemplatado',   'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1080&q=80'],
    ['chefcocinando',    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1080&q=80'],
    ['cocinaprofesional','https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1080&q=80'],
  ];

  for (const [key, url] of downloads) {
    const dest = path.join(IMG_CACHE, `${key}.jpg`);
    imgPaths[key] = dest;
    if (fs.existsSync(dest)) {
      console.log(`  ✓ ${key}.jpg (cached)`);
      continue;
    }
    console.log(`  Descargando ${key}…`);
    try {
      await download(url, dest);
      console.log(`  ✓ ${key}.jpg`);
    } catch (e) {
      console.warn(`  ✗ ${key} no descargado: ${e.message} — se usará fondo negro`);
      imgPaths[key] = '';
    }
  }

  // 2. Generate PNGs
  const pieces = getPieces();
  console.log(`\nIniciando Puppeteer… (${pieces.length} piezas)\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  for (const piece of pieces) {
    process.stdout.write(`Generando ${piece.id}… `);
    const page = await browser.newPage();
    await page.setViewport({ width: piece.w, height: piece.h, deviceScaleFactor: 1 });

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>${CSS}</style></head>
<body>${piece.html}</body>
</html>`;

    await page.setContent(html, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1400));

    await page.screenshot({
      path: path.join(OUTPUT, `${piece.id}.png`),
      type: 'png',
      clip: { x: 0, y: 0, width: piece.w, height: piece.h },
    });

    console.log('✓');
    await page.close();
  }

  await browser.close();
  console.log(`\n✓ Listo — ${pieces.length} PNGs en /assets/semana-1/`);
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
