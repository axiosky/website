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

// 1. Create a variable to track if we are currently clicking/scrolling
let isManualScrolling = false; 

const secNavLinks = document.querySelectorAll('.sec-page-nav-link');
const secSections = document.querySelectorAll('section[id^="pe-"]');

// 2. Updated Observer with the "Guard"
const secSectionObserver = new IntersectionObserver((entries) => {
    // If we are scrolling because of a click, IGNORE the observer
    if (isManualScrolling) return;

    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            const activeLink = document.querySelector(`.sec-page-nav-link[href="#${id}"]`);
            
            if (activeLink) {
                secNavLinks.forEach(l => l.classList.remove('active'));
                activeLink.classList.add('active');
            }
        }
    });
}, { 
    // This looks for the section when it hits the top 25% of the screen
    rootMargin: '-25% 0px -70% 0px',
    threshold: 0 
});

secSections.forEach(s => secSectionObserver.observe(s));

// 3. Updated Click Handler
document.querySelectorAll('a[href^="#pe-"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Turn ON the guard
        isManualScrolling = true;

        // Immediately highlight the one we clicked
        secNavLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');

        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;

        const navbarH = document.querySelector('.navbar')?.offsetHeight || 72;
        const pageNavH = 60; 
        const padding = 32;
        const totalOffset = navbarH + pageNavH + padding;
        const top = target.getBoundingClientRect().top + window.scrollY - totalOffset;

        window.scrollTo({ top, behavior: 'smooth' });

        // Turn OFF the guard after the scroll finishes (approx 1 second)
        // This allows the Observer to take over again for normal scrolling
        setTimeout(() => {
            isManualScrolling = false;
        }, 1000); 
    });
});   

// ── Tabs (regulatory examples) ──────────────────────────────
document.querySelectorAll('.pe-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.pe-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.pe-tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = document.getElementById(`pe-tab-${tab}`);
        if (panel) panel.classList.add('active');
    });
});

