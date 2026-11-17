'use strict';
(function(){
const S=Stay,D=PackageData,T=D.themes,$=s=>document.querySelector(s);let state=S.load();
const text=(selector,value)=>{const el=$(selector);if(el)el.textContent=value;};
function accent(){const t=T[state.theme];document.documentElement.style.setProperty('--accent',t.color);document.documentElement.style.setProperty('--theme-bg',t.bg);}
function persist(){state=S.save(state);accent();}
function list(items){return items.map(x=>'<li>'+x+'</li>').join('');}
function summaryHTML(){const t=T[state.theme];return `<div class="summary-photo"><img src="assets/${state.room}-${state.bed}.jpg" alt="${S.roomName(state)} 객실"></div><div class="summary-body"><p class="eyebrow">THE WESTIN JOSUN SEOUL</p><h3>${t.symbol} · ${t.name}</h3><p>${S.roomName(state)}</p><dl><div><dt>체크인</dt><dd>${S.dateLabel(state.checkin)}</dd></div><div><dt>체크아웃</dt><dd>${S.dateLabel(state.checkout)}</dd></div><div><dt>객실 · 인원</dt><dd>1객실 · 성인 ${state.adults}명</dd></div></dl><ul class="summary-benefits">${list(S.benefits(state))}</ul><div class="price-total"><span>시연 총액 <small>세금·봉사료 포함</small></span><strong>${S.money(S.rate(state))}</strong></div><p class="demo-price-note">비성수기 주중 · 성인 2인 기준 기획 시작가를 적용한 시연 총액입니다. 날짜별 실제 요금은 조회되지 않습니다.</p></div>`;}
function resetReceipt(){state.receipt=null;state.roomSelected=false;}
function setupShell(){document.querySelectorAll('[data-info]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.info.includes('예약 조회')){location.href=state.receipt?'complete.html':'reserve.html';return;}$('#shell-message').textContent='체험용 예약은 로그인 없이 진행할 수 있습니다.';$('#shell-dialog').showModal();}));document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));}
function tripForm(){const form=$('#trip-form');if(!form)return;const input=$('#trip-checkin');input.min=S.today();input.max=S.addDays(S.today(),365);input.value=state.checkin;$('#trip-checkout').value=state.checkout;$('#trip-adults').value=state.adults;
input.addEventListener('change',()=>{if(input.value)$('#trip-checkout').value=S.addDays(input.value,1);});
form.addEventListener('submit',e=>{e.preventDefault();const date=input.value;if(!date||date<S.today()||date>S.addDays(S.today(),365)){text('#trip-error','오늘부터 1년 이내의 투숙일을 선택해 주세요.');return;}state.checkin=date;state.checkout=S.addDays(date,1);state.adults=Number($('#trip-adults').value);state.slot='';resetReceipt();persist();text('#trip-error','');if(document.body.dataset.page==='home'){location.href='reserve.html';}else{renderRooms();text('#trip-feedback',state.theme==='shine'?'변경하신 일정이 적용되었습니다.':'변경하신 일정이 적용되었습니다. 체험 시간을 다시 선택해 주세요.');}});
}
function renderThemes(result){const target=$('#theme-options');if(!target)return;target.innerHTML=Object.entries(T).map(([key,t])=>`<button class="theme-choice ${state.theme===key?'selected':''}" data-choice="${key}" aria-pressed="${state.theme===key}" style="--choice-color:${t.color};--choice-bg:${t.bg}"><div class="theme-choice-image"><img src="assets/${key}-gift-logo.png" alt="${t.gift} 연출 이미지"></div><div class="theme-choice-copy">${result?.recommended.includes(key)?'<span class="recommend-badge">추천 테마</span>':''}<span class="choice-hanja">${t.symbol}</span><h3>${t.name}</h3><p>${t.title}</p><small>${t.experience}</small></div><span class="choice-check" aria-hidden="true">${state.theme===key?'✓':'＋'}</span></button>`).join('');target.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>{if(state.theme!==b.dataset.choice){state.theme=b.dataset.choice;state.slot='';resetReceipt();}persist();renderThemes(result);renderSelected();}));}
function renderSelected(){if(document.body.dataset.page==='detail'&&window.DetailPage)state=DetailPage.getState();const t=T[state.theme];text('#selected-name',t.symbol+' · '+t.name);text('#selection-message',state.room==='deluxe'&&t.deluxeMessage?t.deluxeMessage:t.message);const im=$('#selected-image');if(im){im.src='assets/'+state.theme+'-experience.jpg?v=wood-hotel-20261117';im.alt=t.experience+' 대표 이미지';}text('#selection-title',t.title);}
let currentResult=null,resolvedTheme=null;
function setMode(mode){currentResult=null;resolvedTheme=null;$('#path-start').hidden=mode!==null;$('#birth-section').hidden=mode!=='recommend';$('#direct-section').hidden=mode!=='direct';$('#analysis-result').hidden=true;$('#theme-recommendations').hidden=true;$('#selection-continue').hidden=mode!=='direct';if(mode==='direct'){currentResult=null;renderThemes(null);renderSelected();}if(mode==='recommend')$('#birth-date').focus();}
function renderRecommendations(result){
const section=$('#theme-recommendations'),cards=$('#recommendation-cards');if(!section||!cards)return;
section.hidden=false;
const candidates=result.boundary?[]:result.recommended;
const waiting=candidates.length>1&&!resolvedTheme;
$('.recommendation-disclaimer').hidden=waiting;
if(waiting){
text('#recommendations-heading','지금 나에게 더 필요한 시간은 무엇인가요?');
cards.innerHTML=`<div class="rest-preference"><p id="rest-preference-help">${candidates.length}개 테마의 오행 개수가 같아요. 지금 원하는 휴식을 하나 고르면, 취향까지 고려해 하나의 스테이를 추천해드립니다.</p><fieldset aria-describedby="rest-preference-help"><legend>지금 원하는 휴식을 하나 선택해 주세요</legend><div class="rest-preference-options">${candidates.map(key=>{const t=T[key];return `<button type="button" class="rest-preference-choice" data-rest-preference="${key}"><span>${t.preference}</span><b aria-hidden="true">→</b></button>`;}).join('')}</div></fieldset><button type="button" class="underline-link" id="preference-direct">추천 없이 세 가지 테마 직접 살펴보기 →</button></div>`;
cards.querySelectorAll('[data-rest-preference]').forEach(button=>button.addEventListener('click',()=>{
const key=button.dataset.restPreference;if(!candidates.includes(key))return;
resolvedTheme=key;DetailPage.selectTheme(key);state=DetailPage.getState();
$('#direct-section').hidden=false;$('#selection-continue').hidden=false;
renderSelected();renderRecommendations(result);section.scrollIntoView({behavior:'smooth',block:'start'});
}));
$('#preference-direct').addEventListener('click',()=>setMode('direct'));
return;
}
const keys=resolvedTheme?[resolvedTheme]:candidates;
text('#recommendations-heading',keys.length===1?'당신에게 추천하는 오행 스테이':'마음이 이끄는 휴식을 선택해보세요');
if(!keys.length){cards.innerHTML=`<div class="recommendation-empty"><p>${result.boundary?'출생 시간에 따라 오행 분포가 달라질 수 있어 하나의 테마를 추천하지 않습니다.':'가장 적게 나타난 오행이 토·금에 해당해 수·목·화 중 하나를 부족한 기운으로 추천하지 않습니다.'}</p><a href="#themes" class="text-link">수·목·화 세 가지 휴식 살펴보기 →</a></div>`;return;}
const key=keys[0],t=T[key];
cards.innerHTML=`<article class="element-recommendation" style="--recommend-color:${t.color};--recommend-bg:${t.bg}"><div class="recommendation-top"><div><p class="recommendation-label">당신에게 추천하는 오행</p><h3>${t.symbol} · ${t.name.toUpperCase()}</h3><p class="recommendation-subtitle">${t.title}</p></div><span class="recommendation-symbol" aria-hidden="true">${t.symbol}</span></div>${candidates.length>1?`<p class="recommendation-reason">삼주 오행 분포와 지금 원하는 휴식을 함께 고려해, ${t.symbol} ${t.name}를 추천합니다.</p>`:''}<p class="recommendation-meaning">전통 오행의 상징에서 ${t.meaning}</p><p class="recommendation-message">${state.room==='deluxe'&&t.deluxeMessage?t.deluxeMessage:t.message}</p><a href="#themes" class="recommendation-action" data-apply-recommendation="${key}">${t.symbol} ${t.name} 패키지 살펴보기 <span aria-hidden="true">→</span></a>${candidates.length>1?'<button type="button" class="preference-retry" id="preference-retry">휴식 취향 다시 선택하기</button>':''}</article>`;
cards.querySelector('[data-apply-recommendation]').addEventListener('click',()=>{DetailPage.selectTheme(key);state=DetailPage.getState();renderSelected();});
const retry=$('#preference-retry');if(retry)retry.addEventListener('click',()=>{resolvedTheme=null;$('#direct-section').hidden=true;$('#selection-continue').hidden=true;renderRecommendations(result);section.scrollIntoView({behavior:'smooth',block:'start'});});
}
function renderAnalysis(result){resolvedTheme=null;const needsPreference=!result.boundary&&result.recommended.length>1;const panel=$('#analysis-result');panel.hidden=false;$('#direct-section').hidden=needsPreference;$('#selection-continue').hidden=needsPreference;
text('#result-heading',result.boundary?'절기가 바뀌는 날에 태어나셨네요':result.recommended.length===1?'당신에게 제안하는 오행의 휴식':result.recommended.length>1?'당신의 휴식 취향을 더해볼까요?':'원하는 휴식으로 균형을 찾아보세요');
text('#result-description',result.boundary?'태어난 시간에 따라 연주·월주가 달라질 수 있어 하나의 테마로 단정하지 않습니다. 아래에서 원하는 휴식을 직접 선택해 주세요.':result.recommended.length>1?'표면 오행 개수가 같은 테마가 있습니다. 아래 질문에서 지금 원하는 휴식을 하나 선택하면, 하나의 스테이로 추천해드립니다.':result.recommended.length===0?'전체 오행 중 가장 적은 기운이 토·금에 해당합니다. 수·목·화 중 부족한 기운이 있다고 단정하지 않고, 원하시는 휴식을 제안합니다.':'시주를 제외한 연주·월주·일주 여섯 글자에서 상대적으로 적게 나타나는 오행을 휴식 테마로 제안합니다.');
const description=$('#result-description');if(description.textContent.includes('적게')){const parts=description.textContent.split('적게');const emphasis=document.createElement('strong');emphasis.textContent='적게';description.replaceChildren(document.createTextNode(parts[0]),emphasis,document.createTextNode(parts.slice(1).join('적게')));}
$('#pillar-grid').innerHTML=result.pillars.map(p=>`<div><span>${p.label}</span><strong>${p.text}</strong><small>${p.elements}</small></div>`).join('');
$('#element-bars').innerHTML=Object.entries(result.counts).map(([key,num])=>`<div><span>${key}</span><div class="element-track"><i style="width:${num/6*100}%"></i></div><strong>${num}</strong></div>`).join('');
if(result.recommended.length===1&&!result.boundary){state.theme=result.recommended[0];state.slot='';resetReceipt();persist();if(document.body.dataset.page==='detail'&&window.DetailPage)DetailPage.selectTheme(state.theme);}renderThemes(result);renderSelected();renderRecommendations(result);panel.scrollIntoView({behavior:'smooth',block:'start'});
}
function setStep(step){const choose=$('#choose-step');if(choose)choose.hidden=step!=='choose';$('#rooms-step').hidden=step!=='rooms';document.querySelectorAll('[data-step]').forEach(el=>{const active=el.dataset.step===step;el.classList.toggle('current',active);if(active)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});if(step==='rooms'){renderRooms();}document.title=(step==='rooms'?'객실 및 요금 선택':'오행 테마 선택')+' | Find Your Balance';}
function renderRooms(){const t=T[state.theme];text('#room-theme-label',t.symbol+' · '+t.name);text('#room-theme-message',state.room==='deluxe'&&t.deluxeMessage?t.deluxeMessage:t.message);$('#room-theme-symbol').textContent=t.symbol;
$('#room-list').innerHTML=['deluxe','executive'].map(room=>{const exec=room==='executive';const temp={...state,room};return `<article class="rate-card ${state.room===room?'chosen':''}"><div class="rate-photo"><img src="assets/${room}-${state.bed}.jpg" alt="${S.roomName(temp)} 객실"><span>객실 사진</span></div><div class="rate-content"><p class="eyebrow">${exec?'EXECUTIVE DELUXE':'DELUXE'}</p><h3>${exec?'이그제큐티브 디럭스':'디럭스'}</h3><p class="rate-spec">${state.bed==='king'?'킹 침대':'트윈 침대'} · 성인 ${state.adults}명 · 1박</p><ul>${list(S.benefits(temp))}</ul><details class="rate-package-detail"><summary>객실 연출${exec?' · 식음 구성':''} 보기 <span>＋</span></summary><p>${t.scent}<br>${t.sound}<br>${state.theme==='flow'?'은은한 조명':state.theme==='grow'?'편안한 조명':'밝은 조명'}</p>${exec?`<figure><img src="assets/${state.theme}-tea.png" alt="${t.tea} 연출 이미지" loading="lazy"><figcaption>${t.tea} · 연출 이미지</figcaption></figure>`:''}</details><div class="rate-bottom"><div><small>1박 · 세금·봉사료 포함</small><strong>${S.money(S.rate(temp))}부터</strong><span class="demo-price-label">성인 2인 기준${exec?" · 등급 변경 +"+S.money(D.prices[state.theme].executive-D.prices[state.theme].deluxe):""}</span></div><button class="${state.room===room?'outline':'primary'}" data-select-room="${room}">${state.room===room?'선택됨 ✓':'선택'}</button></div></div></article>`;}).join('');
$('#room-list').querySelectorAll('[data-select-room]').forEach(b=>b.addEventListener('click',()=>{state.room=b.dataset.selectRoom;state.receipt=null;persist();renderRooms();}));
document.querySelectorAll('[data-book-bed]').forEach(b=>b.setAttribute('aria-pressed',String(state.bed===b.dataset.bookBed)));
$('#slot-section').hidden=state.theme==='shine';$('#sauna-free').hidden=state.theme!=='shine';text('#slot-label',t.experience+' 시간');
if(state.theme!=='shine'){$('#slot-options').innerHTML=(state.theme==='flow'?['15:00','16:30']:['16:30','17:00']).map(time=>`<button data-slot="${time}" aria-pressed="${state.slot===time}" class="${state.slot===time?'selected':''}">${time}</button>`).join('')+'<button disabled>18:00 · 마감 예시</button>';$('#slot-options').querySelectorAll('[data-slot]').forEach(b=>b.addEventListener('click',()=>{state.slot=b.dataset.slot;state.receipt=null;persist();renderRooms();}));}
$('#reservation-summary').innerHTML=summaryHTML();text('#slot-error','');
}
function reservePage(){
if(location.hash!=='#rooms'){const mode=new URLSearchParams(location.search).get('mode');location.replace('package.html'+(mode?'?personalize='+encodeURIComponent(mode):'')+'#personalize');return;}
tripForm();$('#back-to-choice').addEventListener('click',()=>{location.href='package.html#personalize';});
document.querySelectorAll('[data-book-bed]').forEach(b=>b.addEventListener('click',()=>{state.bed=b.dataset.bookBed;state.receipt=null;persist();renderRooms();}));
$('#continue-review').addEventListener('click',()=>{if(state.theme!=='shine'&&!state.slot){text('#slot-error','체험 시간을 선택해 주세요.');$('#slot-section').scrollIntoView({behavior:'smooth',block:'center'});return;}state.roomSelected=true;persist();if(S.isReady(state))location.href='checkout.html';});
window.addEventListener('hashchange',()=>{if(location.hash!=='#rooms'){location.href='package.html#personalize';return;}setStep('rooms');$('#main').scrollIntoView();});
setStep('rooms');
}
function checkoutPage(){if(!S.isReady(state)){location.replace('reserve.html#rooms');return;}$('#review-summary').innerHTML=summaryHTML();const t=T[state.theme];text('#review-title',t.symbol+' · '+t.name+' 스테이');text('#review-experience',t.experience);text('#review-time',state.theme==='shine'?'사우나 2인 각 1회':S.dateLabel(state.checkin)+' '+state.slot);text('#review-guests',S.experienceScope(state));text('#review-gift',t.gift+' · 객실당 1세트');text('#review-dining',state.room==='executive'?'클럽 라운지 조식 2인 · '+t.tea+' 2인분 1회':'객실·테마 체험·기프트 구성');
$('#confirm-form').addEventListener('submit',e=>{e.preventDefault();if(!$('#agree-demo').checked||!$('#agree-conditions').checked)return;const random=crypto.getRandomValues(new Uint32Array(2));const id='DEMO-'+[...random].map(n=>n.toString(36).toUpperCase()).join('').slice(0,8).padEnd(8,'0');state.receipt={id,theme:state.theme,room:state.room,bed:state.bed,checkin:state.checkin,adults:state.adults,slot:state.slot};persist();location.href='complete.html';});
}
function completePage(){if(!state.receipt||!S.isReady(state)){location.replace('reserve.html');return;}const t=T[state.theme];text('#confirmation-id',state.receipt.id);text('#confirmation-title',t.symbol+' · '+t.name+' 스테이를 준비했습니다');$('#complete-summary').innerHTML=summaryHTML();text('#complete-time',state.theme==='shine'?'사우나 2인 각 1회':t.experience+' · '+state.slot);$('#ritual-image').src='assets/'+state.theme+'-ritual-color.png';$('#ritual-image').alt=t.symbol+' '+t.name+' 컬러 리추얼 카드 목업';text('#ritual-title',t.symbol+' '+t.name+' 리추얼');
$('#ritual-copy').innerHTML=Object.entries(D.rituals[state.theme]).map(([key,items])=>key==='intro'?`<p class="ritual-intro">${items.join(' ')}</p>`:`<h3>${key}</h3><ul>${list(items)}</ul>`).join('');
$('#restart-demo').addEventListener('click',()=>{S.reset();location.href='home.html';});$('#print-reservation').addEventListener('click',()=>window.print());
}
function detailPage(){
state=DetailPage.getState();setMode(null);
document.querySelectorAll('[data-path]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.path)));
$('#path-back').addEventListener('click',()=>{setMode(null);$('#birth-date').value='';});
$('#birth-direct').addEventListener('click',()=>{$('#birth-date').value='';setMode('direct');});
$('#birth-date').min='1900-01-01';$('#birth-date').max=S.today();
$('#birth-form').addEventListener('submit',e=>{e.preventDefault();const input=$('#birth-date');if(input.value>S.today()){text('#birth-error','미래의 생년월일은 입력할 수 없습니다.');return;}try{currentResult=ElementAnalysis.analyze(input.value);input.value='';text('#birth-error','');renderAnalysis(currentResult);}catch(error){text('#birth-error',error.message);}});
$('#to-rooms').addEventListener('click',()=>DetailPage.beginReservation());
document.querySelectorAll('[data-room]').forEach(b=>b.addEventListener('click',()=>{if(currentResult&&!$('#analysis-result').hidden){state=DetailPage.getState();renderRecommendations(currentResult);}}));
document.querySelectorAll('[data-detail-path]').forEach(a=>a.addEventListener('click',()=>{setMode(a.dataset.detailPath);}));
const mode=new URLSearchParams(location.search).get('personalize');if(['direct','recommend'].includes(mode))setMode(mode);
}
window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
window.addEventListener('pagehide',()=>{const input=$('#birth-date');if(input)input.value='';});
const page=document.body.dataset.page;if(page!=='detail')setupShell();accent();if(page==='detail')detailPage();if(page==='home')tripForm();if(page==='reserve')reservePage();if(page==='checkout')checkoutPage();if(page==='complete')completePage();
})();
