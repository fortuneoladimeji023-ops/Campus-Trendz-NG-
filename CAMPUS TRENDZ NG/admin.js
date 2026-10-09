import {
    initializeApp,
    getApps,
    getApp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";


import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword,
    updateProfile,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";


import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";


import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-storage.js";



/* ==================================================
   FIREBASE CONFIGURATION
   REPLACE THESE VALUES WITH YOUR FIREBASE CONFIG
================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyBw9Jsnn7YuT9wFSINMDGVkVupeb7e-5J8",
  authDomain: "campus-t-28aee.firebaseapp.com",
  projectId: "campus-t-28aee",
  storageBucket: "campus-t-28aee.firebasestorage.app",
  messagingSenderId: "592153250784",
  appId: "1:592153250784:web:b2fe865fcee88dcea83985",
  measurementId: "G-CTCKRE80VM"
};



/* ==================================================
   INITIALIZE FIREBASE
================================================== */


const app =
    getApps().length
        ? getApp()
        : initializeApp(firebaseConfig);


const auth =
    getAuth(app);


const db =
    getFirestore(app);


const storage =
    getStorage(app);



/* ==================================================
   HELPERS
================================================== */


const $ = id =>
    document.getElementById(id);


let currentUser = null;

let currentRole = null;

let editingImagePath = null;

let unsubscribePosts = null;



/* ==================================================
   LOGIN
================================================== */


$("loginForm").addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        $("loginMessage").textContent =
            "Signing in...";


        try {

            await signInWithEmailAndPassword(
                auth,
                $("loginEmail").value.trim(),
                $("loginPassword").value
            );


            $("loginMessage").textContent = "";


        } catch (error) {

            $("loginMessage").textContent =
                friendlyError(error);

            $("loginMessage").className =
                "message error";
        }

    }
);



/* ==================================================
   LOGOUT
================================================== */


$("logoutBtn").addEventListener(
    "click",
    function () {

        signOut(auth);

    }
);



/* ==================================================
   CHECK LOGIN
================================================== */


onAuthStateChanged(
    auth,
    async function (user) {

        if (!user) {

            currentUser = null;

            currentRole = null;

            $("loginView")
                .classList
                .remove("hidden");

            $("appView")
                .classList
                .add("hidden");

            return;
        }


        try {

            const userSnap =
                await getDoc(
                    doc(
                        db,
                        "users",
                        user.uid
                    )
                );


            if (!userSnap.exists()) {

                await signOut(auth);

                throw new Error(
                    "This account is not registered as an admin."
                );

            }


            currentUser = user;

            currentRole =
                userSnap.data().role;


            if (
                ![
                    "superAdmin",
                    "contentAdmin",
                    "editor"
                ].includes(currentRole)
            ) {

                await signOut(auth);

                throw new Error(
                    "This account has no admin permission."
                );

            }


            $("loginView")
                .classList
                .add("hidden");


            $("appView")
                .classList
                .remove("hidden");


            $("userBadge").textContent =
                `${user.email} • ${roleLabel(currentRole)}`;


            document
                .querySelectorAll(".super-only")
                .forEach(
                    element => {

                        element
                            .classList
                            .toggle(
                                "hidden",
                                currentRole !== "superAdmin"
                            );

                    }
                );


            loadPosts();

            loadStats();


            if (
                currentRole === "superAdmin"
            ) {

                loadAdmins();

            }


        } catch (error) {

            $("loginMessage").textContent =
                error.message;

            $("loginMessage").className =
                "message error";

        }

    }
);



/* ==================================================
   NAVIGATION
================================================== */


document
    .querySelectorAll(".nav")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    showPanel(
                        button.dataset.panel
                    );

                }
            );

        }
    );


document
    .querySelectorAll("[data-go]")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    showPanel(
                        button.dataset.go
                    );

                }
            );

        }
    );



