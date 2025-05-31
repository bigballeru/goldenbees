/**
 * Golden Bees - Caribbean Restaurant Website
 * Main JavaScript File
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initMobileMenu();
    initStickyHeader();
    initBackToTop();
    initReviewsCarousel();
    initGalleryLightbox();
    initNavigation();
});

/**
 * Mobile Menu Toggle
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }
}

/**
 * Sticky Header on Scroll
 */
function initStickyHeader() {
    const header = document.getElementById('header');
    const heroSection = document.getElementById('hero');
    
    if (header && heroSection) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

/**
 * Back to Top Button
 */
function initBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

/**
 * Reviews Carousel
 */
function initReviewsCarousel() {
    const reviewsTrack = document.getElementById('reviewsTrack');
    const prevBtn = document.querySelector('.prev-button');
    const nextBtn = document.querySelector('.next-button');
    const indicatorsContainer = document.querySelector('.carousel-indicators');
    const reviewsContainer = document.querySelector('.reviews-container');
    const reviewsCarouselEl = reviewsContainer ? reviewsContainer.querySelector('.reviews-carousel') : null;

    if (!reviewsTrack || !prevBtn || !nextBtn || !indicatorsContainer || !reviewsCarouselEl) return;
    
    let currentIndex = 0;
    let reviewsData = [];
    let totalPages = 0;
    let reviewsPerPage = 3; // Default for desktop
    
    // Make reviewsPerPage responsive
    function getReviewsPerPage() {
        const viewportWidth = window.innerWidth;
        if (viewportWidth <= 768) {
            return 1; // Mobile: 1 review per page
        } else if (viewportWidth <= 992) {
            return 2; // Tablet: 2 reviews per page
        } else {
            return 3; // Desktop: 3 reviews per page
        }
    }
    
    // Function to automatically expand reviews on mobile
    function autoExpandReviewsOnMobile() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            const reviewTexts = document.querySelectorAll('.review-text');
            reviewTexts.forEach(text => {
                text.classList.add('expanded');
            });
        }
    }
    
    // Update reviewsPerPage based on screen size
    reviewsPerPage = getReviewsPerPage();
    
    // Handle window resize to update carousel
    window.addEventListener('resize', function() {
        const newReviewsPerPage = getReviewsPerPage();
        if (newReviewsPerPage !== reviewsPerPage) {
            reviewsPerPage = newReviewsPerPage;
            currentIndex = 0; // Reset to first page on layout change
            renderReviews(); // This will re-render cards and indicators
            setupCarousel(); // This will re-attach button listeners if needed
            goToPage(currentIndex); // Explicitly go to the first page
        }
    });
    
    // Fetch reviews data from JSON file
    fetch('assets/data/reviews.json')
        .then(response => response.json())
        .then(data => {
            reviewsData = data.reviews;
            renderReviews();
            setupCarousel();
        })
        .catch(error => {
            console.error('Error loading reviews:', error);
            // Fallback - show error message
            reviewsTrack.innerHTML = `<div class="review-card"><p>Unable to load reviews. Please try again later.</p></div>`;
        });
    
    // Render all reviews in the track
    function renderReviews() {
        if (!reviewsData.length) return;
        
        let reviewsHTML = '';
        
        reviewsData.forEach(review => {
            // Generate stars based on rating
            const stars = generateStars(review.rating);
            
            reviewsHTML += `
            <div class="review-card">
                <div class="review-header">
                    <img src="${review.profileImage}" alt="${review.author}" class="review-profile-img">
                    <div class="review-author-info">
                        <div class="review-author">${review.author}</div>
                    </div>
                </div>
                <div class="review-stars">${stars}</div>
                <div class="review-text">${review.text}</div>
                <div class="review-footer">
                    <div class="google-attribution">
                        <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" 
                             alt="Google" class="google-icon">
                        Review
                    </div>
                </div>
            </div>
            `;
        });
        
        reviewsTrack.innerHTML = reviewsHTML;
        
        // Set the width of each card based on how many we're showing
        const reviewCards = document.querySelectorAll('.review-card');
        const allReviewTexts = document.querySelectorAll('.review-text');
        let areReviewsExpanded = false;
        
        const viewportWidth = reviewsCarouselEl.offsetWidth; // Used for multi-card view if needed

        if (reviewsPerPage === 1) {
            // Mobile: 1 review per page, use percentage widths for track and cards
            if (reviewsData.length > 0) {
                 reviewsTrack.style.width = `${reviewsData.length * 100}%`; // Track is N00% of viewport width
            } else {
                reviewsTrack.style.width = '100%'; // Default if no reviews
            }
           
            reviewCards.forEach(card => {
                if (reviewsData.length > 0) {
                    // Each card is 1/Nth of TRACK's total width, effectively 100% of viewport.
                    card.style.width = `${100 / reviewsData.length}%`; 
                } else {
                     card.style.width = '100%'; // Default if no reviews
                }
                card.style.margin = '0';
                card.style.boxSizing = 'border-box';
                card.style.flexShrink = '0';
                card.style.flexBasis = 'auto'; // Ensure CSS flex-basis doesn't interfere

                const reviewText = card.querySelector('.review-text');
                if (reviewText) {
                    reviewText.addEventListener('click', function(e) {
                        areReviewsExpanded = !areReviewsExpanded;
                        allReviewTexts.forEach(text => {
                            text.classList.toggle('expanded', areReviewsExpanded);
                        });
                        e.stopPropagation();
                    });
                }
            });
        } else {
            // Desktop/Tablet: multiple reviews per page, use pixel-based widths
            reviewsTrack.style.width = 'auto'; // Let flex items determine track width
            const multiCardHorizontalMargin = 10; 
            
            reviewCards.forEach(card => {
                const cardContentWidth = (viewportWidth / reviewsPerPage) - (2 * multiCardHorizontalMargin);
                card.style.width = `${cardContentWidth}px`;
                card.style.margin = `0 ${multiCardHorizontalMargin}px`;
                card.style.boxSizing = 'border-box';
                card.style.flexShrink = '0';
                card.style.flexBasis = `${cardContentWidth}px`; // Explicit flex-basis for pixel width

                const reviewText = card.querySelector('.review-text');
                if (reviewText) {
                    reviewText.addEventListener('click', function(e) {
                        areReviewsExpanded = !areReviewsExpanded;
                        allReviewTexts.forEach(text => {
                            text.classList.toggle('expanded', areReviewsExpanded);
                        });
                        e.stopPropagation();
                    });
                }
            });
        }
        
        // Calculate total pages
        totalPages = Math.ceil(reviewsData.length / reviewsPerPage);
        
        // Auto-expand reviews on mobile
        autoExpandReviewsOnMobile();
        
        // Create page indicators
        indicatorsContainer.innerHTML = ''; // Clear existing indicators
        for (let i = 0; i < totalPages; i++) {
            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            if (i === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => goToPage(i));
            indicatorsContainer.appendChild(indicator);
        }
    }
    
    // Generate star rating HTML
    function generateStars(rating) {
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                starsHTML += '<i class="fas fa-star"></i>';
            } else if (i - 0.5 <= rating) {
                starsHTML += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHTML += '<i class="far fa-star"></i>';
            }
        }
        return starsHTML;
    }
    
    // Setup carousel navigation
    function setupCarousel() {
        updateCarouselState();
        
        // Event listeners for buttons
        prevBtn.addEventListener('click', () => {
            // Cycle to the last page if at the beginning
            if (currentIndex === 0) {
                currentIndex = totalPages - 1;
            } else {
                currentIndex--;
            }
            goToPage(currentIndex);
        });
        
        nextBtn.addEventListener('click', () => {
            // Cycle to the first page if at the end
            if (currentIndex === totalPages - 1) {
                currentIndex = 0;
            } else {
                currentIndex++;
            }
            goToPage(currentIndex);
        });
        
        // Touch swipe functionality
        let touchStartX = 0;
        let touchEndX = 0;
        
        reviewsContainer.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        reviewsContainer.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                // Swipe left - go to next
                if (currentIndex === totalPages - 1) {
                    currentIndex = 0;
                } else {
                    currentIndex++;
                }
                goToPage(currentIndex);
            }
            if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe right - go to previous
                if (currentIndex === 0) {
                    currentIndex = totalPages - 1;
                } else {
                    currentIndex--;
                }
                goToPage(currentIndex);
            }
        }
    }
    
    // Go to specific page
    function goToPage(pageIndex) {
        currentIndex = pageIndex;

        if (reviewsPerPage === 1) {
            // Mobile: Slide by a percentage of the track's width.
            // Each card is (100 / reviewsData.length)% of the track's width.
            if (reviewsData.length > 0) {
                const translatePercentage = -pageIndex * (100 / reviewsData.length);
                reviewsTrack.style.transform = `translateX(${translatePercentage}%)`;
            } else {
                // Should not happen if UI prevents navigation with no reviews, but safe default.
                reviewsTrack.style.transform = 'translateX(0%)';
            }
        } else {
            // Desktop/Tablet: Slide by pixels for multi-item view
            const slideDistance = reviewsCarouselEl.offsetWidth;
            const translateValue = -pageIndex * slideDistance;

            if (slideDistance > 0) {
                reviewsTrack.style.transform = `translateX(${translateValue}px)`;
            } else {
                console.warn('Reviews carousel viewport width is 0, cannot slide (multi-item view).');
            }
        }

        updateCarouselState();
        updateIndicators();
    }
    
    // Update carousel state (buttons are never disabled in cycling mode)
    function updateCarouselState() {
        // Remove all disabled states since we're cycling
        prevBtn.disabled = false;
        nextBtn.disabled = false;
        prevBtn.classList.remove('disabled');
        nextBtn.classList.remove('disabled');
    }
    
    // Update the active indicator
    function updateIndicators() {
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            if (index === currentIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
}

/**
 * Gallery Carousel and Lightbox
 */
function initGalleryLightbox() {
    // Carousel elements
    const galleryTrack = document.getElementById('galleryTrack');
    const prevBtn = document.querySelector('.gallery-prev');
    const nextBtn = document.querySelector('.gallery-next');
    const indicatorsContainer = document.querySelector('.gallery-indicators');
    
    // Lightbox elements
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const lightboxCloseBtn = lightbox.querySelector('.lightbox-close');
    const lightboxPrevBtn = lightbox.querySelector('.lightbox-prev');
    const lightboxNextBtn = lightbox.querySelector('.lightbox-next');
    
    if (!galleryTrack || !lightbox) return;
    
    // Variables for both carousel and lightbox
    let galleryImages = document.querySelectorAll('.gallery-item img');
    let currentIndex = 0;
    let totalPages = 0;
    const imagesPerPage = 3; // Show 3 images at a time
    
    // Setup the carousel indicators and initial state
    function setupCarousel() {
        // Calculate total pages
        totalPages = Math.ceil(galleryImages.length / imagesPerPage);
        
        // Create indicators
        for (let i = 0; i < totalPages; i++) {
            const indicator = document.createElement('div');
            indicator.classList.add('gallery-indicator');
            if (i === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => goToPage(i));
            indicatorsContainer.appendChild(indicator);
        }
        
        // Set initial state
        updateCarouselState();
        
        // Event listeners for navigation buttons
        prevBtn.addEventListener('click', () => {
            // Cycle to the last page if at the beginning
            if (currentIndex === 0) {
                currentIndex = totalPages - 1;
            } else {
                currentIndex--;
            }
            goToPage(currentIndex);
        });
        
        nextBtn.addEventListener('click', () => {
            // Cycle to the first page if at the end
            if (currentIndex === totalPages - 1) {
                currentIndex = 0;
            } else {
                currentIndex++;
            }
            goToPage(currentIndex);
        });
        
        // Touch swipe for carousel
        const galleryContainer = document.querySelector('.gallery-container');
        let touchStartX = 0;
        let touchEndX = 0;
        
        galleryContainer.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        galleryContainer.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleCarouselSwipe();
        }, { passive: true });
        
        function handleCarouselSwipe() {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                // Swipe left - go to next
                if (currentIndex === totalPages - 1) {
                    currentIndex = 0;
                } else {
                    currentIndex++;
                }
                goToPage(currentIndex);
            }
            if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe right - go to previous
                if (currentIndex === 0) {
                    currentIndex = totalPages - 1;
                } else {
                    currentIndex--;
                }
                goToPage(currentIndex);
            }
        }
    }
    
    // Navigate carousel to specific page
    function goToPage(pageIndex) {
        currentIndex = pageIndex;
        const translateValue = -pageIndex * 100;
        galleryTrack.style.transform = `translateX(${translateValue}%)`;
        updateCarouselState();
        updateIndicators();
    }
    
    // Update carousel state
    function updateCarouselState() {
        // Never disabled since we're cycling
        prevBtn.disabled = false;
        nextBtn.disabled = false;
        prevBtn.classList.remove('disabled');
        nextBtn.classList.remove('disabled');
    }
    
    // Update the indicators
    function updateIndicators() {
        const indicators = document.querySelectorAll('.gallery-indicator');
        indicators.forEach((indicator, index) => {
            if (index === currentIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
    
    // Lightbox functionality
    // Add click event to gallery images
    galleryImages.forEach((img, index) => {
        img.addEventListener('click', () => {
            openLightbox(index);
        });
    });
    
    // Open lightbox with specific image
    function openLightbox(index) {
        if (!galleryImages || galleryImages.length === 0) return;
        
        currentIndex = index;
        const img = galleryImages[index];
        
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt;
        
        const caption = img.dataset.caption || '';
        lightboxCaption.textContent = caption;
        
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Navigate to previous image in lightbox
    function prevImage() {
        if (!galleryImages || galleryImages.length === 0) return;
        currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        openLightbox(currentIndex);
    }
    
    // Navigate to next image in lightbox
    function nextImage() {
        if (!galleryImages || galleryImages.length === 0) return;
        currentIndex = (currentIndex + 1) % galleryImages.length;
        openLightbox(currentIndex);
    }
    
    // Lightbox event listeners
    lightboxCloseBtn.addEventListener('click', closeLightbox);
    lightboxPrevBtn.addEventListener('click', prevImage);
    lightboxNextBtn.addEventListener('click', nextImage);
    
    // Close lightbox on background click
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Touch swipe for lightbox
    let lightboxTouchStartX = 0;
    let lightboxTouchEndX = 0;
    
    lightbox.addEventListener('touchstart', e => {
        lightboxTouchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    lightbox.addEventListener('touchend', e => {
        lightboxTouchEndX = e.changedTouches[0].screenX;
        handleLightboxSwipe();
    }, { passive: true });
    
    function handleLightboxSwipe() {
        const swipeThreshold = 50;
        if (lightboxTouchEndX < lightboxTouchStartX - swipeThreshold) {
            // Swipe left - go to next
            nextImage();
        }
        if (lightboxTouchEndX > lightboxTouchStartX + swipeThreshold) {
            // Swipe right - go to previous
            prevImage();
        }
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            prevImage();
        } else if (e.key === 'ArrowRight') {
            nextImage();
        }
    });
    
    // Initialize the carousel
    setupCarousel();
}

/**
 * Form Validation
 */
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // In a real implementation, you would send the form data to a server
            // For now, we'll just show an alert
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // In a real implementation, you would send the form data to a server
            // For now, we'll just show an alert
            alert('Thank you for subscribing to our newsletter!');
            newsletterForm.reset();
        });
    }
});

