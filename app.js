document.addEventListener("DOMContentLoaded", () => {
  const STORE_KEY = "al-log-v1";
  const $ = (s)=>document.querySelector(s);

  let state = load() || { jobs: [], inventory: [] };
  save(); // ensure key exists

  function load(){ try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; } }
  function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }

  // ----- tabs -----
  document.querySelectorAll("nav button").forEach(b=>{
    b.addEventListener("click", () => {
      document.querySelectorAll("nav button").forEach(x=>x.classList.remove("active"));
      b.classList.add("active");
      ["jobs","inventory","backup"].forEach(id=>{
        document.getElementById(id).style.display = (b.dataset.tab===id)? "":"none";
      });
    });
  });

  // ===== JOBS =====
  const jobsT = $("#jobsTable");
  $("#jobForm").addEventListener("submit",(e)=>{
    e.preventDefault();
    const job = {
      id: Date.now(),
      lot: $("#jobLot").value.trim(),
      addr: $("#jobAddr").value.trim(),
      task: $("#jobTask").value.trim(),
      date: $("#jobDate").value,
      status: $("#jobStatus").value // todo | done
    };
    if(!job.lot) return;
    state.jobs.unshift(job); save(); e.target.reset(); renderJobs(activeJobFilter());
  });

  document.querySelectorAll('[data-filter]').forEach(btn=>{
    btn.addEventListener("click",()=>{
      document.querySelectorAll('[data-filter]').forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      renderJobs(btn.dataset.filter);
    });
  });

  function activeJobFilter(){ return document.querySelector('[data-filter].active')?.dataset.filter || "all"; }

  function renderJobs(filter="all"){
    jobsT.innerHTML="";
    const list = state.jobs.filter(j=> filter==="all" ? true : j.status===filter);
    list.forEach(j=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${j.lot}</td>
        <td>${j.addr||""}</td>
        <td>${j.task||""}</td>
        <td>${j.date||""}</td>
        <td>${j.status==="done"?"✅ Done":"⏳ To-do"}</td>
        <td class="actions">
          <button data-id="${j.id}" data-act="toggle">${j.status==="done"?"Mark To-do":"Mark Done"}</button>
          <button data-id="${j.id}" data-act="del">Delete</button>
        </td>`;
      jobsT.appendChild(tr);
    });
  }

  // event delegation for job buttons
  jobsT.addEventListener("click",(e)=>{
    const btn = e.target.closest("button[data-act]");
    if(!btn) return;
    const id = btn.dataset.id;
    const act = btn.dataset.act;
    if(act==="toggle"){
      const j = state.jobs.find(x=> String(x.id)===id);
      j.status = j.status==="done" ? "todo" : "done";
    } else if (act==="del"){
      state.jobs = state.jobs.filter(x=> String(x.id)!==id);
    }
    save(); renderJobs(activeJobFilter());
  });

  // ===== INVENTORY =====
  const invT  = $("#invTable");
  $("#invForm").addEventListener("submit",(e)=>{
    e.preventDefault();
    const item = {
      id: Date.now(),
      type: $("#invType").value,
      name: $("#invName").value.trim(),
      qty: parseInt($("#invQty").value || "0",10),
      loc: $("#invLoc").value.trim()
    };
    if(!item.name) return;
    const existing = state.inventory.find(i=>i.type===item.type && i.name.toLowerCase()===item.name.toLowerCase());
    if (existing){ existing.qty = item.qty; existing.loc = item.loc; }
    else { state.inventory.unshift(item); }
    save(); e.target.reset(); renderInv(activeInvFilter());
  });

  document.querySelectorAll('[data-itype]').forEach(btn=>{
    btn.addEventListener("click",()=>{
      document.querySelectorAll('[data-itype]').forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      renderInv(btn.dataset.itype);
    });
  });

  function activeInvFilter(){ return document.querySelector('[data-itype].active')?.dataset.itype || "all"; }

  function renderInv(filter="all"){
    invT.innerHTML="";
    const list = state.inventory.filter(i=> filter==="all" ? true : i.type===filter);
    list.forEach(i=>{
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${cap(i.type)}</td>
        <td>${i.name}</td>
        <td>${i.qty}</td>
        <td>${i.loc||""}</td>
        <td class="actions">
          <button data-id="${i.id}" data-act="plus">+1</button>
          <button data-id="${i.id}" data-act="minus">-1</button>
          <button data-id="${i.id}" data-act="idel">Delete</button>
        </td>`;
      invT.appendChild(tr);
    });
  }

  invT.addEventListener("click",(e)=>{
    const btn = e.target.closest("button[data-act]");
    if(!btn) return;
    const id = btn.dataset.id;
    const act = btn.dataset.act;
    const it = state.inventory.find(x=> String(x.id)===id);
    if(!it) return;
    if(act==="plus") it.qty++;
    if(act==="minus") it.qty = Math.max(0, it.qty-1);
    if(act==="idel") state.inventory = state.inventory.filter(x=> String(x.id)!==id);
    save(); renderInv(activeInvFilter());
  });

  function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

  // ===== BACKUP =====
  $("#exportBtn").addEventListener("click",()=>{
    const blob = new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href=url; a.download="al-log-export.json"; a.click(); URL.revokeObjectURL(url);
  });
  $("#importBtn").addEventListener("click",()=>{
    const f = $("#importFile").files[0]; if(!f) return alert("Choose a .json file");
    const r = new FileReader();
    r.onload=()=>{ state = JSON.parse(r.result); save(); renderJobs(activeJobFilter()); renderInv(activeInvFilter()); alert("Imported!"); };
    r.readAsText(f);
  });

  // initial render
  renderJobs(); renderInv();
});