function showPanel(id) {

    document
        .querySelectorAll(".panel")
        .forEach(
            panel =>
                panel.classList.remove("active")
        );


    const panel =
        $(id);


    if (panel) {

        panel.classList.add("active");

    }


    document
        .querySelectorAll(".nav")
        .forEach(
            nav => {

                nav.classList.toggle(
                    "active",
                    nav.dataset.panel === id
                );

            }
        );

}



/* ==================================================
   POST FORM
================================================== */


$("postForm").addEventListener(
    "submit",
    event => savePost(event, false)
);


$("saveDraftBtn").addEventListener(
    "click",
    () => savePost(null, true)
);


$("cancelEditBtn").addEventListener(
    "click",
    resetEditor
);



async function savePost(
    event,
    isDraft
) {

    if (event) {

        event.preventDefault();

    }


    const message =
        $("postMessage");


    message.textContent =
        "Saving...";


    try {

        const title =
            $("title")
                .value
                .trim();


        const body =
            $("body")
                .value
                .trim();


        if (!title || !body) {

            throw new Error(
                "Headline and article are required."
            );

        }


        let imageUrl = "";

        let imagePath =
            editingImagePath || "";


        const file =
            $("imageFile").files[0];


        if (file) {

            if (
                file.size >
                5 * 1024 * 1024
            ) {

                throw new Error(
                    "Image must be 5MB or smaller."
                );

            }


            const safeName =
                file.name.replace(
                    /[^a-z0-9._-]/gi,
                    "_"
                );


            imagePath =
                `posts/${currentUser.uid}/${Date.now()}_${safeName}`;


            const imageRef =
                ref(
                    storage,
                    imagePath
                );


            await uploadBytes(
                imageRef,
                file,
                {
                    contentType:
                        file.type
                }
            );


            imageUrl =
                await getDownloadURL(
                    imageRef
                );

        }


        const postData = {

            title: title,

            body: body,

            category:
                $("category").value,

            authorName:
                $("authorName")
                    .value
                    .trim()
                ||
                currentUser.email,

            authorUid:
                currentUser.uid,

            status:
                isDraft
                    ? "draft"
                    : "published",

            updatedAt:
                serverTimestamp()

        };


        if (imageUrl) {

            postData.imageUrl =
                imageUrl;

            postData.imagePath =
                imagePath;

        }


        const postId =
            $("postId").value;


        if (postId) {

            await updateDoc(
                doc(
                    db,
                    "posts",
                    postId
                ),
                postData
            );

        } else {

            await addDoc(
                collection(
                    db,
                    "posts"
                ),
                {

                    ...postData,

                    createdAt:
                        serverTimestamp()

                }
            );

        }


        message.textContent =
            isDraft
                ? "Draft saved successfully."
                : "Post published successfully. 🚀";


        resetEditor();

        showPanel("posts");


    } catch (error) {

        message.textContent =
            friendlyError(error);

        message.className =
            "message error";

    }

}



/* ==================================================
   RESET POST EDITOR
================================================== */


function resetEditor() {

    $("postForm").reset();

    $("postId").value = "";

    $("editorTitle").textContent =
        "Create Post";

    editingImagePath = null;

    $("imageStatus").textContent =
        "Optional. JPG, PNG or WebP. Maximum 5MB.";

}



/* ==================================================
   LOAD POSTS
================================================== */


