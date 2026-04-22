const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3000/api' : '/api';

let foodData = [];
let restaurantData = [];
let cart = [];
let favorites = [];
let orderHistory = JSON.parse(sessionStorage.getItem('orderHistory')) || [];

// DOM Elements
const foodGrid = document.getElementById('foodGrid');
const restaurantGrid = document.getElementById('restaurantGrid');
const categoryBtns = document.querySelectorAll('.category-pill');
const cartToggleBtn = document.getElementById('cartToggleBtn');
const cartSidebar = document.getElementById('cartSidebar');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartBadge = document.getElementById('cartBadge');
const subtotalAmount = document.getElementById('subtotalAmount');
const deliveryAmount = document.getElementById('deliveryAmount');
const totalAmount = document.getElementById('totalAmount');
const toastContainer = document.getElementById('toastContainer');
const favoritesGrid = document.getElementById('favoritesGrid');
const favEmptyState = document.getElementById('favEmptyState');
const historyList = document.getElementById('historyList');
const historyEmptyState = document.getElementById('historyEmptyState');

// Initialization
async function init() {
    // Update User Profile UI
    const currentUserName = sessionStorage.getItem('currentUserName');
    const userFavorites = JSON.parse(sessionStorage.getItem('userFavorites')) || [];
    favorites = userFavorites;

    if (currentUserName) {
        // Sidebar Profile
        const userNameEl = document.querySelector('.user-name');
        const userImgEl = document.querySelector('.user-profile img');
        if (userNameEl) userNameEl.textContent = currentUserName;
        if (userImgEl) {
            userImgEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}&background=ff5e3a&color=fff&rounded=true`;
        }

        // Settings Profile
        const currentEmail = sessionStorage.getItem('currentEmail');
        const settingsNameEl = document.getElementById('settingsName');
        const settingsEmailEl = document.getElementById('settingsEmail');
        const settingsAvatarEl = document.getElementById('settingsAvatar');

        if (settingsNameEl) settingsNameEl.textContent = currentUserName;
        if (settingsEmailEl) settingsEmailEl.textContent = currentEmail || 'user@example.com';
        if (settingsAvatarEl) {
            settingsAvatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserName)}&background=ff5e3a&color=fff&size=100&rounded=true`;
        }
    }

    // Fetch Initial Data
    try {
        const [foodRes, restRes] = await Promise.all([
            fetch(`${API_URL}/menu`),
            fetch(`${API_URL}/restaurants`)
        ]);

        foodData = await foodRes.json();
        restaurantData = await restRes.json();

        renderFoodItems('all');
        renderRestaurants();
        renderFavorites();
        renderHistory();
        setupEventListeners();
    } catch (err) {
        console.warn('Backend not detected. Loading static fallback data for GitHub Pages!');

        // Static Mock Data for GitHub pages
        foodData = [
            { "id": 1, "title": "Classic Cheeseburger", "category": "burger", "price": 14.99, "rating": 4.8, "img": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80", "desc": "Juicy beef patty with melted cheddar." },
            { "id": 2, "title": "Margherita Pizza", "category": "pizza", "price": 18.50, "rating": 4.9, "img": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80", "desc": "Fresh tomatoes, mozzarella, and basil." },
            { "id": 4, "title": "Gourmet Mushroom Burger", "category": "burger", "price": 16.50, "rating": 4.6, "img": "mushroom_burger.png", "desc": "Truffle mayo, swiss cheese, roasted mushrooms." },
            { "id": 5, "title": "Avocado Quinoa Bowl", "category": "salad", "price": 16.00, "rating": 4.5, "img": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop", "desc": "Organic quinoa, fresh sliced avocado, cherry tomatoes, and lemon-tahini dressing." },
            { "id": 6, "title": "Mediterranean Salad", "category": "salad", "price": 15.50, "rating": 4.4, "img": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800&auto=format&fit=crop", "desc": "Crisp romaine, kalamata olives, feta cheese, cucumber, and Greek vinaigrette." },
            { "id": 7, "title": "Molten Chocolate Lava", "category": "dessert", "price": 9.50, "rating": 4.9, "img": "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=800&auto=format&fit=crop", "desc": "Decadent chocolate cake with a warm gooey center, served with vanilla bean ice cream." },
            { "id": 8, "title": "Classic Cheesecake", "category": "dessert", "price": 8.00, "rating": 4.6, "img": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&auto=format&fit=crop", "desc": "New York style cheesecake with a handmade graham cracker crust and berry compote." }
        ];
        restaurantData = [
            { "id": 101, "name": "Burger Joint", "rating": 4.7, "time": "15-25 min", "tags": "Burgers, Fast Food", "img": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80" },
            { "id": 102, "name": "Pizza Heaven", "rating": 4.9, "time": "20-35 min", "tags": "Italian, Pizza", "img": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80" },
            { "id": 103, "name": "Sushi World", "rating": 4.8, "time": "25-40 min", "tags": "Japanese, Sushi", "img": "https://images.unsplash.com/photo-1553621042-f6e147245754?w=500&q=80" }
        ];

        renderFoodItems('all');
        renderRestaurants();
        renderFavorites();
        renderHistory();
        setupEventListeners();
    }

    // Logout logic
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('currentUserName');
            sessionStorage.removeItem('currentEmail');
            sessionStorage.removeItem('userFavorites');
            window.location.replace('login.html');
        });
    }
}

function renderRestaurants() {
    if (!restaurantGrid) return;
    restaurantGrid.innerHTML = '';
    restaurantData.forEach(rest => {
        const restCard = document.createElement('div');
        restCard.className = 'restaurant-card';
        restCard.innerHTML = `
            <div class="restaurant-img-wrapper">
                <img src="${rest.img}" alt="${rest.name}" class="restaurant-img" loading="lazy">
                <div class="restaurant-rating"><i class="fa-solid fa-star"></i> ${rest.rating}</div>
            </div>
            <div class="restaurant-info">
                <h3>${rest.name}</h3>
                <div class="restaurant-meta">
                    <span class="location"><i class="fa-solid fa-location-dot"></i> ${rest.location}</span>
                    <span class="distance">${rest.distance}</span>
                </div>
            </div>
        `;
        restaurantGrid.appendChild(restCard);
    });
}

function setupEventListeners() {
    // Navigation
    const navLinks = document.querySelectorAll('.nav-links li');
    const viewSections = document.querySelectorAll('.view-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active classes
            navLinks.forEach(l => l.classList.remove('active'));
            viewSections.forEach(v => v.classList.remove('active'));

            // Add active to clicked target
            link.classList.add('active');
            const targetId = link.dataset.target;
            const targetView = document.getElementById(targetId);
            if (targetView) {
                targetView.classList.add('active');
            }
        });
    });

    // Category Filtering
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderFoodItems(btn.dataset.category);
        });
    });

    // Cart Toggle
    cartToggleBtn.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);

    // Order Now Scroll
    const orderNowBtn = document.getElementById('orderNowBtn');
    if (orderNowBtn) {
        orderNowBtn.addEventListener('click', () => {
            const itemsSection = document.querySelector('.categories');
            if (itemsSection) {
                itemsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        // Init state
        const isLightMode = localStorage.getItem('theme') === 'light';
        if (isLightMode) {
            document.body.classList.add('light-mode');
            darkModeToggle.checked = false;
        }

        darkModeToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.remove('light-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.add('light-mode');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // Checkout Logic
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast('Your cart is empty!');
                return;
            }

            // Close cart
            toggleCart();

            // Populate Payment Total
            const paymentTotalAmount = document.getElementById('paymentTotalAmount');
            if (paymentTotalAmount && totalAmount) {
                paymentTotalAmount.textContent = totalAmount.textContent;
            }

            // Switch to Payment View
            document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
            document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
            const paymentView = document.getElementById('paymentView');
            if (paymentView) {
                paymentView.classList.add('active');
                window.scrollTo(0, 0);
            }
        });
    }

    // Payment Simulation Logic
    const paymentForm = document.getElementById('paymentForm');

    const simulatePaymentFlow = () => {
        // Create Global Checkout Overlay if it doesn't exist
        let globalCheckoutOverlay = document.getElementById('globalCheckoutOverlay');
        if (!globalCheckoutOverlay) {
            globalCheckoutOverlay = document.createElement('div');
            globalCheckoutOverlay.id = 'globalCheckoutOverlay';
            globalCheckoutOverlay.className = 'global-checkout-overlay';
            document.body.appendChild(globalCheckoutOverlay);
        }

        globalCheckoutOverlay.innerHTML = `
            <div class="checkout-content">
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                <h2>Processing Payment...</h2>
                <p>Please do not refresh the page or close this window.</p>
            </div>
        `;
        globalCheckoutOverlay.classList.add('active');

        // Simulate Network Request
        setTimeout(() => {
            globalCheckoutOverlay.innerHTML = `
                <div class="checkout-content">
                    <i class="fa-solid fa-circle-check"></i>
                    <h2>Payment Successful!</h2>
                    <p>Your order is confirmed and will be delivered shortly.</p>
                </div>
            `;

            // Save Order to History
            const paymentTotalAmount = document.getElementById('paymentTotalAmount');
            if (cart.length > 0) {
                const newOrder = {
                    id: Math.floor(100000 + Math.random() * 900000).toString(),
                    date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    items: [...cart],
                    total: paymentTotalAmount ? paymentTotalAmount.textContent.replace('₹', '') : '0'
                };
                orderHistory.unshift(newOrder);
                sessionStorage.setItem('orderHistory', JSON.stringify(orderHistory));
                renderHistory();
            }

            // Empty cart
            cart = [];
            updateCartUI();

            // Close and reset back to Home
            setTimeout(() => {
                globalCheckoutOverlay.classList.remove('active');

                // Reset Form
                if (paymentForm) paymentForm.reset();

                // Go to Home
                document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
                const homeView = document.getElementById('homeView');
                if (homeView) homeView.classList.add('active');

                // Set nav link to home
                document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
                const homeLink = document.querySelector('.nav-links li[data-target="homeView"]');
                if (homeLink) homeLink.classList.add('active');

            }, 3000);
        }, 2500);
    };

    // Bind Payments
    if (paymentForm) {
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            simulatePaymentFlow();
        });
    }

    const gpayBtn = document.getElementById('gpayBtn');
    if (gpayBtn) gpayBtn.addEventListener('click', simulatePaymentFlow);

    const phonepeBtn = document.getElementById('phonepeBtn');
    if (phonepeBtn) phonepeBtn.addEventListener('click', simulatePaymentFlow);
}


