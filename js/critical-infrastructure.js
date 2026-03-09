document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();

    // ── Scenario Data ──────────────────────────────────────────────
    // FIX: added 'resultText' (was 'resultLabel') and 'resultClass' (was missing)
    // both are required by setStage(); their absence caused "undefined" in the UI
    const SCENARIOS = {
        approve: {
            resultText:  "EXECUTE",
            resultClass: "result-success",
            icon: "check",
            log: {
                "decision-id":      "DEC-2026-8842",
                "policy-hash":      "sha256:7a8f3c2...",
                "status":           "APPROVE",
                "rules-evaluated":  ["risk-threshold-check", "conflict-scan-v4"],
                "rationale":        "Zero policy violations detected in agent context.",
                "replay-token":     "REPLAY-STABLE-991"
            }
        },
        block: {
            resultText:  "DENY",
            resultClass: "result-block",
            icon: "x",
            log: {
                "decision-id":      "DEC-2026-8849",
                "policy-hash":      "sha256:7a8f3c2...",
                "status":           "BLOCK",
                "rules-evaluated":  ["sanctions-check", "aml-pattern-verify"],
                "rationale":        "Policy Violation: Restricted counterparty detected.",
                "replay-token":     "REPLAY-STABLE-992"
            }
        },
        escalate: {
            resultText:  "ESCALATE",
            resultClass: "result-warn",
            icon: "fingerprint",
            log: {
                "decision-id":      "DEC-2026-8901",
                "policy-hash":      "sha256:7a8f3c2...",
                "status":           "ESCALATE",
                "rules-evaluated":  ["anomaly-threshold", "manual-routing-rule"],
                "rationale":        "Contextual ambiguity — value exceeds automated approval limit.",
                "escalated-to":     "compliance-officer-lvl2"
            }
        }
    };

    let currentScenario = null;
    let stage = 0;

    resetFlow();

    // ── Event Listeners ────────────────────────────────────────────
    document.querySelectorAll('.infra-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const scenarioType = this.getAttribute('data-scenario');
            if (scenarioType === currentScenario && stage < 4 && stage > 0) return;
            runScenario(scenarioType);
        });
    });

    // ── Run Scenario ───────────────────────────────────────────────
    function runScenario(type) {
        resetFlow();
        document.querySelectorAll('.infra-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-scenario') === type);
        });
        currentScenario = type;
        setTimeout(() => setStage(1), 100);
        setTimeout(() => setStage(2), 900);
        setTimeout(() => setStage(3), 1700);
        setTimeout(() => setStage(4), 2500);
    }

    // ── Reset Flow ─────────────────────────────────────────────────
    // FIX: added null guards so resetFlow never throws on missing DOM elements
    function resetFlow() {
        stage = 0;
        for (let i = 1; i <= 3; i++) {
            const nodeCircle = document.getElementById(`node-${i}`);
            if (!nodeCircle) continue;
            nodeCircle.className = 'node-circle';
            const icon = nodeCircle.querySelector('.node-icon');
            if (icon) icon.style.color = '';
            nodeCircle.parentElement.classList.remove('active');
            const conn = document.getElementById(`conn-${i}`);
            if (conn) conn.style.width = '0%';
        }
        const resultNode = document.getElementById('result-node');
        if (resultNode) {
            resultNode.className = 'node-circle result-waiting';
            resultNode.innerHTML = '<div class="ping-dot"></div>';
        }
        const resultLabel = document.getElementById('result-label');
        if (resultLabel) {
            resultLabel.textContent = 'Awaiting';
            resultLabel.style.color = '';
        }
        const sigId = document.getElementById('sig-id');
        if (sigId) sigId.textContent = 'SIG-ID: --';
        const auditContent = document.getElementById('audit-content');
        if (auditContent) {
            auditContent.innerHTML = `
                <div class="skeleton-group">
                    <div class="sk-line w-100"></div>
                    <div class="sk-line w-66"></div>
                    <div class="sk-line w-80"></div>
                    <div class="sk-line w-50"></div>
                </div>`;
        }
    }

    // ── Set Stage ──────────────────────────────────────────────────
    function setStage(newStage) {
        stage = newStage;

        if (stage >= 1 && stage <= 3) {
            const nodeCircle = document.getElementById(`node-${stage}`);
            if (!nodeCircle) return;
            nodeCircle.classList.add('active');
            nodeCircle.parentElement.classList.add('active');

            for (let i = 1; i < stage; i++) {
                const prevNode = document.getElementById(`node-${i}`);
                if (!prevNode) continue;
                prevNode.classList.remove('active');
                prevNode.classList.add('completed');
                prevNode.parentElement.classList.remove('active');
            }
            const conn = document.getElementById(`conn-${stage}`);
            if (conn) conn.style.width = '100%';
        }

        if (stage === 4) {
            const node3 = document.getElementById('node-3');
            if (node3) {
                node3.classList.remove('active');
                node3.classList.add('completed');
                node3.parentElement.classList.remove('active');
            }

            const scenario   = SCENARIOS[currentScenario];
            const resultNode = document.getElementById('result-node');
            if (resultNode) {
                resultNode.className = `node-circle ${scenario.resultClass}`;
                resultNode.innerHTML = `<i data-lucide="${scenario.icon}" class="node-icon" style="color: inherit;"></i>`;
            }
            const resultLabel = document.getElementById('result-label');
            if (resultLabel) {
                resultLabel.textContent = scenario.resultText;   // FIX: was scenario.resultText but key was resultLabel
                resultLabel.style.color = 'white';
            }
            if (window.lucide) lucide.createIcons();
            showAuditLog(scenario.log);
        }
    }

    // ── Show Audit Log ─────────────────────────────────────────────
    function showAuditLog(log) {
        const auditContent = document.getElementById('audit-content');
        if (!auditContent) return;

        let html = '<div class="log-grid-v2">';
        for (const [key, value] of Object.entries(log)) {
            const displayValue = Array.isArray(value) ? value.join(', ') : value;
            html += `
                <div class="log-row">
                    <span class="log-label">${key.replace(/-/g, ' ')}</span>
                    <span class="log-data ${key === 'status' ? 'highlight' : ''}">${displayValue}</span>
                </div>`;
        }
        html += '</div>';
        auditContent.innerHTML = html;

        // Update sig-id footer with replay token
        const sigId = document.getElementById('sig-id');
        if (sigId && log['replay-token']) sigId.textContent = `SIG-ID: ${log['replay-token']}`;
    }
});
