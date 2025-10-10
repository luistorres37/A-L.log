// A&L Log - minimal, mobile friendly

// Utilities -----------------------------
const $ = id => document.getElementById(id);
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const load = (k, d) => JSON.parse(localStorage.getItem(k) || JSON.stringify(d));

// State --------------------------------
let jobs = load('jobs', []);
let inventory = load('inventory', []);

// TABS ---------------------------------
const tabs = {
  jobs:       $('jobsSection'),
  inventory:  $('inventorySection'),
  import:     $('importSection'),
};

function showTab(name) {
  tabs.jobs.hidden = name !== 'jobs';
  tabs.inventory.hidden = name !== 'inventory';
  tabs.import.hidden = name !== 'import';

  // active pill
  document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
  if (name === 'jobs')       $('jobsTab').classList.add('active');
  if (name === 'inventory')  $('inventoryTab').classList.add('active');
  if (name === 'import')     $('importTab').classList.add('active');
}

// JOBS ---------------------------------
function addJob() {
  const lot    = $('lotInput').value.trim();
  const addr   = $('addressInput').value.trim();
  const task   = $('taskInput').value.trim();
  const date   = $('dateInput').value || '';
  const status = $('statusSelect').value;

  if (!lot && !addr && !task) return;

  jobs.push({ lot, addr, task, date, status });
  save('jobs', jobs);
  renderJobs(currentJobFilter);
  // clear text inputs (keep status)
  $('lotInput').value = '';
  $('addressInput').value = '';
  $('taskInput').value = '';
  $('dateInput').value = '';
}

let currentJobFilter = 'all'; // 'all' | 'To-do' | 'Done'

function renderJobs(filter = 'all') {
  currentJobFilter = filter;
  const tbody = $('jobsBody');
  tbody.innerHTML = '';

  const data = filter === 'all' ? jobs : jobs.filter(j => j.status === filter);

  data.forEach(j => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${j.lot || ''}</td>
      <td>${j.addr || ''}</td>
      <td>${j.task || ''}</td>
      <td>${j.date || ''}</td>
      <td>${j.status}</td>
    `;
    tbody.appendChild(tr);
  });
}

// INVENTORY -----------------------------
let invFilter = 'All';

function addOrUpdateItem() {
  const type = $('invType').value;
  const name = $('invName').value.trim();
  const qty  = parseInt($('invQty').value || '0', 10);
  const loc  = $('invLoc').value.trim();

  if (!name) return;

  const idx = inventory.findIndex(i => i.type === type && i.name.toLowerCase() === name.toLowerCase());
  if (idx >= 0) {
    inventory[idx].qty = qty;
    inventory[idx].loc = loc;
  } else {
    inventory.push({ type, name, qty, loc });
  }
  save('inventory', inventory);
  renderInventory(invFilter);

  $('invName').value = '';
  $('invQty').value = '';
  $('invLoc').value = '';
}

function renderInventory(filter = 'All') {
  invFilter = filter;
  const tbody = $('invBody');
  tbody.innerHTML = '';

  const data = filter === 'All' ? inventory : inventory.filter(i => i.type === filter);

  data.forEach(i => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i.type}</td>
      <td>${i.name}</td>
      <td>${i.qty}</td>
      <td>${i.loc || ''}</td>
    `;
    tbody.appendChild(tr);
  });
}

// EXPORT / IMPORT -----------------------
$('importFile')?.addEventListener('change', e => {
  $('fileName').textContent = e.target.files[0]?.name || 'no file selected';
});

function doExport() {
  const blob = new Blob([ JSON.stringify({ jobs, inventory }, null, 2) ], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'al-log-data.json';
  a.click();
  URL.revokeObjectURL(url);
}

async function doImport() {
  const f = $('importFile').files[0];
  if (!f) return;
  const text = await f.text();
  const data = JSON.parse(text || '{}');
  jobs = data.jobs || [];
  inventory = data.inventory || [];
  save('jobs', jobs);
  save('inventory', inventory);
  renderJobs('all');
  renderInventory('All');
  showTab('jobs');
}

// WIRE UP (runs after HTML loads) -------
document.addEventListener('DOMContentLoaded', () => {
  // tabs
  $('jobsTab').addEventListener('click', () => showTab('jobs'));
  $('inventoryTab').addEventListener('click', () => showTab('inventory'));
  $('importTab').addEventListener('click', () => showTab('import'));

  // jobs
  $('addJobBtn').addEventListener('click', addJob);
  $('filterAllBtn').addEventListener('click', () => renderJobs('all'));
  $('filterTodoBtn').addEventListener('click', () => renderJobs('To-do'));
  $('filterDoneBtn').addEventListener('click', () => renderJobs('Done'));

  // inventory
  $('addInvBtn').addEventListener('click', addOrUpdateItem);
  document.querySelectorAll('#inventorySection [data-filter]').forEach(btn => {
    btn.addEventListener('click', () => renderInventory(btn.getAttribute('data-filter')));
  });

  // export/import
  $('exportBtn').addEventListener('click', doExport);
  $('importBtn').addEventListener('click', doImport);

  // first render
  renderJobs('all');
  renderInventory('All');
  showTab('jobs');
});