function renderFoodItems(category) {
    foodGrid.innerHTML = '';

    const filteredFood = category === 'all'
        ? foodData
        : foodData.filter(item => item.category === category);

    filteredFood.forEach(item => {
        const foodCard = document.createElement('div');
        foodCard.className = 'food-card';
        const isFav = favorites.includes(item.id);
        foodCard.innerHTML = `
            <div class="food-img-wrapper">
                <img src="${item.img}" alt="${item.title}" class="food-img" loading="lazy">
                <div class="food-rating"><i class="fa-solid fa-star"></i> ${item.rating}</div>
                <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite(${item.id})">
                    <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
                </button>
            </div>
            <div class="food-info">
                <h3>${item.title}</h3>
                <p class="food-desc">${item.desc}</p>
                <div class="food-footer">
                    <div class="food-price"><span>₹</span>${item.price.toFixed(2)}</div>
                    <button class="add-btn" onclick="addToCart(${item.id})">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>
            </div>
        `;
        foodGrid.appendChild(foodCard);
    });
}

// Cart Logic
function addToCart(id) {
    const item = foodData.find(f => f.id === id);
    const existingItem = cart.find(c => c.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }

    updateCartUI();
    showToast(`Added ${item.title} to cart`);
}

function removeFromCart(id, removeAll = false) {
    const itemIndex = cart.findIndex(c => c.id === id);
    if (itemIndex > -1) {
        if (removeAll || cart[itemIndex].quantity === 1) {
            cart.splice(itemIndex, 1);
        } else {
            cart[itemIndex].quantity -= 1;
        }
        updateCartUI();
    }
}

