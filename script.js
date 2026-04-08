// ===== CALMETAVIN STORE - MAIN JAVASCRIPT =====

// Product data
const products = {
    calvin: {
        name: 'Calvin Klein Boxers',
        price: 25000,
        image: 'image1.jpg',
        fallbackImage: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
        description: 'Classic comfort with iconic style. Premium cotton blend for all-day comfort.',
        features: ['100% Premium Cotton', 'Iconic Elastic Waistband', 'Breathable Fabric', 'Classic Fit']
    },
    versace: {
        name: 'Versace Boxers',
        price: 25000,
        image: 'image3.jpg',
        fallbackImage: 'https://images.unsplash.com/photo-1584370848010-d7cc637733f2?w=400',
        description: 'Luxury Italian design. Elevate your everyday essentials with Versace.',
        features: ['Luxury Italian Design', 'Premium Quality Fabric', 'Designer Brand', 'Stylish Pattern']
    },
    checks: {
        name: 'Checks Cotton Boxers',
        price: 25000,
        image: 'image2.jpg',
        fallbackImage: 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=400',
        description: 'Classic checkered pattern with breathable cotton comfort.',
        features: ['Soft Cotton Material', 'Classic Checkered Design', 'Durable Construction', 'Comfortable Fit']
    }
};

// Admin credentials (in production, this should be server-side)
const ADMIN_CREDENTIALS = {
    username: 'Tamandani',
    password: 'calvin@265'
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initCart();
    initMobileMenu();
    initAdminPanel();
    loadCartOnOrderPage();
    updateCartCount();
});

// ===== CART FUNCTIONALITY =====
function initCart() {
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
}

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(productName, price) {
    const cart = getCart();
    const existingItem = cart.find(item => item.name === productName);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1
        });
    }

    saveCart(cart);
    showNotification(`${productName} added to cart!`);
}

function addToCartWithQty(productName, price, qtyId) {
    const qty = parseInt(document.getElementById(qtyId).value) || 1;
    const cart = getCart();
    const existingItem = cart.find(item => item.name === productName);

    if (existingItem) {
        existingItem.quantity += qty;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: qty
        });
    }

    saveCart(cart);
    showNotification(`${productName} (${qty} items) added to cart!`);
}

function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    loadCartOnOrderPage();
}

function updateCartItemQuantity(index, newQty) {
    const cart = getCart();
    if (newQty < 1) {
        removeFromCart(index);
        return;
    }
    cart[index].quantity = newQty;
    saveCart(cart);
    loadCartOnOrderPage();
}

function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        localStorage.setItem('cart', JSON.stringify([]));
        updateCartCount();
        loadCartOnOrderPage();
        showNotification('Cart cleared!');
    }
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cartCount');
    cartCountElements.forEach(el => el.textContent = count);
}

