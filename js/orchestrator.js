document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('sim-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const agents = [];
    const packets = [];

    const colors = {
        agent: '#888',
        orch: '#fff',
        gov: '#00ff9d',
        sys: '#61afef',
        packet: '#fff'
    };

    function initAgents() {
        agents.length = 0;
        const isMobile = canvas.width < 600;
        const agentX = isMobile ? Math.max(22, canvas.width * 0.07) : 50;
        const topPad = isMobile ? canvas.height * 0.08 : 100;
        const spacing = isMobile ? (canvas.height * 0.82) / 4 : 60;
        for (let i = 0; i < 5; i++) {
            agents.push({ x: agentX, y: topPad + spacing * i, r: 6 });
        }
    }

    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        initAgents();
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Packet {
        constructor(startX, startY) {
            this.x = startX;
            this.y = startY;
            this.target = 'ORCH';
            this.speed = canvas.width < 600 ? 2 : 4;
            this.r = 3;
            this.color = '#fff';
            this.wait = 0;
        }

        update(w, h) {
            if (this.wait > 0) { this.wait--; return; }

            const orchX = w / 2;
            const orchY = h / 2;
            const govX = w / 2;
            const govY = Math.max(28, h * 0.12);
            const sysX = w - 60;
            const sysY = orchY;

            let tx, ty;

            if (this.target === 'ORCH') {
                tx = orchX; ty = orchY;
                if (dist(this.x, this.y, tx, ty) < 5) {
                    this.target = 'GOV';
                    this.wait = 10;
                }
            } else if (this.target === 'GOV') {
                tx = govX; ty = govY + 20;
                if (dist(this.x, this.y, tx, ty) < 5) {
                    this.target = 'BACK_ORCH';
                    this.color = colors.gov;
                    this.wait = 10;
                }
            } else if (this.target === 'BACK_ORCH') {
                tx = orchX; ty = orchY;
                if (dist(this.x, this.y, tx, ty) < 5) {
                    this.target = 'SYS';
                }
            } else if (this.target === 'SYS') {
                tx = sysX; ty = sysY;
                if (dist(this.x, this.y, tx, ty) < 5) {
                    this.respawn();
                }
            }

            const angle = Math.atan2(ty - this.y, tx - this.x);
            this.x += Math.cos(angle) * this.speed;
            this.y += Math.sin(angle) * this.speed;
        }

        respawn() {
            if (agents.length === 0) return;
            const source = agents[Math.floor(Math.random() * agents.length)];
            this.x = source.x;
            this.y = source.y;
            this.target = 'ORCH';
            this.color = '#fff';
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    function dist(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    for (let i = 0; i < 4; i++) {
        setTimeout(() => {
            if (agents.length > 0) {
                const source = agents[Math.floor(Math.random() * agents.length)];
                packets.push(new Packet(source.x, source.y));
            }
        }, i * 800);
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const govY = Math.max(28, h * 0.12);

        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';

        agents.forEach(a => {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(cx, cy);
            ctx.stroke();
        });

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx, govY + 40);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(w - 80, cy);
        ctx.stroke();

        agents.forEach(a => {
            ctx.beginPath();
            ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
            ctx.fillStyle = colors.agent;
            ctx.fill();
        });

        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI * 2);
        ctx.fillStyle = '#111';
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = "10px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("ORCH", cx, cy + 4);

        ctx.beginPath();
        ctx.rect(cx - 20, govY, 40, 40);
        ctx.fillStyle = '#111';
        ctx.strokeStyle = colors.gov;
        ctx.stroke();
        ctx.fillStyle = colors.gov;
        ctx.fillText("GOV", cx, govY + 24);

        ctx.beginPath();
        ctx.rect(w - 80, cy - 40, 40, 80);
        ctx.fillStyle = '#111';
        ctx.strokeStyle = colors.sys;
        ctx.stroke();
        ctx.fillStyle = colors.sys;
        ctx.fillText("SYS", w - 60, cy + 4);

        packets.forEach(p => {
            p.update(w, h);
            p.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();

    // Toggle logic for comparison cards
   window.setMode = (mode) => {
        const isOrch = mode === 'orch';
        const btnChaos = document.getElementById('btn-chaos');
        const btnOrch = document.getElementById('btn-orch');

        if (!btnChaos || !btnOrch) return;

        // Base classes for the large buttons
        const baseClass = "btn-toggle px-10 py-3 rounded-xl text-base font-semibold tracking-wide transition-all duration-300";
        
        // Update Unmanaged Button
        btnChaos.className = `${baseClass} ${!isOrch 
            ? 'bg-slate-700 text-white shadow-[0_0_20px_rgba(51,65,85,0.4)]' 
            : 'text-slate-500 hover:text-slate-300'}`;
        
        // Update Managed Button
        btnOrch.className = `${baseClass} ${isOrch 
            ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' 
            : 'text-slate-500 hover:text-slate-300'}`;
            
        const updateCard = (id, success, data) => {
            const card = document.getElementById(`card-${id}`);
            const dot = document.getElementById(`dot-${id}`);
            const pill = document.getElementById(`status-${id}-pill`);
            const integrity = document.getElementById(`integrity-${id}`);
            const desc = document.getElementById(`desc-${id}`);

            if (success) {
                card.classList.replace('failure-state', 'success-state');
                dot.className = "status-dot bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]";
                pill.className = "mono text-[9px] px-2 py-0.5 rounded border border-indigo-500/30 text-indigo-400 bg-indigo-500/10 font-medium";
                integrity.className = "text-indigo-400 font-medium";
                desc.innerText = data.orchDesc;
                pill.innerText = data.orchPill;
                integrity.innerText = data.orchStatus;
            } else {
                card.classList.add('failure-state');
                card.classList.remove('success-state');
                dot.className = "status-dot bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]";
                pill.className = "mono text-[9px] px-2 py-0.5 rounded border border-red-500/30 text-red-400 bg-red-500/10 font-medium";
                integrity.className = "text-red-400 font-medium";
                desc.innerText = data.chaosDesc;
                pill.innerText = data.chaosPill;
                integrity.innerText = data.chaosStatus;
            }
        };

        updateCard(1, isOrch, {
            chaosDesc: "Agent B executes before Agent A completes. Incomplete data flows downstream.",
            orchDesc: "Agent B waits for Agent A to finish. Dependencies enforced automatically.",
            chaosPill: "RACE", orchPill: "ORDERED",
            chaosStatus: "Violated", orchStatus: "Sequential"
        });
        updateCard(2, isOrch, {
            chaosDesc: "Two agents write to the same record simultaneously. Last write wins, data lost.",
            orchDesc: "Distributed locks prevent concurrent writes. Agents execute one at a time.",
            chaosPill: "COLLISION", orchPill: "LOCKED",
            chaosStatus: "Data Loss", orchStatus: "Protected"
        });
        updateCard(3, isOrch, {
            chaosDesc: "Agent accesses sensitive data without policy approval. No audit record created.",
            orchDesc: "Every action routed through Governor. Complete audit trail maintained.",
            chaosPill: "BYPASS", orchPill: "ENFORCED",
            chaosStatus: "No Audit", orchStatus: "Audited"
        });
        updateCard(4, isOrch, {
            chaosDesc: "One agent fails. Dependent agents receive no input and crash sequentially.",
            orchDesc: "Circuit breakers isolate failures. Rest of the system continues operating.",
            chaosPill: "CASCADE", orchPill: "ISOLATED",
            chaosStatus: "System Halt", orchStatus: "Contained"
        });

        document.getElementById('line-1').classList.toggle('flow-line', isOrch);
        document.getElementById('line-1').style.color = isOrch ? '#6366f1' : '#ef4444';
        document.getElementById('connector-1').className = `absolute left-1/2 -top-1 w-2 h-2 rounded-full ${isOrch ? 'bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.6)]' : 'bg-red-500/80'}`;
        document.getElementById('db-status').innerText = isOrch ? 'Safe' : 'Corrupted';
        document.getElementById('db-status').className = `text-[8px] font-bold mt-0.5 uppercase ${isOrch ? 'text-indigo-400' : 'text-red-400'}`;
        document.getElementById('ag-3').className = `w-10 h-10 rounded border flex items-center justify-center transition-all ${isOrch ? 'bg-indigo-900/20 border-indigo-500/40' : 'bg-slate-800 border-red-500/30'}`;
        document.getElementById('ag-3-dot').className = `w-1.5 h-1.5 rounded-full ${isOrch ? 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-red-500'}`;
        document.getElementById('lock-icon').className = `absolute -top-2 left-1/2 -translate-x-1/2 transition-all ${isOrch ? 'text-indigo-400' : 'text-red-500 opacity-50'}`;

        const casTexts = document.querySelectorAll('.cascade-text');
        casTexts[0].innerText = isOrch ? "FIXED" : "FAULT";
        casTexts[1].innerText = isOrch ? "OK" : "HALT";
        document.getElementById('cascade-1').className = `w-10 h-12 border rounded flex items-center justify-center ${isOrch ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-red-500/10 border-red-500/30'}`;
        document.getElementById('cascade-2').className = `w-10 h-12 border rounded flex items-center justify-center ${isOrch ? 'bg-slate-900 border-slate-800' : 'bg-red-500/5 border-red-500/20'}`;
    };

    // Initialize in Chaos mode
    setMode('chaos');
});

// Unique Observer for Whitepaper Section
(function() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('acw-visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.acw-reveal').forEach((el) => observer.observe(el));
})();

// Observer for Orchestration Flow Section
(function() {
    const ofObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('of-visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.of-reveal').forEach((el) => ofObserver.observe(el));
})();

// Architecture Section Reveal Observer
(function() {
    const archObserverOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const archObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, archObserverOptions);

    document.querySelectorAll('.arch-reveal').forEach((el) => archObserver.observe(el));
})();

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('arch-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const colors = {
        mainText: '#888',
        subText: '#555',
        orchestrator: '#6366f1',
        packetBase: '#888',
        workflow: '#fff',
        dependency: '#10b981',
        resource: '#f59e0b',
        database: '#3b82f6',
        api: '#ec4899',
        cloud: '#14b8a6',
        internal: '#f97316'
    };

    const getScale = () => Math.min(1, canvas.width / 600);
    const isMobile = () => canvas.width < 600;

    class Packet {
        constructor(agentIndex, agentX, agentY) {
            this.agentIndex = agentIndex;
            this.x = agentX;
            this.y = agentY;
            this.state = 'TO_ORCH';
            this.speed = isMobile() ? 1.5 : 2.5;
            this.r = 3.5;
            this.color = colors.packetBase;
            this.wait = 0;
            this.checkTime = 0;
            this.orbitAngle = Math.random() * Math.PI * 2;
            this.orbitRadius = 0;
            this.remove = false;
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

        update(w, h, scale) {
            if (this.wait > 0) { this.wait--; return; }

            const orchX = w / 2;
            const orchY = h / 2;
            const orbitTarget = Math.max(40, 60 * scale);
            const execY = h * 0.78;

            if (this.state === 'TO_ORCH') {
                if (this.moveTo(orchX, orchY)) {
                    this.state = 'WORKFLOW';
                    this.checkTime = 20;
                    this.color = colors.workflow;
                }
            } else if (this.state === 'WORKFLOW' || this.state === 'DEPENDENCY_CHECK' || this.state === 'RESOURCE_LOCK') {
                this.orbitRadius += (orbitTarget - this.orbitRadius) * 0.1;
                this.orbitAngle += 0.04;
                this.x = orchX + Math.cos(this.orbitAngle) * this.orbitRadius;
                this.y = orchY + Math.sin(this.orbitAngle) * this.orbitRadius;

                if (this.checkTime > 0) {
                    this.checkTime--;
                } else {
                    if (this.state === 'WORKFLOW') {
                        this.state = 'DEPENDENCY_CHECK';
                        this.checkTime = 15;
                        this.color = colors.dependency;
                    } else if (this.state === 'DEPENDENCY_CHECK') {
                        this.state = 'RESOURCE_LOCK';
                        this.checkTime = 15;
                        this.color = colors.resource;
                    } else if (this.state === 'RESOURCE_LOCK') {
                        const targets = (w < 600) ? [0.125, 0.375, 0.625, 0.875] : [0.15, 0.38, 0.62, 0.85];
                        const tColors = [colors.database, colors.api, colors.cloud, colors.internal];
                        const idx = Math.floor(Math.random() * 4);
                        this.targetX = w * targets[idx];
                        this.color = tColors[idx];
                        this.targetY = execY;
                        // Calculate the exact angle on the orbit that points toward the target box
                        this.exitAngle = Math.atan2(this.targetY - orchY, this.targetX - orchX);
                        this.state = 'ALIGN_ORBIT';
                    }
                }
            } else if (this.state === 'ALIGN_ORBIT') {
                // Keep orbiting but steer toward exitAngle
                this.orbitRadius += (orbitTarget - this.orbitRadius) * 0.1;
                // Normalize angle difference to [-PI, PI] and rotate toward exit
                let diff = this.exitAngle - this.orbitAngle;
                while (diff > Math.PI)  diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;
                const step = 0.06;
                if (Math.abs(diff) < step) {
                    // Snap to exit angle and launch
                    this.orbitAngle = this.exitAngle;
                    this.x = orchX + Math.cos(this.orbitAngle) * this.orbitRadius;
                    this.y = orchY + Math.sin(this.orbitAngle) * this.orbitRadius;
                    this.state = 'TO_EXECUTION';
                } else {
                    this.orbitAngle += Math.sign(diff) * step;
                    this.x = orchX + Math.cos(this.orbitAngle) * this.orbitRadius;
                    this.y = orchY + Math.sin(this.orbitAngle) * this.orbitRadius;
                }
            } else if (this.state === 'TO_EXECUTION') {
                if (this.moveTo(this.targetX, this.targetY)) {
                    this.state = 'DONE';
                    this.wait = 15;
                }
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
    const agentCount = 4;
    let spawnIndex = 0;

    function spawnArchPacket() {
        if (packets.length >= 12) return;
        const spacing = canvas.width / (agentCount + 1);
        const agentX = spacing * ((spawnIndex % agentCount) + 1);
        const agentY = Math.max(50, canvas.height * 0.14);
        packets.push(new Packet(spawnIndex % agentCount, agentX, agentY));
        spawnIndex++;
    }

    let archSpawnInterval = setInterval(spawnArchPacket, 1500);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(archSpawnInterval);
        } else {
            packets.length = 0;
            spawnIndex = 0;
            archSpawnInterval = setInterval(spawnArchPacket, 1500);
        }
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const w = canvas.width;
        const h = canvas.height;
        const orchX = w / 2;
        const orchY = h / 2;
        const scale = getScale();

        const agentY    = Math.max(50, h * 0.14);
        const execY     = h * 0.78;
        const execPositions = isMobile()
            ? [0.125, 0.375, 0.625, 0.875]
            : [0.15, 0.38, 0.62, 0.85];

        // Minimum-clamped font sizes — never tiny on mobile
        const agentFont  = Math.max(10, 11 * scale);
        const orchFont   = Math.max(13, 14 * scale);
        const orchSub    = Math.max(10, 11 * scale);
        const boxFont    = Math.max(10, 11 * scale);

        // Mobile: slot-based width for even spacing; Desktop: original fixed sizing
        const slotW = w / 4;
        const boxW = isMobile() ? slotW * 0.72 : Math.max(72, 72 * scale);
        const boxH = isMobile() ? Math.max(30, 32 * scale) : Math.max(30, 30 * scale);


        const spacing = w / (agentCount + 1);

        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;

        // Agent nodes + lines to orch
        for (let i = 1; i <= agentCount; i++) {
            const ax = spacing * i;

            ctx.beginPath();
            ctx.moveTo(ax, agentY);
            ctx.lineTo(orchX, orchY);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(ax, agentY, Math.max(5, 6 * scale), 0, Math.PI * 2);
            ctx.fillStyle = '#333';
            ctx.fill();

            ctx.fillStyle = colors.mainText;
            ctx.textAlign = "center";
            ctx.font = `${agentFont}px Inter`;
            ctx.fillText(`AGENT ${i}`, ax, agentY - Math.max(12, 15 * scale));
        }

        // Lines from orch to execution boxes
        execPositions.forEach(p => {
            ctx.beginPath();
            ctx.moveTo(orchX, orchY);
            ctx.lineTo(w * p, execY);
            ctx.stroke();
        });

        // Orchestrator circle
        const orchRadius = Math.max(70, 100 * scale);
        ctx.beginPath();
        ctx.arc(orchX, orchY, orchRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#080808';
        ctx.fill();
        ctx.strokeStyle = colors.orchestrator;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.fillStyle = colors.mainText;
        ctx.font = `600 ${orchFont}px Inter`;
        ctx.fillText("ORCHESTRATOR", orchX, orchY - Math.max(5, 6 * scale));
        ctx.font = `${orchSub}px Inter`;
        ctx.fillStyle = colors.subText;
        ctx.fillText("CENTRAL ENGINE", orchX, orchY + Math.max(10, 12 * scale));

        // Orbit ring
        ctx.beginPath();
        ctx.arc(orchX, orchY, Math.max(40, 60 * scale), 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Execution boxes
        const labels  = ['DATABASE', 'EXT-API', 'CLOUD', 'INTERNAL'];
        const eColors = [colors.database, colors.api, colors.cloud, colors.internal];
        execPositions.forEach((p, i) => {
            const tx = w * p;
            const ty = execY;
            ctx.strokeStyle = eColors[i];
            ctx.lineWidth = 1;
            ctx.strokeRect(tx - boxW / 2, ty - boxH / 2, boxW, boxH);
            ctx.fillStyle = eColors[i];
            ctx.font = `600 ${boxFont}px Inter`;
            ctx.textAlign = "center";
            ctx.fillText(labels[i], tx, ty + 4);
        });

        // Packets
        for (let i = packets.length - 1; i >= 0; i--) {
            packets[i].update(w, h, scale);
            packets[i].draw();
            if (packets[i].remove) packets.splice(i, 1);
        }

        requestAnimationFrame(animate);
    }

    animate();
});



document.querySelectorAll('.orch-spec-reveal').forEach((el) => observer.observe(el));

const faqs = [
  {
    question: "Can we use this with existing frameworks?",
    answer:
      "Yes. It is designed to integrate via SDKs (Python) or REST APIs. Agent code changes are typically limited to routing execution through the Orchestrator instead of calling systems directly. Policy definitions and workflow DAGs remain decoupled from agent logic.",
  },
  {
    question: "What is the performance overhead?",
    answer:
      "In reference deployments, orchestration adds roughly 10–20ms per action, including interception, Governor routing, and checkpointing. Compared to LLM inference (hundreds of milliseconds) and external APIs, this is usually under 1–2% of total workflow runtime, in exchange for dependency enforcement, policy routing, and audit trails.",
  },
  {
    question: "Is on-premises or air-gapped supported?",
    answer:
      "Yes. Supported models include managed cloud, customer-managed Kubernetes or VMs, and fully air-gapped environments. All models support the same feature set; on-premises deployments require a customer-managed persistence backend such as PostgreSQL or a DynamoDB-compatible store.",
  },
  {
    question: "What if an agent is compromised?",
    answer:
      "Defense-in-depth limits impact. Every action proposal is evaluated by the Governor; unauthorized operations are blocked. Network segmentation prevents agents from directly reaching execution systems. Rate limits and circuit breakers detect anomalous behavior and can suspend offending workflows. Immutable audit logs support forensic analysis and response.",
  },
  {
    question: "How do we define workflows?",
    answer:
      "You can define workflows code-first with the Python SDK for complex logic, use declarative YAML for GitOps and ops-friendly management, and adopt a visual UI (on the roadmap) for non-technical stakeholders. A common pattern is: start with code, then move stable workflows into YAML or UI for operational ownership.",
  },
  {
    question: "Can we test workflows before production?",
    answer:
      "Yes. Teams combine local/unit tests with mocked agents and Governor responses, staging environments with synthetic or anonymized data, and shadow mode to evaluate governance decisions without executing actions. Canary releases (10% → 50% → 100%) and replaying historical workflows against new policy versions provide production-grade validation before full rollout.",
  },
];

        const container = document.getElementById('faq-container');

        function renderFAQs() {
            faqs.forEach((faq, index) => {
                const faqItem = document.createElement('div');
                faqItem.className = `faq-item group border-b border-white/10 transition-colors duration-500`;
                
                faqItem.innerHTML = `
                    <button class="w-full py-8 flex items-center justify-between text-left transition-all">
                        <span class="faq-question-text text-xl md:text-2xl font-light tracking-tight transition-all duration-500 text-[#888888] group-hover:text-slate-300">
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

        function setComparisonMode(mode) {
    // Update Buttons
    const btnUnmanaged = document.getElementById('comp-btn-unmanaged');
    const btnManaged = document.getElementById('comp-btn-managed');
    
    if (mode === 'managed') {
        btnManaged.classList.add('active');
        btnUnmanaged.classList.remove('active');
        document.getElementById('compGridContainer').classList.add('mode-managed');
    } else {
        btnUnmanaged.classList.add('active');
        btnManaged.classList.remove('active');
        document.getElementById('compGridContainer').classList.remove('mode-managed');
    }

    // Toggle Content
    const contents = document.querySelectorAll('[data-comp-state]');
    contents.forEach(el => {
        if (el.getAttribute('data-comp-state') === mode) {
            el.classList.remove('hidden');
            el.classList.add('visible');
        } else {
            el.classList.remove('visible');
            el.classList.add('hidden');
        }
    });
}