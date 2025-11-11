import { readUserData, userData, waitForUser } from "./authentication.js";
import { channels, dashboard } from "./studio/studio.js";
import { userManagementPage } from "./studio/userManagementPage.js";

const urlParams = new URLSearchParams(window.location.search);
const currentViewPage = urlParams.get("currentPage");

const sidebar = document.querySelector(".sidebar");
const virtualDom = document.querySelector(".virtual-dom-container");
const currentPage = document.documentElement.dataset.page;
let navigationMap;
let buttonsContainer;
let closeSidebar;
await readUserData();
export function loadSidebar() {
    const profilePicture = document.querySelector(".sidebar-profile-picture");
    const profileName = document.querySelector(".sidebar-profile-name");

    closeSidebar = () => {
        
        const sidebar = document.querySelector(".sidebar")
        sidebar.style.transform = "translateX(-105%)";
        sidebar.style.width = "300px";
        sidebar.style.height = "80%";
        sidebar.style.top = "10%";
        sidebar.style.borderRadius = "15px";
        
    };
    document.querySelector(".sidebar-close-button").addEventListener("click", () => {
        closeSidebar();
    })

    profilePicture.src = userData.PhotoURL;
    profileName.textContent = userData.Name;
    if (currentPage == "studio") {
        buttonsContainer = document.querySelector(".sidebar-button-container")
        navigationMap = {
            buttons: [
                {
                    "label": "Dashboard",
                    "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-gauge-icon lucide-gauge\"><path d=\"m12 14 4-4\"/><path d=\"M3.34 19a10 10 0 1 1 17.32 0\"/></svg>",
                    "action": () => {
                        virtualDom.innerHTML = "";
                        virtualDom.appendChild(dashboard);                        
                    }
                }
            ]
        };
    };
    if (userData.role == "owner" || "mod") {
        navigationMap.buttons.push(
            {
                "label": "Channels",
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-rss-icon lucide-rss\"><path d=\"M4 11a9 9 0 0 1 9 9\"/><path d=\"M4 4a16 16 0 0 1 16 16\"/><circle cx=\"5\" cy=\"19\" r=\"1\"/></svg>",
                "action": () => {
                    virtualDom.innerHTML = "";
                    virtualDom.appendChild(channels);
                }
            },
            {
                "label": "User Management",
                "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-user-cog-icon lucide-user-cog\"><path d=\"M10 15H6a4 4 0 0 0-4 4v2\"/><path d=\"m14.305 16.53.923-.382\"/><path d=\"m15.228 13.852-.923-.383\"/><path d=\"m16.852 12.228-.383-.923\"/><path d=\"m16.852 17.772-.383.924\"/><path d=\"m19.148 12.228.383-.923\"/><path d=\"m19.53 18.696-.382-.924\"/><path d=\"m20.772 13.852.924-.383\"/><path d=\"m20.772 16.148.924.383\"/><circle cx=\"18\" cy=\"15\" r=\"3\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/></svg>",
                "action": () => {
                    userManagementPage()
                }
            }
        );
    };

    navigationMap.buttons.forEach(button => {
        const navigation = document.createElement("div");
        navigation.classList.add("sidebar-button", "frosted_background",`${button.label.toLowerCase().trim().replace(/\s+/g, "-")}`);
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
            document.querySelector(`.${button.label.toLowerCase().trim().replace(/\s+/g, "-")}`).classList.add("active");
            urlParams.set("currentPage", `${button.label.toLowerCase().trim().replace(/\s+/g, "-")}`);
            const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
            window.history.replaceState({}, "", newUrl);
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
    if (currentViewPage) {
        document.querySelector(`.sidebar-button.${currentViewPage}`).classList.add("active");
    } else {
        document.querySelector(`.sidebar-button.dashboard`).classList.add("active");
    };
};
virtualDom.addEventListener("click", () => {
    closeSidebar();
});