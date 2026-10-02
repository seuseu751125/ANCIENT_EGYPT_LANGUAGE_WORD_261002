/**
 * 고대 이집트 상형문자 교육 프로그램
 * 메인 애플리케이션 로직
 */

// ========== 글로벌 변수 ==========
let hieroglyphs = [];
let currentQuizIndex = 0;
let quizData = [];
let currentHieroglyphFilter = 'all';
let currentDifficultyFilter = 'all';

// ========== 초기화 함수 ==========

/**
 * 애플리케이션 초기화
 */
async function initializeApp() {
    try {
        logSuccess('앱 초기화 시작...');

        // 사용자 진행도 초기화
        initializeUserProgress();

        // 데이터 로드
        await loadHieroglyphs();

        // DOM 요소 설정
        setupEventListeners();

        // 초기 데이터 표시
        displayHieroglyphs();
        updateProgressDisplay();

        logSuccess('앱 초기화 완료!');
    } catch (error) {
        logError('앱 초기화 실패: ' + error.message);
    }
}

/**
 * 이집트 글자 데이터 로드
 */
async function loadHieroglyphs() {
    try {
        const response = await fetch('../data/hieroglyphs.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        hieroglyphs = await response.json();
        logSuccess(`${hieroglyphs.length}개의 글자 데이터 로드 완료`);
    } catch (error) {
        logError('글자 데이터 로드 실패: ' + error.message);
        // 로드 실패 시에도 기본 구조 유지
        hieroglyphs = [];
    }
}

// ========== 이벤트 리스너 설정 ==========

/**
 * 모든 이벤트 리스너 설정
 */
function setupEventListeners() {
    // 탭 버튼 클릭 이벤트
    const tabButtons = document.querySelectorAll('.nav-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', handleTabClick);
    });

    // 카테고리 필터 변경 이벤트
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleCategoryFilterChange);
    }

    // 난이도 버튼 클릭 이벤트
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    difficultyButtons.forEach(button => {
        button.addEventListener('click', handleDifficultyFilterChange);
    });

    logSuccess('이벤트 리스너 설정 완료');
}

/**
 * 탭 버튼 클릭 처리
 * @param {Event} event - 클릭 이벤트
 */
function handleTabClick(event) {
    const clickedButton = event.target;
    const tabName = clickedButton.dataset.tab;

    // 활성화된 탭 버튼 업데이트
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    clickedButton.classList.add('active');

    // 탭 콘텐츠 전환
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    // 퀴즈 탭 클릭 시 퀴즈 데이터 준비
    if (tabName === 'quiz' && quizData.length === 0) {
        prepareQuizData();
    }
}

/**
 * 카테고리 필터 변경 처리
 * @param {Event} event - 변경 이벤트
 */
function handleCategoryFilterChange(event) {
    currentHieroglyphFilter = event.target.value;
    displayHieroglyphs();
}

/**
 * 난이도 필터 변경 처리
 * @param {Event} event - 클릭 이벤트
 */
function handleDifficultyFilterChange(event) {
    const difficulty = event.target.dataset.difficulty;
    currentDifficultyFilter = difficulty;

    // 활성화 상태 업데이트
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    displayHieroglyphs();
}

// ========== 학습 탭 함수 ==========

/**
 * 필터링된 글자들 표시
 */
function displayHieroglyphs() {
    const container = document.getElementById('hieroglyphs-list');
    if (!container) return;

    // 필터링
    let filteredGlyphs = hieroglyphs;
    if (currentHieroglyphFilter !== 'all') {
        filteredGlyphs = filteredGlyphs.filter(glyph =>
            glyph.category === currentHieroglyphFilter
        );
    }

    // 난이도 필터
    if (currentDifficultyFilter !== 'all') {
        filteredGlyphs = filteredGlyphs.filter(glyph =>
            glyph.difficulty === currentDifficultyFilter
        );
    }

    // 컨테이너 초기화
    container.innerHTML = '';

    if (filteredGlyphs.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">조건에 맞는 글자가 없습니다.</p>';
        return;
    }

    // 글자 카드 생성
    filteredGlyphs.forEach(glyph => {
        const card = createHieroglyphCard(glyph);
        container.appendChild(card);
    });

    logSuccess(`${filteredGlyphs.length}개의 글자를 표시했습니다.`);
}

/**
 * 개별 글자 카드 생성
 * @param {object} glyph - 글자 데이터
 * @returns {HTMLElement} - 생성된 카드
 */
