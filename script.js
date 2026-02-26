const addBtn = document.getElementById("addBtn");
const activeList = document.getElementById("activeList");
const todoList = document.getElementById("activeList");
const completedList = document.getElementById("completedList");
const inputField = document.getElementById("todoInput");
const categoryInput = document.getElementById("categoryInput");
const priorityInput = document.getElementById("priorityInput");
const deadlineInput = document.getElementById("deadlineInput");
const hoursInput = document.getElementById("hoursInput");
const minutesInput = document.getElementById("minutesInput");
const secondsInput = document.getElementById("secondsInput");
const searchInput = document.getElementById("searchInput");

let activeTimers = {};

if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

function notify(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

function populateTimeDropdowns() {
    hoursInput.innerHTML = '';
    minutesInput.innerHTML = '';
    secondsInput.innerHTML = '';

    for (let i = 0; i < 24; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.innerText = i.toString().padStart(2, '0') + "h";
        hoursInput.appendChild(option);
    }
    for (let i = 0; i < 60; i++) {
        const minOption = document.createElement("option");
        minOption.value = i;
        minOption.innerText = i.toString().padStart(2, '0') + "m";
        minutesInput.appendChild(minOption);

        const secOption = document.createElement("option");
        secOption.value = i;
        secOption.innerText = i.toString().padStart(2, '0') + "s";
        secondsInput.appendChild(secOption);
    }
}

function saveTasks() {
  let tasks = [];
  document.querySelectorAll(".todo-item").forEach((li) => {
    tasks.push({
      id: li.dataset.id,
      text: li.querySelector(".todo-text").innerText,
      category: li.dataset.category,
      priority: li.dataset.priority,
      deadline: li.dataset.deadline,
      duration: li.dataset.duration,
      timeLeft: li.dataset.timeLeft,
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
      task.deadline,
      task.duration,
      task.id,
      task.timeLeft
    );

    if (task.completed) {
      li.classList.add("completed");
      completedList.appendChild(li);
    } else {
      activeList.appendChild(li);
    }
  });
}

function createTodoItem(text, category, priority, deadline, duration, id = Date.now().toString(), timeLeft) {
  const li = document.createElement("li");
  li.className = "todo-item";
  li.dataset.id = id;
  li.dataset.category = category;
  li.dataset.priority = priority;
  li.dataset.deadline = deadline;
  li.dataset.duration = duration;
  li.dataset.timeLeft = timeLeft || duration;

  const textSpan = document.createElement("div");
  textSpan.className = "todo-text";
  textSpan.innerText = text;
  li.appendChild(textSpan);

  if (deadline) {
      const deadlineSpan = document.createElement("div");
      deadlineSpan.className = "deadline";
      deadlineSpan.innerText = "Due: " + new Date(deadline).toLocaleString();
      li.appendChild(deadlineSpan);
  }

  const details = document.createElement("div");
  details.className = "todo-details";
  details.innerHTML = `
    <span class="category">${category}</span>
    <span class="priority">${priority}</span>
  `;
  li.appendChild(details);

  const durationNum = parseInt(duration);
  if (durationNum > 0) {
      const timerContainer = document.createElement("div");
      timerContainer.className = "timer-container";

      const timerDisplay = document.createElement("span");
      timerDisplay.className = "timer-display";

      let remaining = parseInt(li.dataset.timeLeft);

      function updateDisplay() {
        const hours = Math.floor(remaining / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        const seconds = remaining % 60;
        timerDisplay.innerText = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }

      updateDisplay();

      const startBtn = document.createElement("button");
      startBtn.innerText = "▶";

      const pauseBtn = document.createElement("button");
      pauseBtn.innerText = "⏸";
      pauseBtn.style.display = "none";

      const resetBtn = document.createElement("button");
      resetBtn.innerText = "🔄";
      resetBtn.style.display = "none";

      timerContainer.append(startBtn, pauseBtn, resetBtn, timerDisplay);
      li.appendChild(timerContainer);

      function stopTimer() {
          clearInterval(activeTimers[id]);
          delete activeTimers[id];
      }

      startBtn.addEventListener("click", () => {
        if (activeTimers[id]) return;

        activeTimers[id] = setInterval(() => {
          if (remaining > 0) {
            remaining--;
            li.dataset.timeLeft = remaining;
            updateDisplay();
          } else {
            stopTimer();
            notify("Timer Finished!", text);
          }
        }, 1000);

        startBtn.style.display = "none";
        pauseBtn.style.display = "inline-block";
        resetBtn.style.display = "inline-block";
      });

      pauseBtn.addEventListener("click", () => {
        stopTimer();
        startBtn.style.display = "inline-block";
        pauseBtn.style.display = "none";
      });

      resetBtn.addEventListener("click", () => {
        stopTimer();
        remaining = parseInt(duration);
        li.dataset.timeLeft = remaining;
        updateDisplay();

        startBtn.style.display = "inline-block";
        pauseBtn.style.display = "none";
        resetBtn.style.display = "none";
      });
  }

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";
  
  const completeBtn = document.createElement("button");
  completeBtn.className = "complete-btn";
  completeBtn.innerText = "Complete";
  buttonContainer.appendChild(completeBtn)


  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.innerText = "Delete";
  buttonContainer.appendChild(deleteBtn)

  li.appendChild(buttonContainer);

  checkDeadline(li);
  return li;
}

addBtn.addEventListener("click", () => {
  const text = inputField.value.trim();
  if (!text) return;

  const hours = parseInt(hoursInput.value) || 0;
  const minutes = parseInt(minutesInput.value) || 0;
  const seconds = parseInt(secondsInput.value) || 0;
  const duration = hours * 3600 + minutes * 60 + seconds;

  const li = createTodoItem(
    text,
    categoryInput.value,
    priorityInput.value,
    deadlineInput.value,
    duration.toString()
  );

  activeList.appendChild(li);
  inputField.value = "";
  deadlineInput.value = "";
  hoursInput.value = "0";
  minutesInput.value = "0";
  secondsInput.value = "0";
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
  } else if (diff <= 3600000) {
    li.classList.add("near-deadline");
  }
}

setInterval(() => {
  document.querySelectorAll(".todo-item:not(.completed)").forEach(checkDeadline);
}, 30000);

searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  document.querySelectorAll(".todo-item").forEach((li) => {
    const text = li.querySelector(".todo-text").innerText.toLowerCase();
    li.style.display = text.includes(term) ? "" : "none";
  });
});

document.addEventListener("DOMContentLoaded", () => {
    populateTimeDropdowns();
    loadTasks();
});
const searchInput = document.getElementById("searchInput");

// Save all tasks to localStorage
function saveTasks() {
  let tasks = [];
  document.querySelectorAll(".todo-item").forEach((li) => {
    tasks.push({
      text: li.querySelector(".todo-text").innerText,
      category: li.dataset.category,
      priority: li.dataset.priority,
      completed: li.classList.contains("completed"),
    });
  });
  localStorage.setItem("todos", JSON.stringify(tasks));
}

// Load tasks from localStorage
function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("todos"));
  if (tasks) {
    tasks.forEach((task) => {
      let li = createTodoItem(task.text, task.category, task.priority);
      if (task.completed) {
        li.classList.add("completed");
        li.querySelector('input[type="checkbox"]').checked = true;
        completedList.appendChild(li);
      } else {
        todoList.appendChild(li);
      }
    });
  }
}

