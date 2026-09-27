/* ==========================================================================
   Portfolio of Ennala Sreenidhi - Task 5: Interactivity + Form Validation
   Vanilla ES6+, no libraries. Loaded with `defer` on all 6 pages, after the
   Bootstrap bundle, so the DOM is ready when this runs.
   Every feature first checks that its elements exist on the current page.

   Features:
     1. Theme switching (all pages)      - applyTheme(), initThemeToggle()
     2. Project filtering (projects.html) - renderProjects(), initProjectFilter()
     3. Dynamic footer year (all pages)  - setFooterYear()
     4. Contact form validation (contact.html) - validateField(), initContactForm()
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
        // CONDITIONS: ternary operator - the button offers the OTHER theme
        toggle.textContent = isDark ? "☀️ Light" : "🌙 Dark";
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
   FEATURE 4 (Task 5): CONTACT FORM VALIDATION (contact.html only)
   The form has `novalidate`, so the browser's own bubbles are off and these
   rules decide what is valid and which message the visitor sees.
   Nothing is sent anywhere - there is no backend.
   ========================================================================== */

const MESSAGE_MAX = 500;

/* OBJECT OF RULES - one entry per field, keyed by the field's id.
   `length` messages are arrow functions so they can include the live count. */
const validationRules = {
    name: {
        required: true,
        minLength: 3,
        maxLength: 50,
        pattern: /^[A-Za-z ]+$/,
        messages: {
            required: "Please enter your name.",
            length: (count) => `Name must be 3–50 characters long (currently ${count}).`,
            pattern: "Name can contain only letters and spaces."
        }
    },
    email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/,
        messages: {
            required: "Please enter your email address.",
            pattern: "Email must look like name@example.com."
        }
    },
    phone: {
        required: false,
        pattern: /^[6-9][0-9]{9}$/,
        messages: {
            pattern: "Phone must be exactly 10 digits and start with 6, 7, 8 or 9."
        }
    },
    subject: {
        required: true,
        messages: {
            required: "Please choose a subject."
        }
    },
    message: {
        required: true,
        minLength: 20,
        maxLength: MESSAGE_MAX,
        messages: {
            required: "Please write a message.",
            length: (count) => (count < 20
                ? `Message must be at least 20 characters (currently ${count}).`
                : `Message must be ${MESSAGE_MAX} characters or fewer (currently ${count}).`)
        }
    }
};

/* Returns the error text for one field, or "" when the value is valid. */
const getFieldError = (field) => {
    // DESTRUCTURING the rule object for this field
    const { required, minLength, maxLength, pattern, messages } = validationRules[field.id];
    const value = field.value.trim();

    // Empty: an error only if the field is required (phone is optional)
    if (value === "") {
        return required ? messages.required : "";
    }

    const tooShort = minLength !== undefined && value.length < minLength;
    const tooLong = maxLength !== undefined && value.length > maxLength;
    if (tooShort || tooLong) {
        return messages.length(value.length);
    }

    if (pattern && !pattern.test(value)) {
        return messages.pattern;
    }

    return "";
};

/* Shows the result on the page: Bootstrap is-valid / is-invalid, the text in
   the field's invalid-feedback div (linked by aria-describedby), aria-invalid.
   An empty optional field goes back to neutral - no green tick for nothing. */
const setFieldState = (field, error) => {
    const feedback = document.querySelector(`#${field.id}Error`);
    const isEmptyOptional = !validationRules[field.id].required && field.value.trim() === "";

    field.classList.remove("is-valid", "is-invalid");

    if (error) {
        field.classList.add("is-invalid");
        field.setAttribute("aria-invalid", "true");
    } else if (isEmptyOptional) {
        field.removeAttribute("aria-invalid");
    } else {
        field.classList.add("is-valid");
        field.setAttribute("aria-invalid", "false");
    }

    if (feedback) {
        feedback.textContent = error;
    }
};

/* Checks one field and paints its state. Returns true when valid.
   NORMAL FUNCTION (function declaration) */
function validateField(field) {
    const error = getFieldError(field);
    setFieldState(field, error);
    return error === "";
}

/* Live "45 / 500" counter under the message box; turns red past the limit. */
const updateCounter = (textarea, counter) => {
    if (!textarea || !counter) {
        return;
    }
    const count = textarea.value.length;
    counter.textContent = `${count} / ${MESSAGE_MAX}`;
    counter.classList.toggle("text-danger", count > MESSAGE_MAX);
};

/* Replaces whatever is in the alert area with one Bootstrap alert.
   The area has aria-live="polite", so screen readers announce the new text. */
const showFormAlert = (area, type, text) => {
    const alert = document.createElement("div");
    alert.classList.add("alert", `alert-${type}`, "mb-4");
    alert.textContent = text;
    area.replaceChildren(alert);
};

/* Removes every validation style and message (used by Reset and on success). */
const clearFieldStates = (fields) => {
    for (const field of fields) {
        field.classList.remove("is-valid", "is-invalid");
        field.removeAttribute("aria-invalid");
        const feedback = document.querySelector(`#${field.id}Error`);
        if (feedback) {
            feedback.textContent = "";
        }
    }
};

const initContactForm = () => {
    const form = document.querySelector("#contactForm");

    // Only contact.html has the form
    if (!form) {
        return;
    }

    const alertArea = form.querySelector("#formAlert");
    const messageBox = form.querySelector("#message");
    const counter = form.querySelector("#messageCounter");
    const resetButton = form.querySelector("button[type=\"reset\"]");

    // ARRAY METHODS: map rule names to elements, filter out any that are missing
    const fields = Object.keys(validationRules)
        .map((id) => form.querySelector(`#${id}`))
        .filter((field) => field !== null);

    fields.forEach((field) => {
        // EVENT: blur - check a field when the visitor leaves it
        field.addEventListener("blur", () => validateField(field));

        // EVENT: input - live re-check while typing, once a field has been
        // checked, so the very first keystroke does not show an error
        field.addEventListener("input", () => {
            const alreadyChecked = field.classList.contains("is-valid")
                || field.classList.contains("is-invalid");
            if (alreadyChecked) {
                validateField(field);
            }
        });
    });

    // EVENT: input - character counter for the message box
    if (messageBox) {
        messageBox.addEventListener("input", () => updateCounter(messageBox, counter));
    }

    // EVENT: submit - stop the page reload, validate everything, report
    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const invalidFields = fields.filter((field) => !validateField(field));

        if (invalidFields.length > 0) {
            const count = invalidFields.length;
            showFormAlert(alertArea, "danger", `Please fix ${count} ${count === 1 ? "error" : "errors"} below.`);
            const [firstInvalid] = invalidFields;
            firstInvalid.focus();
            return;
        }

        const name = form.querySelector("#name").value.trim();
        form.reset();
        clearFieldStates(fields);
        updateCounter(messageBox, counter);
        showFormAlert(alertArea, "success", `Thanks, ${name}! Your message has been received.`);
        alertArea.scrollIntoView({ block: "nearest" });
    });

    // EVENT: click on Reset - the browser empties the fields; this clears the
    // messages, colours, alert and counter
    if (resetButton) {
        resetButton.addEventListener("click", () => {
            clearFieldStates(fields);
            alertArea.replaceChildren();
            if (counter) {
                counter.textContent = `0 / ${MESSAGE_MAX}`;
                counter.classList.remove("text-danger");
            }
        });
    }
};


/* ==========================================================================
   START - run each feature once. `defer` means the DOM is already parsed.
   ========================================================================== */
initThemeToggle();
initProjectFilter();
setFooterYear();
initContactForm();
