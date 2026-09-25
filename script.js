/**
 * Sukhmira Investment Services LLP (SIS)
 * Financial Investment Services
 * Modern Fintech UI Engine & Backend Client Integration
 */

// Mobile Navigation Toggle
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

menuToggle?.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  mainNav?.classList.toggle('open');
});

document.querySelectorAll('.main-nav a:not(.has-dropdown)').forEach(link => {
  link.addEventListener('click', () => {
    mainNav?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

// Dropdown support for mobile & click
document.querySelectorAll('.nav-dropdown-wrapper').forEach(wrapper => {
  const toggle = wrapper.querySelector('.nav-dropdown-toggle');
  if (toggle) {
    toggle.addEventListener('click', (e) => {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        wrapper.classList.toggle('active');
      }
    });
  }
});

// Header Scrolled Glass Effect
window.addEventListener('scroll', () => {
  const header = document.querySelector('.site-header');
  if (header) {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
});

// Toast Notification System
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const iconMap = {
    success: 'fa-circle-check',
    error: 'fa-circle-exclamation',
    info: 'fa-circle-info'
  };
  const icon = iconMap[type] || 'fa-bell';

  toast.innerHTML = `
    <i class="fa-solid ${icon}" style="color: ${type === 'success' ? 'var(--accent-emerald)' : type === 'error' ? 'var(--accent-danger)' : 'var(--accent-gold)'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
window.showToast = showToast;

// Currency Formatter for Indian Rupees (₹)
function formatINR(val, compact = false) {
  const num = Math.round(Number(val) || 0);
  if (compact) {
    if (num >= 10000000) {
      return '₹' + (num / 10000000).toFixed(2) + ' Cr';
    } else if (num >= 100000) {
      return '₹' + (num / 100000).toFixed(2) + ' Lakh';
    }
  }
  return '₹' + num.toLocaleString('en-IN');
}
window.formatINR = formatINR;

// Global Dynamic Header Authentication State
function updateHeaderAuthState() {
  const nav = document.querySelector('.main-nav');
  if (!nav) return;

  const rawUser = localStorage.getItem('sis_user');
  const token = localStorage.getItem('sis_token');

  if (rawUser && token) {
    try {
      const user = JSON.parse(rawUser);
      nav.querySelectorAll('.signin-nav-link, .admin-nav-link').forEach(el => el.remove());

      let userBlock = nav.querySelector('.user-nav-action-block');
      if (!userBlock) {
        userBlock = document.createElement('div');
        userBlock.className = 'user-nav-action-block';
        userBlock.style.display = 'inline-flex';
        userBlock.style.alignItems = 'center';
        userBlock.style.gap = '0.75rem';
        nav.appendChild(userBlock);
      }

      if (user.role === 'admin') {
        userBlock.innerHTML = `
          <a href="admin.html" class="button small secondary" style="border-color:var(--accent-gold); color:var(--accent-gold-light);">
            <i class="fa-solid fa-shield"></i> Admin Console
          </a>
          <button class="btn-nav-logout" onclick="logoutUser()" title="Sign Out">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
        `;
      } else {
        const initials = user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
        userBlock.innerHTML = `
          <a href="client-dashboard.html" class="button small primary">
            <i class="fa-solid fa-chart-pie"></i> My Portfolio
          </a>
          <div class="user-badge-nav">
            <span class="user-badge-avatar">${initials}</span>
            <span>${user.full_name ? user.full_name.split(' ')[0] : 'Investor'}</span>
            <button class="btn-nav-logout" onclick="logoutUser()" title="Sign Out">
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
          </div>
        `;
      }
    } catch (e) {
      console.error('Error parsing session user', e);
    }
  }
}

function logoutUser() {
  localStorage.removeItem('sis_token');
  localStorage.removeItem('sis_user');
  fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  showToast('Logged out safely', 'info');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 400);
}
window.logoutUser = logoutUser;

// Metric Number Counters Animation
const counters = document.querySelectorAll('.counter');
const animateCounter = counter => {
  const target = Number(counter.dataset.target) || 0;
  const duration = 1400;
  const step = Math.max(Math.ceil(target / (duration / 16)), 1);
  let current = 0;

  const update = () => {
    current += step;
    if (current < target) {
      counter.textContent = current.toLocaleString('en-IN');
      requestAnimationFrame(update);
    } else {
      counter.textContent = target.toLocaleString('en-IN');
    }
  };

  update();
};

if (counters.length) {
  const observer = new IntersectionObserver(
    (entries, observerInstance) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observerInstance.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach(counter => {
    counter.textContent = '0';
    observer.observe(counter);
  });
}

// Global Financial SIP & Wealth Growth Calculator Widget (in ₹ INR)
function initWealthCalculator() {
  const monthlySlider = document.getElementById('calcMonthly');
  const returnSlider = document.getElementById('calcReturn');
  const periodSlider = document.getElementById('calcPeriod');

  if (!monthlySlider || !returnSlider || !periodSlider) return;

  const monthlyVal = document.getElementById('calcMonthlyVal');
  const returnVal = document.getElementById('calcReturnVal');
  const periodVal = document.getElementById('calcPeriodVal');

  const totalCorpus = document.getElementById('calcTotalCorpus');
  const investedAmount = document.getElementById('calcInvestedAmount');
  const estGain = document.getElementById('calcEstGain');
  const barInvested = document.getElementById('calcBarInvested');
  const barReturns = document.getElementById('calcBarReturns');
  const corpusWords = document.getElementById('calcCorpusWords');

  function calculate() {
    const P = Number(monthlySlider.value);
    const annualRate = Number(returnSlider.value);
    const years = Number(periodSlider.value);

    monthlyVal.textContent = '₹' + P.toLocaleString('en-IN');
    returnVal.textContent = annualRate + '%';
    periodVal.textContent = years + (years === 1 ? ' Year' : ' Years');

    const i = annualRate / 100 / 12;
    const n = years * 12;

    const totalInvested = P * n;
    // Compound interest annuity formula for monthly SIP: P * [((1+i)^n - 1) / i] * (1+i)
    const futureValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const wealthGain = Math.max(futureValue - totalInvested, 0);

    totalCorpus.textContent = '₹' + Math.round(futureValue).toLocaleString('en-IN');
    investedAmount.textContent = '₹' + Math.round(totalInvested).toLocaleString('en-IN');
    estGain.textContent = '+₹' + Math.round(wealthGain).toLocaleString('en-IN');

    if (corpusWords) {
      if (futureValue >= 10000000) {
        corpusWords.textContent = `(Approx. ₹${(futureValue / 10000000).toFixed(2)} Crores)`;
      } else if (futureValue >= 100000) {
        corpusWords.textContent = `(Approx. ₹${(futureValue / 100000).toFixed(2)} Lakhs)`;
      } else {
        corpusWords.textContent = '';
      }
    }

    const investedPct = (totalInvested / futureValue) * 100;
    if (barInvested && barReturns) {
      barInvested.style.width = `${Math.min(investedPct, 100)}%`;
      barReturns.style.width = `${Math.max(100 - investedPct, 0)}%`;
    }
  }

  monthlySlider.addEventListener('input', calculate);
  returnSlider.addEventListener('input', calculate);
  periodSlider.addEventListener('input', calculate);
  calculate();
}

// FAQ Accordion System
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        // Close siblings if desired, or toggle
        faqItems.forEach(other => other.classList.remove('active'));
        if (!isOpen) {
          item.classList.add('active');
        }
      });
    }
  });
}

// Global Contact Form with Live Backend Persistence
function initContactForms() {
  const contactForms = document.querySelectorAll('.contact-form');

  contactForms.forEach(form => {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const statusEl = form.querySelector('.form-status');
      if (statusEl) {
        statusEl.className = 'form-status';
        statusEl.style.display = 'none';
      }

      // Honeypot check
      const honeypot = form.querySelector('input[name="website"]');
      if (honeypot && honeypot.value) return;

      const nameInput = form.querySelector('#name') || form.querySelector('input[name="name"]');
      const emailInput = form.querySelector('#email') || form.querySelector('input[name="email"]');
      const phoneInput = form.querySelector('#phone') || form.querySelector('input[name="phone"]');
      const messageInput = form.querySelector('#message') || form.querySelector('textarea[name="message"]');
      const serviceInput = form.querySelector('#service_interest') || form.querySelector('select[name="service"]');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';
      const service_interest = serviceInput ? serviceInput.value : 'Mutual Funds & SIP';

      if (!name || !email || !message) {
        if (statusEl) {
          statusEl.textContent = 'Please fill in all required fields (Name, Email, Message).';
          statusEl.classList.add('error');
          statusEl.style.display = 'block';
        }
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const origText = submitBtn ? submitBtn.innerHTML : 'Send';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
      }

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, message, service_interest })
        });

        const data = await res.json();
        if (res.ok) {
          if (statusEl) {
            statusEl.textContent = data.message || 'Thank you! Your inquiry has been sent to Sukhmira Investment Services LLP.';
            statusEl.classList.add('success');
            statusEl.style.display = 'block';
          }
          showToast('Inquiry received. Sukhmira advisor will contact you.', 'success');
          form.reset();
        } else {
          if (statusEl) {
            statusEl.textContent = data.error || 'Failed to submit. Please try again.';
            statusEl.classList.add('error');
            statusEl.style.display = 'block';
          }
        }
      } catch (err) {
        if (statusEl) {
          statusEl.textContent = 'Server connection error. Please try again later.';
          statusEl.classList.add('error');
          statusEl.style.display = 'block';
        }
        showToast('Server connection error', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origText;
        }
      }
    });
  });
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
  updateHeaderAuthState();
  initWealthCalculator();
  initFAQAccordion();
  initContactForms();
});