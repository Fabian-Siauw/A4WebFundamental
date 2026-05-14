(() => {
    const CONFIG = {
        BREAKPOINTS: { MOBILE: 1023.5 },
        SELECTORS: {
            body: "body",
            navigation: "#cs-navigation",
            hamburger: "#cs-navigation .cs-toggle",
            menuWrapper: "#cs-ul-wrapper",
            dropdownToggle: ".cs-dropdown-toggle",
            dropdown: ".cs-dropdown",
            dropdownMenu: ".cs-drop-ul",
        },
        CLASSES: {
            active: "cs-active",
            menuOpen: "cs-open",
            scroll: "scroll",
        },
    };

    const elements = {
        body: document.querySelector(CONFIG.SELECTORS.body),
        navigation: document.querySelector(CONFIG.SELECTORS.navigation),
        hamburger: document.querySelector(CONFIG.SELECTORS.hamburger),
        menuWrapper: document.querySelector(CONFIG.SELECTORS.menuWrapper),
    };

    const isMobile = () => window.matchMedia(`(max-width: ${CONFIG.BREAKPOINTS.MOBILE}px)`).matches;

    const toggleAttribute = (element, attribute, value1 = "true", value2 = "false") => {
        if (!element) return;
        const current = element.getAttribute(attribute);
        element.setAttribute(attribute, current === value1 ? value2 : value1);
    };

    const toggleInert = (element) => element && (element.inert = !element.inert);

    const dropdownManager = {
        close(dropdown, shouldFocus = false) {
            if (!dropdown || !dropdown.classList.contains(CONFIG.CLASSES.active)) return false;
            dropdown.classList.remove(CONFIG.CLASSES.active);
            const button = dropdown.querySelector(CONFIG.SELECTORS.dropdownToggle);
            const menu = dropdown.querySelector(CONFIG.SELECTORS.dropdownMenu);
            if (button) {
                button.setAttribute("aria-expanded", "false");
                shouldFocus && button.focus();
            }
            if (menu) menu.inert = true;
            return true;
        },
        toggle(element) {
            element.classList.toggle(CONFIG.CLASSES.active);
            const button = element.querySelector(CONFIG.SELECTORS.dropdownToggle);
            const menu = element.querySelector(CONFIG.SELECTORS.dropdownMenu);
            button && toggleAttribute(button, "aria-expanded");
            menu && toggleInert(menu);
        },
        closeAll() {
            if (!elements.navigation) return false;
            let closed = false;
            elements.navigation.querySelectorAll(`${CONFIG.SELECTORS.dropdown}.${CONFIG.CLASSES.active}`).forEach((dropdown) => {
                this.close(dropdown, true);
                closed = true;
            });
            return closed;
        },
    };

    const menuManager = {
        toggle() {
            if (!elements.hamburger || !elements.navigation) return;
            const isClosing = elements.navigation.classList.contains(CONFIG.CLASSES.active);
            [elements.hamburger, elements.navigation].forEach((el) => el.classList.toggle(CONFIG.CLASSES.active));
            elements.body.classList.toggle(CONFIG.CLASSES.menuOpen);
            toggleAttribute(elements.hamburger, "aria-expanded");
            if (elements.menuWrapper && isMobile()) toggleInert(elements.menuWrapper);
            isClosing && dropdownManager.closeAll();
        },
    };

    const keyboardManager = {
        handleEscape() {
            if (!elements.navigation) return;
            const dropdownsClosed = dropdownManager.closeAll();
            if (dropdownsClosed) return;
            if (elements.hamburger && elements.hamburger.classList.contains(CONFIG.CLASSES.active)) {
                menuManager.toggle();
                elements.hamburger.focus();
            }
        },
    };

    const eventManager = {
        handleDropdownClick(event) {
            if (!isMobile()) return;
            const button = event.target.closest(CONFIG.SELECTORS.dropdownToggle);
            if (!button) return;
            event.preventDefault();
            const dropdown = button.closest(CONFIG.SELECTORS.dropdown);
            if (dropdown) dropdownManager.toggle(dropdown);
        },
        handleFocusOut(event) {
            setTimeout(() => {
                if (!event.relatedTarget) return;
                const dropdown = event.target.closest(CONFIG.SELECTORS.dropdown);
                if (dropdown?.classList.contains(CONFIG.CLASSES.active) && !dropdown.contains(event.relatedTarget)) {
                    dropdownManager.close(dropdown);
                }
            }, 10);
        },
        handleMobileFocus(event) {
            if (!isMobile() || !elements.navigation.classList.contains(CONFIG.CLASSES.active)) return;
            if (elements.menuWrapper.contains(event.target) || elements.hamburger.contains(event.target)) return;
            menuManager.toggle();
        },
    };

    const scrollManager = {
        handleScrollEffects() {
            const scrollPosition = document.documentElement.scrollTop;
            elements.body.classList.toggle(CONFIG.CLASSES.scroll, scrollPosition >= 100);
        },
    };

    const init = {
        inertState() {
            if (!elements.menuWrapper) return;
            elements.menuWrapper.inert = isMobile();
        },
        eventListeners() {
            if (!elements.hamburger || !elements.navigation) return;
            elements.hamburger.addEventListener("click", menuManager.toggle.bind(menuManager));
            elements.navigation.addEventListener("click", eventManager.handleDropdownClick);
            elements.navigation.addEventListener("focusout", eventManager.handleFocusOut);
            document.addEventListener("keydown", (e) => e.key === "Escape" && keyboardManager.handleEscape());
            document.addEventListener("focusin", eventManager.handleMobileFocus);
            document.addEventListener("scroll", () => scrollManager.handleScrollEffects());
            window.addEventListener("resize", () => {
                this.inertState();
                if (!isMobile() && elements.navigation.classList.contains(CONFIG.CLASSES.active)) {
                    menuManager.toggle();
                }
            });
        },
    };

    init.inertState();
    init.eventListeners();
})();