function updateCartUI() {
    renderCartItems();
    updateCartTotals();

    // Update badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;

    // Animate badge
    cartBadge.style.transform = 'scale(1.3)';
    setTimeout(() => {
        cartBadge.style.transform = 'scale(1)';
    }, 200);
}

function renderCartItems() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-message">
                <i class="fa-solid fa-basket-shopping"></i>
                <p>Your cart is empty.</p>
            </div>
        `;
        return;
    }

    cartItemsContainer.innerHTML = '';
    cart.forEach(item => {
        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        cartItemEl.innerHTML = `
            <img src="${item.img}" alt="${item.title}" class="cart-item-img">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
            </div>
            <div class="cart-item-actions">
                <button class="remove-item" onclick="removeFromCart(${item.id}, true)">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="removeFromCart(${item.id})"><i class="fa-solid fa-minus"></i></button>
                    <span class="qty">${item.quantity}</span>
                    <button class="qty-btn" onclick="addToCart(${item.id})"><i class="fa-solid fa-plus"></i></button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemEl);
    });
}

function updateCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = subtotal > 0 ? 40.00 : 0; // Flat ₹40 delivery if cart not empty
    const total = subtotal + delivery;

    subtotalAmount.textContent = `₹${subtotal.toFixed(2)}`;
    deliveryAmount.textContent = `₹${delivery.toFixed(2)}`;
    totalAmount.textContent = `₹${total.toFixed(2)}`;
}

