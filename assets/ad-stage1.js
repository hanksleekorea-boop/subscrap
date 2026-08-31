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
    if (typeof window.googlefc.showRevocationMessage === 'function') window.googlefc.showRevocationMessage();
    else window.googlefc.callbackQueue.push({ CONSENT_API_READY: () => {
      if (typeof window.googlefc.showRevocationMessage === 'function') window.googlefc.showRevocationMessage();
    } });
  }));

  if (publicSurface && enabled && certified && publisherValid && !stage2Managed) loadAds();
  window.SubScrapAds = Object.freeze({ signalCertifiedConsent, deny: () => signalCertifiedConsent(null), loadAds, status: () => Object.freeze({ publicSurface, enabled, certified, publisherValid, stage2Managed, loaded, initializedUnits }) });
})();
