// ============================================
// SHINING STORE - Premium E-Commerce JavaScript
// With Mobile UI + Auth Integration
// ============================================

// Product Data
let products = [];

// Helper to map JSON categories to our UI
// Helper to map JSON categories to our UI
function mapCategory(type, title) {
    const t = ((type || '') + ' ' + (title || '')).toLowerCase();
    if (t.includes('fashion')) return 'fashion';
    if (t.includes('shoes')) return 'shoes';
    if (t.includes('watch') && !t.includes('charger') && !t.includes('earbud')) return 'accessories'; // actual watches go to accessories, but chargers/earbuds containing "watch" go to electronics
    if (t.includes('earbuds') || t.includes('earbud') || t.includes('charger') || t.includes('phonecase') || t.includes('speaker') || t.includes('headphone') || t.includes('electronics') || t.includes('tech') || t.includes('smartwatch')) return 'electronics';
    if (t.includes('pet') || t.includes('dog') || t.includes('cat')) return 'pets';
    return 'accessories';
}

// Global Image Error Fallback Handler (100% reliable local images)
function handleImageError(img, category) {
    const fallbackImages = {
        'fashion': 'images/cat-fashion.jpg',
        'shoes': 'images/cat-shoes.jpg',
        'electronics': 'images/cat-electronics.jpg',
        'pets': 'images/cat-pets.jpg',
        'accessories': 'images/cat-accessories.jpg'
    };
    const cat = (category || 'fashion').toLowerCase();
    img.onerror = null;
    img.src = fallbackImages[cat] || fallbackImages['fashion'];
}
window.handleImageError = handleImageError;


// Persistent badge map: each product ID deterministically gets one badge (or none)
// Uses a seeded pattern so the same product always shows the same badge across all pages
function getBadge(id) {
    // Assign badges to ~50% of products using a consistent formula
    // null = no badge, so roughly every other product has one
    const slot = id % 10;
    if (slot === 0 || slot === 5) return 'Sale';
    if (slot === 1 || slot === 6) return 'Hot';
    if (slot === 2 || slot === 7) return 'New';
    if (slot === 3) return 'Best Seller';
    return null; // slots 4, 8, 9 = no badge
}

