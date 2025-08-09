// Global variables
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-link");

// Section navigation variables
let currentSectionIndex = 0;
let isScrolling = false;
let scrollAccumulator = 0;
let lastScrollTime = 0;
let lastTouchTime = 0;
let scrollTimeout = null;

// Portfolio slider variables
let currentSlide = 0;
const totalSlides = 3;
const slider = document.getElementById("portfolio-slider");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const portfolioDots = document.querySelectorAll(".portfolio-dot");
let autoPlay = null;

// ========================================
// MOBILE MENU FUNCTIONALITY
// ========================================
function initializeMobileMenu() {
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden");
        });

        // Close mobile menu when clicking on a link
        const mobileLinks = mobileMenu.querySelectorAll("a");
        mobileLinks.forEach((link) => {
            link.addEventListener("click", () => {
                mobileMenu.classList.add("hidden");
            });
        });
    }
}

// ========================================
// SECTION NAVIGATION FUNCTIONALITY
// ========================================
function scrollToSection(index) {
    if (index >= 0 && index < sections.length && !isScrolling) {
        isScrolling = true;
        currentSectionIndex = index;

        sections[index].scrollIntoView({ behavior: "smooth", block: "start" });

        updateActiveNav();
        updateURL();

        setTimeout(() => {
            isScrolling = false;
        }, 500);
    }
}

function updateActiveNav() {
    if (navLinks.length === 0) return;

    const currentSection = sections[currentSectionIndex];
    if (!currentSection) return;

    const currentId = currentSection.getAttribute("id");

    navLinks.forEach((link) => {
        link.classList.remove("text-amber-600");
        link.classList.add("text-gray-700");

        if (link.getAttribute("href") === `#${currentId}`) {
            link.classList.remove("text-gray-700");
            link.classList.add("text-amber-600");
        }
    });
}

function updateURL() {
    const currentSection = sections[currentSectionIndex];
    if (currentSection) {
        const sectionId = currentSection.getAttribute("id");
        if (sectionId && window.location.hash !== `#${sectionId}`) {
            history.replaceState(null, null, `#${sectionId}`);
        }
    }
}

function initializeSectionNavigation() {
    // Wheel event handling
    window.addEventListener(
        "wheel",
        (e) => {
            if (isScrolling) return;

            e.preventDefault();

            const now = Date.now();
            const timeDiff = now - lastScrollTime;
            const absY = Math.abs(e.deltaY);

            const isTouchpad =
                absY < 50 || (absY < 120 && timeDiff < 80) || e.deltaMode === 0;

            if (isTouchpad) {
                scrollAccumulator += e.deltaY;

                if (scrollTimeout) {
                    clearTimeout(scrollTimeout);
                }

                scrollTimeout = setTimeout(() => {
                    scrollAccumulator = 0;
                }, 120);

                const threshold = 250;

                if (Math.abs(scrollAccumulator) >= threshold) {
                    if (
                        scrollAccumulator > 0 &&
                        currentSectionIndex < sections.length - 1
                    ) {
                        scrollToSection(currentSectionIndex + 1);
                        scrollAccumulator = 0;
                    } else if (
                        scrollAccumulator < 0 &&
                        currentSectionIndex > 0
                    ) {
                        scrollToSection(currentSectionIndex - 1);
                        scrollAccumulator = 0;
                    }
                }
            } else {
                if (timeDiff < 150) return;

                if (e.deltaY > 0 && currentSectionIndex < sections.length - 1) {
                    scrollToSection(currentSectionIndex + 1);
                } else if (e.deltaY < 0 && currentSectionIndex > 0) {
                    scrollToSection(currentSectionIndex - 1);
                }
            }
            lastScrollTime = now;
        },
        { passive: false }
    );

    // Keyboard navigation
    window.addEventListener("keydown", (e) => {
        if (isScrolling) return;

        // Portfolio slider navigation when on portfolio section
        if (currentSectionIndex === 2) {
            // Portfolio is index 2
            switch (e.key) {
                case "ArrowLeft":
                    e.preventDefault();
                    prevSlide();
                    return;
                case "ArrowRight":
                    e.preventDefault();
                    nextSlide();
                    return;
            }
        }

        // Section navigation
        switch (e.key) {
            case "ArrowDown":
            case "PageDown":
            case " ":
                e.preventDefault();
                if (currentSectionIndex < sections.length - 1) {
                    scrollToSection(currentSectionIndex + 1);
                }
                break;

            case "ArrowUp":
            case "PageUp":
                e.preventDefault();
                if (currentSectionIndex > 0) {
                    scrollToSection(currentSectionIndex - 1);
                }
                break;

            case "Home":
                e.preventDefault();
                scrollToSection(0);
                break;

            case "End":
                e.preventDefault();
                scrollToSection(sections.length - 1);
                break;
        }
    });

    // Navigation link clicks
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();

            const targetId = this.getAttribute("href").substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                const targetIndex = Array.from(sections).indexOf(targetSection);
                if (targetIndex !== -1) {
                    scrollToSection(targetIndex);
                }
            }
        });
    });

    // Touch support
    let touchStartY = 0;
    let touchEndY = 0;
    let touchStartTime = 0;

    window.addEventListener(
        "touchstart",
        (e) => {
            touchStartY = e.changedTouches[0].screenY;
            touchStartTime = Date.now();
        },
        { passive: true }
    );

    window.addEventListener(
        "touchend",
        (e) => {
            if (isScrolling) return;

            const now = Date.now();
            const touchDuration = now - touchStartTime;

            if (now - lastTouchTime < 250 || touchDuration > 500) return;

            touchEndY = e.changedTouches[0].screenY;
            const touchDiff = touchStartY - touchEndY;
            const minSwipeDistance = 50;

            if (Math.abs(touchDiff) >= minSwipeDistance) {
                if (
                    touchDiff > 0 &&
                    currentSectionIndex < sections.length - 1
                ) {
                    scrollToSection(currentSectionIndex + 1);
                } else if (touchDiff < 0 && currentSectionIndex > 0) {
                    scrollToSection(currentSectionIndex - 1);
                }
                lastTouchTime = now;
            }
        },
        { passive: true }
    );

    // Browser back/forward buttons
    window.addEventListener("popstate", () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            const targetSection = document.getElementById(hash);
            if (targetSection) {
                const targetIndex = Array.from(sections).indexOf(targetSection);
                if (targetIndex !== -1) {
                    currentSectionIndex = targetIndex;
                    updateActiveNav();
                }
            }
        }
    });

    // Resize events
    let resizeTimeout;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (sections[currentSectionIndex]) {
                sections[currentSectionIndex].scrollIntoView({
                    behavior: "auto",
                    block: "start",
                });
            }
            updateActiveNav();
        }, 100);
    });
}

