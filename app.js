// app.js
// Simple starting point to track repairs & inventory

let repairs = [];
let inventory = [];

// Add a repair
function addRepair(description) {
    const repair = {
        id: repairs.length + 1,
        description: description,
        date: new Date().toLocaleString()
    };
    repairs.push(repair);
    console.log("Repair added:", repair);
}

// Add an inventory item
function addInventory(itemName, qty) {
    const item = {
        id: inventory.length + 1,
        name: itemName,
        quantity: qty
    };
    inventory.push(item);
    console.log("Inventory updated:", item);
}

// Example starter data
addRepair("Fixed broken tile");
addInventory("Thinset bags", 10);

// Display current data
console.log("All Repairs:", repairs);
console.log("All Inventory:", inventory);
