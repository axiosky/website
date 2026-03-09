// ── Scroll animations ─────────────────────────────────────
        const secAnimObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('[data-animate]').forEach(el => secAnimObserver.observe(el));

        // ── Sticky page nav ───────────────────────────────────────
        const secWrapper = document.getElementById('secPageNavWrapper');
        const secNav     = document.getElementById('secPageNav');

        function handleSecNavSticky() {
            const navbar      = document.querySelector('.navbar');
            const navbarBottom = navbar ? navbar.getBoundingClientRect().bottom : 72;
            const wrapperTop  = secWrapper.getBoundingClientRect().top;

            if (wrapperTop <= navbarBottom) {
                secNav.classList.add('is-sticky');
                secNav.style.top = navbarBottom + 'px';
            } else {
                secNav.classList.remove('is-sticky');
                secNav.style.top = '';
            }
        }
        window.addEventListener('scroll', handleSecNavSticky, { passive: true });
        handleSecNavSticky();

        // ── Active link highlight ─────────────────────────────────
        const secSections = document.querySelectorAll('section[id^="sec-"]');
        const secNavLinks = document.querySelectorAll('.sec-page-nav-link');

        const secSectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    secNavLinks.forEach(l => l.classList.remove('active'));
                    const active = document.querySelector(`.sec-page-nav-link[href="#${entry.target.id}"]`);
                    if (active) active.classList.add('active');
                }
            });
        }, { threshold: 0.35 });
        secSections.forEach(s => secSectionObserver.observe(s));

        // ── Smooth scroll with correct offset ────────────────────
        document.querySelectorAll('a[href^="#sec-"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const target = document.querySelector(this.getAttribute('href'));
                if (!target) return;
                e.preventDefault();

                const navbar   = document.querySelector('.navbar');
                const navbarH  = navbar ? navbar.offsetHeight : 72;
                const pageNavH = 60;
                const padding  = 0;
                const totalOffset = navbarH + pageNavH + padding;

                const top = target.getBoundingClientRect().top + window.scrollY - totalOffset;
                window.scrollTo({ top, behavior: 'smooth' });
            });
        });

        // ── Nav scroll arrows ─────────────────────────────────────
        const secNavScroll  = document.getElementById('secPageNavLinks');
        const secArrowLeft  = document.getElementById('secNavArrowLeft');
        const secArrowRight = document.getElementById('secNavArrowRight');
        const secScrollAmt  = 240;

        function updateSecArrows() {
            const atStart = secNavScroll.scrollLeft <= 4;
            const atEnd   = secNavScroll.scrollLeft + secNavScroll.clientWidth >= secNavScroll.scrollWidth - 4;
            secArrowLeft.classList.toggle('hidden', atStart);
            secArrowRight.classList.toggle('hidden', atEnd);
        }
        secArrowLeft.addEventListener('click',  () => secNavScroll.scrollBy({ left: -secScrollAmt, behavior: 'smooth' }));
        secArrowRight.addEventListener('click', () => secNavScroll.scrollBy({ left:  secScrollAmt, behavior: 'smooth' }));
        secNavScroll.addEventListener('scroll', updateSecArrows, { passive: true });
        window.addEventListener('resize', updateSecArrows);
        updateSecArrows();

        

// ── FAQ ───────────────────────────────────────────────────
const faqs = [
    {
        question: "Can we use our own KMS (BYOK)?",
        answer: "Yes. Customer-controlled master keys wrap DEKs. All key operations occur in your KMS with fully auditable API logs."
    },
    {
        question: "What happens if the Governor is unreachable?",
        answer: "Default: fail-closed — Orchestrator blocks all actions and escalates to human review. Fail-open is configurable per workflow with mandatory audit flagging."
    },
    {
        question: "Do audit logs contain PII?",
        answer: "No by default. Pseudonymous identifiers with a separately protected mapping table support GDPR privacy-by-design and right-to-erasure."
    },
    {
        question: "Can we run Axiosky air-gapped?",
        answer: "Yes. Signed packages and release artifacts delivered via secure media with offline signature and integrity verification."
    },
    {
        question: "Are pen test reports public?",
        answer: "No. Executive summaries and detailed findings are shared under NDA with qualified customers and prospects."
    },
    {
        question: "How are policy changes controlled?",
        answer: "CI/CD enforces linting, tests, compliance gates, cryptographic signing, and staged rollouts. Governor validates signatures before loading."
    },
    {
        question: "What security metrics are exposed?",
        answer: "Prometheus metrics: decision outcomes, evaluation latency, escalation rates, auth failures, authorization denials, and audit log write health."
    },
    {
        question: "Can we conduct our own pen testing?",
        answer: "Yes, for on-prem and dedicated environments. Coordinate via security@axiosky.com with defined rules of engagement."
    }
];

const faqContainer = document.getElementById('faq-container');

function renderFAQs() {
    if (!faqContainer) return;
    faqs.forEach((faq) => {
        const faqItem = document.createElement('div');
        faqItem.className = 'faq-item group border-b border-white/10 transition-colors duration-500';

        faqItem.innerHTML = `
            <button class="w-full py-8 flex items-center justify-between text-left transition-all">
                <span class="faq-question-text text-xl md:text-2xl font-light tracking-tight transition-all duration-500 text-[#888888] group-hover:text-slate-300">
                    ${faq.question}
                </span>
                <svg class="chevron text-slate-600 transition-all duration-500 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
            <div class="faq-answer">
                <div class="pb-10 text-slate-400 text-lg leading-relaxed font-light w-full">
                    ${faq.answer}
                </div>
            </div>
        `;

        const button = faqItem.querySelector('button');
        button.addEventListener('click', () => {
            const isActive = faqItem.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));
            if (!isActive) faqItem.classList.add('active');
            button.blur();
        });

        faqContainer.appendChild(faqItem);
    });
}

renderFAQs();
