(() => {
  // Tabs
  document.querySelectorAll("[data-tabs]").forEach(group => {
    const buttons=[...group.querySelectorAll("[data-tab]")], panels=[...group.querySelectorAll("[data-panel]")];
    buttons.forEach(btn=>btn.addEventListener("click",()=>{
      const id=btn.dataset.tab;
      buttons.forEach(b=>b.classList.toggle("is-active",b===btn));
      panels.forEach(p=>p.hidden=p.dataset.panel!==id);
    }));
  });

  // Local front-end forms: validate and clearly disclose integration state rather than pretending to submit.
  document.querySelectorAll("form[data-integration-form]").forEach(form=>{
    form.addEventListener("submit",e=>{
      e.preventDefault();
      const status=form.querySelector(".form-status");
      if(!form.reportValidity()) return;
      if(status){
        status.textContent="Form validated. The production integration endpoint is not configured in this frontend package, so no information has been transmitted.";
        status.setAttribute("role","status");
      }
    });
  });

  // Functional local page-directory search.
  const searchInput=document.querySelector("[data-platform-search]");
  const results=document.querySelector("[data-search-results]");
  if(searchInput && results){
    const index=JSON.parse(results.dataset.index || "[]");
    const render=q=>{
      const term=q.trim().toLowerCase();
      const filtered=term ? index.filter(x=>(x.title+" "+x.summary+" "+x.tags).toLowerCase().includes(term)) : index;
      results.innerHTML=filtered.length ? filtered.map(x=>`<a href="${x.href}"><strong>${x.title}</strong><span>${x.summary}</span></a>`).join("") : `<div class="empty"><div><div class="empty__icon">⌕</div><h3>No matching platform pages</h3><p>Try a broader search term. Published media results will appear here when real content is available.</p></div></div>`;
    };
    searchInput.addEventListener("input",()=>render(searchInput.value));
    render("");
  }

  // FAQ accordions
  document.querySelectorAll("[data-accordion-button]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const panel=document.getElementById(btn.getAttribute("aria-controls"));
      const open=btn.getAttribute("aria-expanded")==="true";
      btn.setAttribute("aria-expanded",String(!open));
      if(panel) panel.hidden=open;
    });
  });
})();

// Production-network section presence effect.
(() => {
  if (!document.body.classList.contains("tls-production-page")) return;
  const sections = [...document.querySelectorAll(".section, .tls-membership-section, .tls-checkout")];
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    sections.forEach(s => s.classList.add("is-network-visible"));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("is-network-visible");
    });
  }, {threshold:.08});
  sections.forEach(s => observer.observe(s));
})();

// Unique-page local control states (visual only; no fabricated content).
(() => {
  document.querySelectorAll(".u-event-types, .u-channel-column, .u-analysis-tabs, .u-ad-inventory>aside, .u-support-categories, .u-search-facets").forEach(group => {
    group.querySelectorAll("button").forEach(button => {
      button.addEventListener("click", () => {
        group.querySelectorAll("button").forEach(b => b.classList.remove("is-active"));
        button.classList.add("is-active");
      });
    });
  });
})();
