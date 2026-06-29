/**
 * AI 곤충 친구 - 모의 AI 및 실제 Gemini API 연동 컴포넌트
 */
export class AIChat {
  constructor(containerId, insectId, insectData) {
    this.container = document.getElementById(containerId);
    this.insectId = insectId;
    this.insectData = insectData;
    this.messages = [];
    
    // 이 곤충에 대한 기본 대화 시작 메시지 및 빠른 질문 리스트 구성
    this.initWelcomeData();
  }

  initWelcomeData() {
    const nameKo = this.insectData.nameKo;
    const emoji = this.insectData.icon;
    
    this.messages = [
      {
        sender: 'ai',
        text: `안녕! 나는 ${nameKo} 박사야 ${emoji}! 우리 곤충 친구들에 대해 궁금한 점이 있으면 무엇이든 물어봐. "새로운 이야기 만들어줘" 버튼을 누르면 영어 동화도 들려줄 수 있어!`
      }
    ];

    // 아이들이 자주 하는 질문 리스트 (곤충별 특화)
    const questionsMap = {
      ladybug: [
        "무당벌레 등껍질의 점은 왜 있나요?",
        "무당벌레는 무얼 먹고 사나요?",
        "새로운 무당벌레 영어 동화 들려줘!"
      ],
      ant: [
        "개미는 무거운 짐을 어떻게 드나요?",
        "개미집은 어떻게 생겼나요?",
        "새로운 개미 영어 동화 들려줘!"
      ],
      butterfly: [
        "나비는 날개 가루가 묻으면 어떻게 되나요?",
        "나비는 어떻게 맛을 느끼나요?",
        "새로운 나비 영어 동화 들려줘!"
      ],
      honeybee: [
        "꿀벌은 왜 춤을 추나요?",
        "꿀벌 침을 쏘면 진짜 죽나요?",
        "새로운 꿀벌 영어 동화 들려줘!"
      ],
      beetle: [
        "장수풍뎅이 뿔은 뼈로 되어 있나요?",
        "장수풍뎅이와 사슴벌레가 싸우면 누가 이기나요?",
        "새로운 장수풍뎅이 영어 동화 들려줘!"
      ],
      dragonfly: [
        "잠자리는 날아가면서 물을 왜 엉덩이로 치나요?",
        "잠자리는 어떻게 눈이 그렇게 큰가요?",
        "새로운 잠자리 영어 동화 들려줘!"
      ],
      grasshopper: [
        "메뚜기는 왜 초록색인가요?",
        "메뚜기는 귀가 어디에 있나요?",
        "새로운 메뚜기 영어 동화 들려줘!"
      ],
      mantis: [
        "사마귀는 왜 기도하는 것처럼 보이나요?",
        "사마귀가 벌도 잡아먹을 수 있나요?",
        "새로운 사마귀 영어 동화 들려줘!"
      ],
      cicada: [
        "매미는 왜 여름에만 그렇게 시끄럽게 우나요?",
        "매미는 땅속에서 얼마나 오래 사나요?",
        "새로운 매미 영어 동화 들려줘!"
      ],
      firefly: [
        "반딧불이는 엉덩이 불이 뜨겁지 않나요?",
        "반딧불이는 왜 불빛을 깜빡이나요?",
        "새로운 반딧불이 영어 동화 들려줘!"
      ],
      stagbeetle: [
        "사슴벌레 턱은 물리면 많이 아픈가요?",
        "사슴벌레는 무얼 먹고 사나요?",
        "새로운 사슴벌레 영어 동화 들려줘!"
      ],
      spider: [
        "거미는 왜 곤충이 아닌가요?",
        "거미줄은 왜 거미 몸에 엉키지 않나요?",
        "새로운 거미 영어 동화 들려줘!"
      ]
    };

    this.suggestions = questionsMap[this.insectId] || [
      "이 곤충은 어디에 사나요?",
      "이 곤충은 무엇을 먹나요?",
      "재미있는 영어 동화 들려줘!"
    ];
  }

