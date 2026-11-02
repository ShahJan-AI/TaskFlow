console.log("TaskFlow is running!");


// CURRENT DATE

const currentDate = document.getElementById("currentDate");

function showCurrentDate() {
    const today = new Date();

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    currentDate.textContent = today.toLocaleDateString("en-US", options);
}

showCurrentDate();




// ================================
// THEME TOGGLE

const themeToggle = document.getElementById("themeToggle");

const html = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem("taskflow-theme");

if (savedTheme) {
    html.setAttribute("data-theme", savedTheme);
}

// Update theme icon
function updateThemeIcon() {

    const currentTheme = html.getAttribute("data-theme");

    if (currentTheme === "dark") {
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
}

updateThemeIcon();

// Toggle theme
themeToggle.addEventListener("click", () => {

    const currentTheme = html.getAttribute("data-theme");

    const newTheme = currentTheme === "light" ? "dark" : "light";

    html.setAttribute("data-theme", newTheme);

    localStorage.setItem("taskflow-theme", newTheme);

    updateThemeIcon();

});

// ================================
// SIDEBAR TOGGLE
// ================================

const sidebar = document.getElementById("sidebar");

const sidebarToggle = document.getElementById("sidebarToggle");

const mobileMenuBtn = document.getElementById("mobileMenuBtn");

const sidebarOverlay = document.getElementById("sidebarOverlay");


// Desktop Sidebar Toggle

sidebarToggle.addEventListener("click", () => {

    sidebar.classList.toggle("collapsed");

});


// Mobile Sidebar Toggle

mobileMenuBtn.addEventListener("click", () => {

    sidebar.classList.add("open");

    sidebarOverlay.classList.add("active");

});


// Close Sidebar

sidebarOverlay.addEventListener("click", () => {

    sidebar.classList.remove("open");

    sidebarOverlay.classList.remove("active");

});


/* =================================
   DASHBOARD STATISTICS
================================= */

// Sample tasks for testing
const tasks = [
    { title: "Learn HTML", completed: true },
    { title: "Practice CSS", completed: true },
    { title: "Study JavaScript", completed: false },
    { title: "Build TaskFlow", completed: false },
    { title: "Read a book", completed: true },
    { title: "Exercise", completed: false },
    { title: "Practice English", completed: false },
    { title: "Review lessons", completed: true },
    { title: "Learn Git", completed: false },
    { title: "Plan tomorrow", completed: false }
];

// Get HTML elements
const totalTasksElement = document.getElementById("totalTasks");
const completedTasksElement = document.getElementById("completedTasks");
const pendingTasksElement = document.getElementById("pendingTasks");

// Calculate statistics
function updateDashboardStats() {

    // Total number of tasks
    const totalTasks = tasks.length;

    // Number of completed tasks
    const completedTasks = tasks.filter(task => task.completed).length;

    // Number of pending tasks
    const pendingTasks = totalTasks - completedTasks;

    // Update HTML
    totalTasksElement.textContent = totalTasks;
    completedTasksElement.textContent = completedTasks;
    pendingTasksElement.textContent = pendingTasks;
}

// Run the function
updateDashboardStats();



/* =================================
   TOGGLE TASK STATUS
================================= */

function toggleTaskStatus(taskIndex) {

    // Change task completion status
    tasks[taskIndex].completed = !tasks[taskIndex].completed;

    // Update dashboard statistics
    updateDashboardStats();

    // Show updated tasks in console
    console.log(tasks);
}


/* =================================
   DISPLAY TASKS
================================= */

const taskList = document.getElementById("taskList");

function renderTasks() {

    // Clear previous task elements
    taskList.innerHTML = "";

    // Loop through all tasks
    tasks.forEach((task, index) => {

        // Create task container
        const taskItem = document.createElement("div");
        taskItem.className = "task-item";

        // Add completed class if task is done
        if (task.completed) {
            taskItem.classList.add("completed");
        }

        // Create checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;

        // Create task title
        const taskTitle = document.createElement("span");
        taskTitle.className = "task-title";
        taskTitle.textContent = task.title;

        // Listen for checkbox changes
        checkbox.addEventListener("change", () => {

            toggleTaskStatus(index);

            renderTasks();

        });

        // Add elements to task container
        taskItem.append(checkbox, taskTitle);

        // Add task to task list
        taskList.appendChild(taskItem);

    });
}

// Display tasks
renderTasks();