async function loadExtractedProducts() {
    try {
        const response = await fetch('shining-store-data/products-lightweight.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        products = data.products.map((p, index) => {
            const badge = getBadge(p.id);
            const price = parseFloat(p.minPrice) || (15 + index % 50);
            return {
                id: p.id,
                name: p.title,
                price: price,
                comparePrice: badge === 'Sale' ? (price * 1.3).toFixed(2) : null,
                category: mapCategory(p.productType, p.title),
                image: p.thumbnail || "images/cat-fashion.jpg",
                rating: (4.0 + (p.id % 10) / 10).toFixed(1),
                reviews: 10 + (p.id % 500),
                badge: badge,
                desc: p.title + ". Premium quality and design exclusively selected for you.",
                originalHandle: p.handle
            };
        });
    } catch (e) {
        console.error("Failed to load extracted products. Ensure local server is running.", e);
        products = [ { id: 1, name: "Fallback Item", price: 10, category: "dresses", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80", rating: 5.0, reviews: 1, badge: "New", desc: "Fallback item" } ];
    }
}

// State
let cart = JSON.parse(localStorage.getItem('shiningstore_cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('shiningstore_wishlist') || '[]');
let currentCurrency = localStorage.getItem('shiningstore_currency') || 'USD';
const EXCHANGE_RATE_INR = 83.5; // Approximation for USD to INR
let discount = 0;
const PROMO_CODES = { 'SHINE20': 0.20, 'WELCOME10': 0.10, 'WELCOME30': 0.30 };

// Currency Helper
function formatPrice(usdPrice) {
    if (currentCurrency === 'INR') {
        const inrPrice = usdPrice * EXCHANGE_RATE_INR;
        return '₹' + inrPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return '$' + parseFloat(usdPrice).toFixed(2);
}

window.formatPrice = formatPrice; // Make available globally for product.html

// DOM Elements
const productGrids = document.querySelectorAll('.product-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const categoryLinks = document.querySelectorAll('.nav-links a[data-category], .category-circle');
const searchInput = document.getElementById('searchInput');
let cartBadge = document.getElementById('cartBadge');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsContainer = document.getElementById('cartItems');
const subtotalEl = document.getElementById('subtotalAmount');
const discountRow = document.getElementById('discountRow');
const discountEl = document.getElementById('discountAmount');
const totalEl = document.getElementById('totalAmount');
const checkoutBtn = document.getElementById('checkoutBtn');
const promoInput = document.getElementById('promoInput');
const applyPromoBtn = document.getElementById('applyPromoBtn');

// Modals
const productModal = document.getElementById('productModal');
const productModalContent = document.getElementById('productModalContent');
const productModalOverlay = document.getElementById('productModalOverlay');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutModalOverlay = document.getElementById('checkoutModalOverlay');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutSuccess = document.getElementById('checkoutSuccess');

// Mobile Elements
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
const mobileMenuClose = document.getElementById('mobileMenuClose');
const mobileSearchBtn = document.getElementById('mobileSearchBtn');
const mobileSearchOverlay = document.getElementById('mobileSearchOverlay');
const mobileSearchField = document.getElementById('mobileSearchField');
const mobileSearchClose = document.getElementById('mobileSearchClose');
const mobileSearchResults = document.getElementById('mobileSearchResults');
const mobileCartBtn = document.getElementById('mobileCartBtn');
const mobileCartBadge = document.getElementById('mobileCartBadge');

// ============================================
// Premium Navbar Dynamic Injection
// ============================================
function injectNavbar() {
    const navbarEl = document.getElementById('navbar');
    if (!navbarEl) return;

    const currentCurrencyStr = localStorage.getItem('shiningstore_currency') || 'USD';

    navbarEl.innerHTML = `
        <div class="announcement-bar-premium" id="announcementBar">
            <span>Become a Seller on Shining Store — Reach millions of customers worldwide. <a href="seller-register.html" style="color: var(--color-accent); font-weight: 600; text-decoration: underline; text-underline-offset: 2px;">Start Selling →</a></span>
            <button class="announcement-close-btn" id="closeAnnouncement"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <nav class="navbar-premium" id="mainNavbar">
            <div class="navbar-premium-container">
                <!-- Logo -->
                <a href="index.html" class="navbar-premium-logo">
                    <span class="logo-circle">Logo</span>
                    <span class="logo-text">SHINING STORE</span>
                </a>

                <!-- Links -->
                <div class="navbar-premium-links">
                    <a href="index.html#trending" class="navbar-premium-link">New Arrivals</a>
                    <a href="category.html?cat=fashion" class="navbar-premium-link" data-filter="fashion">Fashion</a>
                    <a href="category.html?cat=shoes" class="navbar-premium-link" data-filter="shoes">Shoes</a>
                    <a href="category.html?cat=electronics" class="navbar-premium-link" data-filter="electronics">Electronics</a>
                    <a href="category.html?cat=pets" class="navbar-premium-link" data-filter="pets">Pets</a>
                    <a href="category.html?cat=accessories" class="navbar-premium-link" data-filter="accessories">Accessories</a>
                </div>

                <!-- Actions -->
                <div class="navbar-premium-actions">
                    <!-- Currency selector -->
                    <div class="navbar-premium-currency" id="currencySelectorPremium">
                        <button class="currency-trigger" id="currencyToggleBtn">
                            <span class="current-currency-display">${currentCurrencyStr === 'USD' ? '$ USD' : '₹ INR'}</span> <i class="fa-solid fa-chevron-down"></i>
                        </button>
                        <div class="currency-dropdown-new hidden" id="currencyDropdown">
                            <button class="currency-option" data-currency="USD">$ USD</button>
                            <button class="currency-option" data-currency="INR">₹ INR</button>
                        </div>
                    </div>

                    <!-- Search Button -->
                    <button class="navbar-premium-action-btn" id="searchToggleBtn" aria-label="Search">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </button>

                    <!-- Wishlist Button -->
                    <button class="navbar-premium-action-btn" id="wishlistBtn" aria-label="Wishlist">
                        <i class="fa-regular fa-heart"></i>
                        <span class="navbar-premium-badge hidden" id="wishlistBadge">0</span>
                    </button>

                    <!-- Cart Button -->
                    <button class="navbar-premium-action-btn" id="cartOpenBtn" aria-label="Cart">
                        <i class="fa-solid fa-bag-shopping"></i>
                        <span class="navbar-premium-badge hidden" id="cartBadge">0</span>
                    </button>

                    <!-- Account Button -->
                    <button class="navbar-premium-action-btn" id="accountBtn" aria-label="Account">
                        <i class="fa-regular fa-user" id="accountIcon"></i>
                    </button>
                </div>
            </div>
        </nav>
    `;

    // Re-assign global elements that we injected
    cartBadge = document.getElementById('cartBadge');

    // Add close announcement listener
    document.getElementById('closeAnnouncement')?.addEventListener('click', () => {
        const bar = document.getElementById('announcementBar');
        if (bar) {
            bar.style.transform = 'translateY(-100%)';
            bar.style.opacity = '0';
            setTimeout(() => { bar.style.display = 'none'; }, 350);
        }
        const navbar = document.getElementById('navbar');
        if (navbar) {
            navbar.classList.add('no-announcement');
            navbar.style.top = '0';
        }
    });
}

// ============================================
// Auth Modal Dynamic Injection
// ============================================
function injectAuthModal() {
    if (document.getElementById('authModal')) return; // Already exists

    const html = `
        <div class="auth-overlay" id="authOverlay"></div>
        <div class="auth-modal" id="authModal">
            <button class="auth-close" id="authCloseBtn"><i class="fa-solid fa-xmark"></i></button>
            <div class="auth-header">
                <h3 id="authTitle">Welcome Back</h3>
                <p id="authSubtitle">Sign in to access your account</p>
            </div>
            
            <div class="auth-tabs">
                <button class="auth-tab active" data-tab="login">Login</button>
                <button class="auth-tab" data-tab="signup">Sign Up</button>
            </div>

            <form id="authForm" class="auth-form">
                <div class="input-group" id="nameGroup" style="display:none;">
                    <i class="fa-regular fa-user"></i>
                    <input type="text" id="authName" placeholder="Full Name">
                </div>
                <div class="input-group">
                    <i class="fa-regular fa-envelope"></i>
                    <input type="email" id="authEmail" placeholder="Email Address" required>
                </div>
                <div class="input-group">
                    <i class="fa-solid fa-lock"></i>
                    <input type="password" id="authPassword" placeholder="Password" required>
                </div>
                <div class="auth-options" id="authOptions">
                    <label><input type="checkbox"> Remember me</label>
                    <a href="#" class="forgot-pwd">Forgot Password?</a>
                </div>
                <button type="submit" class="btn btn-primary" style="width:100%; border-radius:var(--radius-pill); font-size:0.9rem;" id="authSubmitBtn">SIGN IN</button>
            </form>

            <div class="auth-divider"><span>OR</span></div>
            <div class="auth-socials">
                <button class="social-btn"><i class="fa-brands fa-google"></i> Google</button>
                <button class="social-btn"><i class="fa-brands fa-apple"></i> Apple</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
}

// ============================================
// Initialization
// ============================================
async function init() {
    // Inject dynamic premium navbar and auth modal
    injectNavbar();
    injectAuthModal();

    await loadExtractedProducts();

    // Inject mock sizes and smart colors for advanced filtering
    const allColors = ['black', 'white', 'red', 'blue', 'beige', 'pink', 'green', 'yellow', 'brown', 'grey'];
    const sizes = ['XS', 'S', 'M', 'L', 'XL'];
    products.forEach(p => {
        if (!p.colors) {
            let foundColors = allColors.filter(c => p.name.toLowerCase().includes(c));
            if (foundColors.length === 0) foundColors = [allColors[p.id % allColors.length]];
            p.colors = foundColors;
        }
        if (!p.sizes) {
            p.sizes = sizes.slice(0, (p.id % 3) + 2);
        }
    });

    if (productGrids.length > 0 && typeof renderProducts === 'function') {
        // On homepage: only show first PAGE_SIZE products upfront (faster first paint)
        renderProducts(products);
    }
    
    // Dispatch event so individual pages can initialize
    document.dispatchEvent(new Event('productsLoaded'));

    setupEventListeners();
    updateCartUI();
    updateWishlistUI();
    initCarousel();
    initScrollEffects();
    initMobileMenu();
    initMobileSearch();
    initMobileBottomNav();
    updateAuthUI();
    initAdvancedFilters();
    initMobileFiltersAndSort();
}

// ============================================
// Auth UI Update (check login state)
// ============================================
function updateAuthUI() {
    try {
        const session = JSON.parse(localStorage.getItem('shiningstore_session'));
        if (session) {
            // Update account icon to show logged-in state
            const accountBtn = document.getElementById('accountBtn');
            if (accountBtn) {
                const icon = accountBtn.querySelector('i');
                if (icon) { icon.classList.remove('fa-regular'); icon.classList.add('fa-solid'); }
                accountBtn.setAttribute('data-tooltip', session.name);
            }
            // Update mobile menu user section
            const mobileUserName = document.getElementById('mobileUserName');
            const mobileUserAvatar = document.getElementById('mobileUserAvatar');
            if (mobileUserName) mobileUserName.textContent = session.name;
            if (mobileUserAvatar) mobileUserAvatar.innerHTML = session.name.charAt(0).toUpperCase();
        }
    } catch (e) { /* not logged in */ }
}

// ============================================
// Mobile Hamburger Menu
// ============================================
function initMobileMenu() {
    if (!hamburgerBtn || !mobileMenu || !mobileMenuOverlay) return;

    function openMobileMenu() {
        hamburgerBtn.classList.add('active');
        mobileMenu.classList.add('active');
        mobileMenuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        hamburgerBtn.classList.remove('active');
        mobileMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    hamburgerBtn.addEventListener('click', openMobileMenu);
    mobileMenuClose?.addEventListener('click', closeMobileMenu);
    mobileMenuOverlay.addEventListener('click', closeMobileMenu);

    // Mobile menu nav links
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const category = link.dataset.category;
            if (category) {
                e.preventDefault();
                closeMobileMenu();
                setTimeout(() => {
                    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
                    filterBtns.forEach(b => b.classList.remove('active'));
                    const targetBtn = Array.from(filterBtns).find(b => b.dataset.filter === category);
                    if (targetBtn) targetBtn.classList.add('active');
                    if (category === 'all') {
                        renderProducts(products);
                    } else {
                        renderProducts(products.filter(p => p.category === category));
                    }
                }, 300);
            } else if (link.dataset.section === 'home') {
                e.preventDefault();
                closeMobileMenu();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                closeMobileMenu();
            }
        });
    });

    // Mobile menu search
    const mobileMenuSearchInput = document.getElementById('mobileSearchInput');
    if (mobileMenuSearchInput) {
        mobileMenuSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length > 0) {
                closeMobileMenu();
                setTimeout(() => {
                    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
                    filterBtns.forEach(b => b.classList.remove('active'));
                    filterBtns[0]?.classList.add('active');
                    renderProducts(products.filter(p =>
                        p.name.toLowerCase().includes(query) ||
                        p.category.toLowerCase().includes(query)
                    ));
                }, 300);
            }
        });
    }
}

// ============================================
// Mobile Search Overlay
// ============================================
function initMobileSearch() {
    if (!mobileSearchBtn || !mobileSearchOverlay) return;

    mobileSearchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        mobileSearchOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        setTimeout(() => mobileSearchField?.focus(), 100);
    });

    mobileSearchClose?.addEventListener('click', () => {
        mobileSearchOverlay.classList.add('hidden');
        document.body.style.overflow = '';
        if (mobileSearchField) mobileSearchField.value = '';
        if (mobileSearchResults) mobileSearchResults.innerHTML = '<p class="mobile-search-hint">Type to search for dresses, tops, outerwear...</p>';
    });

    // Live search
    let mobileSearchTimeout;
    mobileSearchField?.addEventListener('input', (e) => {
        clearTimeout(mobileSearchTimeout);
        const query = e.target.value.toLowerCase().trim();

        mobileSearchTimeout = setTimeout(() => {
            if (!query) {
                mobileSearchResults.innerHTML = '<p class="mobile-search-hint">Type to search for dresses, tops, outerwear...</p>';
                return;
            }

            const results = products.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query) ||
                p.desc.toLowerCase().includes(query)
            );

            if (results.length === 0) {
                mobileSearchResults.innerHTML = '<p class="mobile-search-hint">No products found. Try a different search.</p>';
                return;
            }

            mobileSearchResults.innerHTML = results.map(p => `
                <div class="mobile-search-item" onclick="mobileSearchSelect(${p.id})">
                    <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="handleImageError(this, '${p.category}')">
                    <div class="mobile-search-item-info">
                        <div class="mobile-search-item-name">${p.name}</div>
                        <div class="mobile-search-item-price">$${p.price.toFixed(2)}</div>
                    </div>
                </div>
            `).join('');
        }, 200);
    });
}

function mobileSearchSelect(id) {
    // Close search overlay and open product modal
    mobileSearchOverlay?.classList.add('hidden');
    document.body.style.overflow = '';
    openProductModal(id);
}

// ============================================
// Mobile Bottom Navigation
// ============================================
function initMobileBottomNav() {
    if (!mobileCartBtn) return;

    mobileCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleCart(true);
    });

    // Highlight active tab on scroll
    const sections = { home: 0, shop: document.getElementById('shop')?.offsetTop || 0 };

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY + 200;
        const bottomNavItems = document.querySelectorAll('.bottom-nav-item');

        bottomNavItems.forEach(item => item.classList.remove('active'));

        if (scrollY >= sections.shop) {
            document.querySelector('.bottom-nav-item[data-nav="shop"]')?.classList.add('active');
        } else {
            document.querySelector('.bottom-nav-item[data-nav="home"]')?.classList.add('active');
        }
    }, { passive: true });
}

// ============================================
// Scroll Effects
// ============================================
function initScrollEffects() {
    const navbar = document.getElementById('navbar');
    const announcementBar = document.getElementById('announcementBar');
    const premiumNav = document.getElementById('mainNavbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar?.classList.add('scrolled');
            if (announcementBar && !navbar?.classList.contains('no-announcement')) {
                navbar.style.top = '-40px';
            }
        } else {
            navbar?.classList.remove('scrolled');
            if (navbar) navbar.style.top = '0';
        }
    }, { passive: true });

    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.category-section, .lookbook-banner, .social-proof, .instagram-section').forEach(el => {
        observer.observe(el);
    });
}

// ============================================
// Hero Carousel
// ============================================
let currentSlide = 0;
let carouselTimer = null;

function initCarousel() {
    const track = document.getElementById('carouselTrack');
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');

    if (!track || slides.length === 0) return;

    function goToSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        currentSlide = index;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        slides.forEach(s => s.classList.remove('active'));
        slides[currentSlide].classList.add('active');
        dots.forEach(d => d.classList.remove('active'));
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    }

    function resetTimer() {
        if (carouselTimer) clearInterval(carouselTimer);
        carouselTimer = setInterval(() => goToSlide(currentSlide + 1), 6000);
    }

    prevBtn?.addEventListener('click', () => { goToSlide(currentSlide - 1); resetTimer(); });
    nextBtn?.addEventListener('click', () => { goToSlide(currentSlide + 1); resetTimer(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { goToSlide(i); resetTimer(); }));

    // Touch swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? goToSlide(currentSlide + 1) : goToSlide(currentSlide - 1);
            resetTimer();
        }
    }, { passive: true });

    resetTimer();
}

// ============================================
// Render Products  (fast batch innerHTML)
// ============================================
const PAGE_SIZE = 24;   // cards shown per page
let _renderAllItems = [];
let _renderedCount  = 0;

function _buildCardHTML(product) {
    const isWished = wishlist.includes(product.id);
    const badgeHTML = product.badge
        ? `<span class="premium-badge premium-badge--${product.badge === 'New' ? 'new' : 'default'}">${product.badge}</span>`
        : '';
    const pINR = Math.round(product.price * EXCHANGE_RATE_INR).toLocaleString('en-IN');
    const cINR = product.comparePrice ? Math.round(product.comparePrice * EXCHANGE_RATE_INR).toLocaleString('en-IN') : null;
    let priceHTML = `<span class="premium-price">₹${pINR}</span>`;
    if (cINR) priceHTML += `<span class="premium-compare-price">₹${cINR}</span>`;
    const categoryLabel = (product.category || 'fashion').toUpperCase();
    const heartCls = isWished ? 'fa-solid' : 'fa-regular';
    const heartStyle = isWished ? 'style="color: var(--color-accent);"' : '';
    const productUrl = `product.html?id=${product.id}`;
    return `<div class="product-card fade-in premium-card">
        <div class="product-img-wrapper premium-img-wrapper" style="position:relative;">
            <a href="${productUrl}" style="display:block;width:100%;height:100%;">
                <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="handleImageError(this,'${product.category}')">
            </a>
            ${badgeHTML}
            <button class="premium-wishlist-btn" onclick="toggleWishlist(${product.id},this,event)" aria-label="Add to wishlist">
                <i class="${heartCls} fa-heart" ${heartStyle}></i>
            </button>
            <div class="premium-quick-actions" onclick="event.stopPropagation()">
                <button onclick="addToCart(${product.id},event)">Add to Cart</button>
            </div>
        </div>
        <p class="premium-category-label">${categoryLabel}</p>
        <a href="${productUrl}" class="product-name premium-name" style="text-decoration:none;">${product.name}</a>
        <a href="${productUrl}" class="premium-price-container" style="text-decoration:none;">${priceHTML}</a>
    </div>`;
}

function _appendMoreCards(grid) {
    const batch = _renderAllItems.slice(_renderedCount, _renderedCount + PAGE_SIZE);
    if (batch.length === 0) return;
    grid.insertAdjacentHTML('beforeend', batch.map(_buildCardHTML).join(''));
    _renderedCount += batch.length;

    // Show/hide load-more button
    let btn = document.getElementById('loadMoreBtn');
    if (_renderedCount >= _renderAllItems.length) {
        if (btn) btn.style.display = 'none';
    } else {
        if (!btn) {
            const wrapper = grid.parentElement || grid;
            const b = document.createElement('div');
            b.style.cssText = 'text-align:center;padding:2rem 0;grid-column:1/-1;';
            b.innerHTML = '<button id="loadMoreBtn" class="btn btn-outline" style="padding:0.75rem 2.5rem;font-weight:600;">Load More</button>';
            wrapper.appendChild(b);
            document.getElementById('loadMoreBtn').addEventListener('click', () => _appendMoreCards(grid));
        } else {
            btn.style.display = '';
        }
    }
}

function renderProducts(items) {
    productGrids.forEach(grid => {
        _renderAllItems = items;
        _renderedCount  = 0;

        // remove old load-more button
        const oldBtn = document.getElementById('loadMoreBtn');
        if (oldBtn) oldBtn.closest('div')?.remove();

        if (!items.length) {
            grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:4rem 0;font-size:1.1rem;">No products found.</p>';
            return;
        }

        grid.innerHTML = '';
        _appendMoreCards(grid);
    });
}

// ============================================
// Wishlist Toggle
// ============================================
function toggleWishlist(id, btn, event) {
    if (event) event.stopPropagation();
    const icon = btn.querySelector('i');
    const isWishlisted = wishlist.includes(id);

    if (isWishlisted) {
        wishlist = wishlist.filter(itemId => itemId !== id);
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
        icon.style.color = '';
    } else {
        wishlist.push(id);
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
        icon.style.color = '#d4736d';
        btn.style.transform = 'scale(1.3)';
        setTimeout(() => { btn.style.transform = 'scale(1)'; }, 200);
    }
    localStorage.setItem('shiningstore_wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
    updateWishlistDrawer();
}

function updateWishlistUI() {
    const wishlistBadge = document.getElementById('wishlistBadge');
    if (wishlistBadge) {
        wishlistBadge.innerText = wishlist.length;
        wishlist.length > 0 ? wishlistBadge.classList.remove('hidden') : wishlistBadge.classList.add('hidden');
    }
}

function updateWishlistDrawer() {
    const container = document.getElementById('wishlistItems');
    const count = document.getElementById('wishlistCount');
    if (!container) return;
    if (count) count.textContent = wishlist.length;

    if (wishlist.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:2rem; color:#767676;"><i class="fa-regular fa-heart" style="font-size:3rem; margin-bottom:1rem; display:block; color:#ddd;"></i><p>Your wishlist is empty.</p></div>';
        return;
    }

    container.innerHTML = wishlist.map(id => {
        const p = products.find(pr => pr.id === id);
        if (!p) return '';
        return `
            <div style="display:flex; gap:1rem; padding:1rem 0; border-bottom:1px solid var(--border-light);">
                <a href="product.html?id=${p.id}"><img src="${p.image}" alt="${p.name}" style="width:70px; height:90px; object-fit:cover; border-radius:6px;" onerror="handleImageError(this, '${p.category}')"></a>
                <div style="flex:1;">
                    <a href="product.html?id=${p.id}" style="font-weight:600; font-size:0.88rem; color:var(--text-main); display:block;">${p.name}</a>
                    <div style="font-weight:700; margin-top:0.3rem;">${formatPrice(p.price)}</div>
                    <button onclick="addToCart(${p.id}); event.stopPropagation();" style="margin-top:0.5rem; background:var(--primary); color:white; border:none; padding:0.4rem 1rem; border-radius:4px; font-size:0.75rem; cursor:pointer; font-weight:600;">ADD TO CART</button>
                </div>
                <button onclick="removeFromWishlist(${p.id})" style="background:none;border:none;cursor:pointer;color:#d4736d;font-size:1.1rem;align-self:start;padding-top:0.5rem;"><i class="fa-solid fa-heart"></i></button>
            </div>
        `;
    }).join('');
}

function removeFromWishlist(id) {
    wishlist = wishlist.filter(w => w !== id);
    localStorage.setItem('shiningstore_wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
    updateWishlistDrawer();
}

function toggleWishlistDrawer(forceOpen) {
    const drawer = document.getElementById('wishlistDrawer');
    const overlay = document.getElementById('wishlistOverlay');
    if (!drawer || !overlay) return;
    updateWishlistDrawer();
    if (forceOpen === true) {
        drawer.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        const isOpen = drawer.classList.contains('active');
        drawer.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = isOpen ? '' : 'hidden';
    }
}

// ============================================
// Event Listeners
// ============================================
function setupEventListeners() {
    // Announcement Bar
    document.getElementById('closeAnnouncement')?.addEventListener('click', (e) => {
        const bar = e.target.closest('.announcement-bar');
        bar.style.transform = 'translateY(-100%)';
        bar.style.opacity = '0';
        setTimeout(() => { bar.style.display = 'none'; }, 350);
    });

    // Currency Switcher Logic
    const currencyBtns = document.querySelectorAll('.currency-option');
    currencyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const newCurrency = e.target.dataset.currency;
            if (newCurrency && newCurrency !== currentCurrency) {
                currentCurrency = newCurrency;
                localStorage.setItem('shiningstore_currency', currentCurrency);
                
                // Update UI text for dropdown
                const currencyDisplays = document.querySelectorAll('.current-currency-display');
                currencyDisplays.forEach(el => {
                    el.textContent = currentCurrency === 'USD' ? '$ USD' : '₹ INR';
                });

                // Re-render everything
                if (typeof renderProducts === 'function') {
                    // Find active category
                    const activeFilter = document.querySelector('.filter-btn.active');
                    const category = activeFilter ? activeFilter.dataset.filter : 'all';
                    category === 'all' ? renderProducts(products) : renderProducts(products.filter(p => p.category === category));
                }
                updateCartUI();
                updateWishlistDrawer();
                
                // If on product page, it handles its own re-render via custom event or reload
                window.dispatchEvent(new Event('currencyChanged'));
            }
        });
    });

    // (Advanced Filtering Logic moved to global scope)

    // Category Links (Top nav and category circles)
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const category = link.dataset.filter || link.dataset.category;
            if (category) {
                // Navigate to category page instead of scrolling
                e.preventDefault();
                window.location.href = `category.html?cat=${category}`;
            }
        });
    });

    // Desktop Search - Professional Dropdown
    const searchToggleBtn = document.getElementById('searchToggleBtn');
    const searchDropdown = document.getElementById('searchDropdown');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchCloseBtn = document.getElementById('searchCloseBtn');
    const searchInputEl = document.getElementById('searchInput');
    const searchResultsEl = document.getElementById('searchResults');

    function openSearch() {
        searchDropdown?.classList.remove('hidden');
        setTimeout(() => searchDropdown?.classList.add('active'), 10);
        searchOverlay?.classList.add('active');
        setTimeout(() => searchInputEl?.focus(), 200);
    }

    function closeSearch() {
        searchDropdown?.classList.remove('active');
        searchOverlay?.classList.remove('active');
        setTimeout(() => {
            searchDropdown?.classList.add('hidden');
            if (searchInputEl) searchInputEl.value = '';
            if (searchResultsEl) searchResultsEl.innerHTML = `
                <div class="search-trending">
                    <h4>Trending Searches</h4>
                    <div class="search-tags">
                        <a href="#" class="search-tag" data-query="dresses">Dresses</a>
                        <a href="#" class="search-tag" data-query="tops">Tops</a>
                        <a href="#" class="search-tag" data-query="outerwear">Outerwear</a>
                        <a href="#" class="search-tag" data-query="activewear">Activewear</a>
                        <a href="#" class="search-tag" data-query="jeans">Jeans</a>
                        <a href="#" class="search-tag" data-query="shoes">Shoes</a>
                    </div>
                </div>`;
            bindSearchTags();
        }, 300);
    }

    searchToggleBtn?.addEventListener('click', openSearch);
    searchCloseBtn?.addEventListener('click', closeSearch);
    searchOverlay?.addEventListener('click', closeSearch);

    // Live search with suggestions
    let searchDebounce;
    searchInputEl?.addEventListener('input', (e) => {
        clearTimeout(searchDebounce);
        const query = e.target.value.toLowerCase().trim();
        
        searchDebounce = setTimeout(() => {
            if (!query) {
                searchResultsEl.innerHTML = `
                    <div class="search-trending">
                        <h4>Trending Searches</h4>
                        <div class="search-tags">
                            <a href="#" class="search-tag" data-query="dresses">Dresses</a>
                            <a href="#" class="search-tag" data-query="tops">Tops</a>
                            <a href="#" class="search-tag" data-query="outerwear">Outerwear</a>
                            <a href="#" class="search-tag" data-query="activewear">Activewear</a>
                            <a href="#" class="search-tag" data-query="jeans">Jeans</a>
                            <a href="#" class="search-tag" data-query="shoes">Shoes</a>
                        </div>
                    </div>`;
                bindSearchTags();
                return;
            }

            const results = products.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query) ||
                p.desc.toLowerCase().includes(query)
            ).slice(0, 6);

            if (results.length === 0) {
                searchResultsEl.innerHTML = `
                    <div style="text-align:center; padding:2rem; color:var(--text-muted);">
                        <i class="fa-solid fa-search" style="font-size:2rem; margin-bottom:1rem; display:block; color:#ddd;"></i>
                        <p>No products found for "<strong>${query}</strong>"</p>
                        <p style="font-size:0.85rem; margin-top:0.5rem;">Try searching for dresses, tops, outerwear...</p>
                    </div>`;
                return;
            }

            searchResultsEl.innerHTML = `
                <h4 style="font-size:0.75rem; text-transform:uppercase; letter-spacing:2px; color:var(--text-muted); margin-bottom:1rem; font-weight:600;">
                    ${results.length} result${results.length > 1 ? 's' : ''} for "${query}"
                </h4>
                ${results.map(p => `
                    <a href="product.html?id=${p.id}" class="search-product-item">
                        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="handleImageError(this, '${p.category}')">
                        <div class="search-product-info">
                            <div class="cat">${p.category}</div>
                            <div class="name">${p.name}</div>
                        </div>
                        <div class="search-product-info">
                            <div class="price">${formatPrice(p.price)}</div>
                        </div>
                    </a>
                `).join('')}
                <div style="text-align:center; margin-top:1rem;">
                    <button class="btn btn-outline" style="font-size:0.75rem; padding:0.6rem 1.5rem;" onclick="searchViewAll('${query}')">View All Results</button>
                </div>
            `;
        }, 200);
    });

    // Search tags
    function bindSearchTags() {
        document.querySelectorAll('.search-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.preventDefault();
                const query = tag.dataset.query;
                closeSearch();
                setTimeout(() => {
                    document.getElementById('shop-desktop')?.scrollIntoView({ behavior: 'smooth' });
                    filterBtns.forEach(b => b.classList.remove('active'));
                    const targetBtn = Array.from(filterBtns).find(b => b.dataset.filter === query);
                    if (targetBtn) targetBtn.classList.add('active');
                    renderProducts(products.filter(p => p.category === query));
                }, 350);
            });
        });
    }
    bindSearchTags();

    // Cart
    document.getElementById('cartOpenBtn')?.addEventListener('click', toggleCart);
    document.getElementById('cartCloseBtn')?.addEventListener('click', toggleCart);
    cartOverlay?.addEventListener('click', toggleCart);

    // Wishlist Drawer
    document.getElementById('wishlistBtn')?.addEventListener('click', () => toggleWishlistDrawer(true));
    document.getElementById('wishlistCloseBtn')?.addEventListener('click', () => toggleWishlistDrawer());
    document.getElementById('wishlistOverlay')?.addEventListener('click', () => toggleWishlistDrawer());

    // Modals
    document.getElementById('productModalClose')?.addEventListener('click', () => closeModal(productModal, productModalOverlay));
    productModalOverlay?.addEventListener('click', () => closeModal(productModal, productModalOverlay));
    document.getElementById('checkoutModalClose')?.addEventListener('click', () => closeModal(checkoutModal, checkoutModalOverlay));
    checkoutModalOverlay?.addEventListener('click', () => closeModal(checkoutModal, checkoutModalOverlay));

    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (cartDrawer?.classList.contains('active')) toggleCart();
            closeModal(productModal, productModalOverlay);
            closeModal(checkoutModal, checkoutModalOverlay);
            if (mobileMenu?.classList.contains('active')) {
                hamburgerBtn?.classList.remove('active');
                mobileMenu.classList.remove('active');
                mobileMenuOverlay?.classList.remove('active');
                document.body.style.overflow = '';
            }
            if (mobileSearchOverlay && !mobileSearchOverlay.classList.contains('hidden')) {
                mobileSearchOverlay.classList.add('hidden');
                document.body.style.overflow = '';
            }
        }
    });

    // Mobile Search
    const mobileSearchBtn = document.getElementById('mobileSearchBtn');
    mobileSearchBtn?.addEventListener('click', () => {
        openSearch();
    });

    // Promo
    applyPromoBtn?.addEventListener('click', applyPromo);
    promoInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); applyPromo(); } });

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const session = localStorage.getItem('shiningstore_session');
            if (!session) {
                toggleAuthModal(true);
                showToast('Please login or sign up to proceed to checkout', true);
            } else {
                window.location.href = 'checkout.html';
            }
        });
    }

    // Checkout
    checkoutForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        checkoutForm.classList.add('hidden');
        checkoutSuccess.classList.remove('hidden');
        cart = [];
        discount = 0;
        updateCartUI();
    });

    document.getElementById('continueShoppingBtn')?.addEventListener('click', () => closeModal(checkoutModal, checkoutModalOverlay));

    // Newsletter
    document.getElementById('newsletterForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> SUBSCRIBED';
        btn.style.background = '#5cb885';
        setTimeout(() => { btn.innerHTML = original; btn.style.background = ''; e.target.reset(); }, 2500);
    });
}

// ============================================
// Advanced Filtering Logic
// ============================================
function initAdvancedFilters() {
    const priceRange = document.getElementById('priceRange');
    const priceMaxDisplay = document.getElementById('priceMaxDisplay');
    const catCheckboxes = document.querySelectorAll('.cat-filter');
    const sizeBtns = document.querySelectorAll('.size-filter-btn');
    const colorSwatches = document.querySelectorAll('.color-swatch');
    const clearBtn = document.getElementById('clearFiltersBtn');
    const activeFiltersContainer = document.getElementById('activeFiltersContainer');
    const noProductsMsg = document.getElementById('noProductsMsg');
    const mainGrid = document.getElementById('mainProductGrid');

    if (!priceRange) return;

    let activeCats = [];
    let activeSize = null;
    let activeColor = null;
    
    // Dynamically set price range based on actual products
    const absoluteMaxPrice = products.length > 0 ? Math.ceil(Math.max(...products.map(p => p.price))) : 1000;
    priceRange.max = absoluteMaxPrice;
    priceRange.value = absoluteMaxPrice;
    let maxPrice = absoluteMaxPrice;

    function updateFilterState() {
        // Price
        maxPrice = parseInt(priceRange.value);
        if (priceMaxDisplay) priceMaxDisplay.textContent = formatPrice(maxPrice);
        
        // Categories
        activeCats = Array.from(catCheckboxes).filter(cb => cb.checked).map(cb => cb.value);

        renderFiltered();
        updateActiveTags();
    }

    function renderFiltered() {
        if (window.innerWidth <= 768) return; // Do not render desktop filters on mobile
        const params = new URLSearchParams(window.location.search);
        const urlCat = params.get('cat');
        const urlQ = params.get('q') ? params.get('q').toLowerCase() : null;
        const standardCats = ['fashion', 'shoes', 'electronics', 'pets', 'accessories'];
        const catLabels = { fashion: 'Fashion', shoes: 'Shoes', electronics: 'Tech & Gadgets', pets: 'Pet Essentials', accessories: 'Accessories' };

        const filtered = products.filter(p => {
            const passPrice = p.price <= maxPrice;
            
            // Special categories that don't have checkboxes
            let passSpecialCat = true;
            if (urlCat === 'sale') {
                passSpecialCat = !!p.comparePrice || (!!p.badge && p.badge.toLowerCase() === 'sale');
            } else if (urlCat === 'new') {
                passSpecialCat = !!p.badge && p.badge.toLowerCase() === 'new';
            }

            // Checkbox categories
            let passCat = true;
            if (activeCats.length > 0) {
                // User has explicitly selected categories
                passCat = activeCats.includes(p.category);
            } else if (urlCat && standardCats.includes(urlCat)) {
                // No checkboxes selected → fall back to URL category (same as mobile)
                passCat = p.category === urlCat;
            } else if (urlCat === 'sale' || urlCat === 'new') {
                // Special URL categories handled by passSpecialCat above
                passCat = true;
            }

            const passSize = !activeSize || (p.sizes && p.sizes.includes(activeSize));
            const passColor = !activeColor || (p.colors && p.colors.includes(activeColor));
            
            // Search query
            let passSearch = true;
            if (urlQ) {
                const searchStr = `${p.name} ${p.category} ${p.desc || ''}`.toLowerCase();
                passSearch = searchStr.includes(urlQ);
            }

            return passPrice && passCat && passSpecialCat && passSize && passColor && passSearch;
        });

        if (filtered.length === 0) {
            if(mainGrid) mainGrid.style.display = 'none';
            if(noProductsMsg) noProductsMsg.classList.remove('hidden');
        } else {
            if(mainGrid) mainGrid.style.display = 'grid';
            if(noProductsMsg) noProductsMsg.classList.add('hidden');
        }

        // Update desktop section title and product count
        const desktopTitle = document.getElementById('desktopSectionTitle');
        const desktopCount = document.getElementById('desktopProductCount');
        if (desktopTitle) {
            if (urlQ) {
                desktopTitle.textContent = 'Search: "' + params.get('q') + '"';
            } else if (activeCats.length > 0) {
                desktopTitle.textContent = activeCats.map(c => catLabels[c] || c.charAt(0).toUpperCase() + c.slice(1)).join(', ');
            } else if (urlCat && catLabels[urlCat]) {
                desktopTitle.textContent = catLabels[urlCat];
            } else if (urlCat === 'sale') {
                desktopTitle.textContent = 'Sale & Offers';
            } else if (urlCat === 'new') {
                desktopTitle.textContent = 'New Arrivals';
            } else {
                desktopTitle.textContent = 'Shop Collections';
            }
        }
        if (desktopCount) {
            desktopCount.textContent = '(' + filtered.length + ' products)';
        }

        renderProducts(filtered);
    }

    function updateActiveTags() {
        if (!activeFiltersContainer) return;
        activeFiltersContainer.innerHTML = '';
        
        const params = new URLSearchParams(window.location.search);
        const urlCat = params.get('cat');
        const urlQ = params.get('q');
        const standardCats = ['fashion', 'shoes', 'electronics', 'pets', 'accessories'];
        const catLabels = { fashion: 'Fashion', shoes: 'Shoes', electronics: 'Tech & Gadgets', pets: 'Pet Essentials', accessories: 'Accessories' };

        if (urlQ) {
            activeFiltersContainer.innerHTML += `<div class="active-tag" style="background:var(--accent);color:#000;">Search: "${urlQ}" <a href="category.html" style="color:inherit;margin-left:4px;"><i class="fa-solid fa-xmark"></i></a></div>`;
        }
        if (urlCat === 'sale') {
            activeFiltersContainer.innerHTML += `<div class="active-tag" style="background:#ffb6c1;color:#000;">Offers <a href="category.html" style="color:inherit;margin-left:4px;"><i class="fa-solid fa-xmark"></i></a></div>`;
        } else if (urlCat === 'new') {
            activeFiltersContainer.innerHTML += `<div class="active-tag" style="background:#000;color:#fff;">New Arrivals <a href="category.html" style="color:inherit;margin-left:4px;"><i class="fa-solid fa-xmark"></i></a></div>`;
        } else if (urlCat && standardCats.includes(urlCat) && activeCats.length === 0) {
            // Show the URL category as an active tag when no checkboxes are manually selected
            activeFiltersContainer.innerHTML += `<div class="active-tag" style="background:var(--primary);color:#fff;text-transform:capitalize;">${catLabels[urlCat] || urlCat} <a href="category.html" style="color:inherit;margin-left:4px;"><i class="fa-solid fa-xmark"></i></a></div>`;
        }

        if (activeSize) {
            activeFiltersContainer.innerHTML += `<div class="active-tag">Size: ${activeSize} <i class="fa-solid fa-xmark" onclick="removeFilter('size')"></i></div>`;
        }
        if (activeColor) {
            activeFiltersContainer.innerHTML += `<div class="active-tag">Color: <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${activeColor};border:1px solid #ddd;"></span> <i class="fa-solid fa-xmark" onclick="removeFilter('color')"></i></div>`;
        }
        activeCats.forEach(cat => {
            activeFiltersContainer.innerHTML += `<div class="active-tag" style="text-transform:capitalize;">${catLabels[cat] || cat} <i class="fa-solid fa-xmark" onclick="removeFilter('cat', '${cat}')"></i></div>`;
        });
    }

    window.removeFilter = function(type, val) {
        if (type === 'size') {
            activeSize = null;
            sizeBtns.forEach(b => b.classList.remove('active'));
        } else if (type === 'color') {
            activeColor = null;
            colorSwatches.forEach(c => c.classList.remove('active'));
        } else if (type === 'cat') {
            catCheckboxes.forEach(cb => {
                if (cb.value === val) cb.checked = false;
            });
        }
        updateFilterState();
    };

    // Listeners
    priceRange.addEventListener('input', updateFilterState);
    
    catCheckboxes.forEach(cb => {
        cb.addEventListener('change', updateFilterState);
    });

    sizeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (btn.classList.contains('active')) {
                btn.classList.remove('active');
                activeSize = null;
            } else {
                sizeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeSize = btn.dataset.size;
            }
            updateFilterState();
        });
    });

    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', (e) => {
            if (swatch.classList.contains('active')) {
                swatch.classList.remove('active');
                activeColor = null;
            } else {
                colorSwatches.forEach(c => c.classList.remove('active'));
                swatch.classList.add('active');
                activeColor = swatch.dataset.color;
            }
            updateFilterState();
        });
    });

    if(clearBtn) clearBtn.addEventListener('click', () => {
        priceRange.value = absoluteMaxPrice;
        catCheckboxes.forEach(cb => cb.checked = false);
        sizeBtns.forEach(b => b.classList.remove('active'));
        colorSwatches.forEach(c => c.classList.remove('active'));
        activeSize = null;
        activeColor = null;
        updateFilterState();
    });

    // Parse URL params - URL category is now the implicit page scope (handled in renderFiltered)
    // Category checkboxes are for additional cross-category refinement only
    const params = new URLSearchParams(window.location.search);
    const urlCat = params.get('cat');

    // Sync currency changes on desktop price range display & range limits
    window.addEventListener('currencyChanged', () => {
        if (window.innerWidth <= 768) return;
        if (priceMaxDisplay) {
            priceMaxDisplay.textContent = formatPrice(maxPrice);
        }
        const currentAbsoluteMax = products.length > 0 ? Math.ceil(Math.max(...products.map(p => p.price))) : 1000;
        priceRange.max = currentAbsoluteMax;
        if (priceRange.value > currentAbsoluteMax) priceRange.value = currentAbsoluteMax;
        renderFiltered();
    });

    // Initialize state
    updateFilterState();
}

