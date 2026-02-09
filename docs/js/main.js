// Dark mode toggle functionality with system preference detection
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeToggleLight = document.getElementById('theme-toggle-light');
    const themeToggleDark = document.getElementById('theme-toggle-dark');
    const html = document.documentElement;

    // Function to update the toggle button appearance
    function updateToggleButton(isDark) {
        if (isDark) {
            themeToggleLight.classList.remove('hidden');
            themeToggleDark.classList.add('hidden');
        } else {
            themeToggleLight.classList.add('hidden');
            themeToggleDark.classList.remove('hidden');
        }
    }

    // Function to update headshot images
    function updateHeadshot(isDark) {
        const headshotLight = document.getElementById('headshot-light');
        const headshotDark = document.getElementById('headshot-dark');
        
        if (headshotLight && headshotDark) {
            if (isDark) {
                headshotLight.classList.add('hidden');
                headshotDark.classList.remove('hidden');
            } else {
                headshotLight.classList.remove('hidden');
                headshotDark.classList.add('hidden');
            }
        }
    }

    // Function to apply theme using data-theme attribute
    function applyTheme(theme) {
        console.log('Applying theme:', theme); // Debug log
        html.setAttribute('data-theme', theme);
        
        if (theme === 'dark') {
            updateToggleButton(true);
            updateHeadshot(true);
            console.log('Dark mode applied via data-theme attribute'); // Debug log
        } else {
            updateToggleButton(false);
            updateHeadshot(false);
            console.log('Light mode applied via data-theme attribute'); // Debug log
        }
    }

    // Check current system preference
    function getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Initialize theme based on saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    let initialTheme;

    if (savedTheme) {
        // User has manually set a preference before
        initialTheme = savedTheme;
    } else {
        // No saved preference, use system preference
        initialTheme = getSystemTheme();
    }

    applyTheme(initialTheme);

    // Listen for system theme changes (only if user hasn't manually set a preference)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            // Only auto-switch if user hasn't manually set a preference
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // Manual toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme') || getSystemTheme();
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Save the manual preference
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    }
});

