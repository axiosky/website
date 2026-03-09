// cookie-banner.js — add <script src="/js/cookie-banner.js"></script>
// before </body> on every page. Pair with the CSS below in main.css.

(function () {
  const STORAGE_KEY = 'axiosky_cookie_consent';
  if (localStorage.getItem(STORAGE_KEY)) return; // already decided

  // Build banner
  const banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-live', 'polite');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML = `
    <div class="cb-inner">
      <p class="cb-text">
        We use essential cookies to keep the site working. With your consent we
        also use analytics cookies to understand how visitors use axiosky.com.
        See our <a href="pages/legal/cookies.html">Cookie Policy</a>.
      </p>
      <div class="cb-actions">
        <button class="cb-btn cb-accept" id="cbAccept">Accept All</button>
        <button class="cb-btn cb-essential" id="cbEssential">Essential Only</button>
      </div>
    </div>`;
  document.body.appendChild(banner);

  function dismiss(choice) {
    localStorage.setItem(STORAGE_KEY, choice);   // 'all' or 'essential'
    banner.classList.add('cb-hide');
    setTimeout(() => banner.remove(), 400);
    // Fire a custom event so analytics scripts can listen
    document.dispatchEvent(new CustomEvent('cookieConsent', { detail: { choice } }));
  }

  document.getElementById('cbAccept').addEventListener('click', () => dismiss('all'));
  document.getElementById('cbEssential').addEventListener('click', () => dismiss('essential'));
})();