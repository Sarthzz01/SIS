const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'sis.db');
const db = new Database(dbPath);

// Enable WAL mode and foreign keys for performance and integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'client', -- 'admin' or 'client'
      status TEXT NOT NULL DEFAULT 'Active', -- 'Active', 'Pending', 'Suspended'
      total_portfolio REAL NOT NULL DEFAULT 0,
      risk_profile TEXT DEFAULT 'Moderate Growth',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS portfolios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      asset_class TEXT NOT NULL, -- 'Mutual Funds', 'Bonds', 'Fixed Deposit', 'Unlisted Shares', 'Insurance', '54 EC Bonds'
      holding_name TEXT NOT NULL,
      allocation_pct REAL NOT NULL,
      current_value REAL NOT NULL,
      invested_value REAL NOT NULL,
      performance_pct REAL NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tx_code TEXT UNIQUE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL, -- 'Buy', 'Sell', 'SIP / Deposit', 'Interest / Dividend', 'Redemption'
      asset_class TEXT,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Completed', -- 'Completed', 'Pending', 'Failed'
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      service_interest TEXT DEFAULT 'Mutual Funds',
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'New', -- 'New', 'In Review', 'Contacted', 'Resolved'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS consultations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      preferred_date TEXT NOT NULL,
      preferred_time TEXT NOT NULL,
      service_type TEXT NOT NULL,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Completed', 'Cancelled'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedData();
}

