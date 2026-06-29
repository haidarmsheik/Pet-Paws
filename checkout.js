const database = firebase.database();
const CartManager = window.CartManager;

let userLocation = { lat: 0, lng: 0 };
let currentTotal = 0;

// Display order items in summary
function displayOrderItems() {
    const container = document.getElementById('order-items-container');
    const cart = CartManager.initCart();
    
    if (CartManager.isEmpty()) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">No items in cart</p>';
        return;
    }
    
    container.innerHTML = '';
    Object.values(cart).forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';

        const imageWrap = document.createElement('div');
        imageWrap.className = 'order-item-image';
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.name;
        imageWrap.appendChild(img);

        const details = document.createElement('div');
        details.className = 'order-item-details';
        const nameEl = document.createElement('div');
        nameEl.className = 'order-item-name';
        nameEl.textContent = item.name;
        const qtyEl = document.createElement('div');
        qtyEl.className = 'order-item-quantity';
        qtyEl.textContent = `Qty: ${item.quantity}`;
        details.appendChild(nameEl);
        details.appendChild(qtyEl);

        const priceEl = document.createElement('div');
        priceEl.className = 'order-item-price';
        priceEl.textContent = `$${(item.price * item.quantity).toFixed(2)}`;

        orderItem.appendChild(imageWrap);
        orderItem.appendChild(details);
        orderItem.appendChild(priceEl);
        container.appendChild(orderItem);
    });
}

function updateSummary() {
    const total = CartManager.calculateTotal();
    const delivery = 4;
    const finalTotal = total + delivery;
    
    document.getElementById('checkout-subtotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('checkout-delivery').textContent = `$${delivery.toFixed(2)}`;
    document.getElementById('checkout-total').textContent = `$${finalTotal.toFixed(2)}`;
    
    currentTotal = finalTotal;
}

function initializeMockPayment() {
    if (CartManager.isEmpty()) {
        const paymentMethodsDiv = document.querySelector('.payment-methods');
        if (paymentMethodsDiv) {
            paymentMethodsDiv.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">Your cart is empty!</p>';
        }
        return;
    }

    const buttons = [
        { id: 'card-btn', method: 'Credit Card' },
        { id: 'crypto-btn', method: 'Crypto' },
        { id: 'cod-btn', method: 'Cash on Delivery' }
    ];

    buttons.forEach(({ id, method }) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                showPaymentForm(method);
            });
        }
    });

    document.querySelectorAll('[data-pay-method]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            confirmPayment(btn.dataset.payMethod);
        });
    });

    document.querySelectorAll('[data-pay-cancel]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            cancelPayment();
        });
    });
}

const METHOD_TO_BTN = {
    'Credit Card': 'card-btn',
    'Crypto': 'crypto-btn',
    'Cash on Delivery': 'cod-btn'
};

const METHOD_TO_FORM = {
    'Credit Card': 'card-form',
    'Crypto': 'crypto-form',
    'Cash on Delivery': 'cod-form'
};

function showPaymentForm(method) {
    document.querySelectorAll('.payment-btn').forEach(btn => btn.classList.remove('active'));
    const selectedBtn = document.getElementById(METHOD_TO_BTN[method]);
    if (selectedBtn) selectedBtn.classList.add('active');

    document.querySelectorAll('.payment-form').forEach(f => f.classList.remove('active'));
    const formEl = document.getElementById(METHOD_TO_FORM[method]);
    if (formEl) formEl.classList.add('active');
}

function cancelPayment() {
    document.querySelectorAll('.payment-form').forEach(f => f.classList.remove('active'));
    document.querySelectorAll('.payment-btn').forEach(btn => btn.classList.remove('active'));
}

function validatePaymentForm(method) {
    switch (method) {
        case 'Credit Card': {
            const holder = document.getElementById('card-holder').value.trim();
            const number = document.getElementById('card-number').value.trim();
            const expiry = document.getElementById('card-expiry').value.trim();
            const cvv = document.getElementById('card-cvv').value.trim();
            if (!holder || !number || !expiry || !cvv) {
                alert("Please fill in all card details!");
                return false;
            }
            break;
        }
        case 'Crypto': {
            const wallet = document.getElementById('crypto-wallet').value.trim();
            if (!wallet) {
                alert("Please enter your crypto wallet address!");
                return false;
            }
            break;
        }
        case 'Cash on Delivery': {
            const phone = document.getElementById('cod-phone').value.trim();
            const addr = document.getElementById('cod-address').value.trim();
            if (!phone || !addr) {
                alert("Please enter your Phone Number and Delivery Address for Cash on Delivery!");
                return false;
            }
            break;
        }
    }
    return true;
}

