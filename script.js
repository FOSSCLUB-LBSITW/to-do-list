const list = document.getElementById("todoList");
const inputField = document.getElementById("todoInput");
const undoToast = document.getElementById("undoToast");

// Close all open control panels
function closeAllControls() {
    document.querySelectorAll(".controls").forEach(c => c.classList.remove("show-controls"));
}

// Keep track of last deleted task for undo
let lastDeleted = null;
let undoTimeout = null;

// Create a new to-do item
function createTodoItem(taskText) {
    let li = document.createElement("li");
    li.classList.add("todo-item");

    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", () => li.classList.toggle("completed"));

    let span = document.createElement("span");
    span.classList.add("todo-text");
    span.innerText = taskText;

    let drag = document.createElement("span");
    drag.classList.add("drag-handle");
    drag.innerHTML = "≡";
    drag.addEventListener("click", (e) => {
        e.stopPropagation();
        closeAllControls();
        controls.classList.toggle("show-controls");
    });

    let editBtn = document.createElement("span");
    editBtn.innerHTML = "✏️";
    editBtn.classList.add("edit-btn");
    editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        enterEditMode(li, span, editBtn, drag);
    });

    span.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        enterEditMode(li, span, editBtn, drag);
    });

    let controls = document.createElement("div");
    controls.classList.add("controls");

    let up = document.createElement("span");
    up.innerHTML = "⬆";
    up.addEventListener("click", (e) => {
        e.stopPropagation();
        let prev = li.previousElementSibling;
        if (prev) list.insertBefore(li, prev);
    });

    let down = document.createElement("span");
    down.innerHTML = "⬇";
    down.addEventListener("click", (e) => {
        e.stopPropagation();
        let next = li.nextElementSibling;
        if (next) list.insertBefore(next, li);
    });

    let del = document.createElement("span");
    del.innerHTML = "❌";
    del.addEventListener("click", (e) => {
        e.stopPropagation();
        const confirmDelete = confirm("Are you sure you want to delete this task?");
        if (!confirmDelete) return;

        lastDeleted = { element: li, index: Array.from(list.children).indexOf(li) };
        li.remove();
        showUndoToast();
    });

    controls.append(up, down, del);
    li.append(checkbox, span, drag, editBtn, controls);
    return li;
}

// Undo toast
function showUndoToast() {
    undoToast.style.display = "block";
    undoToast.innerHTML = `Task deleted. <span id="undoBtn">UNDO</span>`;
    const undoBtn = document.getElementById("undoBtn");
    undoBtn.addEventListener("click", () => {
        undoDelete();
        undoToast.style.display = "none";
    });

    clearTimeout(undoTimeout);
    undoTimeout = setTimeout(() => {
        undoToast.style.display = "none";
        lastDeleted = null;
    }, 5000);
}

function undoDelete() {
    if (!lastDeleted) return;
    const { element, index } = lastDeleted;
    if (index >= list.children.length) {
        list.appendChild(element);
    } else {
        list.insertBefore(element, list.children[index]);
    }
    lastDeleted = null;
}

// Edit mode
function enterEditMode(li, span, editBtn, drag) {
    span.style.display = 'none';
    editBtn.style.display = 'none';
    drag.style.display = 'none';

    let checkbox = li.querySelector('input[type="checkbox"]');
    let editContainer = document.createElement('div');
    editContainer.classList.add('edit-container');

    let input = document.createElement('input');
    input.type = 'text';
    input.value = span.innerText;
    input.classList.add('edit-input');

    let saveBtn = document.createElement('span');
    saveBtn.innerHTML = '✔ Save';
    saveBtn.classList.add('save-btn');
    saveBtn.addEventListener('click', () => {
        let newText = input.value.trim();
        if (!newText) { alert("Task can't be empty!"); return; }
        span.innerText = newText;
        cleanup();
    });

    let cancelBtn = document.createElement('span');
    cancelBtn.innerHTML = '✖ Cancel';
    cancelBtn.classList.add('cancel-btn');
    cancelBtn.addEventListener('click', cleanup);

    editContainer.append(input, saveBtn, cancelBtn);
    li.insertBefore(editContainer, checkbox.nextSibling);

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); saveBtn.click(); }
        else if (e.key === 'Escape') cleanup();
    });

    input.focus();

    function cleanup() {
        if (editContainer.parentNode) editContainer.remove();
        span.style.display = '';
        editBtn.style.display = '';
        drag.style.display = '';
    }
}

// Add new task
document.getElementById("addBtn").addEventListener("click", () => {
    let task = inputField.value.trim();
    if (!task) { alert("Task can't be empty!"); return; }
    let newItem = createTodoItem(task);
    list.appendChild(newItem);
    inputField.value = "";
});

// Close controls globally
document.addEventListener("click", closeAllControls);