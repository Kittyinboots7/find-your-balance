'use strict';
(()=>{
const $=s=>document.querySelector(s),S=Stay;let state=S.load(),slide=0;
const photos=[['overview-exterior.webp','웨스틴 조선 서울 외관'],['overview-lobby-1.avif','웨스틴 조선 서울 로비'],['overview-lobby-2.avif','웨스틴 조선 서울 로비'],['overview-suite.avif','리뉴얼 스위트 객실'],['club-lounge.jpg','웨스틴 클럽 라운지']];
const dateText=s=>{let d=new Date(s+'T12:00:00');return `${d.getMonth()+1}월 ${d.getDate()}일, ${'일월화수목금토'[d.getDay()]}`;};
function render(){ $('#ov-in-label').textContent=dateText(state.checkin);$('#ov-out-label').textContent=dateText(state.checkout);$('#ov-guest-label').textContent=`1 객실, ${state.adults} 성인`;$('#ov-checkin').value=state.checkin;$('#ov-checkout').value=state.checkout;$('#ov-adults').value=state.adults;}
function invalidate(){state.slot='';state.roomSelected=false;state.receipt=null;state=S.save(state);render();}
const info=(title,message)=>{$('#ov-info-title').textContent=title;$('#ov-info-text').textContent=message;$('#ov-info-dialog').showModal();};
$('#ov-checkin').min=S.today();$('#ov-checkin').max=S.addDays(S.today(),365);$('#ov-checkin').addEventListener('change',()=>{if($('#ov-checkin').value)$('#ov-checkout').value=S.addDays($('#ov-checkin').value,1);});
$('#ov-dates').addEventListener('click',()=>$('#ov-date-dialog').showModal());$('#ov-guests').addEventListener('click',()=>$('#ov-guest-dialog').showModal());
$('#ov-date-form').addEventListener('submit',e=>{e.preventDefault();state.checkin=$('#ov-checkin').value;state.checkout=S.addDays(state.checkin,1);invalidate();$('#ov-date-dialog').close();});$('#ov-guest-form').addEventListener('submit',e=>{e.preventDefault();state.adults=Number($('#ov-adults').value);invalidate();$('#ov-guest-dialog').close();});
$('#ov-search').addEventListener('click',()=>{$('#offers').scrollIntoView({behavior:'smooth',block:'start'});});
$('#ov-rates').addEventListener('click',()=>info('특별 요금','현재 화면은 최저 요금 기준의 호텔 소개 시안입니다. Find Your Balance 카드에서 패키지 구성과 시연 요금을 확인하실 수 있습니다.'));
$('#ov-login').addEventListener('click',()=>info('로그인 또는 가입하기','체험용 패키지는 로그인 없이 이용할 수 있습니다. 아래 프로모션의 Find Your Balance를 선택해 주세요.'));
$('#ov-reviews').addEventListener('click',()=>info('이용 후기','캡처의 호텔 소개 화면을 재현한 참고 평점·후기 수입니다. 실시간 후기와 연결된 화면은 아닙니다.'));
$('#ov-menu').addEventListener('click',()=>$('#ov-menu-dialog').showModal());$('#ov-gallery-open').addEventListener('click',()=>$('#ov-gallery-dialog').showModal());
$('#ov-more').addEventListener('click',()=>{const open=$('#ov-more-text').hidden;$('#ov-more-text').hidden=!open;$('#ov-more-ellipsis').hidden=open;$('#ov-more').setAttribute('aria-expanded',String(open));$('#ov-more').textContent=open?'간단히 보기':'더 보기';});
function gallery(){const p=photos[slide];$('#ov-gallery-image').src='assets/'+p[0];$('#ov-gallery-image').alt=p[1];document.querySelectorAll('[data-gallery-index]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.galleryIndex)===slide)));}
document.querySelectorAll('[data-gallery]').forEach(b=>b.addEventListener('click',()=>{slide=(slide+(b.dataset.gallery==='next'?1:photos.length-1))%photos.length;gallery();}));document.querySelectorAll('[data-gallery-index]').forEach(b=>b.addEventListener('click',()=>{slide=Number(b.dataset.galleryIndex);gallery();}));document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
document.querySelectorAll('#ov-menu-dialog a[href^="#"]').forEach(a=>a.addEventListener('click',()=>$('#ov-menu-dialog').close()));window.addEventListener('pageshow',e=>{if(e.persisted){state=S.load();render();}});render();
})();
