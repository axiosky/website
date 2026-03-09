document.addEventListener('DOMContentLoaded', () => {

// ============================================================
// GOVERNOR HERO CANVAS ANIMATION
// ============================================================
const canvas = document.getElementById('sim-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    window.addEventListener('resize', () => {
        resizeCanvas();
        packets.length = 0;
    });
    resizeCanvas();

    const colors = {
        agent: '#888',
        governor: '#10b981',
        policy: '#fff',
        approved: '#10b981',
        rejected: '#ef4444',
        escalated: '#f59e0b',
        audit: '#6366f1'
    };

    function getLayout(w, h) {
    const isMobile = w < 500;
    if (isMobile) {
    return {
        isMobile: true,
        agents: [
            { x: 24, y: h * 0.28 },
            { x: 24, y: h * 0.40 },
            { x: 24, y: h * 0.52 },
            { x: 24, y: h * 0.64 }
        ],
        // Governor dead center
        govX: w * 0.50, govY: h * 0.50, govR: 32,
        // Policy Engine directly above Governor — same x, straight vertical
        policyX: w * 0.50, policyY: h * 0.13, policyW: 84, policyH: 40,
        // Outcomes on far right — mirror of agents on left
        blockX: w * 0.88, blockY: h * 0.30,
        execX:  w * 0.88, execY:  h * 0.50,
        escX:   w * 0.88, escY:   h * 0.70,
        // Audit Log bottom center — same x as Governor
        auditX: w * 0.50, auditY: h * 0.88,
        auditW: 96, auditH: 32,
        outcomeW: 64, outcomeH: 28,
        fontSize: '9px'
    };
}
 
    else {
        return {
            isMobile: false,
            agents: [
                { x: 60, y: h * 0.20 },
                { x: 60, y: h * 0.37 },
                { x: 60, y: h * 0.54 },
                { x: 60, y: h * 0.71 }
            ],
            govX: w * 0.35, govY: h * 0.52, govR: 35,
            // Policy Engine clearly above Governor — same x, high y
            policyX: w * 0.35, policyY: h * 0.10, policyW: 100, policyH: 50,
            // Outcomes on far right
            blockX: w * 0.82, blockY: h * 0.25,
            execX:  w * 0.82, execY:  h * 0.50,
            escX:   w * 0.82, escY:   h * 0.75,
            // Audit Log bottom right-center
            auditX: w * 0.60, auditY: h * 0.92,
            auditW: 120, auditH: 44,
            outcomeW: 68, outcomeH: 36,
            fontSize: '11px'
        };
    }
}


    class Packet {
        constructor(startX, startY) {
            this.x = startX;
            this.y = startY;
            this.state = 'TO_GOV';
            this.speed = 2.2;
            this.r = 4;
            this.color = '#fff';
            this.wait = 0;
            this.evalTime = 0;
            this.decision = null;
            this.targetX = 0;
            this.targetY = 0;
        }
        moveTo(tx, ty) {
            const dx = tx - this.x;
            const dy = ty - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 5) return true;
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
            return false;
        }
        update(L) {
            if (this.wait > 0) { this.wait--; return; }
            if (this.state === 'TO_GOV') {
                if (this.moveTo(L.govX, L.govY)) { this.state = 'TO_POLICY'; this.wait = 5; }
            } else if (this.state === 'TO_POLICY') {
                if (this.moveTo(L.policyX, L.policyY)) {
                    this.state = 'EVALUATING';
                    this.evalTime = 40 + Math.floor(Math.random() * 30);
                }
            } else if (this.state === 'EVALUATING') {
                if (this.evalTime > 0) {
                    this.evalTime--;
                } else {
                    const rand = Math.random();
                    if (rand < 0.55) {
                        this.decision = 'APPROVED';
                        this.color = colors.approved;
                        this.targetX = L.execX; this.targetY = L.execY;
                    } else if (rand < 0.80) {
                        this.decision = 'ESCALATED';
                        this.color = colors.escalated;
                        this.targetX = L.escX; this.targetY = L.escY;
                    } else {
                        this.decision = 'REJECTED';
                        this.color = colors.rejected;
                        this.targetX = L.blockX; this.targetY = L.blockY;
                    }
                    this.state = 'TO_GOV_RETURN';
                    this.wait = 5;
                }
            } else if (this.state === 'TO_GOV_RETURN') {
                if (this.moveTo(L.govX, L.govY)) { this.state = 'TO_DECISION'; this.wait = 5; }
            } else if (this.state === 'TO_DECISION') {
                if (this.moveTo(this.targetX, this.targetY)) { this.state = 'TO_AUDIT'; this.wait = 10; }
            } else if (this.state === 'TO_AUDIT') {
                if (this.moveTo(L.auditX, L.auditY)) { this.state = 'DONE'; this.wait = 15; }
            } else if (this.state === 'DONE') {
                this.remove = true;
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    const packets = [];
    let spawnIndex = 0;

    function spawnGovPacket() {
        if (packets.length >= 8) return;
        const L = getLayout(canvas.width, canvas.height);
        const agent = L.agents[spawnIndex % L.agents.length];
        packets.push(new Packet(agent.x, agent.y));
        spawnIndex++;
    }

    let govSpawnInterval = setInterval(spawnGovPacket, 1400);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(govSpawnInterval);
        } else {
            packets.length = 0;
            spawnIndex = 0;
            govSpawnInterval = setInterval(spawnGovPacket, 1400);
        }
    });

    function drawBox(x, y, w, h, strokeColor, label1, label2) {
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(x - w / 2, y - h / 2, w, h);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x - w / 2, y - h / 2, w, h);
        ctx.fillStyle = strokeColor;
        if (label2) {
            ctx.fillText(label1, x, y - 5);
            ctx.fillText(label2, x, y + 10);
        } else {
            ctx.fillText(label1, x, y + 4);
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const w = canvas.width;
        const h = canvas.height;
        const L = getLayout(w, h);

        ctx.font = `${L.fontSize} 'Inter', sans-serif`;
        ctx.textAlign = 'center';

        // Connection lines
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;

        L.agents.forEach(a => {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(L.govX, L.govY);
            ctx.stroke();
        });

        ctx.beginPath();
        ctx.moveTo(L.govX, L.govY);
        ctx.lineTo(L.policyX, L.policyY);
        ctx.stroke();

        [[L.blockX, L.blockY], [L.execX, L.execY], [L.escX, L.escY]].forEach(([ox, oy]) => {
            ctx.beginPath(); ctx.moveTo(L.govX, L.govY); ctx.lineTo(ox, oy); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(L.auditX, L.auditY); ctx.stroke();
        });

        // Agent dots
        L.agents.forEach(a => {
            ctx.beginPath();
            ctx.arc(a.x, a.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = colors.agent;
            ctx.fill();
        });

        // Governor circle
        ctx.beginPath();
        ctx.arc(L.govX, L.govY, L.govR, 0, Math.PI * 2);
        ctx.fillStyle = '#0a0a0a';
        ctx.fill();
        ctx.strokeStyle = colors.governor;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = colors.governor;
        ctx.fillText('GOVERNOR', L.govX, L.govY + 4);

        // Boxes
        drawBox(L.policyX, L.policyY, L.policyW, L.policyH, colors.policy,   'POLICY',   'ENGINE');
        drawBox(L.blockX,  L.blockY,  L.outcomeW, L.outcomeH, colors.rejected,  'BLOCK',    null);
        drawBox(L.execX,   L.execY,   L.outcomeW, L.outcomeH, colors.approved,  'EXECUTE',  null);
        drawBox(L.escX,    L.escY,    L.outcomeW, L.outcomeH, colors.escalated, 'ESCALATE', null);
        drawBox(L.auditX,  L.auditY,  L.auditW,   L.auditH,   colors.audit,     'AUDIT LOG', null);

        // Packets
        for (let i = packets.length - 1; i >= 0; i--) {
            packets[i].update(L);
            packets[i].draw();
            if (packets[i].remove) packets.splice(i, 1);
        }

        requestAnimationFrame(animate);
    }

    animate();
}

