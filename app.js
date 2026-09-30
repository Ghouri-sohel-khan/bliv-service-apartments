/* ==========================================================================
   BLIV Serviced Residences - Core Interactive Controller
   ========================================================================== */

// Global Intersection Observer for Photographic Frame scroll reveals
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.05,
    rootMargin: '0px 0px -40px 0px'
});

document.addEventListener('DOMContentLoaded', () => {
    initDeferredBackgrounds();
    initCustomCursor();
    initScrollProgressAndHeader();
    initMobileMenu();
    initCityStoryScroll();
    init3DCubeScroll();
    initPropertyOverlays();
    initSpacesFilter();
    initLightbox();
    initContactDrawer();

    // Trigger reveal observation for static elements on page load
    document.querySelectorAll('[data-scroll-reveal]').forEach(el => {
        revealObserver.observe(el);
    });
});

/* --------------------------------------------------------------------------
   Image delivery
   -------------------------------------------------------------------------- */
function initDeferredBackgrounds() {
    const backgroundItems = [...document.querySelectorAll('[data-bg]')];
    if (!backgroundItems.length) return;

    const loadBackground = (element) => {
        if (element.dataset.bgLoaded === 'true') return;
        element.style.backgroundImage = `url("${element.dataset.bg}")`;
        element.dataset.bgLoaded = 'true';
    };

    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            loadBackground(entry.target);
            currentObserver.unobserve(entry.target);
        });
    }, { rootMargin: '300px 0px' });

    backgroundItems.forEach((element) => {
        if (element.classList.contains('active')) {
            loadBackground(element);
        } else {
            observer.observe(element);
        }
    });
}

/* --------------------------------------------------------------------------
   01. Premium Custom Cursor (Desktop Only)
   -------------------------------------------------------------------------- */
function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    // Track mouse coordinates
    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
    });

    // Lerp animation for smooth lag effect
    function animateCursor() {
        currentX += (targetX - currentX) * 0.15;
        currentY += (targetY - currentY) * 0.15;
        cursor.style.left = `${currentX}px`;
        cursor.style.top = `${currentY}px`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover interactions
    const interactiveElements = document.querySelectorAll('a, button, .chapter-media-wrapper, .spaces-item, .gallery-item');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hovered');
            if (el.classList.contains('chapter-media-wrapper') || el.classList.contains('spaces-item') || el.classList.contains('gallery-item')) {
                cursor.querySelector('.cursor-text').textContent = 'VIEW';
            } else if (el.classList.contains('open-details-btn')) {
                cursor.querySelector('.cursor-text').textContent = 'OPEN';
            } else {
                cursor.querySelector('.cursor-text').textContent = 'GO';
            }
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovered');
        });
    });
}

/* --------------------------------------------------------------------------
   02. Scroll Progress & Sticky Header
   -------------------------------------------------------------------------- */
