/* script.js */

document.addEventListener('DOMContentLoaded', function() {

    console.log('DOM Content Loaded - Script Start');

    const IMAGE_ASPECT_RATIO = 3 / 2;
    const CONTAINER_MAX_WIDTH_PX = 1430;
    const MOBILE_BREAKPOINT = 768;
    const SWIPER_DESKTOP_SPACE_BETWEEN = 1;

    const productTitleElement = document.getElementById('product-title');
    const assetStoreButton = document.getElementById('asset-store-button');
    const footerRightElement = document.querySelector('.footer-right');
    const carouselSection = document.querySelector('.portfolio-carousel');
    const navbar = document.querySelector('.navbar');
    const footer = document.querySelector('footer');
    const navContainer = document.querySelector('.nav-container');
    const footerContainer = document.querySelector('.footer-container');
    const swiperElement = document.querySelector('.mySwiper');

    let swiperInstance = null;

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => { clearTimeout(timeout); func(...args); };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // --- MODIFIED: updateLayout uses requestAnimationFrame ---
    function updateLayout() {
        // Wrap layout calculations and DOM manipulations in requestAnimationFrame
        requestAnimationFrame(() => {
            const currentWindowWidth = window.innerWidth;
            if (!carouselSection || !navbar || !footer || !navContainer || !footerContainer) return;

            const slideContentWrappers = document.querySelectorAll('.slide-content-wrapper');

            // --- Mobile Check ---
            if (currentWindowWidth <= MOBILE_BREAKPOINT) {
                navContainer.style.maxWidth = '';
                footerContainer.style.maxWidth = '';
                carouselSection.style.height = '';
                if (slideContentWrappers.length > 0) {
                    slideContentWrappers.forEach(wrapper => wrapper.style.maxWidth = '');
                }
                 if (swiperInstance) swiperInstance.update();
                return;
            }

            // --- Desktop Calculation ---
            try {
                // Read dimensions just before applying changes
                const navHeight = navbar.offsetHeight;
                const footerHeight = footer.offsetHeight;
                if (navHeight <= 0 || footerHeight <= 0) return;

                const availableHeight = window.innerHeight - navHeight - footerHeight;
                if (availableHeight <= 50) { carouselSection.style.height = '200px'; return; }

                // Set container height
                carouselSection.style.height = `${availableHeight}px`;

                // Calculate and set max-width for alignment
                const potentialWidth = availableHeight * IMAGE_ASPECT_RATIO;
                const targetContentWidth = Math.min(potentialWidth, CONTAINER_MAX_WIDTH_PX, currentWindowWidth - 80);
                const finalWidthPx = Math.floor(targetContentWidth);
                const widthToApply = `${finalWidthPx}px`;

                navContainer.style.maxWidth = widthToApply;
                footerContainer.style.maxWidth = widthToApply;

                // Apply max-width to slide wrappers
                if (slideContentWrappers.length > 0) {
                    slideContentWrappers.forEach(wrapper => {
                        wrapper.style.maxWidth = widthToApply;
                    });
                }

                 // Update Swiper *after* container sizes are set within the same frame
                 if (swiperInstance) swiperInstance.update();

            } catch (error) {
                console.error("Error during layout update:", error);
                // Reset styles on error
                navContainer.style.maxWidth = ''; footerContainer.style.maxWidth = ''; carouselSection.style.height = '';
                const slideContentWrappers = document.querySelectorAll('.slide-content-wrapper'); if (slideContentWrappers.length > 0) { slideContentWrappers.forEach(wrapper => wrapper.style.maxWidth = ''); }
            }
        }); // End of requestAnimationFrame callback
    }
    // --- END MODIFICATION ---


     function updateProductInfo(swiper) {
         const yearSpan = document.getElementById('year');
         let currentProductName = 'Product Information'; let currentAssetLink = '#'; let currentProductYear = new Date().getFullYear();

         if (swiper && swiper.slides && swiper.slides.length > 0) {
             const activeSlideIndex = swiper.realIndex !== undefined ? swiper.realIndex : swiper.activeIndex;
             const originalSlideElement = swiper.wrapperEl.querySelector(`.swiper-slide[data-swiper-slide-index="${activeSlideIndex}"]`);
             if (originalSlideElement && originalSlideElement.dataset) {
                 currentProductName = originalSlideElement.dataset.productName || currentProductName; currentAssetLink = originalSlideElement.dataset.assetLink || currentAssetLink; currentProductYear = originalSlideElement.dataset.productYear || currentProductYear;
             } else {
                 const fallbackSlide = swiper.slides[swiper.activeIndex];
                 if (fallbackSlide && fallbackSlide.dataset) {
                     currentProductName = fallbackSlide.dataset.productName || currentProductName; currentAssetLink = fallbackSlide.dataset.assetLink || currentAssetLink; currentProductYear = fallbackSlide.dataset.productYear || currentProductYear;
                 }
                 console.warn(`Could not find original slide for index ${activeSlideIndex}, used fallback or defaults.`);
             }
         } else { console.warn("Swiper instance or slides not available for updateProductInfo."); }

         if (productTitleElement) { productTitleElement.textContent = currentProductName; }
         if (assetStoreButton) {
             assetStoreButton.href = currentAssetLink;
             if (currentAssetLink && currentAssetLink !== '#') { assetStoreButton.classList.remove('disabled'); assetStoreButton.removeAttribute('aria-disabled'); }
             else { assetStoreButton.classList.add('disabled'); assetStoreButton.setAttribute('aria-disabled', 'true'); }
         }
         if (yearSpan) { yearSpan.textContent = currentProductYear; }
     }

    function initializeSwiper() {
        if (swiperInstance) return;
        try {
            const slides = swiperElement.querySelectorAll('.swiper-slide');
            const enableLoop = slides.length > 3;
            console.log(`Found ${slides.length} slides. Loop enabled: ${enableLoop}`);
            swiperInstance = new Swiper('.mySwiper', {
                spaceBetween: 0, grabCursor: true, watchOverflow: true, initialSlide: 0, loop: enableLoop, loopedSlides: enableLoop ? Math.max(slides.length, 5) : null,
                noSwipingClass: 'swiper-no-swiping', navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                breakpoints: { [MOBILE_BREAKPOINT + 1]: { slidesPerView: 'auto', spaceBetween: SWIPER_DESKTOP_SPACE_BETWEEN, centeredSlides: true, } },
                on: {
                    init: function(swiper) {
                        console.log('Swiper Initialized'); updateProductInfo(swiper);
                        if (productTitleElement) productTitleElement.classList.remove('title-fading'); if (assetStoreButton) assetStoreButton.classList.remove('button-fading'); if (footerRightElement) footerRightElement.classList.remove('footer-right-fading');
                        swiper.navigation.update();
                        setTimeout(() => { console.log('Running update and loopFix after init timeout'); swiper.update(); if (swiper.params.loop) { swiper.loopFix(); } swiper.navigation.update(); }, 0);
                    },
                    slideChangeTransitionStart: function(swiper) {
                        if (assetStoreButton && !assetStoreButton.classList.contains('disabled')) { assetStoreButton.classList.add('button-fading'); }
                        if (productTitleElement) { productTitleElement.classList.add('title-fading'); } if (footerRightElement) { footerRightElement.classList.add('footer-right-fading'); }
                    },
                    slideChangeTransitionEnd: function(swiper) {
                        updateProductInfo(swiper);
                        if (assetStoreButton) { assetStoreButton.classList.remove('button-fading'); } if (productTitleElement) { productTitleElement.classList.remove('title-fading'); } if (footerRightElement) { footerRightElement.classList.remove('footer-right-fading'); }
                        swiper.navigation.update();
                    },
                    resize: function(swiper){ // This still triggers the debounced call
                        updateLayout(); // updateLayout now uses requestAnimationFrame
                        // swiper.update() is now called inside updateLayout's rAF callback
                    }
                }
            });
            console.log('Swiper instance created successfully.');
        } catch (e) { console.error("Error Initializing Swiper:", e); alert("Error initializing the image carousel."); }
    }

    window.addEventListener('load', () => {
        setTimeout(() => { updateLayout(); initializeSwiper(); console.log('Initial Load sequence complete.'); }, 100);
    });

    // Keep resize debounced, but the function it calls now uses requestAnimationFrame
    window.addEventListener('resize', debounce(updateLayout, 150));

    document.addEventListener('DOMContentLoaded', () => {
        const yearSpan = document.getElementById('year');
        if (yearSpan) {
            const currentYear = new Date().getFullYear(); if (!yearSpan.textContent) { yearSpan.textContent = currentYear; }
            console.log(`Context time: ${new Date().toISOString()}`); console.log(`Location: Virginia Beach, Virginia, United States`);
        } else { console.error("ID 'year' not found"); }
        const emailUser = 'arcabidi'; const emailDomain = 'gmail.com'; const emailLink = document.getElementById('email-link');
        if (emailLink) { if (emailLink.textContent !== `${emailUser}@${emailDomain}`) { const fullEmail = `${emailUser}@${emailDomain}`; emailLink.href = `mailto:${fullEmail}`; emailLink.textContent = fullEmail; } }
        else { console.error("ID 'email-link' not found"); }
        console.log('Non-Swiper initializations complete.');
    });
    console.log('End script execution (initial)');
});