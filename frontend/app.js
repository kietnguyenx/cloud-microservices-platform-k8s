/**
 * MAISON' DÉCOR - Luxury Minimalist Furniture Showroom App Logic
 * Tone màu & Phong cách tối giản phong cách Bắc Âu tối giản đương đại
 * Dữ liệu sản phẩm được đồng bộ tự động từ Backend RESTful API & Database
 */

// Cấu hình URL kết nối Backend API (hỗ trợ cả Live Server, Docker và K8s)
const API_BASE = (window.location.port === "3000" || window.location.port === "5500" || window.location.protocol === "file:") 
    ? "http://localhost:8000" 
    : "";

// =============================================================================
// 1. STATE ỨNG DỤNG (GIỎ HÀNG, BỘ LỌC, TÀI KHOẢN, ĐƠN HÀNG)
// =============================================================================
const AppState = {
    products: [],
    isLoading: true,
    currentCategory: "all",
    searchQuery: "",
    priceFilter: "all",
    sortOrder: "featured",
    cart: JSON.parse(localStorage.getItem("blanc_cart") || "[]"),
    orders: JSON.parse(localStorage.getItem("blanc_orders") || "[]"),
    user: JSON.parse(localStorage.getItem("blanc_user") || "null")
};

// Hàm định dạng tiền tệ VNĐ (ví dụ: 16.800.000₫)
function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount).replace('₫', '₫');
}

