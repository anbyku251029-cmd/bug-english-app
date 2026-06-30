import os
import sys
import json
import base64
import random
import datetime
from io import BytesIO

# 1. 필수 라이브러리 임포트 검사 및 안내
try:
    import streamlit as st
    from gtts import gTTS
    from streamlit_drawable_canvas import st_canvas
    from PIL import Image
    import google.generativeai as genai
except ImportError as e:
    import streamlit as st
    st.error(f"⚠️ 필수 패키지가 설치되지 않았습니다! (에러: {e})")
    st.markdown("""
    ### 🛠️ 해결 방법 (How to Fix)
    터미널에서 아래 명령어를 실행하여 필수 패키지를 설치해 주세요.
    
    ```bash
    pip install -r requirements.txt
    ```
    설치가 완료되면 이 페이지를 새로고침(F5) 하거나 스트림릿 서버를 재시작해 주세요.
    """)
    st.stop()

# 2. 스트림릿 기본 페이지 설정
st.set_page_config(
    page_title="Bug Read & Play - 곤충 영어 나라 V1.1",
    page_icon="🌿",
    layout="wide"
)

# 3. 글로벌 디자인 커스텀 CSS
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap');
    
    html, body, [data-testid="stAppViewContainer"] {
        font-family: 'Fredoka', 'Noto Sans KR', sans-serif;
        background: linear-gradient(135deg, #f4f9f4 0%, #e8f5e9 50%, #c8e6c9 100%);
        color: #1b2e1e;
    }
    
    /* 곤충 카드 디자인 */
    .insect-card {
        background: rgba(255, 255, 255, 0.85);
        border: 2px solid rgba(46, 125, 50, 0.15);
        border-radius: 24px;
        padding: 24px;
        text-align: center;
        box-shadow: 0 8px 16px rgba(46, 125, 50, 0.04);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    
    .insect-card:hover {
        transform: scale(1.05) translateY(-5px);
        box-shadow: 0 16px 32px rgba(46, 125, 50, 0.1);
        border-color: rgba(46, 125, 50, 0.35);
    }
    
    /* 책 스프레드 페이지 디자인 */
    .book-page-style-left {
        background: #ffffff;
        border-radius: 20px 0 0 20px;
        padding: 36px 28px;
        box-shadow: inset -10px 0 20px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04);
        border-right: 2px solid #efefef;
        min-height: 290px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    
    .book-page-style-right {
        background: #ffffff;
        border-radius: 0 20px 20px 0;
        padding: 36px 28px;
        box-shadow: inset 10px 0 20px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.04);
        border-left: 2px solid #efefef;
        min-height: 290px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    
    /* 뱃지 캐비닛 */
    .badge-cabinet {
        background: rgba(255, 255, 255, 0.75);
        border: 1px solid rgba(255, 255, 255, 0.5);
        border-radius: 24px;
        padding: 24px;
        box-shadow: 0 8px 32px 0 rgba(46, 125, 50, 0.06);
        margin-top: 32px;
    }
    
    /* Streamlit 기본 버튼 커스텀 (곤충 마이크로 애니메이션) */
    div.stButton > button {
        border-radius: 24px !important;
        font-weight: 600 !important;
        font-family: 'Fredoka', 'Noto Sans KR', sans-serif !important;
        border: 2px solid rgba(46, 125, 50, 0.2) !important;
        background-color: white !important;
        color: #2e7d32 !important;
        padding: 6px 16px !important;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        box-shadow: 0 4px 6px rgba(46, 125, 50, 0.05) !important;
    }
    
    div.stButton > button:hover {
        transform: scale(1.08) translateY(-3px) !important;
        box-shadow: 0 8px 16px rgba(46, 125, 50, 0.15) !important;
        border-color: #2e7d32 !important;
        background-color: #e8f5e9 !important;
        color: #1b5e20 !important;
    }
    
    /* primary 버튼 커스텀 */
    div.stButton > button[kind="primary"] {
        background-color: #2e7d32 !important;
        color: white !important;
        border: 2px solid #2e7d32 !important;
    }
    
    div.stButton > button[kind="primary"]:hover {
        background-color: #1b5e20 !important;
        border-color: #1b5e20 !important;
        color: white !important;
    }
    
    /* 탭 디자인 커스텀 (Streamlit 기본 탭 선택기 숨기기 혹은 커스텀용) */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
    }
</style>
""", unsafe_allow_html=True)

# 4. 데이터 로드 및 저장 함수
@st.cache_data
def load_insects_data():
    try:
        with open("data/insects.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        st.error("data/insects.json 파일을 찾을 수 없습니다. 경로를 확인해 주세요.")
        st.stop()

insects_data = load_insects_data()

def load_user_progress():
    path = "data/user_progress.json"
    default_progress = {
        "stars": {},
        "progress": {},       # insect_id -> {read: bool, quiz: bool, activity: bool}
        "learned_words": {},  # insect_id -> list of words
        "quiz_scores": {},    # insect_id -> score (int)
        "unlocked_badges": [],
        "saved_activities": [], # list of dict {insectId, levelId, drawing, text, date}
        "gemini_api_key": ""
    }
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                loaded = json.load(f)
                # 데이터 정합성 보장 (누락 키 자동 복구)
                for key, val in default_progress.items():
                    if key not in loaded:
                        loaded[key] = val
                return loaded
        except Exception:
            # 파일이 손상되었을 경우 백업 생성 후 리셋
            try:
                os.rename(path, path + ".corrupted_bak")
            except Exception:
                pass
    return default_progress

def save_user_progress(data):
    os.makedirs("data", exist_ok=True)
    with open("data/user_progress.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# 5. 세션 상태 초기화
if "user_data" not in st.session_state:
    st.session_state.user_data = load_user_progress()
if "current_view" not in st.session_state:
    st.session_state.current_view = "home"
if "selected_insect" not in st.session_state:
    st.session_state.selected_insect = None
if "selected_level" not in st.session_state:
    st.session_state.selected_level = "level1"
if "active_tab" not in st.session_state:
    st.session_state.active_tab = "🐞 그림책 읽기"
if "story_page" not in st.session_state:
    st.session_state.story_page = 0
if "chat_history" not in st.session_state:
    st.session_state.chat_history = {} # insectId -> message list

user_data = st.session_state.user_data

# 6. gTTS 오디오 생성 및 캐싱 (성능 최적화)
@st.cache_data
def generate_tts_audio(text, lang="en"):
    if not text:
        return None
    try:
        tts = gTTS(text=text, lang=lang)
        fp = BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        return fp.read()
    except Exception as e:
        print(f"TTS 생성 실패: {e}")
        return None

# 7. 배지 시스템
badges_info = {
    "first_book": {"name": "첫 탐험가 🥇", "desc": "첫 번째 그림책을 완료했어요!", "emoji": "🥇"},
    "quiz_perfect": {"name": "퀴즈 왕 🏆", "desc": "퀴즈 만점을 기록했어요!", "emoji": "🏆"},
    "first_drawing": {"name": "꼬마 예술가 🎨", "desc": "첫 독후 그림을 저장했어요!", "emoji": "🎨"},
    "all_read": {"name": "곤충 대장 👑", "desc": "12종의 곤충책을 모두 읽었어요!", "emoji": "👑"},
    "ai_explorer": {"name": "AI 탐험가 🤖", "desc": "AI 박사님께 질문을 했어요!", "emoji": "🤖"}
}

def check_and_award_badges(forced_badge=None):
    unlocked = user_data.get("unlocked_badges", [])
    newly_unlocked = []

    if forced_badge and forced_badge not in unlocked:
        unlocked.append(forced_badge)
        newly_unlocked.append(forced_badge)

    # 완독 개수 집계
    read_count = sum(1 for p in user_data["progress"].values() if p.get("read", False))
    if read_count >= 1 and "first_book" not in unlocked:
        unlocked.append("first_book")
        newly_unlocked.append("first_book")
    if read_count == len(insects_data) and "all_read" not in unlocked:
        unlocked.append("all_read")
        newly_unlocked.append("all_read")

    # 독후 활동 개수
    activities = user_data.get("saved_activities", [])
    if len(activities) >= 1 and "first_drawing" not in unlocked:
        unlocked.append("first_drawing")
        newly_unlocked.append("first_drawing")

    user_data["unlocked_badges"] = unlocked
    save_user_progress(user_data)

    if newly_unlocked:
        for b in newly_unlocked:
            st.session_state.newly_unlocked_badge = b
            st.toast(f"🏅 새로운 배지 획득: {badges_info[b]['name']}!", icon="🎉")
        st.balloons()

# 8. 공통 헤더 렌더러
def render_header():
    total_stars = 0
    completed_bugs = 0
    
    for id_ in insects_data.keys():
        prog = user_data["progress"].get(id_, {"read": False, "quiz": False, "activity": False})
        stars = sum(1 for k, v in prog.items() if v)
        total_stars += stars
        if stars == 3:
            completed_bugs += 1

    h_col1, h_col2, h_col3 = st.columns([4, 3, 2.5])
    with h_col1:
        st.markdown(
            f"<h2 style='margin:0; font-family:var(--font-fun); cursor:pointer;' onclick='window.location.reload()'>🌿 Bug Read & Play <span style='font-size:0.9rem; background:#2e7d32; color:white; padding:2px 8px; border-radius:12px; vertical-align:middle; font-weight:bold; margin-left:6px;'>V1.1</span></h2>", 
            unsafe_allow_html=True
        )
    with h_col2:
        st.markdown(
            f"<div style='font-size:1.15rem; font-weight:bold; margin-top:8px;'>⭐ {total_stars} 개 | 🐞 {completed_bugs}/{len(insects_data)} 도감 완료</div>",
            unsafe_allow_html=True
        )
    with h_col3:
        btn_col1, btn_col2 = st.columns(2)
        with btn_col1:
            is_home_active = st.session_state.current_view != "home"
            if st.button("🐞 홈", use_container_width=True, disabled=not is_home_active, key="header_home_btn"):
                st.session_state.current_view = "home"
                st.session_state.selected_insect = None
                st.session_state.story_page = 0
                st.rerun()
        with btn_col2:
            if st.session_state.current_view in ["parent", "parent_gate"]:
                if st.button("🐜 자녀 홈", use_container_width=True, key="header_child_home_btn"):
                    st.session_state.current_view = "home"
                    st.session_state.selected_insect = None
                    st.session_state.story_page = 0
                    st.rerun()
            else:
                if st.button("🐝 부모방", use_container_width=True, key="header_parent_btn"):
                    st.session_state.current_view = "parent_gate"
                    st.rerun()
    st.markdown("---")

# 9. 메인 홈 뷰 (곤충 카드 및 배지 진열장)
def render_home_view():
    st.markdown("<div style='text-align:center; margin-bottom: 24px;'><h1>🐞 곤충 영어 리딩 나라 V1.1</h1><p>더 깜찍해진 곤충 친구들과 함께 즐거운 영어 리딩과 독후 활동을 시작해 보세요.</p></div>", unsafe_allow_html=True)
    
    # 곤충 카드 그리드 (3열 배치)
    cols = st.columns(3)
    for idx, (key, bug) in enumerate(insects_data.items()):
        col = cols[idx % 3]
        prog = user_data["progress"].get(key, {"read": False, "quiz": False, "activity": False})
        stars = sum(1 for k, v in prog.items() if v)
        star_str = "⭐" * stars + "☆" * (3 - stars)
        
        with col:
            st.markdown(f"""
            <div class="insect-card">
                <div style="font-size: 3.5rem; margin-bottom: 8px;">{bug['icon']}</div>
                <h3 style="margin: 0; color: var(--primary-dark);">{bug['nameEn']}</h3>
                <p style="margin: 4px 0 10px 0; color: var(--text-light); font-weight:600;">{bug['nameKo']}</p>
                <div style="color: var(--accent); font-size: 1.3rem; margin-bottom: 12px;">{star_str}</div>
            </div>
            """, unsafe_allow_html=True)
            
            # 학습 상태에 따른 곤충 아이콘화된 이동 버튼 설계
            if stars == 3:
                btn_label = f"{bug['icon']} {bug['nameEn']} 완료! 🎉"
            elif stars > 0:
                btn_label = f"{bug['icon']} {bug['nameEn']} 탐험 중! 👍"
            else:
                btn_label = f"{bug['icon']} {bug['nameEn']} 시작! 🚀"
                
            if st.button(btn_label, key=f"sel_bug_{key}", use_container_width=True):
                st.session_state.selected_insect = key
                st.session_state.current_view = "level"
                st.rerun()
            st.markdown("<div style='margin-bottom:24px;'></div>", unsafe_allow_html=True)

    # 배지 진열장
    st.markdown("---")
    st.markdown("### 🏅 나의 곤충 배지 진열장")
    badge_cols = st.columns(5)
    unlocked = user_data.get("unlocked_badges", [])
    
    for idx, (b_key, b_info) in enumerate(badges_info.items()):
        b_col = badge_cols[idx]
        is_unlocked = b_key in unlocked
        with b_col:
            if is_unlocked:
                st.markdown(f"""
                <div style="text-align: center; background: #fffde7; padding: 16px; border-radius: 16px; border: 2px solid #ffb300; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
                    <div style="font-size: 2.2rem; margin-bottom: 4px;">{b_info['emoji']}</div>
                    <div style="font-size: 0.9rem; font-weight: bold; color: #1b2e1e;">{b_info['name'].split(' ')[0]}</div>
                    <div style="font-size: 0.75rem; color: #556b2f;">{b_info['desc']}</div>
                </div>
                """, unsafe_allow_html=True)
            else:
                st.markdown(f"""
                <div style="text-align: center; background: rgba(0,0,0,0.03); padding: 16px; border-radius: 16px; border: 2px dashed #ccc; opacity: 0.45;">
                    <div style="font-size: 2.2rem; margin-bottom: 4px;">🔒</div>
                    <div style="font-size: 0.9rem; font-weight: bold; color: #888;">잠김</div>
                    <div style="font-size: 0.75rem; color: #999;">{b_info['desc']}</div>
                </div>
                """, unsafe_allow_html=True)

# 10. 난이도 레벨 선택 뷰
def render_level_view():
    bug = insects_data[st.session_state.selected_insect]
    st.markdown(f"<div style='text-align:center;'><h2>{bug['icon']} {bug['nameEn']} ({bug['nameKo']}) 책의 난이도 선택</h2><p>나에게 가장 잘 맞는 난이도를 골라보세요!</p></div>", unsafe_allow_html=True)
    
    levels = [
        ("Level 1", "유치원 과정", "쉬운 기초 단어", "This is an ant. 처럼 아주 쉽고 간결한 문장 구조를 읽어요."),
        ("Level 2", "초등 1~2학년", "짧은 생태 묘사 문장", "The ant carries food. 처럼 곤충의 행동을 설명하는 문장을 배워요."),
        ("Level 3", "초등 3~4학년", "이야기 및 생태 설명", "Ants live together in colonies. 처럼 풍부한 줄거리 지식을 읽어요."),
        ("Level 4", "초등 5~6학년", "자연과학 탐구 읽기", "Ants communicate using chemicals. 처럼 깊이 있는 정보 텍스트를 탐색해요.")
    ]

    l_cols = st.columns(4)
    for idx, (lv, target, title, desc) in enumerate(levels):
        with l_cols[idx]:
            st.markdown(f"""
            <div style="background: white; border-radius: 16px; padding: 20px; border: 2px solid rgba(46,125,50,0.1); text-align: center; min-height: 240px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                    <h2 style="margin: 0 0 6px 0; color: var(--primary);">{lv}</h2>
                    <span style="background: var(--primary-light); color: var(--primary-dark); padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">{target}</span>
                    <h5 style="margin: 16px 0 8px 0; color: #1b2e1e;">{title}</h5>
                    <p style="font-size: 0.85rem; color: var(--text-light); line-height: 1.4; margin: 0;">{desc}</p>
                </div>
            </div>
            """, unsafe_allow_html=True)
            # 난이도별 곤충 성장단계에 맞춘 아이콘화 (애벌레 -> 일개미 -> 일벌 -> 나비)
            lv_icons = ["🐛", "🐜", "🐝", "🦋"]
            btn_lbl = f"{lv_icons[idx]} {lv} 출발!"
            
            st.markdown("<div style='margin-bottom:12px;'></div>", unsafe_allow_html=True)
            if st.button(btn_lbl, key=f"sel_lv_{idx}", use_container_width=True, type="primary" if idx == 0 else "secondary"):
                st.session_state.selected_level = f"level{idx+1}"
                st.session_state.story_page = 0
                st.session_state.active_tab = "🐞 그림책 읽기"
                st.session_state.current_view = "learn"
                st.rerun()

    st.markdown("<br>", unsafe_allow_html=True)
    if st.button("🐜 곤충도감 목록으로 돌아가기", use_container_width=True):
        st.session_state.current_view = "home"
        st.rerun()

# 11. 학습 센터 메인 뷰 (5개 탭 바)
def render_learn_view():
    bug = insects_data[st.session_state.selected_insect]
    level_lbl = {"level1":"Level 1","level2":"Level 2","level3":"Level 3","level4":"Level 4"}[st.session_state.selected_level]
    
    # 상단 곤충 요약 바
    s_col1, s_col2 = st.columns([4, 1.2])
    with s_col1:
        st.markdown(f"### {bug['icon']} {bug['nameEn']} ({bug['nameKo']}) <span style='font-size:1rem; background:var(--accent); color:black; padding:2px 10px; border-radius:12px; font-weight:bold; margin-left:12px;'>{level_lbl}</span>", unsafe_allow_html=True)
    with s_col2:
        if st.button("🐛 난이도 변경", use_container_width=True):
            st.session_state.current_view = "level"
            st.rerun()

    # 탭 네비게이션 컬럼 (곤충 아이콘화)
    tabs_list = ["🐞 그림책 읽기", "🐜 단어 배우기", "🐝 퀴즈 풀기", "🦋 독후 활동", "🕷️ AI 곤충대화"]
    tab_cols = st.columns(5)
    for idx, t_name in enumerate(tabs_list):
        with tab_cols[idx]:
            is_active = st.session_state.active_tab == t_name
            if st.button(t_name, key=f"tab_btn_{idx}", use_container_width=True, type="primary" if is_active else "secondary"):
                st.session_state.active_tab = t_name
                st.rerun()
    st.markdown("---")

    # 각 탭에 따른 분기 렌더링
    if st.session_state.active_tab == "🐞 그림책 읽기":
        render_book_tab(bug)
    elif st.session_state.active_tab == "🐜 단어 배우기":
        render_words_tab(bug)
    elif st.session_state.active_tab == "🐝 퀴즈 풀기":
        render_quiz_tab(bug)
    elif st.session_state.active_tab == "🦋 독후 활동":
        render_activity_tab(bug)
    elif st.session_state.active_tab == "🕷️ AI 곤충대화":
        render_ai_tab(bug)

# ① 탭: 양면 그림책 리딩
def render_book_tab(bug):
    story = bug["levels"][st.session_state.selected_level]["story"]
    
    # 짝수 페이지 기준 조정
    if st.session_state.story_page % 2 != 0:
        st.session_state.story_page = max(0, st.session_state.story_page - 1)

    left_text = story[st.session_state.story_page]
    right_text = story[st.session_state.story_page + 1] if st.session_state.story_page + 1 < len(story) else ""

    col1, col2 = st.columns(2)
    
    # 왼쪽 페이지
    with col1:
        st.markdown(f"""
        <div class="book-page-style-left">
            <h5 style="color:var(--primary); margin:0;">Page {st.session_state.story_page + 1}</h5>
            <p style="font-size: 1.4rem; line-height: 1.6; text-align: center; color: var(--text-dark); min-height: 180px; display:flex; align-items:center; justify-content:center;">
                {left_text}
            </p>
            <div></div>
        </div>
        """, unsafe_allow_html=True)
        # 발음 오디오 재생 및 예외 안내
        audio_bytes = generate_tts_audio(left_text)
        if audio_bytes:
            st.audio(audio_bytes, format="audio/mp3")
        else:
            st.caption("🔇 오디오를 불러올 수 없습니다. (인터넷 연결을 확인해 주세요)")

    # 오른쪽 페이지
    with col2:
        if right_text:
            st.markdown(f"""
            <div class="book-page-style-right">
                <h5 style="color:var(--primary); margin:0; text-align:right;">Page {st.session_state.story_page + 2}</h5>
                <p style="font-size: 1.4rem; line-height: 1.6; text-align: center; color: var(--text-dark); min-height: 180px; display:flex; align-items:center; justify-content:center;">
                    {right_text}
                </p>
                <div></div>
            </div>
            """, unsafe_allow_html=True)
            audio_bytes_r = generate_tts_audio(right_text)
            if audio_bytes_r:
                st.audio(audio_bytes_r, format="audio/mp3")
            else:
                st.caption("🔇 오디오를 불러올 수 없습니다. (인터넷 연결을 확인해 주세요)")
        else:
            st.markdown(f"""
            <div class="book-page-style-right" style="justify-content:center; align-items:center; text-align:center;">
                <h3 style="color:#ccc;">The End 🌿</h3>
            </div>
            """, unsafe_allow_html=True)

    # 이전/다음 페이지 내비게이션 (곤충 아이콘화)
    st.markdown("<br>", unsafe_allow_html=True)
    nav_col1, nav_col2, nav_col3 = st.columns([1.2, 2, 1.2])
    with nav_col1:
        if st.button("🐜 이전 책장", disabled=(st.session_state.story_page == 0), use_container_width=True):
            st.session_state.story_page = max(0, st.session_state.story_page - 2)
            st.rerun()
    with nav_col2:
        total_p = len(story)
        st.markdown(f"<div style='text-align:center; font-weight:bold; margin-top:8px;'>{st.session_state.story_page + 1}-{min(st.session_state.story_page + 2, total_p)} / {total_p} 페이지</div>", unsafe_allow_html=True)
    with nav_col3:
        is_end = st.session_state.story_page + 2 >= total_p
        btn_txt = "🐝 완독 완료! ⭐" if is_end else "🦋 다음 책장"
        if st.button(btn_txt, use_container_width=True, type="primary" if is_end else "secondary"):
            if is_end:
                # 완독 기록 저장
                insect_id = st.session_state.selected_insect
                progress = user_data["progress"].get(insect_id, {"read": False, "quiz": False, "activity": False})
                new_read = not progress.get("read")
                progress["read"] = True
                user_data["progress"][insect_id] = progress
                save_user_progress(user_data)
                
                st.success("책을 다 읽었습니다! 별 1개를 얻었어요! ⭐")
                check_and_award_badges()
                
                st.session_state.active_tab = "🐜 단어 배우기"
                st.rerun()
            else:
                st.session_state.story_page += 2
                st.rerun()

# ② 탭: 단어 카드 학습
def render_words_tab(bug):
    st.markdown("### 🔤 낱말 공부 카드")
    st.write("단어 카드를 클릭하여 한글 뜻과 예문을 펼치고, 발음을 들어보세요!")
    
    words = bug["words"]
    learned = user_data["learned_words"].get(st.session_state.selected_insect, [])
    
    w_cols = st.columns(3)
    for idx, w in enumerate(words):
        col = w_cols[idx % 3]
        with col:
            with st.expander(f"✨ **{w['word']}**", expanded=False):
                st.markdown(f"#### **{w['meaning']}**")
                st.info(f"💡 예문: {w['example']}")
                
                # 발음 재생 및 오프라인 예외 처리
                w_audio = generate_tts_audio(w['word'])
                if w_audio:
                    st.write("단어 발음:")
                    st.audio(w_audio, format="audio/mp3")
                else:
                    st.caption("🔇 단어 발음 오프라인 상태")
                
                ex_audio = generate_tts_audio(w['example'])
                if ex_audio:
                    st.write("예문 듣기:")
                    st.audio(ex_audio, format="audio/mp3")
                else:
                    st.caption("🔇 예문 오프라인 상태")

                # 학습 완료 기록
                if w['word'] not in learned:
                    learned.append(w['word'])
                    user_data["learned_words"][st.session_state.selected_insect] = learned
                    save_user_progress(user_data)

# ③ 탭: 이해도 퀴즈
def render_quiz_tab(bug):
    quizzes = bug["quiz"]
    
    # 퀴즈 전용 세션 변수 초기화
    if "quiz_idx" not in st.session_state:
        st.session_state.quiz_idx = 0
    if "quiz_score" not in st.session_state:
        st.session_state.quiz_score = 0
    if "quiz_answered" not in st.session_state:
        st.session_state.quiz_answered = False
    
    q_idx = st.session_state.quiz_idx
    
    if q_idx < len(quizzes):
        q = quizzes[q_idx]
        st.markdown(f"### 문제 {q_idx + 1} / {len(quizzes)}")
        st.progress(q_idx / len(quizzes))
        
        st.markdown(f"#### **{q['question']}**")
        ans = st.radio("정답을 선택하세요:", q["options"], index=None, key=f"st_quiz_{q_idx}")
        
        btn_q1, btn_q2 = st.columns(2)
        with btn_q1:
            if st.button("🐞 정답 제출!", use_container_width=True, disabled=(ans is None or st.session_state.quiz_answered)):
                st.session_state.quiz_answered = True
                correct_val = q["options"][q["answer"]]
                if ans == correct_val:
                    st.session_state.quiz_score += 1
                    st.success("🟢 정답입니다! 참 잘했어요!")
                    fb_audio = generate_tts_audio("Great job!")
                else:
                    st.error(f"❌ 아쉬워요! 정답은 '{correct_val}' 입니다.")
                    fb_audio = generate_tts_audio("Oops!")
                if fb_audio:
                    st.audio(fb_audio, format="audio/mp3")
                st.rerun()
                
        with btn_q2:
            if st.button("🦋 다음 문제", use_container_width=True, disabled=not st.session_state.quiz_answered):
                st.session_state.quiz_idx += 1
                st.session_state.quiz_answered = False
                st.rerun()
    else:
        # 퀴즈 종료 화면
        total_q = len(quizzes)
        corrects = st.session_state.quiz_score
        score = int((corrects / total_q) * 100)
        
        st.markdown("<div style='text-align:center;'><h2>🏆 퀴즈가 모두 끝났습니다!</h2></div>", unsafe_allow_html=True)
        st.balloons()
        
        # 퀴즈 별 기록 저장
        insect_id = st.session_state.selected_insect
        user_data["quiz_scores"][insect_id] = score
        progress = user_data["progress"].get(insect_id, {"read": False, "quiz": False, "activity": False})
        new_quiz = not progress.get("quiz")
        progress["quiz"] = True
        user_data["progress"][insect_id] = progress
        save_user_progress(user_data)
        
        st.info(f"최종 결과: **{corrects} / {total_q} 문제 맞춤** (점수: **{score}점**)")
        
        if score == 100:
            st.success("🎉 만점 완료! 퀴즈 왕 배지를 획득했습니다!")
            check_and_award_badges("quiz_perfect")
        else:
            check_and_award_badges()
            
        col_end1, col_end2 = st.columns(2)
        with col_end1:
            if st.button("🐜 다시 풀기", use_container_width=True):
                st.session_state.quiz_idx = 0
                st.session_state.quiz_score = 0
                st.session_state.quiz_answered = False
                st.rerun()
        with col_end2:
            if st.button("🦋 독후 활동하기", use_container_width=True, type="primary"):
                st.session_state.active_tab = "🦋 독후 활동"
                st.rerun()

# ④ 탭: 독후 활동
def render_activity_tab(bug):
    st.markdown("### 🎨 나만의 곤충 그리기 스케치북")
    st.write("브러시 색상과 두께를 골라 아래 하얀 도화지에 그림을 그린 후 완료 버튼을 눌러주세요.")

    c_col1, c_col2 = st.columns([1, 3])
    with c_col1:
        color = st.color_picker("붓 색상 선택:", "#2e7d32")
        stroke = st.slider("붓 두께:", 2, 20, 6)
        mode = st.selectbox("그리기 도구:", ["freedraw", "line", "rect", "circle", "transform"])
        
    with c_col2:
        # 스트림릿 드로잉 캔버스 컴포넌트 렌더
        canvas_result = st_canvas(
            fill_color="rgba(255, 255, 255, 0)",
            stroke_width=stroke,
            stroke_color=color,
            background_color="#ffffff",
            height=300,
            width=450,
            drawing_mode=mode,
            key=f"st_canvas_{st.session_state.selected_insect}_{st.session_state.selected_level}"
        )

    st.markdown("---")
    st.markdown("### ✍️ 영어 한 문장 쓰기")
    st.write("💡 아래 문장 예시를 클릭해 직접 써보세요:")
    recom = [
        f"I like this {bug['nameEn'].lower()}.",
        f"My {bug['nameEn'].lower()} is very pretty.",
        f"Ladybugs have black spots."
    ]
    for r in recom:
        st.markdown(f"- `{r}`")
        
    written = st.text_input("여기에 직접 타이핑해 보세요:", placeholder="I like ladybugs.")
    
    if st.button("🐝 문장 소리 듣기", disabled=not written):
        w_audio = generate_tts_audio(written)
        if w_audio:
            st.audio(w_audio, format="audio/mp3")

    st.markdown("<br>", unsafe_allow_html=True)
    if st.button("🐞 독후 활동 저장하고 완료! ⭐", type="primary", use_container_width=True):
        if not written:
            st.warning("영어 문장을 먼저 작성해 주세요!")
        else:
            # 캔버스 그림 데이터를 Base64로 인코딩
            img_b64 = ""
            if canvas_result.image_data is not None:
                img = Image.fromarray(canvas_result.image_data.astype('uint8'), 'RGBA')
                buffered = BytesIO()
                img.save(buffered, format="PNG")
                img_b64 = "data:image/png;base64," + base64.b64encode(buffered.getvalue()).decode()
                
            activity_record = {
                "insectId": st.session_state.selected_insect,
                "levelId": st.session_state.selected_level,
                "drawing": img_b64,
                "text": written,
                "date": datetime.datetime.now().strftime("%Y-%m-%d")
            }

            # 기록 추가
            activities = user_data.get("saved_activities", [])
            activities = [a for a in activities if not (a["insectId"] == activity_record["insectId"] and a["levelId"] == activity_record["levelId"])]
            activities.append(activity_record)
            user_data["saved_activities"] = activities

            # 독후 활동 별 획득
            insect_id = st.session_state.selected_insect
            progress = user_data["progress"].get(insect_id, {"read": False, "quiz": False, "activity": False})
            new_act = not progress.get("activity")
            progress["activity"] = True
            user_data["progress"][insect_id] = progress
            
            save_user_progress(user_data)
            st.success("작품이 학부모 갤러리에 저장되었습니다! 별 1개를 추가 획득했습니다! ⭐")
            check_and_award_badges("first_drawing")
            
            st.session_state.active_tab = "🕷️ AI 곤충대화"
            st.rerun()

# ⑤ 탭: AI 곤충 친구 대화
def render_ai_tab(bug):
    st.markdown(f"### 🤖 {bug['nameKo']} 박사님과 대화방")
    
    chat_key = st.session_state.selected_insect
    if chat_key not in st.session_state.chat_history:
        st.session_state.chat_history[chat_key] = [
            {"role": "assistant", "content": f"안녕! 나는 {bug['nameKo']} 박사야 {bug['icon']}! 우리 친구에 대해 궁금한 점을 물어보거나 '동화 지어줘!'라고 해볼래?"}
        ]

    # 빠른 질문 리스트
    sug_map = {
        "ladybug": ["무당벌레의 등껍질 점은 왜 있나요?", "무당벌레는 무얼 먹고 살아요?", "새로운 무당벌레 동화 들려줘!"],
        "ant": ["개미는 무거운 짐을 어떻게 들어?", "개미집 아파트는 어떻게 생겼어?", "새로운 개미 동화 들려줘!"],
        "butterfly": ["나비는 맛을 어떻게 느껴요?", "나비 가루는 무슨 역할을 해요?", "새로운 나비 동화 들려줘!"],
        "honeybee": ["꿀벌들은 왜 춤을 춰요?", "꿀벌은 침 쏘면 어떻게 돼?", "새로운 꿀벌 동화 들려줘!"]
    }
    sug_list = sug_map.get(chat_key, ["어디에 사나요?", "무엇을 먹고 살아요?", "재미있는 동화 들려줘!"])

    st.write("💡 빠른 질문:")
    s_cols = st.columns(3)
    for idx, s in enumerate(sug_list):
        with s_cols[idx]:
            if st.button(s, key=f"ai_sug_{idx}", use_container_width=True):
                process_chat(s, chat_key, bug)

    st.markdown("---")
    # 대화 이력 렌더링
    for msg in st.session_state.chat_history[chat_key]:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"].replace("\n", "<br>"), unsafe_allow_html=True)

    # 사용자 챗 입력창
    user_q = st.chat_input("질문을 적어주세요...")
    if user_q:
        process_chat(user_q, chat_key, bug)

def process_chat(question, chat_key, bug):
    st.session_state.chat_history[chat_key].append({"role": "user", "content": question})
    
    # 배지 획득 확인
    if "ai_explorer" not in user_data.get("unlocked_badges", []):
        check_and_award_badges("ai_explorer")

    api_key = user_data.get("gemini_api_key", "")
    
    if api_key:
        # 실시간 Gemini API 연동
        response_text = call_gemini_python(api_key, question, bug)
    else:
        # 로컬 모의 AI 대답
        response_text = get_mock_response_python(question, bug)

    st.session_state.chat_history[chat_key].append({"role": "assistant", "content": response_text})
    st.rerun()

def call_gemini_python(api_key, prompt, bug):
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        system_instruction = f"""
        너는 7세~10세 어린이를 위한 아주 친절하고 상냥한 곤충 박사 AI야. 이름은 "{bug['nameKo']} 박사"이고 말투는 귀여운 이모티콘을 많이 섞어서 '~했어!', '~란다' 처럼 말해야 해.
        어린이 대상이므로 너무 어려운 전문 용어는 피하고 비유를 들어서 쉽게 설명해줘.
        
        [미션]
        1. 사용자가 질문하는 '{bug['nameEn']}({bug['nameKo']})'에 관한 자연과학적 호기심을 한글로 해결해준다.
        2. 만약 질문이 "새로운 이야기 만들어줘" 또는 "영어 동화 들려줘"와 같이 스토리와 관련되어 있다면, 3~4문장 분량의 아주 쉬운 영어 그림책 버전을 영문으로 창작해준다. 그리고 그 밑에 한글 해석을 덧붙여 준다.
           (예시 영어 문장 수준: "This is a little bee. It gathers golden honey. It shares honey with family. We love honey!")
        """
        response = model.generate_content(f"{system_instruction}\n\n사용자 질문: {prompt}")
        return response.text
    except Exception as e:
        return f"앗! AI 박사님과 인터넷 전화가 끊겼어 📞 (오류: {e}). 나중에 다시 질문해줄래?"

def get_mock_response_python(question, bug):
    nameKo = bug["nameKo"]
    nameEn = bug["nameEn"]
    icon = bug["icon"]

    # 동화 생성 요청인 경우
    if "동화" in question or "이야기" in question or "story" in question or "Story" in question:
        return f"""📖 [오프라인 모의 {nameEn} 동화 이야기]<br><br>Once upon a time, a tiny {nameEn.lower()} named Happy lived in a big garden {icon}.<br>Every day, Happy sat on a green leaf and sang a sweet song.<br>"I am small, but I am strong!" Happy cheered.<br>The warm sun smiled down at the happy little friend ☀️.<br><br>*(옛날 옛적에, 해피라는 작은 {nameKo}가 큰 정원에 살고 있었습니다.<br>매일 해피는 초록 나뭇잎에 앉아 달콤한 노래를 불렀습니다.<br>"나는 작지만, 정말 힘이 세!" 해피는 기뻐했습니다.<br>따뜻한 태양이 행복한 작은 친구를 향해 미소 지었습니다.)*"""

    # 키워드별 대답
    mock_db = {
        "ladybug": {
            "점": "무당벌레 날개의 검은 점들은 새 같은 무서운 적에게 '나를 먹으면 쓴 맛이 나니까 조심해!' 하고 경고하는 역할을 한단다 🛑. 신기하지?",
            "먹": "무당벌레는 나뭇잎을 아프게 하는 나쁜 '진딧물'을 먹고 살아 😋. 농부 삼촌들을 돕는 아주 든든한 꼬마 경찰관이야!",
        },
        "ant": {
            "짐": "개미는 무척 작지만 자기 몸무게의 무려 50배가 넘는 먹이도 번쩍 들어 올릴 수 있는 엄청난 힘을 가졌어 💪!",
            "집": "개미집은 땅속 깊은 곳에 여왕방, 알방, 먹이 저장실 등으로 나뉜 아주 큰 거실 아파트 모양을 하고 있어 🏢.",
        },
        "butterfly": {
            "가루": "나비 날개의 고운 가루는 빗물이 스며들지 않게 막아주는 방수 우산 역할을 한단다 ☔. 만지면 날개가 젖어 날 수 없으니 눈으로만 봐야 해!",
            "맛": "나비는 입이 아니라 발로 달콤한 맛을 느껴 🦶. 꽃 위에 앉는 순간 맛있는 꽃인지 바로 안단다.",
        },
        "honeybee": {
            "춤": "꿀벌들은 맛있는 꽃을 찾으면 엉덩이를 씰룩이며 8자 모양 춤을 춰서 다른 친구들에게 위치를 설명해 줘 💃!",
            "침": "꿀벌은 정말 생명이 위험할 때 한 번 침을 쏘고, 그러면 침이 내장과 연결되어 있어서 스스로도 죽게 된단다 😢."
        }
    }

    sub_db = mock_db.get(bug["id"], {})
    for k, v in sub_db.items():
        if k in question:
            return v
            
    return f"오! {nameKo}에 대한 좋은 질문이야 {icon}! 인터넷(Gemini API)에 연결되면 더 자세히 알려줄 수 있어. 숲속 곤충들은 참 신비롭단다!"

# 12. 학부모 인증 게이트 (구구단)
def render_parent_gate_view():
    st.markdown("### 🔒 보호자 확인 (Parent Gate)")
    st.write("학부모 관리 대시보드 진입을 위해 구구단 연산 문제를 풀어주세요.")
    
    if "g_num1" not in st.session_state:
        st.session_state.g_num1 = random.randint(5, 9)
        st.session_state.g_num2 = random.randint(3, 9)
        st.session_state.g_ans = st.session_state.g_num1 * st.session_state.g_num2

    st.info(f"문제:  {st.session_state.g_num1}  &times;  {st.session_state.g_num2}  =  ?")
    ans_input = st.number_input("정답 입력:", min_value=0, step=1, value=None, key="gate_number_inp")
    
    col1, col2 = st.columns(2)
    with col1:
        if st.button("🐜 확인", use_container_width=True, type="primary"):
            if ans_input == st.session_state.g_ans:
                st.session_state.current_view = "parent"
                # 변수 초기화
                del st.session_state.g_num1
                del st.session_state.g_num2
                del st.session_state.g_ans
                st.rerun()
            else:
                st.error("오답입니다! 어린이는 올 수 없어요.")
    with col2:
        if st.button("🕷️ 돌아가기", use_container_width=True):
            st.session_state.current_view = "home"
            if "g_num1" in st.session_state:
                del st.session_state.g_num1
                del st.session_state.g_num2
                del st.session_state.g_ans
            st.rerun()

# 13. 학부모 대시보드 뷰
def render_parent_view():
    st.markdown("## 👨‍👩‍👧 학부모 관리 대시보드 <span style='font-size:1rem; color:#888; font-weight:normal;'>v1.1</span>", unsafe_allow_html=True)
    st.write("자녀의 곤충 영어 학습 이력과 직접 그린 그림 작품집을 확인할 수 있습니다.")

    # 1. 학습 통계 요약
    read_count = sum(1 for p in user_data["progress"].values() if p.get("read", False))
    learned_words_cnt = sum(len(w) for w in user_data["learned_words"].values())
    quiz_scores = [s for s in user_data["quiz_scores"].values()]
    avg_score = int(sum(quiz_scores) / len(quiz_scores)) if quiz_scores else 0
    
    total_stars = 0
    for id_ in insects_data.keys():
        prog = user_data["progress"].get(id_, {"read": False, "quiz": False, "activity": False})
        total_stars += sum(1 for k, v in prog.items() if v)

    p_col1, p_col2, p_col3, p_col4 = st.columns(4)
    with p_col1:
        st.metric("누적 획득 별", f"⭐ {total_stars}개")
    with p_col2:
        st.metric("완독한 그림책", f"📖 {read_count}권")
    with p_col3:
        st.metric("암기한 영단어", f"🔤 {learned_words_cnt}개")
    with p_col4:
        st.metric("평균 퀴즈 점수", f"🎯 {avg_score}점")

    # 2. 독후 그림 작품 갤러리
    st.markdown("---")
    st.markdown("### 🎨 아이의 독후 활동 그림 및 문장 갤러리")
    activities = user_data.get("saved_activities", [])
    
    if not activities:
        st.info("아직 완료한 독후 활동 작품이 없습니다. 아이와 책을 읽고 첫 그림을 저장해 보세요!")
    else:
        # 3열 갤러리 배치
        g_cols = st.columns(3)
        for g_idx, act in enumerate(activities):
            g_col = g_cols[g_idx % 3]
            bug_name = insects_data.get(act["insectId"], {}).get("nameKo", act["insectId"])
            level_num = act["levelId"].replace("level", "")
            
            with g_col:
                with st.container():
                    st.markdown(f"**{bug_name} (Lv.{level_num})** - *{act['date']}*")
                    # base64 이미지 디코딩 후 출력
                    try:
                        img_str = act["drawing"]
                        if img_str.startswith("data:image/png;base64,"):
                            img_str = img_str.split(",")[1]
                        img_bytes = base64.b64decode(img_str)
                        st.image(img_bytes, use_container_width=True)
                    except Exception as img_err:
                        st.write("그림 데이터를 표시할 수 없습니다.")
                        
                    st.write(f"✍️ *\"{act['text']}\"*")
                    
                    if st.button("🗑️ 삭제", key=f"del_act_{g_idx}"):
                        activities.pop(g_idx)
                        user_data["saved_activities"] = activities
                        # 별 차감 로직 연계
                        prog = user_data["progress"].get(act["insectId"], {"read": False, "quiz": False, "activity": False})
                        prog["activity"] = False
                        user_data["progress"][act["insectId"]] = prog
                        save_user_progress(user_data)
                        st.success("작품이 갤러리에서 삭제되었습니다.")
                        st.rerun()

    # 3. 환경설정 및 초기화 구역
    st.markdown("---")
    set_col1, set_col2 = st.columns(2)
    
    # API 키 저장
    with set_col1:
        st.markdown("#### 🔑 AI 실시간 대화 연동 (Gemini API)")
        st.write("Google AI Studio에서 발급받은 Gemini API 키를 등록하면 대화가 실시간 AI로 전환됩니다.")
        curr_key = user_data.get("gemini_api_key", "")
        key_input = st.text_input("Gemini API Key:", value=curr_key, type="password")
        
        save_btn, del_btn = st.columns(2)
        with save_btn:
            if st.button("🐞 API 키 저장", use_container_width=True):
                user_data["gemini_api_key"] = key_input
                save_user_progress(user_data)
                st.success("API 키가 저장되었습니다.")
                st.rerun()
        with del_btn:
            if st.button("🕷️ API 키 삭제", use_container_width=True, disabled=not curr_key):
                user_data["gemini_api_key"] = ""
                save_user_progress(user_data)
                st.success("API 키가 제거되었습니다.")
                st.rerun()

    # 위험구역 데이터 리셋
    with set_col2:
        st.markdown("#### ⚙️ 위험 구역")
        st.write("자녀의 모든 학습 이력(⭐, 뱃지, 저장된 그림)을 공장 초기화합니다.")
        if st.button("⚠️ 모든 학습 데이터 초기화", use_container_width=True, type="secondary"):
            if "confirm_reset" not in st.session_state:
                st.session_state.confirm_reset = True
                st.warning("정말로 초기화하시겠습니까? 한 번 더 누르면 실행됩니다.")
            else:
                del st.session_state.confirm_reset
                st.session_state.user_data = {
                    "stars": {},
                    "progress": {},
                    "learned_words": {},
                    "quiz_scores": {},
                    "unlocked_badges": [],
                    "saved_activities": [],
                    "gemini_api_key": ""
                }
                save_user_progress(st.session_state.user_data)
                st.success("모든 데이터가 완벽히 초기화되었습니다.")
                st.session_state.current_view = "home"
                st.rerun()

# 14. 메인 어플리케이션 제어 분기
render_header()

if st.session_state.current_view == "home":
    render_home_view()
elif st.session_state.current_view == "level":
    render_level_view()
elif st.session_state.current_view == "learn":
    render_learn_view()
elif st.session_state.current_view == "parent_gate":
    render_parent_gate_view()
elif st.session_state.current_view == "parent":
    render_parent_view()
