# Apple_Store

## Project Objectives

- [Topic and overview](#topic-and-overview)
- [Technologies](#technologies)
- [Structure](#structure)
- [Functionalities](#functionalities)
- [Deployment](#deployment)
<!-- - [Reference](#reference) -->

### Topic and overview

Apple is one of the biggest tech companies in the world and a serious market share in both hardware and software industries.  
This shop is related to simulate some of the Apple Store web features and to come with new possible ideas for reaching the clients.  
There are numerous categories of devices that can be managed, the most important of them being: MACs PCs and laptops, iPad, iPhone, AirPods, and Apple Watch.  
On this webstore, a user can have 3 states:

- **Administrator** - manages all the products in the system, alongside coupons or other administrative stuff
- **Regular user** - user with moderate benefits, including discounts, that can buy products
- **Guest** - user that has no intention in creating an account; he can only navigate through the product list, but cannot buy one.

#### Website Components

- A navigation bar with several buttons:
  - Homepage button with a gif of an Apple MacBook
  - Product page buttons
  - Contact (with Google Maps integration)
  - About Us (portfolio page)
  - Search (with real-time results and keyboard interaction)
  - Authentication/Login/Register
  - Cart

#### User Role Functionalities

- **Admin:**

  - Dashboard with user management (add/delete users, manage discounts)

- **Regular User:**

  - Full product/cart access
  - Access to discounts and "Favorites" pages

- **Guest:**
  - Can browse products only (no purchases, no discounts)

### Technologies

- **Backend:** Node.js (REST API), Apache (for MySQL UI)
- **Frontend:** HTML, CSS, JavaScript, React
- **Database:** MySQL (XAMPP)

### Structure

#### Frontend

- **Root:** Config files (.json), `.env` (API URLs, Google Maps credentials)
- **public/images:** Product images
- **src:**
  - `assets/`: Page component images
    - `css/`: CSS files for frontend
  - `components/`: Controllers
    - `common/`: Crypto utilities
    - `layout/`: UI render components
  - `models/`: Contexts for auth, products, etc.
  - `pages/`: GUI view components

#### Backend

- **backend/:**
  - Root: `.env`, `server.js`, `Email.js` (Forgot Password functionality), applestore.sql (for importing database)
  - `config/`: `db.js`, `Modify_PersonalData.js`
  - `middleware/`: Token validation
  - `routes/`: Auth (`user.js`), Products (`ProductsRoute.js`), Addresses (`AddressInfo.js`), Admin (`admin.js`)

### Functionalities

This application simulates an online store where users can browse, select, and purchase Apple products. Key features include:

- Product listing and filtering
- Cart management with quantity adjustments and coupon discounts
- Order placement and mock payment gateway
- Admin dashboard for user/product management; every time the user will have to change something
- Forgot Password functionality - every time the user forgot its password, an email will be send alongside a token for
  page validity; in the email, the user will click on the change password link and will be redirected to a new specific portal
- user account validity - a token was used with a expiration time of 1h.

Regular users can access additional features like delivery scheduling and discounts. Guests have limited access.

### Deployment

To install dependencies and run the application locally or for deployment, follow these steps:

### Backend:

```bash
cd backend
npm install
npm run build    # for production
npm start        # for development
# Then just tap the password for the DB (11235)
```

#### Frontend:

```bash
cd frontend/my-web-app/
npm install
npm run build    # for production
npm start        # for development
```
