import { populateFragments } from "./fragments.js";
import { loadSidebar } from "./sidebar.js";

const bottomNavigation = document.querySelector(".navigation_container_bottom");
export { bottomNavigation };
const currentPage = document.documentElement.dataset.page;
export { currentPage };

export async function openSidebar() {
    const sidebar = document.querySelector(".sidebar");
    if (window.innerWidth <= 768) {
        sidebar.style.inset = "unset";
        sidebar.style.transform = "translateX(0%)";
        sidebar.style.width = "calc(100% - 2*var(--padding))";
        sidebar.style.height = "calc(100% - 2*var(--padding))";
        sidebar.style.inset = "0";
        sidebar.style.borderRadius = "0";
    } else {
        sidebar.style.transform = "translateX(0%)";
    };
};
let closeSidebar;
let updateSidearEventListner;
closeSidebar = () => {
    const sidebar = document.querySelector(".sidebar");
    
    sidebar.style.inset = "unset";
    sidebar.style.transform = "translateX(-115%)";
    sidebar.style.width = "300px";
    sidebar.style.height = "80%";
    sidebar.style.inset = "unset";
    sidebar.style.left = "0";
    sidebar.style.top = "10%";
    sidebar.style.bottom = "10%";
    sidebar.style.borderRadius = "15px";
    updateSidearEventListner("remove");
};
const closeOnBodyClick = () => {
    closeSidebar();
};
updateSidearEventListner = (action) => {
    const docBody = document.body;

    if (action === "add") {
        docBody.addEventListener("click", closeOnBodyClick);
    } else if (action === "remove") {
        docBody.removeEventListener("click", closeOnBodyClick);
    }
};

export { closeSidebar, updateSidearEventListner };
await populateFragments();
const openSidebarButton = document.querySelector(".nav-sidebar");
openSidebarButton.addEventListener("click", async (e) => {
    e.stopPropagation(); // IMPORTANT so the click doesn't immediately close sidebar
    await openSidebar();
    updateSidearEventListner("add");
});

let navigationMap;
export const constructNavigationMap = async() => {
    navigationMap = {
        home: [
            {
                label: "All Posts",
                url: "all-posts",
                icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-newspaper-icon lucide-newspaper\"><path d=\"M15 18h-5\"/><path d=\"M18 14h-8\"/><path d=\"M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2\"/><rect width=\"8\" height=\"4\" x=\"10\" y=\"6\" rx=\"1\"/></svg>"
            },
            {
                label: "Account",
                url: "account",
                icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-user-round-icon lucide-user-round\"><circle cx=\"12\" cy=\"8\" r=\"5\"/><path d=\"M20 21a8 8 0 0 0-16 0\"/></svg>"
            }
        ],
        allPosts: [
            {
                label: "Home",
                url: "/",
                icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-house-icon lucide-house\"><path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"/><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/></svg>"
            }
        ],
        account: [
            {
                label: "Home",
                url: "/",
                icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-house-icon lucide-house\"><path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"/><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/></svg>"
            },
            {
                label: "New Channel",
                url: "#create-channel",
                icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-circle-plus-icon lucide-circle-plus\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M8 12h8\"/><path d=\"M12 8v8\"/></svg>"
            },
            {
                label: "Studio",
                url: "../studio",
                icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-layout-dashboard-icon lucide-layout-dashboard\"><rect width=\"7\" height=\"9\" x=\"3\" y=\"3\" rx=\"1\"/><rect width=\"7\" height=\"5\" x=\"14\" y=\"3\" rx=\"1\"/><rect width=\"7\" height=\"9\" x=\"14\" y=\"12\" rx=\"1\"/><rect width=\"7\" height=\"5\" x=\"3\" y=\"16\" rx=\"1\"/></svg>"
            }
        ],
        channel: [
            {
                label: "Home",
                url: "/",
                icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-house-icon lucide-house\"><path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"/><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/></svg>"
            },
            {
                label: "Account",
                url: "../account",
                icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-user-round-icon lucide-user-round\"><circle cx=\"12\" cy=\"8\" r=\"5\"/><path d=\"M20 21a8 8 0 0 0-16 0\"/></svg>"
            }
        ],
        viewPost: [
            {
                label: "Home",
                url: "/",
                icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-house-icon lucide-house\"><path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"/><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/></svg>"
            },
            {
                label: "Comments",
                url: "#Comments",
                icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-message-square-text-icon lucide-message-square-text\"><path d=\"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z\"/><path d=\"M7 11h10\"/><path d=\"M7 15h6\"/><path d=\"M7 7h8\"/></svg>"
            }
        ],
        studio: [
            {
                label: "Home",
                url: "/",
                icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-house-icon lucide-house\"><path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"/><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/></svg>"
            },
            {
                label: "Account",
                url: "../account",
                icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-user-round-icon lucide-user-round\"><circle cx=\"12\" cy=\"8\" r=\"5\"/><path d=\"M20 21a8 8 0 0 0-16 0\"/></svg>"
            }
        ]
    };
};
let navSet;
await constructNavigationMap();
export async function contextualBottomNavigation() {
    navSet = navigationMap[currentPage];
    
    bottomNavigation.innerHTML = "";

    navSet.forEach(navigation => {
        const buttonIcon = document.createElement("span");
        buttonIcon.innerHTML = navigation.icon;
        buttonIcon.classList.add("navigation-icon");

        const buttonLabel = document.createElement("span");
        buttonLabel.classList.add("navigation-label");
        buttonLabel.textContent = navigation.label;

        const button = document.createElement("div");
        button.classList.add("navigation_buttons",navigation.label.toLowerCase().replace(/\s+/g, '-'));

        button.addEventListener("click", () => {
            if (navigation.action) {
                navigation.action(); // Execute function if provided
            } else if (navigation.url) {
                window.location.href = navigation.url;
            } else {
                console.warn(`No action or URL defined for ${navigation.label}`);
            }
        });

        button.appendChild(buttonIcon);
        button.appendChild(buttonLabel);
        bottomNavigation.appendChild(button);
    });
};
contextualBottomNavigation();
document.addEventListener("DOMContentLoaded", () => {
    contextualBottomNavigation();
});
// Construct Sidebar
export async function constructSidebar() {
    const sidebarPanel = document.createElement("nav");
    sidebarPanel.classList.add("sidebar", "frosted_background");
    sidebarPanel.innerHTML = //html
        `
    <div class="sidebar-close-button"><span>Close Sidebar</span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-panel-right-open-icon lucide-panel-right-open"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/><path d="m10 15-3-3 3-3"/></svg></div>
    <div class="profile-picture-container">
      <img alt="Profile Picture" class="profile-picture sidebar-profile-picture">
    </div>
    <div class="lios-card-title"><span class="sidebar-profile-name"></span></div>
    <hr>
    <div class="sidebar-button-container"></div>
    `;
    document.documentElement.appendChild(sidebarPanel);
};
// Exports 
export { navigationMap };
// Load Sidebar
    loadSidebar();
// Event listner for lios-nav-title
const eventListnerForLiosNavTitle = (async () => {
    await populateFragments();
    document.querySelector(".lios-nav-title").addEventListener("click", () => {
        window.location.replace("/");
    });
})();