// --- 1. SCENARIO SWITCHER ---
const radios = document.querySelectorAll('input[name="scenario"]');
const containers = {
    approve:  document.getElementById('scenario-approve'),
    escalate: document.getElementById('scenario-escalate'),
    block:    document.getElementById('scenario-block')
};

function showScenario(value) {
    Object.values(containers).forEach(c => {
        if (c) { c.classList.remove('active'); c.style.opacity = '0'; }
    });
    if (containers[value]) {
        containers[value].classList.add('active');
        setTimeout(() => { containers[value].style.opacity = '1'; }, 50);
    }
}

radios.forEach(radio => {
    radio.addEventListener('change', () => showScenario(radio.value));
});
showScenario('approve');

// --- 2. PACKET ANIMATION CORE ---
function createPacket(trackId, type) {
    const track = document.getElementById(trackId);
    if (!track) return;
    const packet = document.createElement('div');
    packet.className = 'packet';
    if (type === 'gov') {
        packet.style.background = '#10b981';
        packet.style.boxShadow = '0 0 15px #10b981';
    }
    track.appendChild(packet);
    const trackWidth = track.offsetWidth;
    const speed = 2.5;
    const padding = 20;
    let pos = padding;

    requestAnimationFrame(() => { packet.style.opacity = '1'; });

    function animate() {
        pos += speed;
        packet.style.left = pos + 'px';
        const currentPerc = (pos / trackWidth) * 100;

        if (currentPerc > 90) packet.style.opacity = '0';

        if (type === 'mon' && currentPerc > 55 && !packet.dataset.alerted) {
            packet.dataset.alerted = true;
            showToast(track, pos, 'LOSS DETECTED (LATE)', 'bg-red-500');
        }

        if (type === 'guard' && currentPerc > 50 && !packet.dataset.alerted) {
            packet.dataset.alerted = true;
            if (Math.random() > 0.5) {
                const gate = document.getElementById('gate-guardrail');
                if (gate) { gate.classList.add('danger-gate'); setTimeout(() => gate.classList.remove('danger-gate'), 300); }
                showToast(track, pos, 'PROBABILISTIC MISS', 'bg-amber-500');
            } else {
                packet.style.opacity = '0';
                setTimeout(() => packet.remove(), 400);
                return;
            }
        }

        if (type === 'gov' && currentPerc >= 48 && !packet.dataset.stopped) {
            packet.dataset.stopped = true;
            pos = trackWidth * 0.48;
            packet.style.left = pos + 'px';
            const scanner = document.getElementById('gov-scanner');
            if (scanner) scanner.classList.add('active');
            setTimeout(() => {
                const isApproved = Math.random() < 0.7;
                if (isApproved) {
                    showToast(track, pos, 'DETERMINISTIC: APPROVED', 'bg-emerald-500');
                    if (scanner) scanner.classList.remove('active');
                    requestAnimationFrame(animateAfterApproval);
                } else {
                    showToast(track, pos, 'DETERMINISTIC: BLOCKED', 'bg-red-500');
                    packet.style.background = '#ef4444';
                    packet.style.boxShadow = '0 0 15px #ef4444';
                    setTimeout(() => {
                        packet.style.opacity = '0';
                        if (scanner) scanner.classList.remove('active');
                        setTimeout(() => packet.remove(), 500);
                    }, 800);
                }
            }, 1200);

            function animateAfterApproval() {
                pos += speed;
                packet.style.left = pos + 'px';
                if ((pos / trackWidth) * 100 > 90) packet.style.opacity = '0';
                if (pos < trackWidth - padding) { requestAnimationFrame(animateAfterApproval); }
                else { packet.remove(); }
            }
            return;
        }

        if (pos < trackWidth - padding) { requestAnimationFrame(animate); }
        else { packet.remove(); }
    }

    requestAnimationFrame(animate);
}

