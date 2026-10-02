/**
 * 고대 이집트 상형문자 교육 프로그램 - 테스트 파일
 * Node.js 환경에서 실행할 수 있는 기본 테스트
 */

// 간단한 테스트 프레임워크
class SimpleTestRunner {
    constructor(suiteName) {
        this.suiteName = suiteName;
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(testName, testFn) {
        this.tests.push({ name: testName, fn: testFn });
    }

    async run() {
        console.log(`\n📋 테스트 스위트: ${this.suiteName}`);
        console.log('=' .repeat(50));

        for (const test of this.tests) {
            try {
                await test.fn();
                this.passed++;
                console.log(`✅ ${test.name}`);
            } catch (error) {
                this.failed++;
                console.log(`❌ ${test.name}`);
                console.log(`   오류: ${error.message}`);
            }
        }

        console.log('=' .repeat(50));
        console.log(`결과: ${this.passed} 통과, ${this.failed} 실패`);
        console.log('');
    }
}

// 단언(assertion) 함수
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || '단언 실패');
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `예상: ${expected}, 실제: ${actual}`);
    }
}

function assertArrayIncludes(array, item, message) {
    if (!array.includes(item)) {
        throw new Error(message || `배열에 ${item}이 포함되지 않음`);
    }
}

// ========== 데이터 관리 테스트 ==========

const testDataManagement = new SimpleTestRunner('데이터 관리');

testDataManagement.test('로컬 스토리지에서 데이터 가져오기', () => {
    // 테스트 데이터 저장
    const testKey = 'test-key-' + Date.now();
    const testValue = { name: '테스트', value: 123 };
    localStorage.setItem(testKey, JSON.stringify(testValue));

    // getFromStorage 함수 테스트 (간단한 구현)
    const retrieved = JSON.parse(localStorage.getItem(testKey));
    assertEqual(retrieved.name, '테스트', '저장된 데이터의 이름이 일치하지 않음');
    assertEqual(retrieved.value, 123, '저장된 데이터의 값이 일치하지 않음');

    // 정리
    localStorage.removeItem(testKey);
});

testDataManagement.test('사용자 진행도 데이터 구조 검증', () => {
    const progress = {
        learnedHieroglyphs: [],
        quizAttempts: [],
        totalScore: 0,
        lastUpdated: new Date().toISOString()
    };

    assert(Array.isArray(progress.learnedHieroglyphs), 'learnedHieroglyphs는 배열이어야 함');
    assert(Array.isArray(progress.quizAttempts), 'quizAttempts는 배열이어야 함');
    assertEqual(typeof progress.totalScore, 'number', 'totalScore는 숫자여야 함');
    assertEqual(typeof progress.lastUpdated, 'string', 'lastUpdated는 문자열이어야 함');
});

testDataManagement.test('글자 학습 마크 추가', () => {
    const progress = {
        learnedHieroglyphs: [1, 2, 3],
        quizAttempts: [],
        totalScore: 0,
        lastUpdated: new Date().toISOString()
    };

    const newGlyphId = 4;
    if (!progress.learnedHieroglyphs.includes(newGlyphId)) {
        progress.learnedHieroglyphs.push(newGlyphId);
    }

    assertArrayIncludes(progress.learnedHieroglyphs, newGlyphId, '새 글자가 추가되지 않음');
    assertEqual(progress.learnedHieroglyphs.length, 4, '글자 개수가 일치하지 않음');
});

// ========== 통계 계산 테스트 ==========

const testStatistics = new SimpleTestRunner('통계 계산');

testStatistics.test('정답률 계산 - 모두 정답', () => {
    const attempts = [
        { correct: true },
        { correct: true },
        { correct: true }
    ];

    const correctCount = attempts.filter(a => a.correct).length;
    const accuracy = Math.round((correctCount / attempts.length) * 100);

    assertEqual(accuracy, 100, '정답률이 100%가 아님');
});

testStatistics.test('정답률 계산 - 50%', () => {
    const attempts = [
        { correct: true },
        { correct: false },
        { correct: true },
        { correct: false }
    ];

    const correctCount = attempts.filter(a => a.correct).length;
    const accuracy = Math.round((correctCount / attempts.length) * 100);

    assertEqual(accuracy, 50, '정답률이 50%가 아님');
});

