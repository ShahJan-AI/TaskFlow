
console.log("TaskFlow Calendar is running!");

// =================================
// ELEMENTS
// =================================

const calendarCurrentDate = document.getElementById("calendarCurrentDate");
const calendarGrid = document.getElementById("calendarGrid");

const previousDateBtn = document.getElementById("previousDate");
const nextDateBtn = document.getElementById("nextDate");
const todayBtn = document.getElementById("todayBtn");

const viewButtons = document.querySelectorAll(".calendar-view-btn");
const unscheduledTasksContainer = document.getElementById("unscheduledTasks");

// =================================
// STORAGE
// =================================

const STORAGE_KEY = "taskflow-tasks";

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedTasks) ? savedTasks : [];
  } catch (error) {
    console.error("Could not load tasks:", error);
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getTasks() {
  return loadTasks();
}

// =================================
// CALENDAR STATE
// =================================

let currentDate = new Date();
let currentView = "day";

const DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

const SLOT_HEIGHT = 60;

// =================================
// DATE HELPERS
// =================================

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getWeekStart(date) {
  const result = new Date(date);
  const daysSinceSaturday = (result.getDay() + 1) % 7;

  result.setDate(result.getDate() - daysSinceSaturday);

  return result;
}

function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(date, options) {
  return date.toLocaleDateString("en-US", options);
}

function getTimeString(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function getDateFromString(dateString) {
  return new Date(`${dateString}T00:00:00`);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[character];
  });
}

// =================================
// TASK HELPERS
// =================================

function getTaskDuration(task) {
  if (!task.startAt || !task.endAt) {
    return 60;
  }

  const [startHour, startMinute] = task.startAt.split(":").map(Number);
  const [endHour, endMinute] = task.endAt.split(":").map(Number);

  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  return Math.max(30, end - start);
}


function getTaskHTML(task) {
  const priority = ["high", "medium", "low"].includes(task.priority)
    ? task.priority
    : "medium";

  const height = task.startAt
    ? Math.max(54, getTaskDuration(task) * 2 - 6)
    : 54;

  return `
    <div
      class="calendar-task priority-${priority} ${task.completed ? "task-completed" : ""}"
      draggable="true"
      data-task-id="${escapeHTML(task.id)}"
      style="--task-height: ${height}px"
      title="${escapeHTML(task.title)}"
    >
      <strong>${escapeHTML(task.title)}</strong>
      ${
        task.startAt
          ? `<span>${escapeHTML(task.startAt)}${task.endAt ? ` - ${escapeHTML(task.endAt)}` : ""}</span>`
          : ""
      }
    </div>
  `;
}

function moveTask(taskId, newDate, newTime) {
  const tasks = getTasks();

  const task = tasks.find((item) => item.id === taskId);

  if (!task) return;

  const duration = task.startAt ? getTaskDuration(task) : 60;

  task.dueDate = newDate;
  task.startAt = newTime;

  const [hours, minutes] = newTime.split(":").map(Number);
  const endMinutes = hours * 60 + minutes + duration;

  if (endMinutes <= 1440) {
    task.endAt = getTimeString(endMinutes);
  } else {
    task.endAt = null;
  }

  saveTasks(tasks);

  renderCalendar();
}

// =================================
// DRAG AND DROP
// =================================

let draggedTaskId = null;

function setupDragAndDrop() {
  document.querySelectorAll(".calendar-task").forEach((taskElement) => {
    taskElement.addEventListener("dragstart", (event) => {
      draggedTaskId = taskElement.dataset.taskId;

      event.dataTransfer.setData("text/plain", draggedTaskId);
      event.dataTransfer.effectAllowed = "move";

      taskElement.classList.add("dragging");
    });

    taskElement.addEventListener("dragend", () => {
      taskElement.classList.remove("dragging");

      document.querySelectorAll(".calendar-drop-zone").forEach((zone) => {
        zone.classList.remove("drag-over");
      });

      draggedTaskId = null;
    });
  });

  document.querySelectorAll(".calendar-drop-zone").forEach((zone) => {
    zone.addEventListener("dragover", (event) => {
      event.preventDefault();
      zone.classList.add("drag-over");
      event.dataTransfer.dropEffect = "move";
    });

    zone.addEventListener("dragleave", (event) => {
      if (!zone.contains(event.relatedTarget)) {
        zone.classList.remove("drag-over");
      }
    });

    zone.addEventListener("drop", (event) => {
      event.preventDefault();

      zone.classList.remove("drag-over");

      const taskId =
        event.dataTransfer.getData("text/plain") || draggedTaskId;

      if (!taskId) return;

      moveTask(taskId, zone.dataset.date, zone.dataset.time);
    });
  });
}