// ============================================
// Mobile Filtering and Sorting Logic
// ============================================
function initMobileFiltersAndSort() {
    const mobileSortBtn = document.getElementById('mobileSortBtn');
    if (!mobileSortBtn) return; // Not on mobile category page

    // Elements
    const mobileSortSheet = document.getElementById('mobileSortSheet');
    const mobileSortBackdrop = document.getElementById('mobileSortBackdrop');
    const mobileSortCloseBtn = document.getElementById('mobileSortCloseBtn');
    const mobileCurrentSortText = document.getElementById('mobileCurrentSortText');
    const mobileFilterBtn = document.getElementById('mobileFilterBtn');
    const mobileFilterPage = document.getElementById('mobileFilterPage');
    const mobileFilterBackBtn = document.getElementById('mobileFilterBackBtn');
    const mobileFilterHeaderTitle = document.getElementById('mobileFilterHeaderTitle');
    const mobileFilterResetBtn = document.getElementById('mobileFilterResetBtn');
    const mobileFilterApplyBtn = document.getElementById('mobileFilterApplyBtn');
    const mobileCatTitle = document.getElementById('mobileCatTitle');
    const mobileProductCount = document.getElementById('mobileProductCount');

    // Filter Page tab switching
    const tabBtns = document.querySelectorAll('.filter-tab-btn');
    const optionGroups = document.querySelectorAll('.filter-options-group');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            optionGroups.forEach(g => g.classList.remove('active'));

            btn.classList.add('active');
            const tab = btn.dataset.tab;
            const targetGroup = document.getElementById(`filter-group-${tab}`);
            if (targetGroup) targetGroup.classList.add('active');
        });
    });

    // Mobile States (Temporary until applied)
    let tempFilters = {
        sort: 'relevance',
        genders: [],
        categories: [],
        colors: [],
        sizes: [],
        maxPrice: 4000
    };

    // Applied States
    let appliedFilters = {
        sort: 'relevance',
        genders: [],
        categories: [],
        colors: [],
        sizes: [],
        maxPrice: 4000
    };

    // Get Gender Helper
    function getProductGender(p) {
        const name = p.name.toLowerCase();
        if (name.includes('women') || name.includes('dress') || name.includes('sandals') || name.includes('stiletto') || name.includes('floral') || name.includes('pink') || name.includes('clothe') || name.includes('knitted') || name.includes('cardigan') || name.includes('phonecase') || name.includes('bed')) {
            return 'women';
        }
        if (name.includes('men') || name.includes('headphones') || name.includes('feeder') || name.includes('charger') || name.includes('tech') || name.includes('speaker')) {
            return 'men';
        }
        return 'unisex'; // fits both
    }

    // Set Max Price range limit dynamically based on actual products
    const mobilePriceRange = document.getElementById('mobilePriceRange');
    const mobilePriceMaxDisplay = document.getElementById('mobilePriceMaxDisplay');
    const absoluteMax = products.length > 0 ? Math.ceil(Math.max(...products.map(p => p.price))) : 4000;
    if (mobilePriceRange) {
        mobilePriceRange.max = absoluteMax;
        mobilePriceRange.value = absoluteMax;
        tempFilters.maxPrice = absoluteMax;
        appliedFilters.maxPrice = absoluteMax;
        if (mobilePriceMaxDisplay) {
            mobilePriceMaxDisplay.textContent = 'Max: ' + formatPrice(absoluteMax);
        }
        mobilePriceRange.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            tempFilters.maxPrice = val;
            if (mobilePriceMaxDisplay) {
                mobilePriceMaxDisplay.textContent = 'Max: ' + formatPrice(val);
            }
            updateTempCounts();
        });
    }

    // Toggle Sort Sheet
    function toggleSortSheet(open) {
        if (open) {
            mobileSortSheet.classList.add('active');
            mobileSortBackdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            mobileSortSheet.classList.remove('active');
            mobileSortBackdrop.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    mobileSortBtn.addEventListener('click', () => toggleSortSheet(true));
    mobileSortCloseBtn.addEventListener('click', () => toggleSortSheet(false));
    mobileSortBackdrop.addEventListener('click', () => toggleSortSheet(false));

    // Sort Items Click
    const sortItems = document.querySelectorAll('.sort-option-item');
    sortItems.forEach(item => {
        item.addEventListener('click', () => {
            sortItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const sortVal = item.dataset.sort;
            appliedFilters.sort = sortVal;
            if (mobileCurrentSortText) {
                mobileCurrentSortText.textContent = item.querySelector('span').textContent;
            }
            toggleSortSheet(false);
            applyAllFiltersAndRender();
        });
    });

    // Toggle Filter Page
    function toggleFilterPage(open) {
        if (open) {
            // Copy applied state to temp
            tempFilters = JSON.parse(JSON.stringify(appliedFilters));
            // Sync price slider range input UI
            if (mobilePriceRange) {
                mobilePriceRange.value = tempFilters.maxPrice;
                if (mobilePriceMaxDisplay) {
                    mobilePriceMaxDisplay.textContent = 'Max: ' + formatPrice(tempFilters.maxPrice);
                }
            }
            buildFilterOptionsUI();
            updateTempCounts();
            mobileFilterPage.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            mobileFilterPage.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    mobileFilterBtn.addEventListener('click', () => toggleFilterPage(true));
    mobileFilterBackBtn.addEventListener('click', () => toggleFilterPage(false));

    // Parse current categories/search from URL to set initial category/gender filters
    const params = new URLSearchParams(window.location.search);
    const urlCat = params.get('cat');
    const urlQ = params.get('q') ? params.get('q').toLowerCase() : null;

    const standardCats = ['fashion', 'shoes', 'electronics', 'pets', 'accessories'];
    if (urlCat && standardCats.includes(urlCat)) {
        appliedFilters.categories = [urlCat];
    }
    if (urlQ) {
        if (urlQ.includes('women')) appliedFilters.genders = ['women'];
        else if (urlQ.includes('men')) appliedFilters.genders = ['men'];
        else if (urlQ.includes('kids')) appliedFilters.genders = ['kids'];
    }

    // Set dynamic page headers (Category name & Product count)
    function updateHeaderInfo(count) {
        if (mobileCatTitle) {
            let title = 'Shop Collections';
            if (urlQ) {
                title = 'Search: "' + urlQ + '"';
            } else if (urlCat) {
                title = urlCat.charAt(0).toUpperCase() + urlCat.slice(1);
            }
            mobileCatTitle.textContent = title;
        }
        if (mobileProductCount) {
            mobileProductCount.textContent = count + ' Products';
        }
    }

    // Filter Logic Core
    function getFilteredProducts(filtersState) {
        return products.filter(p => {
            // Price Filter
            if (p.price > filtersState.maxPrice) return false;

            // Category Filter
            if (filtersState.categories.length > 0 && !filtersState.categories.includes(p.category)) {
                return false;
            }

            // Size Filter
            if (filtersState.sizes.length > 0) {
                const hasSize = p.sizes && p.sizes.some(s => filtersState.sizes.includes(s));
                if (!hasSize) return false;
            }

            // Color Filter
            if (filtersState.colors.length > 0) {
                const hasColor = p.colors && p.colors.some(c => filtersState.colors.includes(c));
                if (!hasColor) return false;
            }

            // Gender Filter
            if (filtersState.genders.length > 0) {
                const pGender = getProductGender(p);
                const matchGender = filtersState.genders.some(g => g === pGender || pGender === 'unisex');
                if (!matchGender) return false;
            }

            // URL Search param (persistent)
            if (urlQ) {
                const searchStr = `${p.name} ${p.category} ${p.desc || ''}`.toLowerCase();
                if (!searchStr.includes(urlQ)) return false;
            }

            // URL Category param (if not explicitly overridden by category filters)
            if (urlCat && filtersState.categories.length === 0) {
                if (urlCat === 'sale') {
                    const isSale = !!p.comparePrice || (!!p.badge && p.badge.toLowerCase() === 'sale');
                    if (!isSale) return false;
                } else if (urlCat === 'new') {
                    const isNew = !!p.badge && p.badge.toLowerCase() === 'new';
                    if (!isNew) return false;
                } else if (p.category !== urlCat) {
                    return false;
                }
            }

            return true;
        });
    }

    // Sort Logic Core
    function sortProducts(items, sortMethod) {
        const sorted = [...items];
        if (sortMethod === 'price-desc') {
            sorted.sort((a, b) => b.price - a.price);
        } else if (sortMethod === 'price-asc') {
            sorted.sort((a, b) => a.price - b.price);
        } else if (sortMethod === 'new') {
            sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        } else if (sortMethod === 'discount') {
            sorted.sort((a, b) => {
                const discountA = a.comparePrice ? (parseFloat(a.comparePrice) - a.price) / parseFloat(a.comparePrice) : 0;
                const discountB = b.comparePrice ? (parseFloat(b.comparePrice) - b.price) / parseFloat(b.comparePrice) : 0;
                return discountB - discountA;
            });
        }
        return sorted;
    }

    // Update Temporary Count in Header
    function updateTempCounts() {
        const filtered = getFilteredProducts(tempFilters);
        if (mobileFilterHeaderTitle) {
            mobileFilterHeaderTitle.textContent = 'Filters (' + filtered.length + ' products)';
        }
    }

    // Apply & Render Grid
    function applyAllFiltersAndRender() {
        if (window.innerWidth > 768) return; // Do not render mobile filters on desktop
        let filtered = getFilteredProducts(appliedFilters);
        let sorted = sortProducts(filtered, appliedFilters.sort);
        
        // Render
        renderProducts(sorted);
        updateHeaderInfo(sorted.length);

        // Toggle no products warning message if exists
        const noProductsMsg = document.getElementById('noProductsMsg');
        const mainProductGrid = document.getElementById('mainProductGrid');
        if (sorted.length === 0) {
            if (mainProductGrid) mainProductGrid.style.display = 'none';
            if (noProductsMsg) noProductsMsg.classList.remove('hidden');
        } else {
            if (mainProductGrid) mainProductGrid.style.display = 'grid';
            if (noProductsMsg) noProductsMsg.classList.add('hidden');
        }
    }

    // Build the Right Side Checklists dynamically
    function buildFilterOptionsUI() {
        // 1. Gender List
        const genderGroup = document.getElementById('filter-group-gender');
        if (genderGroup) {
            const genders = ['women', 'men'];
            genderGroup.innerHTML = genders.map(gender => {
                const isChecked = tempFilters.genders.includes(gender);
                const mockState = { ...tempFilters, genders: [gender] };
                const count = getFilteredProducts(mockState).length;
                const capitalize = gender.charAt(0).toUpperCase() + gender.slice(1);
                return `
                    <label class="filter-option-checkbox">
                        <input type="checkbox" value="${gender}" data-type="gender" ${isChecked ? 'checked' : ''}>
                        <span>${capitalize} (${count})</span>
                    </label>
                `;
            }).join('');
        }

        // 2. Category List
        const categoryGroup = document.getElementById('filter-group-category');
        if (categoryGroup) {
            const cats = ['fashion', 'shoes', 'electronics', 'pets', 'accessories'];
            const catLabels = {
                fashion: 'Fashion',
                shoes: 'Shoes',
                electronics: 'Tech & Gadgets',
                pets: 'Pet Essentials',
                accessories: 'Accessories'
            };
            categoryGroup.innerHTML = cats.map(cat => {
                const isChecked = tempFilters.categories.includes(cat);
                const mockState = { ...tempFilters, categories: [cat] };
                const count = getFilteredProducts(mockState).length;
                return `
                    <label class="filter-option-checkbox">
                        <input type="checkbox" value="${cat}" data-type="category" ${isChecked ? 'checked' : ''}>
                        <span>${catLabels[cat]} (${count})</span>
                    </label>
                `;
            }).join('');
        }

        // 3. Colors Grid List
        const colorsGroup = document.getElementById('filter-group-colors');
        if (colorsGroup) {
            const colors = ['black', 'white', 'red', 'blue', 'beige', 'pink', 'green', 'yellow', 'brown', 'grey'];
            colorsGroup.innerHTML = colors.map(color => {
                const isChecked = tempFilters.colors.includes(color);
                const mockState = { ...tempFilters, colors: [color] };
                const count = getFilteredProducts(mockState).length;
                const capitalize = color.charAt(0).toUpperCase() + color.slice(1);
                return `
                    <div class="color-filter-option" data-color="${color}">
                        <div class="color-option-left">
                            <input type="checkbox" value="${color}" data-type="color" ${isChecked ? 'checked' : ''} style="width:18px;height:18px;accent-color:#1a1a1a;">
                            <span class="color-circle-preview" style="background-color:${color === 'white' ? '#ffffff' : color}; border: 1px solid ${color === 'white' ? '#cccccc' : 'transparent'};"></span>
                            <span>${capitalize} (${count})</span>
                        </div>
                    </div>
                `;
            }).join('');

            // Add click listeners to color rows to toggle checkbox
            colorsGroup.querySelectorAll('.color-filter-option').forEach(el => {
                el.addEventListener('click', (e) => {
                    if (e.target.tagName !== 'INPUT') {
                        const cb = el.querySelector('input');
                        cb.checked = !cb.checked;
                        cb.dispatchEvent(new Event('change'));
                    }
                });
            });
        }

        // 4. Sizes Checklist Grid
        const sizeGroup = document.getElementById('filter-group-size');
        if (sizeGroup) {
            const sizes = ['XS', 'S', 'M', 'L', 'XL'];
            sizeGroup.innerHTML = `
                <p style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:12px;">Select Size</p>
                <div class="size-filter-checkbox-grid">
                    ${sizes.map(size => {
                        const isChecked = tempFilters.sizes.includes(size);
                        return `
                            <div class="size-checkbox-box ${isChecked ? 'checked' : ''}" data-size="${size}">
                                <input type="checkbox" value="${size}" data-type="size" ${isChecked ? 'checked' : ''}>
                                <span>${size}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;

            // Add click listeners to size boxes
            sizeGroup.querySelectorAll('.size-checkbox-box').forEach(box => {
                box.addEventListener('click', () => {
                    const cb = box.querySelector('input');
                    cb.checked = !cb.checked;
                    if (cb.checked) {
                        box.classList.add('checked');
                    } else {
                        box.classList.remove('checked');
                    }
                    cb.dispatchEvent(new Event('change'));
                });
            });
        }

        // Setup Event Listeners on newly built checkboxes
        const allCheckboxes = mobileFilterPage.querySelectorAll('input[type="checkbox"]');
        allCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                const val = cb.value;
                const type = cb.dataset.type;
                if (type === 'gender') {
                    if (cb.checked) tempFilters.genders.push(val);
                    else tempFilters.genders = tempFilters.genders.filter(g => g !== val);
                } else if (type === 'category') {
                    if (cb.checked) tempFilters.categories.push(val);
                    else tempFilters.categories = tempFilters.categories.filter(c => c !== val);
                } else if (type === 'color') {
                    if (cb.checked) tempFilters.colors.push(val);
                    else tempFilters.colors = tempFilters.colors.filter(c => c !== val);
                } else if (type === 'size') {
                    if (cb.checked) tempFilters.sizes.push(val);
                    else tempFilters.sizes = tempFilters.sizes.filter(s => s !== val);
                }
                updateTempCounts();
            });
        });
    }

    // Apply Filter Button
    mobileFilterApplyBtn.addEventListener('click', () => {
        appliedFilters = JSON.parse(JSON.stringify(tempFilters));
        applyAllFiltersAndRender();
        toggleFilterPage(false);
    });

    // Reset Button
    mobileFilterResetBtn.addEventListener('click', () => {
        tempFilters.genders = [];
        tempFilters.categories = [];
        tempFilters.colors = [];
        tempFilters.sizes = [];
        tempFilters.maxPrice = absoluteMax;
        if (mobilePriceRange) {
            mobilePriceRange.value = absoluteMax;
            if (mobilePriceMaxDisplay) {
                mobilePriceMaxDisplay.textContent = 'Max: ' + formatPrice(absoluteMax);
            }
        }
        buildFilterOptionsUI();
        updateTempCounts();
    });

    // Currency Switcher Sync
    window.addEventListener('currencyChanged', () => {
        if (mobilePriceMaxDisplay) {
            mobilePriceMaxDisplay.textContent = 'Max: ' + formatPrice(tempFilters.maxPrice);
        }
        applyAllFiltersAndRender();
    });

    // Initial load sync after products load
    document.addEventListener('productsLoaded', () => {
        applyAllFiltersAndRender();
    });

    // Trigger initial filter load immediately if products are already loaded
    if (products.length > 0) {
        applyAllFiltersAndRender();
    }
}

