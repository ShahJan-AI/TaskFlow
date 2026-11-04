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

// Filter elements
const statusFilter = document.getElementById("statusFilter");
const sortFilter = document.getElementById("sortFilter");
const groupFilter = document.getElementById("groupFilter");

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
  String(today.getDate()).padStart(2, "0"),
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
  const dailyTasks = tasks.filter((task) => task.dueDate === dueDate);

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
    completed: false,
    createdAt: new Date().toISOString(),

    // Calendar fields
    startAt: null,
    endAt: null,
    reminderMinutes: null,
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
// TASK DATE GROUPING
// =================================

// Get today's date in YYYY-MM-DD format
function getTodayString() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Add days to a date string
function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);

  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Find Friday of the current Saturday-Friday week
function getWeekEnd(todayString) {
  const todayDate = new Date(`${todayString}T00:00:00`);

  // Saturday = 0, Sunday = 1, ..., Friday = 6
  const daysSinceSaturday = (todayDate.getDay() + 1) % 7;

  return addDays(todayString, 6 - daysSinceSaturday);
}

// =================================
// FILTER AND SORT TASKS
// =================================

function getFilteredTasks() {
  const status = statusFilter.value;
  const sortBy = sortFilter.value;

  // Filter by status
  let filteredTasks = tasks.filter((task) => {
    if (status === "pending") {
      return !task.completed;
    }

    if (status === "completed") {
      return task.completed;
    }

    return true;
  });

  // Keep original position for stable sorting
  const indexedTasks = filteredTasks.map((task, index) => ({
    task,
    index,
  }));

  // Sort tasks
  indexedTasks.sort((a, b) => {
    const taskA = a.task;
    const taskB = b.task;

    if (sortBy === "date") {
      return taskA.dueDate.localeCompare(taskB.dueDate) || a.index - b.index;
    }

    if (sortBy === "newest" || sortBy === "oldest") {
      const timeA = taskA.createdAt
        ? new Date(taskA.createdAt).getTime() || 0
        : 0;

      const timeB = taskB.createdAt
        ? new Date(taskB.createdAt).getTime() || 0
        : 0;

      const difference = timeA - timeB;

      return sortBy === "newest"
        ? -difference || a.index - b.index
        : difference || a.index - b.index;
    }

    if (sortBy === "priority") {
      const priorityOrder = {
        high: 1,
        medium: 2,
        low: 3,
      };

      return (
        (priorityOrder[taskA.priority] || 4) -
          (priorityOrder[taskB.priority] || 4) || a.index - b.index
      );
    }

    return a.index - b.index;
  });

  return indexedTasks.map((item) => item.task);
}

// =================================
// CREATE TASK GROUPS
// =================================

function getTaskGroups(sortedTasks) {
  const today = getTodayString();
  const tomorrow = addDays(today, 1);
  const weekEnd = getWeekEnd(today);

  const groups = {
    overdue: [],
    today: [],
    tomorrow: [],
    thisWeek: [],
    future: [],
    completed: [],
  };

  sortedTasks.forEach((task) => {
    // Completed tasks have their own group
    if (task.completed) {
      groups.completed.push(task);
      return;
    }

    if (task.dueDate < today) {
      groups.overdue.push(task);
    } else if (task.dueDate === today) {
      groups.today.push(task);
    } else if (task.dueDate === tomorrow) {
      groups.tomorrow.push(task);
    } else if (task.dueDate <= weekEnd) {
      groups.thisWeek.push(task);
    } else {
      groups.future.push(task);
    }
  });

  return groups;
}

// =================================
// CREATE TASK ELEMENT
// =================================

function createTaskElement(task) {
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
    tasks = tasks.filter((item) => item.id !== task.id);

    saveTasks();
    renderTasks();
  });

  taskItem.append(checkbox, taskDetails, deleteButton);

  return taskItem;
}

// =================================
// DISPLAY TASKS
// =================================

function renderTasks() {
  taskList.innerHTML = "";

  // Get filtered and sorted tasks
  const filteredTasks = getFilteredTasks();

  // Update task count
  taskCount.textContent =
    filteredTasks.length === tasks.length
      ? `${tasks.length} tasks added`
      : `${filteredTasks.length} of ${tasks.length} tasks shown`;

  // Handle empty results
  emptyTasks.style.display = filteredTasks.length === 0 ? "block" : "none";

  emptyTasks.textContent =
    tasks.length === 0
      ? "No tasks yet. Add your first task!"
      : "No tasks match your filters.";

  if (filteredTasks.length === 0) {
    return;
  }

  // No grouping
  if (groupFilter.value === "none") {
    filteredTasks.forEach((task) => {
      taskList.appendChild(createTaskElement(task));
    });

    return;
  }

  // Group tasks by date period
  const groups = getTaskGroups(filteredTasks);

  const groupInfo = [
    { key: "overdue", title: "Overdue" },
    { key: "today", title: "Today" },
    { key: "tomorrow", title: "Tomorrow" },
    { key: "thisWeek", title: "This Week" },
    { key: "future", title: "Future" },
    { key: "completed", title: "Completed" },
  ];

  groupInfo.forEach((group) => {
    const groupTasks = groups[group.key];

    if (groupTasks.length === 0) {
      return;
    }

    const groupSection = document.createElement("section");
    groupSection.className = "task-group";

    const groupTitle = document.createElement("h3");
    groupTitle.className = "task-group-title";
    groupTitle.textContent = `${group.title} (${groupTasks.length})`;

    groupSection.appendChild(groupTitle);

    groupTasks.forEach((task) => {
      groupSection.appendChild(createTaskElement(task));
    });

    taskList.appendChild(groupSection);
  });
}

// =================================
// FILTER EVENTS
// =================================

statusFilter.addEventListener("change", renderTasks);

sortFilter.addEventListener("change", renderTasks);

groupFilter.addEventListener("change", renderTasks);
renderTasks();