function seedData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  
  // If database already has users, check if admin needs update to Sukhmira credentials
  if (userCount > 0) {
    const adminUser = db.prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1").get();
    if (adminUser) {
      db.prepare(`
        UPDATE users SET 
          email = 'sukhmirainvestment@gmail.com', 
          full_name = 'Sukhmira Investment Services LLP Admin',
          phone = '+91 9152579597'
        WHERE id = ?
      `).run(adminUser.id);
    }
    return;
  }

  console.log('Seeding initial Indian financial data into Sukhmira Investment Services SQLite database...');
  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('password123', salt);

  // Insert Admin
  const insertUser = db.prepare(`
    INSERT INTO users (username, email, password_hash, full_name, phone, role, status, total_portfolio, risk_profile)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const adminResult = insertUser.run(
    'admin',
    'sukhmirainvestment@gmail.com',
    defaultPasswordHash,
    'Sukhmira Investment Services LLP',
    '+91 9152579597',
    'admin',
    'Active',
    0,
    'Executive'
  );

  // Insert Demo Indian Clients with realistic ₹ INR portfolios
  const client1 = insertUser.run(
    'rajesh.sharma',
    'rajesh.sharma@gmail.com',
    defaultPasswordHash,
    'Rajesh Sharma',
    '+91 9820123456',
    'client',
    'Active',
    4500000, // ₹45 Lakhs
    'Aggressive Growth'
  );

  const client2 = insertUser.run(
    'priya.patel',
    'priya.patel@gmail.com',
    defaultPasswordHash,
    'Priya Patel',
    '+91 9821987654',
    'client',
    'Active',
    6800000, // ₹68 Lakhs
    'Balanced Wealth'
  );

  const client3 = insertUser.run(
    'vikram.deshmukh',
    'vikram.deshmukh@gmail.com',
    defaultPasswordHash,
    'Vikram Deshmukh',
    '+91 9833445566',
    'client',
    'Active',
    5200000, // ₹52 Lakhs
    'Moderate Growth'
  );

  const client4 = insertUser.run(
    'sunita.mehta',
    'sunita.mehta@gmail.com',
    defaultPasswordHash,
    'Sunita Mehta',
    '+91 9820556677',
    'client',
    'Active',
    7500000, // ₹75 Lakhs
    'Capital Preservation'
  );

  // Insert Portfolios with Indian assets: Mutual Funds, Bonds, Corporate FDs, Unlisted Pre-IPO shares, 54EC Bonds
  const insertPortfolio = db.prepare(`
    INSERT INTO portfolios (user_id, asset_class, holding_name, allocation_pct, current_value, invested_value, performance_pct)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Portfolios for Rajesh Sharma (₹45,00,000)
  insertPortfolio.run(client1.lastInsertRowid, 'Mutual Funds', 'HDFC Flexi Cap & Nippon India Growth Fund', 55, 2475000, 2200000, 12.5);
  insertPortfolio.run(client1.lastInsertRowid, 'Unlisted Shares', 'Pre-IPO Tech & Renewable Energy Unlisted Equities', 25, 1125000, 950000, 18.42);
  insertPortfolio.run(client1.lastInsertRowid, 'Bonds', 'Government Sovereign Gold Bonds & PSU Tax-Free', 20, 900000, 870000, 3.45);

  // Portfolios for Priya Patel (₹68,00,000)
  insertPortfolio.run(client2.lastInsertRowid, 'Mutual Funds', 'SBI Large & Midcap + ICICI Pru Bluechip', 50, 3400000, 3050000, 11.48);
  insertPortfolio.run(client2.lastInsertRowid, 'Fixed Deposit', 'Bajaj Finance & Mahindra Finance Corporate FDs (8.15%)', 25, 1700000, 1650000, 3.03);
  insertPortfolio.run(client2.lastInsertRowid, '54 EC Bonds', 'REC & NHAI Capital Gain Tax Exemption Bonds', 25, 1700000, 1700000, 5.25);

  // Portfolios for Vikram Deshmukh (₹52,00,000)
  insertPortfolio.run(client3.lastInsertRowid, 'Mutual Funds', 'Mirae Asset Large Cap & Parag Parikh Flexi Cap', 45, 2340000, 2100000, 11.43);
  insertPortfolio.run(client3.lastInsertRowid, 'Bonds', 'High Yield Corporate NCDs & Listed Debt', 30, 1560000, 1520000, 2.63);
  insertPortfolio.run(client3.lastInsertRowid, 'Fixed Deposit', 'Senior Citizen High-Yield Bank FDs', 25, 1300000, 1280000, 1.56);

  // Portfolios for Sunita Mehta (₹75,00,000)
  insertPortfolio.run(client4.lastInsertRowid, '54 EC Bonds', 'REC Ltd Section 54EC Capital Gains Exemption', 40, 3000000, 3000000, 5.25);
  insertPortfolio.run(client4.lastInsertRowid, 'Fixed Deposit', 'HDFC Bank & Corporate Fixed Deposits', 35, 2625000, 2550000, 2.94);
  insertPortfolio.run(client4.lastInsertRowid, 'Mutual Funds', 'Balanced Advantage & Hybrid Conservative Funds', 25, 1875000, 1750000, 7.14);

  // Insert Transactions
  const insertTx = db.prepare(`
    INSERT INTO transactions (tx_code, user_id, type, asset_class, amount, date, status, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertTx.run('TXN-8801', client1.lastInsertRowid, 'SIP / Deposit', 'Mutual Funds', 50000, '2026-03-15', 'Completed', 'Monthly SIP in HDFC Flexi Cap Fund');
  insertTx.run('TXN-8802', client2.lastInsertRowid, 'Buy', '54 EC Bonds', 1500000, '2026-03-14', 'Completed', 'REC Capital Gain Bond Subscription under Sec 54EC');
  insertTx.run('TXN-8803', client3.lastInsertRowid, 'Buy', 'Unlisted Shares', 250000, '2026-03-12', 'Completed', 'Pre-IPO shares allotment credited to Demat');
  insertTx.run('TXN-8804', client4.lastInsertRowid, 'Interest / Dividend', 'Fixed Deposit', 38500, '2026-03-10', 'Completed', 'Quarterly interest payout credited to bank');

  // Insert Initial Inquiries from Navi Mumbai / Mumbai area
  const insertInquiry = db.prepare(`
    INSERT INTO inquiries (name, email, phone, service_interest, message, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertInquiry.run(
    'Anil Kulkarni',
    'anil.kulkarni@gmail.com',
    '+91 9152579597',
    '54 EC Capital Gain Bonds',
    'Recently sold a commercial property in Airoli. Need guidance to invest ₹40 Lakhs into 54EC Bonds (REC/NHAI) to claim long-term capital gain tax exemption.',
    'New',
    '2026-03-24 10:15:00'
  );

  insertInquiry.run(
    'Dr. Kavita Joshi',
    'dr.kavita.joshi@gmail.com',
    '+91 9820778899',
    'Mutual Funds & SIP',
    'Looking to start ₹50,000 monthly SIP diversified across equity and hybrid funds for children higher education goals.',
    'In Review',
    '2026-03-22 14:30:00'
  );

  insertInquiry.run(
    'Suresh Nair',
    'suresh.nair@outlook.com',
    '+91 9821665544',
    'Unlisted Pre-IPO Shares',
    'Interested in investing in top unlisted shares and pre-IPO technology firms before they launch public issues.',
    'Contacted',
    '2026-03-20 09:00:00'
  );

  console.log('Sukhmira Investment Services LLP initial data seeded successfully.');
}

initSchema();

module.exports = db;
