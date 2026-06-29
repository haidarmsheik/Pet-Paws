window.CartManager = {
    getCurrentUserId: function () {
        if (typeof firebase === 'undefined' || !firebase.auth) return null;
        const user = firebase.auth().currentUser;
        return user ? user.uid : null;
    },

    getCartKey: function () {
        const userId = this.getCurrentUserId();
        return userId ? `petpaws_cart_${userId}` : 'petpaws_cart_guest';
    },

    initCart: function () {
        const savedCart = localStorage.getItem(this.getCartKey());
        return savedCart ? JSON.parse(savedCart) : {};
    },

    getCart: function () {
        return this.initCart();
    },

    saveCart: function (cart) {
        localStorage.setItem(this.getCartKey(), JSON.stringify(cart));
    },

    addItem: function (product) {
        const cart = this.initCart();
        const itemKey = `product-${product.id}`;
        if (cart[itemKey]) {
            cart[itemKey].quantity += 1;
        } else {
            cart[itemKey] = {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            };
        }
        this.saveCart(cart);
        return cart;
    },

    removeItem: function (productId) {
        const cart = this.initCart();
        delete cart[`product-${productId}`];
        this.saveCart(cart);
        return cart;
    },

    updateQuantity: function (productId, quantity) {
        const cart = this.initCart();
        const itemKey = `product-${productId}`;
        if (!cart[itemKey]) return cart;
        if (quantity <= 0) {
            delete cart[itemKey];
        } else {
            cart[itemKey].quantity = quantity;
        }
        this.saveCart(cart);
        return cart;
    },

    calculateTotal: function () {
        return Object.values(this.initCart())
            .reduce((sum, item) => sum + item.price * item.quantity, 0);
    },

    getItemCount: function () {
        return Object.values(this.initCart())
            .reduce((sum, item) => sum + (item.quantity || 0), 0);
    },

    isEmpty: function () {
        return Object.keys(this.initCart()).length === 0;
    },

    clearCart: function () {
        localStorage.setItem(this.getCartKey(), JSON.stringify({}));
    }
};

window.CartManager.getCartCount = window.CartManager.getItemCount;