function toggleCart() {
    cartSidebar.classList.toggle('open');
    cartOverlay.classList.toggle('active');
}

// Toast Notifications
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>
        <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    // Remove toast element after animation completes
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Favorites Logic
async function toggleFavorite(id) {
    const email = sessionStorage.getItem('currentEmail');
    if (!email) return;

    try {
        const res = await fetch(`${API_URL}/user/favorite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, foodId: id })
        });

        const data = await res.json();
        if (data.success) {
            const wasFav = favorites.includes(id);
            favorites = data.favorites;
            sessionStorage.setItem('userFavorites', JSON.stringify(favorites));

            showToast(wasFav ? 'Removed from favorites' : 'Added to favorites ♥');

            const currentCategory = document.querySelector('.category-pill.active')?.dataset.category || 'all';
            renderFoodItems(currentCategory);
            renderFavorites();
        }
    } catch (err) {
        console.error('Failed to toggle favorite:', err);
    }
}

function renderFavorites() {
    if (!favoritesGrid || !favEmptyState) return;
    favoritesGrid.innerHTML = '';

    const favItems = foodData.filter(item => favorites.includes(item.id));

    if (favItems.length === 0) {
        favEmptyState.style.display = 'flex';
    } else {
        favEmptyState.style.display = 'none';

        favItems.forEach(item => {
            const foodCard = document.createElement('div');
            foodCard.className = 'food-card';
            foodCard.innerHTML = `
                <div class="food-img-wrapper">
                    <img src="${item.img}" alt="${item.title}" class="food-img" loading="lazy">
                    <div class="food-rating"><i class="fa-solid fa-star"></i> ${item.rating}</div>
                    <button class="fav-btn active" onclick="toggleFavorite(${item.id})">
                        <i class="fa-solid fa-heart"></i>
                    </button>
                </div>
                <div class="food-info">
                    <h3>${item.title}</h3>
                    <p class="food-desc">${item.desc}</p>
                    <div class="food-footer">
                        <div class="food-price"><span>₹</span>${item.price.toFixed(2)}</div>
                        <button class="add-btn" onclick="addToCart(${item.id})">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </div>
            `;
            favoritesGrid.appendChild(foodCard);
        });
    }
}

function renderHistory() {
    if (!historyList || !historyEmptyState) return;

    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    if (orderHistory.length === 0) {
        historyList.innerHTML = '';
        historyEmptyState.style.display = 'block';
        if (clearHistoryBtn) clearHistoryBtn.style.display = 'none';
        return;
    }

    historyEmptyState.style.display = 'none';
    if (clearHistoryBtn) clearHistoryBtn.style.display = 'inline-block';
    historyList.innerHTML = orderHistory.map(order => `
        <div class="history-card">
            <div class="history-header">
                <div>
                    <span class="history-id">Order #${order.id}</span>
                    <span class="history-status"><i class="fa-solid fa-check-circle"></i> Completed</span>
                </div>
                <div class="history-date">${order.date}</div>
            </div>
            <div class="history-body">
                <div class="history-items">
                    ${order.items.map(item => `
                        <div class="history-item-row">
                            <div class="history-item-name"><span class="history-item-qty">${item.quantity}x</span> ${item.name}</div>
                            <div>₹${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="history-footer">
                    <div class="history-total-label">Amount Paid</div>
                    <div class="history-total-value">₹${order.total}</div>
                </div>
            </div>
        </div>
    `).join('');
}

const clearHistoryBtn = document.getElementById('clearHistoryBtn');
if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
        orderHistory = [];
        sessionStorage.removeItem('orderHistory');
        renderHistory();
        showToast('Order history cleared!');
    });
}

// Ensure init runs when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
