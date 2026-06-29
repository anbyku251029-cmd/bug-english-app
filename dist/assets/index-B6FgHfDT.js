(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))n(t);new MutationObserver(t=>{for(const a of t)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&n(i)}).observe(document,{childList:!0,subtree:!0});function s(t){const a={};return t.integrity&&(a.integrity=t.integrity),t.referrerPolicy&&(a.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?a.credentials="include":t.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function n(t){if(t.ep)return;t.ep=!0;const a=s(t);fetch(t.href,a)}})();class p{constructor(e,s,n,t){this.container=document.getElementById(e),this.insectId=s,this.levelId=n,this.onSaveComplete=t,this.canvas=null,this.ctx=null,this.isDrawing=!1,this.brushColor="#2e7d32",this.brushSize=6,this.lastX=0,this.lastY=0,this.colors=["#e53935","#1e88e5","#ffb300","#2e7d32","#8e24aa","#4e342e","#212121","#ffffff"]}render(){this.container.innerHTML=`
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
              ${this.colors.map(e=>`
                <div class="color-dot ${e===this.brushColor?"active":""}" 
                     data-color="${e}" 
                     style="background-color: ${e}; ${e==="#ffffff"?"border: 2px solid #ccc;":""}"></div>
              `).join("")}
            </div>
            
            <div class="brush-sizes">
              <button class="brush-size-btn ${this.brushSize===3?"active":""}" data-size="3" style="width:30px;height:30px;font-size:0.7rem;">●</button>
              <button class="brush-size-btn ${this.brushSize===6?"active":""}" data-size="6" style="width:34px;height:34px;font-size:0.9rem;">●</button>
              <button class="brush-size-btn ${this.brushSize===12?"active":""}" data-size="12" style="width:38px;height:38px;font-size:1.2rem;">●</button>
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
    `,this.initCanvas(),this.bindEvents()}getReflectionQuestion(){return{ladybug:"무당벌레는 농부들에게 왜 이로운 곤충일까요? 진딧물을 잡아먹는 것이 식물에게 어떤 도움을 줄까요?",ant:"개미들이 줄을 지어 먹이를 옮기는 모습을 본 적이 있나요? 협동하는 개미의 사회에 대해 이야기해 봅시다.",butterfly:"애벌레가 고치를 뚫고 아름다운 나비로 태어나는 모습은 우리에게 어떤 용기를 줄까요?",honeybee:"벌이 없어진다면 우리가 먹는 과일과 야채는 어떻게 될까요? 꿀벌의 소중함에 대해 이야기해요.",beetle:"장수풍뎅이는 자기 몸의 수백 배나 되는 힘을 낼 수 있대요. 만약 내가 그런 힘을 가진다면 무엇을 해보고 싶나요?",dragonfly:"물속에 살던 잠자리 애벌레(학명)가 하늘을 멋지게 날아다니는 사냥꾼이 되기까지의 과정을 생각해보세요.",grasshopper:"메뚜기는 위험을 피하기 위해 높이 점프합니다. 나에게 메뚜기 같은 강력한 다리가 생긴다면 어디를 가보고 싶나요?",mantis:"사마귀가 주변 환경과 비슷한 초록색이나 갈색으로 변장(위장)하는 이유는 무엇일까요?",cicada:"매미는 단 몇 주 동안 울기 위해 땅속에서 몇 년을 기다린대요. 매미의 긴 기다림에 대해 어떻게 생각하나요?",firefly:"어두운 밤하늘을 수놓는 반딧불이의 차가운 빛(냉광)은 무엇을 위해 사용되는 것일까요?",stagbeetle:"사슴벌레의 거대한 집게턱은 씹는 용도가 아니라 친구들과 시합하기 위한 도구래요. 평화로운 경쟁에 대해 대화해봐요.",spider:"거미는 다리가 8개라서 곤충이 아닌 거미류에 속한대요. 거미가 거미줄을 치고 곤충을 사냥하는 지혜를 알아봅시다."}[this.insectId]||"이 곤충에 대해 오늘 배운 가장 신기한 사실은 무엇인가요?"}initCanvas(){this.canvas=document.getElementById("drawing-canvas"),this.ctx=this.canvas.getContext("2d"),this.ctx.lineCap="round",this.ctx.lineJoin="round",this.ctx.strokeStyle=this.brushColor,this.ctx.lineWidth=this.brushSize,this.ctx.fillStyle="#ffffff",this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height)}bindEvents(){this.canvas.addEventListener("mousedown",t=>this.startDrawing(t.offsetX,t.offsetY)),this.canvas.addEventListener("mousemove",t=>this.draw(t.offsetX,t.offsetY)),this.canvas.addEventListener("mouseup",()=>this.stopDrawing()),this.canvas.addEventListener("mouseleave",()=>this.stopDrawing()),this.canvas.addEventListener("touchstart",t=>{const a=this.canvas.getBoundingClientRect(),i=t.touches[0];this.startDrawing(i.clientX-a.left,i.clientY-a.top),t.preventDefault()}),this.canvas.addEventListener("touchmove",t=>{const a=this.canvas.getBoundingClientRect(),i=t.touches[0];this.draw(i.clientX-a.left,i.clientY-a.top),t.preventDefault()}),this.canvas.addEventListener("touchend",()=>this.stopDrawing());const e=this.container.querySelectorAll(".color-dot");e.forEach(t=>{t.addEventListener("click",()=>{e.forEach(a=>a.classList.remove("active")),t.classList.add("active"),this.brushColor=t.dataset.color})});const s=this.container.querySelectorAll(".brush-size-btn");s.forEach(t=>{t.addEventListener("click",()=>{s.forEach(a=>a.classList.remove("active")),t.classList.add("active"),this.brushSize=parseInt(t.dataset.size)})}),this.container.querySelector("#btn-clear-canvas").addEventListener("click",()=>{confirm("그림을 모두 지울까요?")&&(this.ctx.fillStyle="#ffffff",this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height))}),this.container.querySelectorAll("#recommended-sentences li").forEach(t=>{t.addEventListener("click",()=>{const a=t.dataset.text,i=this.container.querySelector("#writing-notebook");i.value=a})}),this.container.querySelector("#btn-listen-writing").addEventListener("click",()=>{const t=this.container.querySelector("#writing-notebook").value.trim();if(!t){alert("들어볼 영어 문장을 먼저 입력해 주세요!");return}this.speakText(t)}),this.container.querySelector("#btn-submit-activity").addEventListener("click",()=>{this.saveActivity()})}startDrawing(e,s){this.isDrawing=!0,this.lastX=e,this.lastY=s}draw(e,s){this.isDrawing&&(this.ctx.beginPath(),this.ctx.moveTo(this.lastX,this.lastY),this.ctx.lineTo(e,s),this.ctx.strokeStyle=this.brushColor,this.ctx.lineWidth=this.brushSize,this.ctx.stroke(),this.lastX=e,this.lastY=s)}stopDrawing(){this.isDrawing=!1}speakText(e){if("speechSynthesis"in window){window.speechSynthesis.cancel();const s=new SpeechSynthesisUtterance(e);s.lang="en-US",s.rate=.85,window.speechSynthesis.speak(s)}}saveActivity(){const e=this.container.querySelector("#writing-notebook").value.trim();if(!e){alert("영어 문장 쓰기 칸에 문장을 입력해주세요!");return}const s=this.canvas.toDataURL("image/png"),n=`bug_activity_${this.insectId}_${this.levelId}`,t={insectId:this.insectId,levelId:this.levelId,drawing:s,text:e,date:new Date().toLocaleDateString("ko-KR")};localStorage.setItem(n,JSON.stringify(t));const a="bug_activities_list",i=JSON.parse(localStorage.getItem(a)||"[]"),o=i.findIndex(c=>c.insectId===this.insectId&&c.levelId===this.levelId);o!==-1?i[o]=t:i.push(t),localStorage.setItem(a,JSON.stringify(i));const r=`bug_progress_${this.insectId}`,l=JSON.parse(localStorage.getItem(r)||'{"read":false,"quiz":false,"activity":false}');l.activity=!0,localStorage.setItem(r,JSON.stringify(l)),alert("참 잘했어요! 독후 활동 저장이 완료되었습니다. 🌟"),this.onSaveComplete&&this.onSaveComplete()}}class m{constructor(e,s,n){this.container=document.getElementById(e),this.insectId=s,this.insectData=n,this.messages=[],this.initWelcomeData()}initWelcomeData(){const e=this.insectData.nameKo,s=this.insectData.icon;this.messages=[{sender:"ai",text:`안녕! 나는 ${e} 박사야 ${s}! 우리 곤충 친구들에 대해 궁금한 점이 있으면 무엇이든 물어봐. "새로운 이야기 만들어줘" 버튼을 누르면 영어 동화도 들려줄 수 있어!`}];const n={ladybug:["무당벌레 등껍질의 점은 왜 있나요?","무당벌레는 무얼 먹고 사나요?","새로운 무당벌레 영어 동화 들려줘!"],ant:["개미는 무거운 짐을 어떻게 드나요?","개미집은 어떻게 생겼나요?","새로운 개미 영어 동화 들려줘!"],butterfly:["나비는 날개 가루가 묻으면 어떻게 되나요?","나비는 어떻게 맛을 느끼나요?","새로운 나비 영어 동화 들려줘!"],honeybee:["꿀벌은 왜 춤을 추나요?","꿀벌 침을 쏘면 진짜 죽나요?","새로운 꿀벌 영어 동화 들려줘!"],beetle:["장수풍뎅이 뿔은 뼈로 되어 있나요?","장수풍뎅이와 사슴벌레가 싸우면 누가 이기나요?","새로운 장수풍뎅이 영어 동화 들려줘!"],dragonfly:["잠자리는 날아가면서 물을 왜 엉덩이로 치나요?","잠자리는 어떻게 눈이 그렇게 큰가요?","새로운 잠자리 영어 동화 들려줘!"],grasshopper:["메뚜기는 왜 초록색인가요?","메뚜기는 귀가 어디에 있나요?","새로운 메뚜기 영어 동화 들려줘!"],mantis:["사마귀는 왜 기도하는 것처럼 보이나요?","사마귀가 벌도 잡아먹을 수 있나요?","새로운 사마귀 영어 동화 들려줘!"],cicada:["매미는 왜 여름에만 그렇게 시끄럽게 우나요?","매미는 땅속에서 얼마나 오래 사나요?","새로운 매미 영어 동화 들려줘!"],firefly:["반딧불이는 엉덩이 불이 뜨겁지 않나요?","반딧불이는 왜 불빛을 깜빡이나요?","새로운 반딧불이 영어 동화 들려줘!"],stagbeetle:["사슴벌레 턱은 물리면 많이 아픈가요?","사슴벌레는 무얼 먹고 사나요?","새로운 사슴벌레 영어 동화 들려줘!"],spider:["거미는 왜 곤충이 아닌가요?","거미줄은 왜 거미 몸에 엉키지 않나요?","새로운 거미 영어 동화 들려줘!"]};this.suggestions=n[this.insectId]||["이 곤충은 어디에 사나요?","이 곤충은 무엇을 먹나요?","재미있는 영어 동화 들려줘!"]}render(){this.container.innerHTML=`
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
            ${this.messages.map(e=>`
              <div class="msg-bubble ${e.sender}">
                ${e.text.replace(/\n/g,"<br>")}
              </div>
            `).join("")}
          </div>

          <!-- 추천 빠른 질문 버튼들 -->
          <div class="chat-suggestions">
            ${this.suggestions.map(e=>`
              <button class="suggest-btn" data-text="${e}">${e}</button>
            `).join("")}
          </div>

          <!-- 입력 바 -->
          <div class="chat-input-bar">
            <input type="text" id="chat-input" placeholder="질문을 입력하세요... (예: 밥은 뭘 먹어?)" />
            <button id="btn-send-chat" class="btn btn-primary" style="padding: 10px 18px;">전송</button>
          </div>
        </div>
      </div>
    `,this.updateStatusIndicator(),this.bindEvents(),this.scrollToBottom()}updateStatusIndicator(){const e=localStorage.getItem("gemini_api_key"),s=this.container.querySelector("#ai-status");e?(s.textContent="🟢 실시간 Gemini AI 모드 활성화",s.style.backgroundColor="#e8f5e9",s.style.color="#2e7d32"):(s.textContent="🔵 모의 AI 어린이 학습 모드",s.style.backgroundColor="#e3f2fd",s.style.color="#1565c0")}bindEvents(){this.container.querySelector("#btn-send-chat").addEventListener("click",()=>this.handleSendMessage()),this.container.querySelector("#chat-input").addEventListener("keypress",s=>{s.key==="Enter"&&this.handleSendMessage()}),this.container.querySelectorAll(".suggest-btn").forEach(s=>{s.addEventListener("click",()=>{const n=s.dataset.text;this.askAI(n)})})}scrollToBottom(){const e=this.container.querySelector("#chat-messages");e.scrollTop=e.scrollHeight}handleSendMessage(){const e=this.container.querySelector("#chat-input"),s=e.value.trim();s&&(e.value="",this.askAI(s))}appendMessage(e,s){this.messages.push({sender:e,text:s});const n=this.container.querySelector("#chat-messages"),t=document.createElement("div");t.className=`msg-bubble ${e}`,t.innerHTML=s.replace(/\n/g,"<br>"),n.appendChild(t),this.scrollToBottom()}async askAI(e){this.appendMessage("user",e);const s="ai-loading-bubble",n=this.container.querySelector("#chat-messages"),t=document.createElement("div");t.className="msg-bubble ai",t.id=s,t.innerHTML="생각하는 중... 🌿",n.appendChild(t),this.scrollToBottom();const a=localStorage.getItem("gemini_api_key");let i="";try{a?i=await this.callGeminiAPI(a,e):(await new Promise(o=>setTimeout(o,600)),i=this.getMockResponse(e))}catch(o){console.error(o),i="앗! 곤충 친구와 대화하는 도중 나뭇가지가 꺾였나 봐요. (연결 에러가 발생했습니다) 다시 한번 물어봐줄래?"}finally{const o=document.getElementById(s);o&&o.remove(),this.appendMessage("ai",i)}}async callGeminiAPI(e,s){const n=`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${e}`,a={contents:[{parts:[{text:`${`
      너는 7세~10세 어린이를 위한 아주 친절하고 상냥한 곤충 박사 AI야. 이름은 "${this.insectData.nameKo} 박사"이고 말투는 귀여운 이모티콘을 많이 섞어서 '~했어!', '~란다' 처럼 말해야 해.
      어린이 대상이므로 너무 어려운 전문 용어는 피하고 비유를 들어서 쉽게 설명해줘.
      
      [미션]
      1. 사용자가 질문하는 '${this.insectData.nameEn}(${this.insectData.nameKo})'에 관한 자연과학적 호기심을 한글로 해결해준다.
      2. 만약 질문이 "새로운 이야기 만들어줘" 또는 "영어 동화 들려줘"와 같이 스토리와 관련되어 있다면, 3~4문장 분량의 아주 쉬운 영어 그림책 버전을 영문으로 창작해준다. 그리고 그 밑에 한글 해석을 덧붙여 준다.
         (예시 영어 문장 수준: "This is a little bee. It gathers golden honey. It shares honey with family. We love honey!")
    `}

사용자 질문: ${s}`}]}]},i=await fetch(n,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)});if(!i.ok)throw new Error("Gemini API call failed");return(await i.json()).candidates[0].content.parts[0].text}getMockResponse(e){const s=this.insectData.nameKo;if(e.includes("동화")||e.includes("이야기")||e.includes("story")||e.includes("Story"))return this.generateMockStory();const t={ladybug:{점:"무당벌레 등껍질의 점은 천적(새 등)에게 '나는 맛이 없으니 먹지 마!' 하고 경고하는 신호등 역할을 해 🛑! 그리고 종류에 따라 2개, 7개, 28개 등 다양한 개수의 점이 있단다.",먹고:"무당벌레는 식물을 아프게 하는 나쁜 '진딧물'을 아주아주 좋아해 😋! 하루에 수백 마리씩 먹어서 농부 삼촌들을 도와주는 꼬마 경찰관이란다.",어디:"무당벌레는 풀밭이나 나무잎사귀 위에서 주로 살아! 특히 진딧물이 많은 장미 덤불 근처에서 자주 발견된단다 🌹.",default:"무당벌레는 무당벌레과에 속하는 곤충으로, 뒤집어지면 다리를 바르르 떨며 죽은 척하는 귀여운 개인기도 가지고 있어 🐞! 또 궁금한 게 있니?"},ant:{무거운:"개미는 자기 몸무게보다 무려 50배나 더 무거운 물건을 들 수 있어 💪! 사람으로 치면 트럭을 번쩍 들어 올리는 엄청난 천하장사인 셈이지!",개미집:"개미집은 흙속에 여왕방, 아기방, 먹이 창고, 심지어 쓰레기장까지 나누어진 아주 거대한 아파트 모양을 하고 있어 🏢! 대단하지 않니?",default:"개미는 냄새가 나는 '페로몬'이라는 물질을 뿜어 길을 잃지 않고 친구들과 서로 도우며 산단다 🐜!"},butterfly:{가루:"나비 날개에 묻은 고운 가루는 비를 막아주고, 체온을 지켜주는 소중한 우산 같은 역할을 해 ☔! 억지로 만지면 날개가 손상되어 날지 못할 수도 있으니 눈으로만 예쁘게 봐주자!",맛:"신기하게도 나비는 입이 아니라 '발'에 맛을 느끼는 감각 센서가 있어 🦶! 그래서 꽃 위에 내려앉는 순간 달콤한 꿀인지 바로 알 수 있단다.",default:"나비는 번데기 속에서 꾹 참고 견디다가 예쁜 날개를 활짝 펼치고 태어나는 꿈을 가진 천사 곤충이야 🦋!"},honeybee:{춤:"꿀벌들은 맛있는 꿀이 있는 장소를 발견하면 엉덩이를 씰룩거리며 8자 모양 춤을 춰 💃! 춤추는 각도와 움직임으로 다른 벌들에게 꿀의 위치와 거리를 설명해주는 대단한 통신원이지!",침:"꿀벌의 침은 내장과 연결되어 있어서 한 번 쏘면 죽게 돼 😢. 그래서 꿀벌은 정말 위험하다고 느낄 때만 스스로를 지키기 위해 침을 쏜단다. 꽃집 벌들을 무서워하지 않아도 돼!",default:"꿀벌은 우리가 먹는 수많은 과일과 채소꽃들을 찾아다니며 열매를 맺게 해주는 지구의 아주 고마운 정원사란다 🐝!"}}[this.insectId]||{};for(const a in t)if(e.includes(a))return t[a];return`오! ${s}에 대한 정말 좋은 질문이야 💡! ${s}은(는) 신비로운 곤충이란다.

실시간 대화로 더 넓고 깊은 질문을 하고 싶다면 부모님 화면에서 'Gemini API Key'를 등록하면 진짜 곤충 박사님이 직접 설명해주실 거야 👨‍🔬!`}generateMockStory(){const e=this.insectData.nameKo,s=this.insectData.nameEn,n=this.insectData.icon,t=[`📖 [${s}의 작은 모험]

Once upon a time, a little ${s.toLowerCase()} lived in a green forest ${n}.
Every day, the ${s.toLowerCase()} looked at the sky.
"I want to touch the soft white cloud!" the ${s.toLowerCase()} said.
With tiny wings, it flew high and smiled at the sun ☀️.

(옛날 옛적에, 초록 숲속에 작은 ${e}가 살았습니다.
매일 ${e}는 하늘을 바라보았습니다.
"나는 말랑말랑한 흰 구름을 만지고 싶어!" ${e}가 말했습니다.
작은 날개로, 그것은 높이 날아올라 태양을 보며 웃었습니다.)`,`📖 [${s}와 숲속의 파티]

Today is the big summer party in the woods 🥳.
The friendly ${s.toLowerCase()} brought delicious sweet food.
All insect friends came and danced together bzz-bzz!
"We are small, but we are a happy family!" they cheered 🎉.

(오늘은 숲속에서 큰 여름 파티가 열리는 날입니다.
친절한 ${e}는 맛있고 달콤한 음식을 가져왔습니다.
모든 곤충 친구들이 모여 다 함께 윙윙 춤을 추었습니다!
"우리는 작지만, 행복한 가족이야!" 그들은 즐거워했습니다.)`],a=Math.floor(Math.random()*t.length);return t[a]}}class y{constructor(e,s){this.container=document.getElementById(e),this.onResetData=s}render(){const e=this.calculateStats(),s=JSON.parse(localStorage.getItem("bug_activities_list")||"[]"),n=localStorage.getItem("gemini_api_key")||"";this.container.innerHTML=`
      <div class="parent-dashboard">
        <div class="welcome-banner" style="text-align: left;">
          <h1>👨‍👩‍👧 학부모 대시보드</h1>
          <p>자녀의 영어 곤충 학습 진행 상황과 그린 그림들을 한눈에 확인하세요.</p>
        </div>

        <!-- 1. 통계 요약 카드 그리드 -->
        <div class="dashboard-stats">
          <div class="stat-card">
            <span class="stat-number" id="stats-stars">⭐ ${e.totalStars}</span>
            <span class="stat-label">획득한 누적 별</span>
          </div>
          <div class="stat-card">
            <span class="stat-number" id="stats-read-books">📖 ${e.readCount}권</span>
            <span class="stat-label">완독한 그림책</span>
          </div>
          <div class="stat-card">
            <span class="stat-number" id="stats-learned-words">🔤 ${e.wordCount}개</span>
            <span class="stat-label">학습한 총 단어</span>
          </div>
          <div class="stat-card">
            <span class="stat-number" id="stats-quiz-score">🎯 ${e.quizScore}%</span>
            <span class="stat-label">평균 퀴즈 정답률</span>
          </div>
        </div>

        <!-- 2. 독후 활동 갤러리 (그림 & 텍스트) -->
        <div class="badge-cabinet" style="margin-top: 24px;">
          <h3>🎨 아이의 독후 활동 작품 갤러리</h3>
          <div class="gallery-grid" id="dashboard-gallery">
            ${s.length===0?`
              <div class="empty-gallery">
                 아직 완료된 독후 활동(그림 그리기 & 글쓰기)이 없습니다.<br>
                아이와 함께 곤충 책을 읽고 첫 독후 활동을 완료해보세요!
              </div>
            `:s.map((t,a)=>`
              <div class="gallery-card" data-index="${a}">
                <img src="${t.drawing}" class="gallery-image" alt="아이 그림" />
                <div class="gallery-info">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h4>${this.getInsectNameKo(t.insectId)} (Lv.${t.levelId.replace("level","")})</h4>
                    <span style="font-size:0.75rem; color:var(--text-light);">${t.date}</span>
                  </div>
                  <p class="writing-sentence" title="${t.text}">✍️ "${t.text}"</p>
                  <button class="btn btn-secondary btn-delete-activity" data-insect="${t.insectId}" data-level="${t.levelId}" style="width:100%; margin-top:8px; padding:4px; font-size:0.8rem; background:#ffebee; color:#c62828; border-color:#ffcdd2;">
                    삭제하기
                  </button>
                </div>
              </div>
            `).join("")}
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
                     placeholder="AI 키를 입력하세요 (AIzaSy...)" value="${n}" />
              <button id="btn-save-api-key" class="btn btn-primary">저장</button>
              ${n?'<button id="btn-delete-api-key" class="btn btn-secondary" style="background:#ffebee; color:#c62828; border-color:#ffcdd2;">삭제</button>':""}
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
    `,this.bindEvents()}bindEvents(){this.container.querySelector("#btn-save-api-key").addEventListener("click",()=>{const n=this.container.querySelector("#gemini-key-input").value.trim(),t=this.container.querySelector("#api-key-status-msg");if(!n){alert("API Key를 먼저 입력해 주세요!");return}localStorage.setItem("gemini_api_key",n),t.textContent="✅ API 키가 브라우저에 안전하게 저장되었습니다.",t.style.color="#2e7d32",setTimeout(()=>this.render(),1200)});const e=this.container.querySelector("#btn-delete-api-key");e&&e.addEventListener("click",()=>{confirm("저장된 API 키를 삭제하고 모의 AI 모드로 전환할까요?")&&(localStorage.removeItem("gemini_api_key"),this.render())}),this.container.querySelectorAll(".btn-delete-activity").forEach(n=>{n.addEventListener("click",()=>{const t=n.dataset.insect,a=n.dataset.level;confirm("해당 독후 활동 그림과 기록을 삭제할까요?")&&this.deleteActivity(t,a)})}),this.container.querySelector("#btn-reset-all-data").addEventListener("click",()=>{confirm(`정말로 모든 데이터(그림, 기록, 별)를 공장 초기화할까요?
이 작업은 되돌릴 수 없습니다.`)&&(localStorage.clear(),alert("모든 학습 데이터가 초기화되었습니다."),this.onResetData&&this.onResetData())})}calculateStats(){let e=0,s=0,n=0,t=0,a=0;["ladybug","ant","butterfly","honeybee","beetle","dragonfly","grasshopper","mantis","cicada","firefly","stagbeetle","spider"].forEach(r=>{const l=JSON.parse(localStorage.getItem(`bug_progress_${r}`)||'{"read":false,"quiz":false,"activity":false}');l.read&&(s++,e++),l.quiz&&e++,l.activity&&e++;const c=JSON.parse(localStorage.getItem(`bug_words_${r}`)||"[]");n+=c.length;const d=localStorage.getItem(`bug_quiz_score_${r}`);d!==null&&(t+=parseInt(d),a++)});const o=a>0?Math.round(t/a):0;return{totalStars:e,readCount:s,wordCount:n,quizScore:o}}getInsectNameKo(e){return{ladybug:"무당벌레",ant:"개미",butterfly:"나비",honeybee:"꿀벌",beetle:"장수풍뎅이",dragonfly:"잠자리",grasshopper:"메뚜기",mantis:"사마귀",cicada:"매미",firefly:"반딧불이",stagbeetle:"사슴벌레",spider:"거미"}[e]||e}deleteActivity(e,s){localStorage.removeItem(`bug_activity_${e}_${s}`);const n="bug_activities_list";let t=JSON.parse(localStorage.getItem(n)||"[]");t=t.filter(o=>!(o.insectId===e&&o.levelId===s)),localStorage.setItem(n,JSON.stringify(t));const a=`bug_progress_${e}`,i=JSON.parse(localStorage.getItem(a)||'{"read":false,"quiz":false,"activity":false}');i.activity=!1,localStorage.setItem(a,JSON.stringify(i)),this.render()}}const f={id:"ladybug",nameKo:"무당벌레",nameEn:"Ladybug",icon:"🐞",levels:{level1:{story:["This is Lucy the Ladybug. She lives on a green leaf.","Lucy has bright red wings. She has seven black spots.","Lucy is very hungry today. She looks around for food.","Look! There are tiny green bugs on the leaf. They are aphids.","Lucy eats the tiny bugs. Munch, munch! So delicious!","The green leaf is clean now. Thank you, Lucy!"]},level2:{story:["Meet Lucy, a tiny ladybug with bright red wings and seven shiny black spots.","Lucy lives in a big green garden. Her favorite home is a soft rose leaf.","One sunny morning, Lucy feels very hungry. She flies around to search for breakfast.","She finds many tiny green insects called aphids. Aphids hurt the beautiful plants.","Lucy eats the aphids one by one. Munch, munch! She is helping the garden grow healthy.","With a full tummy, Lucy opens her wings and flies high into the warm sky. Goodbye, Lucy!"]},level3:{story:["Deep in the green garden, a little beetle named Lucy wakes up. She is a ladybug, a beautiful helper loved by farmers all over the world.","Lucy has hard, shiny red wings. These outer wings protect her soft body and show off seven black spots that warn birds to stay away.","Today, Lucy is on a mission. The rose bushes are covered with tiny green pests called aphids. These pests are drinking all the sap and making the roses sick.","Ladybugs are voracious eaters. Lucy walks slowly under the leaves, catching the aphids with her quick legs and eating them one by one.","By eating the pests, Lucy keeps the rose plants healthy and strong. She can eat up to five thousand insects during her lifetime!","After a busy day of cleaning the garden, Lucy climbs to the top of a flower, spreads her wings, and flies away into the sunset."]},level4:{story:["In the complex ecosystem of our backyard, a miniature superhero named Lucy the Ladybug begins her day. Belonging to the family Coccinellidae, she is a beetle of vital ecological importance.","Lucy wears a hard, dome-shaped shield. Her bright red coloration, known as aposematic coloring, serves as a natural warning system to alert predators of her bitter, unpleasant taste.","Underneath her hard elytra lies a pair of delicate wings. Although she flies somewhat clumsily, Lucy can travel long distances in search of plants infested with agricultural pests.","Today, she patrols the organic tomato garden, which is heavily infested with destructive aphids. These sap-sucking pests damage crops and spread plant diseases.","As an efficient predator, Lucy consumes dozens of aphids daily. By regulating the pest population naturally, ladybugs eliminate the need for harmful chemical pesticides.","Through her daily routine, Lucy illustrates the beautiful balance of nature. Having protected the crops, she folds her wings and rests, ready for tomorrow's patrol."]}},words:[{word:"ladybug",meaning:"무당벌레",example:"The ladybug is on the flower."},{word:"wings",meaning:"날개",example:"Birds and insects have wings to fly."},{word:"spots",meaning:"점/무늬",example:"A ladybug has black spots."},{word:"leaf",meaning:"나뭇잎",example:"The caterpillar is eating a leaf."},{word:"insect",meaning:"곤충",example:"An ant is a tiny insect."},{word:"fly",meaning:"날다",example:"Ladybugs can fly high."}],quiz:[{question:"What color are Lucy's wings?",options:["Red","Blue","Green"],answer:0},{question:"What does Lucy like to eat?",options:["Leaves","Tiny insects (aphids)","Flowers"],answer:1}],facts:["7 spots (7개의 검은 점)","Eats aphids (진딧물을 먹음)","Can fly (날 수 있음)"]},b={id:"ant",nameKo:"개미",nameEn:"Ant",icon:"🐜",levels:{level1:{story:["This is Andy the Ant. Andy is very small.","Andy lives in a dark tunnel under the ground.","Today, Andy finds a big, sweet sugar crystal.","The sugar is too heavy. Andy cannot lift it alone.","Andy calls his ant friends. They carry it together.","They share the sweet food in their big home."]},level2:{story:["Meet Andy, a tiny black ant who is always busy and hardworking.","Andy lives in a large underground city with thousands of ant brothers.","One afternoon, Andy discovers a large, sweet grape dropped on the grass.","It is much heavier than him, but ants are super strong and never give up.","Andy taps his friends with his feelers to ask for help.","Together, the team carries the heavy grape back to their nest."]},level3:{story:["Beneath the soil of the schoolyard, a worker ant named Andy starts his shift. He belongs to a highly structured family called a colony.","Andy's job today is foraging. He walks along the forest floor, using his antennae to search for food and feel the vibrations around him.","He finds a giant slice of apple near a park bench. Andy cannot carry it alone, so he leaves a chemical trail as he runs back home.","His fellow worker ants smell the chemical trail, called pheromones, and follow Andy back to the apple slice.","Working as a perfect team, dozens of ants lift the heavy fruit and march back to the nest in a long, neat line.","Thanks to Andy's discovery and their amazing teamwork, the colony has enough food to feed the baby larvae and the queen for days."]},level4:{story:["Beneath the surface of the meadow lies a complex underground metropolis ruled by organization and teamwork. Here, we follow Andy, a worker ant of the species Formica.","Andy belongs to the worker caste, meaning his life is dedicated to foraging, nest maintenance, and caring for the offspring of the queen ant.","During his patrol, Andy locates a rich source of honeydew dropped by aphids. To communicate this discovery, he lays down an odor trail of chemical pheromones.","Other foragers detect the trail with their sensitive antennae. Soon, a highly organized supply chain of ants forms, marching in perfect coordination.","Ants are famous for their mechanical efficiency. They can carry objects up to fifty times their own weight by using specialized neck joints.","By aerating the soil through tunnel digging and distributing organic matter, Andy and his colony perform vital ecosystem services that keep our soil healthy."]}},words:[{word:"ant",meaning:"개미",example:"The ant is carrying a big leaf."},{word:"small",meaning:"작은",example:"An ant is a small insect."},{word:"ground",meaning:"땅",example:"Ants dig tunnels in the ground."},{word:"carry",meaning:"나르다/운반하다",example:"Ants carry food together."},{word:"strong",meaning:"힘이 센",example:"Ants are small but very strong."},{word:"colony",meaning:"집단/군집",example:"Millions of ants live in one colony."}],quiz:[{question:"Where do ants live?",options:["In the air","In the ground","In the ocean"],answer:1},{question:"How do ants talk to each other?",options:["Using phone calls","Using chemical signals (pheromones)","Using loud noises"],answer:1}],facts:["Live in colonies (군집 생활)","Super strong (자기 무게의 50배를 운반)","Use pheromones (페로몬 화학물질로 소통)"]},v={id:"butterfly",nameKo:"나비",nameEn:"Butterfly",icon:"🦋",levels:{level1:{story:["This is Bella the Butterfly. She has colorful wings.","First, Bella was a tiny egg on a leaf.","Then, she became a hungry caterpillar. Munch, munch!","Next, she slept in a hard chrysalis cocoon.","Now, Bella is a beautiful butterfly in the sky.","She flies to colorful flowers to drink sweet juice."]},level2:{story:["Bella the butterfly has orange and black wings that shimmer in the sun.","She remembers when she was a little green caterpillar eating green leaves all day.","One day, she stopped eating and built a cozy green house called a chrysalis.","Inside the chrysalis, she changed slowly. She grew legs and wings.","Finally, the shell popped open, and Bella stretched her brand new wings.","Now she flies from flower to flower, drinking sweet nectar through a straw-like tongue."]},level3:{story:["In the warm morning breeze, a beautiful monarch butterfly named Bella flutters her wings. Her life is a story of a magical change.","Bella started as a tiny egg, hatching into a caterpillar that ate milkweed leaves until she grew large and plump.","When the time was right, Bella hung upside down and formed a protective shell called a chrysalis to undergo metamorphosis.","After two weeks of quiet resting, the chrysalis became transparent, and Bella carefully emerged as a fully grown butterfly.","Her beautiful orange wings have tiny scales that reflect the sunlight and warn hungry birds that she is poisonous to eat.","Now, Bella spends her days pollinating the garden by carrying pollen from flower to flower while drinking sweet nectar."]},level4:{story:["Among the most graceful inhabitants of the sky is Bella the Monarch Butterfly. Her lifecycle represents one of nature's most fascinating biological transformations.","Like all insects in the order Lepidoptera, Bella undergoes complete metamorphosis, transitioning from larva to pupa, and finally to an adult imago.","During the pupal stage inside the chrysalis, her larval body was broken down and rebuilt into a complex flying organism with compound eyes and wings.","Her magnificent wings are covered with thousands of microscopic scales. These scales provide thermal insulation, warning patterns, and aerodynamic lift.","Bella uses a specialized proboscis, a long, coiled mouthpart, to siphon nectar from deep within flowers, acting as an essential pollinator.","Every autumn, Monarchs embark on a spectacular multi-generational migration of thousands of miles, guided by an internal solar compass."]}},words:[{word:"butterfly",meaning:"나비",example:"The butterfly landed on my hand."},{word:"pretty",meaning:"예쁜",example:"Flowers have pretty colors."},{word:"flower",meaning:"꽃",example:"Bees and butterflies love flowers."},{word:"caterpillar",meaning:"애벌레",example:"A caterpillar crawls on a branch."},{word:"chrysalis",meaning:"번데기",example:"The butterfly emerges from the chrysalis."},{word:"nectar",meaning:"꽃꿀",example:"Butterflies use their long tongues to drink nectar."}],quiz:[{question:"What does a butterfly drink from flowers?",options:["Water","Nectar","Milk"],answer:1},{question:"What is the process of changing from a caterpillar to a butterfly called?",options:["Metamorphosis","Migration","Hibernation"],answer:0}],facts:["Metamorphosis (알-애벌레-번데기-나비 과정)","Drinks nectar (빨대 모양 주둥이로 꽃꿀을 마심)","Scales on wings (날개에 고운 비늘이 있어 화려함)"]},w={id:"honeybee",nameKo:"꿀벌",nameEn:"Honeybee",icon:"🐝",levels:{level1:{story:["This is Buzz the Honeybee. Buzz wears yellow stripes.","Buzz flies to flowers. Buzz collects yellow dust called pollen.","Buzz carries the pollen back to the bee hive.","Buzz works with thousands of sisters inside the hive.","Together, they make sweet golden honey for winter.","Thank you, Buzz, for the sweet honey!"]},level2:{story:["Meet Buzz, a busy honeybee who wears fuzzy black and yellow stripes.","Buzz flies from flower to flower, collecting sweet nectar and dusty yellow pollen.","She stores the sweet nectar in her honey stomach and carries pollen on her back legs.","When Buzz goes back to the hive, she shares the food with other worker bees.","Together they dry the nectar with their wings to make sweet golden honey.","Bees are also great helpers because they pollinate flowers, helping fruits grow."]},level3:{story:["In a sunny meadow, a worker bee named Buzz starts her morning flight. She belongs to a hive of over fifty thousand bees.","Buzz is looking for the best flowers. When she finds a patch of sweet clover, she drinks the nectar and stores it in her stomach.","As she moves, pollen sticks to her fuzzy legs, which she packs into little pollen baskets on her thighs.","When Buzz returns, she performs a waggle dance to show other bees the exact direction of the flowers.","Inside the hive, bees turn the nectar into honey by fanning it with their wings to evaporate water.","Without bees like Buzz to pollinate plants, many of the fruits and vegetables we love would not grow."]},level4:{story:["Among the most socially sophisticated insects is Buzz the Honeybee, belonging to the species Apis mellifera.","Buzz is a worker bee, a female dedicated to pollen gathering, comb building, and hive ventilation.","She collects nectar and pollen, accidentally transferring pollen grains between flowers, which allows plants to reproduce.","Buzz communicates the precise coordinates of food sources through the waggle dance, adjusting for the sun's movement.","In the hive, bees process nectar enzymatically and reduce moisture content to produce honey, which never spoils.","Due to habitat loss and pesticides, bee populations are declining, threatening global biodiversity and agriculture."]}},words:[{word:"honeybee",meaning:"꿀벌",example:"A honeybee flew into the garden."},{word:"honey",meaning:"꿀",example:"I put sweet honey on my toast."},{word:"hive",meaning:"벌집",example:"Honeybees live together in a hive."},{word:"pollen",meaning:"꽃가루",example:"Bees carry yellow pollen on their legs."},{word:"pollinate",meaning:"수분하다/가루받이하다",example:"Bees pollinate flowers to make fruits."},{word:"dance",meaning:"춤",example:"Bees talk by doing a special dance."}],quiz:[{question:"What do honeybees collect to make honey?",options:["Water and leaves","Nectar and pollen","Seeds and soil"],answer:1},{question:"Who rules the honeybee hive?",options:["The king bee","The queen bee","The soldier bee"],answer:1}],facts:["Makes honey (겨울을 나기 위해 꿀을 비축함)","Waggle dance (춤으로 꿀이 있는 방향을 알림)","Crucial pollinator (식물이 열매를 맺도록 도움)"]},k={id:"beetle",nameKo:"장수풍뎅이",nameEn:"Rhinoceros Beetle",icon:"🪲",levels:{level1:{story:["This is Rocky the Beetle. Rocky has a huge horn.","Rocky lives in a dark oak forest.","Rocky has a hard, shiny brown shell.","Rocky climbs trees at night. He drinks sweet tree sap.","Another beetle comes! Rocky uses his horn to wrestle.","Rocky wins the battle and eats his sweet tree sap."]},level2:{story:["Meet Rocky, a rhinoceros beetle named after a rhino because of his giant horn.","Rocky wears a hard outer shell called an exoskeleton that protects him like armor.","Rocky sleeps under rotting wood during the day and wakes up at night.","At night, he climbs oak trees to drink sweet tree sap, his favorite drink.","Sometimes Rocky must wrestle other male beetles for the best tree sap.","He uses his powerful horn to lift and throw rivals off the tree branch."]},level3:{story:["Deep in the oak forest, a giant beetle named Rocky crawls out from beneath the soil. He is a rhinoceros beetle.","Rocky has a hard exoskeleton made of chitin. On his head is a magnificent Y-shaped horn.","Rocky is nocturnal. He spends the daylight hours hiding under rotting logs to stay safe from hungry birds.","When night falls, Rocky flies clumsily toward the top of oak trees, searching for sweet tree sap.","If another male beetle challenges him, Rocky gets ready to fight. They wrestle on the tree trunk.","Using his horn as a lever, Rocky flips the rival off the tree. Rocky is the king of the forest!"]},level4:{story:["Deep within deciduous forests resides Rocky, a rhinoceros beetle of the subfamily Dynastinae.","Rocky is famous for his incredible strength, capable of lifting objects up to 850 times his body weight.","His head is equipped with a large horn, a sexually dimorphic trait used primarily during male combat.","Rocky is nocturnal, emerging after dark to feed on fermenting tree sap and ripe forest fruits.","During combat, male beetles lock horns on tree trunks, trying to pry their opponent off the bark.","Rocky's hard shell, the exoskeleton, provides defense and reduces water loss, aiding his survival in the forest."]}},words:[{word:"beetle",meaning:"딱정벌레/갑충",example:"A beetle has hard wings."},{word:"horn",meaning:"뿔",example:"The male beetle has a long horn."},{word:"strong",meaning:"힘이 센",example:"The rhinoceros beetle is super strong."},{word:"wrestle",meaning:"싸우다/레슬링하다",example:"Beetles wrestle over food."},{word:"sap",meaning:"수액",example:"Beetles drink sweet tree sap."},{word:"nocturnal",meaning:"야행성의",example:"Nocturnal animals wake up at night."}],quiz:[{question:"What is the rhinoceros beetle named after?",options:["An elephant","A rhinoceros","A deer"],answer:1},{question:"What is the hard outer shell of a beetle called?",options:["Antler","Skin","Exoskeleton"],answer:2}],facts:["Giant horn (코뿔소를 닮은 큰 머리 뿔)","Super strength (자기 무게의 800배가 넘는 힘)","Exoskeleton (단단한 갑옷 같은 키틴질 외골격)"]},S={id:"dragonfly",nameKo:"잠자리",nameEn:"Dragonfly",icon:"🛸",levels:{level1:{story:["This is Drake the Dragonfly. He has four clear wings.","Drake has two giant eyes. He can see everything.","Drake flies near the blue pond. He is very fast.","He can fly forward. He can fly backward, too.","Look! A mosquito is in the air. Drake zooms in.","Drake catches the mosquito with his legs. Zap!"]},level2:{story:["Meet Drake, a colorful dragonfly with four transparent wings and two giant eyes.","Drake is an amazing flyer who can hover in the air and fly backwards like a helicopter.","His big eyes are made of thousands of tiny lenses, helping him spot insects easily.","Before Drake had wings, he lived under the pond water as a baby called a nymph.","Now, Drake flies above the water, hunting for mosquitoes and gnats.","He catches his prey in mid-air with his legs shaped like a basket."]},level3:{story:["Above the calm pond water, a speed champion named Drake patrols the air. He is a dragonfly.","Drake has four long, transparent wings that move independently, allowing him to fly in any direction.","His head is almost entirely covered by two massive compound eyes, containing thirty thousand lenses.","Drake spent the first two years of his life underwater as a nymph, hunting tadpoles and small fish.","Now an adult, he is a master aerial predator, catching flies and mosquitoes in mid-air.","By catching thousands of mosquitoes, Drake helps keep the pond area safe and pleasant for everyone."]},level4:{story:["Hovering above freshwater ecosystems is Drake, a dragonfly belonging to the ancient order Odonata.","Drake possesses highly advanced flight mechanics, utilizing direct flight muscles to control each wing independently.","His compound eyes cover almost his entire head, offering an almost 360-degree field of vision.","He underwent incomplete metamorphosis, spending his larval stage as a predatory aquatic nymph.","As an adult, Drake has a hunting success rate of ninety-five percent, capturing prey mid-flight.","His presence is a positive indicator of water quality, making him an important environmental bioindicator."]}},words:[{word:"dragonfly",meaning:"잠자리",example:"A dragonfly has blue wings."},{word:"fast",meaning:"빠른",example:"Dragonflies are very fast flyers."},{word:"backwards",meaning:"뒤로/역방향으로",example:"A helicopter can fly backwards."},{word:"hunter",meaning:"사냥꾼",example:"The dragonfly is a sky hunter."},{word:"nymph",meaning:"약충(물속 애벌레)",example:"Dragonfly nymphs live in ponds."},{word:"compound eyes",meaning:"겹눈",example:"Insects have compound eyes to see clearly."}],quiz:[{question:"Which of these is true about dragonfly flight?",options:["They can only fly forward","They can fly in all directions, including backwards","They cannot fly very fast"],answer:1},{question:"Where do baby dragonflies (nymphs) live?",options:["In trees","In the dirt","In the water"],answer:2}],facts:["Flight master (공중정지, 급회전, 후진 가능)","30,000 lenses (약 3만 개의 낱눈이 뭉친 겹눈)","Nymph in water (물속에서 물고기 새끼 등을 사냥)"]},x={id:"grasshopper",nameKo:"메뚜기",nameEn:"Grasshopper",icon:"🦗",levels:{level1:{story:["This is Greeny the Grasshopper. He lives in the grass.","Greeny is bright green. He can hide in the leaves.","Greeny has long back legs. They are very strong.","A hungry frog sits nearby! Greeny needs to move.","Greeny jumps high in the air. Boing!","Greeny lands safely in the soft clover. Hurrah!"]},level2:{story:["Meet Greeny, a bright green grasshopper who loves jumping through the fields.","Greeny uses his green body to camouflage and hide from hungry birds in the garden.","He has powerful hind legs that work like springboards, launching him high.","Greeny is a herbivore, which means he loves chewing on green leaves and grass.","When Greeny rubs his long back legs against his wings, he makes a chirping sound.","He jumps far away whenever he feels danger, escaping to a safe spot."]},level3:{story:["In the tall grass of the meadow, a long-legged jumper named Greeny wakes up. He is a grasshopper.","Greeny's green color helps him blend in with the leaves, hiding him from predators like frogs and birds.","Greeny has large hind legs that store energy like a rubber band before launching him into the air.","He can leap up to twenty times his body length, which is like a human jumping over a house!","To talk to other grasshoppers, Greeny rubs his legs against his wings, creating a musical chirping sound.","By eating grass, Greeny helps recycle plant nutrients, playing his role in the meadow ecosystem."]},level4:{story:["Inhabiting grasslands worldwide is Greeny the Grasshopper, a member of the suborder Caelifera.","Greeny is an herbivore with chewing mandibles adapted for consuming grass, leaves, and crops.","His primary defense is camouflage, supplemented by powerful hind legs modified for saltatorial locomotion.","These hind legs store elastic energy in the cuticle, releasing it to launch the insect rapidly from danger.","Greeny produces sound via stridulation, rubbing specialized ridges on his hind legs against his forewings.","Under crowded conditions, some grasshopper species undergo physical changes and form destructive swarms called locusts."]}},words:[{word:"grasshopper",meaning:"메뚜기",example:"A grasshopper jumped on my shoe."},{word:"powerful",meaning:"강력한/힘이 센",example:"Bears have powerful claws."},{word:"escape",meaning:"탈출하다/도망치다",example:"The mouse escaped from the cat."},{word:"herbivore",meaning:"초식동물",example:"Rabbits are herbivores."},{word:"rub",meaning:"비비다/마찰하다",example:"Rub your hands to make them warm."},{word:"swarm",meaning:"무리/떼",example:"A swarm of locusts covered the sky."}],quiz:[{question:"What do grasshoppers eat?",options:["Other insects","Plants and leaves","Fish and frogs"],answer:1},{question:"How do grasshoppers make music/sounds?",options:["By clapping their hands","By singing with their mouth","By rubbing their legs on wings"],answer:2}],facts:["Jumping catapult (자기 몸의 20배 높이 점프)","Stridulation (뒷다리와 날개를 비벼 소리 냄)","Locust morph (조건이 맞으면 떼를 지어 이동함)"]},I={id:"mantis",nameKo:"사마귀",nameEn:"Praying Mantis",icon:"🎋",levels:{level1:{story:["This is Manny the Mantis. He is a green hunter.","Manny sits on a twig. He holds his front legs high.","He looks like he is praying. But he is waiting.","A fly buzzes near Manny. Manny stays very still.","Manny turns his head to look. Then, he strikes. Zap!","Manny catches the fly with his sharp front legs."]},level2:{story:["Meet Manny, a praying mantis who is a master of disguise in the garden.","Manny gets his name because he folds his front legs as if he is praying.","He has sharp spikes on his front legs to grab other insects tightly.","Manny is green and shape-like a leaf, so other bugs do not see him waiting.","He can turn his head 180 degrees, looking all the way behind him.","When a bug flies too close, Manny strikes with lightning speed and catches it."]},level3:{story:["Quietly perched on a rose branch, a patient predator named Manny waits. He is a praying mantis.","Manny is a master of camouflage. His green, leaf-like body makes him invisible to both prey and predators.","Manny has raptorial front legs equipped with sharp spines designed to trap insects instantly.","He is the only insect that can turn its head 180 degrees to look over its shoulder.","Using his stereo vision, Manny measures the exact distance to a cricket sitting nearby.","In a split second, Manny strikes, capturing his dinner. The garden patrol has succeeded!"]},level4:{story:["Perched in the garden canopy is Manny the Praying Mantis, a predatory insect of the order Mantodea.","Manny is a carnivorous ambush predator, relying on camouflage to blend in with foliage.","His front legs are highly modified raptorial limbs, lined with spines to grip struggling prey.","Manny possesses a flexible joint allowing a 180-degree head rotation, unique among known insect species.","His compound eyes are widely spaced, providing binocular vision and depth perception crucial for striking.","By consuming herbivorous pests, mantises act as biological control agents, maintaining garden health."]}},words:[{word:"mantis",meaning:"사마귀",example:"A mantis is waiting on the leaf."},{word:"pray",meaning:"기도하다",example:"The mantis looks like it is praying."},{word:"spikes",meaning:"가시/뾰족한 돌기",example:"Its legs have sharp spikes."},{word:"camouflage",meaning:"위장",example:"Animals use camouflage to hide."},{word:"prey",meaning:"먹이/사냥감",example:"The frog caught its prey."},{word:"strike",meaning:"공격하다/치다",example:"The mantis strikes very quickly."}],quiz:[{question:"Why is the mantis called a 'praying' mantis?",options:["Because it holds its front legs like it is praying","Because it is very peaceful","Because it lives in churches"],answer:0},{question:"What is special about the neck of a mantis?",options:["It cannot move","It can turn its head 180 degrees","It is very long like a giraffe"],answer:1}],facts:["Raptorial legs (가시가 달린 앞다리로 사냥)","180-degree turn (머리를 180도 회전하는 유일한 곤충)","Stereo vision (입체시를 가져 거리를 정확히 측정)"]},z={id:"cicada",nameKo:"매미",nameEn:"Cicada",icon:"📣",levels:{level1:{story:["This is Cecil the Cicada. Cecil sings in summer.","Cecil lived underground as a baby. He drank root juice.","One summer night, Cecil crawled up an oak tree.","Cecil shed his old skin. He grew clear wings.","Now Cecil sings in the tree. He goes shane-shane!","Cecil sings a loud song to find his friends."]},level2:{story:["Meet Cecil, a loud summer singer who lives high in the green trees.","Cecil spent many years underground as a baby nymph, sucking tree root juice.","One warm summer night, he dug out of the soil and climbed up a tree trunk.","He cracked open his old brown shell and stepped out with brand new wings.","Now Cecil vibrates special drums on his tummy to make a very loud sound.","He sings all day long with his friends to enjoy the warm summer sun."]},level3:{story:["As the summer sun heats the forest, Cecil the Cicada begins his loud song from a high branch.","Cecil spent seven long years underground as a nymph, drinking sap from tree roots in the dark.","When summer arrived, Cecil dug his way out, crawled up a tree, and shed his old exoskeleton.","Leaving his empty brown shell behind, Cecil emerged with soft wings that soon dried and hardened.","Cecil is a male cicada. He vibrates organs on his abdomen called tymbals to sing a loud song.","Though he only lives for a few weeks as an adult, Cecil fills the hot summer days with music."]},level4:{story:["Echoing through the forest canopy is the rhythmic song of Cecil the Cicada, of the order Hemiptera.","Cecil underwent incomplete metamorphosis, spending years underground as a fossorial nymph.","During this subterranean phase, he fed exclusively on xylem sap extracted from plant roots.","Upon emerging, Cecil shed his final nymphal skin on a tree trunk, transitioning to an winged adult.","Cecil vibrates internal membranes called tymbals in his hollow abdomen to produce his loud call.","This acoustic signal, which can exceed one hundred decibels, is used to attract mates during summer."]}},words:[{word:"cicada",meaning:"매미",example:"We can hear cicadas in July."},{word:"loudly",meaning:"크게/시끄럽게",example:"Please do not speak loudly in the library."},{word:"shed",meaning:"벗다/떨어뜨리다",example:"Snake sheds its skin to grow."},{word:"root",meaning:"뿌리",example:"Tree roots drink water from the soil."},{word:"emerge",meaning:"나타나다/나오다",example:"The sun emerged from behind the clouds."},{word:"tymbal",meaning:"진동막(발음기관)",example:"Male cicadas vibrate their tymbals."}],quiz:[{question:"Which cicadas make the loud summer singing sound?",options:["Only males","Only females","Both males and females"],answer:0},{question:"Where do cicadas live most of their lives?",options:["On tree branches","Underground near roots","In the clouds"],answer:1}],facts:["Tymbal organ (배 밑의 진동막으로 큰 소리를 냄)","Years underground (수년에서 17년까지 땅속에서 삼)","Short adult life (성충이 되면 한 달 남짓 살다 감)"]},T={id:"firefly",nameKo:"반딧불이",nameEn:"Firefly",icon:"✨",levels:{level1:{story:["This is Flicker the Firefly. Flicker flies at night.","Flicker has a yellow lantern in his tummy.","The lantern glows in the dark. It is not hot.","Flicker blinks his light. Blink, blink!","Another firefly blinks back from the dark woods.","They meet and dance together in the summer night."]},level2:{story:["Meet Flicker, a magical firefly who lights up the dark summer forest.","Flicker has a special glowing organ in his tail that makes yellow-green light.","His light is called a 'cold light' because it does not make any heat at all.","Flicker blinks his light in a special rhythm to talk to his forest friends.","When other fireflies see his flashes, they blink back to say hello.","Together they create a beautiful light show above the grass at night."]},level3:{story:["Under the dark canopy of the summer forest, a tiny lantern named Flicker flies. He is a firefly.","Flicker produces light in his abdomen through a chemical reaction. This is called bioluminescence.","Unlike lightbulbs, Flicker's light is highly efficient and cold, meaning it wastes no energy as heat.","Flicker uses his light to communicate in the dark. He flashes a unique code to find a mate.","His bright flashes also warn frogs and spiders that he tastes bad and should not be eaten.","By filling the dark night with glowing sparks, fireflies bring magic to the summer fields."]},level4:{story:["Illuminating the nocturnal forest is Flicker the Firefly, a beetle of the family Lampyridae.","Flicker produces light via bioluminescence, a chemical process involving luciferin and oxygen.","This enzymatic reaction, assisted by the luciferase enzyme, creates a highly efficient cold light.","Flicker flashes in specific intervals to advertise availability to mates in the understory.","The light also serves as an warning signal to deter predators from consuming his toxic body.","Firefly populations are threatened by light pollution, which disrupts their complex mating signals."]}},words:[{word:"firefly",meaning:"반딧불이/개똥벌레",example:"I saw fireflies in the forest."},{word:"glow",meaning:"빛나다/불빛을 내다",example:"Stars glow in the night sky."},{word:"blink",meaning:"깜빡이다",example:"Blink your eyes twice."},{word:"bioluminescence",meaning:"생물 발광",example:"Deep sea fish use bioluminescence."},{word:"cold light",meaning:"냉광(열이 없는 빛)",example:"Firefly light is a highly efficient cold light."},{word:"chemical",meaning:"화학적인/화학물질",example:"Luciferin is a natural chemical."}],quiz:[{question:"Why is the firefly's light called 'cold light'?",options:["Because it is ice cold","Because it does not produce any heat","Because it only glows in winter"],answer:1},{question:"What is the firefly's light-making chemical called?",options:["Luciferin","Water","Sugar"],answer:0}],facts:["Bioluminescence (화학물질로 100% 가깝게 불빛 전환)","Cold light (열이 나지 않아 화상을 입지 않음)","Blink pattern (종류마다 반짝이는 횟수와 주기가 다름)"]},L={id:"stagbeetle",nameKo:"사슴벌레",nameEn:"Stag Beetle",icon:"🪵",levels:{level1:{story:["This is Spike the Stag Beetle. He has big jaws.","His jaws look like the antlers of a deer.","Spike has a shiny black body. He is strong.","Spike crawls on a rotting log to find tree sap.","A rival beetle blocks the way. Spike opens his jaws.","He lifts the rival and flips him off. The road is clear!"]},level2:{story:["Meet Spike, a stag beetle with giant pincers on his head that look like deer antlers.","Spike uses his big jaws to wrestle other beetles, not for eating food.","Spike was born inside a soft rotting log, where he ate wood as a baby grub.","Now an adult, he flies through the oak forest at night looking for sweet tree sap.","When he meets a rival beetle on a branch, they lock jaws in a wrestling match.","Spike wins by lifting his opponent and throwing him off the branch."]},level3:{story:["Beneath the bark of an old oak tree, a dark warrior named Spike prepares to fight. He is a stag beetle.","Spike is famous for his oversized mandibles, which resemble the branch-like antlers of a male deer.","Spike spent three years living inside decaying wood as a grub, slowly growing into a strong adult.","Now he climbs the trees at night, seeking sweet tree sap and defending his feeding territory.","When a rival stag beetle challenges him, they lock their massive mandibles in a test of strength.","With a powerful lift, Spike tosses the rival off the bark, retaining his spot on the sap flow."]},level4:{story:["Inhabiting ancient oak woodlands is Spike the Stag Beetle, of the family Lucanidae.","Spike exhibits extreme sexual dimorphism, with males possessing highly enlarged mandibles.","These jaws are used as weapons in combat over territories and access to sap flows.","Spike spent several years as an aquatic-like larva feeding on decomposing wood fiber.","During battles, males attempt to leverage their mandibles under the opponent to throw them off balance.","Stag beetles are saproxylic insects, essential for recycling nutrients from decaying wood back into the soil."]}},words:[{word:"stag beetle",meaning:"사슴벌레",example:"The stag beetle has shiny black shell."},{word:"jaw",meaning:"턱/집게",example:"A stag beetle has strong jaws."},{word:"antler",meaning:"사슴뿔",example:"A deer has beautiful antlers."},{word:"rival",meaning:"경쟁자",example:"The two beetles fought the rival."},{word:"grub",meaning:"굼벵이(애벌레)",example:"The grub is chewing on soft wood."},{word:"mandibles",meaning:"구강 집게(대악)",example:"Male beetles have extended mandibles."}],quiz:[{question:"What do the male stag beetle's big jaws look like?",options:["Wings of a bird","Antlers of a deer","Trunk of an elephant"],answer:1},{question:"What do stag beetle babies (grubs) eat?",options:["Rotting wood","Sweet nectar","Other insects"],answer:0}],facts:["Deer antlers (수컷의 큰 턱은 사슴의 뿔을 닮음)","Deadwood home (썩은 참나무 밑둥에 알을 낳음)","Asian favorite (한국, 일본 등에서 인기 높은 애완곤충)"]},$={id:"spider",nameKo:"거미",nameEn:"Spider",icon:"🕸️",levels:{level1:{story:["This is Spinner the Spider. He is not an insect.","Spinner has eight long legs. He has no wings.","Spinner spins a beautiful silk web on the twigs.","His web is sticky. It catches flying insects.","Look! A mosquito is caught in the sticky web.","Spinner wraps it in soft silk. Dinner is ready!"]},level2:{story:["Meet Spinner, a clever spider who is a busy engineer in the garden.","Spinner is not an insect because he has eight legs and two body segments.","Spinner spins a web using silk that comes out of spinnerets on his tail.","The silk web is very strong and sticky to trap flying insects like mosquitoes.","Spinner walks carefully on the non-sticky lines of his web to stay safe.","By catching annoying pests, Spinner helps keep the garden nice and clean."]},level3:{story:["Between two rose bushes, a clever builder named Spinner spins a masterpiece. He is an orb-weaver spider.","Spinner is an arachnid, differing from insects because he has eight legs, no antennae, and no wings.","Spinner produces liquid silk from spinnerets on his abdomen, which turns solid when exposed to air.","His spider silk is incredibly strong and flexible, capable of catching heavy insects without breaking.","Spinner sits in the center of the web, waiting to feel vibrations that signal caught prey.","By consuming flies, gnats, and mosquitoes, spiders act as natural pest controllers in the backyard."]},level4:{story:["Weaving complex webs in the garden is Spinner the Spider, belonging to the class Arachnida.","Spinner differs from insects by having two body parts (cephalothorax and abdomen) and eight walking legs.","He synthesizes liquid proteins in silk glands, extruding them through spinnerets to form solid silk.","This spider silk is renowned for its high tensile strength, exceeding that of steel by weight.","Spinner senses vibrations on the web to detect trapped prey, wrapping them in silk to preserve them.","As apex micro-predators, spiders are essential for regulating insect populations in terrestrial ecosystems."]}},words:[{word:"spider",meaning:"거미",example:"A spider is building a web in the corner."},{word:"web",meaning:"거미줄",example:"The spider caught a fly in its web."},{word:"legs",meaning:"다리",example:"All insects have six legs."},{word:"arachnid",meaning:"거미류",example:"Spiders and scorpions are arachnids."},{word:"silk",meaning:"거미실/비단",example:"Spider silk is incredibly strong."},{word:"predator",meaning:"포식자",example:"Lions and spiders are predators."}],quiz:[{question:"Why is a spider NOT an insect?",options:["Because it has eight legs and two body parts","Because it can fly","Because it is too big"],answer:0},{question:"How strong is spider silk compared to steel of the same thickness?",options:["It is weaker","It is stronger","They are exactly the same"],answer:1}],facts:["Not an insect (다리가 8개로 곤충과 다름)","Super silk (강철보다 질기고 매우 신축성 있음)","Pest control (모기, 파리 등 해충을 잡아먹는 고마운 동물)"]},q={ladybug:f,ant:b,butterfly:v,honeybee:w,beetle:k,dragonfly:S,grasshopper:x,mantis:I,cicada:z,firefly:T,stagbeetle:L,spider:$};class A{constructor(){this.insects=q,this.currentView="home",this.activeInsectId=null,this.activeLevelId="level1",this.activeTab="book",this.bookCurrentPage=0,this.quizAnswers=[],this.quizFinished=!1,this.badges={first_book:{name:"첫 탐험가 🥇",desc:"첫 번째 그림책을 완료했어요!",emoji:"🥇"},quiz_perfect:{name:"퀴즈 왕 🏆",desc:"퀴즈 만점을 기록했어요!",emoji:"🏆"},first_drawing:{name:"꼬마 예술가 🎨",desc:"첫 독후 그림을 저장했어요!",emoji:"🎨"},all_read:{name:"곤충 대장 👑",desc:"12종의 곤충책을 모두 읽었어요!",emoji:"👑"},ai_explorer:{name:"AI 탐험가 🤖",desc:"AI 박사님께 궁금한 점을 질문했어요!",emoji:"🤖"}}}async init(){try{this.bindGlobalEvents(),this.updateHeaderStats(),this.navigate("home")}catch(e){console.error("App 초기화 오류:",e),document.getElementById("app").innerHTML=`
        <div class="welcome-banner" style="background:#ffebee; border-color:#ef9a9a;">
          <h2 style="color:#c62828;">오류 발생 ⚠️</h2>
          <p>데이터 로드에 실패했습니다. Vite 개발 서버가 작동 중인지 확인해 주세요.</p>
        </div>
      `}}updateHeaderStats(){let e=0,s=0;const n=Object.keys(this.insects);n.forEach(t=>{const a=JSON.parse(localStorage.getItem(`bug_progress_${t}`)||'{"read":false,"quiz":false,"activity":false}');let i=0;a.read&&i++,a.quiz&&i++,a.activity&&i++,e+=i,i===3&&s++}),document.getElementById("header-stars-count").textContent=e,document.getElementById("header-bugs-count").textContent=`${s}/${n.length}`}bindGlobalEvents(){document.getElementById("btn-home").addEventListener("click",()=>{window.speechSynthesis.cancel(),this.navigate("home")}),document.getElementById("btn-parent-mode").addEventListener("click",()=>{this.openParentGate(()=>{window.speechSynthesis.cancel(),this.navigate("parent")})}),document.getElementById("modal-close").addEventListener("click",()=>this.closeModal()),document.getElementById("modal-overlay").addEventListener("click",e=>{e.target.id==="modal-overlay"&&this.closeModal()})}navigate(e,s={}){switch(this.currentView=e,s.insectId&&(this.activeInsectId=s.insectId),s.levelId&&(this.activeLevelId=s.levelId),s.tab&&(this.activeTab=s.tab),this.updateHeaderStats(),e){case"home":this.renderHome();break;case"level":this.renderLevelSelect();break;case"learn":this.renderLearnPanel();break;case"parent":this.renderParentDashboard();break}}renderHome(){const e=document.getElementById("app");let n=Object.keys(this.insects).map(i=>{const o=this.insects[i],r=JSON.parse(localStorage.getItem(`bug_progress_${i}`)||'{"read":false,"quiz":false,"activity":false}');let l=0;r.read&&l++,r.quiz&&l++,r.activity&&l++;const c=Array(3).fill(0).map((d,h)=>`
        <span style="color: ${h<l?"var(--accent)":"#ccc"}">★</span>
      `).join("");return`
        <div class="insect-card" data-id="${i}">
          <div class="card-emoji">${o.icon}</div>
          <h3>${o.nameEn}</h3>
          <p>${o.nameKo}</p>
          <div class="card-stars">${c}</div>
          <div class="card-status ${l>0?"unlocked":""}">
            ${l===3?"🎉 완료!":l>0?"👍 학습 중":"🌱 시작하기"}
          </div>
        </div>
      `}).join("");const t=JSON.parse(localStorage.getItem("bug_unlocked_badges")||"[]");let a=Object.keys(this.badges).map(i=>{const o=this.badges[i],r=t.includes(i);return`
        <div class="badge-item ${r?"unlocked":""}" title="${o.desc}">
          <div class="badge-icon">${r?o.emoji:"🔒"}</div>
          <span class="badge-name">${o.name.split(" ")[0]}</span>
        </div>
      `}).join("");e.innerHTML=`
      <div class="home-container">
        <div class="welcome-banner">
          <h1>🌿 곤충 영어 리딩 나라에 온 것을 환영해요!</h1>
          <p>공부하고 싶은 곤충을 선택해 재미있는 영어 동화책을 읽고 도감을 모아보세요!</p>
        </div>
        
        <div class="insect-grid">
          ${n}
        </div>

        <!-- 뱃지 진열장 섹션 추가 -->
        <div class="badge-cabinet" style="margin-top: 32px;">
          <h3>🏅 나의 곤충 배지 진열장</h3>
          <div class="badges-grid">
            ${a}
          </div>
        </div>
      </div>
    `,e.querySelectorAll(".insect-card").forEach(i=>{i.addEventListener("click",()=>{const o=i.dataset.id;this.navigate("level",{insectId:o})})})}renderLevelSelect(){const e=document.getElementById("app"),s=this.insects[this.activeInsectId];e.innerHTML=`
      <div class="level-select-container">
        <div class="level-title">
          <h2>${s.icon} ${s.nameEn} (${s.nameKo}) 책의 난이도 선택</h2>
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
    `,e.querySelectorAll(".level-card").forEach(n=>{n.addEventListener("click",()=>{const t=n.dataset.level;this.bookCurrentPage=0,this.navigate("learn",{levelId:t,tab:"book"})})}),document.getElementById("btn-back-to-home").addEventListener("click",()=>{this.navigate("home")})}renderLearnPanel(){const e=document.getElementById("app"),s=this.insects[this.activeInsectId],n={level1:"Level 1",level2:"Level 2",level3:"Level 3",level4:"Level 4"};e.innerHTML=`
      <div class="learning-wrapper">
        <!-- 곤충 정보 바 -->
        <div class="bug-header-bar">
          <div class="bug-title-info">
            <span style="font-size:2.2rem;">${s.icon}</span>
            <div>
              <h2>${s.nameEn} (${s.nameKo})</h2>
              <span class="level-tag">${n[this.activeLevelId]}</span>
            </div>
          </div>
          <button id="btn-change-level" class="btn btn-secondary">⚙️ 레벨 변경하기</button>
        </div>

        <!-- 탭 헤더 -->
        <nav class="learning-tabs">
          <button class="tab-btn ${this.activeTab==="book"?"active":""}" data-tab="book">📖 그림책 읽기</button>
          <button class="tab-btn ${this.activeTab==="words"?"active":""}" data-tab="words">🔤 단어 배우기</button>
          <button class="tab-btn ${this.activeTab==="quiz"?"active":""}" data-tab="quiz">🧠 정답 퀴즈</button>
          <button class="tab-btn ${this.activeTab==="activity"?"active":""}" data-tab="activity">🎨 독후 활동</button>
          <button class="tab-btn ${this.activeTab==="ai"?"active":""}" data-tab="ai">🤖 AI 곤충 대화</button>
        </nav>

        <!-- 동적 탭 본문 영역 -->
        <div class="tab-panel">
          <div class="panel-content ${this.activeTab==="book"?"active":""}" id="panel-book"></div>
          <div class="panel-content ${this.activeTab==="words"?"active":""}" id="panel-words"></div>
          <div class="panel-content ${this.activeTab==="quiz"?"active":""}" id="panel-quiz"></div>
          <div class="panel-content ${this.activeTab==="activity"?"active":""}" id="panel-activity"></div>
          <div class="panel-content ${this.activeTab==="ai"?"active":""}" id="panel-ai"></div>
        </div>
      </div>
    `,document.getElementById("btn-change-level").addEventListener("click",()=>{window.speechSynthesis.cancel(),this.navigate("level")}),e.querySelectorAll(".tab-btn").forEach(t=>{t.addEventListener("click",()=>{window.speechSynthesis.cancel();const a=t.dataset.tab;this.navigate("learn",{tab:a})})}),this.renderBookTab(),this.renderWordsTab(),this.renderQuizTab(),this.renderActivityTab(),this.renderAiTab()}renderBookTab(){const e=document.getElementById("panel-book");if(!e)return;const n=this.insects[this.activeInsectId].levels[this.activeLevelId].story;this.bookCurrentPage%2!==0&&(this.bookCurrentPage=Math.max(0,this.bookCurrentPage-1));const t=n[this.bookCurrentPage],a=n[this.bookCurrentPage+1]||"",i=t.split(" "),o=i.map((d,h)=>`
      <span class="story-word left-word" data-index="${h}">${d}</span>
    `).join(" "),r=a?a.split(" "):[],l=r.map((d,h)=>`
      <span class="story-word right-word" data-index="${h}">${d}</span>
    `).join(" ");e.innerHTML=`
      <div class="book-container">
        <!-- 양면 책 스프레드 -->
        <div class="book-spread" id="book-spread">
          <!-- 입체적인 가운데 책등 -->
          <div class="book-spine"></div>

          <!-- 왼쪽 면 (Page N) -->
          <div class="book-page-half left-half">
            <p class="story-text">
              ${o}
            </p>
            <div class="audio-controls">
              <button id="btn-play-left" class="btn-audio" title="왼쪽 책장 읽기">🔊</button>
              <span style="font-size:0.8rem; color:var(--text-light); font-weight:600;">왼쪽 듣기</span>
            </div>
            <span class="page-corner-number">${this.bookCurrentPage+1}</span>
          </div>

          <!-- 오른쪽 면 (Page N+1) -->
          <div class="book-page-half right-half">
            <p class="story-text">
              ${l||"끝"}
            </p>
            ${a?`
              <div class="audio-controls">
                <button id="btn-play-right" class="btn-audio" title="오른쪽 책장 읽기">🔊</button>
                <span style="font-size:0.8rem; color:var(--text-light); font-weight:600;">오른쪽 듣기</span>
              </div>
            `:""}
            <span class="page-corner-number">${this.bookCurrentPage+2}</span>
          </div>
        </div>

        <!-- 하단 네비게이션 및 진척도 -->
        <div class="page-navigation">
          <button id="btn-prev-page" class="btn btn-secondary" ${this.bookCurrentPage===0?"disabled":""}>⬅️ 이전 책장</button>
          <span class="page-indicator">${this.bookCurrentPage+1}-${this.bookCurrentPage+2} / ${n.length}</span>
          <button id="btn-next-page" class="btn btn-primary">
            ${this.bookCurrentPage+2>=n.length?"🎉 다 읽었어요!":"다음 책장 ➡️"}
          </button>
        </div>
      </div>
    `,e.querySelector("#btn-play-left").addEventListener("click",()=>{this.playStoryAudio(t,i,"left")});const c=e.querySelector("#btn-play-right");c&&c.addEventListener("click",()=>{this.playStoryAudio(a,r,"right")}),e.querySelector("#btn-prev-page").addEventListener("click",()=>{window.speechSynthesis.cancel(),e.querySelector("#book-spread").classList.add("turning"),setTimeout(()=>{this.bookCurrentPage=Math.max(0,this.bookCurrentPage-2),this.renderBookTab()},250)}),e.querySelector("#btn-next-page").addEventListener("click",()=>{if(window.speechSynthesis.cancel(),this.bookCurrentPage+2<n.length)e.querySelector("#book-spread").classList.add("turning"),setTimeout(()=>{this.bookCurrentPage+=2,this.renderBookTab()},250);else{const d=`bug_progress_${this.activeInsectId}`,h=JSON.parse(localStorage.getItem(d)||'{"read":false,"quiz":false,"activity":false}'),u=!h.read;h.read=!0,localStorage.setItem(d,JSON.stringify(h)),alert("축하합니다! 이 책을 다 읽었습니다. 별 1개를 획득했어요! ⭐"),this.updateHeaderStats(),u&&this.checkAndAwardBadges(),this.navigate("learn",{tab:"words"})}})}playStoryAudio(e,s,n){if(!("speechSynthesis"in window)){alert("이 브라우저는 오디오 음성 출력을 지원하지 않습니다.");return}window.speechSynthesis.cancel();const t=new SpeechSynthesisUtterance(e);t.lang="en-US",t.rate=.8,t.onboundary=a=>{if(a.name==="word"){let i=0,o=-1;for(let c=0;c<s.length;c++){if(i>=a.charIndex){o=c-1;break}i+=s[c].length+1}o===-1&&i>a.charIndex&&(o=s.length-1),document.querySelectorAll(`.story-word.${n}-word`).forEach(c=>c.classList.remove("active-word"));const l=document.querySelector(`.story-word.${n}-word[data-index="${o}"]`);l&&l.classList.add("active-word")}},t.onend=()=>{document.querySelectorAll(`.story-word.${n}-word`).forEach(i=>i.classList.remove("active-word"))},window.speechSynthesis.speak(t)}renderWordsTab(){const e=document.getElementById("panel-words");if(!e)return;const s=this.insects[this.activeInsectId],n=JSON.parse(localStorage.getItem(`bug_words_${this.activeInsectId}`)||"[]");e.innerHTML=`
      <div class="vocabulary-container">
        <h3>🔤 단어 카드 뒤집기</h3>
        <p>단어 카드를 클릭하여 뜻을 확인하고 스피커 단추로 영어 발음을 들어보세요.</p>
        
        <div class="cards-grid">
          ${s.words.map((t,a)=>(n.includes(t.word),`
              <div class="word-card-container" data-word="${t.word}">
                <div class="word-card">
                  <!-- 앞면 (영어) -->
                  <div class="card-front">
                    <span class="word-en">${t.word}</span>
                    <button class="sound-btn btn-speak-word" data-word="${t.word}">🔊</button>
                    <span class="card-prompt">카드를 클릭해 보세요!</span>
                  </div>
                  <!-- 뒷면 (한국어 뜻 & 예문) -->
                  <div class="card-back">
                    <span class="word-ko">${t.meaning}</span>
                    <p class="word-example">"${t.example}"</p>
                    <button class="btn btn-secondary btn-speak-example" data-example="${t.example}" style="padding:6px 12px; font-size:0.85rem;">
                      🔊 예문 듣기
                    </button>
                  </div>
                </div>
              </div>
            `)).join("")}
        </div>
      </div>
    `,e.querySelectorAll(".word-card-container").forEach(t=>{t.addEventListener("click",a=>{if(a.target.closest(".sound-btn")||a.target.closest(".btn-speak-example"))return;t.classList.toggle("flipped");const i=t.dataset.word,o=JSON.parse(localStorage.getItem(`bug_words_${this.activeInsectId}`)||"[]");o.includes(i)||(o.push(i),localStorage.setItem(`bug_words_${this.activeInsectId}`,JSON.stringify(o)),this.updateHeaderStats())})}),e.querySelectorAll(".btn-speak-word").forEach(t=>{t.addEventListener("click",()=>{const a=t.dataset.word;this.speakText(a,"en-US")})}),e.querySelectorAll(".btn-speak-example").forEach(t=>{t.addEventListener("click",()=>{const a=t.dataset.example;this.speakText(a,"en-US")})})}speakText(e,s){if("speechSynthesis"in window){window.speechSynthesis.cancel();const n=new SpeechSynthesisUtterance(e);n.lang=s,n.rate=.85,window.speechSynthesis.speak(n)}}renderQuizTab(){const e=document.getElementById("panel-quiz");if(!e)return;const s=this.insects[this.activeInsectId];this.quizAnswers=[],this.quizFinished=!1,this.renderQuizQuestion(0,s.quiz,e)}renderQuizQuestion(e,s,n){if(e>=s.length){this.finishQuiz(s,n);return}const t=s[e],a=Math.round(e/s.length*100);n.innerHTML=`
      <div class="quiz-container">
        <div class="quiz-progress">
          <span>문제 ${e+1} / ${s.length}</span>
          <div class="quiz-progress-bar-bg">
            <div class="quiz-progress-bar-fill" style="width: ${a}%;"></div>
          </div>
          <span>진행율</span>
        </div>

        <div class="quiz-card">
          <div class="quiz-question">${e+1}. ${t.question}</div>
          <div class="quiz-options">
            ${t.options.map((o,r)=>`
              <button class="quiz-option-btn" data-answer-index="${r}">
                <span>${o}</span>
                <span class="feedback-icon"></span>
              </button>
            `).join("")}
          </div>
        </div>
      </div>
    `;const i=n.querySelectorAll(".quiz-option-btn");i.forEach(o=>{o.addEventListener("click",()=>{const r=parseInt(o.dataset.answerIndex),l=t.answer;i.forEach(c=>c.disabled=!0),r===l?(o.classList.add("correct"),o.querySelector(".feedback-icon").innerHTML="🔴 정답!",this.speakText("Great job!","en-US"),this.quizAnswers.push(!0)):(o.classList.add("incorrect"),o.querySelector(".feedback-icon").innerHTML="❌ 오답",i[l].classList.add("correct"),i[l].querySelector(".feedback-icon").innerHTML="🔴 정답",this.speakText("Oops!","en-US"),this.quizAnswers.push(!1)),setTimeout(()=>{this.renderQuizQuestion(e+1,s,n)},1500)})})}finishQuiz(e,s){const n=this.quizAnswers.filter(r=>r).length,t=e.length,a=Math.round(n/t*100);localStorage.setItem(`bug_quiz_score_${this.activeInsectId}`,a);const i=`bug_progress_${this.activeInsectId}`,o=JSON.parse(localStorage.getItem(i)||'{"read":false,"quiz":false,"activity":false}');o.quiz,o.quiz=!0,localStorage.setItem(i,JSON.stringify(o)),alert(`퀴즈 완료! ${n}/${t} 문제를 맞혔습니다. 별 1개를 추가로 획득했어요! ⭐`),this.updateHeaderStats(),a===100?this.checkAndAwardBadges("quiz_perfect"):this.checkAndAwardBadges(),s.innerHTML=`
      <div class="quiz-container" style="text-align:center;">
        <div class="welcome-banner" style="background:#eaf6ec; border-color:#a5d6a7;">
          <span style="font-size:4rem;">🏆</span>
          <h2 style="color:var(--primary-dark); margin-top:16px;">퀴즈 결과 발표!</h2>
          <p style="font-size:1.8rem; font-weight:700; color:var(--primary); margin:16px 0;">
            ${a}점 (${n} / ${t} 정답)
          </p>
          <p style="color:var(--text-light);">
            ${a===100?"와우! 완벽해요! 모든 정답을 맞혀 만점 배지 대상이에요! 💯":"훌륭해요! 조금만 더 복습하면 백점을 노릴 수 있어요! 👍"}
          </p>
        </div>
        <div style="display:flex; gap:16px; justify-content:center;">
          <button id="btn-restart-quiz" class="btn btn-secondary"> 다시 도전하기</button>
          <button id="btn-go-to-activity" class="btn btn-primary">🎨 다음 단계: 독후 활동하기</button>
        </div>
      </div>
    `,s.querySelector("#btn-restart-quiz").addEventListener("click",()=>{this.renderQuizTab()}),s.querySelector("#btn-go-to-activity").addEventListener("click",()=>{this.navigate("learn",{tab:"activity"})})}renderActivityTab(){if(!document.getElementById("panel-activity"))return;new p("panel-activity",this.activeInsectId,this.activeLevelId,()=>{this.updateHeaderStats(),this.checkAndAwardBadges("first_drawing"),this.navigate("learn",{tab:"ai"})}).render()}renderAiTab(){if(!document.getElementById("panel-ai"))return;const s=this.insects[this.activeInsectId];new m("panel-ai",this.activeInsectId,s).render()}renderParentDashboard(){document.getElementById("app"),new y("app",()=>{this.navigate("home")}).render()}openParentGate(e){const s=Math.floor(Math.random()*5)+5,n=Math.floor(Math.random()*8)+2,t=s*n,a=document.getElementById("modal-overlay"),i=document.getElementById("modal-title"),o=document.getElementById("modal-body");i.textContent="🔒 학부모 확인 (Parent Gate)",o.innerHTML=`
      <div class="parent-gate-form">
        <p style="font-size:0.95rem; line-height:1.4; color:var(--text-light);">
          이 화면은 학부모 관리 페이지입니다. 어린이가 잘못 누르지 않도록 아래 수학 정답을 입력해 주세요.
        </p>
        <div class="math-question">${s} &times; ${n} = ?</div>
        <div class="form-group">
          <input type="number" id="gate-answer" class="form-control" placeholder="정답을 입력하세요" autofocus />
        </div>
        <button id="btn-gate-submit" class="btn btn-primary" style="justify-content:center; width:100%; padding:12px;">확인</button>
        <p id="gate-error" style="color:#d32f2f; font-size:0.85rem; font-weight:600; text-align:center; display:none;">
          ❌ 오답입니다! 다시 한번 확인해 주세요.
        </p>
      </div>
    `,a.classList.remove("hidden");const r=()=>{if(parseInt(document.getElementById("gate-answer").value)===t)this.closeModal(),e();else{const c=document.getElementById("gate-error");c.style.display="block",document.getElementById("gate-answer").value="",document.getElementById("gate-answer").focus()}};document.getElementById("btn-gate-submit").addEventListener("click",r),document.getElementById("gate-answer").addEventListener("keypress",l=>{l.key==="Enter"&&r()})}closeModal(){document.getElementById("modal-overlay").classList.add("hidden")}checkAndAwardBadges(e=null){const s=JSON.parse(localStorage.getItem("bug_unlocked_badges")||"[]");let n=[];e&&!s.includes(e)&&(s.push(e),n.push(e));let t=0;const a=Object.keys(this.insects);a.forEach(o=>{JSON.parse(localStorage.getItem(`bug_progress_${o}`)||'{"read":false,"quiz":false,"activity":false}').read&&t++}),t>=1&&!s.includes("first_book")&&(s.push("first_book"),n.push("first_book")),t===a.length&&!s.includes("all_read")&&(s.push("all_read"),n.push("all_read")),JSON.parse(localStorage.getItem("bug_activities_list")||"[]").length>=1&&!s.includes("first_drawing")&&(s.push("first_drawing"),n.push("first_drawing")),localStorage.setItem("bug_unlocked_badges",JSON.stringify(s)),n.length>0&&n.forEach(o=>{this.triggerBadgeAwardModal(o)})}triggerBadgeAwardModal(e){const s=this.badges[e];if(!s)return;const n=document.getElementById("modal-overlay"),t=document.getElementById("modal-title"),a=document.getElementById("modal-body");t.textContent="🏅 새로운 배지 획득!",a.innerHTML=`
      <div class="badge-award-modal">
        <div class="badge-glow-icon">${s.emoji}</div>
        <h2>"${s.name}" unlocked!</h2>
        <p style="font-size:1.1rem; line-height:1.5; color:var(--text-dark); margin:8px 0;">
          축하합니다! ${s.desc}
        </p>
        <button id="btn-close-badge-award" class="btn btn-primary" style="padding:10px 24px; font-size:1rem; margin-top:16px;">
          신나게 계속하기! 🌟
        </button>
      </div>
    `,n.classList.remove("hidden"),document.getElementById("btn-close-badge-award").addEventListener("click",()=>{this.closeModal()})}}const B=new A;window.addEventListener("DOMContentLoaded",()=>{B.init()});
