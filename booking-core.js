'use strict';
(function(root){
const D=root.PackageData||(typeof require==='function'?require('./package-data.js'):null);
const localISO=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const addDays=(s,n)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return localISO(d);};
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const money=n=>new Intl.NumberFormat('ko-KR').format(n)+'원';
const dateLabel=s=>s?new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric',weekday:'short'}).format(new Date(s+'T12:00:00')):'날짜 선택';
const key='find-your-balance-selection-v1';
function defaults(){const checkin=today();return {theme:'flow',room:'deluxe',bed:'king',adults:2,checkin,checkout:addDays(checkin,1),slot:'',roomSelected:false,receipt:null};}
function clean(input){const s=defaults();if(!input||typeof input!=='object')return s;
if(D.themes[input.theme])s.theme=input.theme;if(['deluxe','executive'].includes(input.room))s.room=input.room;if(['king','twin'].includes(input.bed))s.bed=input.bed;if([1,2].includes(input.adults))s.adults=input.adults;
if(typeof input.checkin==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(input.checkin)&&localISO(new Date(input.checkin+'T12:00:00'))===input.checkin&&input.checkin>=today()&&input.checkin<=addDays(today(),365)){s.checkin=input.checkin;s.checkout=addDays(s.checkin,1);}
if(['15:00','16:30','17:00'].includes(input.slot))s.slot=input.slot;s.roomSelected=input.roomSelected===true;
if(input.receipt&&/^DEMO-[A-Z0-9]{8}$/.test(input.receipt.id)&&input.receipt.theme===s.theme&&input.receipt.room===s.room&&input.receipt.bed===s.bed&&input.receipt.checkin===s.checkin&&input.receipt.adults===s.adults&&input.receipt.slot===s.slot){s.receipt={id:input.receipt.id,theme:s.theme,room:s.room,bed:s.bed,checkin:s.checkin,adults:s.adults,slot:s.slot};}
return s;}
function load(){try{return clean(JSON.parse(sessionStorage.getItem(key)));}catch{return defaults();}}
function save(value){const s=clean(value);try{sessionStorage.setItem(key,JSON.stringify(s));}catch{}return s;}
function reset(){try{sessionStorage.removeItem(key);}catch{}return defaults();}
function roomName(s){return (s.room==='executive'?'이그제큐티브 디럭스':'디럭스')+' · '+(s.bed==='king'?'킹':'트윈');}
function experienceScope(s){return s.theme==='shine'?'사우나 2인 각 1회':'객실당 1인 1회'+(s.theme==='grow'?' · 재료 포함 공동 클래스':'');}
function benefits(s){const t=D.themes[s.theme];const result=['테마 맞춤 객실 향·소리·조도',t.experience+' · '+experienceScope(s),t.gift+' · 객실당 1세트','오행 맞춤 리추얼 카드','시티 애슬레틱 클럽 실내 수영장·피트니스 이용 포함'];if(s.room==='executive'){if(s.theme!=='shine')result.push('시티 애슬레틱 클럽 사우나 2인');result.push('클럽 라운지 조식 2인',t.tea+' · 2인분 1회');}return result;}
function isReady(s){return s.roomSelected&&s.checkin>=today()&&s.checkout===addDays(s.checkin,1)&&(s.theme==='shine'||(s.theme==='flow'?['15:00','16:30']:['16:30','17:00']).includes(s.slot));}
function rate(s){return D.prices[s.theme][s.room];}
const API={defaults,clean,load,save,reset,localISO,addDays,today,money,dateLabel,roomName,experienceScope,benefits,isReady,rate,key};root.Stay=API;if(typeof module!=='undefined')module.exports=API;
})(typeof window==='undefined'?globalThis:window);
