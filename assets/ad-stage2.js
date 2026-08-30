(() => {
  'use strict';
  const manifestUrl = new URL('../ad-stage2-manifest.json', document.currentScript.src).href;
  const allowedInputs = new Set(['publicRoute','language','countryCode','deviceClass','contextTopic','consentGranted','personalizedAllowed','childDirected']);
  const forbidden = /user|account|email|gmail|receipt|transaction|subscription|merchant|amount|renewal|token|cookie|profile|phone|name|address|ip/i;
  const adapters = new Map();
  const outcomes = [];
  let manifest = null, coarseCountry = 'ZZ', countrySource = 'unset', running = false;
  const publicSurface = document.body?.dataset.adSurface === 'public-content';
  const stage3Managed = document.querySelector('meta[name="subscrap-stage3-managed"]')?.content === '1';

  function sanitize(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
    for (const key of Object.keys(input)) if (!allowedInputs.has(key) || forbidden.test(key)) return null;
    if (!/^\/global\/(?:ko\/)?(?:guides\/[a-z0-9-]+\/)?$/.test(input.publicRoute || '')) return null;
    if (!/^[A-Z]{2}$/.test(input.countryCode || '') || !['en','ko'].includes(input.language) || !['mobile','tablet','desktop'].includes(input.deviceClass)) return null;
    if (typeof input.consentGranted !== 'boolean' || typeof input.personalizedAllowed !== 'boolean' || typeof input.childDirected !== 'boolean') return null;
    return Object.freeze({ ...input });
  }
  function setCoarseCountry(code, source) {
    if (!/^[A-Z]{2}$/.test(code) || source !== 'edge-coarse-country') return false;
    coarseCountry = code; countrySource = source; return true;
  }
  function registerAdapter(id, adapter) {
    const active = manifest?.providers?.some(provider => provider.id === id && provider.active === true);
    if (!active || !adapter || typeof adapter.request !== 'function') return false;
    adapters.set(id, Object.freeze({ request: adapter.request })); return true;
  }
  function contextFromPage(consent) {
    const width = window.innerWidth;
    return sanitize({ publicRoute: location.pathname.replace(new RegExp('^/subscrap'), ''), language: document.documentElement.lang, countryCode: coarseCountry, deviceClass: width < 640 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop', contextTopic: document.body.dataset.contextTopic || 'general', consentGranted: consent?.granted === true, personalizedAllowed: consent?.personalized === true, childDirected: document.body.dataset.childDirected === 'true' });
  }
  function providerHealthy(id) {
    const recent = outcomes.filter(row => row.provider === id && Date.now() - row.at < 15 * 60 * 1000).slice(-100);
    if (!recent.length) return true;
    const errors = recent.filter(row => row.status === 'error').length / recent.length;
    return errors <= manifest.budgets.errorRate && !recent.some(row => row.status === 'policy_block' || row.status === 'invalid_traffic_block');
  }
  async function request(consent) {
    if (stage3Managed) return Object.freeze({ action: 'no_ads', reason: 'stage3_managed' });
    if (running || !publicSurface || !manifest?.enabled) return Object.freeze({ action: 'no_ads', reason: 'stage2_not_ready' });
    const context = contextFromPage(consent);
    if (!context || context.childDirected || !context.consentGranted) return Object.freeze({ action: 'no_ads', reason: 'consent_or_context_blocked' });
    running = true;
    try {
      const ordered = manifest.providers.filter(provider => provider.active && providerHealthy(provider.id)).map(provider => provider.id).slice(0, 2);
      for (const provider of ordered) {
        const adapter = adapters.get(provider); if (!adapter) continue;
        const started = performance.now();
        try {
          const result = await Promise.race([Promise.resolve(adapter.request(context)), new Promise((_, reject) => setTimeout(() => reject(new Error('provider_timeout')), manifest.budgets.latencyP95Ms))]);
          outcomes.push({ provider, status: result?.filled ? 'filled' : 'passback', latencyMs: performance.now() - started, at: Date.now() });
          if (result?.filled) return Object.freeze({ action: 'served', provider, privateDataUsed: false });
        } catch (error) { outcomes.push({ provider, status: 'error', latencyMs: performance.now() - started, at: Date.now() }); }
      }
      window.dispatchEvent(new CustomEvent('subscrap:house-fallback'));
      return Object.freeze({ action: 'house_only', reason: 'no_healthy_fill', privateDataUsed: false });
    } finally { running = false; }
  }
  function blockProvider(id, reason) {
    if (!['policy_block','invalid_traffic_block'].includes(reason)) return false;
    outcomes.push({ provider: id, status: reason, latencyMs: 0, at: Date.now() }); return true;
  }
  function status() { return Object.freeze({ publicSurface, enabled: manifest?.enabled === true, mode: manifest?.mode || 'loading', providerCount: manifest?.providerCount || 0, adapters: adapters.size, countrySource, stage3Managed, simultaneousExternalProviders: running ? 1 : 0, privateDataUsed: false }); }

  window.SubScrapAdsStage2 = Object.freeze({ setCoarseCountry, registerAdapter, request, blockProvider, status });
  fetch(manifestUrl, { credentials: 'omit', referrerPolicy: 'no-referrer' }).then(response => response.ok ? response.json() : Promise.reject(new Error('manifest'))).then(value => {
    if (value?.schema !== 'subscrap-ad-stage2-public/v1' || value.privateAppAdFree !== true || value.userDiscoveryDataAllowedForAds !== false || value.budgets?.maxSimultaneousExternalProviders !== 1) throw new Error('invalid stage2 manifest');
    manifest = Object.freeze(value); window.dispatchEvent(new CustomEvent('subscrap:ad-stage2-ready'));
  }).catch(() => { manifest = Object.freeze({ enabled: false, mode: 'stage2_disabled_preview', providers: [], budgets: { errorRate: 0, latencyP95Ms: 1 }, providerCount: 0 }); });
  window.addEventListener('subscrap:certified-consent', event => request(event.detail));
})();
