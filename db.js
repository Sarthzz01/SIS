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
      asset_class TEXT NOT NULL, -- 'Equities', 'Fixed Income', 'Mutual Funds', 'Alternative', 'Cash'
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
      type TEXT NOT NULL, -- 'Buy', 'Sell', 'Deposit', 'Dividend', 'Withdrawal'
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
      service_interest TEXT DEFAULT 'Investment Planning',
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
  if (userCount > 0) return; // Already seeded

  console.log('Seeding initial data into SQLite database...');
  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('password123', salt);

  // Insert Admin
  const insertUser = db.prepare(`
    INSERT INTO users (username, email, password_hash, full_name, phone, role, status, total_portfolio, risk_profile)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const adminResult = insertUser.run(
    'admin',
    'admin@sis.com',
    defaultPasswordHash,
    'Chief Investment Officer',
    '(555) 010-0900',
    'admin',
    'Active',
    0,
    'Executive'
  );

  // Insert Demo Clients
  const client1 = insertUser.run(
    'john.anderson',
    'john.anderson@email.com',
    defaultPasswordHash,
    'John Anderson',
    '(555) 123-4567',
    'client',
    'Active',
    450000,
    'Aggressive Growth'
  );

  const client2 = insertUser.run(
    'sarah.mitchell',
    'sarah.mitchell@email.com',
    defaultPasswordHash,
    'Sarah Mitchell',
    '(555) 234-5678',
    'client',
    'Active',
    680000,
    'Balanced Wealth'
  );

  const client3 = insertUser.run(
    'michael.chen',
    'michael.chen@email.com',
    defaultPasswordHash,
    'Michael Chen',
    '(555) 345-6789',
    'client',
    'Active',
    520000,
    'Moderate Growth'
  );

  const client4 = insertUser.run(
    'emily.rodriguez',
    'emily.rodriguez@email.com',
    defaultPasswordHash,
    'Emily Rodriguez',
    '(555) 456-7890',
    'client',
    'Active',
    750000,
    'Capital Preservation'
  );

  const client5 = insertUser.run(
    'robert.taylor',
    'robert.taylor@email.com',
    defaultPasswordHash,
    'Robert Taylor',
    '(555) 567-8901',
    'client',
    'Active',
    890000,
    'High Yield Growth'
  );

  const client6 = insertUser.run(
    'lisa.johnson',
    'lisa.johnson@email.com',
    defaultPasswordHash,
    'Lisa Johnson',
    '(555) 678-9012',
    'client',
    'Active',
    420000,
    'Balanced Wealth'
  );

  // Insert Portfolios
  const insertPortfolio = db.prepare(`
    INSERT INTO portfolios (user_id, asset_class, holding_name, allocation_pct, current_value, invested_value, performance_pct)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Portfolios for John Anderson
  insertPortfolio.run(client1.lastInsertRowid, 'Equities', 'Vanguard S&P 500 Index & Large Cap Tech', 58, 261000, 240000, 8.75);
  insertPortfolio.run(client1.lastInsertRowid, 'Fixed Income', 'US Treasury 7-10 Year Bond ETF', 30, 135000, 132000, 2.27);
  insertPortfolio.run(client1.lastInsertRowid, 'Alternative', 'Global Infrastructure & Real Estate', 12, 54000, 50000, 8.00);

  // Portfolios for Sarah Mitchell
  insertPortfolio.run(client2.lastInsertRowid, 'Equities', 'Global Blue Chip Growth Fund', 58, 394400, 360000, 9.55);
  insertPortfolio.run(client2.lastInsertRowid, 'Fixed Income', 'Corporate High Yield & Muni Bonds', 30, 204000, 200000, 2.00);
  insertPortfolio.run(client2.lastInsertRowid, 'Alternative', 'Private Equity & Gold Hedged Fund', 12, 81600, 75000, 8.80);

  // Portfolios for Michael Chen
  insertPortfolio.run(client3.lastInsertRowid, 'Equities', 'NextGen Semiconductors & AI Index', 60, 312000, 280000, 11.43);
  insertPortfolio.run(client3.lastInsertRowid, 'Fixed Income', 'Short Term Sovereign Notes', 25, 130000, 128000, 1.56);
  insertPortfolio.run(client3.lastInsertRowid, 'Cash', 'High-Yield Liquid Treasury Cash', 15, 78000, 78000, 0.00);

  // Portfolios for Emily Rodriguez
  insertPortfolio.run(client4.lastInsertRowid, 'Equities', 'Dividend Aristocrats Portfolio', 45, 337500, 310000, 8.87);
  insertPortfolio.run(client4.lastInsertRowid, 'Fixed Income', 'Green & Sustainable Global Bonds', 45, 337500, 330000, 2.27);
  insertPortfolio.run(client4.lastInsertRowid, 'Alternative', 'Clean Energy Infrastructure Trust', 10, 75000, 70000, 7.14);

  // Portfolios for Robert Taylor
  insertPortfolio.run(client5.lastInsertRowid, 'Equities', 'US Growth & Innovation Alpha', 65, 578500, 520000, 11.25);
  insertPortfolio.run(client5.lastInsertRowid, 'Fixed Income', 'Investment Grade Corporate Debt', 25, 222500, 220000, 1.14);
  insertPortfolio.run(client5.lastInsertRowid, 'Alternative', 'Private Credit Opportunities', 10, 89000, 85000, 4.71);

  // Portfolios for Lisa Johnson
  insertPortfolio.run(client6.lastInsertRowid, 'Equities', 'Global Core Index Allocation', 55, 231000, 215000, 7.44);
  insertPortfolio.run(client6.lastInsertRowid, 'Fixed Income', 'Inflation-Protected Securities (TIPS)', 30, 126000, 123000, 2.44);
  insertPortfolio.run(client6.lastInsertRowid, 'Alternative', 'Precious Metals & Commodities', 15, 63000, 60000, 5.00);

  // Insert Transactions
  const insertTx = db.prepare(`
    INSERT INTO transactions (tx_code, user_id, type, asset_class, amount, date, status, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertTx.run('TXN-8801', client1.lastInsertRowid, 'Buy', 'Equities', 25000, '2026-03-15', 'Completed', 'Vanguard S&P 500 ETF purchase');
  insertTx.run('TXN-8802', client2.lastInsertRowid, 'Sell', 'Alternative', 15000, '2026-03-14', 'Completed', 'Partial profit realization in commodities');
  insertTx.run('TXN-8803', client3.lastInsertRowid, 'Deposit', 'Cash', 35000, '2026-03-12', 'Completed', 'Wire transfer quarterly allocation');
  insertTx.run('TXN-8804', client4.lastInsertRowid, 'Buy', 'Fixed Income', 20000, '2026-03-10', 'Pending', 'Municipal green bond subscription');
  insertTx.run('TXN-8805', client5.lastInsertRowid, 'Dividend', 'Equities', 6250, '2026-03-08', 'Completed', 'Q1 dividend reinvestment');
  insertTx.run('TXN-8806', client6.lastInsertRowid, 'Buy', 'Alternative', 12500, '2026-03-05', 'Completed', 'Physical gold backed security buy');

  // Insert Initial Inquiries
  const insertInquiry = db.prepare(`
    INSERT INTO inquiries (name, email, phone, service_interest, message, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertInquiry.run(
    'David Miller',
    'david.miller@acmeholdings.com',
    '(555) 789-0123',
    'Corporate Wealth Planning',
    'Looking to diversify our executive retained earnings and set up tax-advantaged accounts.',
    'New',
    '2026-03-24 10:15:00'
  );

  insertInquiry.run(
    'Elena Rostova',
    'elena.rostova@nexus.io',
    '(555) 890-1234',
    'Retirement & Net Worth Advisory',
    'Recent tech liquidity event ($2.4M). Requesting private wealth consultation for multi-asset management.',
    'In Review',
    '2026-03-22 14:30:00'
  );

  insertInquiry.run(
    'Marcus Vance',
    'm.vance@capitalgroup.org',
    '(555) 901-2345',
    'Risk Management & Hedging',
    'Interested in defensive fixed income structures ahead of interest rate adjustments.',
    'Contacted',
    '2026-03-20 09:00:00'
  );

  console.log('Initial data seeded successfully.');
}

initSchema();

module.exports = db;
