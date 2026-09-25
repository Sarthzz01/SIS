const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'sis-luxury-fintech-secure-key-2026';

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// Helper: JWT verification middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.split(' ')[1]) || req.cookies.sis_token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Session expired or invalid token' });
    }
    req.user = decoded;
    next();
  });
}

// Helper: Require Admin middleware
function requireAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Access denied: Administrator privileges required' });
    }
  });
}

// -------------------------------------------------------------
// AUTHENTICATION ROUTES
// -------------------------------------------------------------

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body;
  const usernameOrEmail = (identifier || req.body.username || req.body.email || '').trim();

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: 'Username/Email and Password are required' });
  }

  try {
    const user = db.prepare(`
      SELECT * FROM users 
      WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)
    `).get(usernameOrEmail, usernameOrEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ error: 'Account is suspended. Please contact SIS advisory.' });
    }

    const passwordValid = bcrypt.compareSync(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('sis_token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        risk_profile: user.risk_profile,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
});

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { full_name, email, username, password, phone, risk_profile, initial_deposit } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const generatedUsername = username ? username.trim() : email.split('@')[0].toLowerCase().replace(/[^a-z0-9._]/g, '');

  try {
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)').get(email, generatedUsername);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email or username already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    const deposit = Math.max(Number(initial_deposit) || 50000, 10000);
    const risk = risk_profile || 'Moderate Growth';

    const insertUser = db.prepare(`
      INSERT INTO users (username, email, password_hash, full_name, phone, role, status, total_portfolio, risk_profile)
      VALUES (?, ?, ?, ?, ?, 'client', 'Active', ?, ?)
    `);

    const result = insertUser.run(
      generatedUsername,
      email.trim(),
      password_hash,
      full_name.trim(),
      phone ? phone.trim() : '',
      deposit,
      risk
    );

    const userId = result.lastInsertRowid;

    // Seed realistic starter portfolio for new client based on deposit
    const insertPortfolio = db.prepare(`
      INSERT INTO portfolios (user_id, asset_class, holding_name, allocation_pct, current_value, invested_value, performance_pct)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const eqVal = deposit * 0.5;
    const fiVal = deposit * 0.3;
    const altVal = deposit * 0.2;

    insertPortfolio.run(userId, 'Mutual Funds', 'Diversified Multi-Cap Mutual Fund Portfolio', 50, eqVal, eqVal, 3.4);
    insertPortfolio.run(userId, 'Bonds', 'Sovereign Gold Bonds & 54EC Capital Gain Securities', 30, fiVal, fiVal, 1.2);
    insertPortfolio.run(userId, 'Fixed Deposit', 'Corporate & Bank High-Yield Fixed Deposits', 20, altVal, altVal, 2.1);

    // Initial deposit transaction
    const insertTx = db.prepare(`
      INSERT INTO transactions (tx_code, user_id, type, asset_class, amount, date, status, description)
      VALUES (?, ?, 'SIP / Deposit', 'Cash / Bank', ?, ?, 'Completed', 'Initial wealth management account funding')
    `);
    const today = new Date().toISOString().split('T')[0];
    insertTx.run(`TXN-${Math.floor(1000 + Math.random() * 9000)}`, userId, deposit, today);

    const payload = {
      id: userId,
      username: generatedUsername,
      email,
      full_name,
      role: 'client'
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('sis_token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        username: generatedUsername,
        email,
        full_name,
        role: 'client',
        risk_profile: risk,
        total_portfolio: deposit
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create client account' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, username, email, full_name, phone, role, status, total_portfolio, risk_profile, created_at
      FROM users WHERE id = ?
    `).get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error checking profile' });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('sis_token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// -------------------------------------------------------------
// PUBLIC LEAD CAPTURE & CONTACT
// -------------------------------------------------------------

// GET /api/company-info
app.get('/api/company-info', (req, res) => {
  res.json({
    business_name: 'Sukhmira Investment Services LLP',
    business_type: 'Financial Investment services',
    phones: ['+91 9152579597', '+91 9152635363'],
    phone_display: '9152579597 / 9152635363',
    email: 'sukhmirainvestment@gmail.com',
    address: 'Shop No.1, Plot No.55, Sector 8A, Shree Yashashree CHS Ltd. Airoli, Navi Mumbai, 400708',
    city: 'Navi Mumbai',
    pincode: '400708',
    state: 'Maharashtra',
    country: 'India',
    services: [
      'Mutual Funds',
      'Bonds',
      'Fixed Deposit',
      'Insurance',
      'Unlisted Shares',
      '54 EC Bonds'
    ]
  });
});