// =================================
// DAILY VIEW
// =================================

function renderDayView() {
  const selectedDate = toDateString(currentDate);
  const tasks = getTasks();

  let gridHTML = `
    <div class="day-calendar">

      <div class="day-grid-header">
        <div>Time</div>
        <div>${formatDate(currentDate, {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}</div>
      </div>

      <div class="day-time-grid">
  `;

  for (let i = 0; i < 48; i++) {
    const minutes = i * 30;
    const time = getTimeString(minutes);

    const slotTasks = tasks.filter(
      (task) =>
        task.dueDate === selectedDate &&
        task.startAt === time
    );

    gridHTML += `
      <div class="time-slot" data-time="${time}">
        <div class="time-label">${time}</div>

        <div
          class="time-slot-content calendar-drop-zone"
          data-date="${selectedDate}"
          data-time="${time}"
        >
          ${slotTasks.map(getTaskHTML).join("")}
        </div>
      </div>
    `;
  }

  gridHTML += `
      <div id="currentTimeIndicator" class="current-time-indicator">
        <span class="current-time-label"></span>
        <span class="current-time-line"></span>
      </div>
      </div>

      <div class="day-grid-end">24:00</div>
    </div>
  `;

  calendarGrid.innerHTML = gridHTML;

  setupDragAndDrop();
  updateCurrentTimeIndicator(true);
}

// =================================
// WEEK VIEW
// =================================

function renderWeekView() {
  const weekStart = getWeekStart(currentDate);
  const tasks = getTasks();

  let weekHTML = `
    <div class="week-calendar">

      <div class="week-calendar-scroll">

        <div class="week-grid">

          <div class="week-header week-time-heading">
            Time
          </div>
  `;

  const weekDates = [];

  // Create seven day headers
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const dateString = toDateString(date);

    weekDates.push(dateString);

    const isSelected =
      toDateString(currentDate) === dateString;

    const isToday =
      toDateString(new Date()) === dateString;

    weekHTML += `
      <button
        type="button"
        class="week-header week-day-heading ${isSelected ? "selected-day" : ""} ${isToday ? "today-day" : ""}"
        data-open-date="${dateString}"
      >
        <span>${DAYS[i]}</span>
        <strong>${date.getDate()}</strong>
      </button>
    `;
  }

  
  // Unscheduled tasks row
  weekHTML += `
    <div class="week-unscheduled-label">
      Tasks
    </div>
  `;

  for (let day = 0; day < 7; day++) {
    const dateString = weekDates[day];

    const unscheduled = tasks.filter(
      (task) =>
        task.dueDate === dateString &&
        !task.startAt &&
        !task.completed
    );

    weekHTML += `
      <div class="week-unscheduled-cell">
        ${unscheduled.map(getTaskHTML).join("")}
      </div>
    `;
  }

  // Unscheduled tasks row
  weekHTML += `
    <div class="week-unscheduled-label">
      Tasks
    </div>
  `;

  for (let day = 0; day < 7; day++) {
    const dateString = weekDates[day];

    const unscheduled = tasks.filter(
      (task) =>
        task.dueDate === dateString &&
        !task.startAt &&
        !task.completed
    );

    weekHTML += `
      <div class="week-unscheduled-cell">
        ${unscheduled.map(getTaskHTML).join("")}
      </div>
    `;
  }

  // Time labels
  for (let slot = 0; slot < 48; slot++) {
    const time = getTimeString(slot * 30);

    weekHTML += `
      <div class="week-time-label">
        ${slot % 2 === 0 ? time : ""}
      </div>
    `;

    // Seven day columns for each time slot
    for (let day = 0; day < 7; day++) {
      const dateString = weekDates[day];

      const slotTasks = tasks.filter(
        (task) =>
          task.dueDate === dateString &&
          task.startAt === time
      );

      weekHTML += `
        <div
          class="week-time-slot calendar-drop-zone"
          data-date="${dateString}"
          data-time="${time}"
        >
          ${slotTasks.map(getTaskHTML).join("")}
        </div>
      `;
    }
  }

  weekHTML += `
        </div>
      </div>
    </div>
  `;

  calendarGrid.innerHTML = weekHTML;

  // Open daily view when clicking a day header
  document.querySelectorAll("[data-open-date]").forEach((button) => {
    button.addEventListener("click", () => {
      currentDate = getDateFromString(button.dataset.openDate);
      changeView("day");
    });
  });

  setupDragAndDrop();
}

// =================================
// MONTH VIEW PLACEHOLDER
// =================================