function initScrollProgressAndHeader() {
    const progressBar = document.getElementById('scroll-progress-bar');
    const header = document.getElementById('site-header');

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        
        if (progressBar) {
            progressBar.style.width = `${scrollPercent}%`;
        }

        if (header) {
            if (scrollTop > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
}

/* --------------------------------------------------------------------------
   03. Mobile Menu Overlay
   -------------------------------------------------------------------------- */
function initMobileMenu() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const overlay = document.getElementById('mobile-nav-overlay');
    const links = document.querySelectorAll('.mobile-link');

    if (!toggle || !overlay) return;

    function toggleMenu() {
        const isOpen = overlay.classList.contains('active');
        if (isOpen) {
            overlay.classList.remove('active');
            document.body.classList.remove('mobile-menu-active');
            toggle.setAttribute('aria-expanded', 'false');
        } else {
            overlay.classList.add('active');
            document.body.classList.add('mobile-menu-active');
            toggle.setAttribute('aria-expanded', 'true');
        }
    }

    toggle.addEventListener('click', toggleMenu);

    links.forEach(link => {
        link.addEventListener('click', () => {
            overlay.classList.remove('active');
            document.body.classList.remove('mobile-menu-active');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
}

/* --------------------------------------------------------------------------
   04. Cinematic Day -> Night City Story Scroll-Timeline
   -------------------------------------------------------------------------- */
function initCityStoryScroll() {
    const section = document.getElementById('city-story');
    const layers = document.querySelectorAll('.city-layer');
    const blocks = document.querySelectorAll('.city-text-block');

    if (!section || layers.length === 0) return;

    window.addEventListener('scroll', () => {
        const rect = section.getBoundingClientRect();
        const height = section.offsetHeight;
        
        // Check if section is in viewport scroll range
        if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
            const scrolledAmt = -rect.top;
            const scrollPercent = scrolledAmt / (height - window.innerHeight);

            // Timeline segmentation
            let activeIndex = 0;
            if (scrollPercent >= 0.35 && scrollPercent < 0.70) {
                activeIndex = 1; // Golden Hour
            } else if (scrollPercent >= 0.70) {
                activeIndex = 2; // Night
            }

            // Sync visual layers
            layers.forEach((layer, i) => {
                if (i === activeIndex) {
                    layer.classList.add('active');
                } else {
                    layer.classList.remove('active');
                }
            });

            // Sync text panels
            blocks.forEach((block, i) => {
                if (i === activeIndex) {
                    block.classList.add('active');
                } else {
                    block.classList.remove('active');
                }
            });
        }
    });
}

/* --------------------------------------------------------------------------
   05. Signature 3D Cube Scroll Controller
   -------------------------------------------------------------------------- */
function init3DCubeScroll() {
    const section = document.querySelector('.cube-showcase-section');
    const cube = document.getElementById('rotating-cube');
    const bgImages = document.querySelectorAll('.cube-bg-image');
    const bullets = document.querySelectorAll('.cube-progress-bullets .bullet');

    if (!section || !cube) return;

    // Define rotations corresponding to key indexes
    const rotations = [
        { x: 0,   y: 0 },     // 0: HYDERABAD (Front)
        { x: 0,   y: -90 },   // 1: RESIDENCES (Right)
        { x: -90, y: 0 },     // 2: HOME (Top)
        { x: 0,   y: 90 },    // 3: SPACE (Left)
        { x: 90,  y: 0 },     // 4: STAY (Bottom)
        { x: 0,   y: 180 }    // 5: BLIV (Back)
    ];

    function updateCube(index) {
        // Rotate 3D Cube element
        const rot = rotations[index];
        cube.style.transform = `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`;

        // Sync background image fading
        bgImages.forEach((img, i) => {
            if (i === index) {
                img.classList.add('active');
            } else {
                img.classList.remove('active');
            }
        });

        // Sync progress indicators
        bullets.forEach((bullet, i) => {
            if (i === index) {
                bullet.classList.add('active');
            } else {
                bullet.classList.remove('active');
            }
        });
    }

    // Keep the cube compact: only enable scroll-driven rotation when a page
    // intentionally gives the section extra height.
    window.addEventListener('scroll', () => {
        const rect = section.getBoundingClientRect();
        const height = section.offsetHeight;
        const scrollRange = height - window.innerHeight;

        if (scrollRange <= 0) return;
        
        if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
            const scrolledAmt = -rect.top;
            const scrollPercent = scrolledAmt / scrollRange;
            
            // Calculate active face step index (0 to 5)
            const activeIndex = Math.min(
                Math.floor(scrollPercent * 6),
                5
            );
            
            updateCube(activeIndex);
        }
    });

    // Let visitors switch the cube face directly without creating empty
    // viewport-sized scroll panels.
    bullets.forEach((bullet, idx) => {
        bullet.addEventListener('click', () => {
            updateCube(idx);
        });
    });

    updateCube(0);
}

/* --------------------------------------------------------------------------
   06. Property Slide-in Overlay Panel Controllers
   -------------------------------------------------------------------------- */
// Exact audited local asset list configs
const PROPERTY_IMAGES = {
    baitu: [
        { url: "Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_16_46%20PM.webp", title: "Living Lounge", desc: "Spacious seating arrangement matching rich ivory textures." },
        { url: "Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_18_17%20PM.webp", title: "Formal Dining", desc: "Clean table settings designed for home dining." },
        { url: "Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_20_02%20PM.webp", title: "Master Bed Suite", desc: "Orthopedic bedding suite focusing on peaceful nights." },
        { url: "Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_21_28%20PM.webp", title: "Common Living Space", desc: "Spacious corridors and open layout designed for families." },
        { url: "Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_23_20%20PM.webp", title: "Guest Bedroom", desc: "Plush linens and minimalistic layout designed to settle in." },
        { url: "Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_25_53%20PM.webp", title: "Sofa Lounge Details", desc: "Warm ambient light filtering through custom glass doors." },
        { url: "Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_27_29%20PM.webp", title: "Dining Detail", desc: "Bespoke setups supporting long term residential stay." },
        { url: "Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_29_14%20PM.webp", title: "Fully Equipped Kitchen", desc: "Functional modern cabinets and refrigerator setup." },
        { url: "Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_31_08%20PM.webp", title: "Kitchen Prep Details", desc: "Equipped cooking space designed for everyday comfort." },
        { url: "Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_32_31%20PM.webp", title: "Bathroom details", desc: "Clean fixtures and continuous hot water systems." },
        { url: "Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_35_14%20PM.webp", title: "Living room TV angle", desc: "Installed smart entertainment layout." },
        { url: "Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_38_39%20PM.webp", title: "Bedroom storage", desc: "Bespoke wooden wardrobes and drawers." },
        { url: "Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_40_34%20PM.webp", title: "Bed side study workspace", desc: "Quiet workspace corner tailored for executives." },
        { url: "Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_43_19%20PM.webp", title: "Bathroom wash basin", desc: "Clean marble vanity mirrors." },
        { url: "Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_53_03%20PM.webp", title: "Secondary bedroom layout", desc: "Soft dimmable lights for quiet sleep." }
    ],
    banjara: {
        "2bhk": [
            { url: "Banjara%20Hills/Banjara%20Hilis%202BHK/ChatGPT%20Image%20Aug%204,%202026,%2001_19_32%20PM.webp", title: "2BHK Living Room", desc: "Inviting seating space optimized for relaxation." },
            { url: "Banjara%20Hills/Banjara%20Hilis%202BHK/ChatGPT%20Image%20Aug%204,%202026,%2001_21_45%20PM.webp", title: "2BHK Living Room Angle 2", desc: "Broad layout configurations providing comfortable spacing." },
            { url: "Banjara%20Hills/Banjara%20Hilis%202BHK/ChatGPT%20Image%20Aug%204,%202026,%2001_23_21%20PM.webp", title: "2BHK Master Bed", desc: "Soft orthopedic pillows and clean sheets." },
            { url: "Banjara%20Hills/Banjara%20Hilis%202BHK/ChatGPT%20Image%20Aug%204,%202026,%2001_24_45%20PM.webp", title: "2BHK Bedroom Workspace", desc: "Work table and vanity arrangements." },
            { url: "Banjara%20Hills/Banjara%20Hilis%202BHK/ChatGPT%20Image%20Aug%205,%202026,%2003_21_13%20PM.webp", title: "2BHK Dining Corridor", desc: "Connecting halls styled with sand tones." },
            { url: "Banjara%20Hills/Banjara%20Hilis%202BHK/ChatGPT%20Image%20Aug%205,%202026,%2003_22_36%20PM.webp", title: "2BHK Modular Kitchen", desc: "Equipped cooking counter for family meals." },
            { url: "Banjara%20Hills/Banjara%20Hilis%202BHK/ChatGPT%20Image%20Aug%205,%202026,%2003_23_48%20PM.webp", title: "2BHK Bathroom detailing", desc: "Functional bathroom with modern fixtures." },
            { url: "Banjara%20Hills/Banjara%20Hilis%202BHK/ChatGPT%20Image%20Aug%205,%202026,%2003_44_48%20PM.webp", title: "2BHK Suite Overview", desc: "Premium serviced layout for short or long-stay visits." }
        ],
        "3bhk": [
            { url: "Banjara%20Hills/Banjara%20hills%203BHK%20one%20common%20and%20one%20attached%20Bathroom/ChatGPT%20Image%20Aug%204,%202026,%2001_32_43%20AM.webp", title: "3BHK Suite Living Area", desc: "Massive living hall designed with premium details." },
            { url: "Banjara%20Hills/Banjara%20hills%203BHK%20one%20common%20and%20one%20attached%20Bathroom/ChatGPT%20Image%20Aug%204,%202026,%2001_34_20%20AM.webp", title: "3BHK Dining Table", desc: "Broad dining setup next to the living lounge." },
            { url: "Banjara%20Hills/Banjara%20hills%203BHK%20one%20common%20and%20one%20attached%20Bathroom/ChatGPT%20Image%20Aug%204,%202026,%2001_35_38%20AM.webp", title: "3BHK Master Bedroom", desc: "Cozy primary bedroom with attached bathroom." },
            { url: "Banjara%20Hills/Banjara%20hills%203BHK%20one%20common%20and%20one%20attached%20Bathroom/ChatGPT%20Image%20Aug%204,%202026,%2001_37_10%20AM.webp", title: "3BHK Secondary Bedroom", desc: "Clean secondary bedroom for families." },
            { url: "Banjara%20Hills/Banjara%20hills%203BHK%20one%20common%20and%20one%20attached%20Bathroom/ChatGPT%20Image%20Aug%204,%202026,%2001_38_40%20AM.webp", title: "3BHK Guest Room", desc: "Quiet bedroom space designed for executive stays." },
            { url: "Banjara%20Hills/Banjara%20hills%203BHK%20one%20common%20and%20one%20attached%20Bathroom/ChatGPT%20Image%20Aug%204,%202026,%2001_39_50%20AM.webp", title: "3BHK Attached Bathroom", desc: "Clean tiles and continuous hot water supply." },
            { url: "Banjara%20Hills/Banjara%20hills%203BHK%20one%20common%20and%20one%20attached%20Bathroom/ChatGPT%20Image%20Aug%204,%202026,%2001_48_22%20AM.webp", title: "3BHK Kitchen Space", desc: "Practical kitchen equipped with microwave and refrigerator." }
        ]
    },
    hill: {
        "1bhk": [
            { url: "Hill%20plaza-Shaikhpet/1BHK%20Shaikhpet/ChatGPT%20Image%20Aug%205,%202026,%2004_30_08%20PM.webp", title: "1BHK Living Lounge", desc: "Inviting layout featuring wide landscape windows." },
            { url: "Hill%20plaza-Shaikhpet/1BHK%20Shaikhpet/ChatGPT%20Image%20Aug%205,%202026,%2004_31_31%20PM.webp", title: "1BHK Living Area view 2", desc: "Comfortable sofa seating layout close to transit metro." },
            { url: "Hill%20plaza-Shaikhpet/1BHK%20Shaikhpet/ChatGPT%20Image%20Aug%205,%202026,%2004_33_17%20PM.webp", title: "1BHK Bedroom suite", desc: "A cozy sleep setup for solo consultants." },
            { url: "Hill%20plaza-Shaikhpet/1BHK%20Shaikhpet/ChatGPT%20Image%20Aug%205,%202026,%2004_36_26%20PM.webp", title: "1BHK Executive Desk", desc: "Writing table optimized for remote work." },
            { url: "Hill%20plaza-Shaikhpet/1BHK%20Shaikhpet/ChatGPT%20Image%20Aug%205,%202026,%2004_41_47%20PM.webp", title: "1BHK Bathroom Details", desc: "Clean shower fixtures and geyser." }
        ],
        "single": [
            { url: "Hill%20plaza-Shaikhpet/Single%20room/ChatGPT%20Image%20Aug%205,%202026,%2004_06_03%20PM.webp", title: "Single Executive Room", desc: "Compact suite designed for short business commutes." },
            { url: "Hill%20plaza-Shaikhpet/Single%20room/ChatGPT%20Image%20Aug%205,%202026,%2004_08_45%20PM.webp", title: "Single Room layout", desc: "Minimalist wardrobe and comfortable bed setups." },
            { url: "Hill%20plaza-Shaikhpet/Single%20room/ChatGPT%20Image%20Aug%205,%202026,%2004_11_28%20PM.webp", title: "Single Room writing workspace", desc: "Equipped work corner to stay productive." },
            { url: "Hill%20plaza-Shaikhpet/Single%20room/ChatGPT%20Image%20Aug%205,%202026,%2004_13_40%20PM.webp", title: "Bathroom facility", desc: "Clean hygiene setups and toiletries." }
        ]
    },
    abbasi: [
        { url: "Abbasi%20Tower%20Iram%20Manzil/Living%20Space.webp", title: "Grand Living Lounge", desc: "Boasts elegant modern paneling and floor-to-ceiling glass doors." },
        { url: "Abbasi%20Tower%20Iram%20Manzil/Bedrooms.webp", title: "Primary Bedroom Suite", desc: "Customized orthopedic support bedding designed like luxury hotel suites." },
        { url: "Abbasi%20Tower%20Iram%20Manzil/Bedrooms2.webp", title: "Guest Bedroom Suite", desc: "Meticulously modeled bedroom suite with dimmable ambient mood lighting." },
        { url: "Abbasi%20Tower%20Iram%20Manzil/Dining%20Table.webp", title: "Formal Dining Space", desc: "Equipped dining layout featuring custom wood paneling and marble details." },
        { url: "Abbasi%20Tower%20Iram%20Manzil/Dining%20Table2.webp", title: "Dining Table Details", desc: "Curated setups designed for business dinners and family breakfast." },
        { url: "Abbasi%20Tower%20Iram%20Manzil/Dining%20Experience.webp", title: "Gastronomic Details", desc: "Comfortable dining layout presenting culinary comfort." },
        { url: "Abbasi%20Tower%20Iram%20Manzil/Bathrooms.webp", title: "Primary Marble Restroom", desc: "Spa-like marble restrooms fitted with high-pressure showers." },
        { url: "Abbasi%20Tower%20Iram%20Manzil/Washroom.webp", title: "Wash Basin Detailing", desc: "Marble wash area details and premium toiletries." },
        { url: "Abbasi%20Tower%20Iram%20Manzil/Balcony.webp", title: "Private Balcony Lounge", desc: "A cozy pause above the city's rhythm." },
        { url: "Abbasi%20Tower%20Iram%20Manzil/Work%20Space.webp", title: "Integrated Executive Workspace", desc: "Distraction-free desk layout optimized for corporate stays." }
    ]
};

// Tracks active images in details panel (for lightbox triggers)
let currentOverlayImagePool = [];

function initPropertyOverlays() {
    const openBtns = document.querySelectorAll('.open-details-btn');
    const closeBtns = document.querySelectorAll('.close-overlay-btn');
    const overlays = document.querySelectorAll('.property-overlay-panel');

    if (openBtns.length === 0) return;

    const PROPERTY_ROUTES = {
        'baitu': 'baitu-l-amaan',
        'banjara': 'banjara-hills',
        'hill': 'hill-plaza-shaikhpet',
        'abbasi': 'abbasi-tower'
    };

    const PROPERTY_TITLES = {
        'baitu': 'Baitu-l-Amaan | BLIV Service Apartments Hyderabad',
        'banjara': 'Banjara Hills | BLIV Service Apartments Hyderabad',
        'hill': 'Hill Plaza Shaikhpet | BLIV Service Apartments Hyderabad',
        'abbasi': 'Abbasi Tower | BLIV Service Apartments Hyderabad'
    };

    const HOMEPAGE_TITLE = document.title;

    function openPropertyOverlay(property, pushState = true) {
        const targetOverlay = document.getElementById(`overlay-${property}`);
        if (targetOverlay) {
            overlays.forEach(o => o.classList.remove('active'));
            targetOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            populateOverlayGallery(property);

            if (pushState) {
                const route = PROPERTY_ROUTES[property];
                history.pushState({ property: property }, '', '/' + route);
            }
            if (PROPERTY_TITLES[property]) {
                document.title = PROPERTY_TITLES[property];
            }
        }
    }

    function closeAllOverlays(pushState = true) {
        overlays.forEach(overlay => {
            overlay.classList.remove('active');
        });
        document.body.style.overflow = '';
        if (pushState) {
            history.pushState(null, '', '/');
        }
        document.title = HOMEPAGE_TITLE;
    }

    // Open slide-in details overlay
    openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
                e.preventDefault();
                const property = btn.getAttribute('data-property');
                openPropertyOverlay(property, true);
            }
        });
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => closeAllOverlays(true));
    });

    // Close overlays when clicking outside container scroll
    overlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeAllOverlays(true);
            }
        });
    });

    // Back / Forward button navigation
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.property) {
            openPropertyOverlay(e.state.property, false);
        } else {
            closeAllOverlays(false);
        }
    });

    // SUB-ROOM CATEGORY CHANGE BINDERS
    // 1. Banjara Hills
    const banjaraRoomTabs = document.querySelectorAll('#banjara-room-tabs .room-tab-btn');
    banjaraRoomTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            banjaraRoomTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const roomType = tab.getAttribute('data-type');
            
            // Toggle Spec blocks
            document.querySelectorAll('#overlay-banjara .specs-box').forEach(b => b.classList.remove('active'));
            document.getElementById(`banjara-specs-${roomType}`).classList.add('active');
            
            // Refresh Gallery
            populateOverlayGallery('banjara', roomType);
        });
    });

    // 2. Hill Plaza
    const hillRoomTabs = document.querySelectorAll('#hill-room-tabs .room-tab-btn');
    hillRoomTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            hillRoomTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const roomType = tab.getAttribute('data-type');
            
            // Toggle Spec blocks
            document.querySelectorAll('#overlay-hill .specs-box').forEach(b => b.classList.remove('active'));
            document.getElementById(`hill-specs-${roomType}`).classList.add('active');
            
            // Refresh Gallery
            populateOverlayGallery('hill', roomType);
        });
    });
}

