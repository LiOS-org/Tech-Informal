# Changelogs

## 1.0.0-alpha-7

- Fixed a bug where the site was unable to dsplay post in `view` page if user is not logged in.
- Detached `meta-container` from the main `article` section for better experiance in reader mode.

## Hotfix 20/11/25

- Fixed background of `article section` in `view page`.

## 1.0.0-alpha-6

- Clicking on the `navigation favicon logo` will now redirect to `home` page.
- Made `sidebar` universally available.
- Tucked away `About` and `Github` buttons from `header-nav` to the `sidebar`.
- Made `sidebar` independent of `studio`.
- Now when `sidebar` is open, clicking outside will close it.
- fixed sidebar buttons issue on `all-posts` page.

## 1.0.0-alpha-5

- Increased the height of ql-editor.
- Updated `Authentication.js` tp know also get `user name` and `user email` automatically upon sign in.
- Replaced `prompt` with `LiOS-PopUp` in `studio.js` for thumbnail URL;
- Updated `navigation.js` to now add `navigation.label` as class to each button for easier targeting via CSS.
- Updated `view.js` to import and use `contextualBottomNavigation` function as async.
- Updated `comments.js` to remove unnecessary `preventDefault()` call in new comment input event listener.
- Added comments moderation in Studio page under channels/{channel}/{post}/comments. Currently, channel owners and moderators can delete comments. Channel-level and platform-wide bans will be introduced in future updates.
- Added `user management` page in `studio` page: For now only accessible to `"mods" and "owner"`.
- Added `Loading Animation`.
- Reactions: Users can now react to a post via either of `Like` or `Dislike` button using the `Contextual Bottom Navifation`.

## Hotfix 24/10/25

- Fixed a rendering,posting & editing existing posts issue caused by a tags related bug.

## 1.0.0-alpha-4

- Fixed `License Section` for `Lucide Icons` in metadata.json
- Dropped `LiOS-InkWell` indefinately in favour of `Quill`, remenants of InkWell will remain and will use `LiOS-InkWell` once it reaches it stable state behind the scenes.
- Fixed backgrounds in `Comments Section`.
- Updated the `new-page` boilerplate.
- Added Sidebar Navigation: Currently only available in `Studio` page, will help navigate between `dashboard` and `channels` page.
- Added Studio page: Currently user can see info about their `latest post` under dashboard or `edit existing posts` under channels section. Studio can be accessed via `Accounts Page`.
- Updated `firestore.rules` to allow read and write on collection `channelIndex`.

## 1.0.0-alpha-3

- Added `changeLog.md` to keep track of every changes from now on.
- Fixed the scroll anchor for `Comments Section` : Now on clicking the `Comments` button, the page perfectly scrolls to it instead of cutting down the comments box.
- Fixed channel field in `#About` window.
- Added `Lucide Icons` entry in metdata.json.
- Added `Comment Deletion`: `Users` can delete their own comments while `Authors/Mods` can delete any comments.