  render() {
    this.container.innerHTML = `
      <div class="ai-container">
        <!-- AI 캐릭터 카드 및 API 상태 -->
        <div class="ai-character-card">
          <div class="ai-avatar">${this.insectData.icon}</div>
          <h2>${this.insectData.nameKo} 박사 AI</h2>
          <p style="font-size:0.9rem; color:var(--text-light); margin-top:8px; line-height:1.4;">
            아래 빠른 질문을 클릭하거나 직접 궁금한 점을 타이핑해보세요!
          </p>
          <div id="ai-status" style="margin-top: 16px; font-size:0.8rem; font-weight:600; padding:4px 8px; border-radius:12px;">
            <!-- 연동 상태 표시 -->
          </div>
        </div>

        <!-- 채팅 시스템 -->
        <div class="ai-chat-box">
          <div class="chat-messages" id="chat-messages">
            ${this.messages.map(msg => `
              <div class="msg-bubble ${msg.sender}">
                ${msg.text.replace(/\n/g, '<br>')}
              </div>
            `).join('')}
          </div>

          <!-- 추천 빠른 질문 버튼들 -->
          <div class="chat-suggestions">
            ${this.suggestions.map(s => `
              <button class="suggest-btn" data-text="${s}">${s}</button>
            `).join('')}
          </div>

          <!-- 입력 바 -->
          <div class="chat-input-bar">
            <input type="text" id="chat-input" placeholder="질문을 입력하세요... (예: 밥은 뭘 먹어?)" />
            <button id="btn-send-chat" class="btn btn-primary" style="padding: 10px 18px;">전송</button>
          </div>
        </div>
      </div>
    `;

    this.updateStatusIndicator();
    this.bindEvents();
    this.scrollToBottom();
  }

  updateStatusIndicator() {
    const apiKey = localStorage.getItem('gemini_api_key');
    const indicator = this.container.querySelector('#ai-status');
    if (apiKey) {
      indicator.textContent = '🟢 실시간 Gemini AI 모드 활성화';
      indicator.style.backgroundColor = '#e8f5e9';
      indicator.style.color = '#2e7d32';
    } else {
      indicator.textContent = '🔵 모의 AI 어린이 학습 모드';
      indicator.style.backgroundColor = '#e3f2fd';
      indicator.style.color = '#1565c0';
    }
  }

