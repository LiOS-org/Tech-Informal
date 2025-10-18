
const bottomNavigation = document.querySelector(".navigation_container_bottom");
const currentPage = document.documentElement.dataset.page;


function contextualBottomNavigation() {

    const navigationMap = {
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
                icon :"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-house-icon lucide-house\"><path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"/><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/></svg>"
            }
        ],
        account: [
            {
                label: "Home",
                url: "/",
                icon :"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-house-icon lucide-house\"><path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"/><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/></svg>"
            },
            {
                label: "New Channel",
                url: "#create-channel",
                icon: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-circle-plus-icon lucide-circle-plus\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M8 12h8\"/><path d=\"M12 8v8\"/></svg>"
            }
        ],
        channel: [
            {
                label: "Home",
                url: "/",
                icon :"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-house-icon lucide-house\"><path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"/><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/></svg>"
            }
        ],
        viewPost: [
            {
                label: "Home",
                url: "/",
                icon :"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-house-icon lucide-house\"><path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"/><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/></svg>"
            },
            {
                label: "Comments",
                url: "#Comments",
                icon : "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-message-square-text-icon lucide-message-square-text\"><path d=\"M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z\"/><path d=\"M7 11h10\"/><path d=\"M7 15h6\"/><path d=\"M7 7h8\"/></svg>"
            }
        ]
    };

    const navSet = navigationMap[currentPage];
    
    bottomNavigation.innerHTML = "";

    navSet.forEach(navigation => {
        const buttonIcon = document.createElement("span");
        buttonIcon.innerHTML = navigation.icon;
        buttonIcon.classList.add("navigation-icon");

        const buttonLabel = document.createElement("span");
        buttonLabel.classList.add("navigation-label");
        buttonLabel.textContent = navigation.label;

        const button = document.createElement("div");
        button.classList.add("navigation_buttons");

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

document.addEventListener("DOMContentLoaded", () => {
    contextualBottomNavigation();
});