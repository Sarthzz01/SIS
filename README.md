# Sukhmira Investment Services LLP (SIS)
### Enterprise Wealth Management, Financial Advisory & Portfolio Tracking Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5.2-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-Better--SQLite3-003B57?style=flat&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![JWT Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20Bcrypt-000000?style=flat&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Currency](https://img.shields.io/badge/Currency-INR%20(%E2%82%B9)-138808?style=flat)](https://en.wikipedia.org/wiki/Indian_rupee)

---

## 📌 Executive Overview

**Sukhmira Investment Services LLP (SIS)** is a full-stack, enterprise-grade wealth advisory and portfolio management web application. Designed for high-net-worth individuals (HNIs), retail investors, and corporate institutions across India, the platform integrates institutional wealth management solutions with a luxury fintech interface.

The application reflects a strategic advisory model grounded in the **4 Pillars of Wealth Advisory** (Wealth Creation, Wealth Preservation, Tax Optimization, and Succession Planning), with transparent portfolio tracking, interactive financial calculation tools, and role-based administrative control.

---

## 🌟 Core Highlights & Capabilities

### 1. 💼 Full Spectrum Financial Services
* **Mutual Funds (SIP & Lumpsum):** Equity, hybrid, debt, and liquid funds mapped to risk-reward horizons.
* **Corporate & Sovereign Bonds:** High-grade sovereign gold bonds (SGBs), PSU bonds, and corporate debentures for predictable fixed returns.
* **Corporate Fixed Deposits:** AAA-rated institutional FDs delivering yields higher than standard bank deposits.
* **Comprehensive Insurance Solutions:** Term life insurance, family floater health plans, and critical illness safeguards.
* **Unlisted / Pre-IPO Shares:** Access to late-stage growth enterprises and disruptive pre-IPO equity.
* **54EC Capital Gain Tax Exemption Bonds:** Section 54EC bonds (REC, PFC, IRFC) enabling tax-exempt capital gain reinvestment.

### 2. 🧮 Interactive SIP & Wealth Compounding Calculator
* Real-time client-side compounding engine calculating **Total Invested Capital**, **Estimated Growth Returns**, and **Maturity Wealth** in Indian Rupees (₹).
* Dynamic sliders for Monthly Contribution (₹1,000 to ₹5,00,000+), Investment Horizon (1 to 30 years), and Expected Annual Yield (5% to 25%).

### 3. 📊 Client Portfolio Dashboard (`/client-dashboard.html`)
* **Real-Time Net Worth Tracker:** Total portfolio valuation in Indian Rupees (₹) with absolute profit/loss metrics.
* **Asset Allocation Breakdown:** Visual allocation across Equity, Debt, FDs, and Insurance.
* **Active Holding Records:** Real-time visibility into SIP status, units, current value, and annualized CAGR.
* **Direct Wealth Manager Access:** Single-click consultation booking and advisory dispatch.

### 4. 🛡️ Executive Admin Management Console (`/admin.html`)
* **AUM & Metric Aggregations:** Total registered clients, aggregate Assets Under Management (AUM in ₹ Cr), active SIP counts, and pending inquiries.
* **Client Record Administration:** Add new clients, modify portfolios, assign advisory tiers, and inspect financial allocations.
* **Inquiry & Consultation Pipeline:** Manage inbound consultation requests with status controls (`New`, `In-Progress`, `Resolved`).
* **Audit Trail & System Logs:** Instant oversight of system logins, portfolio adjustments, and user interactions.

### 5. 🔒 Enterprise Security & Architecture
* **JWT & Cookie Security:** Signed JSON Web Tokens with HTTP-only cookie support and Bearer Token header fallbacks.
* **Bcrypt Password Hashing:** Salted rounds for credential protection.
* **Role-Based Access Control (RBAC):** Middleware checks distinguishing standard clients from executive administrators.
* **Embedded SQLite with WAL Mode:** High-concurrency, zero-configuration local database using `better-sqlite3`.

---

## 🏗️ Technology Architecture

