// ============================================
// SHINING STORE - Premium E-Commerce JavaScript
// With Mobile UI + Auth Integration
// ============================================

// Product Data
let products = [];

// Helper to map JSON categories to our UI
function mapCategory(type) {
    if (!type) return 'accessories';
    const t = type.toLowerCase();
    if (t.includes('fashion')) return 'fashion';
    if (t.includes('shoes')) return 'shoes';
    if (t.includes('watch') || t.includes('earbuds') || t.includes('charger')) return 'electronics';
    if (t.includes('pet') || t.includes('dog') || t.includes('cat')) return 'pets';
    return 'accessories';
}

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
                category: mapCategory(p.productType),
                image: p.thumbnail || "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80",
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
const cartBadge = document.getElementById('cartBadge');
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
// Initialization
// ============================================
async function init() {
    await loadExtractedProducts();

    // Inject mock sizes and smart colors for advanced filtering
    const allColors = ['black', 'white', 'red', 'blue', 'beige', 'pink', 'green', 'yellow', 'brown', 'grey'];
    const sizes = ['XS', 'S', 'M', 'L', 'XL'];
    products.forEach(p => {
        if (!p.colors) {
            // Try to extract color from title
            let foundColors = allColors.filter(c => p.name.toLowerCase().includes(c));
            if (foundColors.length === 0) {
                // Deterministic fallback based on ID so it's always the same
                foundColors = [allColors[p.id % allColors.length]];
            }
            p.colors = foundColors;
        }
        if (!p.sizes) {
            // Deterministic sizes based on ID
            const numSizes = (p.id % 3) + 2; // 2 to 4 sizes
            p.sizes = sizes.slice(0, numSizes);
        }
    });

    if (productGrids.length > 0 && typeof renderProducts === 'function') {
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
                    <img src="${p.image}" alt="${p.name}" loading="lazy">
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

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
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
// Render Products
// ============================================
function renderProducts(items) {
    const limitedItems = items.slice(0, 48);
    productGrids.forEach(grid => {
        grid.innerHTML = limitedItems.length ? '' : '<p style="grid-column:1/-1; text-align:center; color:var(--text-muted); padding:4rem 0; font-size:1.1rem;">No products found.</p>';

        limitedItems.forEach((product, index) => {
            const card = document.createElement('div');
            card.className = 'product-card fade-in';
            card.style.animationDelay = `${index * 0.08}s`;

            let priceHTML = `<div class="product-price">₹${Math.round(product.price * EXCHANGE_RATE_INR)}</div>`;
            if (product.comparePrice) {
                const pINR = Math.round(product.price * EXCHANGE_RATE_INR);
                const cINR = Math.round(product.comparePrice * EXCHANGE_RATE_INR);
                priceHTML = `<span class="compare-price">₹${cINR}</span><span class="sale-price">Offer Price ₹${pINR}</span>`;
            } else {
                const pINR = Math.round(product.price * EXCHANGE_RATE_INR);
                priceHTML = `<div class="product-price">₹${pINR}</div>`;
            }

            const isWished = wishlist.includes(product.id);
            // Build badge HTML — minimalist high-fashion approach
            const badgeSlug = product.badge ? product.badge.toLowerCase().replace(' ', '-') : '';
            const badgeHTML = product.badge
                ? `<div class="product-badge product-badge--${badgeSlug}">${product.badge}</div>`
                : '';
            card.innerHTML = `
                <div class="product-img-wrapper">
                    <a href="product.html?id=${product.id}">
                        <img src="${product.image}" alt="${product.name}" loading="lazy" style="cursor: pointer;">
                    </a>
                    ${badgeHTML}
                    <button class="mobile-float-btn left tooltip" data-tooltip="Similar Products" onclick="event.stopPropagation();"><i class="fa-regular fa-clone"></i></button>
                    <button class="mobile-float-btn right" onclick="toggleWishlist(${product.id}, this, event)"><i class="${isWished ? 'fa-solid' : 'fa-regular'} fa-heart" ${isWished ? 'style="color:#d4736d;"' : ''}></i></button>
                    <div class="product-actions">
                        <button class="action-btn quick-add" onclick="addToCart(${product.id}, event)">Add to Cart</button>
                        <button class="action-btn buy-now" onclick="buyNow(${product.id}, event)">Buy Now</button>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name"><a href="product.html?id=${product.id}" style="color:inherit;">${product.name}</a></h3>
                    <div class="price-container">${priceHTML}</div>
                </div>
            `;
            grid.appendChild(card);
        });
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
                <a href="product.html?id=${p.id}"><img src="${p.image}" alt="${p.name}" style="width:70px; height:90px; object-fit:cover; border-radius:6px;"></a>
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
                        <img src="${p.image}" alt="${p.name}" loading="lazy">
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
        const params = new URLSearchParams(window.location.search);
        const urlCat = params.get('cat');
        const urlQ = params.get('q') ? params.get('q').toLowerCase() : null;

        const filtered = products.filter(p => {
            const passPrice = p.price <= maxPrice;
            
            // Special categories that don't have checkboxes
            let passSpecialCat = true;
            if (urlCat === 'sale') {
                passSpecialCat = !!p.comparePrice || !!p.badge && p.badge.toLowerCase() === 'sale';
            } else if (urlCat === 'new') {
                passSpecialCat = !!p.badge && p.badge.toLowerCase() === 'new';
            }

            // Checkbox categories
            let passCat = activeCats.length === 0 || activeCats.includes(p.category);
            
            // If urlCat is 'sale' or 'new', we ignore the activeCats array for filtering if it's empty
            if ((urlCat === 'sale' || urlCat === 'new') && activeCats.length === 0) {
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

        renderProducts(filtered);
    }

    function updateActiveTags() {
        if (!activeFiltersContainer) return;
        activeFiltersContainer.innerHTML = '';
        
        const params = new URLSearchParams(window.location.search);
        const urlCat = params.get('cat');
        const urlQ = params.get('q');

        if (urlQ) {
            activeFiltersContainer.innerHTML += `<div class="active-tag" style="background:var(--accent);color:#000;">Search: "${urlQ}" <a href="category.html" style="color:inherit;margin-left:4px;"><i class="fa-solid fa-xmark"></i></a></div>`;
        }
        if (urlCat === 'sale') {
            activeFiltersContainer.innerHTML += `<div class="active-tag" style="background:#ffb6c1;color:#000;">Offers <a href="category.html" style="color:inherit;margin-left:4px;"><i class="fa-solid fa-xmark"></i></a></div>`;
        } else if (urlCat === 'new') {
            activeFiltersContainer.innerHTML += `<div class="active-tag" style="background:#000;color:#fff;">New Arrivals <a href="category.html" style="color:inherit;margin-left:4px;"><i class="fa-solid fa-xmark"></i></a></div>`;
        }

        if (activeSize) {
            activeFiltersContainer.innerHTML += `<div class="active-tag">Size: ${activeSize} <i class="fa-solid fa-xmark" onclick="removeFilter('size')"></i></div>`;
        }
        if (activeColor) {
            activeFiltersContainer.innerHTML += `<div class="active-tag">Color: <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${activeColor};border:1px solid #ddd;"></span> <i class="fa-solid fa-xmark" onclick="removeFilter('color')"></i></div>`;
        }
        activeCats.forEach(cat => {
            activeFiltersContainer.innerHTML += `<div class="active-tag" style="text-transform:capitalize;">${cat} <i class="fa-solid fa-xmark" onclick="removeFilter('cat', '${cat}')"></i></div>`;
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

    // Parse URL params
    const params = new URLSearchParams(window.location.search);
    const urlCat = params.get('cat');
    if (urlCat) {
        catCheckboxes.forEach(cb => {
            if (cb.value === urlCat) cb.checked = true;
        });
    }

    // Initialize state
    updateFilterState();
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
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img" loading="lazy">
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
    const email = document.getElementById('authEmail').value;
    const nameInput = document.getElementById('authName').value;
    
    const name = currentAuthTab === 'signup' ? nameInput : email.split('@')[0];
    
    currentUser = { name: name, email: email };
    localStorage.setItem('shiningstore_session', JSON.stringify(currentUser));
    
    updateAuthUI();
    toggleAuthModal(false); // close modal
    
    // Simple toast or alert
    alert(currentAuthTab === 'signup' ? 'Account created successfully!' : 'Logged in successfully!');
    
    // Reset form
    const authForm = document.getElementById('authForm');
    if(authForm) authForm.reset();
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
                <i class="fa-solid fa-headset"></i>
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
                <img src="${p.image}" class="chat-product-img" alt="${p.name}">
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
            'electronics': ['charger', 'earbud', 'watch', 'cable', 'tech'],
            'tech': ['electronics', 'charger', 'earbud', 'watch', 'cable'],
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
            • We offer **Free Global Shipping** on all orders over $50.<br>
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