// ── FAQ data ────────────────────────────────────────────────
const peFaqData = [
    {
      question: "How can we trust that policy code correctly implements regulations?",
      answer:
        "Trust comes from process and evidence, not from blind faith in code. Governance engineers workshop with your legal and compliance teams to extract enforceable requirements and document interpretations. Legal and compliance review the policy code (DSL is readable; Python and Rego include inline citations). Compliance provides scenarios that become unit and regression tests which must pass before promotion. Policies then run in shadow mode so you can review would-have decisions before they enforce. The question becomes: do you trust the documented, auditable process that produced the code?",
    },
    {
      question: "Who is responsible for policy accuracy — us or Axiosky?",
      answer:
        "You own the policy decisions and interpretations. Axiosky provides the tooling, translation methodology, and governance engineering expertise. Your legal and compliance teams certify the policy code before production, and policy repositories live in a repo you control. Axiosky can help with translation and customization, but authority and accountability for the final policy logic remain with your organization.",
    },
    {
      question:
        "What happens when our interpretation is challenged by auditors or regulators?",
      answer:
        "Policy-as-Code makes your interpretation explicit, auditable, and revisable. You retain legal opinions, certification packets, exact policy code, and test evidence that show how you interpreted and enforced each requirement. If interpretation changes, you update the code, add tests, and redeploy. Future decisions follow the new interpretation while historical decisions remain traceable to the version that was in force at that time. Reviews move from “we think we complied” to “here is concrete evidence of how we interpreted and enforced the rule.”",
    },
    {
      question:
        "Regulations use ambiguous terms like “reasonable” or “sufficient”. How can code handle that?",
      answer:
        "Ambiguity already gets resolved informally in your organization; Policy-as-Code simply makes that operational definition explicit and consistent. Together with legal and compliance, you define what “reasonable” means in concrete checks, thresholds, or workflows, then encode that logic and its rationale. That definition is documented, version-controlled, and revisable if guidance changes. The benefit is a single, auditable organizational interpretation that is applied uniformly by code instead of ad hoc human judgment.",
    },
    {
      question: "We operate in multiple jurisdictions. Can policies handle that?",
      answer:
        "Yes. Policies can be jurisdiction-aware in several ways. One approach is to maintain separate per-jurisdiction modules (for example EU, UK, CA, BR) with their own tests and certifications. Another is unified policies with explicit jurisdiction branches based on context. Decision records capture which jurisdictional rule set was applied, so auditors can see how locality requirements were enforced on a per-decision basis. Tests can simulate decisions across jurisdictions before changes go live.",
    },
    {
      question:
        "How do we handle exceptions and emergencies where overrides are needed?",
      answer:
        "Exceptions are supported, but structured. Emergency provisions can be encoded directly in policy, for example an emergency flag path that returns APPROVEWITHAUDIT with extra traceability. Human override flows require approver identity, rationale, and are fully logged. Break-glass modes can temporarily relax enforcement under authority from a designated executive, with time bounds and mandatory post-event review. The result is rapid response when needed, without losing control or visibility over exceptional decisions.",
    },
    {
      question: "What if we disagree with your template interpretation?",
      answer:
        "Templates are starting points, not mandates. You review the template logic, adjust thresholds, add or remove checks, and document your own interpretation and rationale. Your legal and compliance teams then certify the adapted policies. You own the repository, commits, and approvals. Axiosky supplies accelerators and governance engineering support, but your organization controls the final policy behavior and the evidence presented to auditors.",
    },
    {
      question: "How do we keep policies updated when regulations change?",
      answer:
        "There are multiple update models depending on your risk appetite and internal capacity. Your teams can self-manage changes using the same Git and CI/CD workflow — updating code, adding tests, and pushing through certification gates. Alternatively, Axiosky can monitor relevant regulatory changes, provide impact analysis and suggested patches, or operate as a full-service partner drafting updates you review and approve. In all models, changes pass through the same pipelines: analysis, code changes, tests, shadow mode, certification, and controlled rollout.",
    },
    {
      question: "Can we audit the policy code ourselves?",
      answer:
        "Yes. Policy code lives in repositories you control and is readable and exportable. The DSL is designed so compliance and legal teams can understand rules without being software engineers. Python and Rego policies include inline citations and documentation. You can run tests locally, export artifacts for external auditors, or hand code to third-party reviewers. There is no black box: your compliance logic remains your intellectual property.",
    },
  ];

