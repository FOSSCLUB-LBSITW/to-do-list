const list = document.getElementById("activeList");
const completedList = document.getElementById("completedList");
const inputField = document.getElementById("todoInput");
const categoryInput = document.getElementById("categoryInput");
const priorityInput = document.getElementById("priorityInput");

// Save all tasks to localStorage
function saveTasks() {
    const activeTasks = [];
    document.querySelectorAll('#activeList .todo-item').forEach(li => {
        activeTasks.push({
            text: li.querySelector('.todo-text').innerText,
            category: li.dataset.category,
            priority: li.dataset.priority
        });
    });

    const completedTasks = [];
    document.querySelectorAll('#completedList .todo-item').forEach(li => {
        completedTasks.push({
            text: li.querySelector('.todo-text').innerText,
            category: li.dataset.category,
            priority: li.dataset.priority
        });
    });

    localStorage.setItem('activeTasks', JSON.stringify(activeTasks));
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
}

// Load tasks from localStorage on page load
function loadTasks() {
    let activeTasks = JSON.parse(localStorage.getItem('activeTasks')) || [];
    let completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];

    // Helper to normalize task data (handle legacy string-only tasks)
    const normalize = t => typeof t === 'string' ? { text: t, category: 'Personal', priority: 'Low' } : t;

    // Sort active tasks by priority: High(3) > Medium(2) > Low(1)
    const pVal = { 'High': 3, 'Medium': 2, 'Low': 1 };
    activeTasks = activeTasks.map(normalize).sort((a, b) => (pVal[b.priority] || 0) - (pVal[a.priority] || 0));
    completedTasks = completedTasks.map(normalize);

    activeTasks.forEach(task => {
        const newItem = createTodoItem(task.text, task.category, task.priority);
        list.appendChild(newItem);
    });

    completedTasks.forEach(task => {
        const newItem = createTodoItem(task.text, task.category, task.priority);
        newItem.querySelector('input[type="checkbox"]').checked = true;
        newItem.classList.add('completed');
        completedList.appendChild(newItem);
    });
}

// Save all tasks to localStorage
function saveTasks() {
    const activeTasks = [];
    document.querySelectorAll('#activeList .todo-text').forEach(span => {
        activeTasks.push(span.innerText);
    });

    const completedTasks = [];
    document.querySelectorAll('#completedList .todo-text').forEach(span => {
        completedTasks.push(span.innerText);
    });

    localStorage.setItem('activeTasks', JSON.stringify(activeTasks));
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
}

// Load tasks from localStorage on page load
function loadTasks() {
    const activeTasks = JSON.parse(localStorage.getItem('activeTasks')) || [];
    const completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];

    activeTasks.forEach(taskText => {
        const newItem = createTodoItem(taskText);
        list.appendChild(newItem);
    });

    completedTasks.forEach(taskText => {
        const newItem = createTodoItem(taskText);
        newItem.querySelector('input[type="checkbox"]').checked = true;
        newItem.classList.add('completed');
        completedList.appendChild(newItem);
    });
}

// Helper: close all open control panels
function closeAllControls() {
    document.querySelectorAll(".controls").forEach(function (c) {
        c.classList.remove("show-controls");
    });
}

// Create a new to-do item
function createTodoItem(taskText, category = 'Personal', priority = 'Low') {
    let li = document.createElement("li");
    li.classList.add("todo-item");
    li.dataset.category = category;
    li.dataset.priority = priority;

    // Checkbox
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", function () {
    if (checkbox.checked) {
        li.classList.add("completed");
        completedList.appendChild(li);   // move to completed section
    } else {
        li.classList.remove("completed");
        list.appendChild(li);            // move back to active section
    }
    saveTasks();
    });

    // Task text (visible normally)
    let span = document.createElement("span");
    span.classList.add("todo-text");
    span.innerText = taskText;

    // Category and Priority Badges
    let infoDiv = document.createElement("div");
    infoDiv.classList.add("task-info");
    
    let catBadge = document.createElement("span");
    catBadge.className = "badge category-tag";
    catBadge.innerText = category;
    
    let priBadge = document.createElement("span");
    priBadge.className = `badge priority-${priority.toLowerCase()}`;
    priBadge.innerText = priority;

    infoDiv.appendChild(catBadge);
    infoDiv.appendChild(priBadge);

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
    if (prev) li.parentNode.insertBefore(li, prev);
    saveTasks();
    });


    let down = document.createElement("span");
    down.innerHTML = "⬇";
    down.addEventListener("click", function (e) {
    e.stopPropagation();
    let next = li.nextElementSibling;
    if (next) li.parentNode.insertBefore(next, li);
    saveTasks();
    });


    let del = document.createElement("span");
    del.innerHTML = "❌";
    // ❌ Delete with confirmation
del.addEventListener("click", function (e) {
    e.stopPropagation();
    const confirmDelete = confirm("Are you sure you want to delete this task?");
    if (confirmDelete) {
        li.remove();
        saveTasks();
    }
});

    controls.appendChild(up);
    controls.appendChild(down);
    controls.appendChild(del);

    // Assemble the item
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(infoDiv);
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
        saveTasks();
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
            saveTasks();
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
    let category = categoryInput.value;
    let priority = priorityInput.value;
    let newItem = createTodoItem(task, category, priority);
    list.appendChild(newItem);
    inputField.value = "";
    saveTasks();
});

// Global click closes all control panels (but not edit mode)
document.addEventListener("click", function () {
    closeAllControls();
});

// Load tasks when the page is ready
document.addEventListener('DOMContentLoaded', loadTasks);