// Smooth scrolling for navigation links - center viewport on section center
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                // Calculate the center of the section
                const targetRect = target.getBoundingClientRect();
                const targetCenter = targetRect.top + window.pageYOffset + (targetRect.height / 2);
                
                // Calculate scroll position to center the section in viewport
                const viewportHeight = window.innerHeight;
                const scrollToPosition = targetCenter - (viewportHeight / 2);
                
                // Smooth scroll to the calculated position
                window.scrollTo({
                    top: Math.max(0, scrollToPosition), // Ensure we don't scroll above page top
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Active section highlighting with parallax effect
// Store the current dominant section to add persistence
let currentDominantSection = '';

function updateActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const scrollY = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const screenCenter = scrollY + (windowHeight / 2);
    const documentHeight = document.documentElement.scrollHeight;
    
    // Find the active section and calculate focus for each
    let activeSection = '';
    const sectionData = [];
    let totalSectionHeight = 0;
    
    sections.forEach((section, sectionIndex) => {
        const sectionTop = section.offsetTop;
        const sectionBottom = section.offsetTop + section.clientHeight;
        const sectionHeight = section.clientHeight;
        const sectionCenter = sectionTop + (sectionHeight / 2);
        const sectionId = section.getAttribute('id');
        
        totalSectionHeight += sectionHeight;
        
        let focusStrength = 0;
        
        // Special handling for first section (About) - max focus at top of page
        if (sectionIndex === 0) {
            if (scrollY <= sectionTop + sectionHeight * 0.3) {
                focusStrength = 1.0; // Maximum focus when at top
                activeSection = sectionId;
            } else {
                // Calculate distance from screen center to section center
                const distanceToCenter = Math.abs(screenCenter - sectionCenter);
                const maxDistance = sectionHeight * 0.8;
                focusStrength = Math.max(0, 1 - (distanceToCenter / maxDistance));
            }
        }
        // Special handling for last section (Resume) - max focus at bottom of page
        else if (sectionIndex === sections.length - 1) {
            const scrollBottom = scrollY + windowHeight;
            if (scrollBottom >= documentHeight - 50) {
                focusStrength = 1.0; // Maximum focus when at bottom
                activeSection = sectionId;
            } else {
                // Calculate distance from screen center to section center
                const distanceToCenter = Math.abs(screenCenter - sectionCenter);
                const maxDistance = sectionHeight * 0.8;
                focusStrength = Math.max(0, 1 - (distanceToCenter / maxDistance));
            }
        }
        // Normal sections - max focus when screen center aligns with section center
        else {
            const distanceToCenter = Math.abs(screenCenter - sectionCenter);
            const maxDistance = sectionHeight * 0.8;
            focusStrength = Math.max(0, 1 - (distanceToCenter / maxDistance));
        }
        
        // Determine active section based on highest focus
        if (focusStrength > 0.5 && !activeSection) {
            activeSection = sectionId;
        }
        
        sectionData.push({
            id: sectionId,
            height: sectionHeight,
            center: sectionCenter,
            focusStrength: focusStrength,
            proportion: 0 // Will calculate after
        });
    });
    
    // Calculate section proportions
    sectionData.forEach(data => {
        data.proportion = data.height / totalSectionHeight;
    });
    
    // Update persistent active section
    if (activeSection) {
        currentDominantSection = activeSection;
    }
    
    // Apply effects to navigation links
    navLinks.forEach((link, index) => {
        const linkId = link.getAttribute('href').substring(1);
        const sectionInfo = sectionData.find(s => s.id === linkId);
        
        // Skip if section doesn't exist (safety check)
        if (!sectionInfo) return;
        
        const focusStrength = sectionInfo.focusStrength;
        
        // Scale based on focus strength (0.75 to 1.3)
        const minScale = 0.75;
        const maxScale = 1.3;
        const scale = minScale + (focusStrength * (maxScale - minScale));
        
        // Opacity based on focus strength (0.4 to 1.0)
        const minOpacity = 0.4;
        const maxOpacity = 1.0;
        const opacity = minOpacity + (focusStrength * (maxOpacity - minOpacity));
        
        // Horizontal movement based on focus (0 to 25px)
        const maxMovement = 25;
        const movement = focusStrength * maxMovement;
        
        // Spacing based on section size and inverse focus
        const baseSpacing = 18;
        const sectionSpacingFactor = sectionInfo.proportion * 3;
        
        // Less focus = more spacing (items spread out when not focused)
        const spacingMultiplier = 1 + ((1 - focusStrength) * 2);
        const sectionSpacing = sectionSpacingFactor * 20 * spacingMultiplier;
        const totalSpacing = baseSpacing + sectionSpacing;
        
        // Apply spacing (except for first navigation item)
        if (index > 0) {
            link.parentElement.style.marginTop = `${totalSpacing}px`;
        } else {
            // Reset first item spacing
            link.parentElement.style.marginTop = '0px';
        }
        
        // Reset colors
        link.classList.remove('text-sky-600', 'text-blue-500', 'dark:text-sky-400', 'dark:text-blue-500');
        link.classList.add('text-stone-900', 'dark:text-stone-400');
        
        // Apply transforms and opacity with optimized transitions
        link.style.transform = `scale(${scale}) translateX(${movement}px) translateZ(0)`;
        link.style.opacity = opacity;
        link.style.fontWeight = '500';
        link.style.transition = 'all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)'; // Faster, smoother transitions
        
        // Active section gets blue color and bold weight
        if (linkId === currentDominantSection) {
            link.classList.remove('text-stone-900', 'dark:text-stone-400');
            link.classList.add('text-sky-600', 'text-blue-500'); // Use blue-500 for both modes, CSS will override
            link.style.fontWeight = '700';
        }
    });
}

// Enhanced easing function for better visual appeal
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Easing function for smoother animations
function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
}

// Optimized scroll handling with single RAF loop for all updates
let scrollRafId = null;
let isScrollUpdating = false;
let lastScrollTime = 0;

