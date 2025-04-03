/* script.js */

document.addEventListener('DOMContentLoaded', function() {

    console.log('DOM Content Loaded - Script Start');

    const IMAGE_ASPECT_RATIO = 3 / 2;
    const CONTAINER_MAX_WIDTH_PX = 1430;
    const MOBILE_BREAKPOINT = 768;
    const SWIPER_DESKTOP_SPACE_BETWEEN = 1;

    const productTitleElement = document.getElementById('product-title');
    const assetStoreButton = document.getElementById('asset-store-button');
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

    function updateLayout() {
        const currentWindowWidth = window.innerWidth;
        if (!carouselSection || !navbar || !footer || !navContainer || !footerContainer) return;

        const slideContentWrappers = document.querySelectorAll('.slide-content-wrapper');

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

        try {
            const navHeight = navbar.offsetHeight;
            const footerHeight = footer.offsetHeight;
            if (navHeight <= 0 || footerHeight <= 0) return;

            const availableHeight = window.innerHeight - navHeight - footerHeight;
            if (availableHeight <= 50) { carouselSection.style.height = '200px'; return; }

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
             if (swiperInstance) swiperInstance.update();

        } catch (error) {
            console.error("Error during layout update:", error);
            navContainer.style.maxWidth = ''; footerContainer.style.maxWidth = ''; carouselSection.style.height = '';
            const slideContentWrappers = document.querySelectorAll('.slide-content-wrapper');
            if (slideContentWrappers.length > 0) { slideContentWrappers.forEach(wrapper => wrapper.style.maxWidth = ''); }
        }
    }

     function updateProductInfo(swiper) {
         if (!swiper || !productTitleElement || !assetStoreButton || !swiper.slides || swiper.slides.length === 0) {
             productTitleElement.textContent = 'Product Information';
             assetStoreButton.href = '#'; assetStoreButton.classList.add('disabled'); assetStoreButton.setAttribute('aria-disabled', 'true');
             return;
         }
         const activeSlideIndex = swiper.realIndex !== undefined ? swiper.realIndex : swiper.activeIndex;
         const originalSlideElement = swiper.wrapperEl.querySelector(`.swiper-slide[data-swiper-slide-index="${activeSlideIndex}"]`);

         if (originalSlideElement && originalSlideElement.dataset) {
             const productName = originalSlideElement.dataset.productName; const assetLink = originalSlideElement.dataset.assetLink;
             productTitleElement.textContent = productName || 'Product Title';
             if (assetLink && assetLink !== '#' && assetLink !== '') {
                 assetStoreButton.href = assetLink; assetStoreButton.classList.remove('disabled'); assetStoreButton.removeAttribute('aria-disabled');
             } else {
                 assetStoreButton.href = '#'; assetStoreButton.classList.add('disabled'); assetStoreButton.setAttribute('aria-disabled', 'true');
             }
         } else {
             const fallbackSlide = swiper.slides[swiper.activeIndex];
             if (fallbackSlide && fallbackSlide.dataset) {
                  productTitleElement.textContent = fallbackSlide.dataset.productName || 'Product Title'; assetStoreButton.href = fallbackSlide.dataset.assetLink || '#';
                  if(assetStoreButton.href === '#') assetStoreButton.classList.add('disabled'); else assetStoreButton.classList.remove('disabled');
             } else {
                 productTitleElement.textContent = 'Product Information'; assetStoreButton.href = '#'; assetStoreButton.classList.add('disabled'); assetStoreButton.setAttribute('aria-disabled', 'true');
             }
             console.warn(`Could not find original slide for index ${activeSlideIndex}, used fallback or slide has no data.`);
         }
     }

    function initializeSwiper() {
        if (swiperInstance) return;
        try {
            const slides = swiperElement.querySelectorAll('.swiper-slide');
            const enableLoop = slides.length > 3;

            console.log(`Found ${slides.length} slides. Loop enabled: ${enableLoop}`);

            swiperInstance = new Swiper('.mySwiper', {
                spaceBetween: 0, // Base space
                grabCursor: true,
                watchOverflow: true,
                initialSlide: 0,
                loop: enableLoop,
                loopedSlides: enableLoop ? Math.max(slides.length, 5) : null,

                // *** ADD/ENSURE THIS IS PRESENT ***
                noSwipingClass: 'swiper-no-swiping', // Class on elements Swiper should ignore for dragging

                navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                breakpoints: {
                    [MOBILE_BREAKPOINT + 1]: { // Desktop
                        slidesPerView: 'auto',
                        spaceBetween: SWIPER_DESKTOP_SPACE_BETWEEN,
                        centeredSlides: true,
                    }
                },
                on: {
                    init: function(swiper) {
                        console.log('Swiper Initialized');
                        updateProductInfo(swiper);
                        productTitleElement.classList.remove('title-fading');
                        assetStoreButton.classList.remove('button-fading');
                        swiper.navigation.update();
                        setTimeout(() => {
                            console.log('Running update and loopFix after init timeout');
                            swiper.update();
                            if (swiper.params.loop) { swiper.loopFix(); }
                            swiper.navigation.update();
                        }, 0);
                    },
                    slideChangeTransitionStart: function(swiper) {
                        if (assetStoreButton && !assetStoreButton.classList.contains('disabled')) {
                            assetStoreButton.classList.add('button-fading');
                        }
                        if (productTitleElement) { productTitleElement.classList.add('title-fading'); }
                    },
                    slideChangeTransitionEnd: function(swiper) {
                        updateProductInfo(swiper); // Update text *before* fade-in
                        if (assetStoreButton) { assetStoreButton.classList.remove('button-fading'); }
                        if (productTitleElement) { productTitleElement.classList.remove('title-fading'); }
                        swiper.navigation.update();
                    },
                    resize: function(swiper){
                        updateLayout();
                        swiper.update();
                    }
                }
            });
            console.log('Swiper instance created successfully.');
        } catch (e) {
            console.error("Error Initializing Swiper:", e);
            alert("Error initializing the image carousel.");
        }
    }

    window.addEventListener('load', () => {
        setTimeout(() => {
            updateLayout();
            initializeSwiper();
            console.log('Initial Load sequence complete.');
        }, 100);
    });

    window.addEventListener('resize', debounce(updateLayout, 150));

    document.addEventListener('DOMContentLoaded', () => {
        const emailUser = 'arcabidi'; const emailDomain = 'gmail.com';
        const emailLink = document.getElementById('email-link');
        if (emailLink) {
            if (emailLink.textContent !== `${emailUser}@${emailDomain}`) {
                 const fullEmail = `${emailUser}@${emailDomain}`; emailLink.href = `mailto:${fullEmail}`; emailLink.textContent = fullEmail;
            }
        } else { console.error("ID 'email-link' not found"); }

        const yearSpan = document.getElementById('year');
        if (yearSpan) {
            const currentYear = new Date().getFullYear();
             if (yearSpan.textContent !== currentYear.toString()) yearSpan.textContent = currentYear;
             console.log(`Context time: ${new Date().toISOString()}`);
             console.log(`Location: Virginia Beach, Virginia, United States`);
        } else { console.error("ID 'year' not found"); }
        console.log('Non-Swiper initializations complete.');
    });

    console.log('End script execution (initial)');

});