// ============================================
// Cart Logic
// ============================================
function buyNow(id, e) {
    if (e) e.stopPropagation();
    addToCart(id, e);
    window.location.href = 'checkout.html';
}

function addToCart(id, event) {
    if (event) event.stopPropagation();
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    existing ? existing.quantity += 1 : cart.push({ ...product, quantity: 1 });
    localStorage.setItem('shiningstore_cart', JSON.stringify(cart));
    updateCartUI();
    toggleCart(true);
    cartBadge.style.transform = 'scale(1.4)';
    setTimeout(() => { cartBadge.style.transform = 'scale(1)'; }, 300);
}

function updateQuantity(id, change) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) cart = cart.filter(i => i.id !== id);
        updateCartUI();
    }
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    updateCartUI();
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartBadge) {
        cartBadge.innerText = totalItems;
        totalItems > 0 ? cartBadge.classList.remove('hidden') : cartBadge.classList.add('hidden');
    }

    // Mobile cart badge
    if (mobileCartBadge) {
        mobileCartBadge.innerText = totalItems;
        totalItems > 0 ? mobileCartBadge.classList.remove('hidden') : mobileCartBadge.classList.add('hidden');
    }

    if (cartItemsContainer) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart-msg">
                    <i class="fa-solid fa-bag-shopping empty-icon"></i>
                    <p>Your cart is currently empty.</p>
                    <button class="btn btn-primary mt-4" onclick="document.getElementById('cartCloseBtn').click()">Continue Shopping</button>
                </div>`;
        } else {
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item fade-in">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img" loading="lazy" onerror="handleImageError(this, '${item.category}')">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">${formatPrice(item.price * item.quantity)}</div>
                        <div class="cart-item-actions" style="display:flex; justify-content:space-between; align-items:center;">
                            <div class="qty-controls">
                                <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)"><i class="fa-solid fa-minus"></i></button>
                                <span class="qty-display">${item.quantity}</span>
                                <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)"><i class="fa-solid fa-plus"></i></button>
                            </div>
                            <div style="display:flex; gap:10px;">
                                <button class="remove-btn" onclick="toggleWishlist(${item.id}); removeFromCart(${item.id});"><i class="fa-regular fa-heart"></i> Move to Wishlist</button>
                                <button class="remove-btn" onclick="removeFromCart(${item.id})"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                </div>`).join('');
        }
    }
    
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }
    calculateTotals();
}

