/* ==========================================================================
   BLIV Serviced Residences - Property Standalone Controller
   ========================================================================== */

// Global Intersection Observer for scroll reveals
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
    initScrollHeader();
    initMobileMenu();
    initStandaloneGallery();
    initLightbox();
    initRoomTabs();
    initShareAndCopy();
    initContactDrawer();

    // Trigger reveal observation for static elements on page load
    document.querySelectorAll('[data-scroll-reveal]').forEach(el => {
        revealObserver.observe(el);
    });
});

/* 01. Sticky Header */
function initScrollHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/* 02. Mobile Menu Overlay */
function initMobileMenu() {
    const toggle = document.getElementById('mobile-menu-toggle');
    const overlay = document.getElementById('mobile-nav-overlay');
    const links = document.querySelectorAll('.mobile-link');

    if (!toggle || !overlay) return;

    toggle.addEventListener('click', () => {
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
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            overlay.classList.remove('active');
            document.body.classList.remove('mobile-menu-active');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
}

/* 03. Dynamic Standalone Gallery Injection */
// We use the exact audit image structures
const PROPERTY_IMAGES = {
    baitu: [
        { url: "../Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_16_46%20PM.png", title: "Living Lounge", desc: "Spacious seating arrangement matching rich ivory textures." },
        { url: "../Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_18_17%20PM.png", title: "Formal Dining", desc: "Clean table settings designed for home dining." },
        { url: "../Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_20_02%20PM.png", title: "Master Bed Suite", desc: "Orthopedic bedding suite focusing on peaceful nights." },
        { url: "../Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_21_28%20PM.png", title: "Common Living Space", desc: "Spacious corridors and open layout designed for families." },
        { url: "../Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_23_20%20PM.png", title: "Guest Bedroom", desc: "Plush linens and minimalistic layout designed to settle in." },
        { url: "../Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_25_53%20PM.png", title: "Sofa Lounge Details", desc: "Warm ambient light filtering through custom glass doors." },
        { url: "../Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_27_29%20PM.png", title: "Dining Detail", desc: "Bespoke setups supporting long term residential stay." },
        { url: "../Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_29_14%20PM.png", title: "Fully Equipped Kitchen", desc: "Functional modern cabinets and refrigerator setup." },
        { url: "../Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_31_08%20PM.png", title: "Kitchen Prep Details", desc: "Equipped cooking space designed for everyday comfort." },
        { url: "../Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_32_31%20PM.png", title: "Bathroom details", desc: "Clean fixtures and continuous hot water systems." },
        { url: "../Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_35_14%20PM.png", title: "Living room TV angle", desc: "Installed smart entertainment layout." },
        { url: "../Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_38_39%20PM.png", title: "Bedroom storage", desc: "Bespoke wooden wardrobes and drawers." },
        { url: "../Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_40_34%20PM.png", title: "Bed side study workspace", desc: "Quiet workspace corner tailored for executives." },
        { url: "../Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_43_19%20PM.png", title: "Bathroom wash basin", desc: "Clean marble vanity mirrors." },
        { url: "../Baitu-l-%20Amaan/ChatGPT%20Image%20Aug%204,%202026,%2012_53_03%20PM.png", title: "Secondary bedroom layout", desc: "Soft dimmable lights for quiet sleep." }
    ],
    banjara: {
        "2bhk": [
            { url: "../Banjara%20Hills/Banjara%20Hilis%202BHK/ChatGPT%20Image%20Aug%204,%202026,%2001_19_32%20PM.png", title: "2BHK Living Room", desc: "Inviting seating space optimized for relaxation." },
            { url: "../Banjara%20Hills/Banjara%20Hilis%202BHK/ChatGPT%20Image%20Aug%204,%202026,%2001_21_45%20PM.png", title: "2BHK Living Room Angle 2", desc: "Broad layout configurations providing comfortable spacing." },
            { url: "../Banjara%20Hills/Banjara%20Hilis%202BHK/ChatGPT%20Image%20Aug%204,%202026,%2001_23_21%20PM.png", title: "2BHK Master Bed", desc: "Soft orthopedic pillows and clean sheets." },
            { url: "../Banjara%20Hills/Banjara%20Hilis%202BHK/ChatGPT%20Image%20Aug%204,%202026,%2001_24_45%20PM.png", title: "2BHK Bedroom Workspace", desc: "Work table and vanity arrangements." },
            { url: "../Banjara%20Hills/Banjara%20Hilis%202BHK/ChatGPT%20Image%20Aug%205,%202026,%2003_21_13%20PM.png", title: "2BHK Dining Corridor", desc: "Connecting halls styled with sand tones." },
            { url: "../Banjara%20Hills/Banjara%20Hilis%202BHK/ChatGPT%20Image%20Aug%205,%202026,%2003_22_36%20PM.png", title: "2BHK Modular Kitchen", desc: "Equipped cooking counter for family meals." },
            { url: "../Banjara%20Hills/Banjara%20Hilis%202BHK/ChatGPT%20Image%20Aug%205,%202026,%2003_23_48%20PM.png", title: "2BHK Bathroom detailing", desc: "Functional bathroom with modern fixtures." },
            { url: "../Banjara%20Hills/Banjara%20Hilis%202BHK/ChatGPT%20Image%20Aug%205,%202026,%2003_44_48%20PM.png", title: "2BHK Suite Overview", desc: "Premium serviced layout for short or long-stay visits." }
        ],
        "3bhk": [
            { url: "../Banjara%20Hills/Banjara%20hills%203BHK%20one%20common%20and%20one%20attached%20Bathroom/ChatGPT%20Image%20Aug%204,%202026,%2001_32_43%20AM.png", title: "3BHK Suite Living Area", desc: "Massive living hall designed with premium details." },
            { url: "../Banjara%20Hills/Banjara%20hills%203BHK%20one%20common%20and%20one%20attached%20Bathroom/ChatGPT%20Image%20Aug%204,%202026,%2001_34_20%20AM.png", title: "3BHK Dining Table", desc: "Broad dining setup next to the living lounge." },
            { url: "../Banjara%20Hills/Banjara%20hills%203BHK%20one%20common%20and%20one%20attached%20Bathroom/ChatGPT%20Image%20Aug%204,%202026,%2001_35_38%20AM.png", title: "3BHK Master Bedroom", desc: "Cozy primary bedroom with attached bathroom." },
            { url: "../Banjara%20Hills/Banjara%20hills%203BHK%20one%20common%20and%20one%20attached%20Bathroom/ChatGPT%20Image%20Aug%204,%202026,%2001_37_10%20AM.png", title: "3BHK Secondary Bedroom", desc: "Clean secondary bedroom for families." },
            { url: "../Banjara%20Hills/Banjara%20hills%203BHK%20one%20common%20and%20one%20attached%20Bathroom/ChatGPT%20Image%20Aug%204,%202026,%2001_38_40%20AM.png", title: "3BHK Guest Room", desc: "Quiet bedroom space designed for executive stays." },
            { url: "../Banjara%20Hills/Banjara%20hills%203BHK%20one%20common%20and%20one%20attached%20Bathroom/ChatGPT%20Image%20Aug%204,%202026,%2001_39_50%20AM.png", title: "3BHK Attached Bathroom", desc: "Clean tiles and continuous hot water supply." },
            { url: "../Banjara%20Hills/Banjara%20hills%203BHK%20one%20common%20and%20one%20attached%20Bathroom/ChatGPT%20Image%20Aug%204,%202026,%2001_48_22%20AM.png", title: "3BHK Kitchen Space", desc: "Practical kitchen equipped with microwave and refrigerator." }
        ]
    },
    hill: {
        "1bhk": [
            { url: "../Hill%20plaza-Shaikhpet/1BHK%20Shaikhpet/ChatGPT%20Image%20Aug%205,%202026,%2004_30_08%20PM.png", title: "1BHK Living Lounge", desc: "Inviting layout featuring wide landscape windows." },
            { url: "../Hill%20plaza-Shaikhpet/1BHK%20Shaikhpet/ChatGPT%20Image%20Aug%205,%202026,%2004_31_31%20PM.png", title: "1BHK Living Area view 2", desc: "Comfortable sofa seating layout close to transit metro." },
            { url: "../Hill%20plaza-Shaikhpet/1BHK%20Shaikhpet/ChatGPT%20Image%20Aug%205,%202026,%2004_33_17%20PM.png", title: "1BHK Bedroom suite", desc: "A cozy sleep setup for solo consultants." },
            { url: "../Hill%20plaza-Shaikhpet/1BHK%20Shaikhpet/ChatGPT%20Image%20Aug%205,%202026,%2004_36_26%20PM.png", title: "1BHK Executive Desk", desc: "Writing table optimized for remote work." },
            { url: "../Hill%20plaza-Shaikhpet/1BHK%20Shaikhpet/ChatGPT%20Image%20Aug%205,%202026,%2004_41_47%20PM.png", title: "1BHK Bathroom Details", desc: "Clean shower fixtures and geyser." }
        ],
        "single": [
            { url: "../Hill%20plaza-Shaikhpet/Single%20room/ChatGPT%20Image%20Aug%205,%202026,%2004_06_03%20PM.png", title: "Single Executive Room", desc: "Compact suite designed for short business commutes." },
            { url: "../Hill%20plaza-Shaikhpet/Single%20room/ChatGPT%20Image%20Aug%205,%202026,%2004_08_45%20PM.png", title: "Single Room layout", desc: "Minimalist wardrobe and comfortable bed setups." },
            { url: "../Hill%20plaza-Shaikhpet/Single%20room/ChatGPT%20Image%20Aug%205,%202026,%2004_11_28%20PM.png", title: "Single Room writing workspace", desc: "Equipped work corner to stay productive." },
            { url: "../Hill%20plaza-Shaikhpet/Single%20room/ChatGPT%20Image%20Aug%205,%202026,%2004_13_40%20PM.png", title: "Bathroom facility", desc: "Clean hygiene setups and toiletries." }
        ]
    },
    abbasi: [
        { url: "../Abbasi%20Tower%20Iram%20Manzil/Living%20Space.png", title: "Grand Living Lounge", desc: "Boasts elegant modern paneling and floor-to-ceiling glass doors." },
        { url: "../Abbasi%20Tower%20Iram%20Manzil/Bedrooms.png", title: "Primary Bedroom Suite", desc: "Customized orthopedic support bedding designed like luxury hotel suites." },
        { url: "../Abbasi%20Tower%20Iram%20Manzil/Bedrooms2.png", title: "Guest Bedroom Suite", desc: "Meticulously modeled bedroom suite with dimmable ambient mood lighting." },
        { url: "../Abbasi%20Tower%20Iram%20Manzil/Dining%20Table.png", title: "Formal Dining Space", desc: "Equipped dining layout featuring custom wood paneling and marble details." },
        { url: "../Abbasi%20Tower%20Iram%20Manzil/Dining%20Table2.png", title: "Dining Table Details", desc: "Curated setups designed for business dinners and family breakfast." },
        { url: "../Abbasi%20Tower%20Iram%20Manzil/Dining%20Experience.png", title: "Gastronomic Details", desc: "Comfortable dining layout presenting culinary comfort." },
        { url: "../Abbasi%20Tower%20Iram%20Manzil/Bathrooms.png", title: "Primary Marble Restroom", desc: "Spa-like marble restrooms fitted with high-pressure showers." },
        { url: "../Abbasi%20Tower%20Iram%20Manzil/Washroom.png", title: "Wash Basin Detailing", desc: "Marble wash area details and premium toiletries." },
        { url: "../Abbasi%20Tower%20Iram%20Manzil/Balcony.jpeg", title: "Private Balcony Lounge", desc: "A cozy pause above the city's rhythm." },
        { url: "../Abbasi%20Tower%20Iram%20Manzil/Work%20Space.png", title: "Integrated Executive Workspace", desc: "Distraction-free desk layout optimized for corporate stays." }
    ]
};

let activePropertyId = '';
let activePropertyPool = [];

function initStandaloneGallery() {
    const grid = document.getElementById('gallery-grid-standalone');
    if (!grid) return;

    activePropertyId = grid.getAttribute('data-property-id');
    populateGallery(activePropertyId);
}

function populateGallery(property, subType = null) {
    const grid = document.getElementById('gallery-grid-standalone');
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

    activePropertyPool = imageList;
    grid.innerHTML = '';

    imageList.forEach((img, index) => {
        const item = document.createElement('div');
        item.className = 'photo-frame frame-museum gallery-item';
        item.setAttribute('data-index', index);

        if (index === 0) item.classList.add('wide');
        else if (index === 1) item.classList.add('tall');
        else if (index === 4) item.classList.add('wide');
        else if (index === 6) item.classList.add('tall');

        const inner = document.createElement('div');
        inner.className = 'frame-inner';

        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'frame-image-wrapper';

        const imageEl = document.createElement('img');
        imageEl.src = img.url;
        imageEl.alt = img.title;
        imageEl.loading = 'lazy';
        imgWrapper.appendChild(imageEl);

        const overlayHint = document.createElement('div');
        overlayHint.className = 'gallery-overlay-hint';
        overlayHint.innerHTML = `<span>VIEW SPACE</span>`;
        imgWrapper.appendChild(overlayHint);

        inner.appendChild(imgWrapper);

        const meta = document.createElement('div');
        meta.className = 'frame-meta';

        const num = document.createElement('span');
        num.className = 'frame-number';
        const padIndex = (index + 1) < 10 ? '0' + (index + 1) : (index + 1);
        const padTotal = imageList.length < 10 ? '0' + imageList.length : imageList.length;
        num.textContent = `${padIndex} / ${padTotal}`;
        meta.appendChild(num);

        const titleEl = document.createElement('h4');
        titleEl.className = 'frame-title';
        titleEl.textContent = img.title.toUpperCase();
        meta.appendChild(titleEl);

        const descEl = document.createElement('p');
        descEl.className = 'frame-desc';
        descEl.textContent = img.desc;
        meta.appendChild(descEl);

        inner.appendChild(meta);
        item.appendChild(inner);

        item.addEventListener('click', () => {
            openLightbox(imageList, index);
        });

        grid.appendChild(item);
        revealObserver.observe(item);
    });
}

/* 04. Lightbox functionality */
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
        } else {
            activeLightboxIdx = activeLightboxPool.length - 1;
        }
        updateLightboxContent();
    }

    function showNext() {
        if (activeLightboxIdx < activeLightboxPool.length - 1) {
            activeLightboxIdx++;
        } else {
            activeLightboxIdx = 0;
        }
        updateLightboxContent();
    }

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content') || e.target.classList.contains('lightbox-figure')) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') showPrev();
        else if (e.key === 'ArrowRight') showNext();
    });

    // Touch support
    let startX = 0;
    const figure = lightbox.querySelector('.lightbox-figure');
    if (figure) {
        figure.addEventListener('pointerdown', (e) => {
            startX = e.clientX;
            figure.setPointerCapture(e.pointerId);
        });
        figure.addEventListener('pointerup', (e) => {
            const diffX = e.clientX - startX;
            if (Math.abs(diffX) > 60) {
                if (diffX > 0) showPrev();
                else showNext();
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

    img.style.opacity = '0';
    setTimeout(() => {
        img.src = activeItem.url;
        img.alt = activeItem.title;
        counter.textContent = `${activeLightboxIdx + 1} / ${activeLightboxPool.length}`;
        title.textContent = activeItem.title;
        desc.textContent = activeItem.desc;
        img.style.opacity = '1';
    }, 150);
}

/* 05. Room Category Tab Switches */
function initRoomTabs() {
    // 1. Banjara Hills
    const banjaraTabs = document.querySelectorAll('#banjara-room-tabs .room-tab-btn');
    banjaraTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            banjaraTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const type = tab.getAttribute('data-type');
            
            document.querySelectorAll('.specs-box').forEach(b => b.classList.remove('active'));
            const targetSpec = document.getElementById(`banjara-specs-${type}`);
            if (targetSpec) targetSpec.classList.add('active');
            
            populateGallery('banjara', type);
        });
    });

    // 2. Hill Plaza
    const hillTabs = document.querySelectorAll('#hill-room-tabs .room-tab-btn');
    hillTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            hillTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const type = tab.getAttribute('data-type');
            
            document.querySelectorAll('.specs-box').forEach(b => b.classList.remove('active'));
            const targetSpec = document.getElementById(`hill-specs-${type}`);
            if (targetSpec) targetSpec.classList.add('active');
            
            populateGallery('hill', type);
        });
    });
}

