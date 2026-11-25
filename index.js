/* =====================================================================
   PAZZA-PIZZA  |  main.js
   Works with your existing HTML + CSS (no changes needed).
   Add this line just before </body> on EVERY page:
        <script src="../js/main.js"></script>
   Every feature checks that its element exists first, so the same file
   is safe on the home page and on about.html.
   ===================================================================== */
 
/* =====================================================================
   PRELOADER  (runs first, covers the page until everything has loaded)
   Needs no HTML or CSS changes: it injects its own <style> and <div>.
   ===================================================================== */
const PRELOADER_MIN_TIME = 1200;          // ms: the loader stays on screen at least this long
 
(function preloader(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 
  // 1) The loader's CSS (written here so you don't have to edit your .css files)
  const style = document.createElement('style');
  style.textContent = `
    #pp-loader { position: fixed; inset: 0; z-index: 99999; background: #000;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px;
      transition: opacity 0.6s ease, visibility 0.6s ease; }
    #pp-loader.pp-hide { opacity: 0; visibility: hidden; }
    .pp-pizza { font-size: 4.5rem; animation: pp-spin 1.4s linear infinite; }
    .pp-name  { color: #f18930; font-size: 2rem; }
    .pp-bar   { width: 220px; height: 6px; background: rgba(255, 255, 255, 0.2); border-radius: 6px; overflow: hidden; }
    .pp-bar span { display: block; height: 100%; width: 0; background: #f18930; border-radius: 6px;
      animation: pp-fill ${PRELOADER_MIN_TIME}ms ease forwards; }
    @keyframes pp-spin { to { transform: rotate(360deg); } }
    @keyframes pp-fill { to { width: 100%; } }
    @media (prefers-reduced-motion: reduce) {
      .pp-pizza { animation: none; }
      .pp-bar span { animation: none; width: 100%; }
    }`;
  document.head.appendChild(style);
 
  // 2) The loader's HTML, placed at the very start of <body>
  const loader = document.createElement('div');
  loader.id = 'pp-loader';
  loader.setAttribute('role', 'status');
  loader.setAttribute('aria-label', 'Loading');
  loader.innerHTML = `
    <div class="pp-pizza">🍕</div>
    <div class="pp-name">Pazza-Pizza</div>
    <div class="pp-bar"><span></span></div>`;
  document.body.prepend(loader);
  document.body.style.overflow = 'hidden';     // stop scrolling while loading
 
  // 3) Fade it out, remove it, and tell the rest of the code "the page is ready"
  function hideLoader() {
    loader.classList.add('pp-hide');
    document.body.style.overflow = '';
    setTimeout(() => loader.remove(), 700);    // remove from the page after the fade
    window.ppLoaded = true;
    window.dispatchEvent(new Event('preloader:done'));
  }
 
  // 4) Wait for the whole page (images included) AND the minimum time
  const started = performance.now();
  function finish() {
    const wait = reduce ? 0 : Math.max(0, PRELOADER_MIN_TIME - (performance.now() - started));
    setTimeout(hideLoader, wait);
  }
  if (document.readyState === 'complete') finish();
  else window.addEventListener('load', finish);
})();
 
 
document.addEventListener('DOMContentLoaded', () => {
 
  /* ---------- SETTINGS (change these to suit you) ---------- */
  const ORANGE = '#f18930';
  const MOBILE_BREAKPOINT = 768;            // px: below this width the hamburger menu is used
  const MENU_PAGE = '';                     // e.g. '../pages/menu.html'. Leave '' to scroll to the chefs section instead.
  const HERO_WORDS = ['Every Bite', 'Every Slice', 'Every Flavour', 'Every Smile'];
 
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 
  /* =====================================================================
     SECTION 1: NAVIGATION BAR  (sticky + dark background after scrolling)
     ===================================================================== */
  const nav = $('.nav-bar');
  const navList = nav ? $('ul', nav) : null;
 
  if (nav) {
    nav.style.position = 'fixed';
    nav.style.transition = 'background 0.3s ease, padding 0.3s ease, box-shadow 0.3s ease';
 
    const onScrollNav = () => {
      const scrolled = window.scrollY > 60;
      nav.style.background = scrolled ? 'rgba(0, 0, 0, 0.92)' : 'transparent';
      nav.style.boxShadow = scrolled ? '0 4px 20px rgba(0, 0, 0, 0.4)' : 'none';
      nav.style.padding = scrolled ? '4px 10px' : '10px';
    };
    window.addEventListener('scroll', onScrollNav, { passive: true });
    onScrollNav();
  }
 
  /* =====================================================================
     SECTION 2: MOBILE HAMBURGER MENU  (created by JS, no HTML needed)
     ===================================================================== */
  let menuOpen = false;
  let toggleBtn = null;
 
  if (nav && navList) {
    toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.textContent = '☰';
    toggleBtn.setAttribute('aria-label', 'Toggle menu');
    toggleBtn.setAttribute('aria-expanded', 'false');
    Object.assign(toggleBtn.style, {
      display: 'none', background: 'transparent', border: '2px solid #fff', color: '#fff',
      fontSize: '1.6rem', lineHeight: '1', padding: '4px 12px', borderRadius: '8px',
      cursor: 'pointer', fontFamily: 'sans-serif'
    });
    nav.appendChild(toggleBtn);
 
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
 
    function layoutMenu() {
      if (mq.matches) {                                   // phone / small tablet
        toggleBtn.style.display = 'block';
        Object.assign(navList.style, {
          display: menuOpen ? 'flex' : 'none', flexDirection: 'column',
          position: 'absolute', top: '100%', left: '0', width: '100%',
          background: 'rgba(0, 0, 0, 0.95)', padding: '10px 0', textAlign: 'center'
        });
        $$('li', navList).forEach(li => { li.style.display = 'block'; });
      } else {                                            // desktop: put everything back
        toggleBtn.style.display = 'none';
        menuOpen = false;
        navList.removeAttribute('style');
        $$('li', navList).forEach(li => li.style.removeProperty('display'));
      }
      toggleBtn.textContent = menuOpen ? '✕' : '☰';
      toggleBtn.setAttribute('aria-expanded', String(menuOpen));
    }
 
    toggleBtn.addEventListener('click', () => { menuOpen = !menuOpen; layoutMenu(); });
    mq.addEventListener('change', layoutMenu);
    layoutMenu();
  }
 
  function closeMenu() { if (menuOpen && toggleBtn) toggleBtn.click(); }
 
  /* =====================================================================
     SECTION 3: SMOOTH SCROLLING  (#CHEF, #CONTACT, #home ...)
     ===================================================================== */
  function scrollToTarget(hash) {
    const target = hash === '#home' || hash === '#' ? null : $(hash);
    if (hash === '#home' || hash === '#') {
      window.scrollTo({ top: 0, behavior: 'smooth' });  // #home has no element in your HTML, so go to top
      return true;
    }
    if (!target) return false;
    const navHeight = nav ? nav.offsetHeight : 0;
    const y = target.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({ top: y, behavior: 'smooth' });
    return true;
  }
 
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const hash = link.getAttribute('href');
      if (scrollToTarget(hash)) { e.preventDefault(); closeMenu(); }
    });
  });
 
  /* =====================================================================
     SECTION 4: ACTIVE NAV LINK  (highlights the section you are viewing)
     ===================================================================== */
  if (nav) {
    const links = $$('a[href]', navList || nav);
    const sections = [
      { hash: '#CHEF', el: $('#CHEF') },
      { hash: '#CONTACT', el: $('#CONTACT') }
    ].filter(s => s.el);
 
    function markActive() {
      let current = sections.length ? '#home' : null;
      const probe = window.scrollY + window.innerHeight * 0.35;
      sections.forEach(s => {
        if (probe >= s.el.getBoundingClientRect().top + window.scrollY) current = s.hash;
      });
      // On about.html highlight the ABOUT link instead
      const onAbout = /about\.html$/i.test(location.pathname);
      links.forEach(a => {
        const href = a.getAttribute('href');
        const isActive = onAbout ? /about\.html$/i.test(href) : href === current;
        a.style.color = isActive ? ORANGE : '';
      });
    }
    window.addEventListener('scroll', markActive, { passive: true });
    markActive();
  }
 
  /* =====================================================================
     SECTION 5: HERO TYPING EFFECT  (the orange "Every Bite" text)
     ===================================================================== */
  const heroWord = $('.secton > span');
  function startHeroTyping() {
    if (!heroWord || reduceMotion) return;
    heroWord.style.display = 'inline-block';
    heroWord.style.minHeight = '1.3em';
    let w = 0, i = 0, deleting = false;
 
    (function type() {
      const word = HERO_WORDS[w];
      i += deleting ? -1 : 1;
      heroWord.textContent = word.slice(0, i) + '|';
      let delay = deleting ? 60 : 110;
      if (!deleting && i === word.length) { delay = 1600; deleting = true; }
      else if (deleting && i === 0) { deleting = false; w = (w + 1) % HERO_WORDS.length; delay = 350; }
      setTimeout(type, delay);
    })();
  }
 
  // Start typing only after the preloader has gone
  if (window.ppLoaded) startHeroTyping();
  else window.addEventListener('preloader:done', startHeroTyping, { once: true });
 
  /* =====================================================================
     SECTION 6: "GO TO MENU" BUTTON
     ===================================================================== */
  const menuBtn = $('.secton .button');
  if (menuBtn) {
    menuBtn.style.cursor = 'pointer';
    menuBtn.style.transition = 'transform 0.2s ease';
    menuBtn.setAttribute('role', 'button');
    menuBtn.setAttribute('tabindex', '0');
    menuBtn.addEventListener('mouseenter', () => { menuBtn.style.transform = 'scale(1.06)'; });
    menuBtn.addEventListener('mouseleave', () => { menuBtn.style.transform = 'none'; });
 
    const goMenu = () => {
      if (MENU_PAGE) window.location.href = MENU_PAGE;
      else scrollToTarget('#CHEF');
    };
    menuBtn.addEventListener('click', goMenu);
    menuBtn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goMenu(); } });
  }
 
  /* =====================================================================
     SECTION 7: SCROLL REVEAL  (elements fade and slide in as you scroll)
     ===================================================================== */
  if ('IntersectionObserver' in window && !reduceMotion) {
    const revealTargets = $$([
      '.chef-section > span', '.chef-section > p', '.house',
      '.story-section .story', '.story-section .image',
      '.hero-section .section > *',
      'footer .footer-container'
    ].join(','));
 
    revealTargets.forEach((el, n) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(40px)';
      const siblingIndex = el.classList.contains('house') ? $$('.house').indexOf(el) : 0;
      el.style.transition = `opacity 0.8s ease ${siblingIndex * 0.18}s, transform 0.8s ease ${siblingIndex * 0.18}s`;
    });
 
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'none';
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
 
    revealTargets.forEach(el => io.observe(el));
  }
 
  /* =====================================================================
     SECTION 8: CHEF CARD HOVER  (lifts the card and zooms the photo)
     ===================================================================== */
  $$('.house').forEach(card => {
    const img = $('img', card);
    card.style.overflow = 'hidden';
    if (img) img.style.transition = 'transform 0.5s ease';
    card.addEventListener('mouseenter', () => { if (img) img.style.transform = 'scale(1.08)'; card.style.boxShadow = '0 12px 28px rgba(241, 137, 48, 0.45)'; });
    card.addEventListener('mouseleave', () => { if (img) img.style.transform = 'none'; card.style.boxShadow = 'none'; });
  });
 
  /* =====================================================================
     SECTION 9: BROKEN IMAGE FALLBACK  (shows a pizza placeholder)
     ===================================================================== */
  const placeholder = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#2a2a2a"/>' +
    '<text x="50%" y="55%" font-size="90" text-anchor="middle">🍕</text></svg>');
  $$('img').forEach(img => {
    const useFallback = () => { img.onerror = null; img.src = placeholder; };
    if (img.complete && img.naturalWidth === 0) useFallback();      // already failed before this script ran
    else img.addEventListener('error', useFallback, { once: true }); // fails later
  });
 
  /* =====================================================================
     SECTION 10: FIX LINKS + AUTO-UPDATE YEAR IN FOOTER
     ===================================================================== */
  // Links like href="www.linkedin.com/..." (no https://) are treated as local files. Fix them.
  $$('a[href^="www."]').forEach(a => {
    a.href = 'https://' + a.getAttribute('href');
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });
 
  const copy = $('.bottom-bar p');
  if (copy) copy.innerHTML = copy.innerHTML.replace(/\b20\d{2}\b/, new Date().getFullYear());
 
  /* =====================================================================
     SECTION 11: BACK-TO-TOP BUTTON  (created by JS)
     ===================================================================== */
  const topBtn = document.createElement('button');
  topBtn.type = 'button';
  topBtn.textContent = '↑';
  topBtn.setAttribute('aria-label', 'Back to top');
  Object.assign(topBtn.style, {
    position: 'fixed', right: '20px', bottom: '20px', width: '46px', height: '46px',
    borderRadius: '50%', border: '2px solid #fff', background: ORANGE, color: '#fff',
    fontSize: '1.4rem', fontFamily: 'sans-serif', cursor: 'pointer', zIndex: '3000',
    opacity: '0', visibility: 'hidden', transition: 'opacity 0.3s, visibility 0.3s, transform 0.3s'
  });
  document.body.appendChild(topBtn);
 
  window.addEventListener('scroll', () => {
    const show = window.scrollY > 500;
    topBtn.style.opacity = show ? '1' : '0';
    topBtn.style.visibility = show ? 'visible' : 'hidden';
  }, { passive: true });
  topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  topBtn.addEventListener('mouseenter', () => { topBtn.style.transform = 'scale(1.12)'; });
  topBtn.addEventListener('mouseleave', () => { topBtn.style.transform = 'none'; });
 
});
 
 const box = document.getElementById('searchBox');
  const input = document.getElementById('searchInput');
  const btn = document.getElementById('searchBtn');

  btn.addEventListener('click', () => {
    if (!box.classList.contains('open')) {
      box.classList.add('open');   // first click: open the input
      input.focus();
    } else if (input.value.trim() !== '') {
      box.submit();                // has text: run the search
    } else {
      box.classList.remove('open'); // empty: close it
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') box.classList.remove('open');
  });
