'use strict';
(function(root){
function analyze(value){
const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value||'');if(!match)throw Error('생년월일을 정확히 입력해 주세요.');
const [y,m,d]=match.slice(1).map(Number),date=new Date(Date.UTC(y,m-1,d));
if(y<1900||y>2099||date.getUTCFullYear()!==y||date.getUTCMonth()!==m-1||date.getUTCDate()!==d)throw Error('1900년 이후의 올바른 양력 생년월일을 입력해 주세요.');
const lib=root.Solar?root:(typeof require==='function'?require('./vendor/lunar.js'):null);if(!lib?.Solar)throw Error('추천 계산을 불러오지 못했습니다. 직접 선택으로 진행해 주세요.');
// The library's solar-term clock is UTC+8. Korea is UTC+9.
// Use Korea noon (11:00 UTC+8), omit time pillar entirely.
const mid=lib.Solar.fromYmdHms(y,m,d,11,0,0).getLunar().getEightChar();mid.setSect(2);
const prev=new Date(Date.UTC(y,m-1,d-1));const start=lib.Solar.fromYmdHms(prev.getUTCFullYear(),prev.getUTCMonth()+1,prev.getUTCDate(),23,0,0).getLunar().getEightChar();
const end=lib.Solar.fromYmdHms(y,m,d,22,59,59).getLunar().getEightChar();
const boundary=start.getYear()!==end.getYear()||start.getMonth()!==end.getMonth();
const pillars=[{label:'연주',text:mid.getYear(),elements:mid.getYearWuXing()},{label:'월주',text:mid.getMonth(),elements:mid.getMonthWuXing()},{label:'일주',text:mid.getDay(),elements:mid.getDayWuXing()}];
const counts={'木':0,'火':0,'土':0,'金':0,'水':0};for(const p of pillars)for(const e of p.elements)counts[e]++;
const min=Math.min(...Object.values(counts));const mapping={flow:'水',grow:'木',shine:'火'};
const recommended=boundary?[]:Object.keys(mapping).filter(k=>counts[mapping[k]]===min);
return {pillars,counts,recommended,boundary};
}
root.ElementAnalysis={analyze};if(typeof module!=='undefined')module.exports={analyze};
})(typeof window==='undefined'?globalThis:window);
