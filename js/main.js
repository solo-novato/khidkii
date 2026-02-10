document.addEventListener('DOMContentLoaded', () => {

    // Parallax Background Effect
    const parallaxImg = document.getElementById('parallaxImg');
    const parallaxBg = document.querySelector('.parallax-bg');

    function isMobile() {
        return window.innerWidth <= 768;
    }

    function updateParallax() {
        if (isMobile()) {
            // On mobile: stretch background to match document height
            if (parallaxImg) {
                parallaxImg.style.transform = 'none';
                parallaxImg.style.height = document.documentElement.scrollHeight + 'px';
                parallaxImg.style.objectFit = 'cover';
                parallaxImg.style.objectPosition = 'top center';
            }
            if (parallaxBg) {
                parallaxBg.style.height = document.documentElement.scrollHeight + 'px';
            }
            return;
        }
        
        // Desktop: reset mobile styles
        if (parallaxBg) parallaxBg.style.height = '';
        if (parallaxImg) {
            parallaxImg.style.height = '';
            parallaxImg.style.objectFit = '';
            parallaxImg.style.objectPosition = '';
            
            // Wait for image to load to get actual dimensions
            if (!parallaxImg.complete || parallaxImg.naturalHeight === 0) return;
            
            const imgHeight = parallaxImg.offsetHeight;
            const viewportHeight = window.innerHeight;
            const pageHeight = document.body.scrollHeight - viewportHeight;
            const scrollY = window.scrollY;
            
            // Only scroll if image is taller than viewport
            if (imgHeight > viewportHeight) {
                const maxScroll = imgHeight - viewportHeight;
                const scrollPercent = Math.min(scrollY / pageHeight, 1);
                const translateY = -scrollPercent * maxScroll;
                parallaxImg.style.transform = `translateY(${translateY}px)`;
            }
        }
    }

    // Update on scroll
    window.addEventListener('scroll', () => {
        requestAnimationFrame(updateParallax);
    });

    // Update on resize
    window.addEventListener('resize', updateParallax);

    // Update when image loads
    if (parallaxImg) {
        parallaxImg.addEventListener('load', updateParallax);
    }
    
    // Initial call after a small delay to ensure DOM is ready
    setTimeout(updateParallax, 100);

    // ========== SCREENSAVER ==========
    const screensaver = document.getElementById('screensaver');
    const screensaverVideo = document.getElementById('screensaverVideo');
    let idleTimer = null;
    let screensaverActive = false;
    let userHasInteracted = false;
    const IDLE_TIME = 5000; // 5 seconds

    // Track user interaction for audio autoplay permission
    function enableAudio() {
        if (!userHasInteracted && screensaverVideo) {
            userHasInteracted = true;
            screensaverVideo.muted = false;
            screensaverVideo.volume = 1.0;
        }
    }
    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('keydown', enableAudio, { once: true });
    document.addEventListener('touchstart', enableAudio, { once: true });

    function showScreensaver() {
        if (window.scrollY > 50) return; // Only show when at top of page
        if (screensaver && screensaverVideo) {
            screensaverActive = true;
            screensaver.classList.add('active');
            screensaverVideo.currentTime = 0;
            screensaverVideo.muted = !userHasInteracted; // Unmute if user has interacted
            screensaverVideo.play().catch(e => console.log("Autoplay prevented:", e));
        }
    }

    function hideScreensaver() {
        if (!screensaverActive) return;
        if (screensaver && screensaverVideo) {
            screensaverActive = false;
            screensaver.classList.remove('active');
            screensaverVideo.pause();
            screensaverVideo.muted = true; // Mute when hidden to stop audio
        }
    }

    function resetIdleTimer() {
        clearTimeout(idleTimer);
        hideScreensaver();
        
        // Only start idle timer if at top of page
        if (window.scrollY <= 50) {
            idleTimer = setTimeout(showScreensaver, IDLE_TIME);
        }
    }

    // Events that reset the idle timer
    document.addEventListener('mousemove', resetIdleTimer);
    document.addEventListener('scroll', resetIdleTimer);
    document.addEventListener('keydown', resetIdleTimer);
    document.addEventListener('click', resetIdleTimer);
    document.addEventListener('touchstart', resetIdleTimer);
    document.addEventListener('touchmove', resetIdleTimer);

    // Click/touch on screensaver also dismisses it
    if (screensaver) {
        screensaver.addEventListener('click', hideScreensaver);
        screensaver.addEventListener('touchstart', hideScreensaver);
        screensaver.addEventListener('touchend', hideScreensaver);
    }

    // Start the idle timer on page load
    resetIdleTimer();

    // For mobile: also start timer after first touch (to handle autoplay restrictions)
    let firstInteraction = false;
    function enableScreensaverAfterInteraction() {
        if (!firstInteraction) {
            firstInteraction = true;
            resetIdleTimer();
        }
    }
    document.addEventListener('touchstart', enableScreensaverAfterInteraction, { once: true });
    document.addEventListener('click', enableScreensaverAfterInteraction, { once: true });

    // Firefly Cursor
    const cursor = document.getElementById('cursor');
    const trails = [document.getElementById('trail1'), document.getElementById('trail2'), document.getElementById('trail3'), document.getElementById('trail4'), document.getElementById('trail5')];
    const spotlightOverlay = document.getElementById('spotlightOverlay');
    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2, cursorX = window.innerWidth / 2, cursorY = window.innerHeight / 2, prevCursorX = 0, prevCursorY = 0, currentAngle = 0;
    const trailPositions = trails.map(() => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 }));

    // Video spotlight elements
    const videoBgContainer = document.getElementById('videoBgContainer');
    const videoSpotlight = document.getElementById('videoSpotlight');

    // Calculate initial video position at middle of spotlight beam
    const distance = 325;
    const angle = 30 * (Math.PI / 180); // Right and down direction
    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;
    let videoX = window.innerWidth / 2 + offsetX;
    let videoY = window.innerHeight / 2 + offsetY;

    // Initialize video position
    if (!isMobile() && videoBgContainer) {
        videoBgContainer.style.left = videoX + 'px';
        videoBgContainer.style.top = videoY + 'px';
    }

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        // Update spotlight position
        if (spotlightOverlay) {
            spotlightOverlay.style.setProperty('--mouse-x', e.clientX + 'px');
            spotlightOverlay.style.setProperty('--mouse-y', e.clientY + 'px');
        }

        // Update video spotlight position (relative to video container)
        if (videoBgContainer && videoSpotlight) {
            const rect = videoBgContainer.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            const relY = e.clientY - rect.top;
            videoSpotlight.style.setProperty('--video-mouse-x', relX + 'px');
            videoSpotlight.style.setProperty('--video-mouse-y', relY + 'px');
        }
    });

    // Animate video position to follow cursor
    function animateVideo() {
        if (!isMobile() && videoBgContainer) {
            // Smooth follow at middle of spotlight beam
            const videoWidth = videoBgContainer.offsetWidth;
            const videoHeight = videoBgContainer.offsetHeight;

            // Position at middle of spotlight (325px = half of 650px radius)
            // Place at 30-degree angle from cursor (right and slightly down)
            const distance = 325;
            const angle = 30 * (Math.PI / 180); // Right and down direction

            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance;

            let targetX = mouseX + offsetX;
            let targetY = mouseY + offsetY;

            // Keep video within viewport boundaries
            const minY = 120; // Keep below header with padding
            const maxY = window.innerHeight - videoHeight - 20;
            const minX = videoWidth / 2 + 20;
            const maxX = window.innerWidth - videoWidth / 2 - 20;

            targetX = Math.max(minX, Math.min(maxX, targetX));
            targetY = Math.max(minY, Math.min(maxY, targetY));

            videoX += (targetX - videoX) * 0.12;
            videoY += (targetY - videoY) * 0.12;

            videoBgContainer.style.left = videoX + 'px';
            videoBgContainer.style.top = videoY + 'px';
        }
        requestAnimationFrame(animateVideo);
    }
    animateVideo();

    function animateCursor() {
        prevCursorX = cursorX; prevCursorY = cursorY;
        // Increased from 0.15 to 0.4 for snappier response
        cursorX += (mouseX - cursorX) * 0.4;
        cursorY += (mouseY - cursorY) * 0.4;
        
        const deltaX = cursorX - prevCursorX, deltaY = cursorY - prevCursorY;
        const speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (speed > 0.5) {
            const targetAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
            let angleDiff = targetAngle - currentAngle;
            if (angleDiff > 180) angleDiff -= 360;
            if (angleDiff < -180) angleDiff += 360;
            // Increased rotation speed from 0.15 to 0.3
            currentAngle += angleDiff * 0.3;
        }
        
        if (cursor) {
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
            cursor.style.transform = `translate(-50%, -50%) rotate(${currentAngle}deg)`;
        }

        const tailOffsetX = Math.cos(currentAngle * Math.PI / 180) * 18;
        const tailOffsetY = Math.sin(currentAngle * Math.PI / 180) * 18;
        const tailX = cursorX + tailOffsetX, tailY = cursorY + tailOffsetY;
        
        trails.forEach((trail, i) => {
            if (!trail) return;
            // Increased trail speed: was 0.12 base, now 0.25 base
            const lag = 0.25 - (i * 0.02);
            const prevPos = i === 0 ? { x: tailX, y: tailY } : trailPositions[i - 1];
            trailPositions[i].x += (prevPos.x - trailPositions[i].x) * lag;
            trailPositions[i].y += (prevPos.y - trailPositions[i].y) * lag;
            trail.style.left = trailPositions[i].x + 'px';
            trail.style.top = trailPositions[i].y + 'px';
            trail.style.opacity = (0.6 - (i * 0.1)) * (speed > 0.5 ? 1 : 0.3);
            const size = 6 - i;
            trail.style.width = size + 'px';
            trail.style.height = size + 'px';
        });
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    document.querySelectorAll('a, button, input, textarea, select, .artwork-card, .gallery-item, .skill-tag, .social-link').forEach(el => {
        el.addEventListener('mouseenter', () => cursor && cursor.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursor && cursor.classList.remove('hovering'));
    });

    // Scroll indicator - hide when near bottom
    const scrollIndicator = document.getElementById('scrollIndicator');
    function updateScrollIndicator() {
        if (!scrollIndicator) return;
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight;
        const winHeight = window.innerHeight;
        const scrollableHeight = docHeight - winHeight;
        
        // Hide when within 100px of the bottom
        if (scrollTop >= scrollableHeight - 100) {
            scrollIndicator.classList.add('hidden');
        } else {
            scrollIndicator.classList.remove('hidden');
        }
    }
    // Initial check
    updateScrollIndicator();

    // Navigation scroll effect
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
        updateScrollIndicator();
        
        if (nav) {
            if (window.scrollY > 100) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }

        const sections = ['hero', 'artworks', 'artist', 'gallery', 'contact'];
        let current = '';
        sections.forEach(id => {
            const section = document.getElementById(id);
            if (section && window.scrollY >= section.offsetTop - 200) {
                current = id;
            }
        });
        
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // Scroll animations
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section-header, .artwork-card, .artist-image, .artist-info, .gallery-item, .contact-info, .contact-form').forEach(el => {
        observer.observe(el);
    });

    document.querySelectorAll('.artwork-card').forEach((card, i) => {
        card.style.transitionDelay = `${i * 0.1}s`;
    });

    document.querySelectorAll('.gallery-item').forEach((item, i) => {
        item.style.transitionDelay = `${i * 0.1}s`;
    });

    // Form submission
    window.handleSubmit = function(e) {
        e.preventDefault();
        const btn = document.querySelector('.submit-btn');
        btn.textContent = 'Sending...';
        btn.style.opacity = '0.7';
        setTimeout(() => {
            btn.textContent = 'Inquiry Sent! ✓';
            btn.style.background = 'linear-gradient(135deg, #34d399, #10b981)';
            setTimeout(() => {
                btn.textContent = 'Send Inquiry';
                btn.style.background = '';
                btn.style.opacity = '';
                document.querySelector('.contact-form').reset();
            }, 2000);
        }, 1000);
    };

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

});
