/* ============================================
   WHY NOT? — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initScrollReveal();
    initBackToTop();
    initFAQ();
    initModals();
    initForms();
    initMobileMenu();
    initCountUp();
});

/* --- Navbar Scroll Effect --- */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Mark active nav link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a:not(.nav-cta)').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

/* --- Mobile Menu --- */
function initMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

/* --- Scroll Reveal --- */
function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

/* --- Back to Top --- */
function initBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 600) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* --- FAQ Accordion --- */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all
            faqItems.forEach(i => i.classList.remove('active'));

            // Open clicked if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/* --- Modals --- */
function initModals() {
    // Open modal triggers
    document.querySelectorAll('[data-modal]').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = trigger.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close modal triggers
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target === el) {
                const overlay = el.closest('.modal-overlay') || el;
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => {
                m.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
    });
}

/* --- Form Handling — WhatsApp Redirect --- */
const WA_NUMBER = '254780753015'; //
function initForms() {
    document.querySelectorAll('form[data-form]').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const formType = form.dataset.form;
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalHTML = submitBtn ? submitBtn.innerHTML : '';

            if (submitBtn) {
                submitBtn.innerHTML = '<span class="btn-icon">⏳</span> Opening WhatsApp...';
                submitBtn.disabled = true;
            }

            const message = buildWhatsAppMessage(formType, form);
            const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

            // Open WhatsApp immediately within user event to prevent popup blockers
            const win = window.open(waUrl, '_blank', 'noopener,noreferrer');
            if (!win || win.closed || typeof win.closed === 'undefined') {
                window.location.href = waUrl;
            }

            showToast('✅', getFormSuccessMessage(formType));
            form.reset();

            if (submitBtn) {
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
            }

            // Close modal if inside one
            const modal = form.closest('.modal-overlay');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
}

function getFormFieldValue(form, name) {
    const el = form.elements[name];
    if (!el) return '';
    if (el.tagName === 'SELECT') {
        const option = el.options[el.selectedIndex];
        return (option && option.value) ? option.text.trim() : '';
    }
    return (el.value || '').trim();
}

function buildWhatsAppMessage(formType, form) {
    const get = (name) => getFormFieldValue(form, name);

    if (formType === 'rsvp') {
        const event = get('event') || 'Upcoming Game Hangout';
        const name = get('name');
        const phone = get('phone');
        const guests = get('guests') || '1 Person';
        const notes = get('notes');
        return [
            `*WHY NOT? GAME HANGOUT*`,
            `*RSVP Booking Request*`,
            ``,
            `• *Event:* ${event}`,
            `• *Name:* ${name}`,
            `• *Phone:* ${phone}`,
            `• *Guests:* ${guests}`,
            notes ? `• *Notes:* ${notes}` : null,
            ``,
            `Please confirm my spot — excited to join!`
        ].filter(Boolean).join('\n');
    }

    if (formType === 'contact') {
        const name = get('name');
        const phone = get('phone');
        const email = get('email');
        const subject = get('subject') || 'General Inquiry';
        const message = get('message');
        return [
            `*WHY NOT? GAME HANGOUT*`,
            `*New Inquiry*`,
            ``,
            `• *Name:* ${name}`,
            phone ? `• *Phone:* ${phone}` : null,
            email ? `• *Email:* ${email}` : null,
            `• *Subject:* ${subject}`,
            ``,
            `*Message:*`,
            message
        ].filter(Boolean).join('\n');
    }

    if (formType === 'host') {
        const name = get('name');
        const phone = get('phone');
        const email = get('email');
        const type = get('type') || 'Private Event';
        const pkg = get('package') || 'To discuss';
        const date = get('date') || 'Flexible';
        const guests = get('guests') || 'To confirm';
        const venue = get('venue') || 'No preference';
        const notes = get('notes');
        return [
            `*WHY NOT? GAME HANGOUT*`,
            `*Private Event Request*`,
            ``,
            `• *Name:* ${name}`,
            `• *Phone:* ${phone}`,
            email ? `• *Email:* ${email}` : null,
            `• *Event Type:* ${type}`,
            `• *Package:* ${pkg}`,
            `• *Preferred Date:* ${date}`,
            `• *Expected Guests:* ${guests}`,
            `• *Venue Preference:* ${venue}`,
            notes ? `• *Notes:* ${notes}` : null,
            ``,
            `Please get in touch to help plan our event!`
        ].filter(Boolean).join('\n');
    }

    // Generic fallback
    const fields = Array.from(form.elements)
        .filter(el => el.name && el.value && el.type !== 'submit')
        .map(el => `• *${el.name}:* ${el.value}`)
        .join('\n');
    return `*WHY NOT? GAME HANGOUT — INQUIRY*\n\n${fields}`;
}

function getFormSuccessMessage(formType) {
    const messages = {
        'rsvp': 'WhatsApp is opening to confirm your RSVP! We\'ll see you at the event 🎯',
        'contact': 'WhatsApp is opening with your message! We reply within 24 hours.',
        'host': 'WhatsApp is opening with your event request! Our team will plan it out with you.',
        'newsletter': 'You\'re subscribed! Welcome to the Why Not? family.'
    };
    return messages[formType] || 'Opening WhatsApp — we\'ll be in touch!';
}

/* --- Toast Notifications --- */
function showToast(icon, message) {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/* --- Count Up Animation --- */
function initCountUp() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    if (counters.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCount(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCount(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const suffix = element.getAttribute('data-suffix') || '';
    const prefix = element.getAttribute('data-prefix') || '';
    const duration = 2000;
    const start = performance.now();

    function update(timestamp) {
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        
        element.textContent = prefix + current.toLocaleString() + suffix;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

/* --- Smooth Scroll for Anchor Links --- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
