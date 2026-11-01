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