// Populate the asymmetrical gallery collage in overlay panel
function populateOverlayGallery(property, subType = null) {
    const grid = document.getElementById(`gallery-grid-${property}`);
    if (!grid) return;

    let imageList = [];
    if (property === 'banjara') {
        const type = subType || document.querySelector('#banjara-room-tabs .room-tab-btn.active').getAttribute('data-type');
        imageList = PROPERTY_IMAGES.banjara[type] || [];
    } else if (property === 'hill') {
        const type = subType || document.querySelector('#hill-room-tabs .room-tab-btn.active').getAttribute('data-type');
        imageList = PROPERTY_IMAGES.hill[type] || [];
    } else {
        imageList = PROPERTY_IMAGES[property] || [];
    }

    // Save globally for lightbox index lookup
    currentOverlayImagePool = imageList;

    grid.innerHTML = ''; // clear grid

    imageList.forEach((img, index) => {
        const item = document.createElement('div');
        // Render Style E (Museum Label) frames in details gallery
        item.className = 'photo-frame frame-museum gallery-item';
        item.setAttribute('data-index', index);
        item.setAttribute('data-title', img.title);
        item.setAttribute('data-desc', img.desc);

        // Predefine mosaic layout sizes
        if (index === 0) {
            item.classList.add('wide');
        } else if (index === 1) {
            item.classList.add('tall');
        } else if (index === 4) {
            item.classList.add('wide');
        } else if (index === 6) {
            item.classList.add('tall');
        }

        const inner = document.createElement('div');
        inner.className = 'frame-inner';

        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'frame-image-wrapper';

        const imageEl = document.createElement('img');
        imageEl.src = decodeURIComponent(img.url);
        imageEl.alt = img.title;
        imageEl.loading = 'lazy';
        imgWrapper.appendChild(imageEl);

        const overlay = document.createElement('div');
        overlay.className = 'gallery-overlay-hint';
        overlay.innerHTML = `<span>VIEW SPACE</span>`;
        imgWrapper.appendChild(overlay);

        inner.appendChild(imgWrapper);

        const meta = document.createElement('div');
        meta.className = 'frame-meta';

        const num = document.createElement('span');
        num.className = 'frame-number';
        const countNum = index + 1;
        const padNum = countNum < 10 ? '0' + countNum : countNum;
        const totalLen = imageList.length;
        const padTotal = totalLen < 10 ? '0' + totalLen : totalLen;
        num.textContent = `${padNum} / ${padTotal}`;
        meta.appendChild(num);

        const heading = document.createElement('h4');
        heading.className = 'frame-title';
        heading.textContent = img.title.toUpperCase();
        meta.appendChild(heading);

        const paragraph = document.createElement('p');
        paragraph.className = 'frame-desc';
        paragraph.textContent = img.desc;
        meta.appendChild(paragraph);

        inner.appendChild(meta);
        item.appendChild(inner);

        // Lightbox trigger click
        item.addEventListener('click', () => {
            openLightbox(imageList, index);
        });

        grid.appendChild(item);
        
        // Track for viewport reveal transitions
        revealObserver.observe(item);
    });
}

