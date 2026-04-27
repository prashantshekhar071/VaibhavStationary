'use strict';

// Products Data
const products = [
    { id: 1, name: 'Pencil Set', price: 10, image: 'image/Pencil Set.jpg' },
    { id: 2, name: 'Notebook (A4)', price: 20, image: 'image/Notebook (A4).jpg' },
    { id: 3, name: 'Premium Pen Pack', price: 50, image: 'image/Premium Pen Pack.jpg' },
    { id: 4, name: 'Scientific Calculator', price: 100, image: 'image/Scientific Calculator.jpg' },
    { id: 5, name: 'Desk Lamp LED', price: 150, image: 'image/Desk Lamp LED.jpg' },
    { id: 6, name: 'Laptop Backpack', price: 200, image: 'image/Laptop Backpack.jpg' },
    { id: 7, name: 'Complete Stationery Kit', price: 280, image: 'image/Complete Stationery Kit.jpg' }
];

// Cart Management
let cart = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing...');
    loadCart();
    updateCartCount();
    renderProducts();
    renderFeaturedProducts();
    
    // Show home page after a tiny delay to ensure DOM is ready
    setTimeout(function() {
        showPage('home');
    }, 10);
});

// Page Navigation
function showPage(pageName) {
    try {
        console.log('Showing page:', pageName);
        
        // Hide all pages
        document.querySelectorAll('.page-section').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        const pageElement = document.getElementById(pageName);
        if (!pageElement) {
            console.error('Page element not found:', pageName);
            return;
        }
        pageElement.classList.add('active');
        
        // Update active nav link
        document.querySelectorAll('nav a').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`nav a[onclick="showPage('${pageName}')"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Render page-specific content
        if (pageName === 'products') {
            renderProducts();
        } else if (pageName === 'cart') {
            renderCart();
        } else if (pageName === 'checkout') {
            renderCheckoutSummary();
        }
        
        // Scroll to top
        window.scrollTo(0, 0);
    } catch (error) {
        console.error('Error showing page:', error);
    }
}

// Render Products
function renderProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image" style="display: flex; align-items: center; justify-content: center; height: 200px; overflow: hidden;">
                <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-price">₹${product.price}</div>
                <div class="quantity-control">
                    <label for="qty-${product.id}">Quantity:</label>
                    <input type="number" id="qty-${product.id}" min="1" max="100" value="1">
                </div>
                <div class="product-buttons">
                    <button class="btn btn-add-cart" onclick="addToCart(${product.id})">Add to Cart</button>
                    <button class="btn btn-buy-now" onclick="buyNow(${product.id})">Buy Now</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Add to Cart
function addToCart(productId) {
    const quantity = parseInt(document.getElementById(`qty-${productId}`).value);
    const product = products.find(p => p.id === productId);
    
    if (quantity < 1) {
        alert('Please enter a valid quantity');
        return;
    }
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.image
        });
    }
    
    saveCart();
    updateCartCount();
    showNotification('Added to cart!');
}

// Buy Now
function buyNow(productId) {
    const quantity = parseInt(document.getElementById(`qty-${productId}`).value);
    const product = products.find(p => p.id === productId);
    
    if (quantity < 1) {
        alert('Please enter a valid quantity');
        return;
    }
    
    // Clear cart and add only this product
    cart = [{
        id: productId,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.image
    }];
    
    saveCart();
    updateCartCount();
    showPage('checkout');
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    renderCart();
}

// Update Cart Item Quantity
function updateQuantity(productId, newQuantity) {
    newQuantity = parseInt(newQuantity);
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        saveCart();
        updateCartCount();
        renderCart();
    }
}

// Render Cart
function renderCart() {
    try {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartSummaryContainer = document.getElementById('cart-summary');
        
        if (!cartItemsContainer || !cartSummaryContainer) {
            console.error('Cart containers not found');
            return;
        }
        
        console.log('Rendering cart with items:', cart);
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart" style="padding: 3rem; text-align: center; color: #999;"><p style="font-size: 1.2rem;">Your cart is empty</p></div>';
            cartSummaryContainer.innerHTML = '<div class="summary-row"><span>Subtotal:</span><span>₹0</span></div><div class="summary-row"><span>Tax (10%):</span><span>₹0</span></div><div class="summary-row total"><span>Total:</span><span>₹0</span></div>';
            return;
        }
        
        let subtotal = 0;
        let cartHTML = '';
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            cartHTML += `
                <div style="display: grid; grid-template-columns: auto 1fr auto auto auto; gap: 1rem; padding: 1.5rem; border-bottom: 1px solid #eee; align-items: center;">
                    <img src="${item.image}" alt="${item.name}" style="width: 70px; height: 70px; border-radius: 8px; object-fit: cover; flex-shrink: 0;">
                    <div>
                        <div style="font-weight: bold; margin-bottom: 0.3rem;">${item.name}</div>
                        <div style="color: #666; font-size: 0.9rem;">₹${item.price} each</div>
                    </div>
                    <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${item.id}, this.value)" style="width: 70px; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; text-align: center;">
                    <div style="font-weight: bold; min-width: 80px; text-align: right;">
                        ₹${itemTotal}
                    </div>
                    <button onclick="removeFromCart(${item.id})" style="padding: 0.5rem 1rem; background-color: #ff6b6b; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Remove</button>
                </div>
            `;
        });
        
        cartItemsContainer.innerHTML = cartHTML;
        
        const tax = Math.round(subtotal * 0.10);
        const total = subtotal + tax;
        
        cartSummaryContainer.innerHTML = `
            <div class="summary-row"><span>Subtotal:</span><span>₹${subtotal}</span></div>
            <div class="summary-row"><span>Tax (10%):</span><span>₹${tax}</span></div>
            <div class="summary-row total"><span>Total:</span><span>₹${total}</span></div>
            <button onclick="goToCheckout()" style="width: 100%; background-color: #667eea; color: white; border: none; padding: 1rem; border-radius: 5px; font-size: 1rem; font-weight: bold; cursor: pointer; margin-top: 1rem;">Proceed to Checkout</button>
        `;
    } catch (error) {
        console.error('Error rendering cart:', error);
    }
}

// Go to Checkout
function goToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    showPage('checkout');
}

// Render Checkout Summary
function renderCheckoutSummary() {
    try {
        const summaryContainer = document.getElementById('checkout-items');
        
        if (!summaryContainer) {
            console.error('Checkout items container not found');
            return;
        }
        
        console.log('Rendering checkout with items:', cart);
        
        if (cart.length === 0) {
            summaryContainer.innerHTML = '<p style="padding: 2rem; text-align: center; color: #999;">No items in cart</p>';
            return;
        }
        
        let subtotal = 0;
        let checkoutHTML = '';
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            checkoutHTML += `
                <div style="display: grid; grid-template-columns: auto 1fr auto; gap: 1rem; padding: 1rem; border-bottom: 1px solid #eee; align-items: center;">
                    <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover; flex-shrink: 0;">
                    <div>
                        <div style="font-weight: bold; margin-bottom: 0.3rem;">${item.name}</div>
                        <div style="font-size: 0.9rem; color: #666;">Quantity: ${item.quantity}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.85rem; color: #999; margin-bottom: 0.3rem;">₹${item.price} × ${item.quantity}</div>
                        <div style="font-weight: bold; color: #667eea; font-size: 1.1rem;">₹${itemTotal}</div>
                    </div>
                </div>
            `;
        });
        
        const tax = Math.round(subtotal * 0.10);
        const total = subtotal + tax;
        
        checkoutHTML += `
            <div style="display: flex; justify-content: space-between; border-top: 2px solid #eee; padding-top: 1rem; margin-top: 1rem; font-size: 1rem;">
                <strong>Subtotal</strong>
                <strong>₹${subtotal}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 0.8rem 0; border-bottom: 1px solid #eee; font-size: 1rem;">
                <strong>Tax (10%)</strong>
                <strong>₹${tax}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 2px solid #667eea; padding-top: 0.8rem; margin-top: 0.8rem; font-size: 1.2rem; color: #667eea;">
                <strong>Total Amount</strong>
                <strong>₹${total}</strong>
            </div>
        `;
        
        summaryContainer.innerHTML = checkoutHTML;
    } catch (error) {
        console.error('Error rendering checkout:', error);
    }
}

// Handle Checkout Form Submission
function submitCheckout() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const zipCode = document.getElementById('zipCode').value.trim();
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    // Validation
    if (!firstName || !lastName || !email || !phone || !address || !city || !state || !zipCode) {
        showError('Please fill in all required fields');
        return;
    }
    
    // Email validation
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Phone validation
    if (!isValidPhone(phone)) {
        showError('Please enter a valid phone number');
        return;
    }
    
    // If all validations pass
    processOrder(firstName, lastName, email, phone, address, city, state, zipCode, paymentMethod);
}

// Email Validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone Validation
function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

// Process Order
function processOrder(firstName, lastName, email, phone, address, city, state, zipCode, paymentMethod) {
    const orderData = {
        customerName: `${firstName} ${lastName}`,
        email: email,
        phone: phone,
        deliveryAddress: address,
        city: city,
        state: state,
        zipCode: zipCode,
        paymentMethod: paymentMethod,
        items: cart,
        orderDate: new Date().toLocaleDateString(),
        orderTime: new Date().toLocaleTimeString()
    };
    
    // Generate order ID
    const orderId = generateOrderId();
    
    // Save order with error handling
    try {
        if (isLocalStorageAvailable()) {
            localStorage.setItem('lastOrder', JSON.stringify({...orderData, orderId: orderId}));
        }
    } catch (error) {
        console.warn('Unable to save order to localStorage:', error);
    }
    
    // Clear cart
    cart = [];
    saveCart();
    updateCartCount();
    
    // Display order success page
    displayOrderSuccess(orderData, orderId);
    
    // Hide form and show success page
    document.getElementById('error-message').style.display = 'none';
    document.getElementById('success-message').style.display = 'none';
    
    // Reset form
    document.getElementById('checkout-form').reset();
    
    // Show order success page
    showPage('order-success');
}

// Show Error Message
function showError(message) {
    document.getElementById('error-message').style.display = 'block';
    document.getElementById('error-message').textContent = message;
    document.getElementById('success-message').style.display = 'none';
}

// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #667eea;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Cart Persistence with Error Handling
function isLocalStorageAvailable() {
    try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

function saveCart() {
    try {
        if (isLocalStorageAvailable()) {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    } catch (error) {
        console.warn('Unable to save cart to localStorage:', error);
    }
}

function loadCart() {
    try {
        if (isLocalStorageAvailable()) {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                cart = JSON.parse(savedCart);
            }
        }
    } catch (error) {
        console.warn('Unable to load cart from localStorage:', error);
        cart = [];
    }
}

// Update Cart Count Badge
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const count = cart.reduce((total, item) => total + item.quantity, 0);
        cartCountElement.textContent = count;
    }
}

// Render Featured Products on Home Page
function renderFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;
    
    // Show featured products (first 6)
    const featured = products.slice(0, 6);
    container.innerHTML = featured.map(product => `
        <div class="featured-product-item" onclick="scrollToProduct(${product.id})">
            <h4>${product.name}</h4>
            <div class="featured-product-price">₹${product.price}</div>
            <p style="font-size: 0.85rem; margin-top: 0.5rem; opacity: 0.9;">Click to view</p>
        </div>
    `).join('');
}

// Scroll to product
function scrollToProduct(productId) {
    showPage('products');
}

// Toggle FAQ Answer
function toggleFAQ(element) {
    const answer = element.nextElementSibling;
    answer.classList.toggle('show');
    
    // Rotate arrow
    if (answer.classList.contains('show')) {
        element.textContent = element.textContent.replace('▶', '▼');
    } else {
        element.textContent = element.textContent.replace('▼', '▶');
    }
}

// Subscribe to Newsletter
function subscribeNewsletter() {
    const email = document.getElementById('newsletter-email').value.trim();
    
    if (!email || !isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    showNotification('✓ Thank you for subscribing!');
    document.getElementById('newsletter-email').value = '';
}

// Generate Random Order ID
function generateOrderId() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `VBS-${timestamp}${random}`;
}

// Calculate estimated delivery date
function getEstimatedDeliveryDate() {
    const date = new Date();
    date.setDate(date.getDate() + 5); // Add 5 days
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Display Order Success Page
function displayOrderSuccess(orderData, orderId) {
    // Update order ID
    document.getElementById('display-order-id').textContent = orderId;
    
    // Update order details
    document.getElementById('display-order-date').textContent = new Date().toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('display-delivery-date').textContent = getEstimatedDeliveryDate();
    
    const paymentMethodMap = {
        'credit-card': 'Credit Card',
        'debit-card': 'Debit Card',
        'upi': 'UPI',
        'net-banking': 'Net Banking',
        'wallet': 'Digital Wallet',
        'cod': 'Cash on Delivery'
    };
    document.getElementById('display-payment-method').textContent = paymentMethodMap[orderData.paymentMethod] || orderData.paymentMethod;
    
    // Update delivery address
    document.getElementById('display-delivery-name').textContent = orderData.customerName;
    document.getElementById('display-delivery-address').textContent = `${orderData.deliveryAddress}, ${orderData.city}, ${orderData.state} - ${orderData.zipCode}`;
    document.getElementById('display-delivery-phone').textContent = orderData.phone;
    
    // Update order items
    let itemsHTML = '';
    let subtotal = 0;
    orderData.items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        itemsHTML += `
            <div class="order-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="order-item-details">
                    <h4>${item.name}</h4>
                    <p>₹${item.price} × ${item.quantity} = ₹${itemTotal}</p>
                </div>
                <div style="text-align: right; min-width: 80px;">
                    <strong>₹${itemTotal}</strong>
                </div>
            </div>
        `;
    });
    document.getElementById('display-order-items').innerHTML = itemsHTML;
    
    // Update totals
    const tax = Math.round(subtotal * 0.10);
    const total = subtotal + tax;
    document.getElementById('display-subtotal').textContent = `₹${subtotal}`;
    document.getElementById('display-tax').textContent = `₹${tax}`;
    document.getElementById('display-total').textContent = `₹${total}`;
    
    // Store order data for download
    window.currentOrderData = {
        orderId: orderId,
        orderData: orderData,
        subtotal: subtotal,
        tax: tax,
        total: total
    };
}

// Download Receipt (Mock Implementation)
function downloadReceipt() {
    if (!window.currentOrderData) {
        alert('No order data available');
        return;
    }
    
    const data = window.currentOrderData;
    const orderData = data.orderData;
    
    // Create receipt text
    let receiptText = `
================== vaibhav stationary ==================
                    ORDER RECEIPT
==========================================================

Order ID: ${data.orderId}
Order Date: ${new Date().toLocaleDateString('en-IN', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
})}