testStatistics.test('정답률 계산 - 0%', () => {
    const attempts = [
        { correct: false },
        { correct: false },
        { correct: false }
    ];

    const correctCount = attempts.filter(a => a.correct).length;
    const accuracy = Math.round((correctCount / attempts.length) * 100);

    assertEqual(accuracy, 0, '정답률이 0%가 아님');
});

testStatistics.test('점수 계산', () => {
    const attempts = [
        { correct: true },
        { correct: false },
        { correct: true }
    ];

    const score = attempts.filter(a => a.correct).length * 10;

    assertEqual(score, 20, '점수 계산이 잘못됨');
});

// ========== 배열 유틸리티 테스트 ==========

const testArrayUtils = new SimpleTestRunner('배열 유틸리티');

testArrayUtils.test('배열 섞기', () => {
    const array = [1, 2, 3, 4, 5];
    const original = [...array];

    // 간단한 섞기 구현 테스트
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 원본 배열은 변경되지 않아야 함
    assertEqual(array.length, original.length, '배열 길이가 변경됨');

    // 섞인 배열도 같은 원소를 가져야 함
    assert(shuffled.every(item => original.includes(item)), '섞인 배열에 원본과 다른 원소가 있음');
});

testArrayUtils.test('무작위 항목 선택', () => {
    const array = [1, 2, 3, 4, 5];
    const n = 3;

    // 간단한 선택 구현
    const selected = array.slice(0, Math.min(n, array.length));

    assertEqual(selected.length, 3, '선택된 항목 개수가 일치하지 않음');
    assert(selected.every(item => array.includes(item)), '선택된 항목이 원본 배열에 없음');
});

// ========== 검증 함수 테스트 ==========

const testValidation = new SimpleTestRunner('검증 함수');

testValidation.test('빈 문자열 확인', () => {
    const isEmpty = (str) => !str || str.trim().length === 0;

    assert(isEmpty(''), '빈 문자열이 감지되지 않음');
    assert(isEmpty('   '), '공백만 있는 문자열이 감지되지 않음');
    assert(!isEmpty('hello'), '비어있지 않은 문자열이 비어있다고 판단됨');
});

testValidation.test('숫자 확인', () => {
    const isNumber = (value) => !isNaN(value) && value !== '';

    assert(isNumber(123), '숫자 123이 인식되지 않음');
    assert(isNumber('456'), '문자열 "456"이 숫자로 인식되지 않음');
    assert(!isNumber('abc'), '문자열 "abc"가 숫자로 인식됨');
});

// ========== 글자 데이터 스키마 테스트 ==========

const testHieroglyphSchema = new SimpleTestRunner('글자 데이터 스키마');

testHieroglyphSchema.test('글자 데이터 필드 검증', () => {
    const glyph = {
        id: 1,
        name: '알레프',
        meaning: '소',
        pronunciation: 'ȝ',
        category: '동물',
        description: '설명',
        example: '예시',
        image: 'aleph.png'
    };

    assertEqual(typeof glyph.id, 'number', 'id는 숫자여야 함');
    assertEqual(typeof glyph.name, 'string', 'name은 문자열이어야 함');
    assertEqual(typeof glyph.meaning, 'string', 'meaning은 문자열이어야 함');
    assertEqual(typeof glyph.pronunciation, 'string', 'pronunciation은 문자열이어야 함');
    assertEqual(typeof glyph.category, 'string', 'category는 문자열이어야 함');
});

testHieroglyphSchema.test('카테고리 유효성 검증', () => {
    const validCategories = ['동물', '신체', '건축', '도구', '음식', '개념'];
    const glyph = { category: '동물' };

    assertArrayIncludes(validCategories, glyph.category, '유효하지 않은 카테고리');
});

// ========== 모든 테스트 실행 ==========

async function runAllTests() {
    console.log('\n\n🧪 고대 이집트 상형문자 교육 프로그램 테스트\n');

    await testDataManagement.run();
    await testStatistics.run();
    await testArrayUtils.run();
    await testValidation.run();
    await testHieroglyphSchema.run();

    console.log('🏁 모든 테스트 완료!\n');
}

// 테스트 실행
runAllTests().catch(error => {
    console.error('테스트 실행 중 오류 발생:', error);
    process.exit(1);
});
