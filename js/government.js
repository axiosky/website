document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();

    const SCENARIOS = {
        approve: {
            label: "Authorized Protocol",
            desc: "Procurement workflow within defined thresholds.",
            icon: "check",
            resultText: "Execute",
            resultClass: "result-success",
            log: {
                id: "AX-7721-001",
                status: "APPROVED",
                policy: "procurement_v4.1",
                integrity_hash: "0x8f2...a1c",
                timestamp: "2026-03-09T14:32:18Z",
                rationale: "All compliance markers validated."
            }
        },
        block: {
            label: "Policy Violation",
            desc: "Conflict detected: equity holding in vendor.",
            icon: "x",
            resultText: "Block",
            resultClass: "result-block",
            log: {
                id: "AX-7721-002",
                status: "TERMINATED",
                policy: "ethics_v2.0",
                integrity_hash: "0x9d1...f4e",
                timestamp: "2026-03-09T14:34:02Z",
                rationale: "Conflict of interest detected in evaluator profile."
            }
        },
        escalate: {
            label: "Manual Intervention",
            desc: "Contract value exceeds automated approval limit.",
            icon: "alert-circle",
            resultText: "Review",
            resultClass: "result-warn",
            log: {
                id: "AX-7721-003",
                status: "ESCALATED",
                policy: "fiscal_v1.2",
                integrity_hash: "0x1b4...e5d",
                timestamp: "2026-03-09T14:38:45Z",
                rationale: "Requires human-in-the-loop review (value exceeds automated threshold)."
            }
        }
    };

    let currentScenario = null;
    let stage = 0;

    resetFlow();

    document.querySelectorAll('.infra-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const scenarioType = this.getAttribute('data-scenario');
            if (scenarioType === currentScenario && stage < 4 && stage > 0) return;
            runScenario(scenarioType);
        });
    });

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

    function resetFlow() {
        stage = 0;
        for (let i = 1; i <= 3; i++) {
            const nodeCircle = document.getElementById(`node-${i}`);
            if (!nodeCircle) continue;
            nodeCircle.className = 'node-circle';
            nodeCircle.querySelector('.node-icon').style.color = '';
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
        const auditContent = document.getElementById('audit-content');
        if (auditContent) {
            auditContent.innerHTML = `
                <div class="skeleton-group">
                    <div class="sk-line w-75"></div>
                    <div class="sk-line w-50"></div>
                    <div class="sk-line w-60"></div>
                    <div class="sk-line w-25"></div>
                </div>`;
        }
    }

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

            const scenario = SCENARIOS[currentScenario];
            const resultNode = document.getElementById('result-node');
            if (resultNode) {
                resultNode.className = `node-circle ${scenario.resultClass}`;
                resultNode.innerHTML = `<i data-lucide="${scenario.icon}" class="node-icon" style="color: inherit;"></i>`;
            }
            const resultLabel = document.getElementById('result-label');
            if (resultLabel) {
                resultLabel.textContent = scenario.resultText;
                resultLabel.style.color = 'white';
            }
            if (window.lucide) lucide.createIcons();
            showAuditLog(scenario.log);
        }
    }

    function showAuditLog(log) {
        const auditContent = document.getElementById('audit-content');
        if (!auditContent) return;
        let html = '<div class="log-grid-v2">';
        for (const [key, value] of Object.entries(log)) {
            html += `
                <div class="log-row">
                    <span class="log-label">${key.replace('_', ' ')}</span>
                    <span class="log-data ${key === 'status' ? 'highlight' : ''}">${value}</span>
                </div>`;
        }
        html += '</div>';
        auditContent.innerHTML = html;
    }
});
