/* ========================================
   AXIOSKY MAIN - MAIN.JS
   Global utilities, smooth scroll, initialization
   ======================================== */

// ===== SMOOTH SCROLL BEHAVIOR =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    
    // Skip if it's just "#" or empty
    if (href === '#' || href === '') {
      return;
    }

    // Skip sec- page nav links — handled by security page script
    if (href.startsWith('#sec-')) {
      return;
    }

    e.preventDefault();
    
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});


// ===== BUTTON RIPPLE EFFECT (optional) =====
document.querySelectorAll('.btn').forEach(button => {
  button.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');

    // Optional: add ripple CSS class styling if desired
    // For now, this is a foundation for future enhancement
  });
});

// ===== SCROLL ANIMATIONS (Intersection Observer) =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
    }
  });
}, observerOptions);

// Observe cards for animation
document.querySelectorAll('.problem-card, .approach-card, .feature-card, .who-card, .difference-item, .proof-item').forEach(el => {
  observer.observe(el);
});

// ===== LOGGER (for debugging) =====
console.log('✓ Axiosky website initialized');
console.log('✓ Smooth scroll: active');
console.log('✓ Intersection observer: active');

// ===== GLOBAL UTILITIES =====

// Simple debounce function
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Scroll to top utility
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Scroll direction responsive scrollbar
let scrollDirection = 0;
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;
  
  if (currentScrollY > lastScrollY) {
    // Scrolling down - water flows down
    document.documentElement.style.setProperty('--scroll-direction', 'down');
  } else {
    // Scrolling up - water flows up
    document.documentElement.style.setProperty('--scroll-direction', 'up');
  }
  
  lastScrollY = currentScrollY;
});
