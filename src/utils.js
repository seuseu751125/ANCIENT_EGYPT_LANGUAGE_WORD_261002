/**
 * 유틸리티 함수 모음
 * 데이터 관리, 로컬 스토리지, 도우미 함수들
 */

// ========== 로컬 스토리지 관리 ==========

/**
 * 로컬 스토리지에서 데이터 가져오기
 * @param {string} key - 저장된 데이터의 키
 * @param {*} defaultValue - 기본값
 * @returns {*} - 저장된 데이터 또는 기본값
 */
function getFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error(`로컬 스토리지 읽기 오류 (${key}):`, error);
        return defaultValue;
    }
}

/**
 * 로컬 스토리지에 데이터 저장하기
 * @param {string} key - 저장할 데이터의 키
 * @param {*} value - 저장할 데이터
 */
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`로컬 스토리지 저장 오류 (${key}):`, error);
    }
}

/**
 * 로컬 스토리지의 특정 항목 제거
 * @param {string} key - 제거할 데이터의 키
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`로컬 스토리지 제거 오류 (${key}):`, error);
    }
}

// ========== 데이터 관리 함수 ==========

/**
 * 사용자 진행도 데이터 초기화
 */
function initializeUserProgress() {
    const existingProgress = getFromStorage('userProgress');
    if (!existingProgress) {
        const initialProgress = {
            learnedHieroglyphs: [],
            quizAttempts: [],
            totalScore: 0,
            lastUpdated: new Date().toISOString()
        };
        saveToStorage('userProgress', initialProgress);
        return initialProgress;
    }
    return existingProgress;
}

/**
 * 사용자 진행도 가져오기
 * @returns {object} - 사용자 진행도 데이터
 */
function getUserProgress() {
    return getFromStorage('userProgress', {
        learnedHieroglyphs: [],
        quizAttempts: [],
        totalScore: 0,
        lastUpdated: new Date().toISOString()
    });
}

/**
 * 글자 학습 마크하기
 * @param {number} hieroglyphId - 글자 ID
 */
function markHieroglyphAsLearned(hieroglyphId) {
    const progress = getUserProgress();
    if (!progress.learnedHieroglyphs.includes(hieroglyphId)) {
        progress.learnedHieroglyphs.push(hieroglyphId);
        progress.lastUpdated = new Date().toISOString();
        saveToStorage('userProgress', progress);
    }
}

/**
 * 퀴즈 시도 기록하기
 * @param {object} attempt - 퀴즈 시도 데이터 {hieroglyphId, selected, correct, timestamp}
 */
function recordQuizAttempt(attempt) {
    const progress = getUserProgress();
    progress.quizAttempts.push({
        ...attempt,
        timestamp: new Date().toISOString()
    });

    // 정답이면 점수 추가
    if (attempt.correct) {
        progress.totalScore += 10;
    }

    progress.lastUpdated = new Date().toISOString();
    saveToStorage('userProgress', progress);
}

/**
 * 학습 통계 계산하기
 * @param {array} hieroglyphs - 전체 글자 배열
 * @returns {object} - 통계 정보
 */
function calculateStatistics(hieroglyphs) {
    const progress = getUserProgress();
    const totalGlyphs = hieroglyphs.length;
    const learnedCount = progress.learnedHieroglyphs.length;
    const quizAttempts = progress.quizAttempts.length;

    let correctAnswers = 0;
    progress.quizAttempts.forEach(attempt => {
        if (attempt.correct) {
            correctAnswers++;
        }
    });

    const quizAccuracy = quizAttempts > 0
        ? Math.round((correctAnswers / quizAttempts) * 100)
        : 0;

    return {
        learnedCount,
        totalGlyphs,
        quizAttempts,
        correctAnswers,
        quizAccuracy,
        totalScore: progress.totalScore
    };
}

// ========== DOM 관련 함수 ==========

/**
 * HTML 요소 생성하기
 * @param {string} tag - 태그명
 * @param {string} className - 클래스명
 * @param {string} content - 내용
 * @returns {HTMLElement} - 생성된 요소
 */
function createElement(tag, className = '', content = '') {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (content) {
        element.innerHTML = content;
    }
    return element;
}

/**
 * 요소 활성화/비활성화
 * @param {HTMLElement} element - 대상 요소
 * @param {string} activeClass - 활성화 클래스명
 */
function toggleActiveClass(element, activeClass = 'active') {
    element.classList.toggle(activeClass);
}

/**
 * 모든 형제 요소에서 활성화 클래스 제거
 * @param {HTMLElement} element - 기준 요소
 * @param {string} activeClass - 활성화 클래스명
 */
function removeActiveSiblings(element, activeClass = 'active') {
    const parent = element.parentElement;
    if (parent) {
        parent.querySelectorAll('.' + activeClass).forEach(el => {
            el.classList.remove(activeClass);
        });
    }
}

// ========== 배열 유틸리티 ==========

/**
 * 배열을 섞기 (Fisher-Yates Shuffle)
 * @param {array} array - 섞을 배열
 * @returns {array} - 섞인 배열의 복사본
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * 배열에서 무작위로 n개 선택하기
 * @param {array} array - 대상 배열
 * @param {number} n - 선택할 개수
 * @returns {array} - 선택된 항목들
 */
function getRandomItems(array, n) {
    const shuffled = shuffleArray(array);
    return shuffled.slice(0, Math.min(n, array.length));
}

