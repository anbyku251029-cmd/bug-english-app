/**
 * 독후 활동 - 그림판 및 영어 문장 쓰기 컴포넌트
 */
export class DrawingBoard {
  constructor(containerId, insectId, levelId, onSaveComplete) {
    this.container = document.getElementById(containerId);
    this.insectId = insectId;
    this.levelId = levelId;
    this.onSaveComplete = onSaveComplete; // 저장 완료 시 실행할 콜백
    
    this.canvas = null;
    this.ctx = null;
    this.isDrawing = false;
    this.brushColor = '#2e7d32'; // 기본 초록색
    this.brushSize = 6;
    this.lastX = 0;
    this.lastY = 0;
    
    // 기본 선택 컬러들
    this.colors = [
      '#e53935', // 무당벌레 레드
      '#1e88e5', // 나비 블루
      '#ffb300', // 꿀벌 옐로우
      '#2e7d32', // 포레스트 그린
      '#8e24aa', // 보라색
      '#4e342e', // 나무 썩은 갈색
      '#212121', // 검은색
      '#ffffff'  /* 지우개 대용 흰색 */
    ];
  }

  render() {
    this.container.innerHTML = `
      <div class="activity-container">
        <!-- 1. 그리기 캔버스 영역 -->
        <div class="drawing-section">
          <h3>🎨 나만의 곤충 그려보기</h3>
          <p class="subtitle">도구와 색상을 선택하여 자유롭게 그려보세요!</p>
          
          <div class="drawing-canvas-wrapper">
            <canvas id="drawing-canvas" width="400" height="300"></canvas>
          </div>
          
          <div class="canvas-toolbar">
            <div class="color-palette">
              ${this.colors.map(color => `
                <div class="color-dot ${color === this.brushColor ? 'active' : ''}" 
                     data-color="${color}" 
                     style="background-color: ${color}; ${color === '#ffffff' ? 'border: 2px solid #ccc;' : ''}"></div>
              `).join('')}
            </div>
            
            <div class="brush-sizes">
              <button class="brush-size-btn ${this.brushSize === 3 ? 'active' : ''}" data-size="3" style="width:30px;height:30px;font-size:0.7rem;">●</button>
              <button class="brush-size-btn ${this.brushSize === 6 ? 'active' : ''}" data-size="6" style="width:34px;height:34px;font-size:0.9rem;">●</button>
              <button class="brush-size-btn ${this.brushSize === 12 ? 'active' : ''}" data-size="12" style="width:38px;height:38px;font-size:1.2rem;">●</button>
            </div>
            
            <button id="btn-clear-canvas" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.9rem; margin-left: auto;">
              🗑️ 전체 지우기
            </button>
          </div>
        </div>

        <!-- 2. 영어 글쓰기 및 생각하기 영역 -->
        <div class="writing-section">
          <div class="writing-card">
            <h3>✍️ 영어로 한 문장 쓰기</h3>
            <p class="sentence-guide">💡 추천 예시 (클릭하면 바로 입력돼요!):</p>
            <ul class="sentence-guide" id="recommended-sentences">
              <li data-text="I like this ${this.insectId}.">👉 I like this ${this.insectId}. (나는 이 곤충이 좋아.)</li>
              <li data-text="My ${this.insectId} is beautiful.">👉 My ${this.insectId} is beautiful. (내 곤충은 아름다워.)</li>
              <li data-text="This insect has cool wings.">👉 This insect has cool wings. (이 곤충은 멋진 날개를 가졌어.)</li>
            </ul>
            <textarea id="writing-notebook" class="textarea-notebook" placeholder="예시 문장을 참고하거나 나만의 생각을 영어로 적어보세요..."></textarea>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 12px;">
              <button id="btn-listen-writing" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.9rem;">
                🔊 내 문장 듣기
              </button>
              <span style="font-size:0.85rem; color:var(--text-light);">* 영어 대소문자 구분을 지켜봐요!</span>
            </div>
          </div>
          
          <div class="writing-card">
            <h3>🧠 깊이 생각하기 (부모님과 대화해요)</h3>
            <p style="font-size:0.95rem; line-height:1.5; color:var(--text-dark);" id="reflection-question">
              ${this.getReflectionQuestion()}
            </p>
          </div>

          <button id="btn-submit-activity" class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 1.1rem; justify-content:center;">
            🎉 독후 활동 저장하고 완료하기
          </button>
        </div>
      </div>
    `;

    this.initCanvas();
    this.bindEvents();
  }

