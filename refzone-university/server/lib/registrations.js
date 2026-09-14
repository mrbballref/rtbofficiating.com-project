const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');
const file=path.join(__dirname,'..','data','registrations.json');
function read(){try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch{return []}}
function write(records){fs.mkdirSync(path.dirname(file),{recursive:true});const temporary=file+'.tmp';fs.writeFileSync(temporary,JSON.stringify(records,null,2),{mode:0o600});fs.renameSync(temporary,file)}
function create(data){const records=read();const record={id:crypto.randomUUID(),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),status:'pending',...data};records.push(record);write(records);return record}
function update(id,changes){const records=read();const index=records.findIndex(item=>item.id===id);if(index<0)return null;records[index]={...records[index],...changes,updatedAt:new Date().toISOString()};write(records);return records[index]}
function find(id){return read().find(item=>item.id===id)||null}
module.exports={create,update,find};