// =============================================================================
// 3. RENDER DANH SÁCH SẢN PHẨM & BỘ LỌC
// =============================================================================
function renderProducts() {
    const grid = document.getElementById("products-grid");
    const countDisplay = document.getElementById("product-count-display");
    const emptyState = document.getElementById("empty-state");
    const activeTagsBox = document.getElementById("active-filter-tags");
    const tagCategory = document.getElementById("tag-category");
    const tagPrice = document.getElementById("tag-price");

    if (AppState.isLoading) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
                <div style="display: inline-block; width: 36px; height: 36px; border: 3px solid rgba(140,109,88,0.2); border-top-color: #8c6d58; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 16px;"></div>
                <p style="font-size: 0.95rem; font-weight: 500;">Đang đồng bộ dữ liệu từ Database...</p>
            </div>
        `;
        if (emptyState) emptyState.style.display = "none";
        return;
    }

    // Lọc theo Category
    let filtered = AppState.products.filter(item => {
        if (AppState.currentCategory !== "all" && item.category !== AppState.currentCategory) {
            return false;
        }

        // Lọc theo từ khóa tìm kiếm
        if (AppState.searchQuery.trim() !== "") {
            const q = AppState.searchQuery.toLowerCase().trim();
            const matchName = item.name.toLowerCase().includes(q);
            const matchCat = item.categoryName.toLowerCase().includes(q);
            const matchMaterial = item.material.toLowerCase().includes(q);
            if (!matchName && !matchCat && !matchMaterial) return false;
        }

        // Lọc theo mức giá
        if (AppState.priceFilter === "under-5m" && item.price >= 5000000) return false;
        if (AppState.priceFilter === "5m-15m" && (item.price < 5000000 || item.price > 15000000)) return false;
        if (AppState.priceFilter === "above-15m" && item.price <= 15000000) return false;

        return true;
    });

    // Sắp xếp
    if (AppState.sortOrder === "price-asc") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (AppState.sortOrder === "price-desc") {
        filtered.sort((a, b) => b.price - a.price);
    } else if (AppState.sortOrder === "rating-desc") {
        filtered.sort((a, b) => b.rating - a.rating);
    } else {
        // featured: giữ nguyên hoặc ưu tiên badge featured
        filtered.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0));
    }

    // Hiển thị số lượng
    countDisplay.textContent = filtered.length;

    // Cập nhật tag lọc
    const hasFilter = AppState.currentCategory !== "all" || AppState.priceFilter !== "all" || AppState.searchQuery !== "";
    if (hasFilter) {
        activeTagsBox.style.display = "flex";
        const catMap = {
            "living-room": "Phòng Khách",
            "dining": "Bàn Ăn & Bếp",
            "bedroom": "Phòng Ngủ",
            "workspace": "Góc Làm Việc",
            "decor": "Đèn & Decor"
        };
        tagCategory.textContent = catMap[AppState.currentCategory] || "Tất cả phòng";
        const priceMap = {
            "under-5m": "< 5.000.000₫",
            "5m-15m": "5 - 15 triệu",
            "above-15m": "> 15.000.000₫"
        };
        tagPrice.textContent = priceMap[AppState.priceFilter] || "Tất cả mức giá";
    } else {
        activeTagsBox.style.display = "none";
    }

    if (filtered.length === 0) {
        grid.innerHTML = "";
        emptyState.style.display = "block";
        return;
    }

    const isAdmin = AppState.user && AppState.user.role === "admin";
    const btnAdminAdd = document.getElementById("btn-admin-add-product");
    if (btnAdminAdd) {
        btnAdminAdd.style.display = isAdmin ? "inline-flex" : "none";
    }

    grid.innerHTML = filtered.map(item => `
        <article class="product-card" data-id="${item.id}">
            <div class="product-thumb-wrap">
                ${item.badge ? `<span class="product-card-badge badge-${item.badgeType}">${item.badge}</span>` : ''}
                <img src="${item.image}" alt="${item.name}" class="product-thumb" loading="lazy">
                <div class="product-thumb-actions">
                    <button type="button" class="btn-quickview" onclick="openProductModal(${item.id})">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        Xem Nhanh
                    </button>
                </div>
            </div>
            <div class="product-body">
                <span class="product-category-name">${item.categoryName}</span>
                <h3 class="product-name" onclick="openProductModal(${item.id})">${item.name}</h3>
                <p class="product-specs">${item.material} &bull; ${item.dimensions}</p>
                <div class="product-rating">
                    ${'★'.repeat(Math.floor(item.rating))}
                    <span>${item.rating} (${item.reviewsCount})</span>
                </div>
                <div class="product-footer">
                    <div class="product-price-box">
                        <span class="price-current">${formatVND(item.price)}</span>
                        ${item.originalPrice ? `<span class="price-old">${formatVND(item.originalPrice)}</span>` : ''}
                    </div>
                    <button type="button" class="btn-add-cart" onclick="addToCart(${item.id})">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                        Thêm Vào Giỏ
                    </button>
                </div>
            </div>
            ${isAdmin ? `
                <div class="product-admin-bar">
                    <button type="button" class="btn-card-admin-edit" onclick="openAdminEditModal(${item.id})" title="Chỉnh sửa thông tin món hàng">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        Sửa
                    </button>
                    <button type="button" class="btn-card-admin-delete" onclick="handleAdminDeleteProduct(${item.id})" title="Xóa món hàng khỏi showroom">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        Xóa
                    </button>
                </div>
            ` : ''}
        </article>
    `).join("");
}

// =============================================================================
// 4. QUẢN LÝ GIỎ HÀNG (CART STATE & SLIDE DRAWER)
// =============================================================================
function saveCart() {
    localStorage.setItem("blanc_cart", JSON.stringify(AppState.cart));
    updateCartBadge();
}

function updateCartBadge() {
    const badge = document.getElementById("cart-badge");
    const totalCount = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalCount;
}

function addToCart(productId, quantity = 1) {
    const product = AppState.products.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = AppState.cart.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
        AppState.cart[existingIndex].quantity += quantity;
    } else {
        AppState.cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            material: product.material,
            dimensions: product.dimensions,
            quantity: quantity
        });
    }

    saveCart();
    renderCart();
    showToast(`Đã thêm "${product.name}" vào giỏ hàng!`);
}

function updateCartQty(productId, delta) {
    const item = AppState.cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    saveCart();
    renderCart();
}

function removeFromCart(productId) {
    AppState.cart = AppState.cart.filter(i => i.id !== productId);
    saveCart();
    renderCart();
    showToast("Đã xóa sản phẩm khỏi giỏ hàng.");
}

function renderCart() {
    const body = document.getElementById("cart-drawer-body");
    const countText = document.getElementById("cart-drawer-count");
    const subtotalEl = document.getElementById("cart-subtotal");
    const totalEl = document.getElementById("cart-total");
    const footer = document.getElementById("cart-drawer-footer");

    const totalCount = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
    countText.textContent = `(${totalCount} sản phẩm)`;

    if (AppState.cart.length === 0) {
        body.innerHTML = `
            <div style="text-align: center; padding: 48px 16px; color: var(--text-muted);">
                <div style="font-size: 3rem; margin-bottom: 12px;">🛍️</div>
                <h4 style="color: var(--text-primary); margin-bottom: 8px;">Giỏ hàng của bạn đang trống</h4>
                <p style="font-size: 0.88rem; margin-bottom: 20px;">Hãy dạo xem các bộ sưu tập nội thất tuyệt đẹp của MAISON' DÉCOR.</p>
                <button type="button" class="btn-primary" onclick="closeCart(); document.getElementById('catalog').scrollIntoView();">Khám Phá Sản Phẩm</button>
            </div>
        `;
        footer.style.display = "none";
        return;
    }

    footer.style.display = "block";
    const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    subtotalEl.textContent = formatVND(subtotal);
    totalEl.textContent = formatVND(subtotal);

    body.innerHTML = AppState.cart.map(item => `
        <div class="cart-item-row">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
                <div>
                    <h4 class="cart-item-title">${item.name}</h4>
                    <span class="cart-item-specs">${item.material}</span>
                </div>
                <div class="cart-item-bottom">
                    <div class="qty-control">
                        <button type="button" class="qty-btn" onclick="updateCartQty(${item.id}, -1)">-</button>
                        <span class="qty-number">${item.quantity}</span>
                        <button type="button" class="qty-btn" onclick="updateCartQty(${item.id}, 1)">+</button>
                    </div>
                    <div>
                        <span class="cart-item-price">${formatVND(item.price * item.quantity)}</span>
                        <button type="button" class="btn-remove-item" onclick="removeFromCart(${item.id})">Xóa</button>
                    </div>
                </div>
            </div>
        </div>
    `).join("");
}

function openCart() {
    renderCart();
    document.getElementById("cart-drawer-overlay").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeCart() {
    document.getElementById("cart-drawer-overlay").classList.remove("active");
    document.body.style.overflow = "";
}

// =============================================================================
// 5. MODAL XEM CHI TIẾT SẢN PHẨM (QUICK VIEW)
// =============================================================================
function openProductModal(productId) {
    const product = AppState.products.find(p => p.id === productId);
    if (!product) return;

    const modalContent = document.getElementById("product-modal-content");
    modalContent.innerHTML = `
        <div class="modal-img-col">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="modal-info-col">
            <span class="product-category-name">${product.categoryName}</span>
            <h3>${product.name}</h3>
            <div class="modal-price-wrap">
                <span class="current">${formatVND(product.price)}</span>
                ${product.originalPrice ? `<span class="price-old">${formatVND(product.originalPrice)}</span>` : ''}
            </div>
            <p class="modal-desc">${product.description}</p>
            <div class="modal-specs-table">
                <div class="spec-row">
                    <span>Chất liệu:</span>
                    <span>${product.material}</span>
                </div>
                <div class="spec-row">
                    <span>Kích thước:</span>
                    <span>${product.dimensions}</span>
                </div>
                <div class="spec-row">
                    <span>Chính sách bảo hành:</span>
                    <span>24 tháng chính hãng tại nhà</span>
                </div>
                <div class="spec-row">
                    <span>Tình trạng kho:</span>
                    <span style="color: #2b7a4b;">✓ Sẵn hàng tại Showroom</span>
                </div>
            </div>
            <div class="modal-actions-row">
                <button type="button" class="btn-primary btn-block" onclick="addToCart(${product.id}); closeProductModal();">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                    Thêm Vào Giỏ Hàng
                </button>
            </div>
        </div>
    `;

    document.getElementById("product-modal-overlay").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeProductModal() {
    document.getElementById("product-modal-overlay").classList.remove("active");
    document.body.style.overflow = "";
}

// =============================================================================
// 6. CHECKOUT & ĐẶT HÀNG NỘI THẤT
// =============================================================================
function openCheckout() {
    if (AppState.cart.length === 0) {
        showToast("Giỏ hàng của bạn đang trống.");
        return;
    }

    closeCart();

    const countEl = document.getElementById("checkout-items-count");
    const totalEl = document.getElementById("checkout-total-amount");
    const totalCount = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    countEl.textContent = `${totalCount} sản phẩm`;
    totalEl.textContent = formatVND(subtotal);

    // Tự động điền thông tin nếu user đã đăng nhập
    if (AppState.user) {
        document.getElementById("checkout-name").value = AppState.user.full_name || AppState.user.username;
        document.getElementById("checkout-phone").value = AppState.user.phone || "";
        document.getElementById("checkout-address").value = AppState.user.address || "";
    }

    document.getElementById("checkout-modal-overlay").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeCheckout() {
    document.getElementById("checkout-modal-overlay").classList.remove("active");
    document.body.style.overflow = "";
}

function handleCheckoutSubmit(e) {
    e.preventDefault();

    const name = document.getElementById("checkout-name").value.trim();
    const phone = document.getElementById("checkout-phone").value.trim();
    const address = document.getElementById("checkout-address").value.trim();
    const notes = document.getElementById("checkout-notes").value.trim();
    const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;

    const totalAmount = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderCode = "MSN-" + Math.floor(1000 + Math.random() * 9000);

    const newOrder = {
        code: orderCode,
        createdAt: new Date().toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
        customerName: name,
        phone: phone,
        address: address,
        notes: notes,
        paymentMethod: paymentMethod === "cod" ? "Thanh toán COD khi nhận" : "Chuyển khoản QR",
        totalAmount: totalAmount,
        status: "Đang chuẩn bị hàng",
        statusClass: "status-shipping",
        items: [...AppState.cart]
    };

    AppState.orders.unshift(newOrder);
    localStorage.setItem("blanc_orders", JSON.stringify(AppState.orders));

    // Đồng bộ đơn hàng lên Backend Database
    try {
        fetch(`${API_BASE}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                customer_name: name,
                customer_phone: phone,
                shipping_address: address,
                notes: notes,
                payment_method: paymentMethod,
                items: AppState.cart.map(c => ({
                    product_id: c.id,
                    product_name: c.name,
                    product_image: c.image,
                    price: c.price,
                    quantity: c.quantity,
                    subtotal: c.price * c.quantity
                }))
            })
        }).catch(err => console.log("Đơn lưu local:", err));
    } catch (_) {}

    // Dọn giỏ hàng
    AppState.cart = [];
    saveCart();

    closeCheckout();

    // Hiển thị modal thành công
    document.getElementById("success-order-code").textContent = orderCode;
    document.getElementById("success-modal-overlay").classList.add("active");
}

