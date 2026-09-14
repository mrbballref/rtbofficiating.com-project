(() => {
  const cart = [];
  const drawer = document.querySelector('[data-cart-drawer]');
  const backdrop = document.querySelector('[data-cart-backdrop]');
  const count = document.querySelector('[data-cart-count]');
  const items = document.querySelector('[data-cart-items]');
  const total = document.querySelector('[data-cart-total]');
  const render = () => {
    if (count) count.textContent = String(cart.length);
    if (items) items.innerHTML = cart.length ? cart.map(x => `<p>${x} <span>$64.99</span></p>`).join('') : '<p>Your cart is empty.</p>';
    if (total) total.textContent = `$${(cart.length * 64.99).toFixed(2)}`;
  };
  const open = () => { if (!drawer) return; drawer.setAttribute('aria-hidden','false'); drawer.classList.add('open'); backdrop?.classList.add('open'); };
  const close = () => { drawer?.setAttribute('aria-hidden','true'); drawer?.classList.remove('open'); backdrop?.classList.remove('open'); };
  document.querySelectorAll('[data-add-cart]').forEach(b => b.addEventListener('click', () => { cart.push(b.dataset.addCart); render(); open(); }));
  document.querySelector('[data-product-add]')?.addEventListener('click', () => { cart.push('RTBO Premium Referee Quarter-Zip'); render(); open(); });
  document.querySelector('[data-cart-open]')?.addEventListener('click', open);
  document.querySelector('[data-cart-close]')?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  document.querySelectorAll('.product-sizes button,.product-swatches button').forEach(b => b.addEventListener('click', () => { b.parentElement.querySelectorAll('button').forEach(x => x.classList.remove('active')); b.classList.add('active'); }));
  document.querySelectorAll('.shop-search').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); document.querySelector('#products')?.scrollIntoView({behavior:'smooth'}); }));
})();
  document.querySelectorAll('.cart-item').forEach(item => {
    const out = item.querySelector('output');
    const price = Number(item.dataset.price || 0);
    const refreshLine = () => { const q = Number(out.textContent || 1); item.querySelector('.cart-price').textContent = `$${(price*q).toFixed(2)}`; refreshCartPage(); };
    item.querySelector('[data-minus]')?.addEventListener('click', () => { out.textContent = String(Math.max(1, Number(out.textContent)-1)); refreshLine(); });
    item.querySelector('[data-plus]')?.addEventListener('click', () => { out.textContent = String(Number(out.textContent)+1); refreshLine(); });
    item.querySelector('[data-remove]')?.addEventListener('click', () => { item.remove(); refreshCartPage(); });
  });
  function refreshCartPage(){
    const rows=[...document.querySelectorAll('.cart-item')];
    if(!rows.length) return;
    let count=0, subtotal=0;
    rows.forEach(r=>{ const q=Number(r.querySelector('output')?.textContent||1); count+=q; subtotal+=Number(r.dataset.price||0)*q; });
    const tax=subtotal*.075, total=subtotal+tax;
    document.querySelector('[data-summary-count]')?.replaceChildren(document.createTextNode(String(count)));
    document.querySelector('[data-cart-page-count]')?.replaceChildren(document.createTextNode(String(count)));
    const title=document.querySelector('#cart-title span'); if(title) title.textContent=`(${count} items)`;
    const sub=document.querySelector('[data-subtotal]'); if(sub) sub.textContent=`$${subtotal.toFixed(2)}`;
    const tx=document.querySelector('[data-tax]'); if(tx) tx.textContent=`$${tax.toFixed(2)}`;
    const ttl=document.querySelector('[data-total]'); if(ttl) ttl.textContent=`$${total.toFixed(2)}`;
  }