// ========================================
// PORTFOLIO SLIDER FUNCTIONALITY
// ========================================
function updatePortfolioSlider() {
    if (!slider) return;

    const translateX = -currentSlide * 100;
    slider.style.transform = `translateX(${translateX}%)`;

    portfolioDots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.remove("bg-white/40");
            dot.classList.add("bg-amber-600");
            dot.style.transform = "scale(1.3)";
        } else {
            dot.classList.remove("bg-amber-600");
            dot.classList.add("bg-white/40");
            dot.style.transform = "scale(1)";
        }
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updatePortfolioSlider();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updatePortfolioSlider();
}

function goToSlide(slideIndex) {
    currentSlide = slideIndex;
    updatePortfolioSlider();
}

function initializePortfolioSlider() {
    if (!slider) return;

    // Event listeners for navigation buttons
    if (nextBtn && prevBtn) {
        nextBtn.addEventListener("click", nextSlide);
        prevBtn.addEventListener("click", prevSlide);
    }

    // Dot navigation
    portfolioDots.forEach((dot, index) => {
        dot.addEventListener("click", () => goToSlide(index));
    });

    // Auto-play functionality
    function startAutoPlay() {
        if (autoPlay) return; // Prevent multiple intervals
        autoPlay = setInterval(nextSlide, 4000);
    }

    function stopAutoPlay() {
        if (autoPlay) {
            clearInterval(autoPlay);
            autoPlay = null;
        }
    }

    // Get portfolio section and project elements
    const portfolioSection = document.getElementById("portfolio");
    const projectImages = document.querySelectorAll("#portfolio .group");
    const sliderContainer = slider.parentElement; // Get the slider container

    // Pause auto-play on slider container hover (more reliable)
    if (sliderContainer) {
        sliderContainer.addEventListener("mouseenter", () => {
            stopAutoPlay();
        });
        
        sliderContainer.addEventListener("mouseleave", () => {
            startAutoPlay();
        });
    }

    // Also pause on portfolio section hover as backup
    if (portfolioSection) {
        portfolioSection.addEventListener("mouseenter", () => {
            stopAutoPlay();
        });
        
        portfolioSection.addEventListener("mouseleave", () => {
            startAutoPlay();
        });
    }

    // Pause auto-play when hovering over individual project images
    projectImages.forEach((projectGroup) => {
        projectGroup.addEventListener("mouseenter", () => {
            stopAutoPlay();
        });
        
        projectGroup.addEventListener("mouseleave", () => {
            // Add a small delay before restarting to prevent rapid start/stop
            setTimeout(() => {
                startAutoPlay();
            }, 200);
        });
    });

    // Pause auto-play when hovering over navigation buttons
    if (nextBtn) {
        nextBtn.addEventListener("mouseenter", stopAutoPlay);
        nextBtn.addEventListener("mouseleave", () => {
            setTimeout(startAutoPlay, 200);
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener("mouseenter", stopAutoPlay);
        prevBtn.addEventListener("mouseleave", () => {
            setTimeout(startAutoPlay, 200);
        });
    }

    // Pause auto-play when hovering over dots
    portfolioDots.forEach((dot) => {
        dot.addEventListener("mouseenter", stopAutoPlay);
        dot.addEventListener("mouseleave", () => {
            setTimeout(startAutoPlay, 200);
        });
    });

    // Initialize slider
    updatePortfolioSlider();
    startAutoPlay();
}

// ========================================
// INITIALIZATION
// ========================================
function initialize() {
    // Set initial section based on URL hash
    const hash = window.location.hash.substring(1);
    if (hash) {
        const targetSection = document.getElementById(hash);
        if (targetSection) {
            const targetIndex = Array.from(sections).indexOf(targetSection);
            if (targetIndex !== -1) {
                currentSectionIndex = targetIndex;
            }
        }
    }

    updateActiveNav();
    updateURL();

    // Scroll to current section without animation on load
    if (sections[currentSectionIndex]) {
        sections[currentSectionIndex].scrollIntoView({
            behavior: "auto",
            block: "start",
        });é
    }
}

function initializeApp() {
    // Prevent default scroll behavior
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // Re-enable overflow for main content
    const mainElement = document.querySelector("main");
    if (mainElement) {
        mainElement.style.overflow = "visible";
    }

    // Initialize all functionality
    initializeMobileMenu();
    initializeSectionNavigation();
    initializePortfolioSlider();
    initialize();
}

// Run initialization when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
} else {
    initializeApp();
}