// =============================================================================
// 7. LỊCH SỬ ĐƠN HÀNG (ORDERS HISTORY)
// =============================================================================
function openOrderHistory() {
    const listContainer = document.getElementById("orders-list-container");

    if (AppState.orders.length === 0) {
        listContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 16px; color: var(--text-muted);">
                <div style="font-size: 2.5rem; margin-bottom: 8px;">📦</div>
                <h4>Bạn chưa có đơn đặt hàng nào</h4>
                <p style="font-size: 0.85rem;">Các đơn hàng nội thất sau khi đặt sẽ được lưu và hiển thị tại đây.</p>
            </div>
        `;
    } else {
        listContainer.innerHTML = AppState.orders.map(order => `
            <div class="order-card-row">
                <div class="order-card-header">
                    <div>
                        <strong>Mã đơn: ${order.code}</strong>
                        <div style="font-size: 0.78rem; color: var(--text-muted);">${order.createdAt}</div>
                    </div>
                    <span class="status-badge ${order.statusClass}">${order.status}</span>
                </div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">
                    <div><strong>Giao đến:</strong> ${order.customerName} &bull; ${order.phone}</div>
                    <div><strong>Địa chỉ:</strong> ${order.address}</div>
                    <div><strong>Thanh toán:</strong> ${order.paymentMethod}</div>
                </div>
                <div style="border-top: 1px dashed var(--border-color); padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.85rem;">${order.items.length} món đồ nội thất</span>
                    <strong style="color: var(--accent); font-size: 1.05rem;">${formatVND(order.totalAmount)}</strong>
                </div>
            </div>
        `).join("");
    }

    document.getElementById("orders-modal-overlay").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeOrderHistory() {
    document.getElementById("orders-modal-overlay").classList.remove("active");
    document.body.style.overflow = "";
}

// =============================================================================
// 8. ĐĂNG NHẬP / ĐĂNG KÝ (AUTH)
// =============================================================================
function openAuthModal() {
    if (AppState.user) {
        const roleDesc = AppState.user.role === "admin" ? " [QUẢN TRỊ VIÊN ADMIN]" : "";
        if (confirm(`Chào bạn ${AppState.user.full_name || AppState.user.username}${roleDesc}!\n\nBạn có muốn đăng xuất tài khoản?`)) {
            AppState.user = null;
            localStorage.removeItem("blanc_user");
            updateAuthDisplay();
            renderProducts();
            showToast("Đã đăng xuất tài khoản.");
        }
        return;
    }
    document.getElementById("auth-modal-overlay").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeAuthModal() {
    document.getElementById("auth-modal-overlay").classList.remove("active");
    document.body.style.overflow = "";
}

function updateAuthDisplay() {
    const label = document.getElementById("auth-label");
    if (AppState.user) {
        if (AppState.user.role === "admin") {
            label.textContent = "Admin";
            label.style.color = "#8c6d58";
            label.style.fontWeight = "700";
        } else {
            label.textContent = AppState.user.username;
            label.style.color = "";
            label.style.fontWeight = "";
        }
    } else {
        label.textContent = "Tài khoản";
        label.style.color = "";
        label.style.fontWeight = "";
    }
}

// =============================================================================
// 9. TOAST THÔNG BÁO TƯƠNG TÁC
// =============================================================================
function showToast(message, isAccent = true) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${isAccent ? 'toast-accent' : ''}`;
    toast.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(20px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

// =============================================================================
// 10. HERO SLIDER LOGIC (ẢNH CHẠY Y HỆT WEB BLANC.VN)
// =============================================================================
let currentHeroSlide = 0;
let heroSliderInterval = null;

function initHeroSlider() {
    const slides = document.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".slider-dot");
    const prevBtn = document.getElementById("hero-slider-prev");
    const nextBtn = document.getElementById("hero-slider-next");
    const sliderSection = document.getElementById("hero");

    if (!slides.length) return;

    function goToSlide(index) {
        if (index < 0) {
            currentHeroSlide = slides.length - 1;
        } else if (index >= slides.length) {
            currentHeroSlide = 0;
        } else {
            currentHeroSlide = index;
        }

        slides.forEach((slide, idx) => {
            slide.classList.toggle("active", idx === currentHeroSlide);
        });

        dots.forEach((dot, idx) => {
            dot.classList.toggle("active", idx === currentHeroSlide);
        });
    }

    function startAutoSlide() {
        stopAutoSlide();
        heroSliderInterval = setInterval(() => {
            goToSlide(currentHeroSlide + 1);
        }, 4000);
    }

    function stopAutoSlide() {
        if (heroSliderInterval) {
            clearInterval(heroSliderInterval);
            heroSliderInterval = null;
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            goToSlide(currentHeroSlide - 1);
            startAutoSlide();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            goToSlide(currentHeroSlide + 1);
            startAutoSlide();
        });
    }

    dots.forEach((dot, idx) => {
        dot.addEventListener("click", () => {
            goToSlide(idx);
            startAutoSlide();
        });
    });

    if (sliderSection) {
        sliderSection.addEventListener("mouseenter", stopAutoSlide);
        sliderSection.addEventListener("mouseleave", startAutoSlide);
    }

    startAutoSlide();
}

function filterByRoom(category) {
    const navItems = document.querySelectorAll(".nav-item");
    AppState.currentCategory = category;
    navItems.forEach(b => {
        b.classList.toggle("active", b.dataset.category === category);
    });
    renderProducts();
    const catalog = document.getElementById("catalog");
    if (catalog) {
        catalog.scrollIntoView({ behavior: "smooth" });
    }
}

// =============================================================================
// 11. GẮN SỰ KIỆN KHỞI TẠO (EVENT LISTENERS)
// =============================================================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Khởi tạo slider & render ban đầu
    initHeroSlider();
    updateCartBadge();
    updateAuthDisplay();
    renderProducts();

    // 2. Lọc danh mục phòng trên Navigation bar
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(btn => {
        btn.addEventListener("click", () => {
            navItems.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            AppState.currentCategory = btn.dataset.category;
            renderProducts();
            document.getElementById("catalog").scrollIntoView({ behavior: "smooth" });
        });
    });

    // 3. Khám phá theo thẻ Room Showcase
    const roomCards = document.querySelectorAll(".room-card");
    roomCards.forEach(card => {
        card.addEventListener("click", () => {
            const cat = card.dataset.category;
            AppState.currentCategory = cat;
            navItems.forEach(b => {
                b.classList.toggle("active", b.dataset.category === cat);
            });
            renderProducts();
            document.getElementById("catalog").scrollIntoView({ behavior: "smooth" });
        });
    });

    // 4. Tìm kiếm từ khóa
    const searchInput = document.getElementById("input-search");
    const clearSearchBtn = document.getElementById("btn-clear-search");

    searchInput.addEventListener("input", (e) => {
        AppState.searchQuery = e.target.value;
        clearSearchBtn.style.display = e.target.value ? "block" : "none";
        renderProducts();
    });

    clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        AppState.searchQuery = "";
        clearSearchBtn.style.display = "none";
        renderProducts();
    });

    // 5. Lọc mức giá & Sắp xếp
    document.getElementById("filter-price").addEventListener("change", (e) => {
        AppState.priceFilter = e.target.value;
        renderProducts();
    });

    document.getElementById("filter-sort").addEventListener("change", (e) => {
        AppState.sortOrder = e.target.value;
        renderProducts();
    });

    // 6. Reset Filters
    const resetFn = () => {
        AppState.currentCategory = "all";
        AppState.priceFilter = "all";
        AppState.searchQuery = "";
        searchInput.value = "";
        document.getElementById("filter-price").value = "all";
        navItems.forEach(b => b.classList.toggle("active", b.dataset.category === "all"));
        renderProducts();
    };

    document.getElementById("btn-reset-filters").addEventListener("click", resetFn);
    document.getElementById("btn-clear-filters").addEventListener("click", resetFn);

    // 7. Cart Drawer Toggles
    document.getElementById("btn-open-cart").addEventListener("click", openCart);
    document.getElementById("btn-close-cart").addEventListener("click", closeCart);
    document.getElementById("cart-drawer-overlay").addEventListener("click", (e) => {
        if (e.target.id === "cart-drawer-overlay") closeCart();
    });

    // 8. Product Detail Modal
    document.getElementById("btn-close-product-modal").addEventListener("click", closeProductModal);
    document.getElementById("product-modal-overlay").addEventListener("click", (e) => {
        if (e.target.id === "product-modal-overlay") closeProductModal();
    });

    // 9. Checkout Triggers
    document.getElementById("btn-checkout-from-cart").addEventListener("click", openCheckout);
    document.getElementById("btn-close-checkout").addEventListener("click", closeCheckout);
    document.getElementById("checkout-modal-overlay").addEventListener("click", (e) => {
        if (e.target.id === "checkout-modal-overlay") closeCheckout();
    });
    document.getElementById("form-checkout").addEventListener("submit", handleCheckoutSubmit);

    // 10. Success Modal Triggers
    document.getElementById("btn-close-success").addEventListener("click", () => {
        document.getElementById("success-modal-overlay").classList.remove("active");
        document.body.style.overflow = "";
    });
    document.getElementById("btn-view-order-history").addEventListener("click", () => {
        document.getElementById("success-modal-overlay").classList.remove("active");
        openOrderHistory();
    });

    // 11. Order History Modal
    document.getElementById("btn-open-orders").addEventListener("click", openOrderHistory);
    document.getElementById("btn-close-orders").addEventListener("click", closeOrderHistory);
    document.getElementById("orders-modal-overlay").addEventListener("click", (e) => {
        if (e.target.id === "orders-modal-overlay") closeOrderHistory();
    });

    // 12. Auth Modal
    document.getElementById("btn-open-auth").addEventListener("click", openAuthModal);
    document.getElementById("btn-close-auth").addEventListener("click", closeAuthModal);
    document.getElementById("auth-modal-overlay").addEventListener("click", (e) => {
        if (e.target.id === "auth-modal-overlay") closeAuthModal();
    });

    const tabLogin = document.getElementById("tab-login");
    const tabRegister = document.getElementById("tab-register");
    const formLogin = document.getElementById("form-auth-login");
    const formRegister = document.getElementById("form-auth-register");

    tabLogin.addEventListener("click", () => {
        tabLogin.classList.add("active");
        tabRegister.classList.remove("active");
        formLogin.style.display = "flex";
        formRegister.style.display = "none";
    });

    tabRegister.addEventListener("click", () => {
        tabRegister.classList.add("active");
        tabLogin.classList.remove("active");
        formLogin.style.display = "none";
        formRegister.style.display = "flex";
    });

    formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value.trim().toLowerCase();
        const isAdmin = email === "admin@maisondecor.vn" || email === "admin@blanc.vn" || email === "admin";
        AppState.user = {
            username: isAdmin ? "admin" : email.split("@")[0],
            email: email,
            full_name: isAdmin ? "Quản Trị Viên (Admin)" : email.split("@")[0].toUpperCase(),
            role: isAdmin ? "admin" : "customer",
            phone: "0908 123 456",
            address: "Hà Nội"
        };
        localStorage.setItem("blanc_user", JSON.stringify(AppState.user));
        updateAuthDisplay();
        closeAuthModal();
        renderProducts();
        showToast(isAdmin ? "Đã đăng nhập quyền QUẢN TRỊ VIÊN (Admin)!" : `Đăng nhập thành công! Chào mừng ${AppState.user.username}`);
    });

    const btnQuickAdmin = document.getElementById("btn-quick-admin-login");
    if (btnQuickAdmin) {
        btnQuickAdmin.addEventListener("click", () => {
            AppState.user = {
                username: "admin",
                email: "admin@maisondecor.vn",
                full_name: "Quản Trị Viên Showroom (Admin)",
                role: "admin",
                phone: "0987 654 321",
                address: "Showroom Maison Décor Luxury"
            };
            localStorage.setItem("blanc_user", JSON.stringify(AppState.user));
            updateAuthDisplay();
            closeAuthModal();
            renderProducts();
            showToast("Đã kích hoạt quyền QUẢN TRỊ VIÊN (Admin)! Bạn có thể Thêm, Sửa, Xóa sản phẩm.");
        });
    }

    formRegister.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("reg-username").value.trim();
        const name = document.getElementById("reg-name").value.trim();
        const email = document.getElementById("reg-email").value.trim();

        AppState.user = {
            username: username,
            email: email,
            full_name: name,
            role: "customer",
            phone: "",
            address: ""
        };
        localStorage.setItem("blanc_user", JSON.stringify(AppState.user));
        updateAuthDisplay();
        closeAuthModal();
        renderProducts();
        showToast(`Đăng ký thành công! Chào mừng ${username}`);
    });

    // 13. Admin Management Triggers
    const btnAdminAdd = document.getElementById("btn-admin-add-product");
    if (btnAdminAdd) btnAdminAdd.addEventListener("click", openAdminAddModal);

    const btnCloseAdmin = document.getElementById("btn-close-admin-modal");
    if (btnCloseAdmin) btnCloseAdmin.addEventListener("click", closeAdminModal);

    const btnCancelAdmin = document.getElementById("btn-cancel-admin-modal");
    if (btnCancelAdmin) btnCancelAdmin.addEventListener("click", closeAdminModal);

    const adminOverlay = document.getElementById("admin-product-modal-overlay");
    if (adminOverlay) {
        adminOverlay.addEventListener("click", (e) => {
            if (e.target.id === "admin-product-modal-overlay") closeAdminModal();
        });
    }

    const formAdmin = document.getElementById("form-admin-product");
    if (formAdmin) formAdmin.addEventListener("submit", handleAdminProductSubmit);

    const inputAdminImg = document.getElementById("admin-prod-image");
    if (inputAdminImg) {
        inputAdminImg.addEventListener("input", () => {
            const val = inputAdminImg.value.trim();
            const box = document.getElementById("admin-img-preview-box");
            const img = document.getElementById("admin-img-preview");
            if (val) {
                img.src = val;
                box.style.display = "block";
            } else {
                box.style.display = "none";
            }
        });
    }

    // Tự động đồng bộ sản phẩm từ Backend Database nếu có
    loadProductsFromBackend();
});

