document.addEventListener('DOMContentLoaded', function () {
    // Initialize AOS Animation Library
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100
        });
    }

    const cartCountElement = document.getElementById('cart-count');
    const productContainer = document.getElementById('product-container');
    const petsContainer = document.getElementById('pets-container');

    // Products data with categories
    const defaultProducts = [
        { id: 1, name: "Alfa", price: 92, image: "image/alfafood.png", category: "food", description: "Premium quality pet food" },
        { id: 2, name: "Mix", price: 20, image: "image/mixfood.jpg", category: "food", description: "Balanced nutrition mix" },
        { id: 3, name: "Royal Canine", price: 17, image: "image/royalc.jpg", category: "food", description: "Veterinary recommended" },
        { id: 4, name: "Wilderness", price: 23, image: "image/wilderness.webp", category: "food", description: "Natural ingredients" },
        { id: 5, name: "Alleva", price: 26, image: "image/allevafood.png", category: "food", description: "Complete nutrition" },
        { id: 6, name: "Pro Plan", price: 28, image: "image/proplan.avif", category: "food", description: "Advanced nutrition" },
        { id: 7, name: "Premium Leash", price: 28, image: "image/leash.jpg", category: "accessories", description: "Durable and comfortable" },
        { id: 8, name: "Indoor Complete", price: 28, image: "image/indoorcomplete.jpg", category: "food", description: "For indoor cats" },
        { id: 9, name: "Equilibrio", price: 28, image: "image/equilibrio.jpg", category: "food", description: "Balanced diet formula" },
        { id: 10, name: "Cat Toy - Feather", price: 15, image: "image/toy1.jpg", category: "toys", description: "Interactive play toy" },
        { id: 11, name: "Cat Toy - Mouse", price: 12, image: "image/toy2.jpg", category: "toys", description: "Fun plush toy" },
        { id: 12, name: "Dog Treat - Premium", price: 18, image: "image/dogtreat.jpg", category: "food", description: "Delicious rewards" },
        { id: 13, name: "Dog Treat - Natural", price: 22, image: "image/dogtreats.jpg", category: "food", description: "All natural treats" },
        { id: 14, name: "Duo Shampoo", price: 25, image: "image/duoshamp.webp", category: "care", description: "Gentle cleansing" },
        { id: 15, name: "Dog Food - Premium", price: 45, image: "image/dog food-premium.webp", category: "food", description: "High protein formula" },
        { id: 16, name: "Dog Food - Organic", price: 52, image: "image/dog food - organic.jpg", category: "food", description: "100% organic ingredients" }
    ];

    // Pet adoption data
    const adoptablePets = [
        {
            id: 1,
            name: "Max",
            type: "dog",
            breed: "Golden Retriever",
            age: "2 years",
            gender: "Male",
            image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop",
            description: "Friendly and energetic Golden Retriever who loves to play fetch and cuddle.",
            badge: "Friendly",
            urgent: false
        },
        {
            id: 2,
            name: "Luna",
            type: "cat",
            breed: "Persian",
            age: "1 year",
            gender: "Female",
            image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop",
            description: "Beautiful Persian cat with a calm demeanor. Perfect for apartment living.",
            badge: "Calm",
            urgent: false
        },
        {
            id: 3,
            name: "Charlie",
            type: "dog",
            breed: "Beagle",
            age: "3 years",
            gender: "Male",
            image: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400&h=400&fit=crop",
            description: "Lovable Beagle with a great nose for adventure. Great with kids!",
            badge: "Good with Kids",
            urgent: true
        },
        {
            id: 4,
            name: "Milo",
            type: "cat",
            breed: "Siamese",
            age: "6 months",
            gender: "Male",
            image: "https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400&h=400&fit=crop",
            description: "Playful Siamese kitten full of energy and curiosity.",
            badge: "Playful",
            urgent: false
        },
        {
            id: 5,
            name: "Bella",
            type: "dog",
            breed: "Labrador",
            age: "4 years",
            gender: "Female",
            image: "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=400&h=400&fit=crop",
            description: "Gentle Labrador who loves swimming and long walks.",
            badge: "Gentle",
            urgent: false
        },
        {
            id: 6,
            name: "Whiskers",
            type: "cat",
            breed: "Tabby",
            age: "2 years",
            gender: "Male",
            image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop",
            description: "Affectionate tabby who loves to be petted and purrs loudly.",
            badge: "Affectionate",
            urgent: false
        },
        {
            id: 7,
            name: "Rocky",
            type: "dog",
            breed: "German Shepherd",
            age: "3 years",
            gender: "Male",
            image: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400&h=400&fit=crop",
            description: "Loyal and protective German Shepherd. Needs an experienced owner.",
            badge: "Loyal",
            urgent: true
        },
        {
            id: 8,
            name: "Coco",
            type: "others",
            breed: "Parrot",
            age: "5 years",
            gender: "Female",
            image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=400&fit=crop",
            description: "Colorful parrot who can mimic sounds and loves attention.",
            badge: "Talkative",
            urgent: false
        }
    ];

    const PLACEHOLDER_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect fill='%23ddd' width='200' height='200'/><text x='50%25' y='55%25' text-anchor='middle' fill='%23888' font-family='sans-serif'>No image</text></svg>";

    let products = [...defaultProducts];
    let currentFilter = 'all';
    let currentPetFilter = 'all';

    function createProductCard(product) {
        const col = document.createElement('div');
        col.className = 'col-lg-3 col-md-4 col-sm-6 product-item';
        col.dataset.category = product.category;
        const card = document.createElement('div');
        card.className = 'product';
        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'product-image-wrapper';
        const img = document.createElement('img');
        img.src = product.image || PLACEHOLDER_IMAGE;
        img.alt = product.name;
        imageWrapper.appendChild(img);
        const actions = document.createElement('div');
        actions.className = 'product-actions';
        const cartBtn = document.createElement('button');
        cartBtn.className = 'product-action-btn cart';
        cartBtn.title = 'Add to Cart';
        cartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i>';
        cartBtn.addEventListener('click', () => addToCart(product.id));
        const viewBtn = document.createElement('button');
        viewBtn.className = 'product-action-btn view';
        viewBtn.title = 'Quick View';
        viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
        viewBtn.addEventListener('click', () => quickView(product.id));
        actions.appendChild(cartBtn);
        actions.appendChild(viewBtn);
        imageWrapper.appendChild(actions);
        const info = document.createElement('div');
        info.className = 'product-info';
        const name = document.createElement('h5');
        name.className = 'product-name';
        name.textContent = product.name;
        const price = document.createElement('div');
        price.className = 'product-price';
        price.textContent = `$${Number(product.price || 0).toFixed(2)}`;
        info.appendChild(name);
        info.appendChild(price);
        card.appendChild(imageWrapper);
        card.appendChild(info);
        col.appendChild(card);
        return col;
    }

    function createPetCard(pet) {
        const col = document.createElement('div');
        col.className = 'col-lg-3 col-md-4 col-sm-6 pet-item';
        col.dataset.type = pet.type;
        const card = document.createElement('div');
        card.className = 'pet-card';
        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'pet-image-wrapper';
        const img = document.createElement('img');
        img.src = pet.image;
        img.alt = pet.name;
        imageWrapper.appendChild(img);
        const badge = document.createElement('span');
        badge.className = `pet-badge ${pet.urgent ? 'urgent' : ''}`;
        badge.textContent = pet.urgent ? 'Urgent' : pet.badge;
        imageWrapper.appendChild(badge);
        const info = document.createElement('div');
        info.className = 'pet-info';
        const name = document.createElement('h5');
        name.className = 'pet-name';
        name.textContent = pet.name;
        const meta = document.createElement('div');
        meta.className = 'pet-meta';
        meta.innerHTML = `
            <span><i class="fas fa-paw"></i> ${pet.breed}</span>
            <span><i class="fas fa-birthday-cake"></i> ${pet.age}</span>
            <span><i class="fas fa-venus-mars"></i> ${pet.gender}</span>
        `;
        const description = document.createElement('p');
        description.className = 'pet-description';
        description.textContent = pet.description;
        const adoptBtn = document.createElement('button');
        adoptBtn.className = 'btn-adopt';
        adoptBtn.innerHTML = '<i class="fas fa-heart me-2"></i>Adopt Me';
        adoptBtn.addEventListener('click', () => openAdoptionModal(pet));
        info.appendChild(name);
        info.appendChild(meta);
        info.appendChild(description);
        info.appendChild(adoptBtn);
        card.appendChild(imageWrapper);
        card.appendChild(info);
        col.appendChild(card);
        return col;
    }

    function generateProductCards() {
        if (!productContainer) return;
        productContainer.innerHTML = '';
        const filteredProducts = currentFilter === 'all' 
            ? products 
            : products.filter(p => p.category === currentFilter);
        if (filteredProducts.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'col-12 text-center py-5';
            empty.innerHTML = '<p class="text-muted">No products found in this category.</p>';
            productContainer.appendChild(empty);
            return;
        }
        filteredProducts.forEach(product => {
            productContainer.appendChild(createProductCard(product));
        });
    }

    function generatePetCards() {
        if (!petsContainer) return;
        petsContainer.innerHTML = '';
        const filteredPets = currentPetFilter === 'all' 
            ? adoptablePets 
            : adoptablePets.filter(p => p.type === currentPetFilter);
        if (filteredPets.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'col-12 text-center py-5';
            empty.innerHTML = '<p class="text-muted">No pets available in this category.</p>';
            petsContainer.appendChild(empty);
            return;
        }
        filteredPets.forEach(pet => {
            petsContainer.appendChild(createPetCard(pet));
        });
    }

    function initProductFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                generateProductCards();
            });
        });
    }

    function initPetFilters() {
        const petTabs = document.querySelectorAll('.pet-tab');
        petTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                petTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                currentPetFilter = this.dataset.pet;
                generatePetCards();
            });
        });
    }

    function addToCart(productId) {
        const product = products.find(p => String(p.id) === String(productId));
        if (!product) return;
        window.CartManager.addItem(product);
        updateCartCount();
        showNotification(`Added ${product.name} to cart!`, 'success');
    }

    function quickView(productId) {
        const product = products.find(p => String(p.id) === String(productId));
        if (product) showQuickViewModal(product);
    }

    function showQuickViewModal(product) {
        const modal = document.getElementById('quickViewModal');
        if (!modal) return;
        const modalImg = document.getElementById('quick-view-image');
        const modalTitle = document.getElementById('quick-view-title');
        const modalPrice = document.getElementById('quick-view-price');
        const modalDesc = document.getElementById('quick-view-description');
        const quantityInput = document.getElementById('quick-view-quantity');
        modalImg.src = product.image || PLACEHOLDER_IMAGE;
        modalImg.alt = product.name;
        modalTitle.textContent = product.name;
        modalPrice.textContent = `$${Number(product.price || 0).toFixed(2)}`;
        modalDesc.textContent = product.description || `High-quality ${product.name} for your beloved pet. Perfect for daily use!`;
        quantityInput.value = 1;
        const addToCartBtn = document.getElementById('quick-view-add-to-cart');
        addToCartBtn.onclick = function () {
            const quantity = parseInt(quantityInput.value) || 1;
            for (let i = 0; i < quantity; i++) {
                window.CartManager.addItem(product);
            }
            updateCartCount();
            showNotification(`Added ${quantity} x ${product.name} to cart!`, 'success');
            bootstrap.Modal.getInstance(modal).hide();
        };
        new bootstrap.Modal(modal).show();
    }

    window.openBookingModal = function(serviceType) {
        const modal = document.getElementById('bookingModal');
        const serviceInput = document.getElementById('booking-service');
        if (serviceInput) {
            serviceInput.value = serviceType;
        }
        new bootstrap.Modal(modal).show();
    };

    window.submitBooking = function(event) {
        event.preventDefault();
        showNotification('Appointment booked successfully! We will contact you shortly.', 'success');
        const modal = document.getElementById('bookingModal');
        bootstrap.Modal.getInstance(modal).hide();
        event.target.reset();
    };

    window.callEmergency = function() {
        if (confirm('Call Emergency Vet Line: +961 76 836 173?')) {
            window.location.href = 'tel:+96176836173';
        }
    };

    window.openAdoptionModal = function(pet) {
        const modal = document.getElementById('adoptionModal');
        const petImage = document.getElementById('adoption-pet-image');
        const petInfo = document.getElementById('adoption-pet-info');
        if (petImage) petImage.src = pet.image;
        if (petInfo) {
            petInfo.innerHTML = `
                <h6 class="mb-2">${pet.name}</h6>
                <p class="mb-1"><strong>Breed:</strong> ${pet.breed}</p>
                <p class="mb-1"><strong>Age:</strong> ${pet.age}</p>
                <p class="mb-1"><strong>Gender:</strong> ${pet.gender}</p>
                <p class="mb-0"><strong>Description:</strong> ${pet.description}</p>
            `;
        }
        new bootstrap.Modal(modal).show();
    };

    window.submitAdoption = function(event) {
        event.preventDefault();
        showNotification('Adoption application submitted! We will review and contact you soon.', 'success');
        const modal = document.getElementById('adoptionModal');
        bootstrap.Modal.getInstance(modal).hide();
        event.target.reset();
    };

    window.submitContactForm = function(event) {
        event.preventDefault();
        showNotification('Message sent successfully! We will get back to you soon.', 'success');
        event.target.reset();
    };

    function showNotification(message, type = 'success') {
        const existing = document.querySelector('.toast-notification');
        if (existing) existing.remove();
        const notification = document.createElement('div');
        notification.className = 'toast-notification';
        const icon = document.createElement('i');
        icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-info-circle';
        const text = document.createElement('span');
        text.textContent = message;
        notification.appendChild(icon);
        notification.appendChild(text);
        const bgColor = type === 'success' ? '#28a745' : '#17a2b8';
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 9999;
            animation: slideIn 0.3s ease;
            border-left: 4px solid ${bgColor};
        `;
        icon.style.color = bgColor;
        icon.style.fontSize = '1.5rem';
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    window.loadMoreProducts = function() {
        showNotification('Loading more products...', 'info');
        setTimeout(() => {
            showNotification('All products loaded!', 'success');
        }, 1000);
    };

    function loadProducts() {
        if (typeof firebase === 'undefined' || !firebase.database) return;
        firebase.database().ref('products').on('value', function (snapshot) {
            const data = snapshot.val();
            if (data && Object.keys(data).length > 0) {
                products = Object.keys(data).map(key => ({
                    id: key,
                    name: data[key].name || 'Unnamed Product',
                    price: parseFloat(data[key].price) || 0,
                    image: data[key].image || PLACEHOLDER_IMAGE,
                    description: data[key].description || '',
                    category: data[key].category || 'food'
                }));
            } else {
                products = [...defaultProducts];
            }
            generateProductCards();
        });
    }

    function updateCartCount() {
        if (!cartCountElement) return;
        cartCountElement.textContent = window.CartManager.getItemCount();
    }

    window.scrollToSection = function (id) {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + id) {
                    link.classList.add('active');
                }
            });
        }
    };

    window.scrollToFooter = function () {
        const footer = document.querySelector('footer');
        if (footer) footer.scrollIntoView({ behavior: 'smooth' });
    };

    window.scrollToTop = function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.goToCart = function () {
        window.location.href = 'addTocart.html';
    };

    window.goToLogin = function () {
        window.location.href = 'index.html';
    };

    window.goToProfile = function () {
        window.location.href = 'Home.html#about-us';
    };

    window.goToOrders = function () {
        window.location.href = 'addTocart.html';
    };

    window.subscribeNewsletter = function (event) {
        event.preventDefault();
        showNotification('Thank you for subscribing to our newsletter!', 'success');
        event.target.reset();
    };

    window.logoutUser = function () {
        if (typeof firebase === 'undefined' || !firebase.auth) {
            window.location.href = 'index.html';
            return;
        }
        firebase.auth().signOut().then(() => {
            sessionStorage.removeItem('adminSession');
            sessionStorage.removeItem('adminEmail');
            window.location.href = 'index.html';
        });
    };

    function initAccountDropdown() {
        const toggle = document.getElementById('account-toggle');
        const menu = document.getElementById('account-dropdown-menu');
        if (!toggle || !menu) return;
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            menu.classList.toggle('show');
        });
        document.addEventListener('click', function() {
            menu.classList.remove('show');
        });
        menu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    function updateDropdownAuth(user) {
        const loginLink = document.getElementById('dropdown-login-link');
        const logoutLink = document.getElementById('dropdown-logout-link');
        const adminLink = document.getElementById('dropdown-admin-link');
        const dropdownEmail = document.getElementById('dropdown-email');
        if (!dropdownEmail) return;
        if (user) {
            dropdownEmail.textContent = user.email;
            if (loginLink) loginLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = '';
            if (adminLink) adminLink.style.display = (user.email === window.ADMIN_EMAIL) ? '' : 'none';
        } else {
            dropdownEmail.textContent = 'Sign in to your account';
            if (loginLink) loginLink.style.display = '';
            if (logoutLink) logoutLink.style.display = 'none';
            if (adminLink) adminLink.style.display = 'none';
        }
        const adminNav = document.getElementById('admin-nav-item');
        const logoutNav = document.getElementById('logout-nav-item');
        if (user) {
            if (logoutNav) logoutNav.style.display = '';
            if (adminNav) adminNav.style.display = (user.email === window.ADMIN_EMAIL) ? '' : 'none';
        } else {
            if (logoutNav) logoutNav.style.display = 'none';
            if (adminNav) adminNav.style.display = 'none';
        }
    }

    generateProductCards();
    generatePetCards();
    initProductFilters();
    initPetFilters();
    updateCartCount();
    initAccountDropdown();

    if (typeof firebase !== 'undefined' && firebase.database) {
        loadProducts();
    } else {
        setTimeout(loadProducts, 200);
    }

    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(function (user) {
            updateCartCount();
            updateDropdownAuth(user);
        });
    }

    window.addEventListener('scroll', function () {
        const navbar = document.querySelector('.navbar');
        const scrollTop = document.getElementById('scroll-top');
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 100);
        if (scrollTop) scrollTop.classList.toggle('visible', window.scrollY > 100);
    });

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            const term = e.target.value.toLowerCase();
            const searchResults = document.getElementById('search-results');
            if (term.length < 2) {
                if (searchResults) searchResults.innerHTML = '';
                return;
            }
            const filtered = products.filter(p => p.name.toLowerCase().includes(term));
            if (searchResults) {
                if (filtered.length === 0) {
                    searchResults.innerHTML = '<p class="text-muted text-center">No products found</p>';
                } else {
                    searchResults.innerHTML = filtered.map(p => `
                        <div class="d-flex align-items-center gap-3 p-2 border-bottom cursor-pointer search-result-item" onclick="quickView(${p.id})" style="cursor: pointer;">
                            <img src="${p.image}" alt="${p.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
                            <div>
                                <h6 class="mb-0">${p.name}</h6>
                                <span class="text-primary">$${p.price.toFixed(2)}</span>
                            </div>
                        </div>
                    `).join('');
                }
            }
        });
    }

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
        .search-result-item:hover {
            background: #f8f9fa;
        }
    `;
    document.head.appendChild(style);
});