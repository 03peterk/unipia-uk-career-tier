// js/main.js — UNIPIA UK Career Tier Test Logic
let companiesData = [];
let userScore = 0;
let userBonusScore = 0;
let userTier = "";

// ========================
// 1. Init
// ========================
document.addEventListener('DOMContentLoaded', () => {
    // Load company data
    fetch('data/uk_top10_companies.json')
        .then(r => r.json())
        .then(data => {
            companiesData = data;
            const companySelect = document.getElementById('company-select');
            companiesData.forEach((company, index) => {
                const opt = document.createElement('option');
                opt.value = index;
                opt.textContent = `${company.company_name} — ${company.industry}`;
                companySelect.appendChild(opt);
            });
        })
        .catch(err => console.error("Error loading companies DB:", err));

    // Char counter for textarea
    const selfDesc = document.getElementById('self-desc');
    const charCount = document.getElementById('char-count');
    if (selfDesc && charCount) {
        selfDesc.addEventListener('input', () => {
            const len = selfDesc.value.length;
            if (len > 500) selfDesc.value = selfDesc.value.substring(0, 500);
            charCount.textContent = Math.min(len, 500);
        });
    }
});

// ========================
// 2. Navigation
// ========================
function nextStep(step) {
    document.querySelectorAll('.step-section').forEach(el => {
        el.classList.remove('active');
        el.classList.add('hidden');
    });
    const target = document.getElementById(`step-${step}`);
    if (!target) return;
    target.classList.remove('hidden');
    target.classList.add('active');
    // Scroll to the tier-test section anchor when moving between steps
    const testSection = document.getElementById('tier-test');
    if (testSection) testSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (step === 6) {
        document.getElementById('company-select').value = "";
        document.getElementById('dept-select').innerHTML = '<option value="" disabled selected>먼저 기업을 선택해주세요</option>';
        document.getElementById('dept-select').disabled = true;
        document.getElementById('analyze-btn').disabled = true;
    }
}

function prevStep(step) { nextStep(step); }

// ========================
// 3. Keyword Bonus Scoring
// ========================
const BONUS_KEYWORDS = [
    // High-prestige keywords (+3 each, max 3 hits)
    { terms: ['goldman sachs', 'jp morgan', 'morgan stanley', 'blackrock', 'bcg', 'mckinsey', 'bain', 'bulge bracket'], points: 3 },
    // Competitive process keywords (+2 each)
    { terms: ['insight programme', 'spring week', 'open day', 'pre-offersite interview', 'superday', 'assessment centre', 'penultimate'], points: 2 },
    // Activity / leadership bonus (+1 each)
    { terms: ['president', 'founder', 'founded', 'created', 'launched', 'captain', 'led', 'managed', 'organised', 'organized', 'charity', 'volunteer', 'award', 'winner', 'publication', 'research'], points: 1 },
];

function computeBonusScore(text) {
    if (!text || text.trim().length < 30) return 0;
    const lower = text.toLowerCase();
    let bonus = 0;
    BONUS_KEYWORDS.forEach(group => {
        let hits = 0;
        group.terms.forEach(term => {
            if (lower.includes(term)) hits++;
        });
        // Cap hits at 3 per group to prevent gaming
        bonus += Math.min(hits, 3) * group.points;
    });
    return Math.min(bonus, 10); // Hard cap at +10
}

// ========================
// 4. Calculate Tier
// ========================
function calculateTier() {
    const yearChecked = document.querySelector('input[name="year"]:checked');
    const major = document.getElementById('major').value;
    if (!yearChecked || !major) {
        alert("기본 정보(학년/전공)를 모두 입력해주세요.");
        prevStep(2);
        return;
    }

    const degreeScore = parseInt(document.getElementById('degree').value) || 0;
    const expScore = parseInt(document.getElementById('experience').value) || 0;
    const leadershipScore = parseInt(document.getElementById('leadership').value) || 0;
    const selfDescText = document.getElementById('self-desc').value || "";

    userBonusScore = computeBonusScore(selfDescText);
    const baseScore = degreeScore + expScore + leadershipScore;
    userScore = baseScore + userBonusScore;

    // Tier logic (base 100pt + up to 10 bonus)
    // S: 85+ | A: 65~84 | B: 40~64 | C: <40  (calculated on base for fairness)
    let title, desc, tierClass, percentile;

    if (baseScore >= 85) {
        userTier = "S"; tierClass = "S-tier";
        percentile = Math.floor(Math.random() * 5) + 1;
        title = "Graduate Scheme 프리패스형 (Unicorn)";
        desc = "최상위 스펙입니다. 1st/2:1 학점에 굵직한 인턴십과 리더십 경험까지 완벽히 챙기셨습니다. 남은 건 Online Assessment와 Assessment Centre 통과뿐!";
    } else if (baseScore >= 65) {
        userTier = "A"; tierClass = "A-tier";
        percentile = Math.floor(Math.random() * 10) + 10;
        title = "준비된 실력자형 (High-Flyer)";
        desc = "훌륭합니다. 서류 합격률이 매우 높습니다! 2%의 차별화를 위해 남은 기간 동안 직무 관련 Virtual Internship이나 단기 프로젝트로 이력서를 보강하세요.";
    } else if (baseScore >= 40) {
        userTier = "B"; tierClass = "B-tier";
        percentile = Math.floor(Math.random() * 20) + 30;
        title = "폭풍 성장 기대주형 (Rising Star)";
        desc = "학교 생활을 성실히 해오셨군요. 다만 영국 취업에 직접 어필할 Commercial Awareness 경험이 아쉽습니다. 단기 실무 경험을 추천합니다.";
    } else {
        userTier = "C"; tierClass = "C-tier";
        percentile = Math.floor(Math.random() * 20) + 60;
        title = "잠재력 가득한 원석형 (Hidden Gem)";
        desc = "시작이 반입니다! 최소 2:1 학점 관리에 먼저 집중하시고, 다가오는 Spring Week 공고들을 적극 스크랩해보세요.";
    }

    // Show loading (step 4) with sequential step reveals
    nextStep(4);
    animateLoadingSteps(() => {
        // Set result UI
        document.getElementById('tier-badge').textContent = userTier;
        document.getElementById('tier-badge').className = `tier-badge-large ${tierClass}`;
        document.getElementById('tier-title').textContent = title;
        document.getElementById('tier-title').style.color = userTier === 'S' ? '#F59E0B' : '#9F54FF';
        document.getElementById('tier-desc').textContent = desc;
        document.getElementById('total-score').textContent = userScore;
        document.getElementById('percentile').textContent = percentile;

        // Bonus label
        const bonusLabel = document.getElementById('bonus-score-label');
        if (userBonusScore > 0) {
            bonusLabel.textContent = `✨ 추가 서술 키워드 보너스: +${userBonusScore}점 반영됨`;
        } else {
            bonusLabel.textContent = '';
        }

        // Animate score bar (max 110)
        setTimeout(() => {
            document.getElementById('score-bar-fill').style.width = (userScore / 110 * 100) + "%";
        }, 100);

        nextStep(5);
    });
}

