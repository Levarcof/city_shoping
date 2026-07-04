# 🛍️ LocalKart — Hyperlocal City Shopping Platform

> Discover and shop from real shops near you — by category, subcategory, and distance.

LocalKart is a full-stack, location-based e-commerce platform built with **Next.js** that connects customers with nearby local shops. Instead of browsing an endless generic catalog, customers search by **category → subcategory → radius (km)** and instantly get a list of real shops around them — each with its own storefront, products, cart, checkout, and order flow. Shop owners get a complete dashboard to manage their store, inventory, and orders.

Think of it as a mix of **Zomato/Swiggy's location-based discovery** + **Shopify's multi-vendor storefronts**, built for local retail.

---

## ✨ Key Features

### 👤 Customer Experience
- 🔍 **Smart Discovery** — Filter shops by category, subcategory, and a custom radius (km) from current location
- 📍 **Geolocation-based Search** — Uses browser geolocation / manual address input to find nearby shops
- 🏪 **Shop Storefronts** — Each shop has its own page with products, "About", and contact details
- 🛒 **Cart & Checkout** — Add to cart, manage quantities, and place orders per shop
- 💳 **Payments** — Integrated payment gateway for seamless checkout
- 📞 **Direct Contact** — Reach out to a shop directly from its page
- 📦 **Order Tracking** — View order history and status

### 🏬 Shop Owner Dashboard
- 🔐 **Secure Owner Login** — Separate authenticated portal for shop owners
- ➕ **Product Management** — Add, edit, and delete products with images, price, and stock
- 🧾 **Order Management** — View and manage incoming customer orders
- ⚙️ **Shop Settings** — Edit shop details (name, address, category, timings, images)
- 🟢🔴 **Open/Close Toggle** — Instantly mark the shop as Open or Closed for orders
- 📊 **(Planned) Analytics** — Sales overview and order insights

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js](https://nextjs.org/) (App Router) |
| **Language** | JavaScript / TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | MongoDB |
| **Auth** |JWT-based authentication |
| **Payments** | Razorpay |
| **Geolocation** | Browser Geolocation API + Haversine formula for distance filtering |
| **Image Hosting** | Cloudinary |
| **Deployment** | Vercel |


---

## 🗺️ How Location-Based Search Works

1. Customer selects a **category** and **subcategory**.
2. Customer sets a **search radius** (in km) from their current location.
3. The backend calculates distance between the customer's coordinates and each shop's stored coordinates (using the **Haversine formula**) and filters shops within that radius.
4. Matching shops are returned, sorted by nearest distance first.
5. Customer taps a shop to view its full storefront, products, and details.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm
- A database instance (MongoDB Atlas / PostgreSQL)

### Installation

```bash
# Clone the repository
git clone https://github.com/levarcof/city_shoping.git
cd city_shoping

# Install dependencies
npm install
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Core Modules Overview

| Module | Description |
|---|---|
| **Customer Search** | Category + subcategory + radius filter to find nearby shops |
| **Shop Storefront** | Public shop page with products, about, and contact info |
| **Cart & Orders** | Add to cart, checkout, and order placement per shop |
| **Payments** | Secure online payment processing |
| **Shop Owner Auth** | Login system for shop owners |
| **Product CRUD** | Owners can add, update, and remove products |
| **Order Management** | Owners view and process incoming orders |
| **Shop Status** | Owners toggle shop between Open / Closed |



## 📸 Screenshots
<img width="1882" height="908" alt="cityShop" src="https://github.com/user-attachments/assets/cd61d94f-e1b0-4622-bac0-7d4025db6065" />

| Customer Search | Shop Storefront | Owner Dashboard |
|---|---|---|
| ![search](./public/screenshots/search.png) | ![shop](./public/screenshots/shop.png) | ![dashboard](./public/screenshots/dashboard.png) |

---

## 🌐 Live Demo

🔗 https://city-shoping.vercel.app/home

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Vikram prajapat**
- Portfolio: https://my-portfolio-weld-nine-60.vercel.app/
- LinkedIn: https://www.linkedin.com/in/vikram-prajapat-a19a742aa/
- GitHub: [@your-username](https://github.com/your-username)

---

⭐ If you like this project, consider giving it a star — it helps a lot!
