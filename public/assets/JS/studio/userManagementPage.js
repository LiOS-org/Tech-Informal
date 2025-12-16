import { db, userData } from "../authentication.js"
import { virtualDom } from "./studio.js";
import {getDocs,collection} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
export async function userManagementPage() {
    if (userData.role == "owner" || "mod") {
        const userManagement = document.createElement("div");
        userManagement.classList.add("studio-user-management", "page");
        userManagement.innerHTML = //html
        `
            <div class = "lios-card-title"><span>User Management</span><div>
            <div class = "lios-table studio-user-table">
                <div class = "lios-table-header frosted_background">
                    <div><span>User Name</span></div>
                    <div><span>User Id</span></div>
                    <div><span>Email</span></div>
                    <div><span>Role</span></div>
                    <div><span>Actions</span></div>
                </div>
                <div class = "lios-table-contents">
                    <!-- User rows will be populated here -->
                </div>
            </div>
        `;
        virtualDom.innerHTML = "";
        virtualDom.appendChild(userManagement);

        const tableRowContainer = userManagement.querySelector(".lios-table-contents");
        const users = await getDocs(collection(db, "users"));
        
        users.forEach(user => {
            const userData = user.data();
            const userRow = document.createElement("div");
            userRow.classList.add("lios-table-row","frosted_background");
            userRow.innerHTML = //html
                `
                <div><span>${userData.Name || "N/A"}</span></div>
                <div><span>${userData.uid}</span></div>
                <div><span>${userData.Email || "N/A"}</span></div>
                <div><span>${userData.role || "N/A"}</span></div>
                <div></div>
            `;
            tableRowContainer.appendChild(userRow);
        });

    } else {
        console.log("You were not supposed to be here");
    };
}