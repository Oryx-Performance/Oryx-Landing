const puppeteer = require('puppeteer');
const path = require('path');

// ─────────────────────────────────────────────────────────────
// CSS — design system 1080×1080 (×2 from the 540 viewer)
// ─────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0a0a08;
    color: #F5F0E8;
    font-family: 'Inter', sans-serif;
    width: 1080px; height: 1080px;
    overflow: hidden;
  }

  .slide {
    width: 1080px; height: 1080px;
    background: #0a0a08;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .slide-cta { background: #FF4500 !important; }

  /* Noise */
  .noise {
    position: absolute; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    opacity: 0.06; pointer-events: none; z-index: 1;
  }
  .noise-cta { opacity: 0.1; }

  /* Corners */
  .c { position: absolute; width: 28px; height: 28px; border-style: solid; z-index: 2; }
  .c.tl { top: 48px; left: 48px; border-color: rgba(255,69,0,0.4); border-width: 1.5px 0 0 1.5px; }
  .c.tr { top: 48px; right: 48px; border-color: rgba(255,69,0,0.4); border-width: 1.5px 1.5px 0 0; }
  .c.bl { bottom: 80px; left: 48px; border-color: rgba(255,69,0,0.4); border-width: 0 0 1.5px 1.5px; }
  .c.br { bottom: 80px; right: 48px; border-color: rgba(255,69,0,0.4); border-width: 0 1.5px 1.5px 0; }
  .cw { position: absolute; width: 28px; height: 28px; border-style: solid; z-index: 2; }
  .cw.tl { top: 48px; left: 48px; border-color: rgba(255,255,255,0.5); border-width: 1.5px 0 0 1.5px; }
  .cw.tr { top: 48px; right: 48px; border-color: rgba(255,255,255,0.5); border-width: 1.5px 1.5px 0 0; }
  .cw.bl { bottom: 80px; left: 48px; border-color: rgba(255,255,255,0.5); border-width: 0 0 1.5px 1.5px; }
  .cw.br { bottom: 80px; right: 48px; border-color: rgba(255,255,255,0.5); border-width: 0 1.5px 1.5px 0; }

  /* Glows */
  .glow {
    position: absolute; width: 720px; height: 720px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,69,0,0.11) 0%, transparent 65%);
    top: 50%; left: 50%; transform: translate(-50%, -40%);
    pointer-events: none; z-index: 0;
  }
  .glow-c { transform: translate(-50%, -50%); background: radial-gradient(circle, rgba(255,184,0,0.09) 0%, transparent 65%); }
  .glow-w {
    position: absolute; width: 800px; height: 800px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 55%);
    top: 50%; left: 50%; transform: translate(-50%, -50%);
    pointer-events: none; z-index: 0;
  }

  /* Bottom accent line */
  .bline {
    position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, transparent, rgba(255,69,0,0.5) 25%, rgba(255,69,0,0.5) 75%, transparent);
    z-index: 4;
  }

  /* Brand mark */
  .brand {
    position: absolute; bottom: 32px; left: 0; right: 0;
    text-align: center;
    font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500;
    letter-spacing: 0.44em; text-transform: uppercase;
    color: rgba(255,69,0,0.5); z-index: 3;
  }
  .brand.w { color: rgba(255,255,255,0.38); }

  /* Slide number */
  .snum {
    position: absolute; top: 56px; right: 56px;
    font-size: 16px; font-weight: 400; letter-spacing: 0.16em;
    color: rgba(245,240,232,0.2); z-index: 3;
  }

  /* Content layouts */
  .cnt {
    position: relative; z-index: 3;
    flex: 1; display: flex; flex-direction: column;
  }
  .cnt.center {
    align-items: center; justify-content: center;
    text-align: center; padding: 88px 88px 48px;
  }
  .cnt.tl {
    justify-content: center;
    padding: 88px 88px 48px;
  }

  /* Line accent */
  .la { width: 48px; height: 2px; background: #FF4500; margin-bottom: 44px; }

  /* Badge */
  .tag {
    display: inline-block;
    font-size: 16px; font-weight: 600; letter-spacing: 0.2em;
    color: #FF4500; border: 1.5px solid rgba(255,69,0,0.38);
    padding: 10px 24px; margin-bottom: 44px;
    text-transform: uppercase; align-self: flex-start;
  }
  .tag.y { color: #FFB800; border-color: rgba(255,184,0,0.38); }

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
  .tmd {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 64px; line-height: 0.95; color: #F5F0E8;
    letter-spacing: 0.01em;
  }
  .or { color: #FF4500; }
  .yw { color: #FFB800; }

  .sub {
    font-size: 24px; font-weight: 300;
    color: rgba(245,240,232,0.55); line-height: 1.55;
  }
  .sub.w { color: rgba(255,255,255,0.82); font-size: 26px; margin-bottom: 48px; }
  .sub.sm { font-size: 20px; color: rgba(245,240,232,0.32); letter-spacing: 0.04em; margin-top: 24px; }

  .body {
    font-size: 23px; font-weight: 300;
    color: rgba(245,240,232,0.52); line-height: 1.65; margin-top: 28px;
  }

  .div { width: 40px; height: 1.5px; background: rgba(255,69,0,0.5); margin: 32px 0; }
  .divc { width: 40px; height: 1.5px; background: rgba(255,69,0,0.5); margin: 32px auto; }

  /* Large dim background number */
  .nbg {
    position: absolute;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 360px; line-height: 1;
    color: rgba(245,240,232,0.045);
    right: 32px; top: 50%; transform: translateY(-50%);
    pointer-events: none; z-index: 0; letter-spacing: -0.02em;
  }

  /* Signal block */
  .sb { display: flex; align-items: flex-start; gap: 32px; }
  .sb.mt { margin-top: 52px; }
  .sn { font-family: 'Bebas Neue', sans-serif; font-size: 88px; line-height: 0.85; flex-shrink: 0; padding-top: 4px; }

  /* Contrast slides */
  .ctrst {
    position: relative; z-index: 3;
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

  /* List slide */
  .lstw {
    position: relative; z-index: 3;
    flex: 1; display: flex; flex-direction: column;
    justify-content: center; padding: 80px;
  }
  .lst-ttl {
    font-size: 16px; font-weight: 600; letter-spacing: 0.18em;
    text-transform: uppercase; color: rgba(245,240,232,0.35);
    margin-bottom: 36px;
  }
  .lst { list-style: none; border: 1.5px solid rgba(255,69,0,0.12); }
  .li {
    display: flex; align-items: center; gap: 24px;
    padding: 18px 32px;
    border-bottom: 1px solid rgba(255,255,255,0.04);
    font-family: 'Bebas Neue', sans-serif;
    font-size: 36px; color: rgba(245,240,232,0.65);
    letter-spacing: 0.03em;
  }
  .li:last-child { border-bottom: none; }
  .ld { width: 20px; height: 1px; background: #FF4500; opacity: 0.45; flex-shrink: 0; }

  /* Pills */
  .pill {
    display: inline-block;
    background: rgba(255,69,0,0.12);
    border: 1.5px solid rgba(255,69,0,0.38);
    padding: 12px 36px; margin-bottom: 40px;
    font-size: 18px; font-weight: 500; letter-spacing: 0.14em;
    text-transform: uppercase; color: #FF4500;
  }
  .pill-cta {
    display: inline-block;
    background: #F5F0E8; padding: 20px 52px; margin-top: 40px;
    font-size: 26px; font-weight: 600; letter-spacing: 0.08em;
    color: #FF4500; text-transform: uppercase;
  }
`;

// ─────────────────────────────────────────────────────────────
// SLIDES
// ─────────────────────────────────────────────────────────────
const slides = [

  // ══ CARRUSEL 1 — EL DOLOR ══════════════════════════════════

  { id: 'c1-1', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div>
      <div class="c bl"></div><div class="c br"></div>
      <div class="glow"></div>
      <div class="cnt center">
        <div class="la"></div>
        <h1 class="txl">50,000<br>SEGUIDORES</h1>
        <h2 class="txl or" style="margin-bottom:28px;">$0 INGRESOS</h2>
        <p style="font-size:20px;letter-spacing:0.14em;color:rgba(245,240,232,0.28);text-transform:uppercase;">¿Por qué pasa esto?</p>
      </div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'c1-2', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div><div class="c br"></div>
      <div class="nbg">01</div>
      <div class="cnt tl">
        <h2 class="tlg">TIENES LA<br>AUDIENCIA</h2>
        <div class="div"></div>
        <p class="body">Miles de personas ven tu contenido cada semana.<br>Te siguen, te comparten, te buscan.</p>
      </div>
      <div class="snum">01 / 06</div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'c1-3', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div><div class="c br"></div>
      <div class="nbg">02</div>
      <div class="cnt tl">
        <h2 class="tlg">PERO NO TIENES<br>EL SISTEMA</h2>
        <div class="div"></div>
        <p class="body">Sin un producto claro, sin un proceso de venta,<br>sin una forma de convertir atención en dinero.</p>
      </div>
      <div class="snum">02 / 06</div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'c1-4', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div>
      <div class="c bl"></div><div class="c br"></div>
      <div class="ctrst row">
        <div class="cb dim" style="flex:1;">
          <p class="cb-label dim">OPCIÓN A</p>
          <p class="cb-title dim">CREAR CONTENIDO<br>GRATIS PARA<br>SIEMPRE</p>
        </div>
        <div class="vs-sep">VS</div>
        <div class="cb lit" style="flex:1;">
          <p class="cb-label or">OPCIÓN B</p>
          <p class="cb-title or">MONETIZAR<br>LO QUE<br>YA SABES</p>
        </div>
      </div>
      <div class="snum">03 / 06</div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'c1-5', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div>
      <div class="c bl"></div><div class="c br"></div>
      <div class="glow glow-c"></div>
      <div class="cnt center">
        <h2 class="tlg" style="margin-bottom:16px;">EL CONOCIMIENTO<br>QUE TIENES</h2>
        <div class="divc"></div>
        <p class="txl yw" style="font-size:76px;margin-bottom:0;">Vale más de lo que crees.</p>
        <p class="sub sm" style="margin-top:36px;">La diferencia entre tú y quien ya cobra<br>está en el sistema, no en el talento.</p>
      </div>
      <div class="snum">04 / 06</div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'c1-6', html: `
    <div class="slide slide-cta">
      <div class="noise noise-cta"></div>
      <div class="cw tl"></div><div class="cw tr"></div>
      <div class="cw bl"></div><div class="cw br"></div>
      <div class="glow-w"></div>
      <div class="cnt center">
        <h1 class="txl" style="font-size:92px;color:#F5F0E8;line-height:1.0;margin-bottom:32px;">ES MOMENTO<br>DE CONVERTIR TU<br>CONOCIMIENTO<br>EN INGRESOS</h1>
        <p class="sub w">Oryx lo hace por ti.<br>Tú pones el nombre.</p>
        <div class="pill-cta">DM ABIERTO</div>
      </div>
      <div class="brand w">ORYX PERFORMANCE</div>
    </div>` },

  // ══ CARRUSEL 4 — EL PROCESO ════════════════════════════════

  { id: 'c4-1', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div>
      <div class="c bl"></div><div class="c br"></div>
      <div class="glow"></div>
      <div class="cnt center">
        <div class="la"></div>
        <h1 class="txl">DE 0 A<br>LANZAMIENTO</h1>
        <h2 class="txl or" style="margin-bottom:28px;">EN 30 DÍAS</h2>
        <p style="font-size:20px;letter-spacing:0.14em;color:rgba(245,240,232,0.28);text-transform:uppercase;">Así funciona el proceso</p>
      </div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'c4-2', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div><div class="c br"></div>
      <div class="cnt tl">
        <span class="tag">SEMANA 1</span>
        <h2 class="tlg">EXTRAEMOS<br>TU HISTORIA</h2>
        <div class="div"></div>
        <p class="body">Entrevista profunda. Identificamos tu conocimiento, tu audiencia y lo que te hace diferente.</p>
      </div>
      <div class="snum">01 / 06</div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'c4-3', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div><div class="c br"></div>
      <div class="cnt tl">
        <span class="tag">SEMANA 2</span>
        <h2 class="tlg">CONSTRUIMOS<br>EL SISTEMA</h2>
        <div class="div"></div>
        <p class="body">Curso, landing page, secuencia de ventas, guiones de historias.<br>Oryx produce todo.</p>
      </div>
      <div class="snum">02 / 06</div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'c4-4', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div><div class="c br"></div>
      <div class="cnt tl">
        <span class="tag">SEMANA 3</span>
        <h2 class="tlg">CALENTAMOS<br>TU AUDIENCIA</h2>
        <div class="div"></div>
        <p class="body">30 días de historias con psicología aplicada. Tu audiencia pasa de espectadora a compradora.</p>
      </div>
      <div class="snum">03 / 06</div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'c4-5', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div>
      <div class="c bl"></div><div class="c br"></div>
      <div class="glow glow-c"></div>
      <div class="cnt center">
        <h2 class="tlg" style="margin-bottom:16px;">TÚ SOLO<br>APARECES</h2>
        <div class="divc"></div>
        <p class="txl yw" style="font-size:64px;margin-bottom:0;">Nosotros manejamos el resto.</p>
        <p class="sub sm" style="margin-top:36px;">Sin inversión. Sin riesgo.<br>Solo revenue share cuando hay ventas.</p>
      </div>
      <div class="snum">04 / 06</div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'c4-6', html: `
    <div class="slide slide-cta">
      <div class="noise noise-cta"></div>
      <div class="cw tl"></div><div class="cw tr"></div>
      <div class="cw bl"></div><div class="cw br"></div>
      <div class="glow-w"></div>
      <div class="cnt center">
        <h1 class="txl" style="font-size:88px;color:#F5F0E8;line-height:1.0;margin-bottom:32px;">¿QUIERES VER<br>CÓMO FUNCIONA<br>PARA TI?</h1>
        <p class="sub w">Evaluación gratuita —<br>solo 3 lugares al mes</p>
        <div class="pill-cta">ESCRÍBENOS</div>
      </div>
      <div class="brand w">ORYX PERFORMANCE</div>
    </div>` },

  // ══ CARRUSEL 5 — LA OBJECIÓN ═══════════════════════════════

  { id: 'c5-1', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div>
      <div class="c bl"></div><div class="c br"></div>
      <div class="glow"></div>
      <div class="cnt center">
        <div class="la"></div>
        <h1 class="txl" style="font-size:100px;">«YO SOLO<br>NO PUEDO»</h1>
        <h2 class="txl or" style="margin-bottom:28px;">TIENES RAZÓN.</h2>
        <p style="font-size:20px;letter-spacing:0.14em;color:rgba(245,240,232,0.28);text-transform:uppercase;">Por eso no tienes que hacerlo solo.</p>
      </div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'c5-2', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div>
      <div class="c bl"></div><div class="c br"></div>
      <div class="lstw">
        <p class="lst-ttl">Crear un infoproducto solo requiere:</p>
        <ul class="lst">
          <li class="li"><span class="ld"></span>Grabar el curso</li>
          <li class="li"><span class="ld"></span>Diseñar la landing</li>
          <li class="li"><span class="ld"></span>Escribir los emails</li>
          <li class="li"><span class="ld"></span>Crear el funnel de ventas</li>
          <li class="li"><span class="ld"></span>Hacer el lanzamiento</li>
          <li class="li"><span class="ld"></span>Responder objeciones</li>
        </ul>
      </div>
      <div class="snum">01 / 06</div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'c5-3', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div>
      <div class="c bl"></div><div class="c br"></div>
      <div class="ctrst">
        <div class="cb dim" style="flex:1;margin-bottom:0;">
          <p class="cb-label dim">SIN ORYX</p>
          <p class="cb-title dim" style="font-size:40px;">HACERLO TÚ SOLO =<br>MESES, ERRORES,<br>AGOTAMIENTO</p>
        </div>
        <div class="vs-sep" style="padding:12px 0;font-size:26px;">VS</div>
        <div class="cb lit" style="flex:1;">
          <p class="cb-label or">CON ORYX</p>
          <p class="cb-title or" style="font-size:40px;">30 DÍAS, SISTEMA<br>PROBADO, TÚ SOLO<br>APARECES</p>
        </div>
      </div>
      <div class="snum">02 / 06</div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'c5-4', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div><div class="c br"></div>
      <div class="nbg" style="font-size:440px;color:rgba(245,240,232,0.04);">30</div>
      <div class="cnt tl">
        <h2 class="tlg">DÍAS ES TODO<br>LO QUE<br>NECESITAS</h2>
        <div class="div"></div>
        <p class="body">Si tienes una audiencia que confía en ti,<br>ya tienes lo más difícil.</p>
      </div>
      <div class="snum">03 / 06</div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'c5-5', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div>
      <div class="c bl"></div><div class="c br"></div>
      <div class="glow glow-c"></div>
      <div class="cnt center">
        <h2 class="tlg" style="margin-bottom:16px;">EL CONOCIMIENTO<br>ES TUYO</h2>
        <div class="divc"></div>
        <p class="txl yw" style="font-size:68px;margin-bottom:0;">La producción es nuestra.</p>
        <p class="sub sm" style="margin-top:36px;">Revenue share. Sin inversión.<br>Sin riesgo de tu parte.</p>
      </div>
      <div class="snum">04 / 06</div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'c5-6', html: `
    <div class="slide slide-cta">
      <div class="noise noise-cta"></div>
      <div class="cw tl"></div><div class="cw tr"></div>
      <div class="cw bl"></div><div class="cw br"></div>
      <div class="glow-w"></div>
      <div class="cnt center">
        <h1 class="txl" style="font-size:84px;color:#F5F0E8;line-height:1.0;margin-bottom:32px;">¿TIENES UNA<br>AUDIENCIA QUE<br>CONFÍA EN TI?</h1>
        <p class="sub w">Eso es suficiente para empezar.</p>
        <div class="pill-cta" style="font-size:22px;">EVALÚA TU CASO — ES GRATIS</div>
      </div>
      <div class="brand w">ORYX PERFORMANCE</div>
    </div>` },

];

// ─────────────────────────────────────────────────────────────
// PUPPETEER RUNNER
// ─────────────────────────────────────────────────────────────
async function generateSlides() {
  console.log('Iniciando Puppeteer…');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none'],
  });

  for (const slide of slides) {
    console.log(`Generando ${slide.id}…`);
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${css}</style>
</head>
<body>
  ${slide.html}
</body>
</html>`;

    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));

    const outputPath = path.join(__dirname, `${slide.id}.png`);
    await page.screenshot({
      path: outputPath,
      type: 'png',
      clip: { x: 0, y: 0, width: 1080, height: 1080 },
    });

    console.log(`  ✓ ${slide.id}.png`);
    await page.close();
  }

  await browser.close();
  console.log('\nListo — 18 slides generados en /carruseles/');
}

generateSlides().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