  getReflectionQuestion() {
    const questions = {
      ladybug: "무당벌레는 농부들에게 왜 이로운 곤충일까요? 진딧물을 잡아먹는 것이 식물에게 어떤 도움을 줄까요?",
      ant: "개미들이 줄을 지어 먹이를 옮기는 모습을 본 적이 있나요? 협동하는 개미의 사회에 대해 이야기해 봅시다.",
      butterfly: "애벌레가 고치를 뚫고 아름다운 나비로 태어나는 모습은 우리에게 어떤 용기를 줄까요?",
      honeybee: "벌이 없어진다면 우리가 먹는 과일과 야채는 어떻게 될까요? 꿀벌의 소중함에 대해 이야기해요.",
      beetle: "장수풍뎅이는 자기 몸의 수백 배나 되는 힘을 낼 수 있대요. 만약 내가 그런 힘을 가진다면 무엇을 해보고 싶나요?",
      dragonfly: "물속에 살던 잠자리 애벌레(학명)가 하늘을 멋지게 날아다니는 사냥꾼이 되기까지의 과정을 생각해보세요.",
      grasshopper: "메뚜기는 위험을 피하기 위해 높이 점프합니다. 나에게 메뚜기 같은 강력한 다리가 생긴다면 어디를 가보고 싶나요?",
      mantis: "사마귀가 주변 환경과 비슷한 초록색이나 갈색으로 변장(위장)하는 이유는 무엇일까요?",
      cicada: "매미는 단 몇 주 동안 울기 위해 땅속에서 몇 년을 기다린대요. 매미의 긴 기다림에 대해 어떻게 생각하나요?",
      firefly: "어두운 밤하늘을 수놓는 반딧불이의 차가운 빛(냉광)은 무엇을 위해 사용되는 것일까요?",
      stagbeetle: "사슴벌레의 거대한 집게턱은 씹는 용도가 아니라 친구들과 시합하기 위한 도구래요. 평화로운 경쟁에 대해 대화해봐요.",
      spider: "거미는 다리가 8개라서 곤충이 아닌 거미류에 속한대요. 거미가 거미줄을 치고 곤충을 사냥하는 지혜를 알아봅시다."
    };
    return questions[this.insectId] || "이 곤충에 대해 오늘 배운 가장 신기한 사실은 무엇인가요?";
  }

