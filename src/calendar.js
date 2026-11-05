console.log("TaskFlow Calendar is running!");

// =================================
// CALENDAR ELEMENTS
// =================================

const calendarCurrentDate = document.getElementById("calendarCurrentDate");
const calendarGrid = document.getElementById("calendarGrid");

const previousDateBtn = document.getElementById("previousDate");
const nextDateBtn = document.getElementById("nextDate");
const todayBtn = document.getElementById("todayBtn");

const viewButtons = document.querySelectorAll(".calendar-view-btn");

// =================================
// CALENDAR STATE
// =================================

let currentDate = new Date();
let currentView = "day";

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

function formatDate(date, options) {
  return date.toLocaleDateString("en-US", options);
}

// =================================
// DAILY CALENDAR GRID
// =================================

function renderDayView() {
  let gridHTML = `
    <div class="day-calendar">

      <div class="day-grid-header">
        <div>Time</div>
        <div>Schedule</div>
      </div>

      <div class="day-time-grid">
  `;

  // Create 48 half-hour slots
  for (let i = 0; i < 48; i++) {
    const totalMinutes = i * 30;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const time =
      String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");

    gridHTML += `
      <div class="time-slot" data-time="${time}">
        <div class="time-label">${time}</div>
        <div class="time-slot-content"></div>
      </div>
    `;
  }

  // Current time indicator
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
}

// =================================
// CURRENT TIME INDICATOR
// =================================

function updateCurrentTimeIndicator(autoScroll = false) {
  const indicator = document.getElementById("currentTimeIndicator");

  if (!indicator) return;

  const now = new Date();

  // Check whether selected date is today
  const isToday =
    currentDate.getFullYear() === now.getFullYear() &&
    currentDate.getMonth() === now.getMonth() &&
    currentDate.getDate() === now.getDate();

  if (!isToday) {
    indicator.style.display = "none";
    return;
  }

  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Each 30-minute slot has 60px height
  const totalMinutes = hours * 60 + minutes;
  const topPosition = (totalMinutes / 30) * 60;

  indicator.style.display = "flex";
  indicator.style.top = `${topPosition}px`;

  // Automatically scroll near the current time
  if (autoScroll) {
    const timeGrid = indicator.parentElement;

    timeGrid.scrollTop = Math.max(0, topPosition - 180);
  }

  indicator.querySelector(".current-time-label").textContent =
    now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
}

// =================================
// RENDER CALENDAR
// =================================

function renderCalendar() {
  if (currentView === "day") {
    renderDayView();
  } else if (currentView === "week") {
    calendarGrid.innerHTML = `
      <p class="calendar-placeholder">
        Weekly view is coming soon.
      </p>
    `;
  } else if (currentView === "month") {
    calendarGrid.innerHTML = `
      <p class="calendar-placeholder">
        Monthly view is coming soon.
      </p>
    `;
  }
}

// =================================
// UPDATE CALENDAR HEADER
// =================================

function updateCalendarHeader() {
  if (currentView === "day") {
    calendarCurrentDate.textContent = formatDate(currentDate, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } else if (currentView === "week") {
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
  } else if (currentView === "month") {
    calendarCurrentDate.textContent = formatDate(currentDate, {
      year: "numeric",
      month: "long",
    });
  }

  renderCalendar();

  // Update current time and scroll near it
  updateCurrentTimeIndicator(true);
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
// CHANGE CALENDAR VIEW
// =================================

function changeView(view) {
  currentView = view;

  viewButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
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
// INITIALIZE CALENDAR
// =================================

updateCalendarHeader();

// Update current time every minute
setInterval(() => {
  if (currentView === "day") {
    updateCurrentTimeIndicator();
  }
}, 60000);