// ── FAQ render ──────────────────────────────────────────────
function renderPeFaqs() {
    const container = document.getElementById('pe-faq-container');
    if (!container) return;

    container.innerHTML = peFaqData.map((item, i) => `
        <div class="pe-faq-item" id="pe-faq-${i}">
            <button aria-expanded="false" aria-controls="pe-faq-answer-${i}">
                <span class="pe-faq-question">${item.question}</span>
                <svg class="pe-faq-chevron" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="1.5"
                     stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>
            <div class="pe-faq-answer" id="pe-faq-answer-${i}" role="region">
                <div class="pe-faq-answer-inner">${item.answer}</div>
            </div>
        </div>
    `).join('');

    // Attach toggle listeners
    container.querySelectorAll('.pe-faq-item button').forEach(btn => {
        btn.addEventListener('click', () => {
            const item     = btn.closest('.pe-faq-item');
            const isOpen   = item.classList.contains('active');

            // Close all
            container.querySelectorAll('.pe-faq-item').forEach(el => {
                el.classList.remove('active');
                el.querySelector('button').setAttribute('aria-expanded', 'false');
            });

            // Open clicked (if was closed)
            if (!isOpen) {
                item.classList.add('active');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });
}

renderPeFaqs();

// ── Policy Engine Flow Animation ──────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('sim-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        const dpr  = window.devicePixelRatio || 1;
        canvas.width  = rect.width  * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width  = rect.width  + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    function lw() { return parseFloat(canvas.style.width);  }
    function lh() { return parseFloat(canvas.style.height); }

    const C = {
        reg: '#666', engine: '#8b5cf6', governor: '#10b981',
        approve: '#10b981', block: '#ef4444', escalate: '#f59e0b',
        audit: '#6366f1', extract: '#fff', code: '#8b5cf6',
        tests: '#14b8a6', signoff: '#f59e0b', compiled: '#10b981',
    };

    const REG_LABELS = ['GDPR', 'SOX', 'FAR', 'HIPAA'];

    function getLayout(w, h) {
        const isMobile = w < 480;  // 330, 380, 480 all use same layout

        const cx     = w * (isMobile ? 0.36 : 0.36);
        const cy     = h * (isMobile ? 0.48 : 0.48);
        const govX   = w * (isMobile ? 0.62 : 0.62);
        const govY   = cy;

        const regX    = w * 0.08;
        const regSpan = h * (isMobile ? 0.50 : 0.52);
        const regStart = cy - regSpan / 2;
        const regs = REG_LABELS.map((l, i) => ({
            x: regX,
            y: regStart + i * (regSpan / (REG_LABELS.length - 1)),
            label: l,
        }));

        const outX    = w * 0.88;
        const engineR = isMobile ? 38 : 44;
        const govR    = isMobile ? 28 : 34;
        const vSpread = isMobile ? 0.22 : 0.24;

        return {
            cx, cy, govX, govY, regs, engineR, govR,
            outcomes: [
                { x: outX, y: cy - h * vSpread, label: 'APPROVE',  color: C.approve  },
                { x: outX, y: cy,               label: 'BLOCK',    color: C.block    },
                { x: outX, y: cy + h * vSpread, label: 'ESCALATE', color: C.escalate },
            ],
            auditX: w * 0.60,
            auditY: h * (w < 480 ? 0.78 : 0.88),
        };
    }

    function drawLine(x1, y1, x2, y2, color = 'rgba(255,255,255,0.07)') {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth   = 1;
        ctx.stroke();
    }

    function drawNode(x, y, r, borderColor, label, sublabel) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle   = '#0c0c0c';
        ctx.fill();
        ctx.strokeStyle = borderColor;
        ctx.lineWidth   = 1.5;
        ctx.stroke();

        // Scale font to fit inside circle: diameter = 2r, leave 8px padding each side
        const maxTextW  = r * 2 - 10;
        // Pick font size so label fits: start at 10px, shrink if needed
        let fontSize = Math.min(10, Math.max(6, Math.floor(maxTextW / (label.length * 0.62))));
        ctx.fillStyle = borderColor;
        ctx.font      = `600 ${fontSize}px "IBM Plex Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(label, x, y + (sublabel ? -3 : 4));
        if (sublabel) {
            const subSize = Math.max(5, fontSize - 2);
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            ctx.font      = `400 ${subSize}px "IBM Plex Mono", monospace`;
            ctx.fillText(sublabel, x, y + fontSize + 2);
        }
    }

    function drawBox(x, y, w, h, color, label) {
        ctx.fillStyle   = '#0c0c0c';
        ctx.strokeStyle = color;
        ctx.lineWidth   = 1.2;
        ctx.fillRect(x - w/2, y - h/2, w, h);
        ctx.strokeRect(x - w/2, y - h/2, w, h);
        ctx.fillStyle = color;
        ctx.font      = '600 9px "IBM Plex Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, y + 4);
    }

    class Packet {
        constructor(regIndex, regs, cx, cy, engineR = 44) {
            this.x     = regs[regIndex].x;
            this.y     = regs[regIndex].y;
            this.state = 'TO_ENGINE';
            this.speed = 2.0 + Math.random() * 0.6;
            this.r     = 3.5;
            this.color = C.extract;
            this.opacity = 1;
            this.wait  = 0;
            this.done  = false;
            this.remove = false;
            this.orbitAngle  = Math.random() * Math.PI * 2;
            this.orbitRadius = 0;
            this.engineR     = engineR;
            this.orbitTarget = engineR + 10;
            this.orbitStage  = 0;
            this.orbitTick   = 0;
            this.orbitDurations = [20, 22, 20, 18];
            this.decision  = null;
            this.targetX   = 0;
            this.targetY   = 0;
        }

        moveTo(tx, ty) {
            const dx   = tx - this.x;
            const dy   = ty - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 4) return true;
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
            return false;
        }

        update(L) {
            if (this.remove) return;
            if (this.wait > 0) { this.wait--; return; }
            const { cx, cy, govX, govY, outcomes, auditX, auditY } = L;
            if (this.state === 'TO_ENGINE') {
                if (this.moveTo(cx, cy)) {
                    this.state = 'ORBIT';
                    this.orbitAngle = Math.random() * Math.PI * 2;
                    this.wait = 5;
                }
            } else if (this.state === 'ORBIT') {
                const stageCols = [C.extract, C.code, C.tests, C.signoff, C.compiled];
                this.color = stageCols[Math.min(this.orbitStage, stageCols.length - 1)];
                this.orbitRadius += (this.orbitTarget - this.orbitRadius) * 0.12;
                this.orbitAngle  += 0.045;
                this.x = cx + Math.cos(this.orbitAngle) * this.orbitRadius;
                this.y = cy + Math.sin(this.orbitAngle) * this.orbitRadius;
                this.orbitTick++;
                if (this.orbitStage < this.orbitDurations.length) {
                    if (this.orbitTick >= this.orbitDurations[this.orbitStage]) {
                        this.orbitStage++;
                        this.orbitTick = 0;
                    }
                } else {
    // Stages done — start steering toward exit
    this.state = 'ORBIT_EXIT';
    this.color = C.compiled;
}
} else if (this.state === 'ORBIT_EXIT') {
    const exitAngle = Math.atan2(govY - cy, govX - cx);

    // Normalize difference to [-π, π]
    let diff = exitAngle - this.orbitAngle;
    while (diff >  Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;

    if (Math.abs(diff) < 0.07) {
        // Aligned — exit from circle edge onto the line
        this.x     = cx + Math.cos(exitAngle) * this.engineR;
        this.y     = cy + Math.sin(exitAngle) * this.engineR;
        this.state = 'TO_GOVERNOR';
        this.wait  = 4;
    } else {
        // Keep orbiting toward the exit angle
        this.orbitAngle += 0.045;
        this.x = cx + Math.cos(this.orbitAngle) * this.orbitRadius;
        this.y = cy + Math.sin(this.orbitAngle) * this.orbitRadius;
    }


            } else if (this.state === 'TO_GOVERNOR') {
                if (this.moveTo(govX, govY)) {
                    const r = Math.random();
                    if (r < 0.55) this.decision = 0;
                    else if (r < 0.80) this.decision = 2;
                    else this.decision = 1;
                    const out = outcomes[this.decision];
                    this.targetX = out.x;
                    this.targetY = out.y;
                    this.color   = out.color;
                    this.state   = 'TO_OUTCOME';
                    this.wait    = 10;
                }
            } else if (this.state === 'TO_OUTCOME') {
                if (this.moveTo(this.targetX, this.targetY)) {
                    this.state = 'TO_AUDIT';
                    this.wait  = 12;
                }
            } else if (this.state === 'TO_AUDIT') {
                if (this.moveTo(auditX, auditY)) {
                    this.state = 'DONE';
                    this.wait  = 10;
                }
            } else if (this.state === 'DONE') {
                this.opacity -= 0.05;
                if (this.opacity <= 0) this.remove = true;
            }
        }

        draw() {
            if (this.remove) return;
            ctx.save();
            ctx.globalAlpha  = this.opacity;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle    = this.color;
            ctx.shadowBlur   = 5;
            ctx.shadowColor  = this.color;
            ctx.fill();
            ctx.restore();
        }
    }

    const packets = [];
    let spawnIdx  = 0;
    function spawnPacket() {
    if (packets.length >= 12) return; // never more than 12 at once
    const w = lw(), h = lh();
    const L = getLayout(w, h);
    const i = spawnIdx % REG_LABELS.length;
    packets.push(new Packet(i, L.regs, L.cx, L.cy, L.engineR));
    spawnIdx++;
}


    for (let i = 0; i < REG_LABELS.length; i++) {
        const w = lw(), h = lh();
        const L = getLayout(w, h);
        const p = new Packet(i, L.regs, L.cx, L.cy, L.engineR);
        p.wait  = i * 14;
        packets.push(p);
    }
    let spawnInterval = setInterval(spawnPacket, 1400);

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Tab hidden — stop spawning
        clearInterval(spawnInterval);
    } else {
        // Tab visible again — clear excess packets, restart clean
        packets.length = 0;
        spawnIdx = 0;
        // Re-seed
        for (let i = 0; i < REG_LABELS.length; i++) {
            const w = lw(), h = lh();
            const L = getLayout(w, h);
            const p = new Packet(i, L.regs, L.cx, L.cy, L.engineR);
            p.wait = i * 14;
            packets.push(p);
        }
        spawnInterval = setInterval(spawnPacket, 1400);
    }
});

    const STAGES = [
        { color: C.extract,  label: 'Extraction' },
        { color: C.code,     label: 'Code' },
        { color: C.tests,    label: 'Tests' },
        { color: C.signoff,  label: 'Sign-off' },
        { color: C.compiled, label: 'Compiled' },
    ];

    function drawLegend(w, h) {
        const fSize = 9;
        const dotR  = 3;
        ctx.font = `400 ${fSize}px "IBM Plex Mono", monospace`;

        if (w < 480) {
            // Horizontal row at bottom with gap from diagram
            const colW = w / STAGES.length;
            const dotY = h - 24;
            const lblY = h - 10;
            ctx.textAlign = 'center';
            STAGES.forEach((s, i) => {
                const cx = colW * i + colW / 2;
                ctx.beginPath();
                ctx.arc(cx, dotY, dotR, 0, Math.PI * 2);
                ctx.fillStyle = s.color;
                ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.35)';
                ctx.fillText(s.label, cx, lblY);
            });
        } else {
            // Vertical stack on the left
            const rowH   = 16;
            const startX = 14;
            const startY = h - 10 - STAGES.length * rowH;
            ctx.textAlign = 'left';
            STAGES.forEach((s, i) => {
                const y = startY + i * rowH;
                ctx.beginPath();
                ctx.arc(startX, y, dotR, 0, Math.PI * 2);
                ctx.fillStyle = s.color;
                ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.35)';
                ctx.fillText(s.label, startX + dotR + 6, y + 3);
            });
        }
    }

    function animate() {
        ctx.clearRect(0, 0, lw(), lh());
        const w = lw(), h = lh();
        const L = getLayout(w, h);
        const { cx, cy, govX, govY, regs, outcomes, auditX, auditY } = L;

        regs.forEach(r => drawLine(r.x, r.y, cx, cy));
        drawLine(cx, cy, govX, govY);
        outcomes.forEach(o => drawLine(govX, govY, o.x, o.y));
        outcomes.forEach(o => drawLine(o.x, o.y, auditX, auditY));

        ctx.beginPath();
        ctx.arc(cx, cy, L.engineR + 10, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(139,92,246,0.1)';
        ctx.stroke();

        regs.forEach(r => {
            ctx.beginPath();
            ctx.arc(r.x, r.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = C.reg;
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.22)';
            ctx.font = '400 9px "IBM Plex Mono", monospace';
            ctx.textAlign = 'left';
            ctx.fillText(r.label, r.x + 9, r.y + 3);
        });

        drawNode(cx, cy, L.engineR, C.engine, 'POLICY ENGINE', 'policy-as-code');
        drawNode(govX, govY, L.govR, C.governor, 'GOVERNOR', null);
        outcomes.forEach(o => drawBox(o.x, o.y, 58, 24, o.color, o.label));
        drawBox(auditX, auditY, 70, 24, C.audit, 'AUDIT LOG');

        for (let i = packets.length - 1; i >= 0; i--) {
            packets[i].update(L);
            packets[i].draw();
            if (packets[i].remove) packets.splice(i, 1);
        }
        drawLegend(w, h);
        requestAnimationFrame(animate);
    }
    animate();
});

// Ensure the first link is active if we're at the top on load
if (window.scrollY < 100) {
    const firstLink = document.querySelector('.sec-page-nav-link');
    if (firstLink) firstLink.classList.add('active');
}