| Layer | Technologies Used |
| :--- | :--- |
| **Backend Runtime** | [Node.js](https://nodejs.org/) (v18+) with [Express 5](https://expressjs.com/) |
| **Database Engine** | [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) (SQLite3 embedded, Write-Ahead Logging mode) |
| **Authentication** | [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) (JWT) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| **Frontend UI/UX** | HTML5, CSS3 (Modern Glassmorphic Dark Fintech Theme), Vanilla JavaScript (ES6+) |
| **Typography & Icons**| [Google Fonts (Outfit & Inter)](https://fonts.google.com/), [Font Awesome 6.5.1](https://fontawesome.com/) |

---

## 📁 Repository Structure

```plaintext
SIS_1/
├── data/
│   └── sis.db                 # SQLite database storage (auto-generated on first run)
├── about.html                 # Firm heritage, leadership philosophy & 4 Pillars
├── admin.html                 # Executive Admin Management Dashboard
├── client-dashboard.html      # Investor Portfolio & Holding Management Portal
├── contact.html               # Advisory booking, location map & contact channels
├── index.html                 # Homepage with hero, services, calculator & reviews
├── services.html              # Comprehensive deep-dive on all 6 financial solutions
├── signin.html                # Unified secure authentication (Admin & Client)
├── db.js                      # Database schema, initialization & seed data
├── server.js                  # Express API server, routes & auth middleware
├── script.js                  # Interactive client-side UI, mobile menu & calculator
├── style.css                  # Master stylesheet: typography, dark theme & responsive grids
├── logo.png                   # Sukhmira Investment Services official branding
├── package.json               # Node.js project manifest & dependencies
└── README.md                  # System documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** (v18.0.0 or higher recommended)
* **npm** (bundled with Node.js)

### 1. Installation
Clone or navigate to the workspace directory and install dependencies:
```bash
npm install
```

### 2. Start the Server
Run the application server:
```bash
npm start
```
*(Alternative for development: `npm run dev`)*

The server will automatically initialize `data/sis.db` (if not already present), run migrations, seed initial demo accounts, and listen on:
```
http://localhost:3000
```

---

## 🔑 Default Test Credentials

The database comes pre-seeded with sample accounts for testing all user journeys:

| Role | Email / Identifier | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Executive Admin** | `admin` *(or `sukhmirainvestment@gmail.com`)* | `password123` | [Admin Console](http://localhost:3000/admin.html) |
| **Client 1** | `rajesh.sharma@gmail.com` | `password123` | [Client Dashboard](http://localhost:3000/client-dashboard.html) |
| **Client 2** | `priya.patel@gmail.com` | `password123` | [Client Dashboard](http://localhost:3000/client-dashboard.html) |

---

## 🔌 API Endpoint Documentation

### Authentication & Sessions
* `POST /api/auth/register` — Register a new client account.
* `POST /api/auth/login` — Authenticate client or admin credentials (returns JWT token and sets cookie).
* `POST /api/auth/logout` — Invalidate user session and clear auth cookies.
* `GET  /api/auth/me` — Retrieve the currently authenticated user's profile and role.

### Client Services
* `GET  /api/client/portfolio` — Fetch the authenticated client's complete asset valuation, holdings, and returns.
* `POST /api/client/inquire` — Submit an advisory request or portfolio rebalancing inquiry.

### Admin Operations *(Requires Admin Role)*
* `GET    /api/admin/metrics` — Aggregate AUM, client counts, and system metrics.
* `GET    /api/admin/clients` — List all registered clients and portfolio totals.
* `GET    /api/admin/inquiries` — View all inbound consultation requests.
* `PATCH  /api/admin/inquiries/:id` — Update inquiry status (`New`, `In-Progress`, `Resolved`).
* `POST   /api/admin/portfolio/update` — Add or modify a client's asset holdings.

### General Public
* `GET  /api/company-info` — Fetch official firm details, office address, and contact lines.
* `POST /api/contact` — Submit a general consultation or contact inquiry.

---

## 🏢 Business & Official Contact Information

**Sukhmira Investment Services LLP**  
*Comprehensive Wealth Management & Financial Advisory*

* 📍 **Office Address:**  
  Shop No.1, Plot No.55, Sector 8A,  
  Shree Yashashree CHS Ltd., Airoli,  
  Navi Mumbai, Maharashtra - 400708, India
* 📞 **Mobile Contact:**  
  [+91 91525 79597](tel:+919152579597) / [+91 91526 35363](tel:+919152635363)
* ✉️ **Email Inquiries:**  
  [sukhmirainvestment@gmail.com](mailto:sukhmirainvestment@gmail.com)
* 🌐 **Operating Hours:**  
  Monday – Saturday: 9:30 AM – 6:30 PM IST

---

## ⚖️ Regulatory & Disclaimer Notice

*Mutual fund investments, corporate bonds, unlisted equities, and securities are subject to market risks. Please read all scheme-related offer documents, risk disclosures, and statutory terms carefully before investing. Historical performance does not guarantee future returns.*

---

© 2026 **Sukhmira Investment Services LLP**. All Rights Reserved.
