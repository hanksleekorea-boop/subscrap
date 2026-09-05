(() => {
  'use strict';
  const deny = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' };
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', deny);

  const meta = (name) => document.querySelector('meta[name="' + name + '"]')?.content || '';
  const publicSurface = document.body?.dataset.adSurface === 'public-content';
  const enabled = meta('subscrap-ad-enabled') === '1';
  const certified = meta('subscrap-cmp-certified') === '1';
  const publisher = meta('subscrap-ad-publisher');
  const publisherValid = /^ca-pub-\d{16}$/.test(publisher);
  const stage2Managed = meta('subscrap-stage2-managed') === '1';
  let loaded = false;
  let initializedUnits = 0;

  function loadAds() {
    if (stage2Managed) return false;
    if (loaded || !publicSurface || !enabled || !certified || !publisherValid) return false;
    loaded = true;
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(publisher);
    document.head.appendChild(script);
    script.addEventListener('load', () => {
      document.querySelectorAll('ins.adsbygoogle').forEach((unit) => {
        if (unit.dataset.subscrapInitialized === '1') return;
        unit.dataset.subscrapInitialized = '1';
        try { (window.adsbygoogle = window.adsbygoogle || []).push({}); initializedUnits += 1; } catch (error) { unit.dataset.subscrapInitialized = 'error'; }
      });
    }, { once: true });
    return true;
  }

  function signalCertifiedConsent(signal) {
    const valid = signal && signal.granted === true && signal.source === 'certified-cmp';
    if (!valid) {
      window.gtag('consent', 'update', deny);
      return false;
    }
    window.gtag('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: signal.personalized === true ? 'granted' : 'denied', analytics_storage: 'denied' });
    window.dispatchEvent(new CustomEvent('subscrap:certified-consent', { detail: { granted: true, personalized: signal.personalized === true } }));
    return loadAds();
  }

  window.googlefc = window.googlefc || {};
  window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
  document.querySelectorAll('[data-privacy-choices]').forEach((button) => button.addEventListener('click', () => {
    let notice=document.querySelector('[data-privacy-status]');
    if(!notice){notice=document.createElement('p');notice.dataset.privacyStatus='';notice.setAttribute('role','status');button.parentElement.appendChild(notice)}
    const ko=document.documentElement.lang==='ko';
    if (typeof window.googlefc.showRevocationMessage === 'function') {
      try{window.googlefc.showRevocationMessage();notice.textContent=ko?'개인정보 선택 창을 요청했습니다.':'Privacy choices requested.'}catch(e){notice.textContent=ko?'선택 창을 열지 못했습니다. 쿠키 정책에서 안내를 확인해주세요.':'Could not open choices. See the cookie policy for help.'}
    } else {
      const enabled=document.querySelector('meta[name="subscrap-ad-enabled"]')?.content==='1';
      notice.textContent=enabled?(ko?'선택 창을 불러오지 못했습니다. 광고 동의는 변경하지 않았습니다. 잠시 후 다시 시도하거나 쿠키 정책을 확인하세요.':'Privacy choices could not load. Ad consent was not changed. Retry or see the cookie policy.'):(ko?'이 페이지는 광고가 꺼져 있으며 광고 동의를 요청하지 않습니다.':'Ads are off on this page; no advertising consent is requested.');
    }
  }));

  const search = document.querySelector('[data-guide-search-input]');
  const status = document.querySelector('[data-guide-status]');
  const cards = Array.from(document.querySelectorAll('[data-guide-card]'));
  const filters = Array.from(document.querySelectorAll('[data-guide-filter]'));
  let selectedGroup = 'all';
  function updateGuideCatalog() {
    if (!cards.length) return;
    const query = String(search?.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const groupMatch = selectedGroup === 'all' || card.dataset.guideGroup === selectedGroup;
      const textMatch = !query || String(card.dataset.guideSearch || '').includes(query);
      const show = groupMatch && textMatch;
      card.hidden = !show;
      if (show) visible += 1;
    });
    filters.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.guideFilter === selectedGroup)));
    if (status) {
      const korean = document.documentElement.lang === 'ko';
      status.textContent = visible === 0
        ? (korean ? '조건에 맞는 가이드가 없습니다. 다른 단어 또는 전체 필터를 사용해 보세요.' : 'No guide matches. Try a different term or show all guides.')
        : (korean ? String(visible) + '개의 가이드를 보고 있습니다.' : 'Showing ' + String(visible) + ' guide' + (visible === 1 ? '' : 's') + '.');
    }
  }
  if (search) search.addEventListener('input', updateGuideCatalog);
  filters.forEach((button) => button.addEventListener('click', () => { selectedGroup = button.dataset.guideFilter || 'all'; updateGuideCatalog(); }));
  document.querySelectorAll('[data-guide-filter-link]').forEach((link) => link.addEventListener('click', () => {
    const target = link.dataset.guideGroup || 'all';
    setTimeout(() => { selectedGroup = target; updateGuideCatalog(); }, 0);
  }));

  if (publicSurface && enabled && certified && publisherValid && !stage2Managed) loadAds();
  window.SubScrapAds = Object.freeze({ signalCertifiedConsent, deny: () => signalCertifiedConsent(null), loadAds, status: () => Object.freeze({ publicSurface, enabled, certified, publisherValid, stage2Managed, loaded, initializedUnits }) });
})();