function loadCartOnOrderPage() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    const submitBtn = document.getElementById('submitOrderBtn');
    const btnTotal = document.getElementById('btnTotal');

    if (!cartItemsContainer) return;

    const cart = getCart();

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty</p>
                <a href="products.html">Browse Products</a>
            </div>
        `;
        if (cartSummary) cartSummary.style.display = 'none';
        if (submitBtn) submitBtn.disabled = true;
        return;
    }

    let html = '';
    let subtotal = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        // Get product image
        let productImg = '';
        if (item.name.includes('Calvin')) productImg = 'image1.jpg';
        else if (item.name.includes('Versace')) productImg = 'image3.jpg';
        else productImg = 'image2.jpg';

        html += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${productImg}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80'">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>MWK ${item.price.toLocaleString()}</p>
                    <div class="cart-item-actions">
                        <div class="quantity-selector">
                            <button onclick="updateCartItemQuantity(${index}, ${item.quantity - 1})">-</button>
                            <input type="number" value="${item.quantity}" min="1" onchange="updateCartItemQuantity(${index}, parseInt(this.value))">
                            <button onclick="updateCartItemQuantity(${index}, ${item.quantity + 1})">+</button>
                        </div>
                        <button class="remove-item" onclick="removeFromCart(${index})">Remove</button>
                    </div>
                </div>
                <div class="cart-item-total">
                    <strong>MWK ${itemTotal.toLocaleString()}</strong>
                </div>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = html;

    // Update summary
    const delivery = 2000;
    const total = subtotal + delivery;

    document.getElementById('subtotal').textContent = `MWK ${subtotal.toLocaleString()}`;
    document.getElementById('total').textContent = `MWK ${total.toLocaleString()}`;
    if (btnTotal) btnTotal.textContent = `MWK ${total.toLocaleString()}`;
    if (submitBtn) submitBtn.disabled = false;
}

// ===== ORDER SUBMISSION =====
function submitOrder(event) {
    event.preventDefault();

    const cart = getCart();
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }

    const formData = {
        id: 'ORD-' + Date.now(),
        date: new Date().toISOString(),
        customer: {
            name: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value
        },
        paymentMethod: document.getElementById('paymentMethod').value,
        notes: document.getElementById('notes').value,
        items: cart,
        subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        delivery: 2000,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 2000,
        status: 'pending',
        whatsappUpdates: document.getElementById('whatsappUpdates').checked
    };

    // Save order
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(formData);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Clear cart
    localStorage.setItem('cart', JSON.stringify([]));
    updateCartCount();

    // Show success modal
    showSuccessModal(formData);
}

function showSuccessModal(order) {
    const modal = document.getElementById('successModal');
    const details = document.getElementById('orderDetails');

    let itemsHtml = '<ul>';
    order.items.forEach(item => {
        itemsHtml += `<li>${item.name} x ${item.quantity} - MWK ${(item.price * item.quantity).toLocaleString()}</li>`;
    });
    itemsHtml += '</ul>';

    details.innerHTML = `
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Total:</strong> MWK ${order.total.toLocaleString()}</p>
        <p><strong>Items:</strong></p>
        ${itemsHtml}
        <p style="margin-top: 15px;">We will contact you at ${order.customer.phone} to confirm your order.</p>
    `;

    modal.classList.add('active');
}

function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('active');
    window.location.href = 'index.html';
}

// ===== PRODUCT MODAL =====
function openModal(productKey) {
    const product = products[productKey];
    if (!product) return;

    document.getElementById('modalImg').src = product.image;
    document.getElementById('modalImg').onerror = function() {
        this.src = product.fallbackImage;
    };
    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalPrice').textContent = `MWK ${product.price.toLocaleString()}`;
    document.getElementById('modalDesc').textContent = product.description;

    const featuresHtml = product.features.map(f => `<span>✓ ${f}</span>`).join('');
    document.getElementById('modalFeatures').innerHTML = featuresHtml;

    document.getElementById('modalAddToCart').onclick = function() {
        const qty = parseInt(document.getElementById('modal-qty').value) || 1;
        const cart = getCart();
        const existingItem = cart.find(item => item.name === product.name);

        if (existingItem) {
            existingItem.quantity += qty;
        } else {
            cart.push({
                name: product.name,
                price: product.price,
                quantity: qty
            });
        }

        saveCart(cart);
        closeModal();
        showNotification(`${product.name} added to cart!`);
    };

    document.getElementById('productModal').classList.add('active');
}

function closeModal() {
    document.getElementById('productModal').classList.remove('active');
}

function viewProduct(productKey) {
    openModal(productKey);
}

// ===== QUANTITY SELECTOR =====
function adjustQty(inputId, delta) {
    const input = document.getElementById(inputId);
    if (!input) return;

    let value = parseInt(input.value) || 1;
    value += delta;
    if (value < 1) value = 1;
    input.value = value;
}

// ===== SORTING =====
function sortProducts() {
    const sortValue = document.getElementById('sortSelect').value;
    const grid = document.getElementById('productsGrid');
    const cards = Array.from(grid.children);

    cards.sort((a, b) => {
        const nameA = a.dataset.name;
        const nameB = b.dataset.name;
        const priceA = parseInt(a.dataset.price);
        const priceB = parseInt(b.dataset.price);

        switch(sortValue) {
            case 'price-low':
                return priceA - priceB;
            case 'price-high':
                return priceB - priceA;
            case 'name':
                return nameA.localeCompare(nameB);
            default:
                return 0;
        }
    });

    cards.forEach(card => grid.appendChild(card));
}

// ===== MOBILE MENU =====
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== ADMIN PANEL =====
function initAdminPanel() {
    // Check if logged in
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    const loginScreen = document.getElementById('loginScreen');
    const dashboard = document.getElementById('adminDashboard');

    if (isLoggedIn && dashboard) {
        loginScreen.style.display = 'none';
        dashboard.style.display = 'flex';
        loadAdminData();
    }

    // Close modal on outside click
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
        }
    };
}

function adminLogin(event) {
    event.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'flex';
        loadAdminData();
        showNotification('Login successful!');
    } else {
        showNotification('Invalid credentials!', 'error');
    }
}

function adminLogout() {
    sessionStorage.removeItem('adminLoggedIn');
    window.location.reload();
}

function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    // Show selected section
    const sectionMap = {
        'orders': 'ordersSection',
        'products': 'productsSection',
        'customers': 'customersSection',
        'analytics': 'analyticsSection',
        'settings': 'settingsSection'
    };

    const sectionId = sectionMap[section];
    if (sectionId) {
        document.getElementById(sectionId).style.display = 'block';
        document.getElementById('pageTitle').textContent = section.charAt(0).toUpperCase() + section.slice(1);
    }

    // Update nav
    event.target.closest('.nav-item').classList.add('active');

    if (section === 'analytics') {
        loadAnalytics();
    }
}

function loadAdminData() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];

    // Update stats
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;

    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalRevenue').textContent = `MWK ${totalRevenue.toLocaleString()}`;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('completedOrders').textContent = completedOrders;
    document.getElementById('orderBadge').textContent = pendingOrders;

    // Load orders table
    loadOrdersTable(orders);
    loadCustomersTable(orders);
    updateProductSales(orders);
}

function loadOrdersTable(orders) {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No orders yet</td></tr>';
        return;
    }

    tbody.innerHTML = orders.reverse().map(order => {
        const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
        const statusClass = `status-${order.status}`;

        return `
            <tr>
                <td><strong>${order.id}</strong></td>
                <td>${new Date(order.date).toLocaleDateString()}</td>
                <td>${order.customer.name}</td>
                <td>${order.customer.phone}</td>
                <td>${itemCount} items</td>
                <td>MWK ${order.total.toLocaleString()}</td>
                <td><span class="status-badge ${statusClass}">${order.status}</span></td>
                <td>
                    <button class="action-btn edit" onclick="viewOrderDetail('${order.id}')">View</button>
                    <select onchange="updateOrderStatus('${order.id}', this.value)" style="padding: 5px; border-radius: 4px; border: 1px solid #ddd;">
                        <option value="">Update</option>
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
            </tr>
        `;
    }).join('');
}

function loadCustomersTable(orders) {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;

    // Group by customer phone
    const customers = {};
    orders.forEach(order => {
        const phone = order.customer.phone;
        if (!customers[phone]) {
            customers[phone] = {
                name: order.customer.name,
                phone: phone,
                email: order.customer.email || '-',
                city: order.customer.city,
                orders: 0,
                spent: 0
            };
        }
        customers[phone].orders++;
        customers[phone].spent += order.total;
    });

    const customerList = Object.values(customers);

    if (customerList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No customers yet</td></tr>';
        return;
    }

    tbody.innerHTML = customerList.map(c => `
        <tr>
            <td>${c.name}</td>
            <td>${c.phone}</td>
            <td>${c.email}</td>
            <td>${c.city}</td>
            <td>${c.orders}</td>
            <td>MWK ${c.spent.toLocaleString()}</td>
        </tr>
    `).join('');
}

function updateProductSales(orders) {
    const sales = { 'Calvin Klein Boxers': 0, 'Versace Boxers': 0, 'Checks Cotton Boxers': 0 };

    orders.forEach(order => {
        order.items.forEach(item => {
            if (sales[item.name] !== undefined) {
                sales[item.name] += item.quantity;
            }
        });
    });

    document.getElementById('calvinSales').textContent = sales['Calvin Klein Boxers'];
    document.getElementById('versaceSales').textContent = sales['Versace Boxers'];
    document.getElementById('checksSales').textContent = sales['Checks Cotton Boxers'];
}

function loadAnalytics() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];

    const sales = { 'Calvin Klein Boxers': 0, 'Versace Boxers': 0, 'Checks Cotton Boxers': 0 };
    orders.forEach(order => {
        order.items.forEach(item => {
            if (sales[item.name] !== undefined) {
                sales[item.name] += item.quantity;
            }
        });
    });

    const maxSales = Math.max(...Object.values(sales)) || 1;

    document.getElementById('calvinBar').style.width = `${(sales['Calvin Klein Boxers'] / maxSales) * 100}%`;
    document.getElementById('calvinCount').textContent = sales['Calvin Klein Boxers'];

    document.getElementById('versaceBar').style.width = `${(sales['Versace Boxers'] / maxSales) * 100}%`;
    document.getElementById('versaceCount').textContent = sales['Versace Boxers'];

    document.getElementById('checksBar').style.width = `${(sales['Checks Cotton Boxers'] / maxSales) * 100}%`;
    document.getElementById('checksCount').textContent = sales['Checks Cotton Boxers'];

    // Top product
    const topProduct = Object.entries(sales).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('topProduct').textContent = topProduct && topProduct[1] > 0 ? topProduct[0] : '-';

    // Average order value
    const avgOrder = orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0;
    document.getElementById('avgOrderValue').textContent = `MWK ${Math.round(avgOrder).toLocaleString()}`;
}

function updateOrderStatus(orderId, newStatus) {
    if (!newStatus) return;

    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);

    if (order) {
        order.status = newStatus;
        localStorage.setItem('orders', JSON.stringify(orders));
        loadAdminData();
        showNotification(`Order ${orderId} updated to ${newStatus}`);
    }
}

function viewOrderDetail(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);

    if (!order) return;

    const modal = document.getElementById('orderModal');
    const content = document.getElementById('orderDetailContent');

    let itemsHtml = '<table style="width: 100%; margin: 20px 0;"><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>';
    order.items.forEach(item => {
        itemsHtml += `<tr><td>${item.name}</td><td>${item.quantity}</td><td>MWK ${item.price.toLocaleString()}</td><td>MWK ${(item.price * item.quantity).toLocaleString()}</td></tr>`;
    });
    itemsHtml += '</table>';

    content.innerHTML = `
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
        <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status}</span></p>
        <hr style="margin: 20px 0;">
        <h4>Customer Information</h4>
        <p><strong>Name:</strong> ${order.customer.name}</p>
        <p><strong>Phone:</strong> ${order.customer.phone}</p>
        <p><strong>Email:</strong> ${order.customer.email || '-'}</p>
        <p><strong>Address:</strong> ${order.customer.address}</p>
        <p><strong>City:</strong> ${order.customer.city}</p>
        <hr style="margin: 20px 0;">
        <h4>Order Items</h4>
        ${itemsHtml}
        <hr style="margin: 20px 0;">
        <p><strong>Subtotal:</strong> MWK ${order.subtotal.toLocaleString()}</p>
        <p><strong>Delivery:</strong> MWK ${order.delivery.toLocaleString()}</p>
        <p><strong>Total:</strong> MWK ${order.total.toLocaleString()}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
    `;

    modal.classList.add('active');
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
}

function filterOrders() {
    const searchTerm = document.getElementById('searchOrders').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    let orders = JSON.parse(localStorage.getItem('orders')) || [];

    if (searchTerm) {
        orders = orders.filter(o =>
            o.id.toLowerCase().includes(searchTerm) ||
            o.customer.name.toLowerCase().includes(searchTerm) ||
            o.customer.phone.includes(searchTerm)
        );
    }

    if (statusFilter !== 'all') {
        orders = orders.filter(o => o.status === statusFilter);
    }

    loadOrdersTable(orders);
}

function filterCustomers() {
    const searchTerm = document.getElementById('searchCustomers').value.toLowerCase();
    const orders = JSON.parse(localStorage.getItem('orders')) || [];

    // Group by customer
    const customers = {};
    orders.forEach(order => {
        const phone = order.customer.phone;
        if (!customers[phone]) {
            customers[phone] = {
                name: order.customer.name,
                phone: phone,
                email: order.customer.email || '-',
                city: order.customer.city,
                orders: 0,
                spent: 0
            };
        }
        customers[phone].orders++;
        customers[phone].spent += order.total;
    });

    let customerList = Object.values(customers);

    if (searchTerm) {
        customerList = customerList.filter(c =>
            c.name.toLowerCase().includes(searchTerm) ||
            c.phone.includes(searchTerm)
        );
    }

    const tbody = document.getElementById('customersTableBody');
    if (customerList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No customers found</td></tr>';
        return;
    }

    tbody.innerHTML = customerList.map(c => `
        <tr>
            <td>${c.name}</td>
            <td>${c.phone}</td>
            <td>${c.email}</td>
            <td>${c.city}</td>
            <td>${c.orders}</td>
            <td>MWK ${c.spent.toLocaleString()}</td>
        </tr>
    `).join('');
}

function exportOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];

    if (orders.length === 0) {
        showNotification('No orders to export!', 'error');
        return;
    }

    let csv = 'Order ID,Date,Customer,Phone,City,Items,Total,Status,Payment Method\\n';

    orders.forEach(order => {
        const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
        csv += `${order.id},${new Date(order.date).toLocaleDateString()},${order.customer.name},${order.customer.phone},${order.customer.city},${itemCount},${order.total},${order.status},${order.paymentMethod}\\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showNotification('Orders exported successfully!');
}

function refreshData() {
    loadAdminData();
    showNotification('Data refreshed!');
}

function saveSettings(event) {
    event.preventDefault();
    showNotification('Settings saved!');
}

function updateCredentials(event) {
    event.preventDefault();
    showNotification('Credentials updated!');
}

function addProduct() {
    showNotification('Add product feature - customize as needed');
}

// ===== CSS ANIMATIONS =====
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