function animateLoadingSteps(callback) {
    const steps = ['ls1', 'ls2', 'ls3', 'ls4'];
    // Reset
    steps.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('visible');
    });
    let i = 0;
    const interval = setInterval(() => {
        if (i < steps.length) {
            const el = document.getElementById(steps[i]);
            if (el) el.classList.add('visible');
            i++;
        } else {
            clearInterval(interval);
            setTimeout(callback, 400);
        }
    }, 450);
}

// ========================
// 5. Company & Dept Match
// ========================
function loadDepartments() {
    const compIdx = document.getElementById('company-select').value;
    const deptSelect = document.getElementById('dept-select');
    deptSelect.innerHTML = '<option value="" disabled selected>부서를 선택하세요</option>';

    if (compIdx !== "") {
        companiesData[compIdx].departments.forEach((dept, index) => {
            const opt = document.createElement('option');
            opt.value = index;
            opt.textContent = dept.dept_name;
            deptSelect.appendChild(opt);
        });
        deptSelect.disabled = false;
        deptSelect.addEventListener('change', () => {
            document.getElementById('analyze-btn').disabled = false;
        });
    }
}

function analyzeGap() {
    const compIdx = document.getElementById('company-select').value;
    const deptIdx = document.getElementById('dept-select').value;
    const company = companiesData[compIdx];
    const dept = company.departments[deptIdx];

    document.getElementById('target-company-name').textContent = company.company_name;
    document.getElementById('target-dept-name').textContent = dept.dept_name;
    document.getElementById('target-score-value').textContent = dept.requirements.target_score;

    const gap = userScore - dept.requirements.target_score;
    const gapAlert = document.getElementById('gap-alert');

    if (gap >= 0) {
        gapAlert.className = "alert-box success";
        gapAlert.innerHTML = `🔥 목표 점수 초과 달성! (${userScore}점 / 기준 ${dept.requirements.target_score}점)<br><span style="font-size:13px;font-weight:normal;">이 스펙으로 서류 탈락할 확률은 현저히 낮습니다.</span>`;
        document.getElementById('unipia-feedback').textContent = dept.feedback_templates.high_score;
    } else if (gap >= -15) {
        gapAlert.className = "alert-box warning";
        gapAlert.innerHTML = `⚠️ 조금만 더 보완하면 됩니다! (부족한 점수: ${Math.abs(gap)}점)<br><span style="font-size:13px;font-weight:normal;">Cover Letter에서 경험을 디테일하게 풀어내는 것이 관건입니다.</span>`;
        document.getElementById('unipia-feedback').textContent =
            parseInt(document.getElementById('experience').value) <= 15
                ? dept.feedback_templates.need_experience
                : dept.feedback_templates.high_score;
    } else {
        gapAlert.className = "alert-box danger";
        gapAlert.innerHTML = `🚨 합격을 위해 상당한 스펙 보완이 필요합니다. (부족한 점수: ${Math.abs(gap)}점)<br><span style="font-size:13px;font-weight:normal;">서류 스크리닝에서 컷오프 당할 확률이 높습니다. 대체 전략이 필요합니다.</span>`;
        document.getElementById('unipia-feedback').textContent =
            dept.feedback_templates.need_experience + ` 최소 요구 학점(${dept.requirements.min_degree})을 충족하는지 다시 점검해주세요.`;
    }

    // Tags
    const tagsContainer = document.getElementById('crucial-tags');
    tagsContainer.innerHTML = "";
    dept.requirements.crucial_factors.forEach(factor => {
        const span = document.createElement('span');
        span.className = "tag-item";
        span.textContent = factor;
        tagsContainer.appendChild(span);
    });

    nextStep(7);
}

// ========================
// 6. Reset
// ========================
function resetTest() {
    document.querySelectorAll('input[name="year"]').forEach(r => r.checked = false);
    document.getElementById('major').selectedIndex = 0;
    document.getElementById('degree').value = "25";
    document.getElementById('experience').value = "0";
    document.getElementById('leadership').value = "0";
    document.getElementById('self-desc').value = "";
    document.getElementById('char-count').textContent = "0";
    document.getElementById('score-bar-fill').style.width = "0%";
    userScore = 0; userBonusScore = 0; userTier = "";
    nextStep(2);
    document.getElementById('homepage').scrollIntoView({ behavior: 'smooth' });
}
