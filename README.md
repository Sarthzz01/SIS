# Sukhmira Investment Services LLP (SIS)

<div align="center">

![Sukhmira Investment Services LLP](logo.png)

### **Expert Financial Advisory for Wealth Growth**
*A modern, full-stack financial advisory and wealth management platform delivering transparent, structured, and goal-driven investment solutions.*

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express Framework](https://img.shields.io/badge/express-v5.x-blue.svg?style=flat-square&logo=express)](https://expressjs.com/)
[![SQLite Engine](https://img.shields.io/badge/database-SQLite3%20WAL-orange.svg?style=flat-square&logo=sqlite)](https://github.com/WiseLibs/better-sqlite3)
[![Authentication](https://img.shields.io/badge/security-JWT%20%2B%20Bcrypt-red.svg?style=flat-square)](https://jwt.io/)
[![Status](https://img.shields.io/badge/status-active%20%26%20production--ready-success.svg?style=flat-square)]()

[Explore Services](#-core-financial-services) • [Quick Start](#-quick-start-guide) • [Architecture](#-system-architecture) • [API Documentation](#-api-documentation) • [Contact](#-official-contact-information)

</div>

---

## 📖 Table of Contents
- [Executive Overview](#-executive-overview)
- [Core Financial Services](#-core-financial-services)
- [Key Platform Features](#-key-platform-features)
- [System Architecture](#-system-architecture)
- [Project Directory Structure](#-project-directory-structure)
- [Quick Start Guide](#-quick-start-guide)
- [Default Demo Credentials](#-default-demo-credentials)
- [API Documentation](#-api-documentation)
- [Official Business Contact Information](#-official-business-contact-information)
- [Regulatory & Compliance Notice](#-regulatory--compliance-notice)

---

## 🌟 Executive Overview

**Sukhmira Investment Services LLP** is a client-centric financial advisory firm based in Airoli, Navi Mumbai. With over 15 years of industry excellence, we empower individuals, families, and businesses to build, preserve, and scale long-term wealth through disciplined asset allocation, transparent guidance, and cutting-edge portfolio intelligence.

This web application combines a high-performance, modern public-facing portal with interactive wealth planning tools, client portfolio tracking, and an executive administration console.

---

## 💼 Core Financial Services

| Service | Category | Key Highlights |
| :--- | :--- | :--- |
| **Mutual Funds & SIP** | Equity / Debt / Hybrid | Systematic wealth compounding, curated fund baskets, goal-based rebalancing, and tax efficiency. |
| **Bonds & Debentures** | Fixed Income | Sovereign Gold Bonds (SGBs), AAA PSU bonds, and corporate debentures for predictable cash flows. |
| **Fixed Deposits (FDs)** | Capital Preservation | High-yielding AAA-rated corporate deposits and scheduled bank FDs offering up to 8.75% p.a. |
| **Comprehensive Insurance** | Risk Safeguard | Term life insurance, family floater health covers, and critical illness safeguards. |
| **Unlisted Pre-IPO Shares** | High-Growth Equity | Access to pre-IPO enterprises, technology disruptors, and unicorn equities before listing. |
| **54 EC Capital Gain Bonds** | Tax Exemption | 100% long-term capital gains tax exemption on real estate sales under Sec 54EC (REC, NHAI, PFC). |

---

## 🚀 Key Platform Features

### 1. 🧮 Interactive SIP & Wealth Compounding Calculator
* Client-side financial compounding engine calculating **Total Invested Amount**, **Estimated Wealth Gains**, and **Total Maturity Corpus** formatted in Indian Rupees (₹, Lakhs, and Crores).
* Dynamic sliders for Monthly SIP Contribution (₹1,000 to ₹5,00,000+), Investment Horizon (1 to 30 years), and Expected Rate of Return (5% to 25%).

### 2. 📊 Investor Portfolio Dashboard (`/client-dashboard.html`)
* **Live Net Worth Overview:** Real-time portfolio valuation in ₹ INR with total investment and absolute gain calculations.
* **Asset Allocation Distribution:** Visual progress tracking across Mutual Funds, Corporate Debt, Fixed Deposits, and Equities.
* **Active Holdings Table:** Granular tracking of SIP schemes, units, purchase NAV, market price, and annualized return.
* **Direct Advisor Dispatch:** In-portal consultation booking and personalized portfolio review requests.

### 3. 🛡️ Executive Admin Management Console (`/admin.html`)
* **Enterprise AUM Aggregations:** Total registered investor count, aggregate Assets Under Management (AUM in ₹ Cr), active SIP volumes, and pending inquiries.
* **Client Portfolio Management:** Inspect registered portfolios, update holdings, assign risk profiles, and rebalance assets.
* **Consultation Lead Pipeline:** Manage inbound advisory requests with status controls (`New`, `In-Progress`, `Resolved`).
* **Audit Trail & System Monitoring:** Live session overview and operational event logs.

### 4. 🔒 Enterprise Security & Architecture
* **JWT & Cookie Security:** Signed JSON Web Tokens with HTTP-only cookie support and Bearer Token header fallbacks.
* **Bcrypt Password Encryption:** High-strength salt rounds for credential hashing.
* **Role-Based Access Control (RBAC):** Server middleware enforcing strict authorization boundaries between clients and administrators.
* **Embedded SQLite with WAL Mode:** High-concurrency, zero-configuration storage via `better-sqlite3`.

---

## 🏗️ System Architecture

```
+-----------------------------------------------------------------------------------+
|                                  BROWSER CLIENT                                   |
|  index.html  |  about.html  |  services.html  |  contact.html  |  signin.html     |
|  client-dashboard.html (Investor Portal)      |  admin.html (Executive Console)   |
+-----------------------------------------+-----------------------------------------+
                                          | HTTP / REST (Fetch API)
                                          v
+-----------------------------------------------------------------------------------+
|                            NODE.JS + EXPRESS BACKEND                              |
|                                                                                   |
|  [ Auth Middleware: JWT Verification & RBAC ]                                     |
|  ├── /api/auth/*     -> Register, Login, Session Validate, Logout                |
|  ├── /api/client/*   -> Portfolio Retrieval, Advisor Inquiries                    |
|  ├── /api/admin/*    -> AUM Metrics, Client Management, Pipeline Management       |
|  └── /api/contact    -> Consultation Form Submissions                             |
+-----------------------------------------+-----------------------------------------+
                                          | better-sqlite3 (Sync, High-Performance)
                                          v
+-----------------------------------------------------------------------------------+
|                            SQLITE EMBEDDED DATABASE                               |
|                                (data/sis.db)                                      |
|  Tables: users | portfolios | holdings | inquiries | company_info                 |
+-----------------------------------------------------------------------------------+
```

---

## 📁 Project Directory Structure

```plaintext
SIS_1/
├── data/
│   ├── sis.db                 # SQLite database storage (auto-initialized on startup)
│   └── sis.db-wal             # SQLite write-ahead log for high concurrency
├── about.html                 # Heritage, advisory philosophy & 4 core pillars
├── admin.html                 # Executive Management Dashboard (AUM & Clients)
├── client-dashboard.html      # Investor Portfolio & Holdings Management Portal
├── contact.html               # Inquiry form, location details & interactive map
├── index.html                 # Homepage with hero, services, calculator & FAQs
├── services.html              # Comprehensive analysis of all 6 financial products
├── signin.html                # Unified secure portal login (Client & Admin)
├── db.js                      # Database schema, migrations & Indian market seed data
├── server.js                  # Express API server, routes & auth middleware
├── script.js                  # Client-side UI interactions, calculators & validation
├── style.css                  # Custom CSS design system, typography & responsive layouts
├── logo.png                   # Sukhmira Investment Services LLP official logo
├── package.json               # Node.js project manifest & dependencies
└── README.md                  # Comprehensive project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: bundled with Node.js

### 1. Installation
Clone the repository or navigate to the project directory, then install dependencies:
```bash
npm install
```

### 2. Launch the Application
Start the application server:
```bash
npm start
```
*(Or use development mode: `npm run dev`)*

The server will automatically:
1. Initialize the SQLite database at `data/sis.db`.
2. Apply schema migrations.
3. Seed default demo accounts with realistic INR investment portfolios.
4. Listen on `http://localhost:3000`.

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🔑 Default Demo Credentials

Pre-seeded accounts are provided for immediate testing of both user experiences:

| User Type | Email / Username | Password | Role & Portal |
| :--- | :--- | :--- | :--- |
| **Executive Admin** | `admin` *(or `sukhmirainvestment@gmail.com`)* | `password123` | Full access to [Admin Console](http://localhost:3000/admin.html) |
| **Investor Client 1** | `rajesh.sharma@gmail.com` | `password123` | Portfolio view on [Client Portal](http://localhost:3000/client-dashboard.html) |
| **Investor Client 2** | `priya.patel@gmail.com` | `password123` | Portfolio view on [Client Portal](http://localhost:3000/client-dashboard.html) |

---

## 🔌 API Documentation

### Authentication & Sessions
* `POST /api/auth/register` — Register a new investor account.
* `POST /api/auth/login` — Authenticate credentials; returns signed JWT and sets HTTP-only cookie.
* `POST /api/auth/logout` — Invalidate user session and clear authentication cookies.
* `GET  /api/auth/me` — Retrieve the currently authenticated user's profile and assigned role.

### Investor Services
* `GET  /api/client/portfolio` — Fetch the investor's total net worth, asset allocation, and active holdings.
* `POST /api/client/inquire` — Submit a portfolio rebalancing or advisory consultation request.

### Admin Operations *(Admin Role Required)*
* `GET    /api/admin/metrics` — Aggregate AUM metrics, client counts, active SIP volumes, and pending leads.
* `GET    /api/admin/clients` — Retrieve all registered client portfolios.
* `GET    /api/admin/inquiries` — Fetch all inbound consultation requests.
* `PATCH  /api/admin/inquiries/:id` — Update lead status (`New`, `In-Progress`, `Resolved`).
* `POST   /api/admin/portfolio/update` — Add or modify client holdings.

### General Public
* `GET  /api/company-info` — Retrieve official firm details, office address, and contact lines.
* `POST /api/contact` — Submit general consultation inquiries.

---

## 🏢 Official Business Contact Information

**Sukhmira Investment Services LLP**  
*Comprehensive Wealth Management & Financial Advisory*

* 📍 **Office Address:**  
  Shop No.1, Plot No.55, Sector 8A,  
  Shree Yashashree CHS Ltd., Airoli,  
  Navi Mumbai, Maharashtra - 400708, India
* 📞 **Direct Contact Numbers:**  
  [+91 91525 79597](tel:+919152579597) / [+91 91526 35363](tel:+919152635363)
* ✉️ **Email Inquiries:**  
  [sukhmirainvestment@gmail.com](mailto:sukhmirainvestment@gmail.com)
* 💬 **WhatsApp Desk:**  
  [Chat on WhatsApp](https://wa.me/919152579597)
* ⏰ **Operating Hours:**  
  Monday – Saturday: 9:30 AM – 7:00 PM IST

---

## ⚖️ Regulatory & Compliance Notice

*Mutual fund investments, corporate debentures, unlisted equities, and market securities are subject to market risks. Please read all scheme-related offer documents, risk factors, and statutory disclosures carefully before making any investment decision. Past performance is not indicative of future returns.*

---

<div align="center">
  <sub>© 2026 <strong>Sukhmira Investment Services LLP</strong>. All rights reserved.</sub>
</div>