function optimizedScrollUpdate() {
    if (isScrollUpdating) return;
    
    isScrollUpdating = true;
    
    scrollRafId = requestAnimationFrame((currentTime) => {
        // Throttle to ~60fps max, but allow immediate updates for smoothness
        if (currentTime - lastScrollTime >= 8) { // ~120fps max for ultra-smooth feel
            updateActiveSection();
            updateSkillsCards();
            updateCenterCard(); // This handles experience cards
            lastScrollTime = currentTime;
        }
        
        isScrollUpdating = false;
    });
}

// Single scroll listener for all scroll-based animations
window.addEventListener('scroll', optimizedScrollUpdate, { 
    passive: true,
    capture: false
});

// Optimized resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        updateActiveSection();
        updateSkillsCards();
        updateCenterCard();
    }, 150);
}, { passive: true });

// Initialize cards with muted styling by default  
function initializeMutedCards() {
    // Initialize experience cards
    const experienceCards = document.querySelectorAll('.experience-card');
    experienceCards.forEach(card => {
        // Set muted styling by default
        card.classList.add('opacity-60');
        
        // Apply muted colors by default
        const title = card.querySelector('h3');
        const company = card.querySelector('p');
        const companyIcon = card.querySelector('p svg');
        const bullets = card.querySelectorAll('li span:first-child');
        const techSpans = card.querySelectorAll('span.font-semibold');
        
        if (title) {
            title.classList.remove('text-gray-950', 'dark:text-white');
            title.classList.add('text-gray-600', 'dark:text-gray-400');
        }
        if (company) {
            company.classList.remove('text-blue-600', 'dark:text-blue-400');
            company.classList.add('text-gray-500', 'dark:text-gray-500');
        }
        if (companyIcon) {
            companyIcon.classList.remove('text-blue-500');
            companyIcon.classList.add('text-gray-400');
        }
        bullets.forEach(bullet => {
            bullet.classList.remove('text-blue-500');
            bullet.classList.add('text-gray-400');
        });
        techSpans.forEach(span => {
            if (span.classList.contains('text-blue-600') || span.classList.contains('dark:text-blue-400')) {
                span.classList.remove('text-blue-600', 'dark:text-blue-400');
                span.classList.add('text-gray-500', 'dark:text-gray-500');
            }
            if (span.classList.contains('text-gray-950') || span.classList.contains('dark:text-white')) {
                span.classList.remove('text-gray-950', 'dark:text-white');
                span.classList.add('text-gray-600', 'dark:text-gray-400');
            }
        });
    });

    // Initialize skill cards
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach(card => {
        // Set muted styling by default
        card.classList.add('opacity-60');
        
        // Apply muted colors by default
        const title = card.querySelector('h3');
        const icon = card.querySelector('svg');
        const skillTags = card.querySelectorAll('span');
        
        if (title) {
            title.classList.remove('text-gray-950', 'dark:text-white');
            title.classList.add('text-gray-600', 'dark:text-gray-400');
        }
        if (icon) {
            icon.classList.remove('text-blue-500');
            icon.classList.add('text-gray-400');
        }
        skillTags.forEach(tag => {
            tag.classList.remove('bg-blue-500');
            tag.classList.add('bg-gray-400');
        });
    });
}

