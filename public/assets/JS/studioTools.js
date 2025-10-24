import { virtualDom } from "./studio.js";
import { db } from "./authentication.js";
import { getDoc, doc,setDoc,collection } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export async function studioEditor(mode,postUid,channelId) {
    const studioEditorPage = document.createElement("div");
    studioEditorPage.classList.add("studio-editor-page", "page");
    studioEditorPage.innerHTML = //html
    `
        <div class="title-container"><input type="text" class="blogTitle frosted_background" placeholder="Post Title"></div>
        <div class = "postBody"></div>
    `;
    const studioEditorMeta = document.createElement("div");
    studioEditorMeta.innerHTML = //html
    `
        <div class="postMeta frosted_background">
            <div class="lios-window-container-title"><span>Tags</span></div><br>
            <div class="lios-card postTags" contenteditable="true"></div>
            <div class="liso-button-group">
                <div class="lios-action-button confirm-new-tags"><span>Confirm</span></div>
            </div>
            <div class="display-new-tags"><!--Populated by new.js--></div>
            <div class="lios-window-container-title"><span>Description</span></div><br>
            <div class="lios-card postDesc" contenteditable="true"></div><br>
            <div class="lios-window-container-title">Thumbnail</div>
            <div class="lios-button-group">
                <div class="lios-button thumbnail-url"><span> Enter Thumnail Url</span></div>
                <div class="profile-picture-container"><img class="profile-picture thumbnail-image"></img></div>
            </div>
        </div>
    `;
    virtualDom.innerHTML = "";
    virtualDom.appendChild(studioEditorPage);
    virtualDom.appendChild(studioEditorMeta);
    let postBody;
    let uniqueTags;
    let thumbnailUrl;
    let postTitle;



    // Initialize the quill editor 
    const quill = new Quill('.postBody', {
        theme: 'snow',
        modules: {
            toolbar: {
                container: [
                    ['bold', 'italic', 'underline'], // keep defaults
                    [{ header: [1, 2, 3, false] }], // headings
                    ['link', 'image', 'code-block'], // defaults
                    ['clean'],                       // clear formatting
                    [{ list: 'ordered' }, { list: 'bullet' }], // new options
                    ['blockquote',"divider"],                  // new option
                ],
                handlers: {
                // Override the default image handler
                image: function () {
                    const url = prompt('Enter image URL:');
                    if (url) {
                        const range = this.quill.getSelection();
                        this.quill.insertEmbed(range.index, 'image', url, 'user');
                    }
                    },
                divider: () => insertDivider(quill)
                
            }
            }
        }
    });
    // Quill custom bloats
    const BlockEmbed = Quill.import('blots/block/embed');
    class DividerBlot extends BlockEmbed {
    static blotName = 'divider'; // internal name
    static tagName = 'hr';        // rendered as <hr> in DOM
    }
    Quill.register(DividerBlot);

    // Insert a divider at cursor
    function insertDivider(quill) {
        const range = quill.getSelection();
        if (range) {
            quill.insertEmbed(range.index, 'divider', true);
            quill.setSelection(range.index + 1); // move cursor after divider
        }
    };
    // Quill custom icons

    const dividerButton = document.querySelector('.ql-divider');
    dividerButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-split-vertical-icon lucide-square-split-vertical"><path d="M5 8V5c0-1 1-2 2-2h10c1 0 2 1 2 2v3"/><path d="M19 16v3c0 1-1 2-2 2H7c-1 0-2-1-2-2v-3"/><line x1="4" x2="20" y1="12" y2="12"/></svg>`;

    // Add important CSSs
    document.querySelector(".ql-picker-options").classList.add("frosted_background");
    document.querySelector(".ql-tooltip").classList.add("frosted_background");






    if (mode == "edit") {
        postBody = virtualDom.querySelector(".postBody .ql-editor");
        postTitle = virtualDom.querySelector(".blogTitle");
        const postSnapshot = await getDoc(doc(db, "posts", postUid));
        const postData = postSnapshot.data();
        console.log(postData);
        postTitle.value = postData.Title;
        postBody.innerHTML = postData.Contents;
        // Post Meta
        const postTags = document.querySelector(".postTags");
        const displayNewTags = document.querySelector(".display-new-tags");
        displayNewTags.innerHTML = "";
        postTags.textContent = postData.Tags;
        let tags = postData.Tags;
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
        createTags();
        document.querySelector(".confirm-new-tags").addEventListener("click", createTags);
        document.querySelector(".thumbnail-image").src = postData.thumbnail;
        document.querySelector(".thumbnail-url").addEventListener("click", () => {
            thumbnailUrl = prompt("Enter Thumbnail URL:");
            document.querySelector(".thumbnail-image").src = thumbnailUrl;
        });
        const postEditButton = document.createElement("div");
        postEditButton.classList.add("lios-action-button", "studio-update-post");
        postEditButton.innerHTML = `<span>Update Post</span>`;
        virtualDom.querySelector(".postMeta").appendChild(postEditButton);
        // Description

        virtualDom.querySelector(".postDesc").innerHTML = postData.Description;
        // Update the post
        const updatePostButton = virtualDom.querySelector(".studio-update-post");
        updatePostButton.addEventListener("click", async () => {
            const updatedTitle = postTitle.value;
            const updatedBody = postBody.innerHTML;
            const updatedTagsString = postTags.textContent;
            const updatedDescription = virtualDom.querySelector(".postDesc").innerHTML;
            const updatedTags = uniqueTags;
            const updatedThumbnail = document.querySelector(".thumbnail-image").src;
            console.log(updatedTitle);
            console.log(updatedBody);
            console.log(updatedDescription);
            console.log(updatedTags);
            console.log(updatedThumbnail);
            console.log(channelId);

            // Update the channel's post subcollection
            await setDoc(doc(db, "channels", channelId, "posts", postUid), {
                Tags: updatedTags,
                description: updatedDescription,
                thumbnail: updatedThumbnail,
                title: updatedTitle
            }, { merge: true });
            // update the posts collection
            await setDoc(doc(db, "posts", postUid), {
                Contents: updatedBody,
                Description: updatedDescription,
                Tags: updatedTags,
                Title: updatedTitle,
                thumbnail: updatedThumbnail
            }, { merge: true });
            // update Tags collection
            updatedTags.forEach(async (tag) => {
                const tagRef = doc(collection(db, "tags", tag, "posts"), postUid);
                await setDoc(tagRef, {
                    postId: postUid,
                    title: updatedTitle,
                    description: updatedDescription,
                    authorId: postData.AuthorId,
                    authorName: postData.AuthorName,
                    channelId: channelId,
                    channelName: postData.ChannelName,
                    createdOn: postData.CreatedOn,
                    thumbnail: updatedThumbnail,
                }, { merge: true });
            });
            // update postsIndex
            await setDoc(doc(db, "postsIndex", postUid), {
                CreatedOn: postData.CreatedOn,
                Description: updatedDescription,
                Tags: updatedTags,
                Title: updatedTitle,
                thumbnail: updatedThumbnail,
                uid: postUid
            });
        });

    } else if (mode == "new") {
        console.log("Creating new post");
    } else {
        console.log("Unknown Parameter");
        return;
    };
}