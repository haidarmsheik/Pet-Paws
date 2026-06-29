# Pet & Paws

A comprehensive pet care e-commerce platform built with vanilla HTML, CSS, JavaScript, and Firebase Realtime Database. Features pet products shopping, veterinary services booking, and pet adoption.

## 🌟 Features

### 🛍️ Pet Store
- Browse premium pet products (food, toys, accessories, care products)
- Product filtering by category (All, Food, Toys, Care, Accessories)
- Quick view modal with product details
- Shopping cart functionality
- Real-time search with instant results
- Smooth animations and hover effects

### 🏥 Veterinary Clinic
- 6 professional veterinary services:
  - General Checkups
  - Vaccinations
  - Grooming Services
  - Dental Care
  - Laboratory Tests
  - 24/7 Emergency Care
- Online appointment booking system
- Expert veterinary team showcase
- Emergency call button

### 🏠 Pet Adoption
- Browse adoptable pets (dogs, cats, birds, and more)
- Pet filtering by type (All, Dogs, Cats, Others)
- Detailed pet profiles with breed, age, gender
- Online adoption application form
- 4-step adoption process guide
- Success stories and testimonials
- Adoption statistics

### 📚 Pet Care Tips
- Expert advice articles
- Nutrition, exercise, and training guides
- Links to detailed blog content

### 📞 Contact & Support
- Contact form with validation
- Business information and working hours
- Newsletter subscription
- Social media links

## 🚀 Tech Stack

- **Frontend:** HTML5 / CSS3 / Vanilla JavaScript (no build step)
- **UI Framework:** Bootstrap 5 + Font Awesome 6
- **Animations:** AOS (Animate On Scroll) Library
- **Backend:** Firebase Realtime Database
- **Authentication:** Firebase Auth (compat + modular SDK)
- **Hosting:** Static site (can run anywhere)

## 📋 Setup Instructions

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication and Realtime Database

2. **Configure Firebase**
   - Copy `firebase-config.example.js` to `firebase-config.js`
   - Paste your project's web config into `firebase-config.js`
   - Set `ADMIN_EMAIL` in `firebase-config.js` for admin access
   - Keep `firebase-config.js` local (it's ignored by Git)

3. **Deploy Security Rules**
   - Deploy rules from `database.rules.json`:
     ```bash
     firebase deploy --only database
     ```
   - Or paste them manually in Firebase Console > Realtime Database > Rules

4. **Run the Site**
   - Open `Home.html` in any modern browser
   - The site is fully static and runs locally

## 💳 Payment System

This project includes a simulated checkout with three payment methods:
- **Credit Card** (demo only - no real processing)
- **Cryptocurrency** (demo)
- **Cash on Delivery**

> ⚠️ **Note:** No real money is processed. For production, integrate Stripe or similar payment processor.

## 📁 Project Structure

```
Pet & Paws/
├── Home.html                  # Main storefront page
├── home.js                    # Main JavaScript functionality
├── styles.css                 # Main stylesheet with all sections
├── cart.js                    # Shared CartManager
├──
├── 🛍️ E-Commerce
│   ├── addTocart.html         # Shopping cart page
│   ├── addTocart.js
│   ├── addtocart.css
│   ├── checkout.html          # Checkout page
│   ├── checkout.js
│   └── checkout.css
│
├── 🏥 Veterinary
│   └── (Integrated in Home.html)
│
├── 🏠 Pet Adoption
│   └── (Integrated in Home.html)
│
├── 🔐 Authentication
│   ├── index.html             # User login
│   ├── signup.html
│   ├── signup.js
│   └── admin-login.html       # Admin login
│
├── 👨‍💼 Admin Dashboard
│   ├── admin.html
│   ├── admin.js
│   └── admin.css
│
├── 📝 Content
│   ├── blog.html              # Pet care blog
│   └── README.md
│
├── 🔧 Configuration
│   ├── firebase-config.example.js
│   ├── firebase-config.js     # (local, ignored)
│   └── database.rules.json
│
└── 🖼️ Assets
    └── image/                 # Product images and logos
```

## 🎨 UI/UX Highlights

- **Responsive Design:** Mobile-first approach, works on all devices
- **Smooth Animations:** AOS scroll animations, hover effects
- **Modern UI:** Clean design with coral/orange color theme
- **Interactive Elements:** Modals, filters, search, booking forms
- **Accessibility:** Semantic HTML, ARIA labels, keyboard navigation

## 🔒 Security Notes

- **API Keys:** Firebase web API keys are visible in browser - protect with:
  - Firebase Authentication
  - Realtime Database security rules
  - API key restrictions in Google Cloud Console
- **Git Safety:** Never commit `firebase-config.js` - use the example file
- **Data Validation:** All form inputs are validated client and server-side

## 🐛 Known Issues & TODOs

- **File Naming:** `Home.html`, `addTocart.html` use mixed case - rename to lowercase for Linux deployment
- **Folder Structure:** Consider organizing into `/css`, `/js`, `/images` folders
- **Image Optimization:** `image/alfafood.png` is 4.6 MB - compress for production
- **Future Enhancements:**
  - User profile pages
  - Order history
  - Live chat support
  - Pet health records integration

## 📝 Recent Updates

### Version 2.0 - Major Enhancement
- ✅ Added Veterinary Clinic section with 6 services
- ✅ Added Pet Adoption section with 8 pets
- ✅ Added Pet Care Tips section
- ✅ Added Contact section with form
- ✅ Product category filtering
- ✅ Real-time search functionality
- ✅ AOS scroll animations
- ✅ Enhanced hero section with stats
- ✅ Improved navigation with new sections
- ✅ Booking and adoption modals
- ✅ Success notifications system

## 🤝 Contributing

This is a university coursework project. Feel free to fork and enhance!

## 📄 License

© 2024 Pet & Paws. All Rights Reserved.

---

**Made with ❤️ for pet lovers everywhere!**