// --- 3. TOAST NOTIFICATIONS ---
function showToast(parent, x, text, color) {
    const toast = document.createElement('div');
    toast.className = `alert-toast ${color} text-white`;
    toast.innerText = text;
    toast.style.left = x + 'px';
    toast.style.top = '50%';
    parent.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.top = '30%';
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 400);
        }, 1200);
    }, 10);
}

    // --- 4. START THE TRACKS ---
let trackIntervals = [
    setInterval(() => createPacket('track-monitoring', 'mon'), 4000),
    setInterval(() => createPacket('track-guardrails', 'guard'), 5500),
    setInterval(() => createPacket('track-governor', 'gov'), 3500),
];

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        trackIntervals.forEach(id => clearInterval(id));
    } else {
        trackIntervals = [
            setInterval(() => createPacket('track-monitoring', 'mon'), 4000),
            setInterval(() => createPacket('track-guardrails', 'guard'), 5500),
            setInterval(() => createPacket('track-governor', 'gov'), 3500),
        ];
    }
});

    // --- 5. LOG SIMULATION ---
    const logData = [
        { t: "> AGENT_PROPOSAL: initiateRTGSTransfer", c: "" },
            { t: "  amount: \u20B947,50,000", c: "" },
            { t: "  recipient: VendorID_8472", c: "" },
            { t: "  user: FinanceManager-RahulVerma", c: "" },
            { t: "------------------------------------------", c: "log-dim" },
            { t: "[GOVERNOR] Intercepting action...", c: "log-cyan" },
            { t: "[GOVERNOR] Context: User Auth=VALID, Vendor Status=VERIFIED", c: "log-dim" },
            { t: "[GOVERNOR] Loading Policy: FinancialControls_v2.3.1", c: "log-dim" },
            { t: "Executing deterministic ruleset...", c: "" },
            { t: "RULE 1: Amount Threshold Check......... [PASS]", c: "log-cyan" },
            { t: "RULE 2: Dual Authorization Required.... [FAIL]", c: "log-yellow" },
            { t: "  Reason: Amount >\u20B925,00,000 requires CFO approval.", c: "log-dim" },
            { t: "RULE 3: Vendor Verification............ [PASS]", c: "log-cyan" },
            { t: "RULE 4: Sanctions Screening............ [PASS]", c: "log-cyan" },
            { t: "------------------------------------------", c: "log-dim" },
            { t: "DECISION: ESCALATE", c: "log-yellow" },
            { t: "ACTION: SUSPENDED", c: "log-red" },
            { t: "ESCALATION_ROUTE: CFO_approval_queue", c: "" },
            { t: "Awaiting human review...", c: "log-dim" },
            { t: "... CFO Reviewed Decision: [APPROVED]", c: "log-cyan" },
            { t: "[GOVERNOR] Execution UNLOCKED", c: "log-cyan" },
            { t: "IMMUTABLE_AUDIT_LOG: gov20260309_084512_A3", c: "log-dim" }
    ];

    const logContainer = document.getElementById('log-container');
    let logIndex = 0;

    function runLog() {
        if (!logContainer) return;
        if (logIndex < logData.length) {
            const entry = document.createElement('div');
            entry.className = `log-entry ${logData[logIndex].c}`;
            entry.textContent = logData[logIndex].t;
            logContainer.appendChild(entry);
            logContainer.scrollTop = logContainer.scrollHeight;
            logIndex++;
            setTimeout(runLog, Math.random() * 800 + 400);
        } else {
            setTimeout(() => {
                logContainer.innerHTML = '<div class="log-entry log-dim">> Initializing enforcement listener...</div>';
                logIndex = 0;
                runLog();
            }, 5000);
        }
    }

    const terminal = document.querySelector('.terminal');
    if (terminal) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    runLog();
                    observer.disconnect();
                }
            });
        });
        observer.observe(terminal);
    }
});


