/* ========================================
   AXIOSKY NAVIGATION - NAVIGATION.JS
======================================== */

// ===== DOM ELEMENTS =====
const hamburger = document.getElementById('hamburger');
const navMenu   = document.querySelector('.nav-menu');
const navLinks  = document.querySelectorAll('.nav-link');
const navbar    = document.querySelector('.navbar');

// ===== DESKTOP DROPDOWNS (hover + click, unchanged) =====
const dropdownItems = document.querySelectorAll('.nav-item.dropdown');

dropdownItems.forEach(item => {
    item.addEventListener('mouseenter', () => item.classList.add('active'));
    item.addEventListener('mouseleave', () => item.classList.remove('active'));

    const toggle = item.querySelector('.dropdown-toggle');
    if (toggle) {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = item.classList.contains('active');
            dropdownItems.forEach(d => d.classList.remove('active'));
            if (!isOpen) item.classList.add('active');
        });
    }
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item.dropdown')) {
        dropdownItems.forEach(d => d.classList.remove('active'));
    }
});

// ===== MOBILE FULLSCREEN OVERLAY =====
const mobileMenu = document.getElementById('snavMobile');

function closeMobileMenu() {
    hamburger.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    document.body.style.overflow = '';
}

hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = mobileMenu.classList.contains('is-open');
    if (isOpen) {
        closeMobileMenu();
    } else {
        hamburger.classList.add('is-open');
        mobileMenu.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }
});

// Mobile accordion dropdowns
const mobileItems = document.querySelectorAll('.snav-mobile-item');
mobileItems.forEach(item => {
    const btn = item.querySelector('.snav-mobile-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        mobileItems.forEach(i => i.classList.remove('is-open'));
        if (!isOpen) item.classList.add('is-open');
    });
});

// Close on link or CTA click
document.querySelectorAll('.snav-mobile-link, .snav-mobile-cta').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// Close on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
});

// ===== NAVBAR SCROLL EFFECT =====
let lastScrollTop = 0;

window.addEventListener('scroll', () => {
    let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    navbar.style.boxShadow = currentScroll > 50 ? '0 4px 12px rgba(0,0,0,0.15)' : 'none';
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
});

console.log('✓ Navigation module loaded');