// =============================================================================
// 14. ADMIN SẢN PHẨM (THÊM, SỬA, XÓA MÓN HÀNG)
// =============================================================================
async function loadProductsFromBackend() {
    try {
        const res = await fetch(`${API_BASE}/products`);
        if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
                const catSlugMap = {
                    1: { slug: "living-room", name: "Phòng Khách" },
                    2: { slug: "dining", name: "Bàn Ăn & Bếp" },
                    3: { slug: "bedroom", name: "Phòng Ngủ" },
                    4: { slug: "workspace", name: "Góc Làm Việc" },
                    5: { slug: "decor", name: "Đèn & Decor" }
                };
                AppState.products = data.map(p => {
                    const cInfo = catSlugMap[p.category_id] || { slug: "living-room", name: "Phòng Khách" };
                    return {
                        id: p.id,
                        name: p.name,
                        category: cInfo.slug,
                        categoryId: p.category_id,
                        categoryName: cInfo.name,
                        price: p.price,
                        originalPrice: p.original_price,
                        material: p.material || "Gỗ tự nhiên cao cấp",
                        dimensions: p.dimensions || "Tiêu chuẩn",
                        rating: p.rating || 5.0,
                        reviewsCount: p.reviews_count || 20,
                        badge: p.badge || null,
                        badgeType: p.badge_type || "featured",
                        image: p.image_url,
                        description: p.description || ""
                    };
                });
                renderProducts();
            }
        }
    } catch (err) {
        console.log("Không thể kết nối Backend:", err);
    } finally {
        AppState.isLoading = false;
        renderProducts();
    }
}

