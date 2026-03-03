// js/main.js
let companiesData = [];
let userScore = 0;
let userPercentile = 0;
let userTier = "";

// 1. Fetch JSON Data
document.addEventListener('DOMContentLoaded', () => {
    fetch('data/uk_top10_companies.json')
        .then(response => response.json())
        .then(data => {
            companiesData = data;
            // 회사 정보로 select 옵션 채우기
            const companySelect = document.getElementById('company-select');
            companiesData.forEach((company, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${company.company_name} - ${company.industry}`;
                companySelect.appendChild(option);
            });
        })
        .catch(err => console.error("Error loading companies DB:", err));
});

// 2. Navigation Logic
function nextStep(step) {
    document.querySelectorAll('.step-section').forEach(el => {
        el.classList.remove('active');
        el.classList.add('hidden');
    });

    const target = document.getElementById(`step-${step}`);
    target.classList.remove('hidden');
    target.classList.add('active');

    // 만약 Step이 6이라면 회사 선택 폼 초기화 (회사 셀렉트 활성화)
    if (step === 6) {
        document.getElementById('company-select').value = "";
        document.getElementById('dept-select').innerHTML = '<option value="" disabled selected>먼저 기업을 선택해주세요</option>';
        document.getElementById('dept-select').disabled = true;
        document.getElementById('analyze-btn').disabled = true;
    }
}

function prevStep(step) {
    nextStep(step);
}

// 3. Calculation Logic
function calculateTier() {
    // 폼 검증
    const yearChecked = document.querySelector('input[name="year"]:checked');
    const major = document.getElementById('major').value;
    if (!yearChecked || !major) {
        // Step 2 정보가 없으면 알럿 후 스텝2로
        alert("기본 정보(학년/전공)를 모두 입력해주세요.");
        prevStep(2);
        return;
    }

    const degreeScore = parseInt(document.getElementById('degree').value) || 0;
    const expScore = parseInt(document.getElementById('experience').value) || 0;
    const leadershipScore = parseInt(document.getElementById('leadership').value) || 0;

    userScore = degreeScore + expScore + leadershipScore;

    // 티어 로직 (S: 85+, A: 65~84, B: 40~64, C: <40)
    let title, desc, tierClass, percentile;

    if (userScore >= 85) {
        userTier = "S";
        tierClass = "S-tier";
        percentile = Math.floor(Math.random() * 5) + 1; // 1~5%
        title = "Graduate Scheme 프리패스형 (Unicorn)";
        desc = "최상위 스펙입니다! 1st/2:1 학점에 굵직한 인턴십, 리더십 경험까지 완벽히 챙기셨습니다. 이제 남은 건 Online Assessment와 Assessment Centre 통과뿐입니다.";
    } else if (userScore >= 65) {
        userTier = "A";
        tierClass = "A-tier";
        percentile = Math.floor(Math.random() * 10) + 10; // 10~20%
        title = "준비된 실력자형 (High-Flyer)";
        desc = "훌륭합니다. 서류 합격률이 매우 높습니다! 다만 2%의 차별화를 위해 남은 기간 동안 직무 관련 Virtual Internship이나 단기 프로젝트로 이력서를 보강하세요.";
    } else if (userScore >= 40) {
        userTier = "B";
        tierClass = "B-tier";
        percentile = Math.floor(Math.random() * 20) + 30; // 30~50%
        title = "폭풍 성장 기대주형 (Rising Star)";
        desc = "성실하게 학교 생활을 해오셨군요. 다만 영국 취업에 직접 어필할 상업적 마인드(Commercial Awareness) 경험이 살짝 아쉽습니다. 단기 실무 경험을 추천합니다.";
    } else {
        userTier = "C";
        tierClass = "C-tier";
        percentile = Math.floor(Math.random() * 20) + 60; // 60~80%
        title = "잠재력 가득한 원석형 (Hidden Gem)";
        desc = "시작이 반입니다! 영국의 기본 허들인 최소 2:1 학점 관리에 먼저 집중하시고, 다가오는 Spring Week 공고들을 적극적으로 스크랩하세요!";
    }

    // 로딩 화면(Step 4) 보여주기 (알고리즘 분석 연출)
    nextStep(4);

    setTimeout(() => {
        // 결과 화면(Step 5) 세팅
        document.getElementById('tier-badge').textContent = userTier;
        document.getElementById('tier-badge').className = `tier-badge-large ${tierClass}`;
        document.getElementById('tier-title').textContent = title;
        // S 타이어 색상 조정: A나 S일때만 그라디언트 적용으로 개선 가능하지만 현재는 기본 보라색
        if (userTier === 'S') document.getElementById('tier-title').style.color = '#F59E0B';
        else document.getElementById('tier-title').style.color = '#9F54FF';

        document.getElementById('tier-desc').textContent = desc;
        document.getElementById('total-score').textContent = userScore;
        document.getElementById('percentile').textContent = percentile;

        // 애니메이션 게이지
        setTimeout(() => {
            document.getElementById('score-bar-fill').style.width = userScore + "%";
        }, 100);

        nextStep(5);
    }, 2000); // 2초 로딩
}

// 4. Company & Dept Match Logic
function loadDepartments() {
    const compIdx = document.getElementById('company-select').value;
    const deptSelect = document.getElementById('dept-select');

    deptSelect.innerHTML = '<option value="" disabled selected>부서를 선택하세요</option>';

    if (compIdx !== "") {
        const departments = companiesData[compIdx].departments;
        departments.forEach((dept, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = dept.dept_name;
            deptSelect.appendChild(option);
        });
        deptSelect.disabled = false;

        // 부서 선택 시 분석버튼 활성화 이벤트 리스너
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

    // UI 채우기
    document.getElementById('target-company-name').textContent = company.company_name;
    document.getElementById('target-dept-name').textContent = dept.dept_name;
    document.getElementById('target-score-value').textContent = dept.requirements.target_score;

    // 갭 계산
    const gap = userScore - dept.requirements.target_score;
    const gapAlert = document.getElementById('gap-alert');
    let feedbackText = "";

    if (gap >= 0) {
        gapAlert.className = "alert-box success";
        gapAlert.innerHTML = `🔥 목표 점수 초과 달성! (${userScore}점 / 기준 ${dept.requirements.target_score}점)<br><span style="font-size:13px; font-weight:normal;">이 스펙으로 서류 탈락할 확률은 현저히 낮습니다.</span>`;
        feedbackText = dept.feedback_templates.high_score;
    } else if (gap >= -15) {
        gapAlert.className = "alert-box warning";
        gapAlert.innerHTML = `⚠️ 조금만 더 보완하면 됩니다! (부족한 점수: ${Math.abs(gap)}점)<br><span style="font-size:13px; font-weight:normal;">이력서/자소서(Cover Letter) 작성 시 경험을 디테일하게 풀어내는 것이 관건입니다.</span>`;
        if (parseInt(document.getElementById('experience').value) <= 15) {
            feedbackText = dept.feedback_templates.need_experience;
        } else {
            feedbackText = dept.feedback_templates.high_score; // 학점 부족시 다른 피드백 필요
        }
    } else {
        gapAlert.className = "alert-box danger";
        gapAlert.innerHTML = `🚨 합격을 위해 상당한 스펙 보완이 필요합니다. (부족한 점수: ${Math.abs(gap)}점)<br><span style="font-size:13px; font-weight:normal;">현실적으로 서류 스크리닝에서 컷오프 당할 확률이 높습니다. 대체 전략이 필요합니다.</span>`;
        feedbackText = dept.feedback_templates.need_experience + ` 또한, 최소 요구 학점(${dept.requirements.min_degree})을 충족하는지 다시 한번 점검해주세요.`;
    }

    document.getElementById('unipia-feedback').textContent = feedbackText;

    // 필수 역량 태그
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

function resetTest() {
    // 폼 초기화
    document.querySelectorAll('input[name="year"]').forEach(r => r.checked = false);
    document.getElementById('major').selectedIndex = 0;

    document.getElementById('degree').value = "25";
    document.getElementById('experience').value = "0";
    document.getElementById('leadership').value = "0";

    document.getElementById('score-bar-fill').style.width = "0%";

    nextStep(1);
}