/* 06. Web Share API & Clipboard Copy */
function initShareAndCopy() {
    const shareBtn = document.getElementById('btn-share-property');
    const copyBtn = document.getElementById('btn-copy-property');
    const toast = document.getElementById('copy-toast');

    const currentUrl = window.location.href;
    const pageTitle = document.title;

    if (shareBtn) {
        if (navigator.share) {
            shareBtn.style.display = 'inline-flex';
            shareBtn.addEventListener('click', () => {
                navigator.share({
                    title: pageTitle,
                    text: 'Explore this premium serviced residence by BLIV Service Apartments.',
                    url: currentUrl
                }).catch(err => console.log('Share canceled', err));
            });
        } else {
            // Hide native share btn if not supported
            shareBtn.style.display = 'none';
        }
    }

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(currentUrl).then(() => {
                if (toast) {
                    toast.classList.add('active');
                    setTimeout(() => {
                        toast.classList.remove('active');
                    }, 2000);
                }
            }).catch(err => {
                console.error('Could not copy link', err);
            });
        });
    }
}

/* 07. Mobile Contact Drawer Selector */
function openDrawer(type) {
    const drawer = document.getElementById('mobile-action-drawer');
    const title = document.getElementById('drawer-title');
    const body = document.getElementById('drawer-body-options');
    if (!drawer || !title || !body) return;

    // Get customized message based on property
    const propNameMap = {
        'baitu': 'Baitu-l-Amaan',
        'banjara': 'Banjara Hills',
        'hill': 'Hill Plaza, Shaikhpet',
        'abbasi': 'Abbasi Tower, Irram Manzil'
    };
    
    let textStr = "your serviced apartments in Hyderabad.";
    if (propNameMap[activePropertyId]) {
        textStr = propNameMap[activePropertyId];
    }
    
    const prefilledText = encodeURIComponent(`Hello BLIV Service Apartments, I would like to enquire about ${textStr}.`);

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
            <a href="https://wa.me/919989777863?text=${prefilledText}" target="_blank" rel="noopener noreferrer" class="drawer-option wa-option">
                <span class="option-title">💬 CHAT DESK A</span>
                <span class="option-val">+91 998-977-7863</span>
            </a>
            <a href="https://wa.me/919177777312?text=${prefilledText}" target="_blank" rel="noopener noreferrer" class="drawer-option wa-option">
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
