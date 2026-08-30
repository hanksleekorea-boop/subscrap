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
  let loaded = false;

  function loadAds() {
    if (loaded || !publicSurface || !enabled || !certified || !publisherValid) return false;
    loaded = true;
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(publisher);
    document.head.appendChild(script);
    document.querySelectorAll('[data-ad-slot]').forEach((slot) => { slot.hidden = false; slot.removeAttribute('aria-hidden'); });
    return true;
  }

  function signalCertifiedConsent(signal) {
    const valid = signal && signal.granted === true && signal.source === 'certified-cmp';
    if (!valid) {
      window.gtag('consent', 'update', deny);
      return false;
    }
    window.gtag('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: signal.personalized === true ? 'granted' : 'denied', analytics_storage: 'denied' });
    return loadAds();
  }

  document.querySelectorAll('[data-privacy-choices]').forEach((button) => button.addEventListener('click', () => {
    window.gtag('consent', 'update', deny);
    window.dispatchEvent(new CustomEvent('subscrap:open-certified-cmp'));
  }));

  window.SubScrapAds = Object.freeze({ signalCertifiedConsent, deny: () => signalCertifiedConsent(null), status: () => Object.freeze({ publicSurface, enabled, certified, publisherValid, loaded }) });
})();