function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmt = subtotal * discount;
    const total = subtotal - discountAmt;

    if (subtotalEl) subtotalEl.innerText = formatPrice(subtotal);
    if (discountRow) {
        discount > 0 ? (discountRow.classList.remove('hidden'), discountEl.innerText = `-${formatPrice(discountAmt)}`) : discountRow.classList.add('hidden');
    }
    if (totalEl) totalEl.innerText = formatPrice(total);

    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.cart-progress p');
    if (progressFill && progressText) {
        const remaining = 50 - subtotal;
        if (remaining > 0) {
            progressFill.style.width = `${Math.min((subtotal / 50) * 100, 100)}%`;
            progressText.innerHTML = `Spend <strong>${formatPrice(remaining)}</strong> more for <strong>Free Shipping!</strong>`;
        } else {
            progressFill.style.width = '100%';
            progressText.innerHTML = '🎉 <strong>Congratulations!</strong> You\'ve unlocked Free Shipping.';
        }
    }
}

function applyPromo() {
    const code = promoInput.value.trim().toUpperCase();
    if (PROMO_CODES[code]) {
        discount = PROMO_CODES[code];
        applyPromoBtn.innerText = '✓ Applied';
        applyPromoBtn.classList.remove('btn-outline');
        applyPromoBtn.classList.add('btn-primary');
        applyPromoBtn.style.background = '#5cb885';
        applyPromoBtn.style.borderColor = '#5cb885';
        calculateTotals();
    } else {
        promoInput.style.borderColor = '#d4736d';
        setTimeout(() => { promoInput.style.borderColor = ''; }, 1500);
        discount = 0;
        applyPromoBtn.innerText = 'Apply';
        applyPromoBtn.classList.add('btn-outline');
        applyPromoBtn.classList.remove('btn-primary');
        applyPromoBtn.style.background = '';
        applyPromoBtn.style.borderColor = '';
        calculateTotals();
    }
}