function confirmPayment(method) {
    const nameInput = document.getElementById('name');
    const addrInput = document.getElementById('address');

    if (!nameInput.value.trim() || !addrInput.value.trim()) {
        alert("Please enter your Full Name and Street Address above!");
        return;
    }

    if (!validatePaymentForm(method)) return;

    const user = firebase.auth().currentUser;
    if (!user) {
        alert("Please sign in before placing an order.");
        window.location.href = "index.html";
        return;
    }

    const finalName = nameInput.value.trim();
    const finalAddress = addrInput.value.trim();

    let phone = '';
    let codAddress = '';
    let notes = '';
    if (method === 'Cash on Delivery') {
        phone = document.getElementById('cod-phone').value.trim();
        codAddress = document.getElementById('cod-address').value.trim();
        notes = document.getElementById('cod-notes').value.trim();
    }

    const cart = CartManager.initCart();
    const cartItems = Object.values(cart).map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
    }));

    if (cartItems.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const activeForm = document.querySelector('.payment-form.active');
    const originalContent = activeForm.innerHTML;
    activeForm.innerHTML = '<div style="text-align: center; padding: 20px;"><h3>Processing...</h3><p>Saving your order...</p></div>';

    const status = method === 'Cash on Delivery' ? 'Paid on Delivery' : 'Paid';
    const ordersRef = database.ref('orders');

    ordersRef.push({
        userId: user.uid,
        customerName: finalName,
        address: finalAddress,
        phone: phone,
        deliveryAddress: codAddress,
        notes: notes,
        items: cartItems,
        total: currentTotal,
        paymentMethod: method,
        status: status,
        timestamp: Date.now(),
        location: userLocation,
        addressText: finalAddress
    }).then(() => {
        alert("Success! Order placed for " + finalName);
        CartManager.clearCart();
        window.location.href = "Home.html";
    }).catch((error) => {
        console.error("Firebase Error:", error);
        alert("Error: " + error.message);
        activeForm.innerHTML = originalContent;
    });
}

function initializeCheckout() {
    displayOrderItems();
    updateSummary();
    initializeMockPayment();
}

window.addEventListener('load', () => {
    if (typeof firebase === 'undefined') {
        console.error("Firebase is not loaded!");
        currentTotal = 0;
        updateSummary();
        initializeMockPayment();
        return;
    }

    firebase.auth().onAuthStateChanged(function() {
        initializeCheckout();
    });

    // Get Location button handler
    const getLocationBtn = document.getElementById('getLocation');
    if (getLocationBtn) {
        getLocationBtn.addEventListener('click', async function() {
            if (!navigator.geolocation) {
                const locationStatus = document.getElementById('locationStatus');
                locationStatus.textContent = "❌ Geolocation is not supported by your browser";
                locationStatus.className = 'error';
                locationStatus.style.display = 'block';
                return;
            }

            // Show loading state
            getLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting Location...';
            getLocationBtn.disabled = true;

            try {
                const pos = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });

                // Success - got coordinates
                userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };

                const addressResponse = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.lat}&lon=${userLocation.lng}`
                );

                if (!addressResponse.ok) {
                    throw new Error('Failed to fetch address');
                }

                const addressData = await addressResponse.json();

                // Extract address components
                const address = addressData.display_name || '';
                const road = addressData.address?.road || '';
                const house_number = addressData.address?.house_number || '';
                const suburb = addressData.address?.suburb || '';
                const city = addressData.address?.city || addressData.address?.town || addressData.address?.village || '';
                const country = addressData.address?.country || '';

                // Build a nice address string
                let fullAddress = '';
                if (house_number && road) {
                    fullAddress = `${house_number} ${road}`;
                } else if (road) {
                    fullAddress = road;
                }
                
                if (suburb) {
                    fullAddress += `, ${suburb}`;
                }
                if (city) {
                    fullAddress += `, ${city}`;
                }
                if (country) {
                    fullAddress += `, ${country}`;
                }

                // Fill the address field
                const addressInput = document.getElementById('address');
                if (addressInput) {
                    addressInput.value = fullAddress || address;
                }

                // Show success message
                const locationStatus = document.getElementById('locationStatus');
                locationStatus.textContent = `✓ Location Saved`;
                locationStatus.className = 'success';
                locationStatus.style.display = 'block';

            } catch (error) {
                // Error handling
                console.error("Location error:", error);
                const locationStatus = document.getElementById('locationStatus');
                
                let errorMessage = "❌ Unable to get location. ";
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage += "Please allow location access.";
                } else if (error.message.includes('fetch')) {
                    errorMessage += "Could not fetch address.";
                } else {
                    errorMessage += "Please try again.";
                }
                
                locationStatus.textContent = errorMessage;
                locationStatus.className = 'error';
                locationStatus.style.display = 'block';
            } finally {
                // Reset button
                getLocationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Pin My Current Location';
                getLocationBtn.disabled = false;
            }
        });
    }
});