  initCanvas() {
    this.canvas = document.getElementById('drawing-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // 고해상도 대응 및 캔버스 크기 고정
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = this.brushColor;
    this.ctx.lineWidth = this.brushSize;

    // 흰색 배경으로 채우기 (이미지 저장 시 투명 배경 방지)
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  bindEvents() {
    // 1. 그리기 로직 (마우스)
    this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e.offsetX, e.offsetY));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e.offsetX, e.offsetY));
    this.canvas.addEventListener('mouseup', () => this.stopDrawing());
    this.canvas.addEventListener('mouseleave', () => this.stopDrawing());

    // 2. 그리기 로직 (터치 스크린 - 모바일 & 태블릿)
    this.canvas.addEventListener('touchstart', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this.startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
      e.preventDefault(); // 스크롤 방지
    });
    this.canvas.addEventListener('touchmove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      this.draw(touch.clientX - rect.left, touch.clientY - rect.top);
      e.preventDefault();
    });
    this.canvas.addEventListener('touchend', () => this.stopDrawing());

    // 3. 툴바 이벤트 연결
    const colorDots = this.container.querySelectorAll('.color-dot');
    colorDots.forEach(dot => {
      dot.addEventListener('click', () => {
        colorDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        this.brushColor = dot.dataset.color;
      });
    });

    const brushButtons = this.container.querySelectorAll('.brush-size-btn');
    brushButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        brushButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.brushSize = parseInt(btn.dataset.size);
      });
    });

    this.container.querySelector('#btn-clear-canvas').addEventListener('click', () => {
      if (confirm('그림을 모두 지울까요?')) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
    });

    // 4. 추천 문장 클릭 시 자동 입력
    const sentences = this.container.querySelectorAll('#recommended-sentences li');
    sentences.forEach(item => {
      item.addEventListener('click', () => {
        const text = item.dataset.text;
        const textarea = this.container.querySelector('#writing-notebook');
        textarea.value = text;
      });
    });

    // 5. 내 문장 듣기 (TTS)
    this.container.querySelector('#btn-listen-writing').addEventListener('click', () => {
      const text = this.container.querySelector('#writing-notebook').value.trim();
      if (!text) {
        alert('들어볼 영어 문장을 먼저 입력해 주세요!');
        return;
      }
      this.speakText(text);
    });

    // 6. 독후 활동 완료 및 저장
    this.container.querySelector('#btn-submit-activity').addEventListener('click', () => {
      this.saveActivity();
    });
  }

  startDrawing(x, y) {
    this.isDrawing = true;
    this.lastX = x;
    this.lastY = y;
  }

  draw(x, y) {
    if (!this.isDrawing) return;
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.strokeStyle = this.brushColor;
    this.ctx.lineWidth = this.brushSize;
    this.ctx.stroke();
    this.lastX = x;
    this.lastY = y;
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  speakText(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85; // 다소 천천히 읽어줌
      window.speechSynthesis.speak(utterance);
    }
  }

  saveActivity() {
    const text = this.container.querySelector('#writing-notebook').value.trim();
    if (!text) {
      alert('영어 문장 쓰기 칸에 문장을 입력해주세요!');
      return;
    }

    // 캔버스 그림 데이터 획득 (DataURL)
    const drawingDataUrl = this.canvas.toDataURL('image/png');

    // 로컬스토리지 저장용 구조 구축
    const key = `bug_activity_${this.insectId}_${this.levelId}`;
    const activityData = {
      insectId: this.insectId,
      levelId: this.levelId,
      drawing: drawingDataUrl,
      text: text,
      date: new Date().toLocaleDateString('ko-KR')
    };

    localStorage.setItem(key, JSON.stringify(activityData));

    // 부모 대시보드 조회를 위한 전역 리스트에도 보관
    const activitiesListKey = 'bug_activities_list';
    const existingList = JSON.parse(localStorage.getItem(activitiesListKey) || '[]');
    // 동일한 곤충+레벨 기록이 있으면 업데이트, 없으면 추가
    const index = existingList.findIndex(item => item.insectId === this.insectId && item.levelId === this.levelId);
    if (index !== -1) {
      existingList[index] = activityData;
    } else {
      existingList.push(activityData);
    }
    localStorage.setItem(activitiesListKey, JSON.stringify(existingList));

    // 독후 활동 완료 상태 업데이트
    const progressKey = `bug_progress_${this.insectId}`;
    const progress = JSON.parse(localStorage.getItem(progressKey) || '{"read":false,"quiz":false,"activity":false}');
    progress.activity = true;
    localStorage.setItem(progressKey, JSON.stringify(progress));

    alert('참 잘했어요! 독후 활동 저장이 완료되었습니다. 🌟');
    
    if (this.onSaveComplete) {
      this.onSaveComplete();
    }
  }
}
