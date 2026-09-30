/* ==========================================================================
   BLIV Serviced Residences - Cinematic Luxury Motion System
   ========================================================================== */

(function() {
    // 1. Accessibility Safety Check (Respect user preferences)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        console.log("BLIV Motion: Reduced motion enabled. Skipping animations.");
        return;
    }

    document.addEventListener('DOMContentLoaded', () => {
        try {
            // Determine active page context
            const path = window.location.pathname.toLowerCase();
            const isSubpage = path.includes('abbasi-tower') || 
                              path.includes('baitu-l-amaan') || 
                              path.includes('banjara-hills') || 
                              path.includes('hill-plaza-shaikhpet');

            // Initialize Motion Modules
            initHeroReveal(isSubpage);
            initParallax(isSubpage);
            initScrollMorphs();
            initPropertyCardHover();
            initAmenitiesMicroInteractions();
            initMagneticButtons();
            initPageTransitionOverlay();
        } catch (e) {
            console.error("BLIV Motion: Initialization failed: ", e);
        }
    });

    /* --------------------------------------------------------------------------
       01. Cinematic Hero Entrance Reveal Sequence
       -------------------------------------------------------------------------- */
    function initHeroReveal(isSubpage) {
        const body = document.body;
        
        if (!isSubpage) {
            // HOMEPAGE ENTRANCE SEQUENCE
            const hero = document.getElementById('hero');
            const logo = document.getElementById('header-logo');
            const navLinks = document.querySelectorAll('.desktop-nav a');
            const heroTitleLines = document.querySelectorAll('.hero-title span');
            const heroSubtext = document.querySelector('.hero-subtext');
            const heroCta = document.querySelector('.hero-cta-wrapper');
            const scrollIndicator = document.querySelector('.scroll-indicator');

            // Keep the hero visible from the first paint. The previous full-hero
            // fade could leave visitors on an empty screen when a browser delayed
            // the animation timer or restored the page from cache.
            if (hero) {
                hero.style.opacity = '1';
                hero.style.transition = 'opacity 1.2s ease';
            }
            if (logo) {
                logo.style.opacity = '0';
                logo.style.transform = 'translateY(-15px)';
                logo.style.transition = 'opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
            }
            navLinks.forEach(link => {
                link.style.opacity = '0';
                link.style.transform = 'translateY(-10px)';
                link.style.transition = 'opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1), transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
            });

            heroTitleLines.forEach(line => {
                line.style.opacity = '0';
                line.style.transform = 'translateY(30px)';
                line.style.transition = 'opacity 1s cubic-bezier(0.25, 1, 0.5, 1), transform 1s cubic-bezier(0.25, 1, 0.5, 1)';
            });

            if (heroSubtext) {
                heroSubtext.style.opacity = '0';
                heroSubtext.style.transform = 'translateY(15px)';
                heroSubtext.style.transition = 'opacity 1s ease';
            }
            if (heroCta) {
                heroCta.style.opacity = '0';
                heroCta.style.transform = 'translateY(15px)';
                heroCta.style.transition = 'opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
            }
            if (scrollIndicator) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.transition = 'opacity 1.2s ease';
            }

            // Timeline Sequence trigger
            setTimeout(() => {
                // 1. Reveal logo and supporting hero details
                if (logo) {
                    logo.style.opacity = '1';
                    logo.style.transform = 'translateY(0)';
                }

                // 2. Reveal nav links sequentially
                navLinks.forEach((link, idx) => {
                    setTimeout(() => {
                        link.style.opacity = '1';
                        link.style.transform = 'translateY(0)';
                    }, 100 + (idx * 50));
                });

                // 3. Slide up heading lines
                heroTitleLines.forEach((line, idx) => {
                    setTimeout(() => {
                        line.style.opacity = '1';
                        line.style.transform = 'translateY(0)';
                    }, 400 + (idx * 150));
                });

                // 4. Fade in subtitle
                setTimeout(() => {
                    if (heroSubtext) {
                        heroSubtext.style.opacity = '1';
                        heroSubtext.style.transform = 'translateY(0)';
                    }
                }, 800);

                // 5. Reveal CTA & Scroll indicators last
                setTimeout(() => {
                    if (heroCta) {
                        heroCta.style.opacity = '1';
                        heroCta.style.transform = 'translateY(0)';
                    }
                    if (scrollIndicator) {
                        scrollIndicator.style.opacity = '1';
                    }
                }, 1100);

            }, 200);

        } else {
            // STANDALONE PROPERTY PAGE HERO REVEAL
            const pbar = document.getElementById('scroll-progress-bar');
            const propHero = document.querySelector('.property-hero');
            const logo = document.getElementById('header-logo');
            const navLinks = document.querySelectorAll('.desktop-nav a');
            const propTitle = document.querySelector('.property-hero-content h1');
            const propLabel = document.querySelector('.property-hero-content .item-label');
            const propTagline = document.querySelector('.property-hero-content .tagline');

            // Apply masked clip-path & initial scale state
            if (propHero) {
                propHero.style.clipPath = 'inset(0% 12% 0% 12%)';
                propHero.style.transform = 'scale(1.08)';
                propHero.style.transition = 'clip-path 1.6s cubic-bezier(0.76, 0, 0.24, 1), transform 1.8s cubic-bezier(0.25, 1, 0.5, 1)';
            }
            if (logo) {
                logo.style.opacity = '0';
                logo.style.transform = 'translateY(-15px)';
                logo.style.transition = 'opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
            }
            navLinks.forEach(link => {
                link.style.opacity = '0';
                link.style.transform = 'translateY(-10px)';
                link.style.transition = 'opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1), transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
            });

            if (propLabel) {
                propLabel.style.opacity = '0';
                propLabel.style.transform = 'translateY(15px)';
                propLabel.style.transition = 'opacity 0.8s ease';
            }
            if (propTitle) {
                propTitle.style.opacity = '0';
                propTitle.style.transform = 'translateY(25px)';
                propTitle.style.transition = 'opacity 1s cubic-bezier(0.25, 1, 0.5, 1), transform 1s cubic-bezier(0.25, 1, 0.5, 1)';
            }
            if (propTagline) {
                propTagline.style.opacity = '0';
                propTagline.style.transform = 'translateY(15px)';
                propTagline.style.transition = 'opacity 0.8s ease';
            }

            // Timeline Sequence
            setTimeout(() => {
                // 1. Expand clip-path and shrink image back to normal
                if (propHero) {
                    propHero.style.clipPath = 'inset(0% 0% 0% 0%)';
                    propHero.style.transform = 'scale(1)';
                }

                // 2. Reveal logo and nav
                setTimeout(() => {
                    if (logo) {
                        logo.style.opacity = '1';
                        logo.style.transform = 'translateY(0)';
                    }
                    navLinks.forEach((link, idx) => {
                        setTimeout(() => {
                            link.style.opacity = '1';
                            link.style.transform = 'translateY(0)';
                        }, idx * 50);
                    });
                }, 600);

                // 3. Reveal heading and specs text inside hero bounds
                setTimeout(() => {
                    if (propLabel) {
                        propLabel.style.opacity = '1';
                        propLabel.style.transform = 'translateY(0)';
                    }
                }, 900);

                setTimeout(() => {
                    if (propTitle) {
                        propTitle.style.opacity = '1';
                        propTitle.style.transform = 'translateY(0)';
                    }
                }, 1050);

                setTimeout(() => {
                    if (propTagline) {
                        propTagline.style.opacity = '1';
                        propTagline.style.transform = 'translateY(0)';
                    }
                }, 1250);

            }, 250);
        }
    }

    /* --------------------------------------------------------------------------
       02. Subtle Parallax Effect (Scroll & Desktop Mousemove)
       -------------------------------------------------------------------------- */
    function initParallax(isSubpage) {
        if (isSubpage) {
            // Scroll parallax on property hero image
            const hero = document.querySelector('.property-hero');
            if (!hero) return;

            window.addEventListener('scroll', () => {
                const scrolled = window.scrollY;
                if (scrolled < window.innerHeight) {
                    // Translate background position or apply transform translation (capped for performance)
                    hero.style.backgroundPositionY = `${scrolled * 0.35}px`;
                }
            }, { passive: true });
        } else {
            // Homepage mouse-parallax on hero gradient overlay
            const overlay = document.querySelector('.hero-bg-overlay');
            if (!overlay) return;

            // Only run on desktop viewports
            if (window.innerWidth > 992) {
                document.addEventListener('mousemove', (e) => {
                    const moveX = (e.clientX - window.innerWidth / 2) * -0.015;
                    const moveY = (e.clientY - window.innerHeight / 2) * -0.015;
                    overlay.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
                });
            }
        }
    }

    /* --------------------------------------------------------------------------
       03. Signature Image Morph / Expansion Effect (Scroll-driven Insets)
       -------------------------------------------------------------------------- */
    function initScrollMorphs() {
        // Observer for scroll morph elements
        const morphElements = document.querySelectorAll('.frame-image-wrapper img, .overlay-hero-media');
        if (morphElements.length === 0) return;

        // Custom observer to trigger smooth scroll scaling
        const morphObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                } else {
                    entry.target.classList.remove('in-view');
                }
            });
        }, { threshold: 0.05 });

        morphElements.forEach(el => {
            // Initialize elements with custom scale properties
            el.style.transition = 'transform 0.4s ease-out';
            morphObserver.observe(el);
        });

        // Cap animation loop for performance
        window.addEventListener('scroll', () => {
            const inViewElements = document.querySelectorAll('.in-view');
            inViewElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                const viewHeight = window.innerHeight;
                
                // Calculate percentage of element movement across viewport
                const progress = (viewHeight - rect.top) / (viewHeight + rect.height);
                const scaleVal = 1.05 - (progress * 0.06); // scale from 1.05 to 0.99
                
                // Keep scale values capped
                const boundedScale = Math.max(0.98, Math.min(1.06, scaleVal));
                el.style.transform = `scale(${boundedScale})`;
            });
        }, { passive: true });
    }

    /* --------------------------------------------------------------------------
       04. Portfolio Property Cards Hover Effects
       -------------------------------------------------------------------------- */
    function initPropertyCardHover() {
        const cards = document.querySelectorAll('.property-chapter-row, .location-card');
        
        cards.forEach(card => {
            const img = card.querySelector('img');
            const info = card.querySelector('.chapter-info, .loc-info');
            const title = card.querySelector('.chapter-title, h3');
            
            card.addEventListener('mouseenter', () => {
                if (img) {
                    img.style.transform = 'scale(1.04) translateY(-3px)';
                    img.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
                }
                if (info) {
                    info.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
                }
                if (title) {
                    title.style.color = 'var(--color-sand)';
                    title.style.transition = 'color 0.4s ease';
                }
            });

            card.addEventListener('mouseleave', () => {
                if (img) {
                    img.style.transform = 'scale(1) translateY(0)';
                }
                if (title) {
                    title.style.color = '';
                }
            });
        });
    }

    /* --------------------------------------------------------------------------
       05. Amenities Micro-Interactions (Icon scaling)
       -------------------------------------------------------------------------- */
    function initAmenitiesMicroInteractions() {
        const badges = document.querySelectorAll('.tag-badge, .amenity-tags span');
        badges.forEach(badge => {
            badge.style.display = 'inline-block';
            badge.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.4s ease, color 0.4s ease';

            badge.addEventListener('mouseenter', () => {
                badge.style.transform = 'translateY(-3px) scale(1.03) rotate(0.8deg)';
                badge.style.backgroundColor = 'var(--color-sand)';
                badge.style.color = 'var(--color-charcoal)';
            });

            badge.addEventListener('mouseleave', () => {
                badge.style.transform = 'translateY(0) scale(1) rotate(0)';
                badge.style.backgroundColor = '';
                badge.style.color = '';
            });
        });
    }

    /* --------------------------------------------------------------------------
       06. Premium Magnetic Button Interaction
       -------------------------------------------------------------------------- */
    function initMagneticButtons() {
        // Disable on touch devices
        if ('ontouchstart' in window) return;

        const magneticBtns = document.querySelectorAll('.btn-primary, .btn-outline, .nav-cta, .btn-share-api, .btn-copy-property');

        magneticBtns.forEach(btn => {
            btn.style.transition = 'transform 0.2s ease-out';

            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                // Get mouse coordinates relative to the button center
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                // Move button slightly towards the cursor (max 10px translate)
                btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                // Settle back cleanly
                btn.style.transform = 'translate(0, 0)';
                btn.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
            });
        });
    }

    /* --------------------------------------------------------------------------
       07. Page Transition Mask Overlay (Direct and back/forward browser compatibility)
       -------------------------------------------------------------------------- */
    function initPageTransitionOverlay() {
        // Native navigation is immediate and reliable. The former full-screen
        // charcoal mask occasionally stayed open while a route was loading,
        // creating an empty screen before visitors could see the next page.
        const existingOverlay = document.getElementById('motion-page-overlay');
        if (existingOverlay) existingOverlay.remove();
    }
})();