/* --------------------------------------------------------------------------
   07. The Spaces Filter tabs
   -------------------------------------------------------------------------- */
function initSpacesFilter() {
    const tabs = document.querySelectorAll('.space-tab-btn');
    const items = document.querySelectorAll('.spaces-item');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const category = tab.getAttribute('data-category');

            items.forEach(item => {
                const itemCat = item.getAttribute('data-category');
                if (category === 'all' || itemCat === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Make spaces items trigger main lightbox
    items.forEach((item, index) => {
        item.addEventListener('click', () => {
            // Build temporary pool from all visible spaces items
            const visibleItems = Array.from(items).filter(i => i.style.display !== 'none');
            const pool = visibleItems.map(i => ({
                url: i.dataset.bg || i.style.backgroundImage.replace(/^url\(['"](.+)['"]\)/, '$1'),
                title: i.getAttribute('data-title') || 'BLIV Residence Space',
                desc: i.getAttribute('data-desc') || 'A comfortable space designed for modern living.'
            }));
            const activeIdx = visibleItems.indexOf(item);
            openLightbox(pool, activeIdx);
        });
    });
}

/* --------------------------------------------------------------------------
   08. Fullscreen Lightbox Gallery (Accessibility & Gesture controls)
   -------------------------------------------------------------------------- */
let activeLightboxPool = [];
let activeLightboxIdx = 0;

function initLightbox() {
    const lightbox = document.getElementById('lightbox-viewer');
    const closeBtn = document.getElementById('lightbox-close');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    if (!lightbox) return;

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showPrev() {
        if (activeLightboxIdx > 0) {
            activeLightboxIdx--;
            updateLightboxContent();
        } else {
            // Loop back to end
            activeLightboxIdx = activeLightboxPool.length - 1;
            updateLightboxContent();
        }
    }

    function showNext() {
        if (activeLightboxIdx < activeLightboxPool.length - 1) {
            activeLightboxIdx++;
            updateLightboxContent();
        } else {
            // Loop back to start
            activeLightboxIdx = 0;
            updateLightboxContent();
        }
    }

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);

    // Close when clicking empty dark zones
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content') || e.target.classList.contains('lightbox-figure')) {
            closeLightbox();
        }
    });

    // Keyboard bindings (Escape, Left Arrow, Right Arrow)
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            showPrev();
        } else if (e.key === 'ArrowRight') {
            showNext();
        }
    });

    // Touch Swipes (using standard PointerEvents)
    let startX = 0;
    const figure = lightbox.querySelector('.lightbox-figure');

    if (figure) {
        figure.addEventListener('pointerdown', (e) => {
            startX = e.clientX;
            figure.setPointerCapture(e.pointerId);
        });

        figure.addEventListener('pointerup', (e) => {
            const diffX = e.clientX - startX;
            // threshold swipe trigger
            if (Math.abs(diffX) > 60) {
                if (diffX > 0) {
                    showPrev(); // Swiped right -> prev image
                } else {
                    showNext(); // Swiped left -> next image
                }
            }
            figure.releasePointerCapture(e.pointerId);
        });
    }
}