---------- CUSTOMER DETAILS ----------
Name: ${orderData.customerName}
Email: ${orderData.email}
Phone: ${orderData.phone}
Address: ${orderData.deliveryAddress}
City: ${orderData.city}
State: ${orderData.state}
ZIP Code: ${orderData.zipCode}

---------- ORDER ITEMS ----------
`;

    orderData.items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        receiptText += `\n${item.name}
   Price: ₹${item.price} × Quantity: ${item.quantity} = ₹${itemTotal}`;
    });

    receiptText += `

---------- ORDER SUMMARY ----------
Subtotal: ₹${data.subtotal}
Tax (10%): ₹${data.tax}
Total Amount: ₹${data.total}

Payment Method: ${
        {
            'credit-card': 'Credit Card',
            'debit-card': 'Debit Card',
            'upi': 'UPI',
            'net-banking': 'Net Banking',
            'wallet': 'Digital Wallet',
            'cod': 'Cash on Delivery'
        }[orderData.paymentMethod] || orderData.paymentMethod
    }

Estimated Delivery: ${getEstimatedDeliveryDate()}

---------- CONTACT INFORMATION ----------
Email: vaibhavgupta831002@gmail.com
Phone: 9523181377
Address: Mill and Godown area, Burmamines, Jamshedpur, 
Golmuri cum Jugsalali, East Singhbhum, Jharkhand - 831002

Thank you for shopping with vaibhav stationary!
==========================================================
`;

    // Create blob and download
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${data.orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showNotification('✓ Receipt downloaded successfully!');
}