// POST /api/contact
app.post('/api/contact', (req, res) => {
  const { name, email, phone, message, service_interest } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO inquiries (name, email, phone, service_interest, message, status)
      VALUES (?, ?, ?, ?, ?, 'New')
    `);
    const result = stmt.run(
      name.trim(),
      email.trim(),
      phone ? phone.trim() : '',
      service_interest || 'General Advisory',
      message.trim()
    );

    res.json({
      success: true,
      inquiryId: result.lastInsertRowid,
      message: 'Thank you! Your inquiry has been sent to our private wealth advisory team.'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Unable to save inquiry. Please try again.' });
  }
});

// POST /api/consultations
app.post('/api/consultations', (req, res) => {
  const { name, email, phone, preferred_date, preferred_time, service_type, notes } = req.body;

  if (!name || !email || !preferred_date || !preferred_time) {
    return res.status(400).json({ error: 'Name, email, date, and time are required' });
  }

  try {
    let userId = null;
    const authHeader = req.headers['authorization'];
    const token = (authHeader && authHeader.split(' ')[1]) || req.cookies.sis_token;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (e) {}
    }

    const stmt = db.prepare(`
      INSERT INTO consultations (user_id, name, email, phone, preferred_date, preferred_time, service_type, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
    `);
    const result = stmt.run(
      userId,
      name.trim(),
      email.trim(),
      phone ? phone.trim() : '',
      preferred_date,
      preferred_time,
      service_type || 'Portfolio Strategy Session',
      notes ? notes.trim() : ''
    );

    res.json({
      success: true,
      consultationId: result.lastInsertRowid,
      message: 'Consultation request booked! Our advisor will confirm your appointment shortly.'
    });
  } catch (error) {
    console.error('Consultation error:', error);
    res.status(500).json({ error: 'Unable to book consultation' });
  }
});

// -------------------------------------------------------------
// CLIENT PORTAL ROUTES (Client self-service)
// -------------------------------------------------------------

// GET /api/client/dashboard
app.get('/api/client/dashboard', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;

    // Get User Details
    const user = db.prepare(`
      SELECT id, username, email, full_name, phone, role, status, risk_profile, created_at
      FROM users WHERE id = ?
    `).get(userId);

    // Get Portfolios
    const holdings = db.prepare(`
      SELECT id, asset_class, holding_name, allocation_pct, current_value, invested_value, performance_pct, updated_at
      FROM portfolios WHERE user_id = ? ORDER BY current_value DESC
    `).all(userId);

    // Calculate totals
    const totalValue = holdings.reduce((sum, h) => sum + h.current_value, 0);
    const totalInvested = holdings.reduce((sum, h) => sum + h.invested_value, 0);
    const totalGain = totalValue - totalInvested;
    const totalGainPct = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : 0;

    // Get Recent Transactions
    const transactions = db.prepare(`
      SELECT id, tx_code, type, asset_class, amount, date, status, description
      FROM transactions WHERE user_id = ? ORDER BY date DESC, id DESC LIMIT 15
    `).all(userId);

    // Asset allocation breakdown
    const assetBreakdown = {};
    holdings.forEach(h => {
      assetBreakdown[h.asset_class] = (assetBreakdown[h.asset_class] || 0) + h.current_value;
    });

    res.json({
      client: user,
      metrics: {
        totalValue,
        totalInvested,
        totalGain,
        totalGainPct: Number(totalGainPct),
        holdingsCount: holdings.length
      },
      assetBreakdown,
      holdings,
      transactions
    });
  } catch (error) {
    console.error('Client dashboard error:', error);
    res.status(500).json({ error: 'Failed to load client portfolio dashboard' });
  }
});

// POST /api/client/transactions (Request investment or deposit)
app.post('/api/client/transactions', authenticateToken, (req, res) => {
  const { type, asset_class, amount, description } = req.body;
  const numAmount = Number(amount);

  if (!type || !numAmount || numAmount <= 0) {
    return res.status(400).json({ error: 'Valid transaction type and positive amount required' });
  }

  try {
    const txCode = `TXN-${Math.floor(10000 + Math.random() * 90000)}`;
    const today = new Date().toISOString().split('T')[0];

    const stmt = db.prepare(`
      INSERT INTO transactions (tx_code, user_id, type, asset_class, amount, date, status, description)
      VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?)
    `);

    stmt.run(
      txCode,
      req.user.id,
      type,
      asset_class || 'General Account',
      numAmount,
      today,
      description || `Client self-requested ${type}`
    );

    res.json({
      success: true,
      message: `Transaction request ${txCode} received for review and execution.`
    });
  } catch (error) {
    console.error('Client transaction error:', error);
    res.status(500).json({ error: 'Failed to submit transaction request' });
  }
});

// -------------------------------------------------------------
// ADMIN MANAGEMENT ROUTES (Advisors & CIO)
// -------------------------------------------------------------

// GET /api/admin/metrics
app.get('/api/admin/metrics', requireAdmin, (req, res) => {
  try {
    const clientCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'client'").get().count;
    const portfolioSums = db.prepare("SELECT SUM(current_value) as totalAUM, SUM(invested_value) as totalInvested FROM portfolios").get();
    const totalAUM = portfolioSums.totalAUM || 0;
    const totalInvested = portfolioSums.totalInvested || 0;
    const overallReturn = totalInvested > 0 ? (((totalAUM - totalInvested) / totalInvested) * 100).toFixed(2) : 0;
    const avgPortfolio = clientCount > 0 ? Math.round(totalAUM / clientCount) : 0;
    const newInquiries = db.prepare("SELECT COUNT(*) as count FROM inquiries WHERE status = 'New'").get().count;
    const pendingTransactions = db.prepare("SELECT COUNT(*) as count FROM transactions WHERE status = 'Pending'").get().count;

    res.json({
      totalClients: clientCount,
      totalAUM,
      totalInvested,
      overallReturn: Number(overallReturn),
      avgPortfolio,
      newInquiries,
      pendingTransactions
    });
  } catch (error) {
    console.error('Admin metrics error:', error);
    res.status(500).json({ error: 'Error calculating metrics' });
  }
});

// GET /api/admin/clients
app.get('/api/admin/clients', requireAdmin, (req, res) => {
  const { search } = req.query;
  try {
    let query = `
      SELECT u.id, u.username, u.email, u.full_name, u.phone, u.status, u.risk_profile, u.created_at,
             COALESCE(SUM(p.current_value), u.total_portfolio, 0) as portfolioValue,
             COUNT(p.id) as holdingsCount
      FROM users u
      LEFT JOIN portfolios p ON u.id = p.user_id
      WHERE u.role = 'client'
    `;
    const params = [];

    if (search && search.trim()) {
      query += ` AND (LOWER(u.full_name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(u.phone) LIKE ?)`;
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term, term);
    }

    query += ` GROUP BY u.id ORDER BY portfolioValue DESC`;

    const clients = db.prepare(query).all(...params);
    res.json({ clients });
  } catch (error) {
    console.error('Admin clients error:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// POST /api/admin/clients
app.post('/api/admin/clients', requireAdmin, (req, res) => {
  const { full_name, email, phone, initial_investment, risk_profile, status } = req.body;

  if (!full_name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)').get(email);
    if (existing) {
      return res.status(400).json({ error: 'A client with this email already exists' });
    }

    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9._]/g, '');
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync('clientPass2026!', salt);
    const inv = Number(initial_investment) || 50000;

    const stmt = db.prepare(`
      INSERT INTO users (username, email, password_hash, full_name, phone, role, status, total_portfolio, risk_profile)
      VALUES (?, ?, ?, ?, ?, 'client', ?, ?, ?)
    `);

    const result = stmt.run(
      username,
      email.trim(),
      password_hash,
      full_name.trim(),
      phone || '',
      status || 'Active',
      inv,
      risk_profile || 'Moderate Growth'
    );

    const newClientId = result.lastInsertRowid;

    // Create starter allocation
    const insertP = db.prepare(`
      INSERT INTO portfolios (user_id, asset_class, holding_name, allocation_pct, current_value, invested_value, performance_pct)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertP.run(newClientId, 'Equities', 'Diversified Global Equity Allocation', 60, inv * 0.6, inv * 0.6, 5.0);
    insertP.run(newClientId, 'Fixed Income', 'Core Sovereign & Corporate Bonds', 30, inv * 0.3, inv * 0.3, 2.0);
    insertP.run(newClientId, 'Cash', 'Treasury Money Market Fund', 10, inv * 0.1, inv * 0.1, 0.0);

    res.status(201).json({
      success: true,
      clientId: newClientId,
      message: 'New client added with initial balanced portfolio'
    });
  } catch (error) {
    console.error('Error adding client:', error);
    res.status(500).json({ error: 'Failed to create client record' });
  }
});

