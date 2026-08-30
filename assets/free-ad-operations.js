(() => {
  'use strict';
  const target = document.getElementById('free-ad-readiness');
  const summary = document.getElementById('free-ad-summary');
  const groups = document.getElementById('free-ad-groups');
  const labels = {
    legal_identity:'사업자·법률·연락처 / Legal identity',
    google_verification:'Google 운영 검증 / Google verification',
    ad_account:'광고·세금·지급 계정 / Ad account',
    consent_domain:'동의 관리·맞춤 도메인 / Consent and domain',
    operations_live_evidence:'부하·경보·중지·실광고 증거 / Live operations evidence'
  };
  function render(state) {
    target.dataset.mode = state.mode;
    target.className = state.ready ? 'ready' : 'off';
    summary.textContent = state.ready
      ? 'READY — 무료 서비스와 외부 광고 공개 조건이 모두 검증되었습니다.'
      : 'ADS OFF — 외부 증거가 끝날 때까지 광고는 자동 차단됩니다.';
    groups.replaceChildren();
    for (const [name, items] of Object.entries(state.priorityGroups || {})) {
      const card=document.createElement('div'); card.className='card';
      const title=document.createElement('strong'); title.textContent=labels[name] || name; card.append(title);
      const count=document.createElement('div'); count.textContent='남은 항목 / Remaining: ' + items.length; card.append(count);
      const list=document.createElement('ul');
      for (const item of items) { const li=document.createElement('li'); li.textContent=item; list.append(li); }
      card.append(list); groups.append(card);
    }
    const completion=state.completion || {};
    document.getElementById('free-ad-count').textContent = (completion.passed || 0) + ' / ' + (completion.required || 0) + ' checks (안내용, 승인율 아님)';
  }
  fetch('https://subscrap-api-bh3ckbhqoq-as.a.run.app/v1/free-ad-launch-readiness',{credentials:'omit',referrerPolicy:'no-referrer'})
    .then(response=>response.ok?response.json():Promise.reject(new Error('readiness unavailable')))
    .then(body=>{ if(body?.data?.schema!=='subscrap-free-ad-launch-readiness/v1') throw new Error('invalid schema'); render(body.data); })
    .catch(()=>{ summary.textContent='ADS OFF — 준비도 서버를 확인할 수 없어 광고를 차단합니다.'; target.className='off'; });
})();
