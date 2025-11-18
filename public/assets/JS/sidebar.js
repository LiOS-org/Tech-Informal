import { readUserData, userData, waitForUser } from "./authentication.js";
import { populateFragments } from "./fragments.js";
import { closeSidebar, constructSidebar, updateSidearEventListner } from "./navigation.js";
// import { channels, dashboard } from "./studio/studio.js";
// import { userManagementPage } from "./studio/userManagementPage.js";

const urlParams = new URLSearchParams(window.location.search);
const currentViewPage = urlParams.get("currentPage");
await constructSidebar();
const sidebar = document.querySelector(".sidebar");
const virtualDom = document.querySelector(".virtual-dom-container");
let currentPage = document.documentElement.dataset.page;
let pageButtonSelector = currentPage
    .replace(/([a-z])([A-Z])/g, "$1-$2") // inserts a hyphen between lowercase→uppercase
    .toLowerCase(); // makes everything lowercase
let sidebarMap = {};
let buttonsContainer;
await readUserData();

document.querySelector(".sidebar-close-button").addEventListener("click", () => {
    closeSidebar();
});
export async function loadSidebar() {
    await populateFragments();
    const profilePicture = document.querySelector(".sidebar-profile-picture");
    const profileName = document.querySelector(".sidebar-profile-name");


    profilePicture.src = userData.PhotoURL;
    profileName.textContent = userData.Name;
    buttonsContainer = document.querySelector(".sidebar-button-container");
    if (currentPage == "studio") {
        sidebarMap = {
            buttons: [
                // {}
            ]
        };
    } else{
        sidebarMap = {
            buttons: [
                {
                    label: "Home",
                    icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-house-icon lucide-house\"><path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"/><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/></svg>",
                    action: () => {
                        window.location.href = "/";
                    }
                },
                {
                    label: "Account",
                    url: "/account",
                    icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-user-round-icon lucide-user-round\"><circle cx=\"12\" cy=\"8\" r=\"5\"/><path d=\"M20 21a8 8 0 0 0-16 0\"/></svg>"
                },
                {
                    label: "All Posts",
                    url: "/all-posts",
                    icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-newspaper-icon lucide-newspaper\"><path d=\"M15 18h-5\"/><path d=\"M18 14h-8\"/><path d=\"M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2\"/><rect width=\"8\" height=\"4\" x=\"10\" y=\"6\" rx=\"1\"/></svg>"
                },
                {
                    label: "About",
                    action: () => {
                        window.location.href = "#About";
                        closeSidebar();
                    },
                    icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-info-icon lucide-info\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16v-4\"/><path d=\"M12 8h.01\"/></svg>"
                },
                {
                    label: "Github",
                    url: "https://github.com/LiOS-org/Tech-Informal",
                    icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-github-icon lucide-github\"><path d=\"M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4\"/><path d=\"M9 18c-4.51 2-5-2-7-2\"/></svg>"
                }
            ]
        };
    };
};
await loadSidebar();
export async function constructSidebarButtons() {
    sidebarMap.buttons.forEach(button => {
        const navigation = document.createElement("div");
        navigation.classList.add("sidebar-button", "frosted_background", `${button.label.toLowerCase().trim().replace(/\s+/g, "-")}`);
        navigation.innerHTML = //html
            `
            <span>${button.icon}</span><span>${button.label}</span>
            `
        navigation.addEventListener("click", () => {
            document.querySelectorAll(".sidebar-button").forEach(selector => {
                selector.classList.remove("active");
                if (window.innerWidth <= 768) {
                    closeSidebar();
                }
            });
            if (currentPage != "studio") {
                sidebar.querySelector(`.${pageButtonSelector}`).classList.add("active");
            }
            if (currentPage == "studio") {
                document.querySelector(`.${button.label.toLowerCase().trim().replace(/\s+/g, "-")}`).classList.add("active");
                urlParams.set("currentPage", `${button.label.toLowerCase().trim().replace(/\s+/g, "-")}`);
                const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
                window.history.replaceState({}, "", newUrl);
            };
            if (button.action) {
                button.action(); // Execute function if provided
            } else if (button.url) {
                window.location.href = button.url;
            } else {
                console.warn(`No action or URL defined for ${button.label}`);
            }
        });
        buttonsContainer.appendChild(navigation);
    });
};
const updateSidebarButtonStatus = async () => {
    await constructSidebarButtons();
    if (currentViewPage) {

        if (currentPage == "studio") {
            pageButtonSelector = currentViewPage;
        };
        console.log(currentViewPage);
        document.querySelector(`.sidebar-button.${pageButtonSelector}`).classList.add("active");
    }
    else {
        if (currentPage == "studio") {
            document.querySelector(`.sidebar-button.dashboard`).classList.add("active");
        } else {
            if (currentPage == "viewPost") {
                document.querySelector(`.sidebar-button.home`).classList.add("active");
            } else {
                document.querySelector(`.sidebar-button.${pageButtonSelector}`).classList.add("active");
            };
        };
    };
};
updateSidebarButtonStatus();
// Exports 
export { sidebarMap,updateSidebarButtonStatus};