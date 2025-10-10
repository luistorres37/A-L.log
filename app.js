document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("repairForm");
  const input = document.getElementById("repairInput");
  const list = document.getElementById("repairList");

  // Load saved repairs from localStorage
  const savedRepairs = JSON.parse(localStorage.getItem("repairs")) || [];
  savedRepairs.forEach((repair) => {
    addRepairToList(repair);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const repairText = input.value;

    if (repairText.trim() === "") return;

    // Add to page
    addRepairToList(repairText);

    // Save to localStorage
    savedRepairs.push(repairText);
    localStorage.setItem("repairs", JSON.stringify(savedRepairs));

    // Clear input
    input.value = "";
  });

  function addRepairToList(text) {
    const li = document.createElement("li");
    li.textContent = text;
    list.appendChild(li);
  }
});