// ============================================
// UI Helpers
// ============================================
function toggleCart(forceOpen = false) {
    if (forceOpen === true) {
        cartDrawer.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        const isOpen = cartDrawer.classList.contains('active');
        cartDrawer.classList.toggle('active');
        cartOverlay.classList.toggle('active');
        document.body.style.overflow = isOpen ? '' : 'hidden';
    }
}

function openModal(modal, overlay) {
    modal?.classList.add('active');
    overlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal, overlay) {
    modal?.classList.remove('active');
    overlay?.classList.remove('active');
    document.body.style.overflow = '';
}

function openProductModal(id, event) {
    if (event) event.stopPropagation();
    // Navigate to dedicated product detail page
    window.location.href = `product.html?id=${id}`;
}

function searchViewAll(query) {
    const searchDropdown = document.getElementById('searchDropdown');
    const searchOverlay = document.getElementById('searchOverlay');
    searchDropdown?.classList.remove('active');
    searchOverlay?.classList.remove('active');
    setTimeout(() => {
        searchDropdown?.classList.add('hidden');
        document.getElementById('shop-desktop')?.scrollIntoView({ behavior: 'smooth' });
        
        // Reset filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(b => b.classList.remove('active'));
        const targetBtn = Array.from(filterBtns).find(b => b.dataset.filter === 'all');
        if (targetBtn) targetBtn.classList.add('active');

        // Render filtered products
        const results = products.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query) ||
            p.desc.toLowerCase().includes(query)
        );
        renderProducts(results);
    }, 300);
}

// ============================================
// Authentication Modal Logic
// ============================================
let currentAuthTab = 'login';
let currentAuthStep = 'form';
let generatedOtp = '';
let signupData = { name: '', email: '', password: '' };
let currentUser = JSON.parse(localStorage.getItem('shiningstore_session') || 'null');

