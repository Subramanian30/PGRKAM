const task_input = document.querySelector("input");
const date_input = document.querySelector(".schedule-date");
const assignee_dropdown = document.querySelector(".assignee-dropdown");
const add_btn = document.querySelector(".add-task-button");
const todos_list_body = document.querySelector(".todos-list-body");
const alert_message = document.querySelector(".alert-message");
const delete_all_btn = document.querySelector(".delete-all-btn");

let todos = JSON.parse(localStorage.getItem("todos")) || [];
let assigneeData = [
    { name: "Yukesh", email: "asyukesh@gmail.com" },
    { name: "Sharan", email: "sharanalwarswamy@gmail.com" },
    { name: "Sreejith", email: "sreejith03072002@gmail.com" },
    { name: "Shriman", email: "shriman2962@gmail.com" },
    { name: "Swetha", email: "tr.swetha2019@gmail.com" },
    // Add more assignees as needed
];

// Populate assignee dropdown options dynamically
function populateAssigneeDropdown() {
    assigneeData.forEach(assignee => {
        const option = document.createElement("option");
        option.value = assignee.name;
        option.setAttribute('data-email', assignee.email);
        option.textContent = assignee.name;
        assignee_dropdown.appendChild(option);
    });
}

window.addEventListener("DOMContentLoaded", () => {
    showAllTodos();
    populateAssigneeDropdown();
    if (!todos.length) {
        displayTodos([]);
    }
});

function getRandomId() {
    return (
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15)
    );
}

function addToDo(task_input, date_input, assignee_dropdown) {
    let task = {
        id: getRandomId(),
        task: task_input.value.length > 14 ? task_input.value.slice(0, 14) + "..." : task_input.value,
        dueDate: date_input.value,
        assignee: assignee_dropdown.value,
        completed: false,
        status: "pending",
    };
    todos.push(task);
}

task_input.addEventListener("keyup", (e) => {
    if (e.keyCode === 13 && task_input.value.length > 0) {
        addToDo(task_input, date_input, assignee_dropdown);
        saveToLocalStorage();
        task_input.value = "";
        showAllTodos();
    }
});

add_btn.addEventListener("click", () => {
    if (task_input.value === "") {
        showAlertMessage("Please enter a task", "error");
    } else {
        addToDo(task_input, date_input, assignee_dropdown);
        saveToLocalStorage();
        sendEmailNotification();
        showAllTodos();
        task_input.value = "";
        date_input.value = "";
        assignee_dropdown.value = "";
        showAlertMessage("Task added successfully", "success");
    }
});

delete_all_btn.addEventListener("click", clearAllTodos);

function showAllTodos() {
    todos_list_body.innerHTML = "";
    if (todos.length === 0) {
        todos_list_body.innerHTML = `<tr><td colspan="5" class="text-center">No task found</td></tr>`;
        return;
    }

    todos.forEach((todo) => {
        todos_list_body.innerHTML += `
            <tr class="todo-item" data-id="${todo.id}">
                <td>${todo.task}</td>
                <td>${todo.dueDate || "No due date"}</td>
                <td>${todo.assignee || "No assignee"}</td>
                <td>${todo.status}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editTodo('${todo.id}')">
                        <i class="bx bx-edit-alt bx-bx-xs"></i>    
                    </button>
                    <button class="btn btn-success btn-sm" onclick="toggleStatus('${todo.id}')">
                        <i class="bx bx-check bx-xs"></i>
                    </button>
                    <button class="btn btn-error btn-sm" onclick="deleteTodo('${todo.id}')">
                        <i class="bx bx-trash bx-xs"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}



function saveToLocalStorage() {
    localStorage.setItem("todos", JSON.stringify(todos));
}
function sendEmailNotification() {
    const assigneeName = assignee_dropdown.value;
    const assigneeEmail = assignee_dropdown.options[assignee_dropdown.selectedIndex].getAttribute('data-email');
    const taskDescription = task_input.value;
    

    fetch('/sendemail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            assignee_email: assigneeEmail,
            assignee_name: assigneeName,
            task_description: taskDescription,
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
function showAlertMessage(message, type) {
    let alert_box = `
        <div class="alert alert-${type} shadow-lg mb-5 w-full">
            <div>
                <span>
                    ${message}
                </span>
            </div>
        </div>
    `;
    alert_message.innerHTML = alert_box;
    alert_message.classList.remove("hide");
    alert_message.classList.add("show");
    setTimeout(() => {
        alert_message.classList.remove("show");
        alert_message.classList.add("hide");
    }, 3000);
}

function deleteTodo(id) {
    todos = todos.filter((todo) => todo.id !== id);
    saveToLocalStorage();
    showAlertMessage("Todo deleted successfully", "success");
    showAllTodos();
}

function editTodo(id) {
    let todo = todos.find((todo) => todo.id === id);
    task_input.value = todo.task;
    assignee_dropdown.value = todo.assignee;
    todos = todos.filter((todo) => todo.id !== id);
    add_btn.innerHTML = "<i class='bx bx-check bx-sm'></i>";
    saveToLocalStorage();
    add_btn.addEventListener("click", () => {
        add_btn.innerHTML = "<i class='bx bx-plus bx-sm'></i>";
        showAlertMessage("Todo updated successfully", "success");
    });
}

function clearAllTodos() {
    if (todos.length > 0) {
        todos = [];
        saveToLocalStorage();
        showAlertMessage("All todos cleared successfully", "success");
        showAllTodos();
    } else {
        showAlertMessage("No todos to clear", "error");
    }
}

function toggleStatus(id) {
    let todo = todos.find((todo) => todo.id === id);
    todo.completed = !todo.completed;
    saveToLocalStorage();
    displayTodos(todos);
}

function filterTodos(status) {
    let filteredTodos;
    switch (status) {
        case "all":
            filteredTodos = todos;
            break;
        case "pending":
            filteredTodos = todos.filter((todo) => !todo.completed);
            break;
        case "completed":
            filteredTodos = todos.filter((todo) => todo.completed);
            break;
    }
    displayTodos(filteredTodos);
}

function displayTodos(todosArray) {
    todos_list_body.innerHTML = "";
    if (todosArray.length === 0) {
        todos_list_body.innerHTML = `<tr><td colspan="5" class="text-center">No task found</td></tr>`;
        return;
    }
    todosArray.forEach((todo) => {
        todos_list_body.innerHTML += `
            <tr class="todo-item" data-id="${todo.id}">
                <td>${todo.task}</td>
                <td>${todo.dueDate || "No due date"}</td>
                <td>${todo.assignee || "No assignee"}</td>
                <td>${todo.completed ? "Completed" : "Pending"}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editTodo('${todo.id}')">
                        <i class="bx bx-edit-alt bx-bx-xs"></i>    
                    </button>
                    <button class="btn btn-success btn-sm" onclick="toggleStatus('${todo.id}')">
                        <i class="bx bx-check bx-xs"></i>
                    </button>
                    <button class="btn btn-error btn-sm" onclick="deleteTodo('${todo.id}')">
                        <i class="bx bx-trash bx-xs"></i>
                    </button>
                </td>
            </tr>
    `;
    });
}
