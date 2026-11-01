'use strict';
const frame=document.querySelector('#game'),start=document.querySelector('#start'),fire=document.querySelector('#fire'),statusEl=document.querySelector('#status');
const sources=new Map(),pointers=new Map();let ready=false;
function vm(){return frame.contentWindow.vm;}
function audio(){vm()?.runtime.audioEngine?.audioContext?.resume().catch(()=>{});}
function setKey(key,source,down){if(!ready)return;let s=sources.get(key);if(!s)sources.set(key,s=new Set());const before=s.size>0;if(down)s.add(source);else s.delete(source);if(before!==(s.size>0))vm().postIOData('keyboard',{key,isDown:s.size>0});}
function pulse(key){if(!ready)return;audio();vm().postIOData('keyboard',{key,isDown:true});vm().postIOData('keyboard',{key,isDown:false});}
function releaseAll(){for(const [key,s]of sources){if(s.size&&ready)vm().postIOData('keyboard',{key,isDown:false});s.clear();}pointers.clear();document.querySelectorAll('.held').forEach(b=>b.classList.remove('held'));}
document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();if(!ready)return;audio();b.setPointerCapture(e.pointerId);pointers.set(e.pointerId,b);setKey(b.dataset.key,e.pointerId,true);b.classList.add('held');});const up=e=>{if(pointers.get(e.pointerId)!==b)return;setKey(b.dataset.key,e.pointerId,false);pointers.delete(e.pointerId);if(![...pointers.values()].includes(b))b.classList.remove('held');};for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,up);});
// click fires once per completed tap, with no long-press repetition.
fire.addEventListener('click',()=>pulse(' '));start.addEventListener('click',()=>pulse('s'));
function keyboard(e,down){const key=e.key.toLowerCase()==='s'?'s':e.key;if(!['ArrowLeft','ArrowRight',' ','s'].includes(key))return;e.preventDefault();if(down){if(e.repeat)return;audio();}setKey(key,'physical',down);}
for(const w of [window,frame.contentWindow]){w.addEventListener('keydown',e=>keyboard(e,true),true);w.addEventListener('keyup',e=>keyboard(e,false),true);}
// Replace the embedded default keyboard listeners: one shared state prevents duplicate hats.
frame.addEventListener('load',()=>{const w=frame.contentWindow;w.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight',' ','s','S'].includes(e.key)){e.stopImmediatePropagation();keyboard(e,true);}},true);w.addEventListener('keyup',e=>{if(['ArrowLeft','ArrowRight',' ','s','S'].includes(e.key)){e.stopImmediatePropagation();keyboard(e,false);}},true);});
window.addEventListener('blur',releaseAll);document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseAll();});window.addEventListener('pagehide',releaseAll);window.addEventListener('contextmenu',e=>{if(e.target.closest('button'))e.preventDefault();});
document.querySelector('#reset').addEventListener('click',()=>{releaseAll();location.reload();});
const timer=setInterval(()=>{if(frame.contentWindow.gameReady&&vm()?.runtime.targets.length){ready=true;start.disabled=fire.disabled=false;clearInterval(timer);if(!statusEl.textContent.includes('オフライン準備完了'))statusEl.textContent=location.protocol==='file:'?'STARTで開始できます（PC直接起動）':'STARTで開始できます';}},100);
if(location.protocol==='file:'){statusEl.textContent='PCでの直接起動モードです';}else if('serviceWorker'in navigator){navigator.serviceWorker.register('./sw.js').then(async r=>{await navigator.serviceWorker.ready;const check=()=>{const worker=r.active;if(worker)worker.postMessage('CHECK_READY');};navigator.serviceWorker.addEventListener('message',e=>{if(e.data==='OFFLINE_READY')statusEl.textContent='オフライン準備完了 ✓';});check();navigator.serviceWorker.addEventListener('controllerchange',check);}).catch(()=>{statusEl.textContent='オフライン保存に失敗しました。通信環境を確認して再読み込みしてください。';});}else{statusEl.textContent='HTTPSで公開するとオフライン保存が使えます。';}