function toggleAuthModal(forceOpen) {
    const authModal = document.getElementById('authModal');
    const authOverlay = document.getElementById('authOverlay');
    if (!authModal || !authOverlay) return;
    
    // If already logged in, show logout confirm
    if (currentUser && forceOpen === true) {
        if (confirm('You are logged in as ' + currentUser.name + '. Do you want to logout?')) {
            currentUser = null;
            localStorage.removeItem('shiningstore_session');
            updateAuthUI();
        }
        return;
    }

    if (forceOpen === true) {
        authModal.classList.add('active');
        authOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        authModal.classList.remove('active');
        authOverlay.classList.remove('active');
        document.body.style.overflow = '';
        if (typeof resetAuthModalStep === 'function') resetAuthModalStep();
    }
}

function switchAuthTab(tab) {
    const authTabs = document.querySelectorAll('.auth-tab');
    const nameGroup = document.getElementById('nameGroup');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authOptions = document.getElementById('authOptions');

    currentAuthTab = tab;
    authTabs.forEach(t => t.classList.remove('active'));
    document.querySelector(`.auth-tab[data-tab="${tab}"]`)?.classList.add('active');
    
    if (tab === 'signup') {
        if (nameGroup) nameGroup.style.display = 'block';
        if (authTitle) authTitle.textContent = 'Create Account';
        if (authSubtitle) authSubtitle.textContent = 'Join Shining Store today';
        if (authSubmitBtn) authSubmitBtn.textContent = 'CREATE ACCOUNT';
        if (authOptions) authOptions.style.display = 'none';
    } else {
        if (nameGroup) nameGroup.style.display = 'none';
        if (authTitle) authTitle.textContent = 'Welcome Back';
        if (authSubtitle) authSubtitle.textContent = 'Sign in to access your account';
        if (authSubmitBtn) authSubmitBtn.textContent = 'SIGN IN';
        if (authOptions) authOptions.style.display = 'flex';
    }
}

function handleAuthSubmit(e) {
    e.preventDefault();

    if (currentAuthStep === 'otp') {
        const otp0 = document.getElementById('otp-0')?.value || '';
        const otp1 = document.getElementById('otp-1')?.value || '';
        const otp2 = document.getElementById('otp-2')?.value || '';
        const otp3 = document.getElementById('otp-3')?.value || '';
        const enteredOtp = (otp0 + otp1 + otp2 + otp3).trim();

        const otpError = document.getElementById('otpError');

        if (enteredOtp.length < 4) {
            if (otpError) {
                otpError.textContent = 'Please enter the complete 4-digit code.';
                otpError.style.display = 'block';
            } else {
                alert('Please enter the complete 4-digit code.');
            }
            return;
        }

        if (enteredOtp !== generatedOtp) {
            if (otpError) {
                otpError.textContent = 'Invalid verification code. Please check your email and try again.';
                otpError.style.display = 'block';
            } else {
                alert('Invalid verification code. Please check your email and try again.');
            }
            return;
        }

        const usersRaw = localStorage.getItem('shiningstore_users');
        const users = usersRaw ? JSON.parse(usersRaw) : [];

        function appHashPassword(pwd) {
            let hash = 0;
            for (let i = 0; i < pwd.length; i++) {
                const char = pwd.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return 'sh_' + Math.abs(hash).toString(36) + '_' + pwd.length;
        }

        const newUser = {
            id: 'user_' + Date.now(),
            name: signupData.name.trim(),
            email: signupData.email.toLowerCase().trim(),
            password: appHashPassword(signupData.password),
            joinDate: new Date().toISOString(),
            orders: [],
            wishlist: [],
            rewardPoints: 50
        };

        users.push(newUser);
        localStorage.setItem('shiningstore_users', JSON.stringify(users));
        
        currentUser = { name: newUser.name, email: newUser.email };
        localStorage.setItem('shiningstore_session', JSON.stringify(currentUser));
        localStorage.setItem('shiningstore_user', JSON.stringify(newUser));

        updateAuthUI();
        toggleAuthModal(false);
        alert('Account created successfully!');
        window.location.reload();
        return;
    }

    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    
    if (currentAuthTab === 'signup') {
        const nameInput = document.getElementById('authName').value;
        const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'aol.com', 'proton.me', 'protonmail.com', 'zoho.com', 'live.com', 'msn.com', 'yandex.com', 'gmx.com'];
        const domain = email.split('@')[1]?.toLowerCase().trim();
        
        if (!nameInput.trim()) {
            alert('Please enter your full name.');
            return;
        }
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        if (!allowedDomains.includes(domain)) {
            alert('Please use a trusted email service (e.g., Gmail, Yahoo, Outlook, iCloud).');
            return;
        }
        if (!password || password.length < 6) {
            alert('Password must be at least 6 characters.');
            return;
        }
        
        const usersRaw = localStorage.getItem('shiningstore_users');
        const users = usersRaw ? JSON.parse(usersRaw) : [];
        const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
        if (existing) {
            alert('An account with this email already exists.');
            return;
        }
        
        signupData = { name: nameInput, email: email, password: password };
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        generatedOtp = code;
        currentAuthStep = 'otp';
        renderOtpStep();
        alert('🔑 shiningstore.com: Your registration verification code is ' + code);
        return;
    }
    
    const usersRaw = localStorage.getItem('shiningstore_users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
        alert('No account found with this email.');
        return;
    }

    function appHashPassword(pwd) {
        let hash = 0;
        for (let i = 0; i < pwd.length; i++) {
            const char = pwd.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'sh_' + Math.abs(hash).toString(36) + '_' + pwd.length;
    }

    if (user.password !== appHashPassword(password)) {
        alert('Incorrect password. Please try again.');
        return;
    }

    currentUser = { name: user.name, email: user.email };
    localStorage.setItem('shiningstore_session', JSON.stringify(currentUser));
    localStorage.setItem('shiningstore_user', JSON.stringify(user));
    
    updateAuthUI();
    toggleAuthModal(false);
    alert('Logged in successfully!');
    
    const authForm = document.getElementById('authForm');
    if(authForm) authForm.reset();
    window.location.reload();
}

function setupOtpInputs() {
    const inputs = [
        document.getElementById('otp-0'),
        document.getElementById('otp-1'),
        document.getElementById('otp-2'),
        document.getElementById('otp-3')
    ];
    inputs.forEach((input, index) => {
        if (!input) return;
        input.addEventListener('input', (e) => {
            const val = e.target.value;
            if (val !== '' && isNaN(Number(val))) {
                e.target.value = '';
                return;
            }
            if (val !== '' && index < 3) {
                inputs[index + 1]?.focus();
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && input.value === '' && index > 0) {
                inputs[index - 1]?.focus();
            }
        });
    });
}

function renderOtpStep() {
    const authTabs = document.querySelector('.auth-tabs');
    const authDivider = document.querySelector('.auth-divider');
    const authSocials = document.querySelector('.auth-socials');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const authForm = document.getElementById('authForm');

    if (authTabs) authTabs.style.display = 'none';
    if (authDivider) authDivider.style.display = 'none';
    if (authSocials) authSocials.style.display = 'none';

    if (authTitle) authTitle.textContent = 'Verify Email';
    if (authSubtitle) {
        authSubtitle.innerHTML = `Enter the 4-digit verification code sent to <strong style="color: var(--color-charcoal);">${signupData.email}</strong>`;
    }

    if (authForm) {
        authForm.innerHTML = `
            <div id="otpError" style="display:none; padding: 8px 12px; margin-bottom: 12px; border-radius: 8px; background-color: #fef2f2; border: 1px solid #fee2e2; color: #dc2626; font-size: 0.75rem; font-weight: 500;"></div>
            
            <div class="otp-grid" style="display: flex; justify-content: center; gap: 10px; margin: 20px 0;">
                <input type="text" id="otp-0" class="otp-input" maxlength="1" style="width: 45px; height: 50px; text-align: center; font-size: 1.25rem; font-weight: bold; border: 1px solid var(--border-light); border-radius: 8px; background: white; color: black; outline: none;" autofocus>
                <input type="text" id="otp-1" class="otp-input" maxlength="1" style="width: 45px; height: 50px; text-align: center; font-size: 1.25rem; font-weight: bold; border: 1px solid var(--border-light); border-radius: 8px; background: white; color: black; outline: none;">
                <input type="text" id="otp-2" class="otp-input" maxlength="1" style="width: 45px; height: 50px; text-align: center; font-size: 1.25rem; font-weight: bold; border: 1px solid var(--border-light); border-radius: 8px; background: white; color: black; outline: none;">
                <input type="text" id="otp-3" class="otp-input" maxlength="1" style="width: 45px; height: 50px; text-align: center; font-size: 1.25rem; font-weight: bold; border: 1px solid var(--border-light); border-radius: 8px; background: white; color: black; outline: none;">
            </div>
            
            <button type="submit" class="btn btn-primary" style="width:100%; border-radius:var(--radius-pill); font-size:0.9rem;" id="authSubmitBtn">VERIFY & REGISTER</button>
            
            <div class="otp-resend" style="text-align: center; margin-top: 15px; font-size: 0.8rem; color: var(--text-secondary);">
                Didn't receive the code? <a href="#" id="resendOtpBtn" style="color: var(--primary); font-weight: 600; text-decoration: none;">Resend Code</a>
            </div>
        `;

        setupOtpInputs();

        setTimeout(() => {
            document.getElementById('otp-0')?.focus();
        }, 100);

        document.getElementById('resendOtpBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            const otpError = document.getElementById('otpError');
            if (otpError) otpError.style.display = 'none';

            const code = Math.floor(1000 + Math.random() * 9000).toString();
            generatedOtp = code;
            alert('🔑 shiningstore.com: Your registration verification code is ' + code);
        });
    }
}

function resetAuthModalStep() {
    currentAuthStep = 'form';
    generatedOtp = '';
    signupData = { name: '', email: '', password: '' };

    const authTabs = document.querySelector('.auth-tabs');
    const authDivider = document.querySelector('.auth-divider');
    const authSocials = document.querySelector('.auth-socials');
    const authForm = document.getElementById('authForm');

    if (authTabs) authTabs.style.display = 'flex';
    if (authDivider) authDivider.style.display = 'flex';
    if (authSocials) authSocials.style.display = 'grid';

    if (authForm) {
        authForm.innerHTML = `
            <div class="input-group" id="nameGroup" style="display:${currentAuthTab === 'signup' ? 'block' : 'none'};">
                <i class="fa-regular fa-user"></i>
                <input type="text" id="authName" placeholder="Full Name">
            </div>
            <div class="input-group">
                <i class="fa-regular fa-envelope"></i>
                <input type="email" id="authEmail" placeholder="Email Address" required>
            </div>
            <div class="input-group">
                <i class="fa-solid fa-lock"></i>
                <input type="password" id="authPassword" placeholder="Password" required>
            </div>
            <div class="auth-options" id="authOptions" style="display:${currentAuthTab === 'signup' ? 'none' : 'flex'};">
                <label><input type="checkbox"> Remember me</label>
                <a href="#" class="forgot-pwd">Forgot Password?</a>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%; border-radius:var(--radius-pill); font-size:0.9rem;" id="authSubmitBtn">${currentAuthTab === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN'}</button>
        `;
    }
    switchAuthTab(currentAuthTab);
}

