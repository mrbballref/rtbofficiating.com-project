
(async()=>{
 const API_BASE='https://refzone-university-service.onrender.com';
 const q=new URLSearchParams(location.search),preview=q.get('preview')==='1',sessionId=q.get('session_id');
 const title=document.getElementById('returnTitle'),message=document.getElementById('returnMessage'),mark=document.getElementById('returnMark'),details=document.getElementById('returnDetails'),button=document.getElementById('returnButton');
 const show=(ok,data={})=>{mark.textContent=ok?'✓':'!';title.textContent=ok?'Membership registration confirmed':'Registration needs attention';message.textContent=ok?'Your membership record is ready. Continue to the student dashboard to begin orientation.':(data.error||'The payment could not be confirmed. Return to registration or contact RefZone University support after support channels are configured.');if(ok){details.hidden=false;details.innerHTML=`<div><span>Membership</span><strong>${data.planName||'RefZone Preview'}</strong></div><div><span>Status</span><strong>${data.status||'Active'}</strong></div><div><span>Track</span><strong>${data.trackName||'Selected track'}</strong></div><div><span>Pathway</span><strong>${data.pathwayName||'Selected pathway'}</strong></div>`;button.hidden=false}};
 if(preview){const enrollment=JSON.parse(localStorage.getItem('rz:enrollment')||'{}');show(true,{planName:'RefZone Preview',status:'Active',trackName:enrollment.track,pathwayName:enrollment.pathway});return}
 if(!sessionId){show(false,{error:'No Stripe Checkout Session ID was returned.'});return}
 try{const response=await fetch(`${API_BASE}/api/session-status?session_id=${encodeURIComponent(sessionId)}`);const data=await response.json();if(!response.ok)throw new Error(data.error||'Unable to confirm payment.');if(data.paymentStatus==='paid'||data.status==='complete'){
   localStorage.setItem('rz:enrollment',JSON.stringify({plan:data.plan,track:data.track,pathway:data.pathway,email:data.email,registrationId:data.registrationId,customerId:data.customerId,subscriptionId:data.subscriptionId,createdAt:Date.now()}));show(true,data)
 }else show(false,{error:'Payment has not completed. The secure gateway may still be processing the selected payment method.'})}catch(error){show(false,{error:error.message})}
})();
