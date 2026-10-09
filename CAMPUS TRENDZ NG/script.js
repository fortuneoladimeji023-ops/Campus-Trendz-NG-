/* =========================================
   CAMPUS TRENDZ NG™
   WEBSITE JAVASCRIPT
========================================= */


/* =========================================
   MOBILE MENU
========================================= */

const menuBtn = document.getElementById("menuBtn");
const navbar = document.getElementById("navbar");

if (menuBtn) {

    menuBtn.addEventListener("click", () => {

        navbar.classList.toggle("show");

        const icon = menuBtn.querySelector("i");

        if (navbar.classList.contains("show")) {

            icon.classList.remove("fa-bars");

            icon.classList.add("fa-xmark");

        } else {

            icon.classList.remove("fa-xmark");

            icon.classList.add("fa-bars");

        }

    });

}


/* =========================================
   CLOSE MOBILE MENU AFTER CLICK
========================================= */

const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach(link => {

    link.addEventListener("click", () => {

        navbar.classList.remove("show");

        const icon = menuBtn.querySelector("i");

        icon.classList.remove("fa-xmark");

        icon.classList.add("fa-bars");

    });

});


/* =========================================
   SEARCH OVERLAY
========================================= */

const searchBtn = document.getElementById("searchBtn");
const searchOverlay = document.getElementById("searchOverlay");
const closeSearch = document.getElementById("closeSearch");
const searchInput = document.getElementById("searchInput");

if (searchBtn) {

    searchBtn.addEventListener("click", () => {

        searchOverlay.classList.add("show");

        setTimeout(() => {

            searchInput.focus();

        }, 200);

    });

}

if (closeSearch) {

    closeSearch.addEventListener("click", () => {

        searchOverlay.classList.remove("show");

    });

}


/* =========================================
   CLOSE SEARCH WITH ESC
========================================= */

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        searchOverlay.classList.remove("show");

    }

});


/* =========================================
   POLL SYSTEM
========================================= */

const pollOptions = document.querySelectorAll(".poll-option");

pollOptions.forEach(option => {

    option.addEventListener("click", () => {

        pollOptions.forEach(item => {

            item.style.background = "rgba(255,255,255,0.08)";
            item.style.color = "white";

        });

        option.style.background = "white";
        option.style.color = "#0757d5";

        const text = option.querySelector("span").textContent.trim();

        alert(
            "Your vote for \"" +
            text +
            "\" has been recorded for this demo."
        );

    });

});


/* =========================================
   BACK TO TOP
========================================= */

const backTop = document.getElementById("backTop");

window.addEventListener("scroll", () => {

    if (window.scrollY > 500) {

        backTop.classList.add("show");

    } else {

        backTop.classList.remove("show");

    }

});


backTop.addEventListener("click", () => {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});


/* =========================================
   CURRENT YEAR
========================================= */

const year = document.getElementById("year");

if (year) {

    year.textContent = new Date().getFullYear();

}


/* =========================================
   ACTIVE NAVIGATION
========================================= */

const sections = document.querySelectorAll("section[id]");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 150;

        const sectionHeight = section.offsetHeight;

        if (
            window.scrollY >= sectionTop &&
            window.scrollY < sectionTop + sectionHeight
        ) {

            current = section.getAttribute("id");

        }

    });


    navLinks.forEach(link => {

        link.classList.remove("active");

        if (
            link.getAttribute("href") === "#" + current
        ) {

            link.classList.add("active");

        }

    });

});


/* =========================================
   SEARCH DEMO
========================================= */

if (searchInput) {

    searchInput.addEventListener("keypress", event => {

        if (event.key === "Enter") {

            const query = searchInput.value.trim();

            if (query !== "") {

                alert(
                    "Searching Campus Trendz for: " +
                    query
                );

            }

        }

    });

}


/* =========================================
   SIMPLE FADE-IN ANIMATION
========================================= */

const animatedElements = document.querySelectorAll(
    ".trend-card, .competition-card, .feature, .contact-card"
);

const observer = new IntersectionObserver(
    entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.style.opacity = "1";

                entry.target.style.transform =
                    "translateY(0)";

            }

        });

    },
    {
        threshold: 0.1
    }
);


animatedElements.forEach(element => {

    element.style.opacity = "0";

    element.style.transform = "translateY(20px)";

    element.style.transition =
        "opacity 0.6s ease, transform 0.6s ease";

    observer.observe(element);

});


console.log(
    "Campus Trendz NG™ website loaded successfully 🔥"
);