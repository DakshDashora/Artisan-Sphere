<div align="center">

# 🎨 Artisan Sphere

### *A Trusted Full-Stack Marketplace for Artisans & Craft Lovers*

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-artisansphere.vercel.app-brightgreen?style=for-the-badge)](https://artisansphere.vercel.app)
[![Backend](https://img.shields.io/badge/Backend%20API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge&logo=vercel)](https://artisansphere.vercel.app)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)

<br/>

> **Artisan Sphere** is a full-stack marketplace platform that bridges skilled artisans with buyers who value handcrafted goods. Artisans can list products, manage orders, and grow their craft business — while buyers enjoy a curated, secure shopping experience powered by AI-generated descriptions and multilingual support.

<br/>

![-------------------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

</div>

## 📌 Table of Contents

- [✨ Features](#-features)
- [🧱 Architecture Overview](#-architecture-overview)
- [📁 Directory Structure](#-directory-structure)
- [🗃️ File Reference](#️-file-reference)
- [🛠️ Tech Stack](#️-tech-stack)
- [🔌 API Routes](#-api-routes)
- [🖥️ Frontend Pages & Components](#️-frontend-pages--components)
- [☁️ Cloudinary Integration](#️-cloudinary-integration)
- [🔑 Environment Variables](#-environment-variables)
- [🚀 Getting Started](#-getting-started)
- [🤝 Contributing](#-contributing)
- [👤 Author](#-author)

![-------------------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

## ✨ Features

| Feature | Description |
|---|---|
| 🛍️ **Artisan Marketplace** | Browse, filter, and purchase unique handcrafted products |
| 🔐 **JWT Authentication** | Secure login & signup with token-based auth for buyers and artisans |
| 🤖 **AI Product Descriptions** | Groq LLM generates compelling product descriptions automatically |
| 📸 **Cloud Image Storage** | Product images uploaded and served via Cloudinary CDN |
| 📦 **Order Management** | Full order lifecycle — place, track, and manage orders |
| 🎨 **Artisan Dashboard** | Dedicated dashboard for artisans to manage products and orders |
| 🌍 **Multilingual Support** | i18n translations via `translations.js` with Language context |
| 🌗 **Theme Switching** | Light/dark theme toggle powered by ThemeContext |
| 🛒 **Shopping Cart** | Persistent cart with product quantity management |
| 🔍 **Search & Filter** | Search products by keyword and filter by category/price |
| 📱 **Fully Responsive** | Mobile-first design that works on all screen sizes |
| 📖 **Story Creation** | Artisans can create stories to share their journey and craft |

![-------------------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

## 🧱 Architecture Overview

```
                     ┌──────────────────────────┐
                     │        USER BROWSER       │
                     └───────────┬──────────────┘
                                 │
                      ┌──────────▼──────────┐
                      │   React Frontend     │
                      │   (Vite + JSX)       │
                      │   Deployed: Vercel   │
                      └──────────┬──────────┘
                                 │  REST API Calls (Axios)
                      ┌──────────▼──────────┐
                      │   FastAPI Backend    │
                      │   Python + Uvicorn   │
                      │   Deployed: Render   │
                      └──────┬──────────┬───┘
                             │          │
            ┌────────────────┘          └────────────────┐
            │                                            │
 ┌──────────▼──────────┐                  ┌─────────────▼──────────────┐
 │    PostgreSQL DB     │                  │      External Services      │
 │  (via DATABASE_URL)  │                  │  ┌──────────────────────┐  │
 └─────────────────────┘                  │  │  Cloudinary (Images)  │  │
                                          │  │  Groq LLM (AI Text)   │  │
                                          │  └──────────────────────┘  │
                                          └────────────────────────────┘
```

![-------------------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

## 📁 Directory Structure

```
Artisan-Sphere/
│
├── .gitignore
├── tree.txt
│
├── Backend/
│   ├── .env
│   ├── requirements.txt
│   │
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── models.py
│       ├── schemas.py
│       ├── helpers.py
│       ├── prompts.py
│       ├── utils.py
│       │
│       ├── routes/
│       │   ├── api.py
│       │   ├── auth.py
│       │   └── product.py
│       │
│       └── services/
│           ├── cloudinary_service.py
│           └── llm_services.py
│
└── Frontend/
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    ├── README.md
    │
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── baseurl.jsx
        ├── index.css
        │
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── HeroSection.jsx
        │   ├── ProductGrid.jsx
        │   ├── FilterBar.jsx
        │   ├── CreateStoryModal.jsx
        │   └── GenerateDescriptionModal.jsx
        │
        ├── contexts/
        │   ├── AuthContext.jsx
        │   ├── ThemeContext.jsx
        │   └── LanguageContext.jsx
        │
        ├── i18n/
        │   └── translations.js
        │
        ├── pages/
        │   ├── Index.jsx
        │   ├── Login.jsx
        │   ├── Signup.jsx
        │   ├── ExploreMarketplace.jsx
        │   ├── ProductPage.jsx
        │   ├── SearchResult.jsx
        │   ├── Cart.jsx
        │   ├── ArtisanDashboard.jsx
        │   ├── ArtisanProduct.jsx
        │   ├── AddProduct.jsx
        │   ├── ManageOrders.jsx
        │   ├── OrderHistory.jsx
        │   ├── Profile.jsx
        │   ├── NotFound.jsx
        │   └── UnderProduction.jsx
        │
        └── routes/
            └── ProtectedRoute.jsx
```

![-------------------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

## 🗃️ File Reference

### 🐍 Backend

#### Core App Files

| File | What it does |
|------|-------------|
| `app/main.py` | Initializes the FastAPI application, registers all routers (`auth`, `product`, `api`), configures CORS middleware using `FRONTEND_URL`, and starts the Uvicorn ASGI server |
| `app/database.py` | Creates the SQLAlchemy engine from `DATABASE_URL`, sets up the `SessionLocal` factory, and exposes the `get_db()` dependency used to inject DB sessions into route handlers |
| `app/models.py` | Defines all SQLAlchemy ORM models — database tables for Users, Products, Orders, CartItems, Stories, and their relationships |
| `app/schemas.py` | Pydantic models that validate and serialize incoming request bodies and outgoing responses (e.g., `ProductCreate`, `UserOut`, `OrderResponse`) |
| `app/helpers.py` | Shared business logic used across multiple routes — e.g., ownership verification, data transformation, reusable query helpers |
| `app/prompts.py` | Stores prompt templates sent to the Groq LLM, e.g., the product description generation prompt with dynamic variable injection |
| `app/utils.py` | Utility functions — password hashing with bcrypt, JWT token creation, and token decoding/verification for auth middleware |
| `requirements.txt` | Pinned Python package dependencies for reproducible installs |

#### Routes

| File | What it does |
|------|-------------|
| `routes/auth.py` | Handles `/auth` endpoints: user registration (hashes password, saves to DB), login (verifies credentials, returns JWT), and `GET /auth/me` for current user info |
| `routes/product.py` | Handles `/products` endpoints: full CRUD for product listings, search by keyword, filter by category/price, and fetch products by artisan ID |
| `routes/api.py` | Handles miscellaneous endpoints: cart operations (add/get/remove), order placement, order status updates, and artisan story creation/retrieval. Also exposes the `/generate-description` LLM endpoint |

#### Services

| File | What it does |
|------|-------------|
| `services/cloudinary_service.py` | Wraps the Cloudinary Python SDK — `upload_image(file)` streams the image to Cloudinary and returns `{ secure_url, public_id }`. `delete_image(public_id)` removes the asset when a product is deleted |
| `services/llm_services.py` | Calls the Groq API with a product prompt from `prompts.py`, parses the streamed text response, and returns the AI-generated product description string |

---

### ⚛️ Frontend

#### Root Files

| File | What it does |
|------|-------------|
| `index.html` | HTML shell — the single `<div id="root">` mount point for the React app |
| `src/main.jsx` | ReactDOM entry point — wraps `<App />` in all context providers and renders into the DOM |
| `src/App.jsx` | Defines all client-side routes using React Router v6; wraps the router with `AuthProvider`, `ThemeProvider`, and `LanguageProvider` |
| `src/baseurl.jsx` | Exports a pre-configured Axios instance with `baseURL` pointing to the Render backend and an interceptor that attaches the JWT token from localStorage to every request |
| `src/index.css` | Global stylesheet — CSS resets, typography defaults, and design tokens for theming |
| `vite.config.js` | Vite bundler configuration — sets up the React plugin and any proxy rules for local development |
| `eslint.config.js` | ESLint configuration for React + JSX linting rules |

#### Components

| File | What it does |
|------|-------------|
| `components/Navbar.jsx` | Top navigation bar — auth-aware (shows login/signup or dashboard/logout links based on `AuthContext`), includes theme toggle and language selector |
| `components/Footer.jsx` | Sitewide footer with platform links and branding |
| `components/HeroSection.jsx` | Animated landing page hero banner with headline, subtitle, and CTA button linking to the marketplace |
| `components/ProductGrid.jsx` | Accepts a products array and renders a responsive CSS grid of product cards with image, name, price, and artisan info |
| `components/FilterBar.jsx` | Renders category buttons and a price range slider; lifts selected filter state to parent pages via callback props |
| `components/CreateStoryModal.jsx` | Modal dialog with a form for artisans to write and publish a story — calls `POST /api/stories/` on submit |
| `components/GenerateDescriptionModal.jsx` | Modal that sends product details to `POST /api/generate-description`, shows a loading state, and displays the returned AI-generated description with a copy option |

#### Contexts

| File | What it does |
|------|-------------|
| `contexts/AuthContext.jsx` | Provides `user`, `token`, `isAuthenticated`, `login()`, and `logout()` globally; persists token to localStorage and rehydrates on app load |
| `contexts/ThemeContext.jsx` | Provides `theme` (`"light"` or `"dark"`) and `toggleTheme()`; persists preference to localStorage and applies a class to `<body>` |
| `contexts/LanguageContext.jsx` | Provides `language` (e.g., `"en"`, `"hi"`) and `setLanguage()`; used alongside `translations.js` for i18n |

#### i18n

| File | What it does |
|------|-------------|
| `i18n/translations.js` | Exports a nested object mapping language codes to key-value UI string maps; all components use `translations[language].key` to render localized text |

#### Pages

| File | Route | What it does |
|------|-------|-------------|
| `pages/Index.jsx` | `/` | Landing page — renders `HeroSection`, featured products from the API, and platform highlights |
| `pages/Login.jsx` | `/login` | Login form — POSTs credentials to `/auth/login`, stores the returned JWT, updates `AuthContext`, and redirects |
| `pages/Signup.jsx` | `/signup` | Registration form — lets users choose buyer or artisan role, POSTs to `/auth/signup` |
| `pages/ExploreMarketplace.jsx` | `/explore` | Full product catalog — fetches all products, integrates `FilterBar` and `ProductGrid`, handles pagination |
| `pages/ProductPage.jsx` | `/product/:id` | Single product detail — shows images, description, artisan profile link, and an add-to-cart button |
| `pages/SearchResult.jsx` | `/search?q=...` | Reads `q` from URL params, calls the search endpoint, and renders matching products |
| `pages/Cart.jsx` | `/cart` | 🔒 Displays cart items with quantity controls, subtotal, and a checkout/order placement button |
| `pages/ArtisanDashboard.jsx` | `/dashboard` | 🔒 Artisan home — shows summary stats (products, orders) and quick navigation links |
| `pages/ArtisanProduct.jsx` | `/dashboard/products` | 🔒 Lists the artisan's own products with edit/delete actions |
| `pages/AddProduct.jsx` | `/dashboard/add-product` | 🔒 Product form — handles image upload to Cloudinary, optionally triggers AI description generation, and POSTs/PUTs to the products endpoint |
| `pages/ManageOrders.jsx` | `/dashboard/orders` | 🔒 Artisan order inbox — lists all incoming orders with status dropdowns to mark as processing/shipped/delivered |
| `pages/OrderHistory.jsx` | `/orders` | 🔒 Buyer's order history — shows all placed orders with status badges and product thumbnails |
| `pages/Profile.jsx` | `/profile` | 🔒 View and edit user profile details (name, bio, contact info) |
| `pages/NotFound.jsx` | `*` | 404 fallback page with a link back to home |
| `pages/UnderProduction.jsx` | `/coming-soon` | Placeholder page for features under development |

#### Routes

| File | What it does |
|------|-------------|
| `routes/ProtectedRoute.jsx` | HOC that checks `AuthContext.isAuthenticated` — redirects unauthenticated users to `/login`, otherwise renders the child route |

![-------------------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | React.js 18 + Vite | Component-based UI with fast HMR dev server |
| **Styling** | CSS3 | Custom stylesheets with light/dark theme variables |
| **HTTP Client** | Axios | API calls with JWT interceptor |
| **Routing** | React Router v6 | Client-side navigation and protected routes |
| **State Management** | React Context API | Auth, Theme, and Language global state |
| **Backend Framework** | FastAPI (Python) | High-performance async REST API with auto-docs |
| **ORM** | SQLAlchemy | Database models and query interface |
| **Validation** | Pydantic v2 | Request/response data validation and serialization |
| **Auth** | JWT (python-jose) | Stateless token-based authentication |
| **Password Security** | Passlib + bcrypt | Secure credential hashing |
| **AI / LLM** | Groq API | Ultra-fast LLM inference for product descriptions |
| **Image Storage** | Cloudinary | Cloud media storage and CDN delivery |
| **Database** | PostgreSQL | Relational data storage |
| **Frontend Deploy** | Vercel | Edge-deployed React app |
| **Backend Deploy** | Render | Managed Python web service hosting |
| **Internationalization** | Custom i18n | Multilingual UI via `translations.js` |

![-------------------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

## 🔌 API Routes

### 🔐 Auth — `/auth`

| Method | Endpoint | Protected | Description |
|--------|----------|:---------:|-------------|
| `POST` | `/auth/signup` | ❌ | Register a new user (buyer or artisan) |
| `POST` | `/auth/login` | ❌ | Login and receive a JWT access token |
| `GET` | `/auth/me` | ✅ | Get current authenticated user's profile |

### 📦 Products — `/products`

| Method | Endpoint | Protected | Description |
|--------|----------|:---------:|-------------|
| `GET` | `/products/` | ❌ | Fetch all products (supports `?search=` & filter queries) |
| `GET` | `/products/{id}` | ❌ | Fetch a single product by ID |
| `POST` | `/products/` | ✅ Artisan | Create a new product listing |
| `PUT` | `/products/{id}` | ✅ Owner | Update an existing product |
| `DELETE` | `/products/{id}` | ✅ Owner | Delete a product and its Cloudinary image |
| `GET` | `/products/artisan/{artisan_id}` | ❌ | Get all products by a specific artisan |

### 🛒 General API — `/api`

| Method | Endpoint | Protected | Description |
|--------|----------|:---------:|-------------|
| `POST` | `/api/cart/add` | ✅ | Add a product to the cart |
| `GET` | `/api/cart/` | ✅ | Get current user's cart items |
| `DELETE` | `/api/cart/{item_id}` | ✅ | Remove an item from the cart |
| `POST` | `/api/orders/` | ✅ | Place a new order from cart |
| `GET` | `/api/orders/buyer` | ✅ | Get all orders placed by the current buyer |
| `GET` | `/api/orders/artisan` | ✅ | Get all orders received by the artisan |
| `PUT` | `/api/orders/{id}/status` | ✅ Artisan | Update order status (processing/shipped/delivered) |
| `POST` | `/api/stories/` | ✅ Artisan | Create a new artisan story |
| `GET` | `/api/stories/` | ❌ | Fetch all artisan stories |
| `POST` | `/api/generate-description` | ✅ | Generate AI product description via Groq LLM |

![-------------------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

## ☁️ Cloudinary Integration

Artisan Sphere uses **[Cloudinary](https://cloudinary.com)** for all product image management, ensuring:

- **Secure uploads** — Images are sent server-side, keeping API credentials out of the browser
- **Global CDN delivery** — Images are served from Cloudinary's CDN for fast load times worldwide
- **Auto-optimization** — Images are compressed and formatted for web automatically
- **Cleanup on delete** — Deleting a product also removes the image from Cloudinary using its `public_id`

**Image Upload Flow:**

```
User selects image in AddProduct.jsx
           │
           ▼
     POST /products/ (multipart form)
           │
           ▼
  cloudinary_service.py
  └── cloudinary.uploader.upload(file)
           │
           ▼
  Cloudinary returns { secure_url, public_id }
           │
           ▼
  secure_url + public_id saved to PostgreSQL
           │
           ▼
  Frontend renders <img src={secure_url} />
```

To get your Cloudinary credentials, sign up at [cloudinary.com](https://cloudinary.com) → Dashboard → copy `Cloud Name`, `API Key`, and `API Secret`.

![-------------------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

## 🔑 Environment Variables

### Backend — `Backend/.env`

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/artisan_sphere` |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | `my-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abc123xyz...` |
| `GROQ_API_KEY` | API key for Groq LLM | `gsk_...` |
| `JWT_SECRET_KEY` | Secret key for signing JWT tokens | `your-long-random-secret` |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `FRONTEND_URL` | Allowed CORS origin | `https://artisansphere.vercel.app` |

```env
# Backend/.env
DATABASE_URL=postgresql://user:password@host:5432/artisan_sphere
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GROQ_API_KEY=your_groq_key
JWT_SECRET_KEY=your_super_secret_key_here
JWT_ALGORITHM=HS256
FRONTEND_URL=http://localhost:5173
```

### Frontend — `Frontend/.env`

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000` |

```env
# Frontend/.env
VITE_API_BASE_URL=http://localhost:8000
```

> ⚠️ **Never commit `.env` files.** Both are already listed in their respective `.gitignore` files.

![-------------------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

## 🚀 Getting Started

### Prerequisites

| Tool | Minimum Version | Download |
|------|:--------------:|----------|
| Node.js | v18+ | [nodejs.org](https://nodejs.org) |
| Python | v3.10+ | [python.org](https://python.org) |
| Git | Latest | [git-scm.com](https://git-scm.com) |
| PostgreSQL | v14+ | [postgresql.org](https://postgresql.org) |

You will also need free accounts at:

- [Cloudinary](https://cloudinary.com) — for product image storage
- [Groq](https://console.groq.com) — for AI description generation (free tier available)

---

### 1. Clone the Repository

```bash
git clone https://github.com/DakshDashora/Artisan-Sphere.git
cd Artisan-Sphere
```

---

### 2. Set Up the Backend

```bash
cd Backend

# Create and activate a virtual environment
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

# Install all dependencies
pip install -r requirements.txt
```

Create `Backend/.env` and fill in all variables (see [Environment Variables](#-environment-variables) above).

```bash
# Run the FastAPI server from inside the app folder
cd app
uvicorn main:app --reload --port 8000
```

| URL | Description |
|-----|-------------|
| `http://localhost:8000` | Live API base URL |
| `http://localhost:8000/docs` | Interactive Swagger UI (auto-generated) |
| `http://localhost:8000/redoc` | ReDoc API documentation |

---

### 3. Set Up the Frontend

```bash
cd ../../Frontend

# Install npm dependencies
npm install
```

Create `Frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

```bash
# Start the Vite dev server
npm run dev
```

The app will be live at **`http://localhost:5173`**

---

### 4. Database Setup

Ensure your PostgreSQL instance is running and the `DATABASE_URL` is correct in `Backend/.env`. On first startup, SQLAlchemy will automatically create all tables defined in `models.py` via `Base.metadata.create_all()`.

---

### Quick Reference

| Command | What it does |
|---------|-------------|
| `uvicorn main:app --reload` | Start backend with hot-reload |
| `npm run dev` | Start Vite frontend dev server |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview the production build locally |

![-------------------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

## 🤝 Contributing

Contributions are welcome and appreciated! Here's how:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit** your changes with a clear, descriptive message
   ```bash
   git commit -m "feat: describe what you added or changed"
   ```
4. **Push** to your fork
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request** against the `main` branch

Please make sure your changes follow the existing code style and work correctly before submitting.

![-------------------------------------------------------------](https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png)

## 👤 Author

**Daksh Dashora**

[![GitHub](https://img.shields.io/badge/GitHub-@DakshDashora-181717?style=for-the-badge&logo=github)](https://github.com/DakshDashora)

---

<div align="center">

⭐ **If you found this project helpful, please star the repo — it means a lot!** ⭐

</div>