function openLightbox(pool, index) {
    const lightbox = document.getElementById('lightbox-viewer');
    if (!lightbox) return;

    activeLightboxPool = pool;
    activeLightboxIdx = index;

    updateLightboxContent();
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function updateLightboxContent() {
    const img = document.getElementById('lightbox-img');
    const counter = document.getElementById('lightbox-counter');
    const title = document.getElementById('lightbox-title');
    const desc = document.getElementById('lightbox-desc');
    
    const activeItem = activeLightboxPool[activeLightboxIdx];
    if (!activeItem) return;

    // Transition crossfade effect
    img.style.opacity = '0';
    
    setTimeout(() => {
        // Decode encoded URL strings back to clean paths for image render if needed, or set directly
        img.src = decodeURIComponent(activeItem.url);
        img.alt = activeItem.title;
        counter.textContent = `${activeLightboxIdx + 1} / ${activeLightboxPool.length}`;
        title.textContent = activeItem.title;
        desc.textContent = activeItem.desc;
        img.style.opacity = '1';
    }, 150);
}

/* --------------------------------------------------------------------------
   09. Mobile Action Drawer Controller
   -------------------------------------------------------------------------- */
function openDrawer(type) {
    const drawer = document.getElementById('mobile-action-drawer');
    const title = document.getElementById('drawer-title');
    const body = document.getElementById('drawer-body-options');
    if (!drawer || !title || !body) return;

    const defaultMsg = encodeURIComponent("Hello BLIV Service Apartments, I would like to enquire about your serviced apartments in Hyderabad.");

    if (type === 'call') {
        title.textContent = 'CALL RESERVATIONS';
        body.innerHTML = `
            <a href="tel:+919989777863" class="drawer-option call-option">
                <span class="option-title">📞 CALL DESK A</span>
                <span class="option-val">+91 998-977-7863</span>
            </a>
            <a href="tel:+919177777312" class="drawer-option call-option">
                <span class="option-title">📞 CALL DESK B</span>
                <span class="option-val">+91 917-777-7312</span>
            </a>
        `;
    } else if (type === 'whatsapp') {
        title.textContent = 'WHATSAPP RESERVATIONS';
        body.innerHTML = `
            <a href="https://wa.me/919989777863?text=${defaultMsg}" target="_blank" rel="noopener noreferrer" class="drawer-option wa-option">
                <span class="option-title">💬 CHAT DESK A</span>
                <span class="option-val">+91 998-977-7863</span>
            </a>
            <a href="https://wa.me/919177777312?text=${defaultMsg}" target="_blank" rel="noopener noreferrer" class="drawer-option wa-option">
                <span class="option-title">💬 CHAT DESK B</span>
                <span class="option-val">+91 917-777-7312</span>
            </a>
        `;
    }

    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDrawer() {
    const drawer = document.getElementById('mobile-action-drawer');
    if (drawer) {
        drawer.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function initContactDrawer() {
    const callTrigger = document.getElementById('mobile-call-trigger');
    const waTrigger = document.getElementById('mobile-whatsapp-trigger');
    const closeBtn = document.getElementById('drawer-close-btn');
    const backdrop = document.getElementById('drawer-backdrop');

    if (callTrigger) {
        callTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            openDrawer('call');
        });
    }

    if (waTrigger) {
        waTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            openDrawer('whatsapp');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeDrawer);
    }

    if (backdrop) {
        backdrop.addEventListener('click', closeDrawer);
    }
}
