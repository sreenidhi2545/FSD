/* ==========================================================================
   Portfolio of Ennala Sreenidhi - Task 4: JavaScript Interactivity
   Vanilla ES6+, no libraries. Loaded with `defer` on all 6 pages, after the
   Bootstrap bundle, so the DOM is ready when this runs.
   Every feature first checks that its elements exist on the current page.

   Features:
     1. Theme switching (all pages)      - applyTheme(), initThemeToggle()
     2. Project filtering (projects.html) - renderProjects(), initProjectFilter()
     3. Dynamic footer year (all pages)  - setFooterYear()
   ========================================================================== */


/* --------------------------------------------------------------------------
   ES6+ CONCEPT: VARIABLES - const for values that never change, let only
   where a value is reassigned. No `var` anywhere in this file.
   -------------------------------------------------------------------------- */
const THEME_KEY = "portfolio-theme";
const root = document.documentElement; // the <html> element


/* --------------------------------------------------------------------------
   ES6+ CONCEPT: ARRAYS AND OBJECTS - featured projects stored as an array of
   objects. `category` and `tech` are arrays, so a project can belong to more
   than one category.
   -------------------------------------------------------------------------- */
const projects = [
    {
        title: "Organization Innovation Platform",
        category: ["Full Stack"],
        tech: ["React", "Spring Boot", "MySQL", "n8n"],
        description: "Full-stack hackathon submission-and-evaluation portal with a hybrid AI + human evaluation flow that merges LLM scores and invigilator scores into one result.",
        image: "images/project1.svg",
        alt: "Screenshot of the Organization Innovation Platform",
        link: "https://github.com/sreenidhi2545"
    },
    {
        title: "ML-Based Intrusion Detection System",
        category: ["AI / ML"],
        tech: ["Python", "XGBoost", "CICIDS2017"],
        description: "DRDO research. Supervised ML pipeline for network-anomaly detection; tuned XGBoost reached 99.9% accuracy (ROC-AUC 0.999); caught data leakage and reframed it as an ablation study.",
        image: "images/project2.svg",
        alt: "Screenshot of the ML-Based Intrusion Detection System",
        link: "https://github.com/sreenidhi2545"
    },
    {
        title: "NourishIQ — AI Clinical Nutrition Platform",
        category: ["AI / ML", "Full Stack"],
        tech: ["Node.js", "Groq LLaMA vision", "Supabase", "Cloud Run"],
        description: "Reads a blood-report photo and returns India-specific dietary guidance; response caching and offline fallback.",
        image: "images/project3.svg",
        alt: "Screenshot of NourishIQ, the AI clinical nutrition platform",
        link: "https://github.com/sreenidhi2545"
    },
    {
        title: "RepoScan AI — Multi-Agent Repository Analyzer",
        category: ["AI / ML", "Full Stack"],
        tech: ["FastAPI", "Groq", "React"],
        description: "Audits any GitHub repo across six areas and outputs a health score with prioritized fixes and exportable reports.",
        image: "images/project4.svg",
        alt: "Screenshot of RepoScan AI, the multi-agent repository analyzer",
        link: "https://github.com/sreenidhi2545"
    },
    {
        title: "Udaan AI — Opportunity Intelligence Platform",
        category: ["AI / ML", "Full Stack"],
        tech: ["FastAPI", "Groq", "Telegram", "React"],
        description: "Matches users to government schemes, scholarships and jobs they qualify for, with trust-scoring for official sources and Telegram deadline alerts. Consolation Prize, WinnovX 2026.",
        image: "images/project5.svg",
        alt: "Screenshot of Udaan AI, the opportunity intelligence platform",
        link: "https://github.com/sreenidhi2545"
    },
    {
        title: "Verimark",
        category: ["Mobile"],
        tech: ["React Native"],
        description: "Cross-platform QR attendance app with multi-factor (session / GPS / WiFi / device) confidence scoring.",
        image: "images/project6.svg",
        alt: "Screenshot of Verimark, the QR attendance app",
        link: "https://github.com/sreenidhi2545"
    }
];