function openAdminAddModal() {
    document.getElementById("admin-modal-title").textContent = "Thêm Món Đồ Nội Thất Mới";
    document.getElementById("admin-prod-id").value = "";
    document.getElementById("admin-prod-name").value = "";
    document.getElementById("admin-prod-category").value = "1";
    document.getElementById("admin-prod-price").value = "";
    document.getElementById("admin-prod-orig-price").value = "";
    document.getElementById("admin-prod-image").value = "";
    document.getElementById("admin-img-preview-box").style.display = "none";
    document.getElementById("admin-prod-material").value = "Gỗ Sồi Bắc Mỹ tự nhiên";
    document.getElementById("admin-prod-dimensions").value = "";
    document.getElementById("admin-prod-badge").value = "";
    document.getElementById("admin-prod-badge-type").value = "featured";
    document.getElementById("admin-prod-desc").value = "";

    document.getElementById("admin-product-modal-overlay").classList.add("active");
    document.body.style.overflow = "hidden";
}

function openAdminEditModal(productId) {
    const item = AppState.products.find(p => p.id === productId);
    if (!item) return;

    document.getElementById("admin-modal-title").textContent = `Chỉnh Sửa: ${item.name}`;
    document.getElementById("admin-prod-id").value = item.id;
    document.getElementById("admin-prod-name").value = item.name;
    
    const catIdMap = {
        "living-room": "1",
        "dining": "2",
        "bedroom": "3",
        "workspace": "4",
        "decor": "5"
    };
    document.getElementById("admin-prod-category").value = item.categoryId || catIdMap[item.category] || "1";
    document.getElementById("admin-prod-price").value = item.price;
    document.getElementById("admin-prod-orig-price").value = item.originalPrice || "";
    document.getElementById("admin-prod-image").value = item.image;
    
    const previewBox = document.getElementById("admin-img-preview-box");
    const previewImg = document.getElementById("admin-img-preview");
    if (item.image) {
        previewImg.src = item.image;
        previewBox.style.display = "block";
    } else {
        previewBox.style.display = "none";
    }

    document.getElementById("admin-prod-material").value = item.material || "";
    document.getElementById("admin-prod-dimensions").value = item.dimensions || "";
    document.getElementById("admin-prod-badge").value = item.badge || "";
    document.getElementById("admin-prod-badge-type").value = item.badgeType || "featured";
    document.getElementById("admin-prod-desc").value = item.description || "";

    document.getElementById("admin-product-modal-overlay").classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeAdminModal() {
    document.getElementById("admin-product-modal-overlay").classList.remove("active");
    document.body.style.overflow = "";
}

async function handleAdminProductSubmit(e) {
    e.preventDefault();

    const id = document.getElementById("admin-prod-id").value;
    const name = document.getElementById("admin-prod-name").value.trim();
    const categoryId = parseInt(document.getElementById("admin-prod-category").value, 10);
    const price = parseFloat(document.getElementById("admin-prod-price").value);
    const origPriceVal = document.getElementById("admin-prod-orig-price").value;
    const originalPrice = origPriceVal ? parseFloat(origPriceVal) : null;
    const image = document.getElementById("admin-prod-image").value.trim();
    const material = document.getElementById("admin-prod-material").value.trim() || "Gỗ tự nhiên cao cấp";
    const dimensions = document.getElementById("admin-prod-dimensions").value.trim() || "Tiêu chuẩn";
    const badge = document.getElementById("admin-prod-badge").value.trim() || null;
    const badgeType = document.getElementById("admin-prod-badge-type").value;
    const description = document.getElementById("admin-prod-desc").value.trim();

    const catSlugMap = {
        1: { slug: "living-room", name: "Phòng Khách" },
        2: { slug: "dining", name: "Bàn Ăn & Bếp" },
        3: { slug: "bedroom", name: "Phòng Ngủ" },
        4: { slug: "workspace", name: "Góc Làm Việc" },
        5: { slug: "decor", name: "Đèn & Decor" }
    };
    const catInfo = catSlugMap[categoryId] || { slug: "living-room", name: "Phòng Khách" };

    const payload = {
        name: name,
        category_id: categoryId,
        price: price,
        original_price: originalPrice,
        image_url: image,
        material: material,
        dimensions: dimensions,
        badge: badge,
        badge_type: badgeType,
        description: description,
        stock: 10,
        rating: 5.0,
        reviews_count: 20,
        is_featured: badge === "Best Seller" || badge === "Đặc Tuyển"
    };

    if (id) {
        // Cập nhật sản phẩm
        const prodId = parseInt(id, 10);
        try {
            await fetch(`${API_BASE}/products/${prodId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Admin-Demo": "true"
                },
                body: JSON.stringify(payload)
            });
        } catch (err) {
            console.log("Cập nhật cục bộ:", err);
        }

        const idx = AppState.products.findIndex(p => p.id === prodId);
        if (idx > -1) {
            AppState.products[idx] = {
                ...AppState.products[idx],
                name: name,
                category: catInfo.slug,
                categoryId: categoryId,
                categoryName: catInfo.name,
                price: price,
                originalPrice: originalPrice,
                image: image,
                material: material,
                dimensions: dimensions,
                badge: badge,
                badgeType: badgeType,
                description: description
            };
        }
        showToast(`Đã cập nhật sản phẩm "${name}" thành công!`);
    } else {
        // Thêm sản phẩm mới
        let newId = Date.now();
        try {
            const res = await fetch(`${API_BASE}/products`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Admin-Demo": "true"
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const created = await res.json();
                if (created && created.id) newId = created.id;
            }
        } catch (err) {
            console.log("Thêm cục bộ:", err);
        }

        const newItem = {
            id: newId,
            name: name,
            category: catInfo.slug,
            categoryId: categoryId,
            categoryName: catInfo.name,
            price: price,
            originalPrice: originalPrice,
            image: image,
            material: material,
            dimensions: dimensions,
            rating: 5.0,
            reviewsCount: 1,
            badge: badge,
            badgeType: badgeType,
            description: description
        };
        AppState.products.unshift(newItem);
        showToast(`Đã thêm món "${name}" vào Showroom!`);
    }

    closeAdminModal();
    renderProducts();
}

async function handleAdminDeleteProduct(productId) {
    const item = AppState.products.find(p => p.id === productId);
    const itemName = item ? item.name : `ID #${productId}`;

    if (!confirm(`XÁC NHẬN TỪ ADMIN:\n\nBạn có chắc chắn muốn xóa sản phẩm:\n"${itemName}" khỏi danh sách Showroom?`)) {
        return;
    }

    try {
        await fetch(`${API_BASE}/products/${productId}`, {
            method: "DELETE",
            headers: {
                "X-Admin-Demo": "true"
            }
        });
    } catch (err) {
        console.log("Xóa cục bộ:", err);
    }

    AppState.products = AppState.products.filter(p => p.id !== productId);
    renderProducts();
    showToast(`Đã xóa món "${itemName}" khỏi Showroom.`);
}

// Global exposure
window.openAdminAddModal = openAdminAddModal;
window.openAdminEditModal = openAdminEditModal;
window.handleAdminDeleteProduct = handleAdminDeleteProduct;
window.closeAdminModal = closeAdminModal;

