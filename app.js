// A&L Log - jobs + inventory (localStorage)
const STORE_KEY = "al-log-v1";
let state = load() || { jobs: [], inventory: [] };

function load(){ try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; } }
function save(){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }

const $ = (s)=>document.querySelector(s);
const jobsT = $("#jobsTable");
const invT  = $("#invTable");

// ----- tabs -----
document.querySelectorAll("nav button").forEach(b=>{
  b.onclick = ()=>{
    document.querySelectorAll("nav button").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    ["jobs","inventory","backup"].forEach(id=>{
      document.getElementById(id).style.display = (b.dataset.tab===id)? "":"none";
    });
  };
});

// ===== JOBS =====
renderJobs();

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
  state.jobs.unshift(job); save(); e.target.reset(); renderJobs();
});

// filter buttons
document.querySelectorAll('[data-filter]').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('[data-filter]').forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    renderJobs(btn.dataset.filter);
  };
});

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
        <button data-id="${j.id}" class="toggle">${j.status==="done"?"Mark To-do":"Mark Done"}</button>
        <button data-id="${j.id}" class="del">Delete</button>
      </td>`;
    jobsT.appendChild(tr);
  });

  // actions
  jobsT.querySelectorAll(".toggle").forEach(b=>{
    b.onclick=()=>{
      const j = state.jobs.find(x=>x.id==b.dataset.id);
      j.status = j.status==="done" ? "todo" : "done";
      save(); renderJobs(document.querySelector('[data-filter].active').dataset.filter);
    };
  });
  jobsT.querySelectorAll(".del").forEach(b=>{
    b.onclick=()=>{
      state.jobs = state.jobs.filter(x=>x.id!=b.dataset.id);
      save(); renderJobs(document.querySelector('[data-filter].active').dataset.filter);
    };
  });
}

// ===== INVENTORY =====
renderInv();

$("#invForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  const item = {
    id: Date.now(),
    type: $("#invType").value,          // caulk | grout | other
    name: $("#invName").value.trim(),   // color / name
    qty: parseInt($("#invQty").value || "0",10),
    loc: $("#invLoc").value.trim()
  };
  if(!item.name) return;

  // merge by type+name
  const existing = state.inventory.find(i=>i.type===item.type && i.name.toLowerCase()===item.name.toLowerCase());
  if (existing){ existing.qty = item.qty; existing.loc = item.loc; }
  else { state.inventory.unshift(item); }

  save(); e.target.reset(); renderInv();
});

// inventory filters
document.querySelectorAll('[data-itype]').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('[data-itype]').forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    renderInv(btn.dataset.itype);
  };
});

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
        <button class="plus"  data-id="${i.id}">+1</button>
        <button class="minus" data-id="${i.id}">-1</button>
        <button class="del"   data-id="${i.id}">Delete</button>
      </td>`;
    invT.appendChild(tr);
  });

  // actions
  invT.querySelectorAll(".plus").forEach(b=>{
    b.onclick=()=>{ const it = findInv(b.dataset.id); it.qty++; save(); renderInv(filter); };
  });
  invT.querySelectorAll(".minus").forEach(b=>{
    b.onclick=()=>{ const it = findInv(b.dataset.id); it.qty=Math.max(0,it.qty-1); save(); renderInv(filter); };
  });
  invT.querySelectorAll(".del").forEach(b=>{
    b.onclick=()=>{ state.inventory = state.inventory.filter(x=>x.id!=b.dataset.id); save(); renderInv(filter); };
  });
}

function findInv(id){ return state.inventory.find(x=>x.id==id); }
function cap(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

// ===== BACKUP =====
$("#exportBtn").onclick=()=>{
  const blob = new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href=url; a.download="al-log-export.json"; a.click(); URL.revokeObjectURL(url);
};
$("#importBtn").onclick=()=>{
  const f = $("#importFile").files[0]; if(!f) return alert("Choose a .json file");
  const r = new FileReader();
  r.onload=()=>{ state = JSON.parse(r.result); save(); renderJobs(); renderInv(); alert("Imported!"); };
  r.readAsText(f);
};
