
const CuttingDB=(()=>{
 const DB='rtboCuttingRoom.v1', VERSION=1;
 const STORES=['films','markers','clips','evaluations','comments','packets','activity','settings'];
 function open(){return new Promise((res,rej)=>{const q=indexedDB.open(DB,VERSION);q.onupgradeneeded=()=>{const db=q.result;STORES.forEach(s=>{if(!db.objectStoreNames.contains(s))db.createObjectStore(s,{keyPath:'id'})})};q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})}
 async function tx(store,mode,fn){const db=await open();return new Promise((res,rej)=>{const t=db.transaction(store,mode),s=t.objectStore(store);let out;try{out=fn(s)}catch(e){rej(e);return}t.oncomplete=()=>res(out?.result!==undefined?out.result:out);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)})}
 const id=(p='cr')=>`${p}-${Date.now().toString(36)}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`;
 async function all(store){const db=await open();return new Promise((res,rej)=>{const q=db.transaction(store).objectStore(store).getAll();q.onsuccess=()=>res(q.result||[]);q.onerror=()=>rej(q.error)})}
 async function get(store,key){const db=await open();return new Promise((res,rej)=>{const q=db.transaction(store).objectStore(store).get(key);q.onsuccess=()=>res(q.result||null);q.onerror=()=>rej(q.error)})}
 async function put(store,val){return tx(store,'readwrite',s=>s.put(val))}
 async function del(store,key){return tx(store,'readwrite',s=>s.delete(key))}
 async function clear(store){return tx(store,'readwrite',s=>s.clear())}
 async function log(action,detail=''){return put('activity',{id:id('act'),at:new Date().toISOString(),action,detail})}
 async function exportAll(){const data={version:1,exportedAt:new Date().toISOString(),stores:{}};for(const s of STORES)data.stores[s]=await all(s);return data}
 async function importAll(data,replace=false){if(!data||!data.stores)throw new Error('Invalid Cutting Room backup');for(const s of STORES){if(replace)await clear(s);for(const row of (data.stores[s]||[]))await put(s,row)}return true}
 async function estimate(){return navigator.storage?.estimate?await navigator.storage.estimate():{usage:0,quota:0}}
 return {open,all,get,put,del,clear,id,log,exportAll,importAll,estimate,STORES}
})();