function renderMonthView() {
  calendarGrid.innerHTML = `
    <div class="calendar-placeholder">
      <i class="fa-regular fa-calendar"></i>
      <h3>Monthly View</h3>
      <p>Monthly calendar will be implemented next.</p>
    </div>
  `;
}

// =================================
// UNSCHEDULED TASKS
// =================================

function renderUnscheduledTasks() {
  if (!unscheduledTasksContainer) return;

  const tasks = getTasks();

  const unscheduled = tasks.filter(
    (task) =>
      task.dueDate === toDateString(currentDate) &&
      !task.startAt &&
      !task.completed
  );

  if (unscheduled.length === 0) {
    unscheduledTasksContainer.innerHTML = `
      <p class="empty-unscheduled">
        No unscheduled tasks for this day.
      </p>
    `;

    return;
  }

  unscheduledTasksContainer.innerHTML = unscheduled
    .map(getTaskHTML)
    .join("");

  // Make unscheduled tasks draggable
  unscheduledTasksContainer
    .querySelectorAll(".calendar-task")
    .forEach((taskElement) => {
      taskElement.addEventListener("dragstart", (event) => {
        draggedTaskId = taskElement.dataset.taskId;
        event.dataTransfer.setData("text/plain", draggedTaskId);
        event.dataTransfer.effectAllowed = "move";
      });

      taskElement.addEventListener("dragend", () => {
        draggedTaskId = null;
      });
    });
}

// =================================
// CURRENT TIME INDICATOR
// =================================

function updateCurrentTimeIndicator(autoScroll = false) {
  const indicator = document.getElementById("currentTimeIndicator");

  if (!indicator) return;

  const now = new Date();

  const isToday =
    toDateString(currentDate) === toDateString(now);

  if (!isToday) {
    indicator.style.display = "none";
    return;
  }

  const totalMinutes = now.getHours() * 60 + now.getMinutes();

  const topPosition = (totalMinutes / 30) * SLOT_HEIGHT;

  indicator.style.display = "flex";
  indicator.style.top = `${topPosition}px`;

  indicator.querySelector(".current-time-label").textContent =
    now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

  if (autoScroll) {
    const timeGrid = indicator.parentElement;

    timeGrid.scrollTop = Math.max(0, topPosition - 180);
  }
}

// =================================
// RENDER CALENDAR
// =================================


function renderCalendar() {
  const unscheduledSection = document.querySelector(
    ".unscheduled-section"
  );

  if (unscheduledSection) {
    unscheduledSection.style.display =
      currentView === "week" ? "none" : "";
  }

  if (currentView === "day") {
    renderDayView();
  } else if (currentView === "week") {
    renderWeekView();
  } else if (currentView === "month") {
    renderMonthView();
  }

  renderUnscheduledTasks();
}


// =================================
// UPDATE HEADER
// =================================

function updateCalendarHeader() {
  if (currentView === "day") {
    calendarCurrentDate.textContent = formatDate(currentDate, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (currentView === "week") {
    const weekStart = getWeekStart(currentDate);
    const weekEnd = addDays(weekStart, 6);

    const startText = formatDate(weekStart, {
      month: "short",
      day: "numeric",
    });

    const endText = formatDate(weekEnd, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    calendarCurrentDate.textContent = `${startText} – ${endText}`;
  }

  if (currentView === "month") {
    calendarCurrentDate.textContent = formatDate(currentDate, {
      year: "numeric",
      month: "long",
    });
  }

  renderCalendar();
}

// =================================
// CHANGE DATE
// =================================

function changeDate(direction) {
  if (currentView === "day") {
    currentDate = addDays(currentDate, direction);
  } else if (currentView === "week") {
    currentDate = addDays(currentDate, direction * 7);
  } else if (currentView === "month") {
    currentDate.setMonth(currentDate.getMonth() + direction);
  }

  updateCalendarHeader();
}

// =================================
// CHANGE VIEW
// =================================

function changeView(view) {
  currentView = view;

  viewButtons.forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.view === view
    );
  });

  updateCalendarHeader();
}

// =================================
// EVENT LISTENERS
// =================================

previousDateBtn.addEventListener("click", () => {
  changeDate(-1);
});

nextDateBtn.addEventListener("click", () => {
  changeDate(1);
});

todayBtn.addEventListener("click", () => {
  currentDate = new Date();
  updateCalendarHeader();
});

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    changeView(button.dataset.view);
  });
});

// =================================
// INITIALIZE
// =================================

updateCalendarHeader();

setInterval(() => {
  if (currentView === "day") {
    updateCurrentTimeIndicator();
  }
}, 60000);
