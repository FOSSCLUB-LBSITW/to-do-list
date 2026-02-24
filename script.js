const addBtn = document.getElementById("addBtn");
const todoList = document.getElementById("activeList");
const completedList = document.getElementById("completedList");
const inputField = document.getElementById("todoInput");
const categoryInput = document.getElementById("categoryInput");
const priorityInput = document.getElementById("priorityInput");
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