/**
 * Navigation with Smooth Scrolling and Scroll Spy
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    const header = document.getElementById('header');
    
    // Collect all sections for scroll spy
    const sections = [];
    navLinks.forEach(link => {
        // Skip the home link that points just to #
        if (link.getAttribute('href') !== '#') {
            const sectionId = link.getAttribute('href');
            const section = document.querySelector(sectionId);
            if (section) {
                sections.push(section);
            }
        }
    });
    
    // Smooth scrolling with offset for header height
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only process if it's a non-empty hash link
            if (this.getAttribute('href') !== '#') {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Get header height to use as offset
                    const headerHeight = header.offsetHeight;
                    
                    // Add extra padding for better spacing
                    const extraPadding = -1;
                    
                    // Calculate position to scroll to
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - extraPadding;
                    
                    // Smooth scroll to target
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Scroll spy functionality to highlight the current section
    function highlightNavOnScroll() {
        // Get the scroll position with a small offset for better UX
        const scrollPosition = window.scrollY + header.offsetHeight + 20;
        
        // Find the current section
        let currentSection = null;
        
        // Check if we're at the top of the page
        if (scrollPosition < 200) {
            // We're at the top, highlight Home
            currentSection = null;
        } else {
            // Otherwise, determine which section we're in
            for (const section of sections) {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    currentSection = section.getAttribute('id');
                    break;
                }
            }
        }
        
        // Remove active class from all links
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Add active class to current section link or home if at top
        if (currentSection) {
            const activeLink = document.querySelector(`a[href="#${currentSection}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        } else {
            // If at the top or no section is active, highlight home
            const homeLink = document.querySelector('a[href="#"]');
            if (homeLink) {
                homeLink.classList.add('active');
            }
        }
    }
    
    // Initialize on page load
    highlightNavOnScroll();
    
    // Update on scroll
    window.addEventListener('scroll', highlightNavOnScroll);
}

/**
 * Google Maps Integration
 * Note: In a real implementation, you would replace 'YOUR_API_KEY' with an actual Google Maps API key
 */
function initMap() {
    // This function will be called by the Google Maps API once it's loaded
    // For now, we'll just add a placeholder
    const mapElement = document.getElementById('map');
    
    if (mapElement) {
        // In a real implementation, this would be replaced with actual Google Maps initialization
        mapElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#e0e0e0;color:#2c3e50;text-align:center;padding:1rem;">Google Map will be displayed here</div>';
    }
}

// This would be replaced with an actual Google Maps API script in production
// window.addEventListener('load', initMap);