const faqs = [
            {
                question: "Won't governance slow down our agents?",
                answer: "Governor is architected for minimal overhead. Most agent latency comes from LLM inference and external API calls, not decision evaluation. The deterministic pipeline is designed to operate in real-time without creating perceptible delays. For latency-sensitive workloads, Governor supports pre-evaluated decision paths and cached approvals."
            },
            {
                question: "What happens if Governor becomes unavailable?",
                answer: "Governor is designed as a resilient control plane with configurable failure behavior. Organizations choose enforcement behavior based on risk tolerance. Options include strict mode (fail-closed), graceful degradation (cached approvals), or failover to secondary instance."
            },
            {
                question: "What policy language does Governor use?",
                answer: "Governor supports multiple policy expression methods: Policy DSL (declarative, similar to Rego/OPA), general-purpose code (Python for custom logic), or existing policy formats. Policies are version-controlled and exportable, allowing organizations to retain governance definitions independently."
            },
            {
                question: "How does Governor handle new or unseen agent actions?",
                answer: "Governor evaluates actions based on attributes and context, not fixed action names. Policies apply to characteristics like data sensitivity, financial thresholds, required approvals, or data classification. New agent capabilities are still governed as long as they exhibit regulated characteristics."
            },
            {
                question: "Can policies be tested before enforcement?",
                answer: "Yes. Governor supports observation mode (policies evaluate without enforcing), incremental rollout (gradual enforcement), and policy comparison (parallel evaluation). This allows teams to validate behavior before full enforcement."
            },
            {
                question: "How do we integrate Governor with our existing systems?",
                answer: "Governor integrates at the orchestration layer between agent frameworks and execution environments. No agent code changes required. Integration points include SDKs for popular agent frameworks, REST APIs, and event-driven patterns via message queues."
            }
        ];

        const container = document.getElementById('faq-container');

        function renderFAQs() {
            faqs.forEach((faq, index) => {
                const faqItem = document.createElement('div');
                faqItem.className = `faq-item group border-b border-white/10 transition-colors duration-500`;
                
                faqItem.innerHTML = `
                    <button class="w-full py-8 flex items-center justify-between text-left transition-all">
                        <span class="faq-question-text text-xl md:text-2xl font-light tracking-tight transition-all duration-500 text-slate-500 group-hover:text-slate-300">
                            ${faq.question}
                        </span>
                        <svg class="chevron text-slate-600 transition-all duration-500 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                button.addEventListener('click', (e) => {
                    const isActive = faqItem.classList.contains('active');
                    
                    // Close all others
                    document.querySelectorAll('.faq-item').forEach(item => item.classList.remove('active'));
                    
                    // Toggle current
                    if (!isActive) {
                        faqItem.classList.add('active');
                    }

                    // Explicitly blur the button after click to shed focus state
                    button.blur();
                });

                container.appendChild(faqItem);
            });
        }

        window.onload = renderFAQs;
/* ── Simple scroll fade-in ── */
(function () {
    function init() {
        // Tag every meaningful content block
        const selectors = [
            '.section-title',
            '.section-subtitle',
            '.tech-card',
            '.arch-node',
            '.definition-card',
            '.faq-item',
            '.terminal',
            '.bl-cta-inner',
            '.section-capabilities .capabilities-grid',
            '.section-problem-governance .space-y-3',
            '.section-integration .arch-visual-horizontal'
        ];

        selectors.forEach(function(sel) {
            document.querySelectorAll(sel).forEach(function(el) {
                el.classList.add('gov-fade');
            });
        });

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('gov-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.gov-fade').forEach(function(el) {
            observer.observe(el);
        });

        // Also watch for FAQ items added dynamically
        var faqContainer = document.getElementById('faq-container');
        if (faqContainer) {
            var mutObs = new MutationObserver(function() {
                faqContainer.querySelectorAll('.faq-item:not(.gov-fade)').forEach(function(el) {
                    el.classList.add('gov-fade');
                    observer.observe(el);
                });
            });
            mutObs.observe(faqContainer, { childList: true });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();