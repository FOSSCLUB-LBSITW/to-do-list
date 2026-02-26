// Globals
const addBtn = document.getElementById("addBtn");
const activeList = document.getElementById("activeList");
const completedList = document.getElementById("completedList");
const inputField = document.getElementById("todoInput");
const categoryInput = document.getElementById("categoryInput");
const priorityInput = document.getElementById("priorityInput");
const deadlineInput = document.getElementById("deadlineInput");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const priorityFilter = document.getElementById("priorityFilter");

// Notifications
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

function sendNotification(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

// Save tasks to localStorage
function saveTasks() {
  let tasks = [];
  document.querySelectorAll(".todo-item").forEach((li) => {
    tasks.push({
      text: li.querySelector(".todo-text").innerText,
      category: li.dataset.category,
      priority: li.dataset.priority,
      deadline: li.dataset.deadline,
      completed: li.classList.contains("completed"),
    });
  });
  localStorage.setItem("todos", JSON.stringify(tasks));
}

// Load tasks from localStorage
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("todos"));
  if (!tasks) return;

  tasks.forEach((task) => {
    const li = createTodoItem(
      task.text,
      task.category,
      task.priority,
      task.deadline
    );

    if (task.completed) {
      li.classList.add("completed");
      const checkbox = li.querySelector('input[type="checkbox"]');
      if (checkbox) {
          checkbox.checked = true;
      }
      completedList.appendChild(li);
    } else {
      activeList.appendChild(li);
    }
  });
}

// Animation for moving tasks between lists
function moveWithAnimation(item, targetList) {
    item.classList.add("task-exit");
    requestAnimationFrame(() => {
        item.classList.add("task-exit-active");
    });
    setTimeout(() => {
        item.remove();
        targetList.appendChild(item);
        item.classList.remove("task-exit", "task-exit-active");
        item.classList.add("task-enter");
        requestAnimationFrame(() => {
            item.classList.add("task-enter-active");
        });
        setTimeout(() => {
            item.classList.remove("task-enter", "task-enter-active");
        }, 250);
    }, 250);
}

// Create a new todo item element
function createTodoItem(text, category, priority, deadline) {
  const li = document.createElement("li");
  li.className = "todo-item";
  li.dataset.category = category;
  li.dataset.priority = priority;
  if(deadline) {
      li.dataset.deadline = deadline;
  }

  const textSpan = document.createElement("span");
  textSpan.className = "todo-text";
  textSpan.innerText = text;

  const details = document.createElement("div");
  details.className = "todo-details";
  details.innerHTML = `<span class="category">${category}</span><span class="priority">${priority}</span>`;

  const deadlineSpan = document.createElement("div");
  deadlineSpan.className = "deadline";
  if (deadline) {
    deadlineSpan.innerText = "Due: " + new Date(deadline).toLocaleString();
  }

  const buttons = document.createElement("div");
  buttons.className = "button-container";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.addEventListener("change", function () {
    if (checkbox.checked) {
      li.classList.add("completed");
      moveWithAnimation(li, completedList);
    } else {
      li.classList.remove("completed");
      moveWithAnimation(li, activeList);
    }
    setTimeout(saveTasks, 300);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.innerText = "Delete";
  deleteBtn.addEventListener("click", () => {
    li.remove();
    saveTasks();
  });

  buttons.appendChild(checkbox);
  buttons.appendChild(deleteBtn);

  li.appendChild(textSpan);
  li.appendChild(details);
  if (deadline) {
    li.appendChild(deadlineSpan);
  }
  li.appendChild(buttons);

  checkDeadline(li);
  return li;
}

// Add a new task
addBtn.addEventListener("click", () => {
  const text = inputField.value.trim();
  if (!text) return;

  const li = createTodoItem(
    text,
    categoryInput.value,
    priorityInput.value,
    deadlineInput.value
  );

  activeList.appendChild(li);
  inputField.value = "";
  categoryInput.value = "Personal";
  priorityInput.value = "Low";
  deadlineInput.value = "";
  saveTasks();
});

// Deadline checking and visual cues
function checkDeadline(li) {
  if (!li.dataset.deadline || li.classList.contains("completed")) return;

  const now = new Date();
  const deadline = new Date(li.dataset.deadline);
  const diff = deadline - now;

  li.classList.remove("near-deadline", "overdue");

  if (diff <= 0) {
    li.classList.add("overdue");
    sendNotification("Task Overdue!", li.querySelector(".todo-text").innerText);
  } else if (diff <= 3600000) { // 1 hour
    li.classList.add("near-deadline");
    sendNotification("Task Due Soon!", li.querySelector(".todo-text").innerText);
  }
}

// Periodically check deadlines for all active tasks
setInterval(() => {
  document.querySelectorAll("#activeList .todo-item").forEach(checkDeadline);
}, 30000);

// Combined filter function for search, category, and priority
function combinedFilter() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedPriority = priorityFilter.value;

    document.querySelectorAll(".todo-item").forEach(task => {
        const taskText = task.querySelector('.todo-text').innerText.toLowerCase();
        const taskCategory = task.dataset.category;
        const taskPriority = task.dataset.priority;

        const searchMatch = taskText.includes(searchTerm);
        const categoryMatch = selectedCategory === "All" || taskCategory === selectedCategory;
        const priorityMatch = selectedPriority === "All" || taskPriority === selectedPriority;

        if (searchMatch && categoryMatch && priorityMatch) {
            task.style.display = "flex";
        } else {
            task.style.display = "none";
        }
    });
}

// Event listeners for page load and filters
document.addEventListener("DOMContentLoaded", function () {
    loadTasks();
    searchInput.addEventListener("input", combinedFilter);
    categoryFilter.addEventListener("change", combinedFilter);
    priorityFilter.addEventListener("change", combinedFilter);
});