// Filter tasks based on search input
function filterTasks() {
    const searchTerm = searchInput.value.toLowerCase();

    // Filter active tasks
    document.querySelectorAll('#activeList .todo-item').forEach(li => {
        const taskText = li.querySelector('.todo-text').innerText.toLowerCase();
        li.style.display = taskText.includes(searchTerm) ? "" : "none";
    });

    // Filter completed tasks
    document.querySelectorAll('#completedList .todo-item').forEach(li => {
        const taskText = li.querySelector('.todo-text').innerText.toLowerCase();
        li.style.display = taskText.includes(searchTerm) ? "" : "none";
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

// Merged Create Todo Item
function createTodoItem(taskText, category = 'Personal', priority = 'Low') {
    let li = document.createElement("li");
    li.className = "todo-item";
    li.dataset.category = category;
    li.dataset.priority = priority;

    let textSpan = document.createElement('span');
    textSpan.className = 'todo-text';
    textSpan.innerText = taskText;

    let detailsDiv = document.createElement('div');
    detailsDiv.className = 'todo-details';

    let categorySpan = document.createElement('span');
    categorySpan.className = 'category';
    categorySpan.innerText = category;

    let prioritySpan = document.createElement('span');
    prioritySpan.className = 'priority';
    prioritySpan.innerText = priority;

    detailsDiv.appendChild(categorySpan);
    detailsDiv.appendChild(prioritySpan);

    let buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";

    // Checkbox from main for completion
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", function () {
        if (checkbox.checked) {
            li.classList.add("completed");
            moveWithAnimation(li, completedList);
        } else {
            li.classList.remove("completed");
            moveWithAnimation(li, todoList);
        }
        setTimeout(saveTasks, 300);
    });

    let deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.addEventListener("click", function () {
        li.remove();
        saveTasks();
    });

    li.appendChild(textSpan);
    li.appendChild(detailsDiv);

    buttonContainer.appendChild(checkbox);
    buttonContainer.appendChild(deleteButton);

    li.appendChild(buttonContainer);

    return li;
}

// Add a new task
addBtn.addEventListener("click", function () {
  const taskText = inputField.value.trim();
  const category = categoryInput.value;
  const priority = priorityInput.value;
  if (taskText !== "") {
    let newTodo = createTodoItem(taskText, category, priority);
    todoList.appendChild(newTodo);
    inputField.value = "";
    saveTasks();
  }
});

// Load tasks on page load and set up filters
document.addEventListener("DOMContentLoaded", function () {
    loadTasks();
    
    // Event listener for search input
    searchInput.addEventListener('input', filterTasks);

    // Filter functionality for category and priority
    const categoryFilter = document.getElementById("categoryFilter");
    const priorityFilter = document.getElementById("priorityFilter");

    function filterTasksByCatAndPrio() {
        const selectedCategory = categoryFilter.value;
        const selectedPriority = priorityFilter.value;

        document.querySelectorAll(".todo-item").forEach(task => {
            const taskCategory = task.dataset.category;
            const taskPriority = task.dataset.priority;
            const categoryMatch = selectedCategory === "All" || taskCategory === selectedCategory;
            const priorityMatch = selectedPriority === "All" || taskPriority === selectedPriority;

            if (categoryMatch && priorityMatch) {
                task.style.display = "flex";
            } else {
                task.style.display = "none";
            }
        });
    }

    categoryFilter.addEventListener("change", filterTasksByCatAndPrio);
    priorityFilter.addEventListener("change", filterTasksByCatAndPrio);
});