/* ==========================================================================
   FEATURE 1: THEME SWITCHING (all pages)
   ========================================================================== */

/* localStorage can throw (private windows, blocked storage), so both helpers
   fail quietly and the page still works - the theme just won't be remembered.
   ES6+ CONCEPT: ARROW FUNCTIONS */
const getSavedTheme = () => {
    try {
        return localStorage.getItem(THEME_KEY);
    } catch (error) {
        return null;
    }
};

const saveTheme = (theme) => {
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
        /* storage unavailable - ignore */
    }
};

/* ES6+ CONCEPT: NORMAL FUNCTION (function declaration)
   Sets data-bs-theme on <html> (Bootstrap 5.3's built-in dark mode switch,
   which also flips the palette variables in css/style.css) and updates the
   toggle button's text, aria-label and aria-pressed state. */
function applyTheme(theme) {
    const isDark = theme === "dark";

    // DOM MANIPULATION: setAttribute
    root.setAttribute("data-bs-theme", theme);

    const toggle = document.querySelector("#themeToggle");

    // CONDITIONS: if - only touch the button when it exists on this page
    if (toggle) {
        // CONDITIONS: ternary operator - the button offers the OTHER theme.
        // Icon and word are separate spans so CSS can hide the word on phones.
        const icon = toggle.querySelector(".theme-icon");
        const label = toggle.querySelector(".theme-label");
        if (icon && label) {
            icon.textContent = isDark ? "\u2600\uFE0F" : "\uD83C\uDF19";
            label.textContent = isDark ? " Light" : " Dark";
        } else {
            toggle.textContent = isDark ? "\u2600\uFE0F Light" : "\uD83C\uDF19 Dark";
        }
        // TEMPLATE LITERAL
        toggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
        toggle.setAttribute("aria-pressed", String(isDark));

        // DOM MANIPULATION: classList.toggle - swap the button outline so it
        // stays visible on the dark header
        toggle.classList.toggle("btn-outline-light", isDark);
        toggle.classList.toggle("btn-outline-secondary", !isDark);
    }
}

/* Chooses the starting theme: saved choice first, otherwise the visitor's
   operating-system preference. */
const getInitialTheme = () => {
    const saved = getSavedTheme();

    // CONDITIONS: if / else
    if (saved === "dark" || saved === "light") {
        return saved;
    } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        return prefersDark ? "dark" : "light";
    }
};

const initThemeToggle = () => {
    applyTheme(getInitialTheme());

    const toggle = document.querySelector("#themeToggle");
    if (!toggle) {
        return;
    }

    // DOM MANIPULATION: addEventListener
    toggle.addEventListener("click", () => {
        const current = root.getAttribute("data-bs-theme");
        const next = current === "dark" ? "light" : "dark";
        applyTheme(next);
        saveTheme(next);
    });
};


/* ==========================================================================
   FEATURE 2: PROJECT FILTERING (projects.html only)
   ========================================================================== */

/* Builds a small <li><span class="badge"> element for one tech name.
   DOM MANIPULATION: createElement, classList.add, textContent */
const createBadge = (name) => {
    const item = document.createElement("li");
    const badge = document.createElement("span");
    badge.classList.add("badge", "rounded-pill");
    badge.textContent = name;
    item.append(badge);
    return item;
};

/* Builds one Bootstrap card column for a project, using the same markup as
   the Task 3 static cards. textContent (not innerHTML) keeps data safe. */
