document.addEventListener('DOMContentLoaded', function() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const checkoutBtn = document.getElementById("checkout-btn");
    const totalElement = document.getElementById('cart-total');
    const subtotalElement = document.getElementById('cart-subtotal');
    const deliveryElement = document.getElementById('cart-delivery');
    const cartCountElement = document.getElementById('cart-count');

    const CartManager = window.CartManager;

    // Display functions
    function displayCart() {
        const cart = CartManager.getCart();

        if (CartManager.isEmpty()) {
            displayEmptyCart();
            updateSummary(0);
            updateCheckoutButton(true);
            return;
        }

        displayCartItems(cart);
        
        const total = CartManager.calculateTotal();
        const itemCount = CartManager.getItemCount();
        updateSummary(total);
        updateCheckoutButton(false);
        updateCartCountDisplay(itemCount);
    }

    function displayEmptyCart() {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-container">
                <div class="empty-cart-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <h3 class="empty-cart-title">Your cart is empty</h3>
                <p class="empty-cart-text">Looks like you haven't added anything to your cart yet.</p>
                <div class="empty-cart-actions">
                    <button class="btn-shop-now" onclick="window.location.href='Home.html'">
                        <i class="fas fa-shopping-bag me-2"></i>Start Shopping
                    </button>
                </div>
            </div>
        `;
    }

    function displayCartItems(cart) {
        cartItemsContainer.innerHTML = '';

        const header = document.createElement('div');
        header.className = 'cart-items-header';
        const heading = document.createElement('h3');
        heading.textContent = `Cart Items (${Object.keys(cart).length})`;
        const clearBtn = document.createElement('button');
        clearBtn.className = 'clear-cart-btn';
        clearBtn.innerHTML = '<i class="fas fa-trash me-2"></i>Clear Cart';
        clearBtn.addEventListener('click', () => window.clearCartAction());
        header.appendChild(heading);
        header.appendChild(clearBtn);
        cartItemsContainer.appendChild(header);

        Object.values(cart).forEach(item => {
            cartItemsContainer.appendChild(buildCartItemRow(item));
        });
    }

    function buildCartItemRow(item) {
        const row = document.createElement('div');
        row.className = 'cart-item';

        const imageWrap = document.createElement('div');
        imageWrap.className = 'cart-item-image';
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.name;
        imageWrap.appendChild(img);

        const details = document.createElement('div');
        details.className = 'cart-item-details';
        const nameEl = document.createElement('h4');
        nameEl.className = 'cart-item-name';
        nameEl.textContent = item.name;
        const priceEl = document.createElement('p');
        priceEl.className = 'cart-item-price';
        priceEl.textContent = `$${item.price.toFixed(2)}`;

        const qtyControl = document.createElement('div');
        qtyControl.className = 'quantity-control';
        const minusBtn = document.createElement('button');
        minusBtn.className = 'quantity-btn';
        minusBtn.innerHTML = '<i class="fas fa-minus"></i>';
        minusBtn.addEventListener('click', () => window.updateQuantity(item.id, item.quantity - 1));
        const qtyDisplay = document.createElement('span');
        qtyDisplay.className = 'quantity-display';
        qtyDisplay.textContent = item.quantity;
        const plusBtn = document.createElement('button');
        plusBtn.className = 'quantity-btn';
        plusBtn.innerHTML = '<i class="fas fa-plus"></i>';
        plusBtn.addEventListener('click', () => window.updateQuantity(item.id, item.quantity + 1));
        qtyControl.appendChild(minusBtn);
        qtyControl.appendChild(qtyDisplay);
        qtyControl.appendChild(plusBtn);

        details.appendChild(nameEl);
        details.appendChild(priceEl);
        details.appendChild(qtyControl);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '<i class="fas fa-trash me-1"></i>Remove';
        removeBtn.addEventListener('click', () => window.removeItem(item.id));

        row.appendChild(imageWrap);
        row.appendChild(details);
        row.appendChild(removeBtn);
        return row;
    }

    function updateSummary(total) {
        const delivery = 4; // Fixed $4 delivery fee
        const finalTotal = total + delivery;

        subtotalElement.textContent = `$${total.toFixed(2)}`;
        deliveryElement.textContent = `$${delivery.toFixed(2)}`;
        totalElement.textContent = `$${finalTotal.toFixed(2)}`;
    }

    function updateCheckoutButton(isEmpty) {
        if (isEmpty) {
            checkoutBtn.disabled = true;
            checkoutBtn.innerHTML = '<i class="fas fa-lock me-2"></i>Cart is Empty';
        } else {
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = '<i class="fas fa-lock me-2"></i>Proceed to Checkout';
        }
    }

    function updateCartCountDisplay(count) {
        if (cartCountElement) {
            cartCountElement.textContent = count;
        }
    }

    // Global functions for onclick handlers
    window.updateQuantity = function(productId, quantity) {
        CartManager.updateQuantity(productId, quantity);
        displayCart();
        showNotification('Cart updated!');
    };

    window.removeItem = function(productId) {
        CartManager.removeItem(productId);
        displayCart();
        showNotification('Item removed from cart!');
    };

    window.clearCartAction = function() {
        if (confirm('Are you sure you want to clear your cart?')) {
            CartManager.clearCart();
            displayCart();
            showNotification('Cart cleared!');
        }
    };

    // Show notification
    function showNotification(message) {
        // Remove existing notification if any
        const existingNotification = document.querySelector('.toast-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'toast-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Checkout button handler
    checkoutBtn.addEventListener("click", function() {
        if (!CartManager.isEmpty()) {
            CartManager.saveCart(CartManager.getCart());
            window.location.href = "checkout.html";
        } else {
            alert("Your cart is empty. Please add items before checkout.");
            window.location.href = "Home.html";
        }
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Initial display
    displayCart();

    // Listen for auth state changes to refresh cart
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(function(user) {
            displayCart();
            if (user) {
                const count = CartManager.getItemCount();
                updateCartCountDisplay(count);
            } else {
                updateCartCountDisplay(0);
            }
        });
    }
});
