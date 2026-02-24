const addBtn = document.getElementById("addBtn");
const todoList = document.getElementById("activeList");
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
        document.getElementById("completedList").appendChild(li);
      } else {
        document.getElementById("activeList").appendChild(li);
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

// Event listener for search input
searchInput.addEventListener('input', filterTasks);

// Create Todo Item
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

    let completeButton = document.createElement("button");
    completeButton.innerText = "Complete";
    completeButton.className = "complete-btn";

    let deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.className = "delete-btn";

    li.appendChild(textSpan);
    li.appendChild(detailsDiv);

    buttonContainer.appendChild(completeButton);
    buttonContainer.appendChild(deleteButton);

    li.appendChild(buttonContainer);

    // Event Listeners for buttons
    completeButton.addEventListener("click", function () {
        li.classList.toggle("completed");
        if (li.classList.contains("completed")) {
            document.getElementById("completedList").appendChild(li);
            completeButton.innerText = "Undo";
        } else {
            document.getElementById("activeList").appendChild(li);
            completeButton.innerText = "Complete";
        }
        saveTasks();
    });

    deleteButton.addEventListener("click", function () {
        li.remove();
        saveTasks();
    });

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

// Load tasks on page load
document.addEventListener("DOMContentLoaded", loadTasks);
