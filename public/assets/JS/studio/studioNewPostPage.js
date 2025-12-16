import { virtualDom } from "./studio.js";
import app from "../../../firebase.js";
import { waitForUser, userId, userData, readUserData,db } from "../authentication.js";
import { getFirestore, doc, getDoc,addDoc,collection,setDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { constructLiosPopup, liosPopup } from "../../../LiOS-Open/public/modules/JS/liosOpen.js";
import { contextualBottomNavigation, navigationMap } from "../navigation.js";
import { studioNewPost } from "./newPost.js";

let studioNewPostPage;

studioNewPostPage = async(channelId) => {
    await readUserData();
    if (userData.ownedChannels.includes(channelId)) {
        if (userData.canCreateChannels === true) {
            const channelsPage = document.createElement("div");
            channelsPage.classList.add("studio-new-post-page", "page");
            channelsPage.innerHTML = //html
                `
            <div class = "lios-card-title"><span>Create New Post</span></div>
            <br>
            <div class = "postBody frosted_background"></div>
            <br>
            <div class = "title-container ti-label-input frosted_background">
                <label class = "lios-input-label">Post Title: </label>
                <input type="text" class = "lios-input post-title-input" placeholder="Enter Post Title"/>
            </div>
            <br>
            <div class = "description-container ti-label-input frosted_background">
                <label class = "lios-input-label">Post Description: </label>
                <input type="text" class = "lios-input post-description-input" placeholder="Enter Post Description"/>
            </div>
            <br>
            <div class = "create-tags-container ti-label-input frosted_background">
                <label class = "lios-input-label">Tags (separated by commas): </label>
                <input type="text" class = "lios-input post-tags-input" placeholder="e.g. Technology, Science, Art"/>
                <div class = "lios-action-button generate-tags-button"><span>Generate</span></div>
            </div>
            <div class = "display-new-tags frosted_background"></div>
            <br>
            <div class = "create-thumbnail-container ti-label-input frosted_background">
                <label class = "lios-input-label"> Thumbnail: </label>
                <img class = "post-thumbnail-preview"/>
                <div class = "lios-action-button set-thumbnail-button"><span>Set Thumbnail</span></div>
            </div>
            `;
            virtualDom.innerHTML = "";
            virtualDom.appendChild(channelsPage);

            // Generate Tags
            const postTags = virtualDom.querySelector(".lios-input.post-tags-input");
            const displayNewTags = virtualDom.querySelector(".display-new-tags");
            let tags;
            let uniqueTags;
            postTags.addEventListener("keyup", () => {
                tags = postTags.value
                    .split(",")                // split by comma
                    .map(tag => tag.trim())    // remove extra spaces
                    .filter(tag => tag.length > 0); // remove empty tags
            });
            async function createTags() {
                displayNewTags.innerHTML = "";
                if (tags.length >= 1) {
                    uniqueTags = [...new Set(
                        tags.map(t =>
                            t
                                .toLowerCase()
                                .replace(/\s+/g, "-")   // replace spaces with hyphens
                        )
                    )];
                } else {
                    const tagErrorPopupContent = //html
                        `
                    <h2>No tags to generate.</h2>
                    <p>Please enter some tags separated by commas.</p>
                    <br>
                    <div class = "lios-action-button tag-error-popup-close"><span>Close</span></div>
                `;
                    const popup = await constructLiosPopup(tagErrorPopupContent, true);
                    popup.element.querySelector(".tag-error-popup-close").addEventListener("click", (e) => {
                        e.stopImmediatePropagation();
                        popup.close();
                    });
                }
                uniqueTags.forEach(tag => {
                    const newTag = document.createElement("div");
                    newTag.className = "post-tag";
                    newTag.textContent = tag;
                    displayNewTags.appendChild(newTag);
                });
            };
            virtualDom.querySelector(".generate-tags-button").addEventListener("click", () => {
                createTags();
            });
            //
            // Set Thumbnail
            const postThumbnailPreview = virtualDom.querySelector(".post-thumbnail-preview");
            let thumbnailUrl = "";
            virtualDom.querySelector(".lios-action-button.set-thumbnail-button").addEventListener("click", async () => {
                const getThumbnailPopupContent = //html
                    `
                        <input type="text" class="lios-input thumbnail-url-input" placeholder="Enter Image URL"/>
                        <br>
                        <div class="lios-action-button update-thumbnail-button"><span>Update Thumbnail</span></div>
                `;
                const popup = await constructLiosPopup(getThumbnailPopupContent, true);
                popup.element.querySelector(".update-thumbnail-button").addEventListener("click", (e) => {
                    e.stopImmediatePropagation();
                    thumbnailUrl = popup.element.querySelector(".thumbnail-url-input").value;
                    postThumbnailPreview.src = thumbnailUrl;
                    popup.close();
                });
            });
            // 
            // Get Channel Info
            const channelInfoFetch = await getDoc(doc(db, "channelIndex", channelId));
            let channelInfo = channelInfoFetch.data();
            console.log(channelInfo);
            // 
            // Modifying contexual navigation
            navigationMap["studio"].push(
                {
                    label: channelInfo.name,
                    action: async () => {
                        const channelInfoPopup = //html
                            `
                            <h1>This post will be created under the channel:</h1>
                            <br>
                            <h2>${channelInfo.name}</h2>
                            <p>${channelInfo.description}</p>
                            <br>
                            <div class = "lios-action-button navigation-channel-info-studio-close"><span>Close</span></div>
                        `;
                        const popup = await constructLiosPopup(channelInfoPopup, true);
                        popup.element.querySelector(".navigation-channel-info-studio-close").addEventListener("click", (e) => {
                            e.stopImmediatePropagation();
                            popup.close();
                        }
                        );
                    },
                    icon: `<img src="${channelInfo.channelImage}" alt="Channel Image" class="channel-icon">`
                },
                {
                    label: "Preview Post",
                    action: async () => {
                        const postTitle = virtualDom.querySelector(".post-title-input").value;
                        const postDescription = virtualDom.querySelector(".post-description-input").value;
                        const postContent = virtualDom.querySelector(".postBody .ql-editor").innerHTML;
                        const postThumbnailUrl = thumbnailUrl;

                        if (virtualDom.querySelector(".display-new-tags").children.length === 0) {
                            await createTags();
                        }

                        const postTags = virtualDom.querySelector(".display-new-tags").innerHTML;

                        const postPreviewPopupContent = //html
                            `
                            <div class="meta-container frosted_background">
                                <div class="channel-info">
                                <span><img src="${channelInfo.channelImage}" alt="${channelInfo.name}" class="channel-logo"></span><span><a class="channel-name">${channelInfo.name}</a></span>
                                </div>
                                <br>
                                <div class="posted-on"><span>Posted On: </span><span class="posted-on-date"></span></div>
                                <br>
                                <div class="tags-container">${postTags}</div>
                            </div>
                            <article class="post-container frosted_background">
                                <h1 class="post-title">${postTitle}</h1>
                                <hr>
                                <br>
                                <p class="post-description">${postDescription}</p>
                                <div class="post-body">${postContent}</div>
                            </article>
                            <br>
                            <div class = "lios-button-group" style = "display:flex; justify-self:center; flex-direction:row; align-self:center">
                                <div class = "lios-action-button studio-channel-continue-edit"><span>Edit</span></div>
                                <div class = "lios-action-button studio-channel-submit-post"><span>Post</span></div>
                            </div>
                        `;
                        const popup = await constructLiosPopup(postPreviewPopupContent, true);

                        popup.element.querySelector(".studio-channel-continue-edit").addEventListener("click", (e) => {
                            e.stopImmediatePropagation();
                            popup.close();
                        });
                        // Post Flow
                        popup.element.querySelector(".studio-channel-submit-post").addEventListener("click", async () => {
                            await studioNewPost(postTitle, postContent, uniqueTags, postDescription, thumbnailUrl, channelId);
                            popup.close();
                        });
                        // 
                    },
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>`
                }
            );
            contextualBottomNavigation();
            // 
        } else {
            constructLiosPopup(`Something went wrong. You do not own this channel.`, true);
        };







        // Initialize the quill editor
        const quill = new Quill(".postBody", {
            theme: "snow",
            modules: {
                toolbar: {
                    container: [
                        ["bold", "italic", "underline"], // keep defaults
                        [{ header: [1, 2, 3, false] }], // headings
                        ["link", "image", "code-block"], // defaults
                        ["clean"], // clear formatting
                        [{ list: "ordered" }, { list: "bullet" }], // new options
                        ["blockquote", "divider"], // new option
                    ],
                    handlers: {
                        // Override the default image handler
                        image: async function () {
                            const quill = this.quill;
                            const savedRange = quill.getSelection(true);
                            const getImageUrlPopupContent = //html 
                                `
                                <input type="text" class="lios-input image-url-input" placeholder="Enter Image URL"/>
                                <br>
                                <div class="lios-action-button insert-image-button"><span>Insert Image</span></div>
                                `;
                            const popup = await constructLiosPopup(getImageUrlPopupContent, true);
                            popup.element
                                .querySelector(".insert-image-button")
                                .addEventListener("click", (e) => {
                                    e.stopImmediatePropagation();

                                    const url = popup.element
                                        .querySelector(".image-url-input")
                                        .value;

                                    quill.insertEmbed(savedRange.index, "image", url);
                                    quill.setSelection(savedRange.index + 1);

                                    popup.close();
                                });
                        },
                        divider: () => insertDivider(quill),
                    },
                },
            },
        });
        // Quill custom bloats
        const BlockEmbed = Quill.import("blots/block/embed");
        class DividerBlot extends BlockEmbed {
            static blotName = "divider"; // internal name
            static tagName = "hr"; // rendered as <hr> in DOM
        };
        Quill.register(DividerBlot);
    } else {
        window.location.href = "/";
    };
};

export { studioNewPostPage };