function updateAuthUI() {
    const accountIcons = document.querySelectorAll('#accountIcon');
    accountIcons.forEach(icon => {
        if (currentUser) {
            // Logged in state
            icon.className = 'fa-solid fa-user-check';
            icon.style.color = 'var(--primary)';
        } else {
            // Logged out state
            icon.className = 'fa-regular fa-user';
            icon.style.color = '';
        }
    });
}

function setupAuthListeners() {
    const accountBtn = document.getElementById('accountBtn');
    const authCloseBtn = document.getElementById('authCloseBtn');
    const authOverlay = document.getElementById('authOverlay');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForm = document.getElementById('authForm');

    if (accountBtn) {
        accountBtn.addEventListener('click', () => {
            if (currentUser) {
                window.location.href = 'account.html';
            } else {
                toggleAuthModal(true);
            }
        });
    }
    
    if (authCloseBtn) authCloseBtn.addEventListener('click', () => toggleAuthModal(false));
    if (authOverlay) authOverlay.addEventListener('click', () => toggleAuthModal(false));

    authTabs.forEach(tab => {
        tab.addEventListener('click', (e) => switchAuthTab(e.target.dataset.tab));
    });

    if (authForm) authForm.addEventListener('submit', handleAuthSubmit);
    
    updateAuthUI();
}

// Call setup once on load
document.addEventListener('DOMContentLoaded', setupAuthListeners);

// ============================================
// Support Chatbot Logic
// ============================================
function initChatbot() {
    let fab = document.getElementById('chatbotFab');
    let windowEl = document.getElementById('chatbotWindow');

    if (!fab || !windowEl) {
        const html = `
        <div class="chatbot-container">
            <button class="chatbot-fab" id="chatbotFab" data-tooltip="Need Help?">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-headset"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></svg>
            </button>
            <div class="chatbot-window" id="chatbotWindow">
                <div class="chatbot-header">
                    <div>
                        <h4>Shining Support</h4>
                        <span class="status-indicator"></span> Online
                    </div>
                    <button id="chatbotClose" class="chatbot-close"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="chatbot-messages" id="chatbotMessages">
                    <div class="chat-msg bot-msg">
                        Hi there! 👋 Welcome to Shining Store. How can I help you today? You can ask me about products, shipping, orders, or return policies!
                    </div>
                </div>
                <div class="chatbot-input">
                    <input type="text" id="chatbotInput" placeholder="Ask about products, shipping...">
                    <button id="chatbotSend"><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
        fab = document.getElementById('chatbotFab');
        windowEl = document.getElementById('chatbotWindow');
    }

    const closeBtn = document.getElementById('chatbotClose');
    const inputEl = document.getElementById('chatbotInput');
    const sendBtn = document.getElementById('chatbotSend');
    const messagesEl = document.getElementById('chatbotMessages');

    function toggleChat() {
        windowEl.classList.toggle('active');
        if (windowEl.classList.contains('active') && inputEl) {
            setTimeout(() => inputEl.focus(), 300);
        }
    }
    window.toggleChat = toggleChat;

    function addMessage(htmlContent, isUser = false) {
        if (!messagesEl) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${isUser ? 'user-msg' : 'bot-msg'}`;
        msgDiv.innerHTML = htmlContent;
        messagesEl.appendChild(msgDiv);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function formatProductCards(items) {
        if (!items || items.length === 0) return '';
        const limit = items.slice(0, 3);
        let html = '<div class="chat-product-list">';
        limit.forEach(p => {
            html += `
            <a href="product.html?id=${p.id}" class="chat-product-card" target="_blank">
                <img src="${p.image}" class="chat-product-img" alt="${p.name}" onerror="handleImageError(this, '${p.category}')">
                <div class="chat-product-info">
                    <div class="chat-product-title">${p.name}</div>
                    <div class="chat-product-price">$${p.price.toFixed(2)}</div>
                </div>
            </a>`;
        });
        html += '</div>';
        if (items.length > 3) {
            html += `<div style="font-size: 0.75rem; margin-top: 5px; color: var(--primary); text-align: center;"><a href="category.html">View all ${items.length} results</a></div>`;
        }
        return html;
    }

    function findProducts(query) {
        if (!products || products.length === 0) return [];
        const q = query.toLowerCase();
        
        // Remove common conversational words
        const ignoreWords = ['show', 'me', 'i', 'want', 'need', 'looking', 'for', 'do', 'you', 'have', 'any', 'some', 'the', 'a', 'an', 'is', 'are', 'there', 'what', 'can', 'get', 'buy', 'purchase', 'find'];
        let terms = q.split(/[\s,?!]+/).filter(w => w.trim() !== '' && !ignoreWords.includes(w));
        
        if (terms.length === 0) return [];

        // Synonym Dictionary
        const synonyms = {
            'top': ['shirt', 'blouse', 't-shirt', 'tank', 'fashion'],
            'tops': ['shirt', 'blouse', 't-shirt', 'tank', 'fashion', 'top'],
            'shoes': ['sneaker', 'boot', 'footwear', 'shoe'],
            'shoe': ['sneaker', 'boot', 'footwear', 'shoes'],
            'clothes': ['fashion', 'dress', 'shirt', 'wear'],
            'clothing': ['fashion', 'dress', 'shirt', 'wear'],
            'pets': ['dog', 'cat', 'feeder', 'toy', 'pet'],
            'pet': ['dog', 'cat', 'feeder', 'toy', 'pets'],
            'electronics': ['charger', 'earbud', 'cable', 'tech'],
            'tech': ['electronics', 'charger', 'earbud', 'cable'],
            'accessories': ['bag', 'case', 'cover', 'watch'],
            'dresses': ['dress', 'fashion', 'gown']
        };

        // Expand terms with synonyms and singulars
        let expandedTerms = [...terms];
        terms.forEach(t => {
            if (synonyms[t]) expandedTerms.push(...synonyms[t]);
            // Naive singularizer
            if (t.endsWith('s') && t.length > 3) expandedTerms.push(t.slice(0, -1));
            if (t.endsWith('es') && t.length > 4) expandedTerms.push(t.slice(0, -2));
        });
        
        // Remove duplicates
        expandedTerms = [...new Set(expandedTerms)];

        return products.filter(p => {
            const searchStr = `${p.name} ${p.category} ${p.description || ''}`.toLowerCase();
            return expandedTerms.some(t => searchStr.includes(t));
        });
    }

    function generateResponse(text) {
        const t = text.toLowerCase();
        
        // 1. Greetings & Identity
        if (/(who are you|what is this|what do you do|what do you sell)/i.test(t)) {
            return "I am the Shining Store AI Assistant! 🤖 I can help you find products (like 'show me shoes'), track your orders, or answer questions about our shipping and return policies.";
        }
        if (/(hi|hello|hey|greetings|morning|afternoon|evening)/i.test(t) && t.length < 15) {
            return "Hello! 👋 I'm your Shining Store shopping assistant. How can I help you today?";
        }
        
        // 2. Order Tracking
        if (/(track|order status|where is my order|where is my package|package tracking|has my order shipped)/i.test(t)) {
            return `You can easily track your order status in two ways:<br>
            1. Go to our <a href="tracking.html" style="color:var(--primary); font-weight:bold;">Tracking Page</a> and enter your Order ID.<br>
            2. Log in to your account and check the "My Orders" tab.`;
        }

        // 3. Shipping, Delivery & Time
        if (/(shipping|delivery|deliver|how long|shipping cost|free shipping|when will i get|arrive)/i.test(t)) {
            return `📦 **Shipping Info:**<br>
            • We offer **affordable worldwide shipping** on all orders.<br>
            • Standard delivery takes **3-5 business days**.<br>
            • Express shipping (1-2 days) is available at checkout for $12.99.`;
        }

        // 4. Returns, Refunds & Guarantees
        if (/(return|refund|exchange|money back|send back|guarantee|warranty|broken|wrong size)/i.test(t)) {
            return `↩️ **Return Policy:**<br>
            We offer a **30-day hassle-free return policy**. <br>
            If you're not 100% satisfied, you can return unworn/unused items with tags attached. <br>
            <div class="chat-action-btns">
                <button class="chat-action-btn" onclick="window.location.href='about.html'">View Full Policy</button>
            </div>`;
        }

        // 5. Payments, Security & Promo Codes
        if (/(payment|pay|credit card|paypal|cod|cash on delivery|safe|secure|promo|discount|coupon|code|sale)/i.test(t)) {
            return `💳 **Payments & Promos:**<br>
            • We accept Visa, MasterCard, Amex, PayPal, and Apple Pay.<br>
            • All transactions are 100% secure.<br>
            • **Tip:** Use code <b>SHINE20</b> at checkout for 20% off!`;
        }

        // 6. Contact Human/Support
        if (/(human|person|agent|support|customer service|call|phone|email|talk to someone|help desk)/i.test(t)) {
            return `📞 **Contact Us:**<br>
            Our support team is available 24/7.<br>
            • Email: support@shiningstore.com<br>
            • Phone: 1-800-SHINING (Mon-Fri, 9AM-6PM)<br>
            We'll be happy to help!`;
        }
        
        // 7. Cart & Wishlist
        if (/(cart|bag|wishlist|favorites|basket|checkout)/i.test(t)) {
            return `🛒 You can view your shopping bag by clicking the bag icon in the top right corner. You can also view your saved items in your Wishlist.`;
        }

        // 8. Product Searching (Catch-all for product queries)
        const matchedProducts = findProducts(text);
        if (matchedProducts.length > 0) {
            let reply = `I found some items you might love based on "${text}":`;
            reply += formatProductCards(matchedProducts);
            return reply;
        }

        // 9. Polite Fallback for empty search
        // Check if they used typical product search words to give a contextual "not found"
        if (/(do you have|i want|looking for|show me|find)/i.test(t)) {
            return `I searched our catalog, but I couldn't find an exact match for what you're looking for right now. 😔<br><br>Could you try searching for broader terms like **"fashion"**, **"electronics"**, or **"pets"**?`;
        }

        // 10. Ultimate Fallback
        return "I'm sorry, I didn't quite catch that. Could you try rephrasing? You can ask me about **shipping**, **returns**, **tracking**, or search for specific **products** (e.g., 'Do you have red dresses?').";
    }

    function handleSend() {
        if (!inputEl) return;
        const text = inputEl.value.trim();
        if (!text) return;
        
        // Escape HTML for user message
        const div = document.createElement('div');
        div.textContent = text;
        addMessage(div.innerHTML, true);
        inputEl.value = '';

        // Simulate real bot typing and logic
        const typingId = 'typing-' + Date.now();
        const typingMsg = document.createElement('div');
        typingMsg.className = 'chat-msg bot-msg';
        typingMsg.id = typingId;
        typingMsg.innerHTML = '<span style="font-style:italic; opacity:0.6;">Typing...</span>';
        messagesEl.appendChild(typingMsg);
        messagesEl.scrollTop = messagesEl.scrollHeight;

        setTimeout(() => {
            const typingEl = document.getElementById(typingId);
            if (typingEl) typingEl.remove();

            const replyHtml = generateResponse(text);
            addMessage(replyHtml, false);
        }, 800 + Math.random() * 600);
    }

    fab.addEventListener('click', toggleChat);
    if(closeBtn) closeBtn.addEventListener('click', toggleChat);
    if(sendBtn) sendBtn.addEventListener('click', handleSend);
    if(inputEl) {
        inputEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    }
}

// init() is now async, so we just call it directly since we don't rely on document ready for DOM anymore (it's at the end of body)
init();
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
} else {
    initChatbot();
}
