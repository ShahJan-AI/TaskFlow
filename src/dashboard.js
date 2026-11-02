
console.log("TaskFlow Dashboard is running!");

// DASHBOARD STATISTICS

// Same storage key used in tasks.js
const STORAGE_KEY = "taskflow-tasks";

// Get HTML elements
const totalTasksElement = document.getElementById("totalTasks");
const completedTasksElement = document.getElementById("completedTasks");
const pendingTasksElement = document.getElementById("pendingTasks");

// Read real tasks from Local Storage
function getTasks() {
    try {
        const savedTasks = JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        );

        return Array.isArray(savedTasks) ? savedTasks : [];

    } catch (error) {
        console.error("Could not load tasks:", error);
        return [];
    }
}

// =================================
// UPDATE DASHBOARD STATISTICS
// =================================

function updateDashboardStats() {

    const tasks = getTasks();

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
        task => task.completed === true
    ).length;

    const pendingTasks = totalTasks - completedTasks;

    if (totalTasksElement) {
        totalTasksElement.textContent = totalTasks;
    }

    if (completedTasksElement) {
        completedTasksElement.textContent = completedTasks;
    }

    if (pendingTasksElement) {
        pendingTasksElement.textContent = pendingTasks;
    }
}

// Initial update
updateDashboardStats();

// Update when Local Storage changes in another tab
window.addEventListener("storage", (event) => {

    if (event.key === STORAGE_KEY) {
        updateDashboardStats();
    }

});
