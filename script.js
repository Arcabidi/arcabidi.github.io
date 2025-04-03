/* script.js */

document.addEventListener('DOMContentLoaded', function() {

    console.log('DOM Content Loaded - Script Start');

    // --- Configuration ---
    const IMAGE_ASPECT_RATIO = 3 / 2;
    const CONTAINER_MAX_WIDTH_PX = 1430;
    const MOBILE_BREAKPOINT = 768;
    const SWIPER_DESKTOP_SPACE_BETWEEN = 1;

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
     // This function now gets called at the START of slideChangeTransitionEnd
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

             // Update text content INSTANTLY (while element is still opacity 0)
             productTitleElement.textContent = productName || 'Product Title';

             // Update button link and state INSTANTLY (while button is still opacity 0)
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
             // Fallback logic
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
            const enableLoop = slides.length > 3; // Loop only for 4+ slides

            console.log(`Found ${slides.length} slides. Loop enabled: ${enableLoop}`);

            swiperInstance = new Swiper('.mySwiper', {
                // Base settings
                slidesPerView: 1,
                spaceBetween: 0,
                grabCursor: true,
                watchOverflow: true,
                initialSlide: 0,
                centeredSlides: false,

                // Global Loop Settings
                loop: enableLoop,
                loopedSlides: enableLoop ? Math.max(slides.length, 5) : null,

                // Navigation
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                // Breakpoints
                breakpoints: {
                    [MOBILE_BREAKPOINT + 1]: { // Desktop
                        slidesPerView: 'auto',
                        spaceBetween: SWIPER_DESKTOP_SPACE_BETWEEN,
                        centeredSlides: true,
                    }
                },
                // Event Handlers
                on: {
                    init: function(swiper) {
                        console.log('Swiper Initialized (on init event)');
                        updateProductInfo(swiper); // Set initial info

                        productTitleElement.classList.remove('title-fading');
                        assetStoreButton.classList.remove('button-fading');

                        swiper.navigation.update();

                        setTimeout(() => {
                            console.log('Running update and loopFix after init timeout');
                            swiper.update();
                            if (swiper.params.loop) {
                                swiper.loopFix();
                            }
                            swiper.navigation.update();
                        }, 0);
                    },

                    // --- REMOVED updateProductInfo call from slideChange ---
                    // slideChange: function(swiper) {
                    //     // updateProductInfo(swiper); // NO LONGER CALLED HERE
                    // },

                    slideChangeTransitionStart: function(swiper) {
                        // Start fade out
                        if (assetStoreButton && !assetStoreButton.classList.contains('disabled')) {
                            assetStoreButton.classList.add('button-fading');
                        }
                        if (productTitleElement) {
                             productTitleElement.classList.add('title-fading');
                        }
                    },
                    slideChangeTransitionEnd: function(swiper) {
                        // --- MOVED updateProductInfo call here ---
                        // Update text content and button state INSTANTLY *before* fade-in starts
                        updateProductInfo(swiper);

                        // Start fade in
                        if (assetStoreButton) {
                            assetStoreButton.classList.remove('button-fading');
                        }
                         if (productTitleElement) {
                             productTitleElement.classList.remove('title-fading');
                        }

                        swiper.navigation.update(); // Update nav state after transition
                    },
                    resize: function(swiper){
                        updateLayout();
                    }
                }
            });
            console.log('Swiper instance created successfully.');

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
            updateLayout();
            console.log('Initializing Swiper AFTER layout...');
            initializeSwiper();
            console.log('Initial Load sequence complete.');
        }, 100);
    });

    window.addEventListener('resize', debounce(updateLayout, 150));

    // --- Non-Swiper related initializations ---
    document.addEventListener('DOMContentLoaded', () => {
        const emailUser = 'arcabidi';
        const emailDomain = 'gmail.com';
        const emailLink = document.getElementById('email-link');
        if (emailLink) {
            if (emailLink.textContent !== `${emailUser}@${emailDomain}`) {
                 const fullEmail = `${emailUser}@${emailDomain}`;
                 emailLink.href = `mailto:${fullEmail}`;
                 emailLink.textContent = fullEmail;
            }
        } else { console.error("Could not find element with ID 'email-link'"); }

        const yearSpan = document.getElementById('year');
        if (yearSpan) {
            const currentDate = new Date();
             if (yearSpan.textContent !== currentDate.getFullYear().toString()) {
                 yearSpan.textContent = currentDate.getFullYear();
             }
             console.log(`Context time: ${new Date().toISOString()}`);
             console.log(`Location: Virginia Beach, Virginia, United States`);
        } else { console.error("Could not find element with ID 'year'"); }

        console.log('DOM Content Loaded - Non-Swiper initializations complete.');
    });

     console.log('End of script execution (initial run before load/DOMContentLoaded)');

});