// Skills cards center detection functionality
function updateSkillsCards() {
    const cards = document.querySelectorAll('.skill-card');
    const skillsSection = document.getElementById('skills');
    
    if (cards.length === 0 || !skillsSection) return;
    
    const viewportHeight = window.innerHeight;
    const viewportCenter = window.scrollY + (viewportHeight / 2);
    
    // Check if we're in the skills section
    const sectionRect = skillsSection.getBoundingClientRect();
    const sectionTop = window.scrollY + sectionRect.top;
    const sectionBottom = sectionTop + sectionRect.height;
    
    // Add minimal padding to the section bounds for smoother transitions
    const sectionPadding = viewportHeight * 0.05; // 5% of viewport height
    const isInSkillsSection = viewportCenter >= (sectionTop - sectionPadding) && 
                             viewportCenter <= (sectionBottom + sectionPadding);
    
    // If not in skills section, return all cards to muted default state
    if (!isInSkillsSection) {
        cards.forEach(card => {
            card.classList.remove('shadow-2xl', 'shadow-3xl', '-translate-y-2', 'ring-2', 'ring-blue-500', 'ring-opacity-50', 'scale-105');
            card.classList.add('shadow-lg', 'opacity-60');
            card.style.transform = 'translateY(0) scale(1)';
            
            // Return to muted default colors when outside section
            const title = card.querySelector('h3');
            const icon = card.querySelector('svg');
            const skillTags = card.querySelectorAll('span');
            
            if (title) {
                title.classList.remove('text-gray-950', 'dark:text-white');
                title.classList.add('text-gray-600', 'dark:text-gray-400');
            }
            if (icon) {
                icon.classList.remove('text-blue-500');
                icon.classList.add('text-gray-400');
            }
            skillTags.forEach(tag => {
                tag.classList.remove('bg-blue-500');
                tag.classList.add('bg-gray-400');
            });
        });
        return;
    }
    
    let closestCard = null;
    let minDistance = Infinity;
    
    // Find the card closest to the viewport center
    cards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const cardTop = window.scrollY + cardRect.top;
        const cardCenter = cardTop + (cardRect.height / 2);
        const distance = Math.abs(viewportCenter - cardCenter);
        
        if (distance < minDistance) {
            minDistance = distance;
            closestCard = card;
        }
    });
    
    // Reset all cards to muted state first
    cards.forEach(card => {
        card.classList.remove('shadow-2xl', 'shadow-3xl', '-translate-y-2', 'ring-2', 'ring-blue-500', 'ring-opacity-50', 'scale-105');
        card.classList.add('shadow-lg', 'opacity-60');
        card.style.transform = 'translateY(0) scale(1)';
        
        // Apply muted colors to all cards
        const title = card.querySelector('h3');
        const icon = card.querySelector('svg');
        const skillTags = card.querySelectorAll('span');
        
        if (title) {
            title.classList.remove('text-gray-950', 'dark:text-white');
            title.classList.add('text-gray-600', 'dark:text-gray-400');
        }
        if (icon) {
            icon.classList.remove('text-blue-500');
            icon.classList.add('text-gray-400');
        }
        skillTags.forEach(tag => {
            tag.classList.remove('bg-blue-500');
            tag.classList.add('bg-gray-400');
        });
    });
    
    // Apply enhanced effects to the closest card only
    if (closestCard) {
        closestCard.classList.remove('shadow-lg', 'opacity-60');
        closestCard.classList.add('shadow-2xl', '-translate-y-2', 'ring-2', 'ring-blue-500', 'ring-opacity-50', 'scale-105', 'opacity-100');
        closestCard.style.transform = 'translateY(-8px) scale(1.02)';
        
        // Restore vibrant colors for selected card only
        const title = closestCard.querySelector('h3');
        const icon = closestCard.querySelector('svg');
        const skillTags = closestCard.querySelectorAll('span');
        
        if (title) {
            title.classList.remove('text-gray-600', 'dark:text-gray-400');
            title.classList.add('text-gray-950', 'dark:text-white');
        }
        if (icon) {
            icon.classList.remove('text-gray-400');
            icon.classList.add('text-blue-500');
        }
        skillTags.forEach(tag => {
            tag.classList.remove('bg-gray-400');
            tag.classList.add('bg-blue-500');
        });
    }
}