/* ============================================ */
/*            Booking Form Validator             */
/* ============================================ */
(() => {
    const form = document.getElementById('booking-form');
    if (!form) return;

    const fields = {
        name:    { el: document.getElementById('bf-name'),    err: document.getElementById('bf-name-error') },
        phone:   { el: document.getElementById('bf-phone'),   err: document.getElementById('bf-phone-error') },
        service: { el: document.getElementById('bf-service'), err: document.getElementById('bf-service-error') },
        date:    { el: document.getElementById('bf-date'),    err: document.getElementById('bf-date-error') },
    };
    const successBox = document.getElementById('bf-success');

    const rules = {
        name(val) {
            if (!val.trim()) return 'Please enter your full name.';
            if (val.trim().length < 2) return 'Name must be at least 2 characters.';
            return '';
        },
        phone(val) {
            if (!val.trim()) return 'Please enter your phone number.';
            if (!/^[\d\s]{10,}$/.test(val.trim())) return 'Enter a valid Australian phone number.';
            return '';
        },
        service(val) {
            if (!val) return 'Please select a service.';
            return '';
        },
        date(val) {
            if (!val) return 'Please choose a preferred date.';
            const chosen = new Date(val);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (chosen < today) return 'Please pick a future date.';
            return '';
        },
    };

    function validateField(key) {
        const { el, err } = fields[key];
        const message = rules[key](el.value);
        err.textContent = message;
        el.classList.toggle('bf-invalid', !!message);
        return !message;
    }

    // Live validation on blur and input
    Object.keys(fields).forEach(key => {
        fields[key].el.addEventListener('blur', () => validateField(key));
        fields[key].el.addEventListener('input', () => {
            if (fields[key].el.classList.contains('bf-invalid')) validateField(key);
        });
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        successBox.textContent = '';
        const allValid = Object.keys(fields).map(validateField).every(Boolean);
        if (allValid) {
            successBox.textContent = "Booking request sent! We'll call you to confirm.";
            form.reset();
            Object.keys(fields).forEach(key => fields[key].el.classList.remove('bf-invalid'));
        }
    });
})();
