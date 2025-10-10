document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("repairForm");
  const input = document.getElementById("repairInput");
  const list = document.getElementById("repairList");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Create new list item
    const li = document.createElement("li");
    li.textContent = input.value;

    // Add it to the list
    list.appendChild(li);

    // Clear input
    input.value = "";
  });
});
