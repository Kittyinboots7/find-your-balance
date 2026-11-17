'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
for(const name of fs.readdirSync(root).filter(name=>name.endsWith('.html'))){
 const html=fs.readFileSync(path.join(root,name),'utf8');
 for(const [,reference] of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
  if(/^(?:https?:|tel:|data:)/.test(reference))continue;
  const file=reference.split(/[?#]/)[0];if(file)assert.ok(fs.existsSync(path.join(root,file)),name+': missing '+file);
 }
}
const html=fs.readFileSync(path.join(root,'package.html'),'utf8');
const scripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(match=>match[1].split('?')[0]);
assert.ok(scripts.indexOf('vendor/lunar.js')>=0);
assert.ok(scripts.indexOf('vendor/lunar.js')<scripts.indexOf('element-analysis.js'));
const context=vm.createContext({});context.window=context;
for(const file of ['vendor/lunar.js','element-analysis.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
for(const [date,expected] of [['1990-01-25','flow'],['1990-06-15','grow'],['1991-04-15','shine']]){
 const result=context.ElementAnalysis.analyze(date);assert.equal(result.recommended.length,1);assert.equal(result.recommended[0],expected);assert.equal(Object.values(result.counts).reduce((sum,n)=>sum+n,0),6);
}
assert.equal(context.ElementAnalysis.analyze('1990-01-15').recommended.length,2);
assert.equal(context.ElementAnalysis.analyze('1980-03-04').recommended.length,3);
assert.throws(()=>context.ElementAnalysis.analyze('2000-02-30'));
console.log('PASS: deployed HTML assets, browser calendar dependency, 3 themes, 2/3-way ties and date validation.');