function createHieroglyphCard(glyph) {
    const card = createElement('div', 'hieroglyph-card');
    const progress = getUserProgress();
    const isLearned = progress.learnedHieroglyphs.includes(glyph.id);

    const imageEmoji = {
        '동물': '🦁',
        '신체': '👁️',
        '건축': '🏛️',
        '도구': '🔨',
        '음식': '🍞',
        '개념': '💭'
    };

    const historicalHTML = glyph.historicalContext
        ? `<p class="historical-context"><strong>역사 배경:</strong> ${glyph.historicalContext}</p>`
        : '';

    card.innerHTML = `
        <div class="card-image">${imageEmoji[glyph.category] || '📜'}</div>
        <div class="card-content">
            <h3>${glyph.name}</h3>
            <span class="category">${glyph.category}</span>
            ${isLearned ? '<span class="learned-badge">✓ 학습함</span>' : ''}
            <p><strong>의미:</strong> ${glyph.meaning}</p>
            <p><span class="pronunciation">발음:</span> ${glyph.pronunciation}</p>
            <p class="description">${glyph.description}</p>
            <p><em>${glyph.example}</em></p>
            ${historicalHTML}
        </div>
    `;

    // 카드 클릭 시 학습 마크
    card.addEventListener('click', () => {
        markHieroglyphAsLearned(glyph.id);
        const learnedBadge = card.querySelector('.learned-badge');
        if (!learnedBadge) {
            const newBadge = createElement('span', 'learned-badge');
            newBadge.textContent = '✓ 학습함';
            const categorySpan = card.querySelector('.category');
            categorySpan.parentElement.insertBefore(newBadge, categorySpan.nextSibling);
        }
        updateProgressDisplay();
        logSuccess(`"${glyph.name}" 글자를 학습 마크했습니다.`);
    });

    return card;
}

// ========== 퀴즈 탭 함수 ==========

/**
 * 퀴즈 데이터 준비
 */
function prepareQuizData() {
    if (hieroglyphs.length === 0) {
        logWarning('글자 데이터가 없어 퀴즈를 생성할 수 없습니다.');
        return;
    }

    // 무작위로 10개 문제 선택 (최대 데이터 개수까지)
    const quizCount = Math.min(10, hieroglyphs.length);
    quizData = getRandomItems(hieroglyphs, quizCount);
    currentQuizIndex = 0;
    displayQuizQuestion();
}

/**
 * 현재 퀴즈 문제 표시
 */
function displayQuizQuestion() {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    if (currentQuizIndex >= quizData.length) {
        // 모든 문제 완료
        displayQuizComplete();
        return;
    }

    const question = quizData[currentQuizIndex];
    const otherOptions = hieroglyphs
        .filter(h => h.id !== question.id)
        .slice(0, 3);
    const options = shuffleArray([question, ...otherOptions]);

    container.innerHTML = `
        <div class="quiz-question">
            <p>문제 ${currentQuizIndex + 1}/${quizData.length}</p>
            <h3>다음 상형문자의 의미는?</h3>
            <div style="font-size: 4em; text-align: center; margin: 20px 0;">
                📜
            </div>
            <p><strong>${question.pronunciation}</strong> (${question.name})</p>

            <div class="quiz-options">
                ${options.map((option, index) => `
                    <button class="quiz-option" data-id="${option.id}" data-correct="${option.id === question.id}">
                        ${option.meaning}
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    // 선택지 클릭 이벤트
    container.querySelectorAll('.quiz-option').forEach(option => {
        option.addEventListener('click', () => handleQuizAnswer(option, question.id));
    });
}

/**
 * 퀴즈 답 처리
 * @param {HTMLElement} selectedOption - 선택된 선택지
 * @param {number} questionId - 문제의 글자 ID
 */
function handleQuizAnswer(selectedOption, questionId) {
    const selectedId = parseInt(selectedOption.dataset.id);
    const isCorrect = selectedId === questionId;

    // 모든 선택지 비활성화
    document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.disabled = true;
    });

    // 선택 표시
    selectedOption.classList.add('selected');

    // 정답/오답 표시
    document.querySelectorAll('.quiz-option').forEach(opt => {
        if (opt.dataset.correct === 'true') {
            opt.classList.add('correct');
        } else if (opt.dataset.id === String(selectedId) && !isCorrect) {
            opt.classList.add('incorrect');
        }
    });

    // 시도 기록
    recordQuizAttempt({
        hieroglyphId: questionId,
        selected: selectedId,
        correct: isCorrect
    });

    // 다음 문제로 진행
    setTimeout(() => {
        currentQuizIndex++;
        displayQuizQuestion();
        updateProgressDisplay();
    }, 2000);
}

/**
 * 퀴즈 완료 표시
 */
function displayQuizComplete() {
    const container = document.getElementById('quiz-container');
    const progress = getUserProgress();
    const stats = calculateStatistics(hieroglyphs);

    container.innerHTML = `
        <div class="quiz-question" style="text-align: center;">
            <h3>🎉 퀴즈 완료!</h3>
            <p>정답률: <strong>${stats.quizAccuracy}%</strong></p>
            <p>정답: ${stats.correctAnswers}/${quizData.length}</p>
            <button class="quiz-button" onclick="resetQuiz()">
                다시 풀기
            </button>
        </div>
    `;

    quizData = [];
}

