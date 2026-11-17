'use strict';
// Only non-personal booking selections persist in tab session storage. Birth dates never enter this file.
const themes=PackageData.themes;
const state=Stay.load();
const requestedTheme=new URLSearchParams(location.search).get('theme');
if(themes[requestedTheme]){state.theme=requestedTheme;state.slot='';state.receipt=null;state.roomSelected=false;}
const $=s=>document.querySelector(s);
function setText(id,value){$(id).textContent=value;}
function render(){Stay.save(state);const selectedLabel=document.querySelector('#selected-name');if(selectedLabel)selectedLabel.textContent=themes[state.theme].symbol+' · '+themes[state.theme].name;const t=themes[state.theme],exec=state.room==='executive';document.documentElement.style.setProperty('--accent',t.color);document.documentElement.style.setProperty('--theme-bg',t.bg);
document.querySelectorAll('[data-theme]').forEach(b=>{const selected=b.dataset.theme===state.theme;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});
$('#theme-panel').setAttribute('aria-labelledby','tab-'+state.theme);
document.querySelectorAll('[data-room]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.room===state.room)));
setText('#theme-tag',t.symbol+' · '+t.name.toUpperCase());setText('#theme-title',t.title);setText('#theme-message',!exec&&t.deluxeMessage?t.deluxeMessage:t.message);setText('#scent','향 · '+t.scent);setText('#sound','소리 · '+t.sound);setText('#scent-caption',t.caption);$('#theme-image').src='assets/'+state.theme+'-sensory.png';$('#theme-image').alt=t.scent+' · '+t.sound+' 연출 이미지';setText('#experience',t.experience);setText('#experience-note',t.note);setText('#gift',t.gift);
const experienceCaptions={flow:'온기 케어 프로그램 대표 이미지',grow:'격물공부 호텔점 매장 사진',shine:'시티 애슬레틱 클럽 사우나'};
$('#experience-image').src='assets/'+state.theme+'-experience.jpg?v=wood-hotel-20261117';$('#experience-image').alt=experienceCaptions[state.theme];setText('#experience-caption',experienceCaptions[state.theme]);
$('#gift-image').src='assets/'+state.theme+'-gift-logo.png';$('#gift-image').alt=t.gift+' 기프트 연출 이미지';
$('#tea-image').src='assets/'+state.theme+'-tea.png';$('#tea-image').alt=t.symbol+' 테마 차·다과 연출 이미지';
$('#room-image').src='assets/'+state.room+'-'+state.bed+'.jpg';const roomPhotoLabel=(exec?'이그제큐티브':'디럭스')+' · '+(state.bed==='king'?'킹':'트윈');$('#room-image').alt=roomPhotoLabel+' 객실';setText('#room-photo-caption',roomPhotoLabel);
document.querySelectorAll('[data-bed]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.bed===state.bed)));
setText('#room-tag',exec?'EXECUTIVE DELUXE':'DELUXE');setText('#room-title',(exec?'이그제큐티브 디럭스':'디럭스')+' 객실 1박');
const benefits=Stay.benefits(state);
setText('#room-price',Stay.money(Stay.rate(state))+'부터');
setText('#upgrade-price','이그제큐티브 디럭스 변경 시 +'+Stay.money(PackageData.prices[state.theme].executive-PackageData.prices[state.theme].deluxe));
$('#room-benefits').replaceChildren(...benefits.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));$('#tea-detail').hidden=!exec;setText('#tea-name',t.tea);
}
document.querySelectorAll('[data-theme]').forEach(b=>{b.addEventListener('click',()=>{state.theme=b.dataset.theme;state.slot='';state.receipt=null;state.roomSelected=false;render();});b.addEventListener('keydown',e=>{const keys=['flow','grow','shine'];let i=keys.indexOf(state.theme);if(e.key==='ArrowRight')i=(i+1)%3;else if(e.key==='ArrowLeft')i=(i+2)%3;else if(e.key==='Home')i=0;else if(e.key==='End')i=2;else return;e.preventDefault();state.theme=keys[i];state.slot='';state.receipt=null;state.roomSelected=false;render();$('#tab-'+state.theme).focus();});});
document.querySelectorAll('[data-room]').forEach(b=>b.addEventListener('click',()=>{state.room=b.dataset.room;render();}));
document.querySelectorAll('[data-bed]').forEach(b=>b.addEventListener('click',()=>{state.bed=b.dataset.bed;render();}));
function openDialog(id){$(id).showModal();}
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
const localISO=date=>[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
const today=Stay.today();$('#checkin').min=today;$('#checkout').min=today;$('#checkin').value=state.checkin;$('#checkin').max=Stay.addDays(today,365);$('#checkout').value=state.checkout;
$('#date-trigger').addEventListener('click',()=>openDialog('#dates-dialog'));$('#guest-trigger').addEventListener('click',()=>openDialog('#guests-dialog'));
$('#checkin').addEventListener('change',()=>{if(!$('#checkin').value)return;let d=new Date($('#checkin').value+'T12:00:00');d.setDate(d.getDate()+1);let next=localISO(d);$('#checkout').value=next;});
function formatDate(s){const d=new Date(s+'T12:00:00');return new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',weekday:'short'}).format(d);}
$('#dates-form').addEventListener('submit',e=>{e.preventDefault();const a=$('#checkin').value,b=$('#checkout').value;if(a<today||b!==Stay.addDays(a,1)){setText('#date-error','체크인 날짜와 1박 일정을 확인해 주세요.');return;}state.checkin=a;state.checkout=b;Stay.save(state);setText('#date-error','');setText('#date-label',formatDate(a)+' – '+formatDate(b));setText('#nights',Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000));$('#dates-dialog').close();});
$('#guests-form').addEventListener('submit',e=>{e.preventDefault();state.adults=Number($('#adults').value);Stay.save(state);setText('#guest-label','1 객실, '+state.adults+' 투숙객');$('#guests-dialog').close();});
function showBooking(){if(document.querySelector('#direct-section').hidden){document.querySelector('#personalize').scrollIntoView({behavior:'smooth',block:'start'});return;}Stay.save({...state,receipt:null,roomSelected:false});location.href='reserve.html#rooms';}
$('#book-top').addEventListener('click',showBooking);$('#book-bottom').addEventListener('click',showBooking);
setText('#date-label',formatDate(state.checkin)+' – '+formatDate(state.checkout));$('#adults').value=state.adults;setText('#guest-label','1 객실, '+state.adults+' 투숙객');
document.querySelectorAll('[data-info]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.info.includes('예약 조회')){location.href=Stay.load().receipt?'complete.html':'reserve.html';return;}setText('#info-message',b.dataset.info);openDialog('#info-dialog');}));window.DetailPage={getState:()=>({...state}),selectTheme:key=>{if(!themes[key])return;state.theme=key;state.slot='';state.receipt=null;state.roomSelected=false;render();},beginReservation:showBooking};render();