// Experience cards center detection functionality
function updateCenterCard() {
    const cards = document.querySelectorAll('.experience-card');
    const experienceSection = document.getElementById('experience');
    
    if (cards.length === 0 || !experienceSection) return;
    
    const viewportHeight = window.innerHeight;
    const viewportCenter = window.scrollY + (viewportHeight / 2);
    
    // Check if we're in the experience section
    const sectionRect = experienceSection.getBoundingClientRect();
    const sectionTop = window.scrollY + sectionRect.top;
    const sectionBottom = sectionTop + sectionRect.height;
    
    // Add minimal padding to the section bounds for smoother transitions
    const sectionPadding = viewportHeight * 0.05; // 5% of viewport height (reduced from 20%)
    const isInExperienceSection = viewportCenter >= (sectionTop - sectionPadding) && 
                                 viewportCenter <= (sectionBottom + sectionPadding);
    
    // If not in experience section, return all cards to muted default state
    if (!isInExperienceSection) {
        cards.forEach(card => {
            card.classList.remove('shadow-2xl', 'shadow-3xl', '-translate-y-2', 'ring-2', 'ring-blue-500', 'ring-opacity-50', 'scale-105');
            card.classList.add('shadow-lg', 'opacity-60');
            card.style.transform = 'translateY(0) scale(1)';
            
            // Return to muted default colors when outside section
            const title = card.querySelector('h3');
            const company = card.querySelector('p');
            const companyIcon = card.querySelector('p svg');
            const bullets = card.querySelectorAll('li span:first-child');
            const techSpans = card.querySelectorAll('span.font-semibold');
            
            if (title) {
                title.classList.remove('text-gray-950', 'dark:text-white');
                title.classList.add('text-gray-600', 'dark:text-gray-400');
            }
            if (company) {
                company.classList.remove('text-blue-600', 'dark:text-blue-400');
                company.classList.add('text-gray-500', 'dark:text-gray-500');
            }
            if (companyIcon) {
                companyIcon.classList.remove('text-blue-500');
                companyIcon.classList.add('text-gray-400');
            }
            bullets.forEach(bullet => {
                bullet.classList.remove('text-blue-500');
                bullet.classList.add('text-gray-400');
            });
            techSpans.forEach(span => {
                if (span.classList.contains('text-blue-600') || span.classList.contains('dark:text-blue-400')) {
                    span.classList.remove('text-blue-600', 'dark:text-blue-400');
                    span.classList.add('text-gray-500', 'dark:text-gray-500');
                }
                if (span.classList.contains('text-gray-950') || span.classList.contains('dark:text-white')) {
                    span.classList.remove('text-gray-950', 'dark:text-white');
                    span.classList.add('text-gray-600', 'dark:text-gray-400');
                }
            });
        });
        return;
    }
    
    let closestCard = null;
    let minDistance = Infinity;
    
    // Find the card closest to the viewport center
    cards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const cardTop = window.scrollY + cardRect.top;
        const cardCenter = cardTop + (cardRect.height / 2);
        const distance = Math.abs(viewportCenter - cardCenter);
        
        if (distance < minDistance) {
            minDistance = distance;
            closestCard = card;
        }
    });
    
    // Reset all cards to muted state first
    cards.forEach(card => {
        card.classList.remove('shadow-2xl', 'shadow-3xl', '-translate-y-2', 'ring-2', 'ring-blue-500', 'ring-opacity-50', 'scale-105');
        card.classList.add('shadow-lg', 'opacity-60');
        card.style.transform = 'translateY(0) scale(1)';
        
        // Apply muted colors to all cards
        const title = card.querySelector('h3');
        const company = card.querySelector('p');
        const companyIcon = card.querySelector('p svg');
        const bullets = card.querySelectorAll('li span:first-child');
        const techSpans = card.querySelectorAll('span.font-semibold');
        
        if (title) {
            title.classList.remove('text-gray-950', 'dark:text-white');
            title.classList.add('text-gray-600', 'dark:text-gray-400');
        }
        if (company) {
            company.classList.remove('text-blue-600', 'dark:text-blue-400');
            company.classList.add('text-gray-500', 'dark:text-gray-500');
        }
        if (companyIcon) {
            companyIcon.classList.remove('text-blue-500');
            companyIcon.classList.add('text-gray-400');
        }
        bullets.forEach(bullet => {
            bullet.classList.remove('text-blue-500');
            bullet.classList.add('text-gray-400');
        });
        techSpans.forEach(span => {
            if (span.classList.contains('text-blue-600') || span.classList.contains('dark:text-blue-400')) {
                span.classList.remove('text-blue-600', 'dark:text-blue-400');
                span.classList.add('text-gray-500', 'dark:text-gray-500');
            }
            if (span.classList.contains('text-gray-950') || span.classList.contains('dark:text-white')) {
                span.classList.remove('text-gray-950', 'dark:text-white');
                span.classList.add('text-gray-600', 'dark:text-gray-400');
            }
        });
    });
    
    // Apply enhanced effects to the closest card only
    if (closestCard) {
        closestCard.classList.remove('shadow-lg', 'opacity-60');
        closestCard.classList.add('shadow-2xl', '-translate-y-2', 'ring-2', 'ring-blue-500', 'ring-opacity-50', 'scale-105', 'opacity-100');
        closestCard.style.transform = 'translateY(-8px) scale(1.02)';
        
        // Restore vibrant colors for selected card only
        const title = closestCard.querySelector('h3');
        const company = closestCard.querySelector('p');
        const companyIcon = closestCard.querySelector('p svg');
        const bullets = closestCard.querySelectorAll('li span:first-child');
        const techSpans = closestCard.querySelectorAll('span.font-semibold');
        
        if (title) {
            title.classList.remove('text-gray-600', 'dark:text-gray-400');
            title.classList.add('text-gray-950', 'dark:text-white');
        }
        if (company) {
            company.classList.remove('text-gray-500', 'dark:text-gray-500');
            company.classList.add('text-blue-600', 'dark:text-blue-400');
        }
        if (companyIcon) {
            companyIcon.classList.remove('text-gray-400');
            companyIcon.classList.add('text-blue-500');
        }
        bullets.forEach(bullet => {
            bullet.classList.remove('text-gray-400');
            bullet.classList.add('text-blue-500');
        });
        techSpans.forEach(span => {
            if (span.classList.contains('text-gray-500') || span.classList.contains('dark:text-gray-500')) {
                span.classList.remove('text-gray-500', 'dark:text-gray-500');
                span.classList.add('text-blue-600', 'dark:text-blue-400');
            }
            if (span.classList.contains('text-gray-600') || span.classList.contains('dark:text-gray-400')) {
                span.classList.remove('text-gray-600', 'dark:text-gray-400');
                span.classList.add('text-gray-950', 'dark:text-white');
            }
        });
    }
}

