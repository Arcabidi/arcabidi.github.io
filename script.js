document.addEventListener('DOMContentLoaded', function() {

    // --- Get references to elements ---
    const productTitleElement = document.getElementById('product-title');
    const assetStoreButton = document.getElementById('asset-store-button');
    const footerContainer = document.querySelector('.footer-container');

    // Check if elements exist
    if (!productTitleElement) console.error("Could not find element with ID 'product-title'");
    if (!assetStoreButton) console.error("Could not find element with ID 'asset-store-button'");
    if (!footerContainer) console.error("Could not find element with class 'footer-container'");

    // --- Initialize Swiper ---
    const swiper = new Swiper('.mySwiper', {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: false,
        grabCursor: true,
        watchOverflow: true,
        initialSlide: 0, // Start on the first slide
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            769: { // Desktop settings
                slidesPerView: 'auto',
                centeredSlides: true,
                spaceBetween: 0
            }
        }
    });

    // --- Debounce function ---
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // --- Function to update the footer product title ---
    function updateProductTitle() {
        const titleEl = document.getElementById('product-title');
        if (!titleEl || !swiper.slides || swiper.slides.length === 0 || swiper.activeIndex === undefined) return;

        const activeSlide = swiper.slides[swiper.activeIndex];
        if (activeSlide && activeSlide.dataset) {
            const productName = activeSlide.dataset.productName;
            titleEl.textContent = productName || 'Product Title';
        } else {
            titleEl.textContent = 'Product Title';
        }
    }

    // --- Function to update the Asset Store button link ---
    function updateAssetLink() {
        const buttonEl = document.getElementById('asset-store-button');
        if (!buttonEl || !swiper.slides || swiper.slides.length === 0 || swiper.activeIndex === undefined) return;

        const activeSlide = swiper.slides[swiper.activeIndex];
        if (activeSlide && activeSlide.dataset) {
            const assetLink = activeSlide.dataset.assetLink;
            buttonEl.href = assetLink || '#';
        } else {
            buttonEl.href = '#';
        }
    }

    // --- Function to set the FIXED Asset Store button position ---
    // --- Renamed for clarity: setFixedButtonPosition ---
    function setFixedButtonPosition() {
        const buttonEl = document.getElementById('asset-store-button');
        const footerEl = document.querySelector('.footer-container');

        // Check required elements exist
        if (!buttonEl || !footerEl) {
             console.warn("Missing elements for fixed button positioning.");
             return;
        }

        // Only run positioning logic on viewports where absolute positioning is used (desktop)
        if (window.innerWidth < 769) {
             buttonEl.style.left = ''; // Remove inline style on mobile
             return; // Exit if on mobile view
        }

        try {
            const footerRect = footerEl.getBoundingClientRect();
            // Calculate the center of the viewport
            const viewportCenter = window.innerWidth / 2;

            // Calculate the desired 'left' offset for the button relative to the footer container
            // This aligns the button's left edge with the viewport's center
            const buttonLeftOffset = viewportCenter - footerRect.left;

            // Apply the calculated position
            requestAnimationFrame(() => {
               buttonEl.style.left = `${buttonLeftOffset}px`;
            });

        } catch (e) {
            console.error("Error calculating fixed button position:", e);
            buttonEl.style.left = '50%'; // Fallback to center-ish on error
        }
    }


    // --- Attach event listeners ---

    // Update Title & Link immediately when slide starts changing
    swiper.on('slideChange', () => {
        updateProductTitle();
        updateAssetLink();
        // NOTE: Position is NO LONGER updated on slide change
    });

    // Initial setup after Swiper is fully initialized
    swiper.on('init', () => {
        updateProductTitle();   // Set initial title
        updateAssetLink();    // Set initial link
        setFixedButtonPosition(); // Set initial FIXED button position
        swiper.update(); // Ensure Swiper layout is correct initially
    });

    // Add debounced resize listener to recalculate FIXED button position
    window.addEventListener('resize', debounce(setFixedButtonPosition, 150));

    // --- Email Obfuscation ---
    const emailUser = 'arcabidi'; // Part before the @
    const emailDomain = 'gmail.com'; // Part after the @
    const emailLink = document.getElementById('email-link');
    if (emailLink) {
        const fullEmail = `${emailUser}@${emailDomain}`;
        emailLink.href = `mailto:${fullEmail}`;
        emailLink.textContent = fullEmail;
    } else {
        console.error("Could not find element with ID 'email-link'");
    }

    // --- Dynamic Year for Footer ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        const currentDate = new Date(); // Use current time
        yearSpan.textContent = currentDate.getFullYear();
    } else {
        console.error("Could not find element with ID 'year'");
    }
});