const createProjectCard = (project, index) => {
    // DESTRUCTURING - pull the fields out of the project object
    const { title, tech, description, image, alt, link } = project;

    const column = document.createElement("div");
    column.classList.add("col-12", "col-md-6", "col-lg-4");

    const card = document.createElement("article");
    card.classList.add("card", "project-card", "lift", "h-100", "shadow-sm");
    // Keeps the corner badge showing the project's original number (01-06)
    card.setAttribute("data-number", String(index + 1).padStart(2, "0"));

    const img = document.createElement("img");
    img.classList.add("card-img-top");
    img.setAttribute("src", image);
    img.setAttribute("alt", alt);
    img.setAttribute("width", "400");
    img.setAttribute("height", "250");

    const body = document.createElement("div");
    body.classList.add("card-body");

    const heading = document.createElement("h3");
    heading.classList.add("card-title");
    heading.textContent = title;

    const techList = document.createElement("ul");
    techList.classList.add("list-unstyled", "d-flex", "flex-wrap", "gap-1", "mb-3");
    techList.setAttribute("aria-label", "Tech stack");

    // LOOPS: forEach over the tech array (ARRAY METHOD: map builds the badges)
    tech.map(createBadge).forEach((badge) => techList.append(badge));

    const text = document.createElement("p");
    text.classList.add("card-text");
    text.textContent = description;

    const footer = document.createElement("div");
    footer.classList.add("card-footer", "bg-transparent");

    const button = document.createElement("a");
    button.classList.add("btn", "btn-outline-primary", "btn-sm");
    button.setAttribute("href", link);
    button.setAttribute("target", "_blank");
    button.setAttribute("rel", "noopener noreferrer");
    button.textContent = "View on GitHub";

    body.append(heading, techList, text);
    footer.append(button);
    card.append(img, body, footer);
    column.append(card);
    return column;
};

/* Clears the grid and draws only the projects in the chosen category,
   then updates the "Showing X of Y projects" line. */
const renderProjects = (grid, countLabel, category) => {
    // Keep each project's original position so its number badge stays the same
    const numbered = projects.map((project, index) => ({ project, index }));

    // ARRAY METHOD: filter - "All" keeps everything, otherwise match the category
    const visible = numbered.filter(({ project }) =>
        category === "All" ? true : project.category.includes(category)
    );

    grid.replaceChildren();

    // LOOPS: for...of over the filtered list
    for (const { project, index } of visible) {
        grid.append(createProjectCard(project, index));
    }

    // CONDITIONS: if / else - friendly message when a category is empty
    if (visible.length === 0) {
        const empty = document.createElement("p");
        empty.classList.add("col-12", "text-body-secondary");
        empty.textContent = `No featured projects in "${category}" yet. See Additional Projects below.`;
        grid.append(empty);
    }

    if (countLabel) {
        // VARIABLES: let - the summary text is extended below when filtered
        // TEMPLATE LITERAL
        let summary = `Showing ${visible.length} of ${projects.length} projects`;
        if (category !== "All") {
            summary += ` in ${category}`;
        }
        countLabel.textContent = summary;
    }
};

const initProjectFilter = () => {
    const grid = document.querySelector("#projectGrid");

    // CONDITIONS: stop here on every page except projects.html
    if (!grid) {
        return;
    }

    const countLabel = document.querySelector("#projectCount");
    const filterButtons = document.querySelectorAll("[data-filter]");

    renderProjects(grid, countLabel, "All");

    // LOOPS: forEach - one click listener per filter button
    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const category = button.getAttribute("data-filter");

            // LOOPS: for...of - clear the highlight from every button
            for (const other of filterButtons) {
                // DOM MANIPULATION: classList.remove
                other.classList.remove("active");
                other.setAttribute("aria-pressed", "false");
            }

            // DOM MANIPULATION: classList.add - highlight the clicked button
            button.classList.add("active");
            button.setAttribute("aria-pressed", "true");

            renderProjects(grid, countLabel, category);
        });
    });
};


/* ==========================================================================
   FEATURE 3: DYNAMIC FOOTER YEAR (all pages)
   ========================================================================== */
const setFooterYear = () => {
    const yearSpan = document.querySelector("#year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
};


/* ==========================================================================
   START - run each feature once. `defer` means the DOM is already parsed.
   ========================================================================== */
initThemeToggle();
initProjectFilter();
setFooterYear();