  bindEvents() {
    // 1. 메시지 전송 버튼 클릭
    this.container.querySelector('#btn-send-chat').addEventListener('click', () => this.handleSendMessage());

    // 2. 엔터키 누를 때 전송
    this.container.querySelector('#chat-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSendMessage();
      }
    });

    // 3. 추천 빠른 질문 클릭
    const suggestButtons = this.container.querySelectorAll('.suggest-btn');
    suggestButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.text;
        this.askAI(text);
      });
    });
  }

  scrollToBottom() {
    const chatContainer = this.container.querySelector('#chat-messages');
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  handleSendMessage() {
    const input = this.container.querySelector('#chat-input');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    this.askAI(text);
  }

  // 메시지 화면에 렌더링
  appendMessage(sender, text) {
    this.messages.push({ sender, text });
    const chatContainer = this.container.querySelector('#chat-messages');
    
    const bubble = document.createElement('div');
    bubble.className = `msg-bubble ${sender}`;
    bubble.innerHTML = text.replace(/\n/g, '<br>');
    chatContainer.appendChild(bubble);
    this.scrollToBottom();
  }

  // AI에 질문하고 답변 받기
  async askAI(question) {
    // 사용자 질문 게시
    this.appendMessage('user', question);

    // 로딩 답변 게시
    const loadingId = 'ai-loading-bubble';
    const chatContainer = this.container.querySelector('#chat-messages');
    const loadingBubble = document.createElement('div');
    loadingBubble.className = 'msg-bubble ai';
    loadingBubble.id = loadingId;
    loadingBubble.innerHTML = '생각하는 중... 🌿';
    chatContainer.appendChild(loadingBubble);
    this.scrollToBottom();

    const apiKey = localStorage.getItem('gemini_api_key');
    let responseText = '';

    try {
      if (apiKey) {
        // 실제 Gemini API 호출
        responseText = await this.callGeminiAPI(apiKey, question);
      } else {
        // 모의 답변 생성 (딜레이 0.6초 줘서 실제 대화 느낌 구현)
        await new Promise(resolve => setTimeout(resolve, 600));
        responseText = this.getMockResponse(question);
      }
    } catch (error) {
      console.error(error);
      responseText = '앗! 곤충 친구와 대화하는 도중 나뭇가지가 꺾였나 봐요. (연결 에러가 발생했습니다) 다시 한번 물어봐줄래?';
    } finally {
      // 로딩 말풍선 제거 및 결과 출력
      const loading = document.getElementById(loadingId);
      if (loading) loading.remove();
      this.appendMessage('ai', responseText);
    }
  }

  // Gemini API 실시간 연동
  async callGeminiAPI(apiKey, prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    // 어린이 전용 시스템 지침 (페르소나 지정)
    const systemInstruction = `
      너는 7세~10세 어린이를 위한 아주 친절하고 상냥한 곤충 박사 AI야. 이름은 "${this.insectData.nameKo} 박사"이고 말투는 귀여운 이모티콘을 많이 섞어서 '~했어!', '~란다' 처럼 말해야 해.
      어린이 대상이므로 너무 어려운 전문 용어는 피하고 비유를 들어서 쉽게 설명해줘.
      
      [미션]
      1. 사용자가 질문하는 '${this.insectData.nameEn}(${this.insectData.nameKo})'에 관한 자연과학적 호기심을 한글로 해결해준다.
      2. 만약 질문이 "새로운 이야기 만들어줘" 또는 "영어 동화 들려줘"와 같이 스토리와 관련되어 있다면, 3~4문장 분량의 아주 쉬운 영어 그림책 버전을 영문으로 창작해준다. 그리고 그 밑에 한글 해석을 덧붙여 준다.
         (예시 영어 문장 수준: "This is a little bee. It gathers golden honey. It shares honey with family. We love honey!")
    `;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: `${systemInstruction}\n\n사용자 질문: ${prompt}` }
          ]
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error('Gemini API call failed');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  // 모의 대화 로직 (Offline Mock AI)
  getMockResponse(question) {
    const nameKo = this.insectData.nameKo;
    
    // 영어 동화 만들어줘 요청 처리
    if (question.includes("동화") || question.includes("이야기") || question.includes("story") || question.includes("Story")) {
      return this.generateMockStory();
    }

    // 곤충 질문별 모의 응답 사전
    const mockDb = {
      ladybug: {
        "점": "무당벌레 등껍질의 점은 천적(새 등)에게 '나는 맛이 없으니 먹지 마!' 하고 경고하는 신호등 역할을 해 🛑! 그리고 종류에 따라 2개, 7개, 28개 등 다양한 개수의 점이 있단다.",
        "먹고": "무당벌레는 식물을 아프게 하는 나쁜 '진딧물'을 아주아주 좋아해 😋! 하루에 수백 마리씩 먹어서 농부 삼촌들을 도와주는 꼬마 경찰관이란다.",
        "어디": "무당벌레는 풀밭이나 나무잎사귀 위에서 주로 살아! 특히 진딧물이 많은 장미 덤불 근처에서 자주 발견된단다 🌹.",
        "default": "무당벌레는 무당벌레과에 속하는 곤충으로, 뒤집어지면 다리를 바르르 떨며 죽은 척하는 귀여운 개인기도 가지고 있어 🐞! 또 궁금한 게 있니?"
      },
      ant: {
        "무거운": "개미는 자기 몸무게보다 무려 50배나 더 무거운 물건을 들 수 있어 💪! 사람으로 치면 트럭을 번쩍 들어 올리는 엄청난 천하장사인 셈이지!",
        "개미집": "개미집은 흙속에 여왕방, 아기방, 먹이 창고, 심지어 쓰레기장까지 나누어진 아주 거대한 아파트 모양을 하고 있어 🏢! 대단하지 않니?",
        "default": "개미는 냄새가 나는 '페로몬'이라는 물질을 뿜어 길을 잃지 않고 친구들과 서로 도우며 산단다 🐜!"
      },
      butterfly: {
        "가루": "나비 날개에 묻은 고운 가루는 비를 막아주고, 체온을 지켜주는 소중한 우산 같은 역할을 해 ☔! 억지로 만지면 날개가 손상되어 날지 못할 수도 있으니 눈으로만 예쁘게 봐주자!",
        "맛": "신기하게도 나비는 입이 아니라 '발'에 맛을 느끼는 감각 센서가 있어 🦶! 그래서 꽃 위에 내려앉는 순간 달콤한 꿀인지 바로 알 수 있단다.",
        "default": "나비는 번데기 속에서 꾹 참고 견디다가 예쁜 날개를 활짝 펼치고 태어나는 꿈을 가진 천사 곤충이야 🦋!"
      },
      honeybee: {
        "춤": "꿀벌들은 맛있는 꿀이 있는 장소를 발견하면 엉덩이를 씰룩거리며 8자 모양 춤을 춰 💃! 춤추는 각도와 움직임으로 다른 벌들에게 꿀의 위치와 거리를 설명해주는 대단한 통신원이지!",
        "침": "꿀벌의 침은 내장과 연결되어 있어서 한 번 쏘면 죽게 돼 😢. 그래서 꿀벌은 정말 위험하다고 느낄 때만 스스로를 지키기 위해 침을 쏜단다. 꽃집 벌들을 무서워하지 않아도 돼!",
        "default": "꿀벌은 우리가 먹는 수많은 과일과 채소꽃들을 찾아다니며 열매를 맺게 해주는 지구의 아주 고마운 정원사란다 🐝!"
      }
    };

    const insectDb = mockDb[this.insectId] || {};
    
    // 질문 키워드 매칭 검색
    for (const key in insectDb) {
      if (question.includes(key)) {
        return insectDb[key];
      }
    }

    // 기본 매핑 답변이 없을 때 일반적인 친절한 대답
    return `오! ${nameKo}에 대한 정말 좋은 질문이야 💡! ${nameKo}은(는) 신비로운 곤충이란다.\n\n실시간 대화로 더 넓고 깊은 질문을 하고 싶다면 부모님 화면에서 'Gemini API Key'를 등록하면 진짜 곤충 박사님이 직접 설명해주실 거야 👨‍🔬!`;
  }

  // 모의 영어 동화 템플릿 제공
  generateMockStory() {
    const nameKo = this.insectData.nameKo;
    const nameEn = this.insectData.nameEn;
    const emoji = this.insectData.icon;

    const stories = [
      `📖 [${nameEn}의 작은 모험]\n\nOnce upon a time, a little ${nameEn.toLowerCase()} lived in a green forest ${emoji}.\nEvery day, the ${nameEn.toLowerCase()} looked at the sky.\n"I want to touch the soft white cloud!" the ${nameEn.toLowerCase()} said.\nWith tiny wings, it flew high and smiled at the sun ☀️.\n\n(옛날 옛적에, 초록 숲속에 작은 ${nameKo}가 살았습니다.\n매일 ${nameKo}는 하늘을 바라보았습니다.\n"나는 말랑말랑한 흰 구름을 만지고 싶어!" ${nameKo}가 말했습니다.\n작은 날개로, 그것은 높이 날아올라 태양을 보며 웃었습니다.)`,
      
      `📖 [${nameEn}와 숲속의 파티]\n\nToday is the big summer party in the woods 🥳.\nThe friendly ${nameEn.toLowerCase()} brought delicious sweet food.\nAll insect friends came and danced together bzz-bzz!\n"We are small, but we are a happy family!" they cheered 🎉.\n\n(오늘은 숲속에서 큰 여름 파티가 열리는 날입니다.\n친절한 ${nameKo}는 맛있고 달콤한 음식을 가져왔습니다.\n모든 곤충 친구들이 모여 다 함께 윙윙 춤을 추었습니다!\n"우리는 작지만, 행복한 가족이야!" 그들은 즐거워했습니다.)`
    ];

    // 무작위로 이야기 반환
    const randomIndex = Math.floor(Math.random() * stories.length);
    return stories[randomIndex];
  }
}
