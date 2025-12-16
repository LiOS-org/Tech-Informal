import app from "../../../firebase.js";
import { waitForUser, userId, userData, readUserData } from "../authentication.js";
import { getFirestore, doc, getDoc,addDoc,collection,setDoc } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export const studioNewPost = async (postTitle, postContents, postTags, postDescription, thumbnailUrl, channelUid) => {

    await readUserData();
    const createOn = channelUid;
    const db = getFirestore(app);
    let publishPost;
    let uniqueTags = postTags;
    let postDesc = postDescription;
    let newPost;
    let channelData;
    const currentTime = new Date();
    const docSnap = await getDoc(doc(db, "channels", channelUid));
    if (docSnap.exists()) {
        channelData = docSnap.data();
    };

    const postCreationFlow =  (async () => {
        const createPost = async () => {
            newPost = await addDoc(collection(db, "posts"), {
                uid: "",
                Title: postTitle,
                Contents: postContents,
                Tags: uniqueTags,
                Description: postDesc,
                AuthorId: userData.uid,
                AuthorName: userData.Name,
                AuthorEmail: userData.Email,
                CreatedOn: currentTime,
                ChannelId: createOn,
                ChannelName: channelData.channelName,
                thumbnail: thumbnailUrl,
            });
            // update UID
            await setDoc(doc(db, "posts", newPost.id), { uid: newPost.id }, { merge: true });
            // update the posts index
            await addDoc(collection(db, "postsIndex"), {
                uid: newPost.id,
                Title: postTitle,
                Description: postDesc,
                AuthorId: userData.uid,
                ChannelName: channelData.channelName,
                ChannelId: createOn,
                CreatedOn: currentTime,
                Tags: uniqueTags,
                thumbnail: thumbnailUrl,
            });
            // Update the tags index
            for (const tag of uniqueTags){
                const tagRef = doc(collection(db, "tags", tag, "posts"), newPost.id);
                await setDoc(tagRef, {
                    postId: newPost.id,
                    title: postTitle,
                    description: postDesc,
                    authorId: userData.uid,
                    authorName: userData.Name,
                    channelId: createOn,
                    channelName: channelData.channelName,
                    createdOn: currentTime,
                    thumbnail: thumbnailUrl,
                });
            };
            // update posts in channel
            await setDoc(doc(collection(db, "channels", createOn, "posts"), newPost.id), {
                postId: newPost.id,
                title: postTitle,
                description: postDesc,
                authorId: userData.uid,
                authorName: userData.Name,
                channelId: createOn,
                channelName: channelData.channelName,
                createdOn: currentTime,
                thumbnail: thumbnailUrl,
                Tags: uniqueTags,
            });
        };
        try {
            await createPost();
            alert("Post published successfully!");
            window.location.replace(`../view?id=${newPost.id}`);
        } catch (e) {
            alert("Error publishing post: " + e.message);
        }
    })();
};