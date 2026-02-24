const addBtn = document.getElementById("addBtn");
const activeList = document.getElementById("activeList");
const completedList = document.getElementById("completedList");
const inputField = document.getElementById("todoInput");
const categoryInput = document.getElementById("categoryInput");
const priorityInput = document.getElementById("priorityInput");
const deadlineInput = document.getElementById("deadlineInput");
const searchInput = document.getElementById("searchInput");

if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

function sendNotification(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

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
      completedList.appendChild(li);
    } else {
      activeList.appendChild(li);
    }
  });
}

function createTodoItem(text, category, priority, deadline) {
  const li = document.createElement("li");
  li.className = "todo-item";
  li.dataset.category = category;
  li.dataset.priority = priority;
  li.dataset.deadline = deadline;

  const textSpan = document.createElement("span");
  textSpan.className = "todo-text";
  textSpan.innerText = text;

  const deadlineSpan = document.createElement("div");
  deadlineSpan.className = "deadline";
  if (deadline) {
    deadlineSpan.innerText = "Due: " + new Date(deadline).toLocaleString();
  }

  const details = document.createElement("div");
  details.className = "todo-details";
  details.innerHTML = `
    <span class="category">${category}</span>
    <span class="priority">${priority}</span>
  `;

  const buttons = document.createElement("div");
  buttons.className = "button-container";

  const completeBtn = document.createElement("button");
  completeBtn.className = "complete-btn";
  completeBtn.innerText = "Complete";

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.innerText = "Delete";

  buttons.appendChild(completeBtn);
  buttons.appendChild(deleteBtn);

  li.appendChild(textSpan);
  li.appendChild(deadlineSpan);
  li.appendChild(details);
  li.appendChild(buttons);

  completeBtn.addEventListener("click", () => {
    li.classList.toggle("completed");
    if (li.classList.contains("completed")) {
      completedList.appendChild(li);
      completeBtn.innerText = "Undo";
    } else {
      activeList.appendChild(li);
      completeBtn.innerText = "Complete";
    }
    saveTasks();
  });

  deleteBtn.addEventListener("click", () => {
    li.remove();
    saveTasks();
  });

  checkDeadline(li);
  return li;
}

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
  deadlineInput.value = "";
  saveTasks();
});

function checkDeadline(li) {
  if (!li.dataset.deadline || li.classList.contains("completed")) return;

  const now = new Date();
  const deadline = new Date(li.dataset.deadline);
  const diff = deadline - now;

  li.classList.remove("near-deadline", "overdue");

  if (diff <= 0) {
    li.classList.add("overdue");
    sendNotification("Task Overdue!", li.querySelector(".todo-text").innerText);
  } else if (diff <= 3600000) {
    li.classList.add("near-deadline");
    sendNotification("Task Due Soon!", li.querySelector(".todo-text").innerText);
  }
}

setInterval(() => {
  document.querySelectorAll(".todo-item").forEach(checkDeadline);
}, 30000);

searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  document.querySelectorAll(".todo-item").forEach((li) => {
    const text = li.querySelector(".todo-text").innerText.toLowerCase();
    li.style.display = text.includes(term) ? "" : "none";
  });
});

document.addEventListener("DOMContentLoaded", loadTasks);
