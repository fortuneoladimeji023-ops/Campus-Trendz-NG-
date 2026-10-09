import {
    initializeApp,
    getApps,
    getApp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";


import {
    getFirestore,
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";



/* YOUR FIREBASE CONFIG */

const firebaseConfig = {

    apiKey:
        "PASTE_YOUR_API_KEY",

    authDomain:
        "PASTE_YOUR_PROJECT.firebaseapp.com",

    projectId:
        "PASTE_YOUR_PROJECT_ID",

    storageBucket:
        "PASTE_YOUR_STORAGE_BUCKET",

    messagingSenderId:
        "PASTE_YOUR_SENDER_ID",

    appId:
        "PASTE_YOUR_APP_ID"

};



const app =
    getApps().length
        ? getApp()
        : initializeApp(firebaseConfig);


const db =
    getFirestore(app);



/*
    This must exist
    somewhere in your index.html
*/

const postsGrid =
    document.querySelector(
        "#postsGrid"
    );


if (postsGrid) {


    const postsQuery =
        query(

            collection(
                db,
                "posts"
            ),

            where(
                "status",
                "==",
                "published"
            ),

            orderBy(
                "createdAt",
                "desc"
            ),

            limit(30)

        );



    onSnapshot(
        postsQuery,
        snapshot => {


            postsGrid.innerHTML = "";



            snapshot.forEach(
                postSnapshot => {

                    const post =
                        postSnapshot.data();


                    const article =
                        document.createElement(
                            "article"
                        );


                    article.className =
                        "trend-card";



                    article.innerHTML = `

                        ${
                            post.imageUrl

                            ?

                            `
                            <img
                                src="${safeURL(
                                    post.imageUrl
                                )}"
                                alt=""
                                loading="lazy"
                            >
                            `

                            :

                            ""
                        }


                        <div class="trend-card-content">


                            <span class="badge">

                                ${escapeHTML(
                                    post.category ||
                                    "Trending"
                                )}

                            </span>


                            <h3>

                                ${escapeHTML(
                                    post.title ||
                                    "Untitled"
                                )}

                            </h3>


                            <p>

                                ${escapeHTML(
                                    (
                                        post.body ||
                                        ""
                                    ).slice(0,180)
                                )}

                                ${
                                    (
                                        post.body ||
                                        ""
                                    ).length > 180

                                    ? "…"

                                    : ""
                                }

                            </p>


                            <small>

                                By

                                ${escapeHTML(
                                    post.authorName ||
                                    "Campus Trendz"
                                )}

                            </small>


                        </div>

                    `;


                    postsGrid.appendChild(
                        article
                    );

                }
            );

        }
    );

}



/* ================================
   SECURITY HELPERS
================================ */


function escapeHTML(
    value = ""
) {

    return String(value)
        .replace(
            /[&<>"']/g,
            character => ({

                "&": "&amp;",

                "<": "&lt;",

                ">": "&gt;",

                '"': "&quot;",

                "'": "&#039;"

            })[character]
        );

}



function safeURL(
    value = ""
) {

    try {

        const url =
            new URL(value);


        if (
            url.protocol ===
            "https:"
        ) {

            return url.href;

        }


        return "";

    } catch {

        return "";

    }

}