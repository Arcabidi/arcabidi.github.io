document.addEventListener('DOMContentLoaded', function() {

    console.log('DOM Content Loaded - Script Start');

    // --- Configuration ---
    const IMAGE_ASPECT_RATIO = 3 / 2; // Use the aspect ratio of your actual images (e.g., 2400/1600 = 1.5)
    const CONTAINER_MAX_WIDTH_PX = 1430; // Adjust max content width if needed
    const MOBILE_BREAKPOINT = 768;
    const SWIPER_DESKTOP_SPACE_BETWEEN = 1; // Keeping 1px for testing loop issues

    // --- Get references to elements ---
    const productTitleElement = document.getElementById('product-title');
    const assetStoreButton = document.getElementById('asset-store-button');
    const carouselSection = document.querySelector('.portfolio-carousel');
    const navbar = document.querySelector('.navbar');
    const footer = document.querySelector('footer');
    const navContainer = document.querySelector('.nav-container');
    const footerContainer = document.querySelector('.footer-container');
    const swiperElement = document.querySelector('.mySwiper');


    // --- Global Swiper Instance Variable ---
    let swiperInstance = null;

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


    // --- Function to Sync Layout ---
    function updateLayout() {
        const currentWindowWidth = window.innerWidth;

        if (!carouselSection || !navbar || !footer || !navContainer || !footerContainer) {
            console.warn("updateLayout: Missing required elements.");
            return;
        }
         const slideContentWrappers = document.querySelectorAll('.slide-content-wrapper');

        // --- Mobile Check ---
        if (currentWindowWidth <= MOBILE_BREAKPOINT) {
            navContainer.style.maxWidth = '';
            footerContainer.style.maxWidth = '';
            carouselSection.style.height = '';
            if (slideContentWrappers.length > 0) {
               slideContentWrappers.forEach(wrapper => wrapper.style.maxWidth = '');
            }
             if (swiperInstance) {
                swiperInstance.update();
             }
            return;
        }

        // --- Desktop Calculation ---
        try {
            const navHeight = navbar.offsetHeight;
            const footerHeight = footer.offsetHeight;

            if (navHeight <= 0 || footerHeight <= 0) {
                console.warn("Layout update skipped: nav/footer height invalid.");
                return;
            }

            const availableHeight = window.innerHeight - navHeight - footerHeight;
            if (availableHeight <= 50) {
                 console.warn(`Layout update skipped: available height too small (${availableHeight}px).`);
                 carouselSection.style.height = '200px';
                 return;
            }

            carouselSection.style.height = `${availableHeight}px`;

            const potentialWidth = availableHeight * IMAGE_ASPECT_RATIO;
            const targetContentWidth = Math.min(potentialWidth, CONTAINER_MAX_WIDTH_PX, currentWindowWidth - 80);
            const finalWidthPx = Math.floor(targetContentWidth);
            const widthToApply = `${finalWidthPx}px`;

            navContainer.style.maxWidth = widthToApply;
            footerContainer.style.maxWidth = widthToApply;

            if (slideContentWrappers.length > 0) {
                slideContentWrappers.forEach(wrapper => {
                    wrapper.style.maxWidth = widthToApply;
                });
            }
             if (swiperInstance) {
                 swiperInstance.update();
             }

        } catch (error) {
            console.error("Error during layout update:", error);
            navContainer.style.maxWidth = '';
            footerContainer.style.maxWidth = '';
            carouselSection.style.height = '';
            document.querySelectorAll('.slide-content-wrapper').forEach(wrapper => wrapper.style.maxWidth = '');
        }
    }


     // --- Function to update the footer product title & link ---
     function updateProductInfo(swiper) {
        if (!swiper || !productTitleElement || !assetStoreButton || !swiper.slides || swiper.slides.length === 0) {
             productTitleElement.textContent = 'Product Information';
             assetStoreButton.href = '#';
             assetStoreButton.classList.add('disabled');
             assetStoreButton.setAttribute('aria-disabled', 'true');
             return;
        }
        const activeSlideIndex = swiper.realIndex !== undefined ? swiper.realIndex : swiper.activeIndex;
        const originalSlideElement = swiper.wrapperEl.querySelector(`.swiper-slide[data-swiper-slide-index="${activeSlideIndex}"]`);

        if (originalSlideElement && originalSlideElement.dataset) {
            const productName = originalSlideElement.dataset.productName;
            const assetLink = originalSlideElement.dataset.assetLink;
            productTitleElement.textContent = productName || 'Product Title';
            if (assetLink && assetLink !== '#' && assetLink !== '') {
                assetStoreButton.href = assetLink;
                assetStoreButton.classList.remove('disabled');
                assetStoreButton.removeAttribute('aria-disabled');
            } else {
                assetStoreButton.href = '#';
                assetStoreButton.classList.add('disabled');
                assetStoreButton.setAttribute('aria-disabled', 'true');
            }
        } else {
             const fallbackSlide = swiper.slides[swiper.activeIndex];
             if (fallbackSlide && fallbackSlide.dataset) {
                  productTitleElement.textContent = fallbackSlide.dataset.productName || 'Product Title';
                  assetStoreButton.href = fallbackSlide.dataset.assetLink || '#';
                  if(assetStoreButton.href === '#') assetStoreButton.classList.add('disabled');
                  else assetStoreButton.classList.remove('disabled');
             } else {
                 productTitleElement.textContent = 'Product Information';
                 assetStoreButton.href = '#';
                 assetStoreButton.classList.add('disabled');
                 assetStoreButton.setAttribute('aria-disabled', 'true');
             }
            console.warn(`Could not find original slide for index ${activeSlideIndex}, used fallback.`);
        }
    }

    // --- Swiper Initialization Function ---
    function initializeSwiper() {
        if (swiperInstance) {
            console.log("Swiper already initialized.");
            return;
        }

        try {
            const slides = swiperElement.querySelectorAll('.swiper-slide');
            const enableLoop = false; // slides.length >= 3;
            const loopBuffer = 3; // Number of slides to buffer for loop

            swiperInstance = new Swiper('.mySwiper', {
                // Base (Mobile) - Loop disabled here
                slidesPerView: 1,
                spaceBetween: 0,
                loop: false, // Explicitly false for mobile base
                grabCursor: true,
                watchOverflow: true,
                initialSlide: 0,
                centeredSlides: false, // False for mobile base

                // --- Parameters affecting loop behavior globally when enabled ---
                loop: enableLoop, // Enable loop globally if condition met
                loopedSlides: enableLoop ? loopBuffer : null, // Set loopedSlides buffer only if loop enabled

                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                breakpoints: {
                    // Desktop - Configures settings *when loop is already enabled globally*
                    [MOBILE_BREAKPOINT + 1]: {
                        slidesPerView: 'auto',
                        spaceBetween: SWIPER_DESKTOP_SPACE_BETWEEN, // 1px
                        centeredSlides: true,
                    }
                },
                on: {
                    init: function(swiper) {
                        console.log('Swiper Initialized (on init event)');
                        updateProductInfo(swiper);
                        swiper.navigation.update();
                        swiper.pagination.update();
                    },
                    slideChange: updateProductInfo,

                    // Add handlers for transition start/end
                    slideChangeTransitionStart: function(swiper) {
                        if (assetStoreButton && !assetStoreButton.classList.contains('disabled')) {
                            assetStoreButton.classList.add('store-button-sliding');
                        }
                    },
                    slideChangeTransitionEnd: function(swiper) {
                        if (assetStoreButton) {
                            assetStoreButton.classList.remove('store-button-sliding');
                        }
                    },

                    resize: updateLayout
                }
            });
            console.log('Swiper instance created successfully.');

            if (swiperInstance) {
                 swiperInstance.navigation.update();
                 swiperInstance.pagination.update();
            }

        } catch (e) {
            console.error("Error Initializing Swiper:", e);
            alert("Error initializing the image carousel. Please try refreshing.");
        }
    }


    // --- Attach Global Event Listeners ---
    window.addEventListener('load', () => {
        console.log('Window Load event fired.');
        setTimeout(() => {
            console.log('Running initial updateLayout BEFORE Swiper init');
            updateLayout(); // Calculate and apply layout first

            console.log('Initializing Swiper AFTER layout...');
            initializeSwiper(); // Initialize Swiper *after* layout is set

            console.log('Initial Load sequence complete.');
        }, 100); // Delay slightly for final rendering
    });

    // Update layout on window resize (debounced)
    window.addEventListener('resize', debounce(updateLayout, 150));


    // --- Non-Swiper related initializations (can run earlier) ---
    document.addEventListener('DOMContentLoaded', () => {
        // Email Obfuscation
        const emailUser = 'arcabidi'; // Replace
        const emailDomain = 'gmail.com'; // Replace
        const emailLink = document.getElementById('email-link');
        if (emailLink) {
            // Check if text content is already the email to prevent errors if JS runs multiple times
            if (emailLink.textContent !== `${emailUser}@${emailDomain}`) {
                 const fullEmail = `${emailUser}@${emailDomain}`;
                 emailLink.href = `mailto:${fullEmail}`;
                 emailLink.textContent = fullEmail;
            }
        } else { console.error("Could not find element with ID 'email-link'"); }

        // Dynamic Year for Footer
        const yearSpan = document.getElementById('year');
        if (yearSpan) {
            const currentDate = new Date();
             // Check if year is already set to prevent errors if JS runs multiple times
            if (yearSpan.textContent !== currentDate.getFullYear().toString()) {
                yearSpan.textContent = currentDate.getFullYear();
            }
             // Context time: Thursday, April 3, 2025 at 1:39:47 AM EDT
             console.log("Context time used for reference: 2025-04-03T01:39:47-04:00");
        } else { console.error("Could not find element with ID 'year'"); }

        console.log('DOM Content Loaded - Non-Swiper initializations complete.');
    }); // End DOMContentLoaded for non-swiper things

     console.log('End of script execution (initial run before load/DOMContentLoaded)');

}); // End Main Scope Function