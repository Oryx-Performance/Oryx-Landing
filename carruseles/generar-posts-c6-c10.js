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

  /* Pills */
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

  // ══ C6 — POR QUÉ LOS CREADORES NO MONETIZAN ════════════════

  { id: 'post-c6-slide-1', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div>
      <div class="c bl"></div><div class="c br"></div>
      <div class="glow"></div>
      <div class="nbg">C6</div>
      <div class="cnt center">
        <div class="la"></div>
        <h1 class="txl">TIENES 3 AÑOS<br>CREANDO CONTENIDO</h1>
        <h2 class="txl or" style="margin-bottom:0;font-size:88px;">NADIE TE HA PAGADO<br>POR LO QUE SABES.</h2>
      </div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'post-c6-slide-2', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div><div class="c br"></div>
      <div class="nbg">01</div>
      <div class="cnt tl">
        <h2 class="tlg">NO ES TU<br>CONTENIDO</h2>
        <div class="div"></div>
        <p class="body">No es porque lo que publicas sea malo.<br>Tu contenido tiene valor.<br>El problema está en otro lado.</p>
      </div>
      <div class="snum">01 / 06</div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'post-c6-slide-3', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div><div class="c br"></div>
      <div class="nbg">02</div>
      <div class="cnt tl">
        <h2 class="tlg">EL ALGORITMO<br>NO PAGA</h2>
        <div class="div"></div>
        <p class="body">Las vistas no se convierten en dinero solas.<br>El algoritmo te da alcance — no ingresos.</p>
      </div>
      <div class="snum">02 / 06</div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'post-c6-slide-4', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div>
      <div class="c bl"></div><div class="c br"></div>
      <div class="ctrst row">
        <div class="cb dim" style="flex:1;">
          <p class="cb-label dim">OPCIÓN A</p>
          <p class="cb-title dim" style="font-size:32px;">SEGUIR ESPERANDO<br>QUE EL ALGORITMO<br>TE PAGUE</p>
        </div>
        <div class="vs-sep">VS</div>
        <div class="cb lit" style="flex:1;">
          <p class="cb-label or">OPCIÓN B</p>
          <p class="cb-title or" style="font-size:32px;">VENDERLE<br>DIRECTAMENTE<br>A TU AUDIENCIA</p>
        </div>
      </div>
      <div class="snum">03 / 06</div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'post-c6-slide-5', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div>
      <div class="c bl"></div><div class="c br"></div>
      <div class="glow glow-c"></div>
      <div class="cnt center">
        <h2 class="tlg" style="margin-bottom:16px;">LA DIFERENCIA<br>NO ES EL TALENTO</h2>
        <div class="divc"></div>
        <p class="txl yw" style="font-size:80px;margin-bottom:0;">Es el sistema.</p>
        <p class="sub sm" style="margin-top:36px;">Un creador con 10K seguidores comprometidos puede ganar<br>más que uno con 500K sin sistema de ventas.</p>
      </div>
      <div class="snum">04 / 06</div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'post-c6-slide-6', html: `
    <div class="slide slide-cta">
      <div class="noise noise-cta"></div>
      <div class="cw tl"></div><div class="cw tr"></div>
      <div class="cw bl"></div><div class="cw br"></div>
      <div class="glow-w"></div>
      <div class="cnt center">
        <h1 class="txl" style="font-size:80px;color:#F5F0E8;line-height:1.0;margin-bottom:32px;">TU CONOCIMIENTO<br>VALE MÁS DE LO QUE<br>EL ALGORITMO<br>TE PAGA</h1>
        <p class="sub w">Oryx lo convierte en ingresos reales.</p>
        <div class="pill-cta">📩 DM ABIERTO</div>
      </div>
      <div class="brand w">ORYX PERFORMANCE</div>
    </div>` },

  // ══ C7 — IMAGEN SIMPLE ══════════════════════════════════════

  { id: 'post-c7-slide-1', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div>
      <div class="c bl"></div><div class="c br"></div>
      <div class="glow glow-c"></div>
      <div class="cnt center">
        <h1 class="txl" style="font-size:100px;line-height:1.0;margin-bottom:40px;">EL CREADOR QUE<br>MÁS ENSEÑA GRATIS<br>ES EL QUE MEJOR<br>VENDE DESPUÉS.</h1>
        <div class="divc"></div>
        <p style="font-size:22px;font-weight:300;color:#FFB800;letter-spacing:0.04em;margin-top:24px;">Porque ya demostró que su conocimiento vale.</p>
      </div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  // ══ C8 — CÓMO FUNCIONA TRABAJAR CON ORYX ═══════════════════

  { id: 'post-c8-slide-1', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div>
      <div class="c bl"></div><div class="c br"></div>
      <div class="glow"></div>
      <div class="nbg">C8</div>
      <div class="cnt center">
        <div class="la"></div>
        <h1 class="txl" style="font-size:100px;">¿QUÉ HACE<br>EXACTAMENTE<br>ORYX?</h1>
        <h2 class="txl or" style="margin-bottom:0;font-size:72px;">TODO LO QUE EL CREADOR<br>NO TIENE QUE HACER.</h2>
      </div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'post-c8-slide-2', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div><div class="c br"></div>
      <div class="cnt tl">
        <span class="tag">PASO 01</span>
        <h2 class="tlg">EXTRAEMOS<br>TU HISTORIA</h2>
        <div class="div"></div>
        <p class="body">Una sesión de 60-90 minutos donde te hacemos preguntas sobre tu trayectoria. Con eso construimos todo el contenido.</p>
      </div>
      <div class="snum">01 / 06</div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'post-c8-slide-3', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div><div class="c br"></div>
      <div class="cnt tl">
        <span class="tag">PASO 02</span>
        <h2 class="tlg">CONSTRUIMOS<br>EL SISTEMA</h2>
        <div class="div"></div>
        <p class="body">Guiones para 30 días de historias, landing page, funnels de venta y copywriting. Todo personalizado.</p>
      </div>
      <div class="snum">02 / 06</div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'post-c8-slide-4', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div><div class="c br"></div>
      <div class="cnt tl">
        <span class="tag">PASO 03</span>
        <h2 class="tlg">LANZAMOS<br>EN 30 DÍAS</h2>
        <div class="div"></div>
        <p class="body">Tu audiencia pasa de espectadora a compradora. Con psicología aplicada, no con presión.</p>
      </div>
      <div class="snum">03 / 06</div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'post-c8-slide-5', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div>
      <div class="c bl"></div><div class="c br"></div>
      <div class="glow glow-c"></div>
      <div class="cnt center">
        <h2 class="tlg" style="margin-bottom:16px;">TÚ SOLO<br>APARECES</h2>
        <div class="divc"></div>
        <p class="txl yw" style="font-size:72px;margin-bottom:0;">Nosotros manejamos el resto.</p>
        <p class="sub sm" style="margin-top:36px;">Sin inversión de tu parte. Revenue share —<br>si tú no ganas, nosotros tampoco.</p>
      </div>
      <div class="snum">04 / 06</div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'post-c8-slide-6', html: `
    <div class="slide slide-cta">
      <div class="noise noise-cta"></div>
      <div class="cw tl"></div><div class="cw tr"></div>
      <div class="cw bl"></div><div class="cw br"></div>
      <div class="glow-w"></div>
      <div class="cnt center">
        <h1 class="txl" style="font-size:84px;color:#F5F0E8;line-height:1.0;margin-bottom:32px;">¿TIENES UNA<br>AUDIENCIA QUE<br>CONFÍA EN TI?</h1>
        <p class="sub w">Eso es suficiente para empezar.</p>
        <div class="pill-cta" style="font-size:20px;">SOLO 3 LUGARES POR MES · 📩 DM ABIERTO</div>
      </div>
      <div class="brand w">ORYX PERFORMANCE</div>
    </div>` },

  // ══ C9 — IMAGEN SIMPLE ══════════════════════════════════════

  { id: 'post-c9-slide-1', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div>
      <div class="c bl"></div><div class="c br"></div>
      <div class="glow"></div>
      <div class="cnt center">
        <h1 class="txl" style="font-size:108px;line-height:0.95;margin-bottom:36px;">50,000 SEGUIDORES<br>NO SON $50,000.</h1>
        <div class="divc"></div>
        <h2 class="txl or" style="font-size:72px;margin-bottom:0;line-height:1.0;">PERO PUEDEN SERLO<br>CON EL SISTEMA<br>CORRECTO.</h2>
      </div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  // ══ C10 — LO QUE NADIE LE DICE AL CREADOR GASTRONÓMICO ═════

  { id: 'post-c10-slide-1', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div>
      <div class="c bl"></div><div class="c br"></div>
      <div class="glow"></div>
      <div class="nbg">C10</div>
      <div class="cnt center">
        <div class="la"></div>
        <h1 class="txl">LO QUE NADIE<br>LE DICE</h1>
        <h2 class="txl or" style="margin-bottom:0;font-size:88px;">AL CREADOR<br>GASTRONÓMICO.</h2>
      </div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'post-c10-slide-2', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div><div class="c br"></div>
      <div class="nbg">01</div>
      <div class="cnt tl">
        <h2 class="tlg">LLEVAS AÑOS<br>ENSEÑANDO</h2>
        <div class="div"></div>
        <p class="body">Recetas, técnicas, trucos.<br>Todo gratis. Todo valioso. Todo sin precio.</p>
      </div>
      <div class="snum">01 / 06</div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'post-c10-slide-3', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div><div class="c br"></div>
      <div class="nbg">02</div>
      <div class="cnt tl">
        <h2 class="tlg" style="font-size:76px;">TU AUDIENCIA<br>NO TE SIGUE<br>POR ENTRETENI-<br>MIENTO</h2>
        <div class="div"></div>
        <p class="body">Te sigue porque confía en ti. Y la confianza es el activo más valioso que existe en internet.</p>
      </div>
      <div class="snum">02 / 06</div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'post-c10-slide-4', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div>
      <div class="c bl"></div><div class="c br"></div>
      <div class="ctrst row">
        <div class="cb dim" style="flex:1;">
          <p class="cb-label dim">OPCIÓN A</p>
          <p class="cb-title dim" style="font-size:36px;">MÁS<br>SEGUIDORES</p>
        </div>
        <div class="vs-sep">VS</div>
        <div class="cb lit" style="flex:1;">
          <p class="cb-label or">OPCIÓN B</p>
          <p class="cb-title or" style="font-size:32px;">UN SISTEMA<br>QUE CONVIERTE<br>LOS QUE<br>YA TIENES</p>
        </div>
      </div>
      <div class="snum">03 / 06</div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'post-c10-slide-5', html: `
    <div class="slide">
      <div class="noise"></div>
      <div class="c tl"></div><div class="c tr"></div>
      <div class="c bl"></div><div class="c br"></div>
      <div class="glow glow-c"></div>
      <div class="cnt center">
        <h2 class="tlg" style="margin-bottom:16px;">NO NECESITAS<br>MÁS ALCANCE</h2>
        <div class="divc"></div>
        <p class="txl yw" style="font-size:80px;margin-bottom:0;">Necesitas un sistema.</p>
        <p class="sub sm" style="margin-top:36px;">La confianza que ya construiste se convierte en ingresos<br>cuando hay un producto que la canaliza.</p>
      </div>
      <div class="snum">04 / 06</div>
      <div class="brand">ORYX PERFORMANCE</div>
      <div class="bline"></div>
    </div>` },

  { id: 'post-c10-slide-6', html: `
    <div class="slide slide-cta">
      <div class="noise noise-cta"></div>
      <div class="cw tl"></div><div class="cw tr"></div>
      <div class="cw bl"></div><div class="cw br"></div>
      <div class="glow-w"></div>
      <div class="cnt center">
        <h1 class="txl" style="font-size:76px;color:#F5F0E8;line-height:1.0;margin-bottom:32px;">ES MOMENTO DE QUE<br>ALGUIEN TE PAGUE<br>POR LO QUE SABES.</h1>
        <p class="sub w">Oryx lo hace posible.</p>
        <div class="pill-cta" style="font-size:22px;">📩 DM ABIERTO · @oryx.company</div>
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

  const outputDir = path.join(__dirname, '..', 'assets', 'posts');

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

    const outputPath = path.join(outputDir, `${slide.id}.png`);
    await page.screenshot({
      path: outputPath,
      type: 'png',
      clip: { x: 0, y: 0, width: 1080, height: 1080 },
    });

    console.log(`  ✓ ${slide.id}.png`);
    await page.close();
  }

  await browser.close();
  console.log(`\nListo — ${slides.length} PNGs generados en /assets/posts/`);
}

generateSlides().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
