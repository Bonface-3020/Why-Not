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

    // Helper to clean up success cards inside a modal
    function resetModalForm(overlay) {
        const successCard = overlay.querySelector('.form-success-card');
        if (successCard) {
            successCard.remove();
            const form = overlay.querySelector('form[data-form]');
            const modalTitle = overlay.querySelector('.modal-title');
            const modalSubtitle = overlay.querySelector('.modal-subtitle');
            if (form) {
                form.reset();
                form.style.display = '';
            }
            if (modalTitle) modalTitle.style.display = '';
            if (modalSubtitle) modalSubtitle.style.display = '';
        }
    }

    // Close modal triggers
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target === el) {
                const overlay = el.closest('.modal-overlay') || el;
                overlay.classList.remove('active');
                document.body.style.overflow = '';
                resetModalForm(overlay);
            }
        });
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => {
                m.classList.remove('active');
                document.body.style.overflow = '';
                resetModalForm(m);
            });
        }
    });
}

/* --- Form Handling — WhatsApp Redirect & In-Place Confirmation --- */
const WA_NUMBER = '254780753015';

function openWhatsAppNewTab(waUrl) {
    const link = document.createElement('a');
    link.href = waUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function showFormSuccess(form, formType) {
    form.style.display = 'none';

    const modal = form.closest('.modal');
    const modalTitle = modal ? modal.querySelector('.modal-title') : null;
    const modalSubtitle = modal ? modal.querySelector('.modal-subtitle') : null;
    if (modalTitle) modalTitle.style.display = 'none';
    if (modalSubtitle) modalSubtitle.style.display = 'none';

    // Remove any previously injected success card
    const existingCard = form.parentElement.querySelector('.form-success-card');
    if (existingCard) existingCard.remove();

    const successCard = document.createElement('div');
    successCard.className = 'form-success-card';

    const contentMap = {
        'rsvp': {
            title: 'RSVP Request Sent!',
            subtitle: 'WhatsApp opened in a new tab with your reservation details.',
            instruction: 'Simply tap <strong>Send</strong> in WhatsApp to deliver your spot request. Our team will confirm your reservation right away!',
            resetLabel: 'Book Another Spot'
        },
        'host': {
            title: 'Event Booking Request Sent!',
            subtitle: 'WhatsApp opened in a new tab with your event details.',
            instruction: 'Tap <strong>Send</strong> in WhatsApp to deliver your event brief. Our event planner will review your date and package to lock in your booking!',
            resetLabel: 'Submit Another Request'
        },
        'contact': {
            title: 'Message Sent Successfully!',
            subtitle: 'WhatsApp opened in a new tab with your message.',
            instruction: 'Tap <strong>Send</strong> in WhatsApp to connect directly with us. We reply promptly during business hours!',
            resetLabel: 'Send Another Message'
        }
    };

    const details = contentMap[formType] || {
        title: 'Request Sent Successfully!',
        subtitle: 'WhatsApp opened in a new tab with your message.',
        instruction: 'Tap <strong>Send</strong> in WhatsApp to deliver your message.',
        resetLabel: 'Submit Another'
    };

    successCard.innerHTML = `
        <button type="button" class="form-success-close" aria-label="Close">✕</button>
        <div style="text-align: center; padding: var(--space-xl) var(--space-md); animation: fadeIn 0.3s ease;">
            <div style="width: 72px; height: 72px; margin: 0 auto var(--space-md); background: rgba(37, 211, 102, 0.15); border: 2px solid #25D366; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; color: #25D366; box-shadow: 0 0 30px rgba(37, 211, 102, 0.25);">
                ✓
            </div>
            <h3 style="font-family: var(--font-heading); font-size: 1.6rem; color: var(--clr-gold); margin-bottom: var(--space-xs);">
                ${details.title}
            </h3>
            <p style="color: var(--clr-white); font-weight: 500; font-size: 1.05rem; margin-bottom: var(--space-sm);">
                ${details.subtitle}
            </p>
            <p style="color: var(--clr-gray-300); font-size: 0.9rem; max-width: 440px; margin: 0 auto var(--space-lg); line-height: 1.6;">
                ${details.instruction}
            </p>
            <div style="display: flex; gap: var(--space-sm); justify-content: center; flex-wrap: wrap;">
                <button type="button" class="btn btn-primary form-done-btn" style="padding: 10px 32px;">
                    Done
                </button>
                <button type="button" class="btn btn-secondary reset-form-btn" style="padding: 10px 24px; font-size: 0.85rem;">
                    ${details.resetLabel}
                </button>
            </div>
        </div>
    `;

    form.parentElement.insertBefore(successCard, form);

    const restoreForm = () => {
        successCard.remove();
        form.reset();
        form.style.display = '';
        if (modalTitle) modalTitle.style.display = '';
        if (modalSubtitle) modalSubtitle.style.display = '';
    };

    const handleClose = () => {
        const overlay = form.closest('.modal-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(restoreForm, 300);
        } else {
            restoreForm();
        }
    };

    // Close button (X)
    const closeX = successCard.querySelector('.form-success-close');
    if (closeX) {
        closeX.addEventListener('click', handleClose);
    }

    // Done button
    const doneBtn = successCard.querySelector('.form-done-btn');
    if (doneBtn) {
        doneBtn.addEventListener('click', handleClose);
    }

    // Reset button (Submit Another / Book Another Spot)
    const resetBtn = successCard.querySelector('.reset-form-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', restoreForm);
    }
}

function initForms() {
    document.querySelectorAll('form[data-form]').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const formType = form.dataset.form;

            // Simple newsletter handling
            if (formType === 'newsletter') {
                showToast('✅', getFormSuccessMessage('newsletter'));
                form.reset();
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalHTML = submitBtn ? submitBtn.innerHTML : '';

            if (submitBtn) {
                submitBtn.innerHTML = '<span class="btn-icon">⏳</span> Opening WhatsApp...';
                submitBtn.disabled = true;
            }

            const message = buildWhatsAppMessage(formType, form);
            const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

            // Open WhatsApp in a NEW TAB — never moves or leaves the current website
            openWhatsAppNewTab(waUrl);

            // Display in-place success confirmation on the webpage
            showToast('✅', getFormSuccessMessage(formType));
            showFormSuccess(form, formType);

            if (submitBtn) {
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
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
