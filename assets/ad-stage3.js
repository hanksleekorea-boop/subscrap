(() => {
  'use strict';
  const manifestUrl = new URL('../ad-stage3-manifest.json', document.currentScript.src).href;
  const publicSurface = document.body?.dataset.adSurface === 'public-content';
  const allowed = new Set(['publicRoute','language','countryCode','deviceClass','contextTopic','consentGranted','personalizedAllowed','childDirected']);
  const forbidden = /user|account|email|gmail|receipt|transaction|subscription|merchant|amount|renewal|token|cookie|profile|phone|name|address|ip/i;
  let manifest = null, controller = null, running = false, coarseCountry = 'ZZ', countrySource = 'unset', lastAction = 'none';
  function sanitize(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
    for (const key of Object.keys(input)) if (!allowed.has(key) || forbidden.test(key)) return null;
    if (!/^\/global\/(?:ko\/)?(?:guides\/[a-z0-9-]+\/)?$/.test(input.publicRoute || '') || !['en','ko'].includes(input.language) || !/^[A-Z]{2}$/.test(input.countryCode || '') || !['mobile','tablet','desktop'].includes(input.deviceClass)) return null;
    if (typeof input.consentGranted !== 'boolean' || typeof input.personalizedAllowed !== 'boolean' || typeof input.childDirected !== 'boolean') return null;
    return Object.freeze({ ...input });
  }
  function setCoarseCountry(code, source) { if (!/^[A-Z]{2}$/.test(code) || source !== 'edge-coarse-country') return false; coarseCountry=code; countrySource=source; return true; }
  function registerController(candidate) {
    if (!manifest?.enabled || !candidate || typeof candidate.request !== 'function' || candidate.usesPersonalData !== false || candidate.persistsIdentity !== false || candidate.arbitraryAdvertiserScripts !== false) return false;
    controller = Object.freeze({ request:candidate.request }); return true;
  }
  function contextFromPage(consent) { const width=innerWidth; return sanitize({ publicRoute:location.pathname.replace(new RegExp('^/subscrap'),''), language:document.documentElement.lang, countryCode:coarseCountry, deviceClass:width<640?'mobile':width<1024?'tablet':'desktop', contextTopic:document.body.dataset.contextTopic || 'general', consentGranted:consent?.granted===true, personalizedAllowed:false, childDirected:document.body.dataset.childDirected==='true' }); }
  function ephemeralBucket() { const value=new Uint16Array(1); crypto.getRandomValues(value); return value[0] % 10000; }
  async function request(consent) {
    if (running || !publicSurface || !manifest?.enabled) return Object.freeze({ action:'no_ads', reason:'stage3_not_ready' });
    const context=contextFromPage(consent); if (!context || !context.consentGranted || context.childDirected) return Object.freeze({ action:'no_ads', reason:'consent_or_context_blocked' });
    if (!controller) { lastAction='house_only'; window.dispatchEvent(new CustomEvent('subscrap:house-fallback')); return Object.freeze({ action:'house_only', reason:'controller_unavailable', privateDataUsed:false }); }
    running=true;
    try {
      const result=await Promise.race([Promise.resolve(controller.request(context,ephemeralBucket())),new Promise((_,reject)=>setTimeout(()=>reject(new Error('stage3_failsafe')),manifest.budgets.totalFailsafeMs))]);
      if (!result || !['direct_campaign','sandboxed_auction','house_only','no_ads'].includes(result.action) || result.privateDataUsed !== false) throw new Error('unsafe_stage3_result');
      lastAction=result.action; return Object.freeze({ action:result.action, sponsorLabel:result.sponsorLabel || '', privateDataUsed:false });
    } catch (error) { lastAction='house_only'; window.dispatchEvent(new CustomEvent('subscrap:house-fallback')); return Object.freeze({ action:'house_only', reason:'safe_fallback', privateDataUsed:false }); }
    finally { running=false; }
  }
  function status() { return Object.freeze({ publicSurface, enabled:manifest?.enabled===true, mode:manifest?.mode || 'loading', directCampaignCount:manifest?.directCampaignCount || 0, approvedBidderCount:manifest?.approvedBidderCount || 0, controllerRegistered:!!controller, countrySource, running, lastAction, personalTargeting:false, identityPersisted:false, arbitraryAdvertiserScripts:false, privateDataUsed:false }); }
  window.SubScrapAdsStage3=Object.freeze({ setCoarseCountry, registerController, request, status });
  fetch(manifestUrl,{credentials:'omit',referrerPolicy:'no-referrer'}).then(response=>response.ok?response.json():Promise.reject(new Error('manifest'))).then(value=>{
    if (value?.schema!=='subscrap-ad-stage3-public/v1' || value.privateAppAdFree!==true || value.userDiscoveryDataAllowedForAds!==false || value.personalTargetingAllowed!==false || value.arbitraryAdvertiserScriptsAllowed!==false || value.budgets?.maxSimultaneousAuctions!==1) throw new Error('invalid_stage3_manifest');
    manifest=Object.freeze(value); window.dispatchEvent(new CustomEvent('subscrap:ad-stage3-ready'));
  }).catch(()=>{ manifest=Object.freeze({enabled:false,mode:'stage3_disabled_preview',budgets:{totalFailsafeMs:1},directCampaignCount:0,approvedBidderCount:0}); });
  window.addEventListener('subscrap:certified-consent',event=>request(event.detail));
})();