function loadPosts() {

    if (unsubscribePosts) {

        unsubscribePosts();

    }


    const postsQuery =
        query(
            collection(
                db,
                "posts"
            ),
            orderBy(
                "updatedAt",
                "desc"
            )
        );


    unsubscribePosts =
        onSnapshot(
            postsQuery,
            snapshot => {

                const list =
                    $("postsList");


                list.innerHTML = "";


                let published = 0;

                let drafts = 0;


                snapshot.forEach(
                    postSnapshot => {

                        const post =
                            postSnapshot.data();


                        if (
                            post.status ===
                            "published"
                        ) {

                            published++;

                        } else {

                            drafts++;

                        }


                        const item =
                            document.createElement(
                                "article"
                            );


                        item.className =
                            "post-item";


                        item.innerHTML = `

                            <div>

                                <h3>
                                    ${escapeHTML(post.title)}
                                </h3>

                                <div class="meta">

                                    ${escapeHTML(
                                        post.category || ""
                                    )}

                                    •

                                    ${escapeHTML(
                                        post.authorName || ""
                                    )}

                                    •

                                    <span class="badge">

                                        ${escapeHTML(
                                            post.status || "draft"
                                        )}

                                    </span>

                                </div>

                            </div>


                            <div class="item-actions">

                                <button
                                    class="secondary edit-btn">

                                    Edit

                                </button>


                                ${
                                    currentRole !== "editor"

                                    ?

                                    `
                                    <button
                                        class="ghost delete-btn">

                                        Delete

                                    </button>
                                    `

                                    :

                                    ""
                                }

                            </div>

                        `;


                        item
                            .querySelector(
                                ".edit-btn"
                            )
                            .onclick =
                            () =>
                                editPost(
                                    postSnapshot.id,
                                    post
                                );


                        const deleteButton =
                            item.querySelector(
                                ".delete-btn"
                            );


                        if (deleteButton) {

                            deleteButton.onclick =
                                () =>
                                    removePost(
                                        postSnapshot.id,
                                        post
                                    );

                        }


                        list.appendChild(
                            item
                        );

                    }
                );


                $("publishedCount")
                    .textContent =
                    published;


                $("draftCount")
                    .textContent =
                    drafts;

            }
        );

}



/* ==================================================
   EDIT POST
================================================== */


function editPost(
    id,
    post
) {

    $("postId").value =
        id;


    $("title").value =
        post.title || "";


    $("body").value =
        post.body || "";


    $("category").value =
        post.category ||
        "Trending";


    $("authorName").value =
        post.authorName || "";


    $("editorTitle").textContent =
        "Edit Post";


    editingImagePath =
        post.imagePath || "";


    $("imageStatus").textContent =
        post.imageUrl
            ? "Current image exists. Select another image to replace it."
            : "No featured image.";


    showPanel(
        "newPost"
    );

}



/* ==================================================
   DELETE POST
================================================== */


async function removePost(
    id,
    post
) {

    if (
        !confirm(
            "Delete this post permanently?"
        )
    ) {

        return;

    }


    try {

        await deleteDoc(
            doc(
                db,
                "posts",
                id
            )
        );


        if (post.imagePath) {

            try {

                await deleteObject(
                    ref(
                        storage,
                        post.imagePath
                    )
                );

            } catch (_) {}

        }


    } catch (error) {

        alert(
            friendlyError(error)
        );

    }

}



/* ==================================================
   ADMIN COUNT
================================================== */


async function loadStats() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "users"
                )
            );


        $("adminCount")
            .textContent =
            snapshot.size;


    } catch (_) {

        $("adminCount")
            .textContent =
            "—";

    }

}



/* ==================================================
   LOAD ADMINS
================================================== */


async function loadAdmins() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "users"
            )
        );


    const list =
        $("adminsList");


    list.innerHTML = "";


    snapshot.forEach(
        adminSnapshot => {

            const admin =
                adminSnapshot.data();


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "admin-item";


            item.innerHTML = `

                <div>

                    <strong>
                        ${escapeHTML(
                            admin.name ||
                            "Unnamed"
                        )}
                    </strong>

                    <div class="meta">

                        ${escapeHTML(
                            admin.email ||
                            ""
                        )}

                        •

                        ${escapeHTML(
                            roleLabel(
                                admin.role
                            )
                        )}

                    </div>

                </div>


                <div>

                    ${
                        admin.role !==
                        "superAdmin"

                        ?

                        `
                        <button
                            class="secondary reset-btn">

                            Send Password Reset

                        </button>
                        `

                        :

                        `
                        <span class="badge">
                            Owner
                        </span>
                        `
                    }

                </div>

            `;


            const resetButton =
                item.querySelector(
                    ".reset-btn"
                );


            if (resetButton) {

                resetButton.onclick =
                    async function () {

                        try {

                            await sendPasswordResetEmail(
                                auth,
                                admin.email
                            );


                            alert(
                                "Password reset email sent."
                            );


                        } catch (error) {

                            alert(
                                friendlyError(
                                    error
                                )
                            );

                        }

                    };

            }


            list.appendChild(
                item
            );

        }
    );

}



