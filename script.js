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

// Load tasks from localStorage
function loadTasks() {
    const activeTasks = JSON.parse(localStorage.getItem('activeTasks')) || [];
    const completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];

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

// Helper to close control panels
function closeAllControls() {
    document.querySelectorAll(".controls").forEach(c => {
        c.classList.remove("show-controls");
    });
}
function moveWithAnimation(item, targetList) {

    // Start exit animation
    item.classList.add("task-exit");

    requestAnimationFrame(() => {
        item.classList.add("task-exit-active");
    });

    setTimeout(() => {

        // Move element
        item.remove();
        targetList.appendChild(item);

        // Reset exit classes
        item.classList.remove("task-exit", "task-exit-active");

        // Enter animation
        item.classList.add("task-enter");

        requestAnimationFrame(() => {
            item.classList.add("task-enter-active");
        });

        setTimeout(() => {
            item.classList.remove("task-enter", "task-enter-active");
        }, 250);

    }, 250);
}
// Create Todo Item
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
        moveWithAnimation(li, completedList);
    } else {
        li.classList.remove("completed");
        moveWithAnimation(li, list);
    }

    setTimeout(saveTasks, 300); // wait for animation before saving
});

    // Task text
    let span = document.createElement("span");
    span.classList.add("todo-text");
    span.innerText = taskText;

    // Info section
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

    // Delete Button (VISIBLE ALWAYS)
    let deleteBtn = document.createElement("span");
    deleteBtn.innerHTML = "🗑";
    deleteBtn.classList.add("delete-btn");

    deleteBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        const confirmDelete = confirm("Are you sure you want to delete this task?");
        if (confirmDelete) {
            li.remove();
            saveTasks();
        }
    });

    // Assemble
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(infoDiv);
    li.appendChild(deleteBtn);

    return li;
}

// Add new task
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

// Load when page ready
document.addEventListener("DOMContentLoaded", loadTasks);