
console.log("TaskFlow Tasks page is running!");

// =================================
// PAGE ELEMENTS
// =================================

const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskDate = document.getElementById("taskDate");
const taskPriority = document.getElementById("taskPriority");

const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const emptyTasks = document.getElementById("emptyTasks");

// =================================
// LOCAL STORAGE
// =================================

const STORAGE_KEY = "taskflow-tasks";

let tasks = [];

try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY));
    tasks = Array.isArray(savedTasks) ? savedTasks : [];
} catch (error) {
    console.error("Could not load saved tasks:", error);
}

// Save tasks
function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// =================================
// SET DEFAULT DATE
// =================================

const today = new Date();
const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
].join("-");

taskDate.value = todayString;
taskDate.min = todayString;

// =================================
// ADD NEW TASK
// =================================

taskForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    const dueDate = taskDate.value;
    const priority = taskPriority.value;

    // Check empty title
    if (!title) {
        taskTitle.focus();
        return;
    }

    // Check date
    if (!dueDate || dueDate < todayString) {
        alert("Please select today or a future date.");
        return;
    }

    // Maximum 10 tasks per day
    const dailyTasks = tasks.filter(
        task => task.dueDate === dueDate
    );

    if (dailyTasks.length >= 10) {
        alert("You can add a maximum of 10 tasks per day.");
        return;
    }

    // Create new task
    const newTask = {
        id: crypto.randomUUID(),
        title: title,
        description: description,
        dueDate: dueDate,
        priority: priority,
        completed: false
    };

    // Add task to array
    tasks.push(newTask);

    // Save and update page
    saveTasks();
    renderTasks();

    // Reset form
    taskForm.reset();
    taskDate.value = todayString;
    taskPriority.value = "medium";

});

// =================================
// DISPLAY TASKS
// =================================

function renderTasks() {

    taskList.innerHTML = "";

    // Update task count
    taskCount.textContent = `${tasks.length} tasks added`;

    // Show empty message
    emptyTasks.style.display = tasks.length === 0 ? "block" : "none";

    tasks.forEach((task) => {

        // Task container
        const taskItem = document.createElement("div");
        taskItem.className = "task-item";

        if (task.completed) {
            taskItem.classList.add("completed");
        }

        // Checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        // Task details
        const taskDetails = document.createElement("div");
        taskDetails.className = "task-details";

        const title = document.createElement("h3");
        title.textContent = task.title;

        const description = document.createElement("p");
        description.textContent = task.description;

        const meta = document.createElement("div");
        meta.className = "task-meta";

        const priority = document.createElement("span");
        priority.className = `task-priority priority-${task.priority}`;
        priority.textContent = `${task.priority} priority`;

        const date = document.createElement("span");
        date.className = "task-priority";
        date.textContent = task.dueDate;

        meta.append(priority, date);
        taskDetails.append(title);

        if (task.description) {
            taskDetails.append(description);
        }

        taskDetails.append(meta);

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-task-btn";
        deleteButton.type = "button";
        deleteButton.setAttribute("aria-label", "Delete task");
        deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';

        deleteButton.addEventListener("click", () => {

            tasks = tasks.filter(item => item.id !== task.id);

            saveTasks();
            renderTasks();

        });

        // Add elements
        taskItem.append(
            checkbox,
            taskDetails,
            deleteButton
        );

        taskList.appendChild(taskItem);

    });

}

// =================================
// INITIAL RENDER
// =================================

renderTasks();
