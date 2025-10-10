// Save & show repairs using localStorage
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("repairForm");
  const input = document.getElementById("repairInput");
  const list  = document.getElementById("repairList");

  // --- load existing ---
  let repairs = JSON.parse(localStorage.getItem("repairs") || "[]");
  repairs.forEach(addLi);

  // --- add new ---
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    const item = { id: Date.now(), text };
    repairs.unshift(item);
    save(); addLi(item);
    input.value = "";
  });

  // --- helpers ---
  function addLi(item) {
    // skip if already rendered (for fast reloads)
    if ([...list.children].some(li => li.dataset.id === String(item.id))) return;

    const li = document.createElement("li");
    li.dataset.id = item.id;
    li.style.margin = "6px 0";

    const span = document.createElement("span");
    span.textContent = item.text;

    const del = document.createElement("button");
    del.textContent = "Delete";
    del.style.marginLeft = "10px";

    del.onclick = () => {
      repairs = repairs.filter(r => r.id !== item.id);
      save(); li.remove();
    };

    li.append(span, del);
    list.prepend(li);
  }

  function save() {
    localStorage.setItem("repairs", JSON.stringify(repairs));
  }
});
