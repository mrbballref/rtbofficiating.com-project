(() => {
"use strict";
const KEY="rtbo.masterCms.v1",MEDIA_DB="rtbo.masterCms.media.v1",MEDIA_STORE="media";
const defaults=()=>({version:1,drafts:{},published:{},global:{cssVars:{},customCss:""},virtualPages:{},audit:[]});
function load(){try{return Object.assign(defaults(),JSON.parse(localStorage.getItem(KEY)||"null")||{});}catch{return defaults()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function ensurePage(bucket,path){bucket[path]||={elements:{},meta:{},insertions:[],customCss:"",disabled:false};bucket[path].elements||={};bucket[path].meta||={};bucket[path].insertions||=[];return bucket[path]}
function log(action,detail=""){const s=load();s.audit||=[];s.audit.unshift({id:crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`,at:new Date().toISOString(),action,detail});s.audit=s.audit.slice(0,500);save(s)}
function draftElement(path,selector,patch){const s=load(),p=ensurePage(s.drafts,path);p.elements[selector]={...(p.elements[selector]||{}),...patch};save(s);log("Draft element",`${path} · ${selector}`)}
function publishElement(path,selector){const s=load(),d=s.drafts?.[path]?.elements?.[selector];if(!d)return;const p=ensurePage(s.published,path);p.elements[selector]={...d};delete s.drafts[path].elements[selector];save(s);log("Publish element",`${path} · ${selector}`)}
function resetElement(path,selector){const s=load();if(s.drafts?.[path]?.elements)delete s.drafts[path].elements[selector];if(s.published?.[path]?.elements)delete s.published[path].elements[selector];save(s);log("Reset element",`${path} · ${selector}`)}
function savePageDraft(path,patch){const s=load(),p=ensurePage(s.drafts,path);Object.assign(p,patch);save(s);log("Draft page",path)}
function publishPage(path){const s=load(),d=s.drafts?.[path];if(!d)return;const p=ensurePage(s.published,path);s.published[path]={...p,...d,meta:{...(p.meta||{}),...(d.meta||{})},elements:{...(p.elements||{}),...(d.elements||{})},insertions:[...(p.insertions||[]),...(d.insertions||[])]};delete s.drafts[path];save(s);log("Publish page",path)}
function publishAll(){const s=load();Object.keys(s.drafts||{}).forEach(path=>{const p=ensurePage(s.published,path),d=s.drafts[path];s.published[path]={...p,...d,meta:{...(p.meta||{}),...(d.meta||{})},elements:{...(p.elements||{}),...(d.elements||{})},insertions:[...(p.insertions||[]),...(d.insertions||[])]}});s.drafts={};save(s);log("Publish all","All drafts published")}
function clearDrafts(){const s=load();s.drafts={};save(s);log("Clear drafts")}
function setGlobal(patch){const s=load();s.global={...(s.global||{}),...patch};save(s);log("Update global settings")}
function upsertVirtualPage(page){const s=load(),id=page.id||(crypto.randomUUID?.()||`page-${Date.now()}`);s.virtualPages[id]={...page,id,updatedAt:new Date().toISOString()};save(s);log(page.id?"Update virtual page":"Create virtual page",page.title||id);return id}
function deleteVirtualPage(id){const s=load();delete s.virtualPages[id];save(s);log("Delete virtual page",id)}
function openMediaDb(){return new Promise((res,rej)=>{const r=indexedDB.open(MEDIA_DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(MEDIA_STORE,{keyPath:"id"});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function putMedia(file){const dataUrl=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=()=>rej(r.error);r.readAsDataURL(file)});const rec={id:crypto.randomUUID?.()||`media-${Date.now()}`,name:file.name,type:file.type,size:file.size,dataUrl,createdAt:new Date().toISOString()};const db=await openMediaDb();await new Promise((res,rej)=>{const tx=db.transaction(MEDIA_STORE,"readwrite");tx.objectStore(MEDIA_STORE).put(rec);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});log("Upload CMS media",file.name);return rec}
async function listMedia(){const db=await openMediaDb();return await new Promise((res,rej)=>{const r=db.transaction(MEDIA_STORE).objectStore(MEDIA_STORE).getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error)})}
async function getMedia(id){const db=await openMediaDb();return await new Promise((res,rej)=>{const r=db.transaction(MEDIA_STORE).objectStore(MEDIA_STORE).get(id);r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error)})}
async function deleteMedia(id){const db=await openMediaDb();await new Promise((res,rej)=>{const tx=db.transaction(MEDIA_STORE,"readwrite");tx.objectStore(MEDIA_STORE).delete(id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});log("Delete CMS media",id)}
window.RTBOCMSStore={KEY,load,save,log,ensurePage,draftElement,publishElement,resetElement,savePageDraft,publishPage,publishAll,clearDrafts,setGlobal,upsertVirtualPage,deleteVirtualPage,putMedia,listMedia,getMedia,deleteMedia};
})();