// ========== 검증 함수 ==========

/**
 * 문자열이 비어있는지 확인
 * @param {string} str - 확인할 문자열
 * @returns {boolean} - 비어있으면 true
 */
function isEmpty(str) {
    return !str || str.trim().length === 0;
}

/**
 * 숫자인지 확인
 * @param {*} value - 확인할 값
 * @returns {boolean} - 숫자면 true
 */
function isNumber(value) {
    return !isNaN(value) && value !== '';
}

// ========== 시간 관련 함수 ==========

/**
 * 현재 시간을 포맷된 문자열로 반환
 * @returns {string} - "YYYY-MM-DD HH:MM:SS" 형식
 */
function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
}

// ========== 콘솔 로그 헬퍼 ==========

/**
 * 개발 모드 로그 출력
 * @param {*} message - 출력할 메시지
 */
function devLog(message) {
    if (typeof message === 'object') {
        console.log('📋 DEBUG:', JSON.stringify(message, null, 2));
    } else {
        console.log('📋 DEBUG:', message);
    }
}

/**
 * 성공 메시지 로그
 * @param {string} message - 메시지
 */
function logSuccess(message) {
    console.log('✅ SUCCESS:', message);
}

/**
 * 경고 메시지 로그
 * @param {string} message - 메시지
 */
function logWarning(message) {
    console.warn('⚠️ WARNING:', message);
}

/**
 * 오류 메시지 로그
 * @param {string} message - 메시지
 */
function logError(message) {
    console.error('❌ ERROR:', message);
}

// ========== 게임화 시스템 ==========

/**
 * 배지 목록 정의
 */
const BADGES = {
    FIRST_STEP: {
        id: 'first_step',
        name: '🎯 첫 걸음',
        description: '첫 글자를 학습했습니다',
        condition: (progress) => progress.learnedHieroglyphs.length >= 1,
        icon: '🎯'
    },
    LEARNER: {
        id: 'learner',
        name: '📚 학습자',
        description: '10개의 글자를 학습했습니다',
        condition: (progress) => progress.learnedHieroglyphs.length >= 10,
        icon: '📚'
    },
    SCHOLAR: {
        id: 'scholar',
        name: '🧠 학자',
        description: '20개의 글자를 학습했습니다',
        condition: (progress) => progress.learnedHieroglyphs.length >= 20,
        icon: '🧠'
    },
    MASTER: {
        id: 'master',
        name: '👑 마스터',
        description: '모든 글자를 학습했습니다',
        condition: (progress) => progress.learnedHieroglyphs.length >= 30,
        icon: '👑'
    },
    QUIZ_STARTER: {
        id: 'quiz_starter',
        name: '🎮 퀴즈 시작',
        description: '첫 퀴즈를 풀었습니다',
        condition: (progress) => progress.quizAttempts.length >= 1,
        icon: '🎮'
    },
    QUIZ_MASTER: {
        id: 'quiz_master',
        name: '🏆 퀴즈 챔피언',
        description: '50개의 퀴즈를 풀었습니다',
        condition: (progress) => progress.quizAttempts.length >= 50,
        icon: '🏆'
    },
    HIGH_SCORER: {
        id: 'high_scorer',
        name: '⭐ 고득점자',
        description: '100점 이상을 획득했습니다',
        condition: (progress) => progress.totalScore >= 100,
        icon: '⭐'
    },
    PERFECT_QUIZ: {
        id: 'perfect_quiz',
        name: '💯 완벽한 정답',
        description: '한 번에 10개 문제를 모두 맞혔습니다',
        condition: (progress) => {
            if (progress.quizAttempts.length < 10) return false;
            const lastTenAttempts = progress.quizAttempts.slice(-10);
            return lastTenAttempts.every(attempt => attempt.correct);
        },
        icon: '💯'
    }
};

/**
 * 사용자가 획득한 배지 확인
 * @param {object} progress - 사용자 진행도
 * @returns {array} - 획득한 배지 목록
 */
function getUnlockedBadges(progress) {
    const unlocked = [];
    for (const badgeKey in BADGES) {
        const badge = BADGES[badgeKey];
        if (badge.condition(progress)) {
            unlocked.push(badge);
        }
    }
    return unlocked;
}

/**
 * 사용자 배지 저장
 * @param {object} progress - 사용자 진행도
 */
function saveUserBadges(progress) {
    const unlocked = getUnlockedBadges(progress);
    const badgeIds = unlocked.map(b => b.id);
    progress.unlockedBadges = badgeIds;
    saveToStorage('userProgress', progress);
}

/**
 * 연속 정답 스트릭 계산
 * @param {array} quizAttempts - 퀴즈 시도 목록
 * @returns {number} - 현재 스트릭
 */
function getCurrentStreak(quizAttempts) {
    if (quizAttempts.length === 0) return 0;

    let streak = 0;
    for (let i = quizAttempts.length - 1; i >= 0; i--) {
        if (quizAttempts[i].correct) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

/**
 * 최고 스트릭 계산
 * @param {array} quizAttempts - 퀴즈 시도 목록
 * @returns {number} - 최고 스트릭
 */
function getMaxStreak(quizAttempts) {
    if (quizAttempts.length === 0) return 0;

    let maxStreak = 0;
    let currentStreak = 0;

    for (const attempt of quizAttempts) {
        if (attempt.correct) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 0;
        }
    }

    return maxStreak;
}
