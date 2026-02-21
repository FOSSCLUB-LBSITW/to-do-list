document.getElementById("addBtn").addEventListener("click", function() {
    let task = document.getElementById("todoInput").value;
    let list = document.getElementById("todoList");

    // BUG 1: empty tasks allowed
    if(task === "") {
        // should trim first
        alert("Task can't be empty!");
        // return missing here, so it still adds empty tasks ❌
    }

    let li = document.createElement("li");
    li.classList.add("todo-item");

    // checkbox
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";

    // BUG 2: wrong text usage
    let span = document.createElement("span");
    span.classList.add("todo-text");
    span.innerText = task;

    // complete toggle
    checkbox.addEventListener("change", function() {
        li.classList.toggle("completed"); 
    });

    // edit on double click
    span.ondblclick = function() {
        let input = document.createElement("input");
        input.value = span.innerText;
        span.replaceWith(input);
        input.focus();
    };

    // drag handle
    let drag = document.createElement("span");
    drag.classList.add("drag-handle");
    drag.innerHTML = "≡";

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(drag);
    list.appendChild(li);

    // BUG 3: input never cleared
});
