import  app  from "../../firebase.js";
import { waitForUser, userId, userData, readUserData } from "./authentication.js";
import { getFirestore, doc, getDoc, } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { boldText } from "../../LiOS-InkWell/modules/js/boldText.js";
import { italicText } from "../../LiOS-InkWell/modules/js/italicText.js";
import { underlineText } from "../../LiOS-InkWell/modules/js/underlineText.js";
import { insertHeading } from "../../LiOS-InkWell/modules/js/headings.js";
import { createLink } from "../../LiOS-InkWell/modules/js/newLink.js";
import { insertImage } from "../../LiOS-InkWell/modules/js/imageInsertion.js";
import { lineBreak } from "../../LiOS-InkWell/modules/js/LineBreak.js";
import { divider } from "../../LiOS-InkWell/modules/js/divider.js";

await readUserData();
const urlParams = new URLSearchParams(window.location.search);
const createOn = urlParams.get("createOn");
const db = getFirestore(app);
let link;
let postTitle;
let postContents;
let postTags;
let publishPost;
let uniqueTags;
if (userData.canCreateChannels === true) {  
    // Event listeners for editor
    let savedRange = null;
    const selection = window.getSelection();
    function saveSelection() {
        if (selection.rangeCount > 0) {
            savedRange = selection.getRangeAt(0).cloneRange();
        }
    }
    function restoreSelection() {
        if (savedRange) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedRange);
        }
    }
    const inkwellInput = document.querySelector(".postBody");
    inkwellInput.addEventListener("keyup", saveSelection);
    inkwellInput.addEventListener("mouseup", saveSelection);
    inkwellInput.addEventListener("blur", saveSelection);

    // Restore automatically when user comes back
    inkwellInput.addEventListener("focus", restoreSelection);
    document.querySelector(".bold-text").addEventListener("click", () => {
        inkwellInput.focus();
        restoreSelection();
    if (savedRange) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRange);
    }
    boldText(inkwellInput);
    });
    document.querySelector(".italic-text").addEventListener("click", () => {
    inkwellInput.focus();
    if (savedRange) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRange);
    }
    italicText(inkwellInput);
    });
    document.querySelector(".underline-text").addEventListener("click", () => {
    inkwellInput.focus();
    if (savedRange) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRange);
    }
    underlineText(inkwellInput);
    });
    document.querySelector(".heading-1").addEventListener("click", () => {
    inkwellInput.focus();
    if (savedRange) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRange);
    }
    insertHeading(inkwellInput,1);
    });
    document.querySelector(".heading-2").addEventListener("click", () => {
    inkwellInput.focus();
    if (savedRange) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRange);
    }
    insertHeading(inkwellInput,2);
    });
    document.querySelector(".heading-3").addEventListener("click", () => {
    inkwellInput.focus();
    if (savedRange) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRange);
    }
    insertHeading(inkwellInput,3);
    });
    document.querySelector(".new-link").addEventListener("click", () => {
    inkwellInput.focus();
    if (savedRange) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRange);
    }
    createLink(inkwellInput);
    });
    document.querySelector(".insert-image").addEventListener("click", () => {
    inkwellInput.focus();
    if (savedRange) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRange);
    }
    insertImage(inkwellInput);
    });
    document.querySelector(".line-break").addEventListener("click", () => {
    inkwellInput.focus();
    if (savedRange) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRange);
    }
    lineBreak(inkwellInput);
    });
    document.querySelector(".divider").addEventListener("click", () => {
    inkwellInput.focus();
    if (savedRange) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRange);
    }
    divider(inkwellInput);
    });
    // Post Meta
    const postTags = document.querySelector(".postTags");
    const displayNewTags = document.querySelector(".display-new-tags");
    let tags;
    postTags.addEventListener("keyup", () => {
    tags = postTags.textContent
        .split(",")                // split by comma
        .map(tag => tag.trim())    // remove extra spaces
        .filter(tag => tag.length > 0); // remove empty tags
    });
    function createTags() {
        displayNewTags.innerHTML = "";
        uniqueTags = [...new Set(tags.map(t => t.toLowerCase()))];
        uniqueTags.forEach(tag => {
            const newTag = document.createElement("div");
            newTag.className = "post-tag";
            newTag.textContent = tag;
            displayNewTags.appendChild(newTag);
        });
    };
    document.querySelector(".confirm-new-tags").addEventListener("click", createTags);

    // Post publish flow
    publishPost = document.querySelector(".publishPost");

    publishPost.addEventListener("click", () => {
        postTitle = document.querySelector(".blogTitle").value;
        postContents = document.querySelector(".postBody").innerHTML;
        console.log(`Title: ${postTitle}`);
        console.log(`Post Contents: ${postContents}`);
        console.log("Post Tags: ", uniqueTags);
    })

}
else {
    window.location.href = "/";
}