// Initialize cards and functionality
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        updateActiveSection();
        initializeMutedCards();
        updateCenterCard();
        updateSkillsCards();
        initializeProjectCards();
    }, 50);
});

// Note: Scroll events now handled by optimized single scroll listener above

// Handle resize events for cards (now consolidated above)
// Project cards functionality
function initializeProjectCards() {
    const projectCards = document.querySelectorAll('.project-card');
    
    // Add staggered animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animate-fade-in-up');
                }, index * 100);
            }
        });
    }, observerOptions);
    
    projectCards.forEach(card => {
        observer.observe(card);
        
        // Add click handlers for demo and code buttons
        const demoBtn = card.querySelector('button:first-child');
        const codeBtn = card.querySelector('button:last-child');
        
        if (demoBtn) {
            demoBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // You can replace these with actual URLs
                console.log('Opening demo for:', card.querySelector('h3').textContent);
                // window.open('your-demo-url', '_blank');
            });
        }
        
        if (codeBtn) {
            codeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // You can replace these with actual GitHub URLs
                console.log('Opening code for:', card.querySelector('h3').textContent);
                // window.open('your-github-url', '_blank');
            });
        }
    });
}

// Add custom CSS classes for animations
const style = document.createElement('style');
style.textContent = `
    .animate-fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .project-card {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease-out;
    }
    
    .project-card.animate-fade-in-up {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

// Contact form handler (mailto fallback)
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const messageInput = document.getElementById('contact-message');
        const message = messageInput ? messageInput.value.trim() : '';

        if (!message) {
            return;
        }

        const recipient = 'pavenkodanielofficial@hotmail.com';
        const subject = 'Portfolio Contact';
        const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

        window.location.href = mailtoUrl;
    });
});
