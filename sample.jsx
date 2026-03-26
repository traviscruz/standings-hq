<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>StandingsHQ — Competition Management Platform</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root {
  --white:#FFFFFF;--off-white:#F6F7F9;--ink:#0D1117;--ink-soft:#2C3444;--ink-mid:#5A6478;--ink-muted:#8C94A6;
  --border:#E2E6EF;--border-soft:#EDF0F5;
  --navy:#0F1F3D;--navy-mid:#162C55;--navy-light:#1E3A6E;--navy-glow:rgba(15,31,61,0.06);
  --gold:#E8A020;--gold-bright:#F5B830;--gold-deep:#C4821A;--gold-muted:#F5C05A;--gold-bg:rgba(232,160,32,0.08);--gold-bg-mid:rgba(232,160,32,0.14);
  --green:#22C55E;--red:#EF4444;--blue:#3B82F6;
  --shadow-xs:0 1px 2px rgba(13,17,23,0.06);--shadow-sm:0 1px 4px rgba(13,17,23,0.08),0 2px 8px rgba(13,17,23,0.04);
  --shadow-md:0 4px 16px rgba(13,17,23,0.10),0 2px 6px rgba(13,17,23,0.05);
  --shadow-lg:0 12px 40px rgba(13,17,23,0.14),0 4px 12px rgba(13,17,23,0.06);
  --shadow-gold:0 4px 20px rgba(232,160,32,0.22);
  --r-xs:4px;--r-sm:8px;--r-md:12px;--r-lg:16px;--r-xl:24px;
  --font:'Inter',system-ui,sans-serif;--font-d:'DM Sans',system-ui,sans-serif;
  --ease:cubic-bezier(0.4,0,0.2,1);--t:0.2s;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{font-family:var(--font);background:var(--off-white);color:var(--ink);line-height:1.55;-webkit-font-smoothing:antialiased;}
.page{display:none;min-height:100vh;flex-direction:column;}
.page.active{display:flex;}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:9px 20px;border-radius:var(--r-sm);font-size:13.5px;font-weight:600;font-family:var(--font);cursor:pointer;transition:all var(--t) var(--ease);border:none;text-decoration:none;white-space:nowrap;letter-spacing:-0.01em;}
.btn-sm{padding:7px 14px;font-size:12.5px;}
.btn-lg{padding:12px 28px;font-size:15px;border-radius:var(--r-md);}
.btn-xl{padding:15px 36px;font-size:16px;border-radius:var(--r-md);font-weight:700;}
.btn-navy{background:var(--navy);color:#fff;box-shadow:var(--shadow-sm);}
.btn-navy:hover{background:var(--navy-mid);transform:translateY(-1px);box-shadow:var(--shadow-md);}
.btn-gold{background:var(--gold);color:var(--navy);box-shadow:var(--shadow-gold);font-weight:700;}
.btn-gold:hover{background:var(--gold-bright);transform:translateY(-1px);box-shadow:0 6px 24px rgba(232,160,32,0.32);}
.btn-ghost{background:transparent;color:var(--ink-soft);border:1px solid var(--border);}
.btn-ghost:hover{background:#fff;border-color:var(--ink-mid);color:var(--ink);}
.btn-ghost-white{background:transparent;color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.18);}
.btn-ghost-white:hover{background:rgba(255,255,255,0.08);color:#fff;}
.btn-full{width:100%;}

/* ── NAV ── */
.nav{position:fixed;top:0;left:0;right:0;z-index:200;background:rgba(255,255,255,0.93);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);height:60px;display:flex;align-items:center;padding:0 40px;}
.nav-inner{display:flex;align-items:center;justify-content:space-between;width:100%;max-width:1320px;margin:0 auto;}
.nav-logo{display:flex;align-items:center;gap:10px;cursor:pointer;}
.logo-mark{width:32px;height:32px;background:var(--navy);border-radius:7px;display:grid;place-items:center;flex-shrink:0;}
.logo-text{font-family:var(--font-d);font-size:16px;font-weight:800;color:var(--ink);letter-spacing:-0.03em;}
.logo-text span{color:var(--gold);}
.nav-links{display:flex;align-items:center;gap:2px;list-style:none;}
.nav-links a{font-size:13.5px;font-weight:500;color:var(--ink-mid);text-decoration:none;padding:6px 12px;border-radius:var(--r-sm);transition:all var(--t);}
.nav-links a:hover{color:var(--ink);background:var(--border-soft);}
.nav-actions{display:flex;gap:8px;align-items:center;}

/* ── HERO ── */
.hero{padding:120px 40px 60px;max-width:1320px;margin:0 auto;width:100%;}
.hero-layout{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;}
.live-badge{display:inline-flex;align-items:center;gap:7px;background:var(--gold-bg);border:1px solid rgba(232,160,32,0.25);color:var(--gold-deep);font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;padding:5px 12px;border-radius:100px;margin-bottom:18px;}
.live-dot{width:6px;height:6px;border-radius:50%;background:var(--gold);animation:blink 1.4s ease-in-out infinite;flex-shrink:0;}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
.hero-title{font-family:var(--font-d);font-size:clamp(38px,4.5vw,60px);font-weight:800;color:var(--ink);line-height:1.05;letter-spacing:-0.035em;margin-bottom:18px;}
.hero-title .accent{color:var(--gold);}
.hero-title .block{display:block;}
.hero-desc{font-size:16px;color:var(--ink-mid);line-height:1.7;max-width:460px;margin-bottom:36px;}
.hero-cta{display:flex;gap:12px;margin-bottom:40px;flex-wrap:wrap;}
.hero-trust{display:flex;align-items:center;gap:14px;}
.trust-div{width:1px;height:22px;background:var(--border);}
.trust-label{font-size:12.5px;color:var(--ink-muted);font-weight:500;}
.trust-badges{display:flex;gap:6px;}
.trust-badge{font-size:11.5px;font-weight:600;color:var(--ink-mid);background:#fff;border:1px solid var(--border);padding:4px 10px;border-radius:100px;}

/* HERO VISUAL */
.hero-visual{position:relative;height:480px;}
.hv-card{position:absolute;background:#fff;border-radius:var(--r-lg);box-shadow:var(--shadow-lg);border:1px solid var(--border);overflow:hidden;}
.hv-main{width:360px;top:0;right:0;animation:hf1 6s ease-in-out infinite;}
.hv-mini{width:215px;bottom:40px;left:0;animation:hf2 7.5s ease-in-out infinite;}
.hv-score{width:255px;top:175px;left:28px;animation:hf3 5.5s ease-in-out infinite;}
@keyframes hf1{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes hf2{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
@keyframes hf3{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.hv-head{background:var(--navy);padding:13px 16px;display:flex;align-items:center;justify-content:space-between;}
.hv-head-title{font-family:var(--font-d);font-size:12.5px;font-weight:700;color:#fff;}
.hv-live-pill{font-size:10px;font-weight:700;color:var(--gold);background:rgba(232,160,32,0.15);border:1px solid rgba(232,160,32,0.25);padding:2px 8px;border-radius:100px;text-transform:uppercase;letter-spacing:0.07em;display:flex;align-items:center;gap:4px;}
.hv-body{padding:14px 16px;}
.rank-list{display:flex;flex-direction:column;gap:2px;}
.rrow{display:grid;grid-template-columns:28px 1fr auto;align-items:center;gap:8px;padding:8px;border-radius:var(--r-sm);}
.rrow.g1{background:var(--gold-bg);border:1px solid rgba(232,160,32,0.18);}
.rrow:hover{background:var(--off-white);}
.rrank{font-size:12px;font-weight:700;text-align:center;color:var(--ink-muted);}
.rrank.gold{color:var(--gold);font-size:14px;}
.rname{font-size:13px;font-weight:600;color:var(--ink);}
.rorg{font-size:11px;color:var(--ink-muted);margin-top:1px;}
.rscore{font-family:var(--font-d);font-size:17px;font-weight:800;color:var(--navy);}
.rscore.gold{color:var(--gold-deep);}
.mini-top{padding:12px 14px;border-bottom:1px solid var(--border-soft);}
.mini-lbl{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--ink-muted);}
.mini-big{font-family:var(--font-d);font-size:26px;font-weight:800;color:var(--navy);letter-spacing:-0.03em;line-height:1;margin-top:2px;}
.mini-sub{font-size:11px;color:var(--ink-muted);margin-top:2px;}
.mini-body{padding:10px 14px;display:flex;flex-direction:column;gap:6px;}
.mbar-row{display:flex;flex-direction:column;gap:3px;}
.mbar-lbl{display:flex;justify-content:space-between;font-size:11px;font-weight:600;color:var(--ink-soft);}
.mbar{height:4px;background:var(--border-soft);border-radius:100px;overflow:hidden;}
.mbar-fill{height:100%;border-radius:100px;background:linear-gradient(90deg,var(--navy-light),var(--navy));}
.mbar-fill.g{background:linear-gradient(90deg,var(--gold-muted),var(--gold));}
.sc-head{background:linear-gradient(135deg,var(--navy),var(--navy-light));padding:13px 15px;}
.sc-ev{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:rgba(255,255,255,0.45);}
.sc-name{font-family:var(--font-d);font-size:13.5px;font-weight:700;color:#fff;margin-top:2px;}
.sc-body{padding:13px 15px;}
.crit-list{display:flex;flex-direction:column;gap:6px;}
.crit-row{display:flex;justify-content:space-between;}
.crit-lbl{font-size:12px;color:var(--ink-mid);}
.crit-val{font-family:var(--font-d);font-size:12.5px;font-weight:700;color:var(--navy);}
.sc-total{display:flex;justify-content:space-between;align-items:center;margin-top:10px;padding-top:10px;border-top:1px solid var(--border-soft);}
.sc-total-lbl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-soft);}
.sc-total-val{font-family:var(--font-d);font-size:22px;font-weight:800;color:var(--gold-deep);}

/* STATS BAR */
.stats-bar{background:var(--navy);padding:28px 40px;}
.stats-bar-inner{max-width:1320px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);background:rgba(255,255,255,0.07);gap:1px;}
.stat-item{background:var(--navy);padding:22px 30px;}
.stat-num{font-family:var(--font-d);font-size:30px;font-weight:800;color:#fff;letter-spacing:-0.04em;line-height:1;}
.stat-num em{color:var(--gold);font-style:normal;}
.stat-lbl{font-size:12.5px;color:rgba(255,255,255,0.4);margin-top:4px;}

/* FEATURES */
.features{padding:80px 40px;max-width:1320px;margin:0 auto;width:100%;}
.s-eyebrow{font-size:11.5px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--gold-deep);margin-bottom:10px;}
.s-title{font-family:var(--font-d);font-size:clamp(26px,3vw,38px);font-weight:800;color:var(--ink);letter-spacing:-0.03em;line-height:1.15;margin-bottom:48px;}
.feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;background:var(--border);border-radius:var(--r-xl);overflow:hidden;box-shadow:var(--shadow-sm);}
.feat-card{background:#fff;padding:30px;transition:all var(--t) var(--ease);}
.feat-card:hover{background:var(--navy);}
.feat-card:hover .feat-title{color:#fff;}
.feat-card:hover .feat-desc{color:rgba(255,255,255,0.5);}
.feat-card:hover .feat-icon{background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.12);}
.feat-card:hover .feat-icon svg *{stroke:var(--gold-bright)!important;}
.feat-icon{width:44px;height:44px;border-radius:var(--r-sm);background:var(--navy-glow);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;margin-bottom:18px;transition:all var(--t);}
.feat-title{font-family:var(--font-d);font-size:15.5px;font-weight:700;color:var(--ink);margin-bottom:8px;letter-spacing:-0.02em;transition:color var(--t);}
.feat-desc{font-size:13.5px;color:var(--ink-mid);line-height:1.65;transition:color var(--t);}

/* HOW IT WORKS */
.how-section{background:var(--navy);padding:80px 40px;}
.how-inner{max-width:1320px;margin:0 auto;}
.how-s-eyebrow{color:var(--gold-muted);}
.how-s-title{color:#fff;margin-bottom:52px;}
.steps-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;position:relative;}
.steps-grid::before{content:'';position:absolute;top:27px;left:11%;right:11%;height:1px;background:rgba(255,255,255,0.08);}
.step-item{padding-right:16px;}
.step-badge{width:54px;height:54px;border-radius:var(--r-md);background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-family:var(--font-d);font-size:18px;font-weight:800;color:var(--gold);margin-bottom:18px;position:relative;z-index:1;}
.step-item.hl .step-badge{background:var(--gold);color:var(--navy);border-color:var(--gold);box-shadow:var(--shadow-gold);}
.step-title{font-family:var(--font-d);font-size:15px;font-weight:700;color:#fff;margin-bottom:8px;letter-spacing:-0.01em;}
.step-desc{font-size:13px;color:rgba(255,255,255,0.4);line-height:1.65;}

/* ROLES */
.roles-section{padding:80px 40px;max-width:1320px;margin:0 auto;width:100%;}
.roles-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:48px;}
.role-card{border-radius:var(--r-xl);overflow:hidden;border:1px solid var(--border);transition:all var(--t) var(--ease);}
.role-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg);}
.role-top{padding:28px;}
.role-top.navy{background:var(--navy);}
.role-top.white{background:#fff;}
.role-top.gold-tint{background:linear-gradient(135deg,#FFFBF0,#FFF7E0);border-bottom:1px solid rgba(232,160,32,0.15);}
.role-icon{width:40px;height:40px;border-radius:var(--r-sm);display:flex;align-items:center;justify-content:center;margin-bottom:14px;}
.ri-navy{background:rgba(255,255,255,0.1);}
.ri-light{background:rgba(15,31,61,0.07);}
.ri-gold{background:var(--gold-bg);}
.role-name{font-family:var(--font-d);font-size:17px;font-weight:800;letter-spacing:-0.02em;margin-bottom:4px;}
.rn-white{color:#fff;}
.rn-dark{color:var(--ink);}
.rn-gold{color:var(--gold-deep);}
.role-tag{font-size:12.5px;font-weight:500;}
.rt-faint{color:rgba(255,255,255,0.4);}
.rt-muted{color:var(--ink-muted);}
.rt-gold{color:var(--gold-deep);}
.role-body{padding:20px 28px;background:var(--off-white);border-top:1px solid var(--border);}
.role-perks{display:flex;flex-direction:column;gap:9px;}
.perk{display:flex;align-items:center;gap:9px;font-size:13px;color:var(--ink-mid);}
.perk::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--gold);flex-shrink:0;}

/* FOOTER CTA */
.footer-cta{background:linear-gradient(135deg,var(--navy),var(--navy-light));padding:80px 40px;text-align:center;position:relative;overflow:hidden;}
.footer-cta::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 60% 70% at 50% 50%,rgba(232,160,32,0.07),transparent 70%);}
.footer-cta h2{font-family:var(--font-d);font-size:clamp(26px,4vw,46px);font-weight:800;color:#fff;letter-spacing:-0.03em;margin-bottom:12px;position:relative;}
.footer-cta h2 em{color:var(--gold);font-style:normal;}
.footer-cta p{font-size:16px;color:rgba(255,255,255,0.45);margin-bottom:34px;position:relative;}
.footer-cta-btns{display:flex;gap:12px;justify-content:center;position:relative;}
.footer-bar{background:var(--ink);padding:20px 40px;display:flex;align-items:center;justify-content:space-between;}
.footer-bar p{font-size:12.5px;color:rgba(255,255,255,0.3);}
.footer-links{display:flex;gap:22px;list-style:none;}
.footer-links a{font-size:12.5px;color:rgba(255,255,255,0.3);text-decoration:none;transition:color var(--t);}
.footer-links a:hover{color:rgba(255,255,255,0.7);}

/* ── AUTH ── */
.auth-layout{display:grid;grid-template-columns:1fr 1fr;min-height:100vh;}
.auth-left{background:#fff;display:flex;flex-direction:column;padding:36px 48px;}
.auth-back{background:none;border:none;font-family:var(--font);font-size:13px;font-weight:500;color:var(--ink-muted);cursor:pointer;display:flex;align-items:center;gap:5px;padding:0;transition:color var(--t);margin-bottom:auto;}
.auth-back:hover{color:var(--ink);}
.auth-logo-wrap{margin-bottom:52px;display:flex;align-items:center;gap:10px;cursor:pointer;}
.auth-body{flex:1;display:flex;flex-direction:column;justify-content:center;max-width:420px;margin:0 auto;width:100%;}
.auth-tag{font-size:11.5px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:var(--gold-deep);background:var(--gold-bg);padding:4px 10px;border-radius:var(--r-xs);display:inline-block;margin-bottom:14px;}
.auth-h1{font-family:var(--font-d);font-size:30px;font-weight:800;color:var(--ink);letter-spacing:-0.03em;line-height:1.15;margin-bottom:6px;}
.auth-sub{font-size:14px;color:var(--ink-muted);margin-bottom:30px;line-height:1.6;}
.fg{margin-bottom:15px;}
.fg label{display:block;font-size:12.5px;font-weight:600;color:var(--ink-soft);margin-bottom:6px;}
.fg-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:15px;}
.fg-row .fg{margin-bottom:0;}
input[type=text],input[type=email],input[type=password]{width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:var(--r-sm);font-size:13.5px;font-family:var(--font);color:var(--ink);background:var(--off-white);outline:none;transition:all var(--t) var(--ease);}
input:focus{border-color:var(--navy);background:#fff;box-shadow:0 0 0 3px rgba(15,31,61,0.07);}
input::placeholder{color:var(--ink-muted);}
.iw{position:relative;}
.iw input{padding-right:40px;}
.itoggle{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--ink-muted);display:flex;transition:color var(--t);}
.itoggle:hover{color:var(--navy);}
.inp-hint{font-size:11.5px;color:var(--ink-muted);margin-top:4px;}
.forgot-row{text-align:right;margin:-8px 0 4px;}
.forgot-lnk{font-size:12.5px;color:var(--ink-muted);cursor:pointer;transition:color var(--t);}
.forgot-lnk:hover{color:var(--gold-deep);}
.step-bar{display:flex;align-items:center;margin-bottom:28px;}
.sb-step{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;color:var(--ink-muted);}
.sb-num{width:28px;height:28px;border-radius:50%;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;transition:all var(--t);background:#fff;flex-shrink:0;}
.sb-step.active .sb-num{background:var(--navy);border-color:var(--navy);color:#fff;}
.sb-step.done .sb-num{background:var(--gold);border-color:var(--gold);color:var(--navy);}
.sb-step.active .sb-label,.sb-step.done .sb-label{color:var(--ink);}
.sb-line{flex:1;height:2px;background:var(--border);margin:0 6px;transition:background var(--t);}
.sb-line.done{background:var(--gold);}
.step-panel{display:none;}
.step-panel.active{display:block;animation:sIn .28s var(--ease) both;}
@keyframes sIn{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)}}
.terms-wrap{display:flex;align-items:flex-start;gap:9px;margin-bottom:18px;}
.terms-wrap input[type=checkbox]{width:16px;height:16px;accent-color:var(--navy);margin-top:2px;flex-shrink:0;cursor:pointer;}
.terms-wrap label{font-size:12.5px;color:var(--ink-muted);cursor:pointer;line-height:1.5;}
.tlink{color:var(--gold-deep);font-weight:600;}
.pw-meter{display:flex;gap:4px;margin-top:7px;align-items:center;}
.pwm-bar{flex:1;height:3px;border-radius:100px;background:var(--border);transition:background .3s;}
.pwm-lbl{font-size:11px;color:var(--ink-muted);width:54px;text-align:right;font-weight:600;transition:color .3s;}
.auth-switch{text-align:center;margin-top:18px;font-size:13px;color:var(--ink-muted);}
.auth-switch .lnk{color:var(--gold-deep);font-weight:700;cursor:pointer;}
.success-wrap{text-align:center;padding:8px 0;}
.s-icon{width:64px;height:64px;border-radius:50%;background:rgba(34,197,94,0.1);border:1.5px solid rgba(34,197,94,0.25);display:flex;align-items:center;justify-content:center;margin:0 auto 18px;}
.s-title{font-family:var(--font-d);font-size:24px;font-weight:800;color:var(--ink);letter-spacing:-0.02em;margin-bottom:8px;}
.s-sub{font-size:14px;color:var(--ink-muted);line-height:1.65;margin-bottom:26px;}

/* AUTH RIGHT */
.auth-right{background:var(--navy);position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:48px;}
.ar-bg{position:absolute;inset:0;background:radial-gradient(ellipse 90% 70% at 20% 20%,rgba(232,160,32,0.1),transparent 55%),radial-gradient(ellipse 60% 60% at 85% 80%,rgba(30,58,110,0.7),transparent 60%),var(--navy);}
.ar-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px);background-size:40px 40px;}
.ar-content{position:relative;z-index:2;max-width:400px;width:100%;}
.ar-eyebrow{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--gold);margin-bottom:14px;}
.ar-title{font-family:var(--font-d);font-size:clamp(21px,2.2vw,28px);font-weight:800;color:#fff;letter-spacing:-0.03em;line-height:1.2;margin-bottom:10px;}
.ar-title em{color:var(--gold);font-style:normal;}
.ar-sub{font-size:14px;color:rgba(255,255,255,0.4);line-height:1.65;margin-bottom:30px;}
.ar-sb{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:var(--r-lg);overflow:hidden;margin-bottom:22px;}
.ar-sb-head{background:rgba(255,255,255,0.05);border-bottom:1px solid rgba(255,255,255,0.07);padding:11px 15px;display:flex;align-items:center;justify-content:space-between;}
.ar-sb-title{font-size:11.5px;font-weight:700;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.07em;}
.ar-sb-live{font-size:10px;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:0.06em;display:flex;align-items:center;gap:5px;}
.ar-sb-live::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--gold);display:block;animation:blink 1.4s ease-in-out infinite;}
.ar-rows{padding:8px;}
.ar-row{display:grid;grid-template-columns:28px 1fr auto;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;}
.ar-row:first-child{background:rgba(232,160,32,0.09);border:1px solid rgba(232,160,32,0.14);}
.ar-rk{font-size:12px;font-weight:800;text-align:center;}
.ar-rk.g{color:var(--gold);}
.ar-rk.d{color:rgba(255,255,255,0.3);}
.ar-rname{font-size:12.5px;font-weight:600;color:rgba(255,255,255,0.75);}
.ar-rscore{font-family:var(--font-d);font-size:14px;font-weight:800;color:#fff;}
.ar-rscore.g{color:var(--gold);}
.ar-pills{display:flex;gap:8px;flex-wrap:wrap;}
.ar-pill{display:flex;align-items:center;gap:7px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:var(--r-sm);padding:8px 13px;}
.ap-icon{width:22px;height:22px;border-radius:5px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.api-gold{background:rgba(232,160,32,0.2);}
.api-white{background:rgba(255,255,255,0.08);}
.ar-pill span{font-size:12px;color:rgba(255,255,255,0.5);font-weight:500;}

/* RESPONSIVE */
@media(max-width:1024px){
  .hero-layout{grid-template-columns:1fr;}.hero-visual{display:none;}
  .feat-grid{grid-template-columns:1fr 1fr;}
  .steps-grid{grid-template-columns:1fr 1fr;gap:24px;}.steps-grid::before{display:none;}
  .auth-right{display:none;}.auth-layout{grid-template-columns:1fr;}
  .auth-left{padding:36px 32px;}
}
@media(max-width:768px){
  .nav{padding:0 20px;}.hero{padding:100px 20px 48px;}
  .feat-grid{grid-template-columns:1fr;}.roles-grid{grid-template-columns:1fr;}
  .stats-bar-inner{grid-template-columns:1fr 1fr;}.steps-grid{grid-template-columns:1fr;}
  .features,.roles-section{padding:56px 20px;}.how-section{padding:56px 20px;}
  .footer-cta{padding:60px 20px;}.footer-bar{flex-direction:column;gap:10px;text-align:center;}
}
</style>
</head>
<body>

<!-- ══════════════════════════════════
  LANDING
══════════════════════════════════ -->
<div id="page-landing" class="page active">

  <nav class="nav">
    <div class="nav-inner">
      <div class="nav-logo" onclick="go('page-landing')">
        <div class="logo-mark">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12.5" cy="5" r="2" fill="#E8A020"/>
          </svg>
        </div>
        <span class="logo-text">Standings<span>HQ</span></span>
      </div>
      <ul class="nav-links">
        <li><a href="#">Features</a></li>
        <li><a href="#">For Schools</a></li>
        <li><a href="#">How it works</a></li>
        <li><a href="#">Pricing</a></li>
      </ul>
      <div class="nav-actions">
        <button class="btn btn-ghost btn-sm" onclick="go('page-login')">Sign in</button>
        <button class="btn btn-gold btn-sm" onclick="go('page-register')">Get started free</button>
      </div>
    </div>
  </nav>

  <section class="hero">
    <div class="hero-layout">
      <div>
        <div class="live-badge"><span class="live-dot"></span>Live scoring — available now</div>
        <h1 class="hero-title">
          <span class="block">Run competitions.</span>
          <span class="block">Publish <span class="accent">standings.</span></span>
          <span class="block">Ship results.</span>
        </h1>
        <p class="hero-desc">StandingsHQ is the end-to-end platform for school and university competitions — rubric setup, live scoring, leaderboards, and official certificates in one place.</p>
        <div class="hero-cta">
          <button class="btn btn-gold btn-xl" onclick="go('page-register')">Start your event free →</button>
          <button class="btn btn-navy btn-xl" onclick="go('page-login')">Sign in</button>
        </div>
        <div class="hero-trust">
          <span class="trust-label">Trusted format</span>
          <div class="trust-div"></div>
          <div class="trust-badges">
            <span class="trust-badge">DepEd aligned</span>
            <span class="trust-badge">CHED events</span>
            <span class="trust-badge">School orgs</span>
          </div>
        </div>
      </div>
      <div class="hero-visual" aria-hidden="true">
        <div class="hv-card hv-main">
          <div class="hv-head">
            <span class="hv-head-title">Interschool Debate Championships</span>
            <span class="hv-live-pill"><span class="live-dot" style="width:5px;height:5px;border-radius:50%;background:var(--gold);flex-shrink:0;"></span>Live</span>
          </div>
          <div class="hv-body">
            <div class="rank-list">
              <div class="rrow g1"><span class="rrank gold">🥇</span><div><div class="rname">Team Alpha — UST</div><div class="rorg">Round 3 complete</div></div><span class="rscore gold">94.6</span></div>
              <div class="rrow"><span class="rrank">#2</span><div><div class="rname">Team Bravo — DLSU</div><div class="rorg">Round 3 complete</div></div><span class="rscore">89.2</span></div>
              <div class="rrow"><span class="rrank">#3</span><div><div class="rname">Team Delta — UP</div><div class="rorg">Scoring…</div></div><span class="rscore">86.5</span></div>
              <div class="rrow"><span class="rrank">#4</span><div><div class="rname">Team Echo — Ateneo</div><div class="rorg">Round 2 complete</div></div><span class="rscore">83.1</span></div>
            </div>
          </div>
        </div>
        <div class="hv-card hv-score">
          <div class="sc-head"><div class="sc-ev">Judge: Prof. Reyes</div><div class="sc-name">Team Alpha · Round 3</div></div>
          <div class="sc-body">
            <div class="crit-list">
              <div class="crit-row"><span class="crit-lbl">Content & Logic</span><span class="crit-val">38/40</span></div>
              <div class="crit-row"><span class="crit-lbl">Delivery</span><span class="crit-val">28/30</span></div>
              <div class="crit-row"><span class="crit-lbl">Rebuttal</span><span class="crit-val">18/20</span></div>
              <div class="crit-row"><span class="crit-lbl">Teamwork</span><span class="crit-val">9/10</span></div>
            </div>
            <div class="sc-total"><span class="sc-total-lbl">Total</span><span class="sc-total-val">94.6</span></div>
          </div>
        </div>
        <div class="hv-card hv-mini">
          <div class="mini-top"><div class="mini-lbl">Event progress</div><div class="mini-big">72<span style="font-size:14px;font-weight:500;color:var(--ink-muted)">/100</span></div><div class="mini-sub">scores submitted</div></div>
          <div class="mini-body">
            <div class="mbar-row"><div class="mbar-lbl"><span>Round 1</span><span>100%</span></div><div class="mbar"><div class="mbar-fill g" style="width:100%"></div></div></div>
            <div class="mbar-row"><div class="mbar-lbl"><span>Round 2</span><span>100%</span></div><div class="mbar"><div class="mbar-fill" style="width:100%"></div></div></div>
            <div class="mbar-row"><div class="mbar-lbl"><span>Round 3</span><span>44%</span></div><div class="mbar"><div class="mbar-fill" style="width:44%"></div></div></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="stats-bar">
    <div class="stats-bar-inner">
      <div class="stat-item"><div class="stat-num">3<em>+</em></div><div class="stat-lbl">User roles supported</div></div>
      <div class="stat-item"><div class="stat-num"><em>∞</em></div><div class="stat-lbl">Events per account</div></div>
      <div class="stat-item"><div class="stat-num"><em>Real-</em>time</div><div class="stat-lbl">Live score updates</div></div>
      <div class="stat-item"><div class="stat-num">1<em>-click</em></div><div class="stat-lbl">Certificate generation</div></div>
    </div>
  </div>

  <section class="features">
    <div class="s-eyebrow">Platform features</div>
    <div class="s-title">Everything a competition<br>organizer actually needs.</div>
    <div class="feat-grid">
      <div class="feat-card"><div class="feat-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="5" rx="1.5" stroke="var(--navy)" stroke-width="1.5"/><rect x="11" y="3" width="6" height="5" rx="1.5" stroke="var(--navy)" stroke-width="1.5"/><rect x="3" y="12" width="6" height="5" rx="1.5" stroke="var(--navy)" stroke-width="1.5"/><rect x="11" y="12" width="6" height="5" rx="1.5" stroke="var(--navy)" stroke-width="1.5"/></svg></div><div class="feat-title">Rubric Builder</div><div class="feat-desc">Design weighted scoring rubrics from scratch — multiple criteria, custom point values, instant calculations.</div></div>
      <div class="feat-card"><div class="feat-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 15L7 7L11 11L14 5" stroke="var(--navy)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="14" cy="5" r="2" stroke="var(--navy)" stroke-width="1.5"/></svg></div><div class="feat-title">Live Leaderboards</div><div class="feat-desc">Rankings refresh instantly as scores are submitted. Display on-screen or share the public link with audiences.</div></div>
      <div class="feat-card"><div class="feat-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 3H14C15.1 3 16 3.9 16 5V15C16 16.1 15.1 17 14 17H6C4.9 17 4 16.1 4 15V5C4 3.9 4.9 3 6 3Z" stroke="var(--navy)" stroke-width="1.5"/><path d="M8 8H12M8 11H12M8 14H10" stroke="var(--navy)" stroke-width="1.5" stroke-linecap="round"/></svg></div><div class="feat-title">Certificate Generation</div><div class="feat-desc">Auto-fill certificates for every participant. Custom templates, bulk download, official-grade output in seconds.</div></div>
      <div class="feat-card"><div class="feat-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3" stroke="var(--navy)" stroke-width="1.5"/><path d="M4 17C4 14.2 6.7 12 10 12C13.3 12 16 14.2 16 17" stroke="var(--navy)" stroke-width="1.5" stroke-linecap="round"/></svg></div><div class="feat-title">Role-based Dashboards</div><div class="feat-desc">Organizers, judges, and participants each get a focused workspace — no shared clutter, no confusion.</div></div>
      <div class="feat-card"><div class="feat-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="12" rx="2" stroke="var(--navy)" stroke-width="1.5"/><path d="M3 8H17M8 8V16" stroke="var(--navy)" stroke-width="1.5" stroke-linecap="round"/></svg></div><div class="feat-title">Invite Management</div><div class="feat-desc">Email invitations for judges and participants. Track acceptances, send reminders, manage responses in one view.</div></div>
      <div class="feat-card"><div class="feat-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="var(--navy)" stroke-width="1.5"/><path d="M10 6V10L13 12" stroke="var(--navy)" stroke-width="1.5" stroke-linecap="round"/></svg></div><div class="feat-title">Event Archive</div><div class="feat-desc">Every published event is permanently archived — full results, winners, and highlights searchable by the public.</div></div>
    </div>
  </section>

  <section class="how-section">
    <div class="how-inner">
      <div class="s-eyebrow how-s-eyebrow">How it works</div>
      <div class="s-title how-s-title">From setup to published results<br>in four steps.</div>
      <div class="steps-grid">
        <div class="step-item"><div class="step-badge">01</div><div class="step-title">Create your event</div><div class="step-desc">Name it, set the date, build scoring rubrics, and configure competition rounds.</div></div>
        <div class="step-item"><div class="step-badge">02</div><div class="step-title">Invite everyone</div><div class="step-desc">Send email invites. Each role gets their own workspace — no admin overhead required.</div></div>
        <div class="step-item hl"><div class="step-badge">03</div><div class="step-title">Score live</div><div class="step-desc">Judges score from any device. Standings update instantly. Audiences follow in real time.</div></div>
        <div class="step-item"><div class="step-badge">04</div><div class="step-title">Publish & archive</div><div class="step-desc">Finalize results, generate certificates for all, publish to the public archive.</div></div>
      </div>
    </div>
  </section>

  <section class="roles-section">
    <div class="s-eyebrow">Who it's built for</div>
    <div class="s-title">Three roles. One platform.<br>Zero confusion.</div>
    <div class="roles-grid">
      <div class="role-card">
        <div class="role-top navy">
          <div class="role-icon ri-navy"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="5" rx="1.2" fill="rgba(255,255,255,0.5)"/><rect x="11" y="3" width="6" height="5" rx="1.2" fill="rgba(232,160,32,0.8)"/><rect x="3" y="12" width="14" height="5" rx="1.2" fill="rgba(255,255,255,0.15)"/></svg></div>
          <div class="role-name rn-white">Organizer</div>
          <div class="role-tag rt-faint">Full platform control</div>
        </div>
        <div class="role-body"><div class="role-perks"><div class="perk">Create and manage unlimited events</div><div class="perk">Build custom scoring rubrics</div><div class="perk">Invite and track judges & participants</div><div class="perk">Publish results and generate certificates</div></div></div>
      </div>
      <div class="role-card">
        <div class="role-top white">
          <div class="role-icon ri-light"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 15L7 7L11 11L14 5" stroke="var(--navy)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="14" cy="5" r="2.5" fill="var(--navy)"/></svg></div>
          <div class="role-name rn-dark">Judge</div>
          <div class="role-tag rt-muted">Focused scoring workspace</div>
        </div>
        <div class="role-body"><div class="role-perks"><div class="perk">Accept event invitations via email</div><div class="perk">Review assigned rubrics before the event</div><div class="perk">Score participants via clean live interface</div><div class="perk">View all assigned events and pending tasks</div></div></div>
      </div>
      <div class="role-card">
        <div class="role-top gold-tint">
          <div class="role-icon ri-gold"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3L12.5 8.5H18L13.5 11.5L15.5 17.5L10 14L4.5 17.5L6.5 11.5L2 8.5H7.5L10 3Z" fill="var(--gold)" opacity="0.85"/></svg></div>
          <div class="role-name rn-gold">Participant</div>
          <div class="role-tag rt-gold">Your competition journey</div>
        </div>
        <div class="role-body"><div class="role-perks"><div class="perk">Accept event invitations</div><div class="perk">Follow live leaderboards during competition</div><div class="perk">Track your schedule and assignments</div><div class="perk">Download official certificates</div></div></div>
      </div>
    </div>
  </section>

  <div class="footer-cta">
    <h2>Ready to run your next <em>competition?</em></h2>
    <p>Free for schools and student organizations. Set up in minutes, not hours.</p>
    <div class="footer-cta-btns">
      <button class="btn btn-gold btn-xl" onclick="go('page-register')">Create a free account →</button>
      <button class="btn btn-ghost-white btn-xl" onclick="go('page-login')">Sign in</button>
    </div>
  </div>
  <div class="footer-bar">
    <p>© 2025 StandingsHQ. Built for Philippine schools and universities.</p>
    <ul class="footer-links"><li><a href="#">Privacy</a></li><li><a href="#">Terms</a></li><li><a href="#">Support</a></li><li><a href="#">Docs</a></li></ul>
  </div>
</div>


<!-- ══════════════════════════════════
  LOGIN
══════════════════════════════════ -->
<div id="page-login" class="page" style="display:none">
  <div class="auth-layout">
    <div class="auth-left">
      <button class="auth-back" onclick="go('page-landing')">← Back to home</button>
      <div class="auth-logo-wrap" onclick="go('page-landing')">
        <div class="logo-mark"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12.5" cy="5" r="2" fill="#E8A020"/></svg></div>
        <span class="logo-text">Standings<span>HQ</span></span>
      </div>
      <div class="auth-body">
        <span class="auth-tag">Welcome back</span>
        <h1 class="auth-h1">Sign in to your workspace.</h1>
        <p class="auth-sub">Your events, scores, and certificates are waiting. Enter your credentials to continue.</p>
        <div class="fg"><label>Email address</label><input type="email" id="li-em" placeholder="you@school.edu.ph"></div>
        <div class="fg"><label>Password</label><div class="iw"><input type="password" id="li-pw" placeholder="Your password"><button class="itoggle" onclick="tpw('li-pw',this)" type="button"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8C1 8 3.5 3 8 3C12.5 3 15 8 15 8C15 8 12.5 13 8 13C3.5 13 1 8 1 8Z" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.4"/></svg></button></div></div>
        <div class="forgot-row"><span class="forgot-lnk" onclick="go('page-forgot')">Forgot password?</span></div>
        <button class="btn btn-navy btn-full btn-lg" style="margin-top:14px" onclick="go('page-landing')">Sign in</button>
        <div class="auth-switch">No account yet? <span class="lnk" onclick="go('page-register')">Register here</span></div>
      </div>
    </div>
    <div class="auth-right">
      <div class="ar-bg"></div><div class="ar-grid"></div>
      <div class="ar-content">
        <div class="ar-eyebrow">Live competition platform</div>
        <h2 class="ar-title">Your <em>competition hub</em> is live and ready.</h2>
        <p class="ar-sub">Manage events, judge scores, and publish results — one professional platform built for the pace of competition day.</p>
        <div class="ar-sb">
          <div class="ar-sb-head"><span class="ar-sb-title">Live Standings</span><span class="ar-sb-live">Updating</span></div>
          <div class="ar-rows">
            <div class="ar-row"><span class="ar-rk g">🥇</span><div><div class="ar-rname">Team Alpha</div></div><span class="ar-rscore g">94.6</span></div>
            <div class="ar-row"><span class="ar-rk d">#2</span><div><div class="ar-rname">Team Bravo</div></div><span class="ar-rscore">89.2</span></div>
            <div class="ar-row"><span class="ar-rk d">#3</span><div><div class="ar-rname">Team Delta</div></div><span class="ar-rscore">86.5</span></div>
          </div>
        </div>
        <div class="ar-pills">
          <div class="ar-pill"><div class="ap-icon api-gold"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 9L5 4L8 6.5L10 2" stroke="#E8A020" stroke-width="1.3" stroke-linecap="round"/></svg></div><span>Real-time scoring</span></div>
          <div class="ar-pill"><div class="ap-icon api-white"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="rgba(255,255,255,0.6)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span>1-click certificates</span></div>
          <div class="ar-pill"><div class="ap-icon api-gold"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4" r="1.8" stroke="#E8A020" stroke-width="1.2"/><path d="M1.5 11C1.5 8.8 3.5 7 6 7C8.5 7 10.5 8.8 10.5 11" stroke="#E8A020" stroke-width="1.2" stroke-linecap="round"/></svg></div><span>3 role dashboards</span></div>
        </div>
      </div>
    </div>
  </div>
</div>


<!-- ══════════════════════════════════
  REGISTER — 3 STEPS
══════════════════════════════════ -->
<div id="page-register" class="page" style="display:none">
  <div class="auth-layout">
    <div class="auth-left">
      <button class="auth-back" onclick="go('page-login')">← Back to sign in</button>
      <div class="auth-logo-wrap" onclick="go('page-landing')">
        <div class="logo-mark"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12.5" cy="5" r="2" fill="#E8A020"/></svg></div>
        <span class="logo-text">Standings<span>HQ</span></span>
      </div>
      <div class="auth-body">
        <span class="auth-tag" id="r-tag">Step 1 of 3</span>
        <h1 class="auth-h1" id="r-h1">Your name.</h1>
        <p class="auth-sub" id="r-sub">Let's start simple — what should we call you?</p>

        <div class="step-bar" id="r-bar">
          <div class="sb-step active" id="rs1"><div class="sb-num" id="rn1">1</div><span class="sb-label">Name</span></div>
          <div class="sb-line" id="rl1"></div>
          <div class="sb-step" id="rs2"><div class="sb-num" id="rn2">2</div><span class="sb-label">Account</span></div>
          <div class="sb-line" id="rl2"></div>
          <div class="sb-step" id="rs3"><div class="sb-num" id="rn3">3</div><span class="sb-label">Password</span></div>
        </div>

        <!-- Step 1 -->
        <div class="step-panel active" id="rp1">
          <div class="fg-row">
            <div class="fg"><label>First name</label><input type="text" id="r-fn" placeholder="Maria"></div>
            <div class="fg"><label>Last name</label><input type="text" id="r-ln" placeholder="Santos"></div>
          </div>
          <button class="btn btn-navy btn-full btn-lg" onclick="rGo(2)">Continue →</button>
          <div class="auth-switch">Already registered? <span class="lnk" onclick="go('page-login')">Sign in</span></div>
        </div>

        <!-- Step 2 -->
        <div class="step-panel" id="rp2">
          <div class="fg"><label>Username</label><input type="text" id="r-un" placeholder="mariasantos"><div class="inp-hint">Visible on public leaderboards and event pages.</div></div>
          <div class="fg"><label>Email address</label><input type="email" id="r-em" placeholder="maria@school.edu.ph"></div>
          <div style="display:flex;gap:10px;margin-top:4px">
            <button class="btn btn-ghost btn-lg" style="flex:0.5" onclick="rGo(1)">← Back</button>
            <button class="btn btn-navy btn-full btn-lg" style="flex:1" onclick="rGo(3)">Continue →</button>
          </div>
          <div class="auth-switch">Already registered? <span class="lnk" onclick="go('page-login')">Sign in</span></div>
        </div>

        <!-- Step 3 -->
        <div class="step-panel" id="rp3">
          <div class="fg"><label>Create password</label><div class="iw"><input type="password" id="r-pw" placeholder="Min. 8 characters" oninput="calcPw(this.value)"><button class="itoggle" onclick="tpw('r-pw',this)" type="button"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8C1 8 3.5 3 8 3C12.5 3 15 8 15 8C15 8 12.5 13 8 13C3.5 13 1 8 1 8Z" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.4"/></svg></button></div><div class="pw-meter"><div class="pwm-bar" id="pb1"></div><div class="pwm-bar" id="pb2"></div><div class="pwm-bar" id="pb3"></div><div class="pwm-bar" id="pb4"></div><span class="pwm-lbl" id="pw-lbl"></span></div></div>
          <div class="fg"><label>Confirm password</label><div class="iw"><input type="password" id="r-cpw" placeholder="Repeat your password"><button class="itoggle" onclick="tpw('r-cpw',this)" type="button"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8C1 8 3.5 3 8 3C12.5 3 15 8 15 8C15 8 12.5 13 8 13C3.5 13 1 8 1 8Z" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.4"/></svg></button></div></div>
          <div class="terms-wrap"><input type="checkbox" id="r-terms"><label for="r-terms">I agree to the <a href="#" class="tlink">Terms of Service</a> and <a href="#" class="tlink">Privacy Policy</a>.</label></div>
          <div style="display:flex;gap:10px">
            <button class="btn btn-ghost btn-lg" style="flex:0.5" onclick="rGo(2)">← Back</button>
            <button class="btn btn-gold btn-full btn-lg" style="flex:1" onclick="rDone()">Create account →</button>
          </div>
        </div>

        <!-- Step 4: Success -->
        <div class="step-panel" id="rp4">
          <div class="success-wrap">
            <div class="s-icon"><svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M5 14L11 20L23 8" stroke="#22C55E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            <div class="s-title">Account created!</div>
            <p class="s-sub">Welcome to StandingsHQ, <strong id="r-welcome">there</strong>. Your organizer dashboard is ready — start creating your first competition event.</p>
            <button class="btn btn-gold btn-full btn-lg" onclick="go('page-landing')">Go to dashboard →</button>
          </div>
        </div>
      </div>
    </div>

    <div class="auth-right">
      <div class="ar-bg"></div><div class="ar-grid"></div>
      <div class="ar-content">
        <div class="ar-eyebrow">Join competition organizers</div>
        <h2 class="ar-title">Set up your first event in <em>under 5 minutes.</em></h2>
        <p class="ar-sub">Build rubrics, invite judges, go live. No training needed — StandingsHQ is built for the speed of competition day.</p>
        <div class="ar-sb" style="margin-bottom:20px">
          <div class="ar-sb-head"><span class="ar-sb-title">Event Setup Progress</span></div>
          <div class="ar-rows">
            <div class="ar-row" style="background:rgba(34,197,94,0.07);border:1px solid rgba(34,197,94,0.14)"><span style="font-size:13px;">✅</span><div><div class="ar-rname">Event created</div></div><span style="font-size:11px;color:rgba(255,255,255,0.35)">Done</span></div>
            <div class="ar-row" style="background:var(--gold-bg);border:1px solid rgba(232,160,32,0.15)"><span style="font-size:13px;">⚡</span><div><div class="ar-rname">Rubric built</div></div><span style="font-size:11px;color:var(--gold)">Active</span></div>
            <div class="ar-row"><span style="font-size:13px;opacity:0.3">📋</span><div><div class="ar-rname" style="opacity:0.4">Invite judges</div></div><span style="font-size:11px;color:rgba(255,255,255,0.2)">Next</span></div>
          </div>
        </div>
        <div class="ar-pills">
          <div class="ar-pill"><div class="ap-icon api-gold"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1L7.5 4.5H11L8.5 6.5L9.5 10.5L6 8.3L2.5 10.5L3.5 6.5L1 4.5H4.5L6 1Z" fill="#E8A020"/></svg></div><span>Free for schools</span></div>
          <div class="ar-pill"><div class="ap-icon api-white"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="rgba(255,255,255,0.6)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span>No training needed</span></div>
        </div>
      </div>
    </div>
  </div>
</div>


<!-- ══════════════════════════════════
  FORGOT PASSWORD
══════════════════════════════════ -->
<div id="page-forgot" class="page" style="display:none">
  <div class="auth-layout">
    <div class="auth-left">
      <button class="auth-back" onclick="go('page-login')">← Back to sign in</button>
      <div class="auth-logo-wrap" onclick="go('page-landing')">
        <div class="logo-mark"><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12.5" cy="5" r="2" fill="#E8A020"/></svg></div>
        <span class="logo-text">Standings<span>HQ</span></span>
      </div>
      <div class="auth-body">
        <div class="step-panel active" id="fp1">
          <span class="auth-tag">Account recovery</span>
          <h1 class="auth-h1">Reset your password.</h1>
          <p class="auth-sub">Enter your registered email and we'll send a secure, single-use reset link. It expires in 15 minutes.</p>
          <div class="fg" style="margin-bottom:22px"><label>Email address</label><input type="email" id="f-em" placeholder="you@school.edu.ph"></div>
          <button class="btn btn-navy btn-full btn-lg" onclick="fSend()">Send reset link</button>
          <div class="auth-switch">Remembered it? <span class="lnk" onclick="go('page-login')">Back to sign in</span></div>
        </div>
        <div class="step-panel" id="fp2">
          <div class="success-wrap">
            <div class="s-icon"><svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="4" y="9" width="20" height="14" rx="2.5" stroke="#22C55E" stroke-width="2"/><path d="M4 13L14 19L24 13" stroke="#22C55E" stroke-width="2" stroke-linecap="round"/></svg></div>
            <div class="s-title">Check your inbox.</div>
            <p class="s-sub">A password reset link has been sent to <strong id="f-em-show">your email</strong>. It's single-use and expires in 15 minutes.</p>
            <button class="btn btn-ghost btn-full btn-lg" onclick="go('page-login')" style="border:1.5px solid var(--border)">← Return to sign in</button>
          </div>
        </div>
      </div>
    </div>
    <div class="auth-right">
      <div class="ar-bg"></div><div class="ar-grid"></div>
      <div class="ar-content">
        <div class="ar-eyebrow">Account security</div>
        <h2 class="ar-title">Your account and <em>event data</em> stay protected.</h2>
        <p class="ar-sub">Reset links are single-use and expire quickly. Your competitions, rubrics, and scores are always safe on StandingsHQ.</p>
        <div class="ar-pills" style="flex-direction:column;gap:10px">
          <div class="ar-pill"><div class="ap-icon api-gold"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="2.5" y="6" width="7" height="5" rx="1" stroke="#E8A020" stroke-width="1.2"/><path d="M4 6V4.5C4 3.4 4.9 2.5 6 2.5C7.1 2.5 8 3.4 8 4.5V6" stroke="#E8A020" stroke-width="1.2" stroke-linecap="round"/></svg></div><span>Link expires in 15 minutes</span></div>
          <div class="ar-pill"><div class="ap-icon api-white"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="rgba(255,255,255,0.6)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span>Single-use secure token</span></div>
          <div class="ar-pill"><div class="ap-icon api-gold"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4" stroke="#E8A020" stroke-width="1.2"/><path d="M6 4V6L7.5 7.5" stroke="#E8A020" stroke-width="1.2" stroke-linecap="round"/></svg></div><span>Your event data stays safe</span></div>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
function go(id){
  document.querySelectorAll('.page').forEach(p=>{p.style.display='none';p.classList.remove('active');});
  const t=document.getElementById(id);t.style.display='flex';t.classList.add('active');window.scrollTo(0,0);
  if(id==='page-forgot'){document.getElementById('fp1').classList.add('active');document.getElementById('fp2').classList.remove('active');}
  if(id==='page-register')rGo(1);
}
function tpw(id,btn){const i=document.getElementById(id);i.type=i.type==='password'?'text':'password';btn.style.color=i.type==='text'?'var(--gold-deep)':'';}

// Register steps
const rTitles=['Your name.','Your account.','Secure it.',''];
const rSubs=["Let's start simple — what should we call you?",'Choose your username and email address.','Create a strong password to protect your account.',''];
const rTags=['Step 1 of 3','Step 2 of 3','Step 3 of 3',''];
function rGo(s){
  for(let i=1;i<=4;i++){const p=document.getElementById(`rp${i}`);if(p)p.classList.toggle('active',i===s);}
  for(let i=1;i<=3;i++){
    const sb=document.getElementById(`rs${i}`),sbn=document.getElementById(`rn${i}`);
    if(!sb)continue;
    sb.classList.remove('active','done');
    if(i<s){sb.classList.add('done');sbn.innerHTML='<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="var(--navy)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';}
    else if(i===s){sb.classList.add('active');sbn.textContent=i;}
    else sbn.textContent=i;
  }
  for(let i=1;i<=2;i++){const sl=document.getElementById(`rl${i}`);if(sl)sl.classList.toggle('done',i<s);}
  const bar=document.getElementById('r-bar');if(bar)bar.style.display=s===4?'none':'flex';
  if(s<=3){document.getElementById('r-tag').textContent=rTags[s-1];document.getElementById('r-h1').textContent=rTitles[s-1];document.getElementById('r-sub').textContent=rSubs[s-1];}
}
function rDone(){
  const fn=document.getElementById('r-fn').value||'there';
  document.getElementById('r-welcome').textContent=fn;
  document.getElementById('r-tag').textContent='';
  document.getElementById('r-h1').textContent="You're all set.";
  document.getElementById('r-sub').textContent='Your organizer workspace is ready.';
  rGo(4);
}
function calcPw(v){
  let s=0;if(v.length>=8)s++;if(/[A-Z]/.test(v))s++;if(/[0-9]/.test(v))s++;if(/[^A-Za-z0-9]/.test(v))s++;
  const c=['','#EF4444','#F59E0B','#3B82F6','#22C55E'],l=['','Weak','Fair','Good','Strong'];
  for(let i=1;i<=4;i++)document.getElementById(`pb${i}`).style.background=i<=s?c[s]:'var(--border)';
  const lbl=document.getElementById('pw-lbl');lbl.textContent=v?l[s]:'';lbl.style.color=c[s];
}
function fSend(){
  const e=document.getElementById('f-em').value||'your email';
  document.getElementById('f-em-show').textContent=e;
  document.getElementById('fp1').classList.remove('active');
  document.getElementById('fp2').classList.add('active');
}
</script>
</body>
</html>