/**
 * 퀴즈 리셋
 */
function resetQuiz() {
    currentQuizIndex = 0;
    quizData = [];
    prepareQuizData();
}

// ========== 진행률 탭 함수 ==========

/**
 * 진행률 정보 업데이트 및 표시
 */
function updateProgressDisplay() {
    const stats = calculateStatistics(hieroglyphs);

    const learnedCountEl = document.getElementById('learned-count');
    const quizAccuracyEl = document.getElementById('quiz-accuracy');
    const totalScoreEl = document.getElementById('total-score');

    if (learnedCountEl) {
        learnedCountEl.textContent = `${stats.learnedCount} / ${stats.totalGlyphs}`;
    }
    if (quizAccuracyEl) {
        quizAccuracyEl.textContent = `${stats.quizAccuracy}%`;
    }
    if (totalScoreEl) {
        totalScoreEl.textContent = stats.totalScore;
    }
}

// ========== 페이지 로드 시 실행 ==========

// DOM이 완전히 로드되었을 때 앱 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // 이미 로드된 경우 즉시 실행
    initializeApp();
}

// ========== 도구 함수 ==========

/**
 * 진행도 초기화 (테스트용)
 */
function resetAllProgress() {
    if (confirm('정말로 모든 학습 기록을 삭제하시겠습니까?')) {
        removeFromStorage('userProgress');
        initializeUserProgress();
        updateProgressDisplay();
        logSuccess('학습 기록이 초기화되었습니다.');
    }
}

/**
 * 진행도 정보 출력 (디버그용)
 */
function printProgressInfo() {
    const progress = getUserProgress();
    console.table(progress);
}

// ========== 프로필 페이지 함수 ==========

/**
 * 프로필 페이지 업데이트
 */
function updateProfilePage() {
    const progress = getUserProgress();
    const stats = calculateStatistics(hieroglyphs);

    // 기본 통계 업데이트
    const totalLearnedEl = document.getElementById('profile-total-learned');
    const correctAnswersEl = document.getElementById('profile-correct-answers');
    const quizAttemptsEl = document.getElementById('profile-quiz-attempts');
    const totalPointsEl = document.getElementById('profile-total-points');

    if (totalLearnedEl) totalLearnedEl.textContent = `${stats.learnedCount}개`;
    if (correctAnswersEl) correctAnswersEl.textContent = `${stats.correctAnswers}개`;
    if (quizAttemptsEl) quizAttemptsEl.textContent = `${stats.quizAttempts}회`;
    if (totalPointsEl) totalPointsEl.textContent = `${stats.totalScore}점`;

    // 난이도별 진행률 업데이트
    updateDifficultyProgress();

    // 카테고리별 진행률 업데이트
    updateCategoryProgress();
}

/**
 * 난이도별 학습 진행률 업데이트
 */
function updateDifficultyProgress() {
    const progress = getUserProgress();

    const difficulties = [
        { key: 'beginner', label: '초급', difficulty: '초급' },
        { key: 'intermediate', label: '중급', difficulty: '중급' },
        { key: 'advanced', label: '고급', difficulty: '고급' }
    ];

    difficulties.forEach(diff => {
        const totalInDifficulty = hieroglyphs.filter(g => g.difficulty === diff.difficulty).length;
        const learnedInDifficulty = progress.learnedHieroglyphs.filter(id => {
            const glyph = hieroglyphs.find(g => g.id === id);
            return glyph && glyph.difficulty === diff.difficulty;
        }).length;

        const percentage = totalInDifficulty > 0 ? (learnedInDifficulty / totalInDifficulty) * 100 : 0;

        // 진행 바 업데이트
        const progressFill = document.getElementById(`progress-${diff.key}`);
        if (progressFill) {
            progressFill.style.width = percentage + '%';
        }

        // 텍스트 업데이트
        const progressText = document.getElementById(`progress-${diff.key}-text`);
        if (progressText) {
            progressText.textContent = `${learnedInDifficulty}/${totalInDifficulty}`;
        }
    });
}

/**
 * 카테고리별 학습 진행률 업데이트
 */
function updateCategoryProgress() {
    const progress = getUserProgress();
    const categoryStatsEl = document.getElementById('category-stats');

    if (!categoryStatsEl) return;

    const categories = ['동물', '신체', '건축', '도구', '음식', '개념'];
    let html = '';

    categories.forEach(category => {
        const totalInCategory = hieroglyphs.filter(g => g.category === category).length;
        const learnedInCategory = progress.learnedHieroglyphs.filter(id => {
            const glyph = hieroglyphs.find(g => g.id === id);
            return glyph && glyph.category === category;
        }).length;

        html += `
            <div class="category-stat-item">
                <h5>${category}</h5>
                <p>${learnedInCategory}/${totalInCategory}</p>
            </div>
        `;
    });

    categoryStatsEl.innerHTML = html;
}
