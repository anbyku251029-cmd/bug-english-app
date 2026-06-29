/**
 * 학부모 대시보드 및 학습 통계 컴포넌트
 */
export class ParentDashboard {
  constructor(containerId, onResetData) {
    this.container = document.getElementById(containerId);
    this.onResetData = onResetData; // 데이터 초기화 시 콜백
  }

  render() {
    // 로컬스토리지 데이터 로드 및 집계
    const stats = this.calculateStats();
    const activities = JSON.parse(localStorage.getItem('bug_activities_list') || '[]');
    const apiKey = localStorage.getItem('gemini_api_key') || '';

    this.container.innerHTML = `
      <div class="parent-dashboard">
        <div class="welcome-banner" style="text-align: left;">
          <h1>👨‍👩‍👧 학부모 대시보드</h1>
          <p>자녀의 영어 곤충 학습 진행 상황과 그린 그림들을 한눈에 확인하세요.</p>
        </div>

        <!-- 1. 통계 요약 카드 그리드 -->
        <div class="dashboard-stats">
          <div class="stat-card">
            <span class="stat-number" id="stats-stars">⭐ ${stats.totalStars}</span>
            <span class="stat-label">획득한 누적 별</span>
          </div>
          <div class="stat-card">
            <span class="stat-number" id="stats-read-books">📖 ${stats.readCount}권</span>
            <span class="stat-label">완독한 그림책</span>
          </div>
          <div class="stat-card">
            <span class="stat-number" id="stats-learned-words">🔤 ${stats.wordCount}개</span>
            <span class="stat-label">학습한 총 단어</span>
          </div>
          <div class="stat-card">
            <span class="stat-number" id="stats-quiz-score">🎯 ${stats.quizScore}%</span>
            <span class="stat-label">평균 퀴즈 정답률</span>
          </div>
        </div>

        <!-- 2. 독후 활동 갤러리 (그림 & 텍스트) -->
        <div class="badge-cabinet" style="margin-top: 24px;">
          <h3>🎨 아이의 독후 활동 작품 갤러리</h3>
          <div class="gallery-grid" id="dashboard-gallery">
            ${activities.length === 0 ? `
              <div class="empty-gallery">
                 아직 완료된 독후 활동(그림 그리기 & 글쓰기)이 없습니다.<br>
                아이와 함께 곤충 책을 읽고 첫 독후 활동을 완료해보세요!
              </div>
            ` : activities.map((act, index) => `
              <div class="gallery-card" data-index="${index}">
                <img src="${act.drawing}" class="gallery-image" alt="아이 그림" />
                <div class="gallery-info">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h4>${this.getInsectNameKo(act.insectId)} (Lv.${act.levelId.replace('level','')})</h4>
                    <span style="font-size:0.75rem; color:var(--text-light);">${act.date}</span>
                  </div>
                  <p class="writing-sentence" title="${act.text}">✍️ "${act.text}"</p>
                  <button class="btn btn-secondary btn-delete-activity" data-insect="${act.insectId}" data-level="${act.levelId}" style="width:100%; margin-top:8px; padding:4px; font-size:0.8rem; background:#ffebee; color:#c62828; border-color:#ffcdd2;">
                    삭제하기
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 3. AI 연동 설정 및 초기화 도구 -->
        <div style="display:grid; grid-template-columns: 1fr; gap:24px; margin-top:24px;">
          <!-- Gemini API 키 입력 -->
          <div class="badge-cabinet" style="background:#eaf6ec;">
            <h3 style="color:var(--primary-dark)">🔑 실시간 AI 곤충 대화 (Gemini API) 연동</h3>
            <p style="font-size:0.9rem; line-height:1.5; color:var(--text-light); margin-bottom:12px;">
              Google Gemini API 키를 입력하시면 아이가 입력하는 모든 질문에 AI가 실시간으로 친근하게 답변합니다.<br>
              입력된 API 키는 <strong>사용자의 브라우저 로컬 저장소에만 안전하게 보관</strong>되며 외부 서버로 전송되지 않습니다.
            </p>
            <div class="api-key-input-group">
              <input type="password" id="gemini-key-input" class="form-control" style="text-align:left; font-size:0.95rem; height:42px;" 
                     placeholder="AI 키를 입력하세요 (AIzaSy...)" value="${apiKey}" />
              <button id="btn-save-api-key" class="btn btn-primary">저장</button>
              ${apiKey ? `<button id="btn-delete-api-key" class="btn btn-secondary" style="background:#ffebee; color:#c62828; border-color:#ffcdd2;">삭제</button>` : ''}
            </div>
            <div id="api-key-status-msg" style="margin-top:8px; font-size:0.85rem; font-weight:600;"></div>
          </div>

          <!-- 데이터 초기화 및 홈으로 가기 -->
          <div class="badge-cabinet" style="background:#fffde7;">
            <h3 style="color:#f57f17;">⚙️ 위험 구역</h3>
            <p style="font-size:0.9rem; color:var(--text-light); margin-bottom:12px;">
              지금까지 획득한 별, 독후 활동 그림 및 단어 학습 이력을 모두 제거하고 앱을 초기화합니다.
            </p>
            <button id="btn-reset-all-data" class="btn btn-secondary" style="background:#ffe082; border-color:#ffd54f; color:#e65100;">
              ⚠️ 모든 학습 데이터 초기화
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // 1. API 키 저장 버튼
    this.container.querySelector('#btn-save-api-key').addEventListener('click', () => {
      const key = this.container.querySelector('#gemini-key-input').value.trim();
      const statusMsg = this.container.querySelector('#api-key-status-msg');
      if (!key) {
        alert('API Key를 먼저 입력해 주세요!');
        return;
      }
      localStorage.setItem('gemini_api_key', key);
      statusMsg.textContent = '✅ API 키가 브라우저에 안전하게 저장되었습니다.';
      statusMsg.style.color = '#2e7d32';
      setTimeout(() => this.render(), 1200); // 갱신
    });

    // 2. API 키 삭제 버튼
    const deleteKeyBtn = this.container.querySelector('#btn-delete-api-key');
    if (deleteKeyBtn) {
      deleteKeyBtn.addEventListener('click', () => {
        if (confirm('저장된 API 키를 삭제하고 모의 AI 모드로 전환할까요?')) {
          localStorage.removeItem('gemini_api_key');
          this.render();
        }
      });
    }

    // 3. 작품 삭제 버튼
    const deleteActBtns = this.container.querySelectorAll('.btn-delete-activity');
    deleteActBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const insect = btn.dataset.insect;
        const level = btn.dataset.level;
        if (confirm('해당 독후 활동 그림과 기록을 삭제할까요?')) {
          this.deleteActivity(insect, level);
        }
      });
    });

    // 4. 모든 데이터 초기화 버튼
    this.container.querySelector('#btn-reset-all-data').addEventListener('click', () => {
      if (confirm('정말로 모든 데이터(그림, 기록, 별)를 공장 초기화할까요?\n이 작업은 되돌릴 수 없습니다.')) {
        localStorage.clear();
        alert('모든 학습 데이터가 초기화되었습니다.');
        if (this.onResetData) {
          this.onResetData();
        }
      }
    });
  }

  calculateStats() {
    let totalStars = 0;
    let readCount = 0;
    let wordCount = 0;
    let quizSum = 0;
    let quizCount = 0;

    // 로컬스토리지에서 12종 데이터 순회
    const insects = ['ladybug', 'ant', 'butterfly', 'honeybee', 'beetle', 'dragonfly', 'grasshopper', 'mantis', 'cicada', 'firefly', 'stagbeetle', 'spider'];
    
    insects.forEach(id => {
      // 1. 완독 및 퀴즈/독후활동 진척도 계산
      const progress = JSON.parse(localStorage.getItem(`bug_progress_${id}`) || '{"read":false,"quiz":false,"activity":false}');
      if (progress.read) {
        readCount++;
        totalStars++;
      }
      if (progress.quiz) {
        totalStars++;
      }
      if (progress.activity) {
        totalStars++;
      }

      // 2. 학습 완료한 단어 개수
      const wordProgress = JSON.parse(localStorage.getItem(`bug_words_${id}`) || '[]');
      wordCount += wordProgress.length;

      // 3. 퀴즈 점수 합산
      const quizScore = localStorage.getItem(`bug_quiz_score_${id}`);
      if (quizScore !== null) {
        quizSum += parseInt(quizScore);
        quizCount++;
      }
    });

    const quizScoreAverage = quizCount > 0 ? Math.round(quizSum / quizCount) : 0;

    return {
      totalStars,
      readCount,
      wordCount,
      quizScore: quizScoreAverage
    };
  }

  getInsectNameKo(id) {
    const names = {
      ladybug: '무당벌레',
      ant: '개미',
      butterfly: '나비',
      honeybee: '꿀벌',
      beetle: '장수풍뎅이',
      dragonfly: '잠자리',
      grasshopper: '메뚜기',
      mantis: '사마귀',
      cicada: '매미',
      firefly: '반딧불이',
      stagbeetle: '사슴벌레',
      spider: '거미'
    };
    return names[id] || id;
  }

  deleteActivity(insectId, levelId) {
    // 개별 작품 삭제
    localStorage.removeItem(`bug_activity_${insectId}_${levelId}`);

    // 리스트에서 제거
    const activitiesListKey = 'bug_activities_list';
    let list = JSON.parse(localStorage.getItem(activitiesListKey) || '[]');
    list = list.filter(item => !(item.insectId === insectId && item.levelId === levelId));
    localStorage.setItem(activitiesListKey, JSON.stringify(list));

    // 진척도 별 수정
    const progressKey = `bug_progress_${insectId}`;
    const progress = JSON.parse(localStorage.getItem(progressKey) || '{"read":false,"quiz":false,"activity":false}');
    progress.activity = false;
    localStorage.setItem(progressKey, JSON.stringify(progress));

    this.render();
  }
}
