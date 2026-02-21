const list = document.getElementById("todoList");
const inputField = document.getElementById("todoInput");

// Helper: close all open control panels
function closeAllControls() {
    document.querySelectorAll(".controls").forEach(function (c) {
        c.classList.remove("show-controls");
    });
}

// Create a new to-do item
function createTodoItem(taskText) {
    let li = document.createElement("li");
    li.classList.add("todo-item");

    // Checkbox
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", function () {
        li.classList.toggle("completed");
    });

    // Task text (visible normally)
    let span = document.createElement("span");
    span.classList.add("todo-text");
    span.innerText = taskText;

    // Drag handle (≡) – toggles the up/down/delete panel
    let drag = document.createElement("span");
    drag.classList.add("drag-handle");
    drag.innerHTML = "≡";
    drag.addEventListener("click", function (e) {
        e.stopPropagation();
        closeAllControls();
        controls.classList.toggle("show-controls");
    });

    // ✏️ Edit button – always visible
    let editBtn = document.createElement("span");
    editBtn.innerHTML = "✏️";
    editBtn.classList.add("edit-btn");
    editBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        enterEditMode(li, span, editBtn, drag);
    });

    // Double‑click on the task text also enters edit mode
    span.addEventListener("dblclick", function (e) {
        e.stopPropagation();
        enterEditMode(li, span, editBtn, drag);
    });

    // Hidden controls panel (up/down/delete)
    let controls = document.createElement("div");
    controls.classList.add("controls");

    let up = document.createElement("span");
    up.innerHTML = "⬆";
    up.addEventListener("click", function (e) {
        e.stopPropagation();
        let prev = li.previousElementSibling;
        if (prev) list.insertBefore(li, prev);
    });

    let down = document.createElement("span");
    down.innerHTML = "⬇";
    down.addEventListener("click", function (e) {
        e.stopPropagation();
        let next = li.nextElementSibling;
        if (next) list.insertBefore(next, li);
    });

    let del = document.createElement("span");
    del.innerHTML = "❌";
    // ❌ Delete with confirmation
del.addEventListener("click", function (e) {
    e.stopPropagation();
    const confirmDelete = confirm("Are you sure you want to delete this task?");
    if (confirmDelete) {
        li.remove();
    }
});

    controls.appendChild(up);
    controls.appendChild(down);
    controls.appendChild(del);

    // Assemble the item
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(drag);
    li.appendChild(editBtn);
    li.appendChild(controls);

    return li;
}

// Switch a task into edit mode
function enterEditMode(li, span, editBtn, drag) {
    // Hide the static text and the action buttons
    span.style.display = 'none';
    editBtn.style.display = 'none';
    drag.style.display = 'none';

    // Get the checkbox (first child) to insert after it
    let checkbox = li.querySelector('input[type="checkbox"]');

    // Create edit container
    let editContainer = document.createElement('div');
    editContainer.classList.add('edit-container');

    let input = document.createElement('input');
    input.type = 'text';
    input.value = span.innerText;
    input.classList.add('edit-input');

    let saveBtn = document.createElement('span');
    saveBtn.innerHTML = '✔ Save';
    saveBtn.classList.add('save-btn');
    saveBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        let newText = input.value.trim();
        if (newText === '') {
            alert("Task can't be empty!");
            return;
        }
        span.innerText = newText;
        cleanup();
    });

    let cancelBtn = document.createElement('span');
    cancelBtn.innerHTML = '✖ Cancel';
    cancelBtn.classList.add('cancel-btn');
    cancelBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        cleanup();
    });

    editContainer.appendChild(input);
    editContainer.appendChild(saveBtn);
    editContainer.appendChild(cancelBtn);

    // Insert edit container right after the checkbox
    li.insertBefore(editContainer, checkbox.nextSibling);

    // Keyboard support: Enter saves, Escape cancels
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            let newText = input.value.trim();
            if (newText === '') {
                alert("Task can't be empty!");
                return;
            }
            span.innerText = newText;
            cleanup();
        } else if (e.key === 'Escape') {
            cleanup();
        }
    });

    input.focus();

    // Remove edit mode and restore original elements
    function cleanup() {
        if (editContainer.parentNode) editContainer.remove();
        span.style.display = '';
        editBtn.style.display = '';
        drag.style.display = '';
    }
}

// Add new task when clicking the + button
document.getElementById("addBtn").addEventListener("click", function () {
    let task = inputField.value.trim();
    if (task === "") {
        alert("Task can't be empty!");
        return;
    }
    let newItem = createTodoItem(task);
    list.appendChild(newItem);
    inputField.value = "";
});

// Global click closes all control panels (but not edit mode)
document.addEventListener("click", function () {
    closeAllControls();
});