/* ==================================================
   CREATE CREW ADMIN
================================================== */


$("adminForm").addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const message =
            $("adminMessage");


        if (
            currentRole !==
            "superAdmin"
        ) {

            message.textContent =
                "Only Super Admin can create admins.";

            return;

        }


        message.textContent =
            "Creating admin account...";


        try {

            const email =
                $("adminEmail")
                    .value
                    .trim();


            const password =
                $("adminPassword")
                    .value;


            const name =
                $("adminName")
                    .value
                    .trim();


            const role =
                $("adminRole")
                    .value;


            /*
                IMPORTANT:

                We create the new account
                using a SECOND Firebase app
                so you remain logged in
                as Super Admin.
            */


            const {
                initializeApp
            } =
                await import(
                    "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js"
                );


            const {
                getAuth,
                createUserWithEmailAndPassword,
                signOut
            } =
                await import(
                    "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js"
                );


            const secondaryApp =
                initializeApp(
                    firebaseConfig,
                    "SecondaryAdminApp"
                );


            const secondaryAuth =
                getAuth(
                    secondaryApp
                );


            const credential =
                await createUserWithEmailAndPassword(
                    secondaryAuth,
                    email,
                    password
                );


            await updateProfile(
                credential.user,
                {
                    displayName:
                        name
                }
            );


            await setDoc(
                doc(
                    db,
                    "users",
                    credential.user.uid
                ),
                {

                    name: name,

                    email: email,

                    role: role,

                    createdAt:
                        serverTimestamp(),

                    createdBy:
                        currentUser.uid

                }
            );


            await signOut(
                secondaryAuth
            );


            message.textContent =
                "Admin account created successfully. 🎉";


            $("adminForm").reset();


            loadAdmins();

            loadStats();


        } catch (error) {

            message.textContent =
                friendlyError(
                    error
                );

            message.className =
                "message error";

        }

    }
);



/* ==================================================
   ROLE LABEL
================================================== */


function roleLabel(role) {

    if (
        role ===
        "superAdmin"
    ) {

        return "Super Admin";

    }


    if (
        role ===
        "contentAdmin"
    ) {

        return "Content Admin";

    }


    return "Editor";

}



/* ==================================================
   SECURITY: ESCAPE TEXT
================================================== */


function escapeHTML(value = "") {

    return String(value)
        .replace(
            /[&<>"']/g,
            character => {

                const map = {

                    "&": "&amp;",

                    "<": "&lt;",

                    ">": "&gt;",

                    '"': "&quot;",

                    "'": "&#039;"

                };


                return map[
                    character
                ];

            }
        );

}



/* ==================================================
   FIREBASE ERROR MESSAGES
================================================== */


function friendlyError(error) {

    const code =
        error?.code || "";


    const errors = {

        "auth/invalid-credential":
            "Incorrect email or password.",

        "auth/invalid-email":
            "Enter a valid email address.",

        "auth/too-many-requests":
            "Too many attempts. Try again later.",

        "auth/email-already-in-use":
            "That email is already registered.",

        "auth/weak-password":
            "Use a stronger password.",

        "permission-denied":
            "You do not have permission to perform this action."

    };


    return (
        errors[code] ||
        error?.message ||
        "Something went wrong."
    );

}