// PUT /api/admin/clients/:id
app.put('/api/admin/clients/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { full_name, email, phone, status, risk_profile } = req.body;

  try {
    const stmt = db.prepare(`
      UPDATE users 
      SET full_name = COALESCE(?, full_name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          status = COALESCE(?, status),
          risk_profile = COALESCE(?, risk_profile)
      WHERE id = ? AND role = 'client'
    `);

    stmt.run(full_name, email, phone, status, risk_profile, id);
    res.json({ success: true, message: 'Client details updated successfully' });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// DELETE /api/admin/clients/:id
app.delete('/api/admin/clients/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  try {
    const deleteHoldings = db.prepare('DELETE FROM portfolios WHERE user_id = ?').run(id);
    const deleteTx = db.prepare('DELETE FROM transactions WHERE user_id = ?').run(id);
    const deleteClient = db.prepare("DELETE FROM users WHERE id = ? AND role = 'client'").run(id);

    if (deleteClient.changes === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ success: true, message: 'Client account and associated records removed' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

// GET /api/admin/portfolios
app.get('/api/admin/portfolios', requireAdmin, (req, res) => {
  try {
    const portfolios = db.prepare(`
      SELECT p.id, p.user_id, u.full_name as client_name, u.email as client_email,
             p.asset_class, p.holding_name, p.allocation_pct, p.current_value,
             p.invested_value, p.performance_pct, p.updated_at
      FROM portfolios p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.current_value DESC
    `).all();

    // Summary totals by asset class
    const assetSummary = db.prepare(`
      SELECT asset_class, SUM(current_value) as total_value, COUNT(*) as holdings_count
      FROM portfolios
      GROUP BY asset_class
    `).all();

    res.json({ portfolios, assetSummary });
  } catch (error) {
    console.error('Portfolios error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolios' });
  }
});

// POST /api/admin/portfolios
app.post('/api/admin/portfolios', requireAdmin, (req, res) => {
  const { user_id, asset_class, holding_name, allocation_pct, current_value, invested_value, performance_pct } = req.body;

  if (!user_id || !asset_class || !holding_name || !current_value) {
    return res.status(400).json({ error: 'Client, asset class, holding name, and value are required' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO portfolios (user_id, asset_class, holding_name, allocation_pct, current_value, invested_value, performance_pct)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      user_id,
      asset_class,
      holding_name.trim(),
      Number(allocation_pct) || 0,
      Number(current_value),
      Number(invested_value) || Number(current_value),
      Number(performance_pct) || 0
    );

    res.status(201).json({ success: true, message: 'Holding added to client portfolio' });
  } catch (error) {
    console.error('Add holding error:', error);
    res.status(500).json({ error: 'Failed to add portfolio holding' });
  }
});

// GET /api/admin/transactions
app.get('/api/admin/transactions', requireAdmin, (req, res) => {
  try {
    const transactions = db.prepare(`
      SELECT t.id, t.tx_code, t.user_id, u.full_name as client_name,
             t.type, t.asset_class, t.amount, t.date, t.status, t.description
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.date DESC, t.id DESC
    `).all();

    res.json({ transactions });
  } catch (error) {
    console.error('Admin transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// POST /api/admin/transactions
app.post('/api/admin/transactions', requireAdmin, (req, res) => {
  const { user_id, type, asset_class, amount, date, status, description } = req.body;

  if (!user_id || !type || !amount) {
    return res.status(400).json({ error: 'Client, transaction type, and amount are required' });
  }

  try {
    const txCode = `TXN-${Math.floor(1000 + Math.random() * 9000)}`;
    const txDate = date || new Date().toISOString().split('T')[0];

    const stmt = db.prepare(`
      INSERT INTO transactions (tx_code, user_id, type, asset_class, amount, date, status, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      txCode,
      user_id,
      type,
      asset_class || 'Equities',
      Number(amount),
      txDate,
      status || 'Completed',
      description || `Executed by advisor`
    );

    res.status(201).json({ success: true, message: 'Transaction recorded successfully' });
  } catch (error) {
    console.error('Record transaction error:', error);
    res.status(500).json({ error: 'Failed to record transaction' });
  }
});

// PUT /api/admin/transactions/:id/status
app.put('/api/admin/transactions/:id/status', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: 'Status is required' });

  try {
    db.prepare('UPDATE transactions SET status = ? WHERE id = ?').run(status, id);
    res.json({ success: true, message: 'Transaction status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update transaction status' });
  }
});

// GET /api/admin/inquiries
app.get('/api/admin/inquiries', requireAdmin, (req, res) => {
  try {
    const inquiries = db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all();
    res.json({ inquiries });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// PUT /api/admin/inquiries/:id
app.put('/api/admin/inquiries/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    db.prepare('UPDATE inquiries SET status = ? WHERE id = ?').run(status, id);
    res.json({ success: true, message: 'Inquiry status updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update inquiry status' });
  }
});

// DELETE /api/admin/inquiries/:id
app.delete('/api/admin/inquiries/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM inquiries WHERE id = ?').run(id);
    res.json({ success: true, message: 'Inquiry deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete inquiry' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  SIS Wealth Advisory Backend Running on:      `);
  console.log(`  http://localhost:${PORT}                     `);
  console.log(`===============================================`);
});
