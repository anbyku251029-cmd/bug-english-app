import { DrawingBoard } from './components/DrawingBoard.js';
import { AIChat } from './components/AIChat.js';
import { ParentDashboard } from './components/ParentDashboard.js';
import insectsData from './data/insects.json';

// 애플리케이션 상태 관리
class App {
  constructor() {
    this.insects = insectsData; // 곤충 데이터베이스
    this.currentView = 'home'; // home | level | learn | parent
    this.activeInsectId = null;
    this.activeLevelId = 'level1';
    this.activeTab = 'book'; // book | words | quiz | activity | ai
    
    // 리딩 진도
    this.bookCurrentPage = 0;
    
    // 퀴즈 임시 상태
    this.quizAnswers = [];
    this.quizFinished = false;

    // 배지 정보
    this.badges = {
      first_book: { name: '첫 탐험가 🥇', desc: '첫 번째 그림책을 완료했어요!', emoji: '🥇' },
      quiz_perfect: { name: '퀴즈 왕 🏆', desc: '퀴즈 만점을 기록했어요!', emoji: '🏆' },
      first_drawing: { name: '꼬마 예술가 🎨', desc: '첫 독후 그림을 저장했어요!', emoji: '🎨' },
      all_read: { name: '곤충 대장 👑', desc: '12종의 곤충책을 모두 읽었어요!', emoji: '👑' },
      ai_explorer: { name: 'AI 탐험가 🤖', desc: 'AI 박사님께 궁금한 점을 질문했어요!', emoji: '🤖' }
    };
  }

  // 앱 실행
  async init() {
    try {
      // 2. DOM 요소 바인딩 및 이벤트 설정
      this.bindGlobalEvents();
      
      // 3. 상단 헤더 학습 진행도 집계
      this.updateHeaderStats();
      
      // 4. 초기 뷰 렌더링
      this.navigate('home');
    } catch (error) {
      console.error('App 초기화 오류:', error);
      document.getElementById('app').innerHTML = `
        <div class="welcome-banner" style="background:#ffebee; border-color:#ef9a9a;">
          <h2 style="color:#c62828;">오류 발생 ⚠️</h2>
          <p>데이터 로드에 실패했습니다. Vite 개발 서버가 작동 중인지 확인해 주세요.</p>
        </div>
      `;
    }
  }

  // 상단 로컬스토리지 진행 데이터 집계 및 표기
  updateHeaderStats() {
    let totalStars = 0;
    let completedBugs = 0;
    const insectKeys = Object.keys(this.insects);

    insectKeys.forEach(id => {
      const progress = JSON.parse(localStorage.getItem(`bug_progress_${id}`) || '{"read":false,"quiz":false,"activity":false}');
      let stars = 0;
      if (progress.read) stars++;
      if (progress.quiz) stars++;
      if (progress.activity) stars++;
      
      totalStars += stars;
      if (stars === 3) {
        completedBugs++;
      }
    });

    document.getElementById('header-stars-count').textContent = totalStars;
    document.getElementById('header-bugs-count').textContent = `${completedBugs}/${insectKeys.length}`;
  }

  bindGlobalEvents() {
    // 로고 클릭 시 홈으로 이동
    document.getElementById('btn-home').addEventListener('click', () => {
      window.speechSynthesis.cancel();
      this.navigate('home');
    });

    // 부모 화면 버튼 클릭
    document.getElementById('btn-parent-mode').addEventListener('click', () => {
      this.openParentGate(() => {
        window.speechSynthesis.cancel();
        this.navigate('parent');
      });
    });

    // 모달 닫기
    document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') this.closeModal();
    });
  }

  // 뷰 네비게이터
  navigate(view, options = {}) {
    this.currentView = view;
    
    if (options.insectId) this.activeInsectId = options.insectId;
    if (options.levelId) this.activeLevelId = options.levelId;
    if (options.tab) this.activeTab = options.tab;

    // 헤더 상태 최신화
    this.updateHeaderStats();

    // 화면 렌더링 분기
    switch(view) {
      case 'home':
        this.renderHome();
        break;
      case 'level':
        this.renderLevelSelect();
        break;
      case 'learn':
        this.renderLearnPanel();
        break;
      case 'parent':
        this.renderParentDashboard();
        break;
    }
  }

  // 1. 메인 곤충 선택 뷰
  renderHome() {
    const appEl = document.getElementById('app');
    const bugKeys = Object.keys(this.insects);

    let cardsHtml = bugKeys.map(key => {
      const bug = this.insects[key];
      // 각 곤충 진행 상태 가져오기
      const progress = JSON.parse(localStorage.getItem(`bug_progress_${key}`) || '{"read":false,"quiz":false,"activity":false}');
      
      let starCount = 0;
      if (progress.read) starCount++;
      if (progress.quiz) starCount++;
      if (progress.activity) starCount++;

      const starsHtml = Array(3).fill(0).map((_, idx) => `
        <span style="color: ${idx < starCount ? 'var(--accent)' : '#ccc'}">★</span>
      `).join('');

      return `
        <div class="insect-card" data-id="${key}">
          <div class="card-emoji">${bug.icon}</div>
          <h3>${bug.nameEn}</h3>
          <p>${bug.nameKo}</p>
          <div class="card-stars">${starsHtml}</div>
          <div class="card-status ${starCount > 0 ? 'unlocked' : ''}">
            ${starCount === 3 ? '🎉 완료!' : starCount > 0 ? '👍 학습 중' : '🌱 시작하기'}
          </div>
        </div>
      `;
    }).join('');

    // 획득한 배지 가져오기 및 렌더링
    const unlockedBadges = JSON.parse(localStorage.getItem('bug_unlocked_badges') || '[]');
    let badgesHtml = Object.keys(this.badges).map(key => {
      const b = this.badges[key];
      const isUnlocked = unlockedBadges.includes(key);
      return `
        <div class="badge-item ${isUnlocked ? 'unlocked' : ''}" title="${b.desc}">
          <div class="badge-icon">${isUnlocked ? b.emoji : '🔒'}</div>
          <span class="badge-name">${b.name.split(' ')[0]}</span>
        </div>
      `;
    }).join('');

    appEl.innerHTML = `
      <div class="home-container">
        <div class="welcome-banner">
          <h1>🌿 곤충 영어 리딩 나라에 온 것을 환영해요!</h1>
          <p>공부하고 싶은 곤충을 선택해 재미있는 영어 동화책을 읽고 도감을 모아보세요!</p>
        </div>
        
        <div class="insect-grid">
          ${cardsHtml}
        </div>

        <!-- 뱃지 진열장 섹션 추가 -->
        <div class="badge-cabinet" style="margin-top: 32px;">
          <h3>🏅 나의 곤충 배지 진열장</h3>
          <div class="badges-grid">
            ${badgesHtml}
          </div>
        </div>
      </div>
    `;

    // 카드 클릭 이벤트
    appEl.querySelectorAll('.insect-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        this.navigate('level', { insectId: id });
      });
    });
  }

  // 2. 레벨 선택 뷰
  renderLevelSelect() {
    const appEl = document.getElementById('app');
    const bug = this.insects[this.activeInsectId];

    appEl.innerHTML = `
      <div class="level-select-container">
        <div class="level-title">
          <h2>${bug.icon} ${bug.nameEn} (${bug.nameKo}) 책의 난이도 선택</h2>
          <p>내 영어 실력에 딱 맞는 단계를 선택해봐요!</p>
        </div>
        <div class="level-grid">
          <div class="level-card" data-level="level1">
            <span class="level-number">Lv. 1</span>
            <span class="level-badge">유치원 과정</span>
            <h4>쉬운 기초 단어 단독</h4>
            <p><strong>This is an ant.</strong> 처럼 짧고 단단한 기본 영어 문장을 익혀요.</p>
          </div>
          <div class="level-card" data-level="level2">
            <span class="level-number">Lv. 2</span>
            <span class="level-badge">초등 1~2학년</span>
            <h4>짧은 묘사 문장</h4>
            <p><strong>The ant carries food.</strong> 처럼 행동과 색상을 설명하는 문장을 배워요.</p>
          </div>
          <div class="level-card" data-level="level3">
            <span class="level-number">Lv. 3</span>
            <span class="level-badge">초등 3~4학년</span>
            <h4>이야기 및 생태 설명</h4>
            <p><strong>Ants live together in colonies.</strong> 처럼 흥미로운 곤충 지식을 읽어요.</p>
          </div>
          <div class="level-card" data-level="level4">
            <span class="level-number">Lv. 4</span>
            <span class="level-badge">초등 5~6학년</span>
            <h4>과학 정보 깊이 읽기</h4>
            <p><strong>Ants communicate using chemicals.</strong> 처럼 전문적인 자연과학 상식을 탐구해요.</p>
          </div>
        </div>
        <button id="btn-back-to-home" class="btn btn-secondary">⬅️ 곤충 목록으로 돌아가기</button>
      </div>
    `;

    // 이벤트 리스너
    appEl.querySelectorAll('.level-card').forEach(card => {
      card.addEventListener('click', () => {
        const lv = card.dataset.level;
        this.bookCurrentPage = 0;
        this.navigate('learn', { levelId: lv, tab: 'book' });
      });
    });

    document.getElementById('btn-back-to-home').addEventListener('click', () => {
      this.navigate('home');
    });
  }

  // 3. 리딩 및 학습 종합 패널 (탭 네비게이션)
  renderLearnPanel() {
    const appEl = document.getElementById('app');
    const bug = this.insects[this.activeInsectId];
    const levelLabels = { level1: 'Level 1', level2: 'Level 2', level3: 'Level 3', level4: 'Level 4' };

    appEl.innerHTML = `
      <div class="learning-wrapper">
        <!-- 곤충 정보 바 -->
        <div class="bug-header-bar">
          <div class="bug-title-info">
            <span style="font-size:2.2rem;">${bug.icon}</span>
            <div>
              <h2>${bug.nameEn} (${bug.nameKo})</h2>
              <span class="level-tag">${levelLabels[this.activeLevelId]}</span>
            </div>
          </div>
          <button id="btn-change-level" class="btn btn-secondary">⚙️ 레벨 변경하기</button>
        </div>

        <!-- 탭 헤더 -->
        <nav class="learning-tabs">
          <button class="tab-btn ${this.activeTab === 'book' ? 'active' : ''}" data-tab="book">📖 그림책 읽기</button>
          <button class="tab-btn ${this.activeTab === 'words' ? 'active' : ''}" data-tab="words">🔤 단어 배우기</button>
          <button class="tab-btn ${this.activeTab === 'quiz' ? 'active' : ''}" data-tab="quiz">🧠 정답 퀴즈</button>
          <button class="tab-btn ${this.activeTab === 'activity' ? 'active' : ''}" data-tab="activity">🎨 독후 활동</button>
          <button class="tab-btn ${this.activeTab === 'ai' ? 'active' : ''}" data-tab="ai">🤖 AI 곤충 대화</button>
        </nav>

        <!-- 동적 탭 본문 영역 -->
        <div class="tab-panel">
          <div class="panel-content ${this.activeTab === 'book' ? 'active' : ''}" id="panel-book"></div>
          <div class="panel-content ${this.activeTab === 'words' ? 'active' : ''}" id="panel-words"></div>
          <div class="panel-content ${this.activeTab === 'quiz' ? 'active' : ''}" id="panel-quiz"></div>
          <div class="panel-content ${this.activeTab === 'activity' ? 'active' : ''}" id="panel-activity"></div>
          <div class="panel-content ${this.activeTab === 'ai' ? 'active' : ''}" id="panel-ai"></div>
        </div>
      </div>
    `;

    // 이벤트 연결
    document.getElementById('btn-change-level').addEventListener('click', () => {
      window.speechSynthesis.cancel();
      this.navigate('level');
    });

    appEl.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.speechSynthesis.cancel(); // 탭 이동 시 읽고 있던 오디오 음소거
        const targetTab = btn.dataset.tab;
        this.navigate('learn', { tab: targetTab });
      });
    });

    // 개별 탭 세부 렌더링
    this.renderBookTab();
    this.renderWordsTab();
    this.renderQuizTab();
    this.renderActivityTab();
    this.renderAiTab();
  }

  // ① 탭: 그림책 읽기
  // ① 탭: 그림책 읽기 (양면 책장 넘김 스타일)
  renderBookTab() {
    const container = document.getElementById('panel-book');
    if (!container) return;

    const bug = this.insects[this.activeInsectId];
    const storyLines = bug.levels[this.activeLevelId].story;
    
    // 항상 짝수 인덱스(0, 2, 4...)로 맞추어 좌우 양면이 세트로 나오도록 제어
    if (this.bookCurrentPage % 2 !== 0) {
      this.bookCurrentPage = Math.max(0, this.bookCurrentPage - 1);
    }

    const leftLine = storyLines[this.bookCurrentPage];
    const rightLine = storyLines[this.bookCurrentPage + 1] || "";

    // 1. 왼쪽 페이지 단어 스팬 쪼개기
    const leftWords = leftLine.split(' ');
    const leftSpanTextHtml = leftWords.map((word, idx) => `
      <span class="story-word left-word" data-index="${idx}">${word}</span>
    `).join(' ');

    // 2. 오른쪽 페이지 단어 스팬 쪼개기
    const rightWords = rightLine ? rightLine.split(' ') : [];
    const rightSpanTextHtml = rightWords.map((word, idx) => `
      <span class="story-word right-word" data-index="${idx}">${word}</span>
    `).join(' ');

    container.innerHTML = `
      <div class="book-container">
        <!-- 양면 책 스프레드 -->
        <div class="book-spread" id="book-spread">
          <!-- 입체적인 가운데 책등 -->
          <div class="book-spine"></div>

          <!-- 왼쪽 면 (Page N) -->
          <div class="book-page-half left-half">
            <p class="story-text">
              ${leftSpanTextHtml}
            </p>
            <div class="audio-controls">
              <button id="btn-play-left" class="btn-audio" title="왼쪽 책장 읽기">🔊</button>
              <span style="font-size:0.8rem; color:var(--text-light); font-weight:600;">왼쪽 듣기</span>
            </div>
            <span class="page-corner-number">${this.bookCurrentPage + 1}</span>
          </div>

          <!-- 오른쪽 면 (Page N+1) -->
          <div class="book-page-half right-half">
            <p class="story-text">
              ${rightSpanTextHtml || "끝"}
            </p>
            ${rightLine ? `
              <div class="audio-controls">
                <button id="btn-play-right" class="btn-audio" title="오른쪽 책장 읽기">🔊</button>
                <span style="font-size:0.8rem; color:var(--text-light); font-weight:600;">오른쪽 듣기</span>
              </div>
            ` : ''}
            <span class="page-corner-number">${this.bookCurrentPage + 2}</span>
          </div>
        </div>

        <!-- 하단 네비게이션 및 진척도 -->
        <div class="page-navigation">
          <button id="btn-prev-page" class="btn btn-secondary" ${this.bookCurrentPage === 0 ? 'disabled' : ''}>⬅️ 이전 책장</button>
          <span class="page-indicator">${this.bookCurrentPage + 1}-${this.bookCurrentPage + 2} / ${storyLines.length}</span>
          <button id="btn-next-page" class="btn btn-primary">
            ${this.bookCurrentPage + 2 >= storyLines.length ? '🎉 다 읽었어요!' : '다음 책장 ➡️'}
          </button>
        </div>
      </div>
    `;

    // 이벤트 리스너 바인딩
    // 왼쪽 재생
    container.querySelector('#btn-play-left').addEventListener('click', () => {
      this.playStoryAudio(leftLine, leftWords, 'left');
    });

    // 오른쪽 재생
    const playRightBtn = container.querySelector('#btn-play-right');
    if (playRightBtn) {
      playRightBtn.addEventListener('click', () => {
        this.playStoryAudio(rightLine, rightWords, 'right');
      });
    }

    // 이전 책장 넘기기 (애니메이션 탑재)
    container.querySelector('#btn-prev-page').addEventListener('click', () => {
      window.speechSynthesis.cancel();
      const spread = container.querySelector('#book-spread');
      spread.classList.add('turning');
      
      // 애니메이션 회전 중간(250ms)에 데이터 교체 후 리랜더링
      setTimeout(() => {
        this.bookCurrentPage = Math.max(0, this.bookCurrentPage - 2);
        this.renderBookTab();
      }, 250);
    });

    // 다음 책장 넘기기 및 완독 (애니메이션 탑재)
    container.querySelector('#btn-next-page').addEventListener('click', () => {
      window.speechSynthesis.cancel();
      if (this.bookCurrentPage + 2 < storyLines.length) {
        const spread = container.querySelector('#book-spread');
        spread.classList.add('turning');
        
        setTimeout(() => {
          this.bookCurrentPage += 2;
          this.renderBookTab();
        }, 250);
      } else {
        // 완독 완료 로직
        const progressKey = `bug_progress_${this.activeInsectId}`;
        const progress = JSON.parse(localStorage.getItem(progressKey) || '{"read":false,"quiz":false,"activity":false}');
        
        const newlyCompleted = !progress.read;
        progress.read = true;
        localStorage.setItem(progressKey, JSON.stringify(progress));
        
        alert('축하합니다! 이 책을 다 읽었습니다. 별 1개를 획득했어요! ⭐');
        this.updateHeaderStats();

        if (newlyCompleted) {
          this.checkAndAwardBadges();
        }
        
        this.navigate('learn', { tab: 'words' });
      }
    });
  }

  // TTS 재생 및 지정된 면(Left/Right) 글자 싱크 하이라이팅
  playStoryAudio(text, wordsArray, side) {
    if (!('speechSynthesis' in window)) {
      alert('이 브라우저는 오디오 음성 출력을 지원하지 않습니다.');
      return;
    }

    window.speechSynthesis.cancel(); // 다른 음성 중지
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8; 
    
    utterance.onboundary = (e) => {
      if (e.name === 'word') {
        let charSum = 0;
        let activeIdx = -1;
        
        for (let i = 0; i < wordsArray.length; i++) {
          if (charSum >= e.charIndex) {
            activeIdx = i - 1;
            break;
          }
          charSum += wordsArray[i].length + 1;
        }
        if (activeIdx === -1 && charSum > e.charIndex) {
          activeIdx = wordsArray.length - 1;
        }

        // 왼쪽 혹은 오른쪽 스팬들만 필터링하여 선택 하이라이팅
        const spans = document.querySelectorAll(`.story-word.${side}-word`);
        spans.forEach(s => s.classList.remove('active-word'));
        const activeSpan = document.querySelector(`.story-word.${side}-word[data-index="${activeIdx}"]`);
        if (activeSpan) {
          activeSpan.classList.add('active-word');
        }
      }
    };

    utterance.onend = () => {
      const spans = document.querySelectorAll(`.story-word.${side}-word`);
      spans.forEach(s => s.classList.remove('active-word'));
    };

    window.speechSynthesis.speak(utterance);
  }

  // ② 탭: 단어 배우기
  renderWordsTab() {
    const container = document.getElementById('panel-words');
    if (!container) return;

    const bug = this.insects[this.activeInsectId];
    const learnedWords = JSON.parse(localStorage.getItem(`bug_words_${this.activeInsectId}`) || '[]');

    container.innerHTML = `
      <div class="vocabulary-container">
        <h3>🔤 단어 카드 뒤집기</h3>
        <p>단어 카드를 클릭하여 뜻을 확인하고 스피커 단추로 영어 발음을 들어보세요.</p>
        
        <div class="cards-grid">
          ${bug.words.map((w, idx) => {
            const isLearned = learnedWords.includes(w.word);
            return `
              <div class="word-card-container" data-word="${w.word}">
                <div class="word-card">
                  <!-- 앞면 (영어) -->
                  <div class="card-front">
                    <span class="word-en">${w.word}</span>
                    <button class="sound-btn btn-speak-word" data-word="${w.word}">🔊</button>
                    <span class="card-prompt">카드를 클릭해 보세요!</span>
                  </div>
                  <!-- 뒷면 (한국어 뜻 & 예문) -->
                  <div class="card-back">
                    <span class="word-ko">${w.meaning}</span>
                    <p class="word-example">"${w.example}"</p>
                    <button class="btn btn-secondary btn-speak-example" data-example="${w.example}" style="padding:6px 12px; font-size:0.85rem;">
                      🔊 예문 듣기
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // 카드 제어 바인딩
    container.querySelectorAll('.word-card-container').forEach(card => {
      card.addEventListener('click', (e) => {
        // 사운드 버튼 클릭 시 플립 방지
        if (e.target.closest('.sound-btn') || e.target.closest('.btn-speak-example')) {
          return;
        }
        card.classList.toggle('flipped');

        // 단어를 한 번 확인한 경우 '학습된 단어'로 기록 보관
        const wordName = card.dataset.word;
        const currentLearned = JSON.parse(localStorage.getItem(`bug_words_${this.activeInsectId}`) || '[]');
        if (!currentLearned.includes(wordName)) {
          currentLearned.push(wordName);
          localStorage.setItem(`bug_words_${this.activeInsectId}`, JSON.stringify(currentLearned));
          this.updateHeaderStats();
        }
      });
    });

    // 개별 단어 발음 듣기
    container.querySelectorAll('.btn-speak-word').forEach(btn => {
      btn.addEventListener('click', () => {
        const word = btn.dataset.word;
        this.speakText(word, 'en-US');
      });
    });

    // 예문 듣기
    container.querySelectorAll('.btn-speak-example').forEach(btn => {
      btn.addEventListener('click', () => {
        const example = btn.dataset.example;
        this.speakText(example, 'en-US');
      });
    });
  }

  speakText(text, lang) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  }

  // ③ 탭: 이해도 퀴즈
  renderQuizTab() {
    const container = document.getElementById('panel-quiz');
    if (!container) return;

    const bug = this.insects[this.activeInsectId];
    this.quizAnswers = [];
    this.quizFinished = false;

    this.renderQuizQuestion(0, bug.quiz, container);
  }

  renderQuizQuestion(index, quizzes, container) {
    if (index >= quizzes.length) {
      this.finishQuiz(quizzes, container);
      return;
    }

    const q = quizzes[index];
    const progressPercent = Math.round((index / quizzes.length) * 100);

    container.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-progress">
          <span>문제 ${index + 1} / ${quizzes.length}</span>
          <div class="quiz-progress-bar-bg">
            <div class="quiz-progress-bar-fill" style="width: ${progressPercent}%;"></div>
          </div>
          <span>진행율</span>
        </div>

        <div class="quiz-card">
          <div class="quiz-question">${index + 1}. ${q.question}</div>
          <div class="quiz-options">
            ${q.options.map((opt, oIdx) => `
              <button class="quiz-option-btn" data-answer-index="${oIdx}">
                <span>${opt}</span>
                <span class="feedback-icon"></span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // 퀴즈 옵션 선택 이벤트
    const optionBtns = container.querySelectorAll('.quiz-option-btn');
    optionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const selected = parseInt(btn.dataset.answerIndex);
        const correct = q.answer;

        // 버튼 비활성화 (더블클릭 정답 방지)
        optionBtns.forEach(b => b.disabled = true);

        if (selected === correct) {
          // 정답 처리
          btn.classList.add('correct');
          btn.querySelector('.feedback-icon').innerHTML = '🔴 정답!';
          this.speakText('Great job!', 'en-US');
          this.quizAnswers.push(true);
        } else {
          // 오답 처리
          btn.classList.add('incorrect');
          btn.querySelector('.feedback-icon').innerHTML = '❌ 오답';
          
          // 정답 버튼도 같이 보여줌
          optionBtns[correct].classList.add('correct');
          optionBtns[correct].querySelector('.feedback-icon').innerHTML = '🔴 정답';
          
          this.speakText('Oops!', 'en-US');
          this.quizAnswers.push(false);
        }

        // 1.5초 후 다음 문제 전환
        setTimeout(() => {
          this.renderQuizQuestion(index + 1, quizzes, container);
        }, 1500);
      });
    });
  }

  finishQuiz(quizzes, container) {
    const correctCount = this.quizAnswers.filter(a => a).length;
    const totalCount = quizzes.length;
    const score = Math.round((correctCount / totalCount) * 100);

    // 퀴즈 결과 보관
    localStorage.setItem(`bug_quiz_score_${this.activeInsectId}`, score);

    // 퀴즈 완점 완료 및 별 획득 처리
    const progressKey = `bug_progress_${this.activeInsectId}`;
    const progress = JSON.parse(localStorage.getItem(progressKey) || '{"read":false,"quiz":false,"activity":false}');
    
    const newlyCompleted = !progress.quiz;
    progress.quiz = true;
    localStorage.setItem(progressKey, JSON.stringify(progress));

    alert(`퀴즈 완료! ${correctCount}/${totalCount} 문제를 맞혔습니다. 별 1개를 추가로 획득했어요! ⭐`);
    this.updateHeaderStats();

    // 배지 지급 조건 검사
    if (score === 100) {
      this.checkAndAwardBadges('quiz_perfect');
    } else {
      this.checkAndAwardBadges();
    }

    container.innerHTML = `
      <div class="quiz-container" style="text-align:center;">
        <div class="welcome-banner" style="background:#eaf6ec; border-color:#a5d6a7;">
          <span style="font-size:4rem;">🏆</span>
          <h2 style="color:var(--primary-dark); margin-top:16px;">퀴즈 결과 발표!</h2>
          <p style="font-size:1.8rem; font-weight:700; color:var(--primary); margin:16px 0;">
            ${score}점 (${correctCount} / ${totalCount} 정답)
          </p>
          <p style="color:var(--text-light);">
            ${score === 100 ? '와우! 완벽해요! 모든 정답을 맞혀 만점 배지 대상이에요! 💯' : '훌륭해요! 조금만 더 복습하면 백점을 노릴 수 있어요! 👍'}
          </p>
        </div>
        <div style="display:flex; gap:16px; justify-content:center;">
          <button id="btn-restart-quiz" class="btn btn-secondary"> 다시 도전하기</button>
          <button id="btn-go-to-activity" class="btn btn-primary">🎨 다음 단계: 독후 활동하기</button>
        </div>
      </div>
    `;

    container.querySelector('#btn-restart-quiz').addEventListener('click', () => {
      this.renderQuizTab();
    });

    container.querySelector('#btn-go-to-activity').addEventListener('click', () => {
      this.navigate('learn', { tab: 'activity' });
    });
  }

  // ④ 탭: 독후 활동 (그림판 & 글쓰기)
  renderActivityTab() {
    const container = document.getElementById('panel-activity');
    if (!container) return;

    // DrawingBoard 컴포넌트 객체 생성
    const board = new DrawingBoard(
      'panel-activity', 
      this.activeInsectId, 
      this.activeLevelId, 
      () => {
        // 저장 성공 시 콜백
        this.updateHeaderStats();
        this.checkAndAwardBadges('first_drawing');
        this.navigate('learn', { tab: 'ai' }); // 저장 후 AI 탭으로 전환 안내
      }
    );
    board.render();
  }

  // ⑤ 탭: AI 곤충 대화
  renderAiTab() {
    const container = document.getElementById('panel-ai');
    if (!container) return;

    const bug = this.insects[this.activeInsectId];
    
    // AI Chat 컴포넌트 렌더링
    const chat = new AIChat('panel-ai', this.activeInsectId, bug);
    chat.render();
  }

  // 7. 학부모 대시보드 뷰
  renderParentDashboard() {
    const appEl = document.getElementById('app');
    
    const dashboard = new ParentDashboard('app', () => {
      // 리셋 시 홈으로 강제 강화 이동
      this.navigate('home');
    });
    dashboard.render();
  }

  // 학부모 인증 게이트 모달 (랜덤 곱셈/더하기 퀴즈)
  openParentGate(successCallback) {
    const num1 = Math.floor(Math.random() * 5) + 5; // 5 ~ 9
    const num2 = Math.floor(Math.random() * 8) + 2; // 2 ~ 9
    const answer = num1 * num2;

    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    modalTitle.textContent = '🔒 학부모 확인 (Parent Gate)';
    modalBody.innerHTML = `
      <div class="parent-gate-form">
        <p style="font-size:0.95rem; line-height:1.4; color:var(--text-light);">
          이 화면은 학부모 관리 페이지입니다. 어린이가 잘못 누르지 않도록 아래 수학 정답을 입력해 주세요.
        </p>
        <div class="math-question">${num1} &times; ${num2} = ?</div>
        <div class="form-group">
          <input type="number" id="gate-answer" class="form-control" placeholder="정답을 입력하세요" autofocus />
        </div>
        <button id="btn-gate-submit" class="btn btn-primary" style="justify-content:center; width:100%; padding:12px;">확인</button>
        <p id="gate-error" style="color:#d32f2f; font-size:0.85rem; font-weight:600; text-align:center; display:none;">
          ❌ 오답입니다! 다시 한번 확인해 주세요.
        </p>
      </div>
    `;

    modalOverlay.classList.remove('hidden');

    const checkAnswer = () => {
      const inputVal = parseInt(document.getElementById('gate-answer').value);
      if (inputVal === answer) {
        this.closeModal();
        successCallback();
      } else {
        const errorEl = document.getElementById('gate-error');
        errorEl.style.display = 'block';
        document.getElementById('gate-answer').value = '';
        document.getElementById('gate-answer').focus();
      }
    };

    document.getElementById('btn-gate-submit').addEventListener('click', checkAnswer);
    document.getElementById('gate-answer').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') checkAnswer();
    });
  }

  closeModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    modalOverlay.classList.add('hidden');
  }

  // 배지 획득 감지 시스템
  checkAndAwardBadges(forcedBadgeKey = null) {
    const unlockedBadges = JSON.parse(localStorage.getItem('bug_unlocked_badges') || '[]');
    let newlyUnlocked = [];

    // 1. 개별 강제 지급 조건 체크
    if (forcedBadgeKey && !unlockedBadges.includes(forcedBadgeKey)) {
      unlockedBadges.push(forcedBadgeKey);
      newlyUnlocked.push(forcedBadgeKey);
    }

    // 2. 완독 도서수 기준 자동 해제 조건 (첫 탐험가 배지)
    let readCount = 0;
    const insectKeys = Object.keys(this.insects);
    insectKeys.forEach(id => {
      const progress = JSON.parse(localStorage.getItem(`bug_progress_${id}`) || '{"read":false,"quiz":false,"activity":false}');
      if (progress.read) readCount++;
    });

    if (readCount >= 1 && !unlockedBadges.includes('first_book')) {
      unlockedBadges.push('first_book');
      newlyUnlocked.push('first_book');
    }

    // 12종 올 클리어 배지 조건
    if (readCount === insectKeys.length && !unlockedBadges.includes('all_read')) {
      unlockedBadges.push('all_read');
      newlyUnlocked.push('all_read');
    }

    // 3. 독후 활동 기준 자동 조건 (첫 드로잉 배지)
    const activities = JSON.parse(localStorage.getItem('bug_activities_list') || '[]');
    if (activities.length >= 1 && !unlockedBadges.includes('first_drawing')) {
      unlockedBadges.push('first_drawing');
      newlyUnlocked.push('first_drawing');
    }

    // 변경사항 영구 기록
    localStorage.setItem('bug_unlocked_badges', JSON.stringify(unlockedBadges));

    // 획득 시 모달 축하 팝업 표출
    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach(badgeKey => {
        this.triggerBadgeAwardModal(badgeKey);
      });
    }
  }

  triggerBadgeAwardModal(badgeKey) {
    const badge = this.badges[badgeKey];
    if (!badge) return;

    const modalOverlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');

    modalTitle.textContent = '🏅 새로운 배지 획득!';
    modalBody.innerHTML = `
      <div class="badge-award-modal">
        <div class="badge-glow-icon">${badge.emoji}</div>
        <h2>"${badge.name}" unlocked!</h2>
        <p style="font-size:1.1rem; line-height:1.5; color:var(--text-dark); margin:8px 0;">
          축하합니다! ${badge.desc}
        </p>
        <button id="btn-close-badge-award" class="btn btn-primary" style="padding:10px 24px; font-size:1rem; margin-top:16px;">
          신나게 계속하기! 🌟
        </button>
      </div>
    `;

    modalOverlay.classList.remove('hidden');
    document.getElementById('btn-close-badge-award').addEventListener('click', () => {
      this.closeModal();
    });
  }
}

// 앱 객체 생성 및 진입
const app = new App();
window.addEventListener('DOMContentLoaded', () => {
  app.init();
});
