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
    page_title="Bug Read & Play - 곤충 영어 나라 V1.1.1",
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
        color: #000000 !important;
    }
    
    /* 모든 텍스트 요소 검은색 적용 */
    h1, h2, h3, h4, h5, h6, p, span, label, li,
    [data-testid="stWidgetLabel"], 
    [data-testid="stMarkdownContainer"],
    .stMarkdown,
    .stMetric div,
    .stRadio label,
    .stSelectbox label,
    .stSlider label,
    .stTextInput label,
    .stNumberInput label,
    .stColorPicker label,
    .insect-card,
    .book-page-style-left,
    .book-page-style-right,
    .badge-cabinet {
        color: #000000 !important;
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
        color: #000000 !important;
        padding: 6px 16px !important;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        box-shadow: 0 4px 6px rgba(46, 125, 50, 0.05) !important;
    }
    
    div.stButton > button:hover {
        transform: scale(1.08) translateY(-3px) !important;
        box-shadow: 0 8px 16px rgba(46, 125, 50, 0.15) !important;
        border-color: #2e7d32 !important;
        background-color: #e8f5e9 !important;
        color: #000000 !important;
    }
    
    /* primary 버튼 커스텀 (배경을 밝은 연두색으로 변경하여 글자색 검은색 유지 및 가독성 확보) */
    div.stButton > button[kind="primary"] {
        background-color: #c8e6c9 !important;
        color: #000000 !important;
        border: 2px solid #2e7d32 !important;
    }
    
    div.stButton > button[kind="primary"]:hover {
        background-color: #a5d6a7 !important;
        border-color: #1b5e20 !important;
        color: #000000 !important;
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
    st.session_state.active_tab = "그림책 읽기"
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
            f"<h2 style='margin:0; font-family:var(--font-fun); cursor:pointer;' onclick='window.location.reload()'>🌿 Bug Read & Play <span style='font-size:0.9rem; background:#2e7d32; color:white; padding:2px 8px; border-radius:12px; vertical-align:middle; font-weight:bold; margin-left:6px;'>V1.1.1</span></h2>", 
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
            if st.button("🏠 홈", use_container_width=True, disabled=not is_home_active, key="header_home_btn"):
                st.session_state.current_view = "home"
                st.session_state.selected_insect = None
                st.session_state.story_page = 0
                st.rerun()
        with btn_col2:
            if st.session_state.current_view in ["parent", "parent_gate"]:
                if st.button("🏠 자녀 홈", use_container_width=True, key="header_child_home_btn"):
                    st.session_state.current_view = "home"
                    st.session_state.selected_insect = None
                    st.session_state.story_page = 0
                    st.rerun()
            else:
                if st.button("👤 부모방", use_container_width=True, key="header_parent_btn"):
                    st.session_state.current_view = "parent_gate"
                    st.rerun()
    st.markdown("---")

# 9. 메인 홈 뷰 (곤충 카드 및 배지 진열장)
def render_home_view():
    st.markdown("<div style='text-align:center; margin-bottom: 24px;'><h1>🐞 곤충 영어 리딩 나라 V1.1.1</h1><p>더 깜찍해진 곤충 친구들과 함께 즐거운 영어 리딩과 독후 활동을 시작해 보세요.</p></div>", unsafe_allow_html=True)
    
    # 곤충 카드 그리드 (3열 배치)
    cols = st.columns(3)
    for idx, (key, bug) in enumerate(insects_data.items()):
        col = cols[idx % 3]
        
        with col:
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
                    <div style="font-size: 0.9rem; font-weight: bold; color: #000000;">{b_info['name'].split(' ')[0]}</div>
                    <div style="font-size: 0.75rem; color: #000000;">{b_info['desc']}</div>
                </div>
                """, unsafe_allow_html=True)
            else:
                st.markdown(f"""
                <div style="text-align: center; background: rgba(0,0,0,0.03); padding: 16px; border-radius: 16px; border: 2px dashed #ccc;">
                    <div style="font-size: 2.2rem; margin-bottom: 4px;">🔒</div>
                    <div style="font-size: 0.9rem; font-weight: bold; color: #000000;">잠김</div>
                    <div style="font-size: 0.75rem; color: #000000;">{b_info['desc']}</div>
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
                    <h2 style="margin: 0 0 6px 0; color: #000000;">{lv}</h2>
                    <span style="background: var(--primary-light); color: #000000; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">{target}</span>
                    <h5 style="margin: 16px 0 8px 0; color: #000000;">{title}</h5>
                    <p style="font-size: 0.85rem; color: #000000; line-height: 1.4; margin: 0;">{desc}</p>
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
                st.session_state.active_tab = "그림책 읽기"
                st.session_state.current_view = "learn"
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
        if st.button("난이도 변경", use_container_width=True):
            st.session_state.current_view = "level"
            st.rerun()

    # 탭 네비게이션 컬럼 (곤충 아이콘화)
    tabs_list = ["그림책 읽기", "단어 배우기", "퀴즈 풀기", "독후 활동", "곤충지식"]
    tab_cols = st.columns(5)
    for idx, t_name in enumerate(tabs_list):
        with tab_cols[idx]:
            is_active = st.session_state.active_tab == t_name
            if st.button(t_name, key=f"tab_btn_{idx}", use_container_width=True, type="primary" if is_active else "secondary"):
                st.session_state.active_tab = t_name
                st.rerun()
    st.markdown("---")

    # 각 탭에 따른 분기 렌더링
    if st.session_state.active_tab == "그림책 읽기":
        render_book_tab(bug)
    elif st.session_state.active_tab == "단어 배우기":
        render_words_tab(bug)
    elif st.session_state.active_tab == "퀴즈 풀기":
        render_quiz_tab(bug)
    elif st.session_state.active_tab == "독후 활동":
        render_activity_tab(bug)
    elif st.session_state.active_tab == "곤충지식":
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
            <h5 style="color:#000000; margin:0;">Page {st.session_state.story_page + 1}</h5>
            <p style="font-size: 1.4rem; line-height: 1.6; text-align: center; color: #000000; min-height: 180px; display:flex; align-items:center; justify-content:center;">
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
                <h5 style="color:#000000; margin:0; text-align:right;">Page {st.session_state.story_page + 2}</h5>
                <p style="font-size: 1.4rem; line-height: 1.6; text-align: center; color: #000000; min-height: 180px; display:flex; align-items:center; justify-content:center;">
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
                <h3 style="color:#000000;">The End 🌿</h3>
            </div>
            """, unsafe_allow_html=True)

    # 이전/다음 페이지 내비게이션 (곤충 아이콘화)
    st.markdown("<br>", unsafe_allow_html=True)
    nav_col1, nav_col2, nav_col3 = st.columns([1.2, 2, 1.2])
    with nav_col1:
        if st.button("이전 책장", disabled=(st.session_state.story_page == 0), use_container_width=True):
            st.session_state.story_page = max(0, st.session_state.story_page - 2)
            st.rerun()
    with nav_col2:
        total_p = len(story)
        st.markdown(f"<div style='text-align:center; font-weight:bold; margin-top:8px;'>{st.session_state.story_page + 1}-{min(st.session_state.story_page + 2, total_p)} / {total_p} 페이지</div>", unsafe_allow_html=True)
    with nav_col3:
        is_end = st.session_state.story_page + 2 >= total_p
        btn_txt = "완독 완료! ⭐" if is_end else "다음 책장"
        if st.button(btn_txt, use_container_width=True, type="primary" if is_end else "secondary"):
            if is_end:
                # 완독 기록 저장
                insect_id = st.session_state.selected_insect
                progress = user_data["progress"].get(insect_id, {"read": False, "quiz": False, "activity": False})
                progress["read"] = True
                user_data["progress"][insect_id] = progress
                save_user_progress(user_data)
                
                st.success("책을 다 읽었습니다! 별 1개를 얻었어요! ⭐")
                check_and_award_badges()
                
                st.session_state.active_tab = "단어 배우기"
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
    if "quiz_feedback" not in st.session_state:
        st.session_state.quiz_feedback = None  # {"correct": bool, "message": str}
    
    q_idx = st.session_state.quiz_idx
    
    if q_idx < len(quizzes):
        q = quizzes[q_idx]
        st.markdown(f"### 문제 {q_idx + 1} / {len(quizzes)}")
        st.progress(q_idx / len(quizzes))
        
        st.markdown(f"#### **{q['question']}**")
        ans = st.radio("정답을 선택하세요:", q["options"], index=None, key=f"st_quiz_{q_idx}")
        
        # 이전 제출의 피드백 표시 (rerun 후에도 유지)
        if st.session_state.quiz_feedback is not None:
            fb = st.session_state.quiz_feedback
            if fb["correct"]:
                st.success(fb["message"])
                fb_audio = generate_tts_audio("Great job!")
            else:
                st.error(fb["message"])
                fb_audio = generate_tts_audio("Oops!")
            if fb_audio:
                st.audio(fb_audio, format="audio/mp3")
        
        btn_q1, btn_q2 = st.columns(2)
        with btn_q1:
            if st.button("🐞 정답 제출!", use_container_width=True, disabled=(ans is None or st.session_state.quiz_answered)):
                correct_val = q["options"][q["answer"]]
                if ans == correct_val:
                    st.session_state.quiz_score += 1
                    st.session_state.quiz_feedback = {"correct": True, "message": "🟢 정답입니다! 참 잘했어요!"}
                else:
                    st.session_state.quiz_feedback = {"correct": False, "message": f"❌ 아쉬워요! 정답은 '{correct_val}' 입니다."}
                st.session_state.quiz_answered = True
                st.rerun()
                
        with btn_q2:
            if st.button("🦋 다음 문제", use_container_width=True, disabled=not st.session_state.quiz_answered):
                st.session_state.quiz_idx += 1
                st.session_state.quiz_answered = False
                st.session_state.quiz_feedback = None
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
            if st.button("다시 풀기", use_container_width=True):
                st.session_state.quiz_idx = 0
                st.session_state.quiz_score = 0
                st.session_state.quiz_answered = False
                st.session_state.quiz_feedback = None
                st.rerun()
        with col_end2:
            if st.button("독후 활동하기", use_container_width=True, type="primary"):
                st.session_state.active_tab = "독후 활동"
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
        f"The {bug['nameEn'].lower()} is my favorite insect.",
        f"I learned about the {bug['nameEn'].lower()} today."
    ]
    for r in recom:
        st.markdown(f"- `{r}`")
        
    written = st.text_input("여기에 직접 타이핑해 보세요:", placeholder="I like ladybugs.")
    
    if st.button("🐝 문장 소리 듣기", disabled=not written):
        w_audio = generate_tts_audio(written)
        if w_audio:
            st.audio(w_audio, format="audio/mp3")

    st.markdown("<br>", unsafe_allow_html=True)
    if st.button("독후 활동 저장하고 완료! ⭐", type="primary", use_container_width=True):
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
            progress["activity"] = True
            user_data["progress"][insect_id] = progress
            
            save_user_progress(user_data)
            st.success("작품이 학부모 갤러리에 저장되었습니다! 별 1개를 추가 획득했습니다! ⭐")
            check_and_award_badges("first_drawing")
            
            st.session_state.active_tab = "곤충지식"
            st.rerun()

# ⑤ 탭: 곤충지식
def render_ai_tab(bug):
    chat_key = st.session_state.selected_insect
    
    # 1. 한/영 언어 선택 레이아웃
    col_title, col_lang = st.columns([3.2, 1.8])
    with col_title:
        st.markdown(f"### 🤖 {bug['nameKo']} 박사님과 대화방")
    with col_lang:
        chat_lang = st.radio("Language / 언어 설정", ["한국어 🇰🇷", "English 🇺🇸"], horizontal=True, key=f"lang_select_{chat_key}")
        is_en = (chat_lang == "English 🇺🇸")
    
    default_msg_ko = f"안녕! 나는 {bug['nameKo']} 박사야 {bug['icon']}! 아래의 빠른 질문 버튼을 눌러 나에 대해 더 자세히 알아볼래?"
    default_msg_en = f"Hello! I am Dr. {bug['nameEn']} {bug['icon']}! Would you like to know more about me by tapping the questions below?"
    
    if chat_key not in st.session_state.chat_history:
        st.session_state.chat_history[chat_key] = [
            {"role": "assistant", "content": default_msg_en if is_en else default_msg_ko}
        ]
    else:
        # 이력이 있는 경우, 첫 번째 인삿말 멘트를 동적으로 변경
        first_msg = st.session_state.chat_history[chat_key][0]
        if first_msg["role"] == "assistant":
            if is_en and first_msg["content"] == default_msg_ko:
                first_msg["content"] = default_msg_en
            elif not is_en and first_msg["content"] == default_msg_en:
                first_msg["content"] = default_msg_ko

    # 빠른 질문 리스트 (한국어 / 영어 맵)
    sug_map_ko = {
        "ladybug": [
            "🔴 등껍질 점은 어떤 역할을 하나요?",
            "🍃 주로 무엇을 먹고 사나요?",
            "✈️ 날개와 비행 능력은 어떤가요?",
            "❄️ 추운 겨울은 어떻게 보내나요?",
            "📅 수명은 얼마나 되나요?"
        ],
        "ant": [
            "💪 무거운 짐을 어떻게 들 수 있나요?",
            "🏢 땅속 개미집 구조는 어떤가요?",
            "📡 서로 어떻게 의사소통 하나요?",
            "💼 사회적 역할 분담은 어떻게 되나요?",
            "👑 여왕개미의 수명과 역할은 무엇인가요?"
        ],
        "butterfly": [
            "👅 몸의 어느 부위로 맛을 느끼나요?",
            "✨ 날개 가루는 어떤 역할을 하나요?",
            "🐛 한살이(번데기 과정 등)가 궁금해요.",
            "🍯 주로 무엇을 먹고 사나요?",
            "🍂 겨울나기와 수명은 어떻게 되나요?"
        ],
        "honeybee": [
            "💃 왜 8자 모양 춤을 추나요?",
            "🎯 침을 쏘면 왜 죽게 되나요?",
            "❄️ 추운 겨울을 어떻게 보내나요?",
            "🍎 자연과 우리에게 왜 중요한가요?",
            "👑 여왕벌, 일벌, 수벌은 무슨 일을 하나요?"
        ],
        "beetle": [
            "🪲 큰 뿔은 어떤 용도인가요?",
            "🍂 무엇을 먹고 자라나요?",
            "🌙 왜 주로 밤에 활동하나요?",
            "💪 힘은 얼마나 강력한가요?",
            "🐛 한살이 과정이 궁금해요."
        ],
        "dragonfly": [
            "🚁 어떻게 공중정지와 후진 비행을 하나요?",
            "👀 커다란 겹눈은 어떤 특징이 있나요?",
            "💧 아기(약충)는 어디서 어떻게 사나요?",
            "🦟 주로 어떤 먹이를 사냥하나요?",
            "🪽 날개 속에 숨겨진 비밀은 무엇인가요?"
        ],
        "grasshopper": [
            "🐸 어떻게 그렇게 높이 뛸 수 있나요?",
            "🎵 어떻게 노래(소리)를 내나요?",
            "🍃 몸의 색을 바꾸는 위장술이 있나요?",
            "🌾 무엇을 먹고 사나요?",
            "🦗 메뚜기 떼(황충)는 왜 생기나요?"
        ],
        "mantis": [
            "🙏 왜 기도하는 자세를 취하나요?",
            "🔄 머리를 어떻게 180도 돌릴 수 있나요?",
            "⚔️ 사냥용 앞다리는 어떻게 쓰나요?",
            "👁️ 특별한 눈(입체시)의 장점은 무엇인가요?",
            "🌿 자연 속에서 어떤 역할을 하나요?"
        ],
        "cicada": [
            "📢 어떻게 그렇게 우렁찬 소리를 내나요?",
            "⏳ 애벌레는 땅속에서 얼마나 사나요?",
            "👕 껍질을 벗고 나오는 과정이 궁금해요.",
            "🌳 나무에 해를 끼치며 무얼 먹나요?",
            "🎶 왜 수컷 매미만 노래를 부르나요?"
        ],
        "firefly": [
            "💡 어떻게 스스로 빛을 낼 수 있나요?",
            "❄️ 불빛이 왜 전혀 뜨겁지 않나요?",
            "✨ 빛을 반짝이는 주된 이유는 무엇인가요?",
            "🐌 아기(애벌레)는 무엇을 먹고 사나요?",
            "🧪 깨끗한 곳에서만 살 수 있는 이유는 무엇인가요?"
        ],
        "stagbeetle": [
            "🪵 머리에 달린 큰 턱은 무엇인가요?",
            "⚔️ 수컷 사슴벌레는 큰 턱으로 무얼 하나요?",
            "🍂 아기(굼벵이)는 나무 속에서 무얼 먹나요?",
            "⏳ 장수풍뎅이보다 수명이 긴가요?",
            "🌙 주로 밤에 무엇을 먹으러 다니나요?"
        ],
        "spider": [
            "🕷️ 다리가 8개인데 왜 곤충이 아닌가요?",
            "🕸️ 거미줄은 몸의 어디서 나오나요?",
            "⛓️ 거미줄은 정말 강철보다 질긴가요?",
            "🚶 끈적한 거미줄에 자기는 왜 안 붙나요?",
            "🦟 자연에서 해충을 잡는 고마운 역할이 무엇인가요?"
        ]
    }

    sug_map_en = {
        "ladybug": [
            "🔴 What is the role of the spots?",
            "🍃 What do they usually eat?",
            "✈️ How are their wings and flight?",
            "❄️ How do they spend the cold winter?",
            "📅 How long is their lifespan?"
        ],
        "ant": [
            "💪 How can they lift heavy things?",
            "🏢 What is the underground nest like?",
            "📡 How do they communicate?",
            "💼 How are their roles divided?",
            "👑 What is the queen's role and lifespan?"
        ],
        "butterfly": [
            "👅 Which body part tastes sweetness?",
            "✨ What is the role of wing powder?",
            "🐛 Tell me about their life cycle.",
            "🍯 What do they usually drink?",
            "🍂 How do they survive winter?"
        ],
        "honeybee": [
            "💃 Why do they do the waggle dance?",
            "🎯 Why do they die after stinging?",
            "❄️ How do they spend the winter?",
            "🍎 Why are they important to nature?",
            "👑 What are the roles in the hive?"
        ],
        "beetle": [
            "🪲 What is the big horn for?",
            "🍂 What do they eat to grow?",
            "🌙 Why are they active at night?",
            "💪 How strong is their power?",
            "🐛 What is their life cycle like?"
        ],
        "dragonfly": [
            "🚁 How do they hover and fly backward?",
            "👀 What are their compound eyes like?",
            "💧 Where and how do babies live?",
            "🦟 What prey do they hunt?",
            "🪽 What is the secret of their wings?"
        ],
        "grasshopper": [
            "🐸 How can they jump so high?",
            "🎵 How do they make sounds?",
            "🍃 Can they camouflage their color?",
            "🌾 What do they eat?",
            "🦗 Why do swarms of locusts form?"
        ],
        "mantis": [
            "🙏 Why do they pose like praying?",
            "🔄 How can they turn their heads 180°?",
            "⚔️ How do they use front legs?",
            "👁️ What is the benefit of 3D vision?",
            "🌿 What role do they play in nature?"
        ],
        "cicada": [
            "📢 How do they make such loud sounds?",
            "⏳ How long do nymphs live underground?",
            "👕 How do they emerge from their skins?",
            "🌳 What do they eat from trees?",
            "🎶 Why do only males sing?"
        ],
        "firefly": [
            "💡 How do they make their own light?",
            "❄️ Why is their light not hot?",
            "✨ What is the main reason for blinking?",
            "🐌 What do firefly larvae eat?",
            "🧪 Why can they only live in clean areas?"
        ],
        "stagbeetle": [
            "🪵 What is the big jaw on their head?",
            "⚔️ What do males do with their jaws?",
            "🍂 What do grubs eat inside wood?",
            "⏳ Do they live longer than beetles?",
            "🌙 Where do they look for sap at night?"
        ],
        "spider": [
            "🕷️ Why is a spider not an insect?",
            "🕸️ Where does spider silk come from?",
            "⛓️ Is spider silk stronger than steel?",
            "🚶 Why don't they stick to their web?",
            "🦟 What is their helpful pest-control role?"
        ]
    }

    sug_list = sug_map_en.get(chat_key, []) if is_en else sug_map_ko.get(chat_key, [])

    st.write("💡 Quick Questions / 빠른 질문:")
    s_cols = st.columns(5)
    for idx, s in enumerate(sug_list):
        with s_cols[idx]:
            if st.button(s, key=f"ai_sug_{idx}", use_container_width=True):
                process_chat(s, chat_key, bug, is_en)

    st.markdown("---")
    # 대화 이력 렌더링
    for msg in st.session_state.chat_history[chat_key]:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"].replace("\n", "<br>"), unsafe_allow_html=True)

def process_chat(question, chat_key, bug, is_en=False):
    st.session_state.chat_history[chat_key].append({"role": "user", "content": question})
    
    # 배지 획득 확인
    if "ai_explorer" not in user_data.get("unlocked_badges", []):
        check_and_award_badges("ai_explorer")

    api_key = user_data.get("gemini_api_key", "")
    
    if api_key:
        # 실시간 Gemini API 연동
        response_text = call_gemini_python(api_key, question, bug, is_en)
    else:
        # 로컬 모의 AI 대답
        response_text = get_mock_response_python(question, bug)

    st.session_state.chat_history[chat_key].append({"role": "assistant", "content": response_text})
    st.rerun()

def call_gemini_python(api_key, prompt, bug, is_en=False):
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # 언어 설정에 따른 프롬프트 지시문 분기
        if is_en:
            system_instruction = f"""
            You are a very friendly and kind insect expert AI for kids aged 7 to 10. Your name is "Dr. {bug['nameEn']}".
            Please answer in English! Use many cute emojis and a child-friendly tone like 'Oh!', 'Wow!', 'Indeed!'.
            Avoid complex scientific jargon and explain using simple analogies.
            
            [Mission]
            1. Solve the child's natural curiosity about '{bug['nameEn']}' in English.
            2. Keep the answer clear, sweet, and limited to 3-5 sentences.
            """
        else:
            system_instruction = f"""
            너는 7세~10세 어린이를 위한 아주 친절하고 상냥한 곤충 박사 AI야. 이름은 "{bug['nameKo']} 박사"이고 말투는 귀여운 이모티콘을 많이 섞어서 '~했어!', '~란다' 처럼 말해야 해.
            어린이 대상이므로 너무 어려운 전문 용어는 피하고 비유를 들어서 쉽게 설명해줘.
            
            [미션]
            1. 사용자가 질문하는 '{bug['nameEn']}({bug['nameKo']})'에 관한 자연과학적 호기심을 한글로 해결해준다.
            2. 만약 질문이 "새로운 이야기 만들어줘" 또는 "영어 동화 들려줘"와 같이 스토리와 관련되어 있다면, 3~4문장 분량의 아주 쉬운 영어 그림책 버전을 영문으로 창작해준다. 그리고 그 밑에 한글 해석을 덧붙여 준다.
            """
        response = model.generate_content(f"{system_instruction}\n\n사용자 질문: {prompt}")
        return response.text
    except Exception as e:
        return f"앗! AI 박사님과 인터넷 전화가 끊겼어 📞 (오류: {e}). 나중에 다시 질문해줄래?" if not is_en else f"Oops! I lost connection with the expert 📞 (Error: {e}). Could you try again later?"

def get_mock_response_python(question, bug):
    nameKo = bug["nameKo"]
    nameEn = bug["nameEn"]
    icon = bug["icon"]

    # 동화 생성 요청인 경우
    if "동화" in question or "이야기" in question or "story" in question or "Story" in question:
        return f"""📖 [오프라인 모의 {nameEn} 동화 이야기]<br><br>Once upon a time, a tiny {nameEn.lower()} named Happy lived in a big garden {icon}.<br>Every day, Happy sat on a green leaf and sang a sweet song.<br>"I am small, but I am strong!" Happy cheered.<br>The warm sun smiled down at the happy little friend ☀️.<br><br>*(옛날 옛적에, 해피라는 작은 {nameKo}가 큰 정원에 살고 있었습니다.<br>매일 해피는 초록 나뭇잎에 앉아 달콤한 노래를 불렀습니다.<br>"나는 작지만, 정말 힘이 세!" 해피는 기뻐했습니다.<br>따뜻한 태양이 행복한 작은 친구를 향해 미소 지었습니다.)*"""

    # 키워드별 대답 (12종 곤충 각각 5개 키워드로 확장 - 한글 및 영어 동시 대응)
    mock_db = {
        "ladybug": {
            "역할": "무당벌레 등껍질의 화려한 색과 검은 점들은 새 같은 무서운 적에게 '나를 먹으면 아주 맛이 없고 독이 있어!' 하고 경고하는 껍질 방패 역할을 한단다 🛑. 이를 '경고색'이라고 해!",
            "spots": "The bright red wings and black spots on a ladybug warn predators like birds that they taste terrible! 🛑 It acts like a protective shield.",
            "무엇을 먹고": "무당벌레는 주로 식물에 해를 끼치는 나쁜 '진딧물'을 먹고 살아 😋. 농부 삼촌들이 엄청 고마워하는 꼬마 의사 선생님 같은 곤충이야!",
            "eat": "Ladybugs love to eat tiny green insects called aphids. 😋 They protect plants from getting sick, making farmers very happy!",
            "비행": "무당벌레는 딱딱한 빨간 날개(딱지날개) 밑에 얇고 투명한 진짜 날개를 고이 접어 숨겨두었다가, 날아갈 때 활짝 펼쳐서 열심히 퍼덕이며 날아다녀 ✈️!",
            "wings": "Ladybugs have hard outer wings called elytra to protect their bodies, and soft inner wings underneath that fold out to fly! ✈️",
            "겨울": "추운 겨울이 오면 차가운 바람을 피해 돌 밑이나 마른 낙엽 아래에 수백 마리씩 옹기종기 모여 서로 체온을 나누며 겨울잠을 잔단다 ❄️.",
            "winter": "When winter comes, ladybugs gather in groups under rocks or logs to stay warm and sleep together until spring! ❄️",
            "수명": "무당벌레의 수명은 어른벌레가 된 후 평균 2~3달 정도 산단다. 하지만 늦가을에 태어나 겨울잠을 자는 무당벌레들은 1년 가까이 살기도 해 📅!",
            "lifespan": "A ladybug usually lives for 2 to 3 months as an adult, but those that hibernate in the winter can live up to a year! 📅"
        },
        "ant": {
            "무거운": "개미는 무척 작지만 몸집에 비해 근육이 엄청나게 발달해서 자기 몸무게보다 50배나 더 무거운 나뭇잎이나 먹이도 번쩍 들어올릴 수 있어 💪!",
            "lift": "Ants are super strong because their muscles are very powerful for their size. They can lift things that are 50 times heavier than them! 💪",
            "구조": "땅속 개미집은 여왕개미가 사는 방, 아기 방, 먹이 보관소, 심지어 쓰레기장까지 따로 나뉘어 있는 거대하고 복잡한 아파트와 같단다 🏢.",
            "nest": "An underground ant nest is like a giant apartment. 🏢 It has separate rooms for the queen, babies, food storage, and even trash!",
            "의사소통": "개미는 입이 아니라 더듬이로 냄새 물질(페로몬)을 주고받으며 '이쪽에 먹이가 있어!', '위험해!' 하고 대화를 나눈단다 📡.",
            "communicate": "Ants communicate by using their antennae to smell special chemical signals called pheromones. 📡 It's like sending text messages!",
            "분담": "개미 사회는 알을 낳는 여왕개미, 집을 지키는 병정개미, 먹이를 구해오고 집을 고치는 일개미로 완벽하게 역할을 나누어 일해 💼.",
            "roles": "Ants have clear jobs. The queen lays eggs, soldier ants guard the nest, and worker ants collect food and clean the home! 💼",
            "여왕개미": "여왕개미는 왕국을 세우고 평생 알을 낳는데, 수명이 무려 10년에서 길게는 30년까지 살기도 하는 엄청난 장수 곤충이란다 👑!",
            "queen": "The queen ant is the mother of the colony. She can live for 10 to 30 years, which is very long for an insect! 👑"
        },
        "butterfly": {
            "맛": "나비는 입이나 혀가 아니라 놀랍게도 다리 끝(발)로 맛을 느껴 🦶. 꽃 위에 사뿐히 앉아 발로 달콤한 꿀이 있는지 먼저 확인하는 거야!",
            "tastes": "Butterflies actually taste food with their feet! 🦶 When they land on a flower, they know instantly if it has sweet nectar.",
            "가루": "나비 날개 표면의 곱고 부드러운 가루는 비가 내릴 때 날개가 젖지 않도록 지켜주는 천연 방수 우산 역할을 한단다 ☔.",
            "powder": "The fine powder on butterfly wings is made of tiny scales. They act like a raincoat to keep the wings dry so they can fly! ☔",
            "한살이": "나비는 알에서 깨어나 열심히 나뭇잎을 먹는 애벌레가 되었다가, 딱딱한 번데기 속에서 몸을 아름다운 날개와 다리로 재탄생시키는 마법(변태)을 부려 🐛!",
            "cycle": "A butterfly starts as an egg, becomes a hungry caterpillar, sleeps in a hard chrysalis, and transforms into a beautiful butterfly! 🐛",
            "무엇을 먹고": "나비는 긴 빨대처럼 돌돌 말려 있는 입을 가지고 있어 🍯. 꽃 속에 입을 쏙 넣어서 달콤한 꽃꿀(네타)이나 과일 즙을 빨아먹는단다.",
            "drink": "Butterflies have a long, straw-like tongue called a proboscis. 🍯 They use it to sip sweet nectar from deep inside flowers.",
            "겨울나기": "나비 종류마다 겨울을 나는 방법이 달라. 번데기나 알 상태로 얼어붙지 않고 견디는 친구들도 있고, 네발나비처럼 어른 나비로 동굴에서 겨울을 나는 친구들도 있어 🍂.",
            "survive": "Some butterflies spend the winter as eggs or pupae, while others migrate long distances or hide in warm places to sleep! 🍂"
        },
        "honeybee": {
            "춤": "꿀벌은 맛있는 꽃밭을 찾으면 벌집으로 돌아와 엉덩이를 흔들며 8자 모양으로 날아 💃. 춤의 각도와 속도로 꽃이 있는 방향과 거리를 동료들에게 정확히 알려준단다.",
            "dance": "Honeybees perform a special 'waggle dance' in the shape of a figure-8 to tell other bees the exact direction and distance to flowers! 💃",
            "침": "꿀벌의 침은 내장과 연결되어 있어서 침을 쏘고 도망치면 침이 몸에서 빠져나가 스스로 죽게 된단다 😢. 그래서 아주 위험할 때만 쏘는 거야.",
            "stinging": "A honeybee's stinger is hooked to its internal organs. When it stings, the stinger pulls out, which sadly causes the bee to die. 😢",
            "겨울": "겨울이 되면 일벌들은 여왕벌을 중심으로 둥글게 뭉쳐 몸을 부르르 떨며 열을 내 🔥. 이 열로 벌집 안을 따뜻하게 유지하면서 미리 모아둔 꿀을 먹으며 견뎌.",
            "winter": "In winter, bees huddle together around the queen and vibrate their bodies to keep the hive warm while eating stored honey! ❄️",
            "자연": "꿀벌이 꽃가루를 여기저기 옮겨주어 식물들이 열매를 맺을 수 있어 🍎. 꿀벌이 없다면 우리가 먹는 사과나 딸기 같은 과일도 먹기 힘들어져!",
            "important": "Honeybees are crucial because they pollinate flowers, helping fruits and vegetables grow. Without them, we wouldn't have many foods! 🍎",
            "역할": "여왕벌은 오직 알을 낳고, 수벌은 번식을 도우며, 모든 일(집 짓기, 꿀 모으기, 애벌레 기르기)은 부지런한 여자 일벌들이 전부 해낸단다 💼.",
            "hive": "The queen lays eggs, male drones mate with the queen, and female worker bees do all the hard work like building nests and gathering honey! 👑"
        },
        "beetle": {
            "뿔": "장수풍뎅이 수컷의 멋진 Y자 뿔은 밥그릇(수액)을 두고 싸우거나 여자친구를 만날 때 라이벌 장수풍뎅이를 번쩍 들어 던지는 무기로 사용한단다 🪲!",
            "horn": "Male rhinoceros beetles use their big Y-shaped horns like shovels to wrestle and toss rival beetles off tree branches for food or mates! 🪲",
            "먹고 자라": "애벌레 때는 썩은 나뭇잎이 흙이 된 '발효톱밥'을 먹으며 뚱뚱해지고, 멋진 성충이 되면 달콤한 나무 수액이나 과일을 먹고 살아 🍂.",
            "eat": "Larvae eat decaying wood and leaves in the soil, while adult beetles enjoy drinking sweet, fermenting tree sap and eating ripe fruits! 🍂",
            "밤에": "장수풍뎅이는 낮에는 시원한 낙엽 밑이나 흙속에 꼭꼭 숨어서 자고, 천적(새 등)이 잠을 자는 캄캄한 밤이 되면 활발하게 날아다니는 야행성 곤충이야 🌙.",
            "active": "Rhinoceros beetles are nocturnal. They hide under soil or logs during the day and fly around at night when it is safer from predators! 🌙",
            "힘": "장수풍뎅이는 곤충 세계의 천하장사야! 자기 몸무게의 무려 800배가 넘는 물건도 번쩍 들어올릴 수 있는 엄청난 파워를 가졌단다 💪.",
            "strong": "Rhinoceros beetles are the weightlifters of the insect world! They can lift objects that are 850 times heavier than their own weight! 💪",
            "과정이": "알에서 꼬물꼬물 애벌레로 태어나 몇 번 껍질을 벗으며 무럭무럭 자란 뒤, 번데기 방을 짓고 한 달 동안 꾹 참았다가 멋진 뿔을 가진 어른으로 탄생해 🐛!",
            "cycle": "They start as eggs, grow into fat larvae (grubs), rest inside a pupal chamber, and finally hatch as strong adults with magnificent horns! 🐛"
        },
        "dragonfly": {
            "비행": "잠자리는 4개의 날개를 따로따로 움직일 수 있는 최고의 헬리콥터야 🚁. 하늘에 딱 멈춰 서 있거나(정지비행), 심지어 뒤로 날 수도 있지!",
            "hover": "Dragonflies can control their four wings independently. This allows them to fly forward, hover in the air, and even fly backward like a helicopter! 🚁",
            "겹눈": "머리에 달린 엄청나게 큰 두 눈은 사실 약 3만 개의 작은 눈이 뭉친 '겹눈'이야 👀. 아주 빠른 벌레의 움직임도 모두 지켜볼 수 있단다.",
            "eyes": "Their giant eyes are compound eyes, containing about 30,000 tiny lenses! 👀 They can see almost everything around them in 360 degrees.",
            "약충": "아기 잠자리는 물속에 살면서 올챙이나 모기 애벌레(장구벌레)를 잡아먹는 무시무시한 물속 사냥꾼(수서약충)이란다 💧.",
            "babies": "Baby dragonflies, called nymphs, live underwater for up to 2 years. They are fierce hunters that eat tadpoles and small fish! 💧",
            "사냥": "잠자리는 하늘을 날아다니며 파리, 모기, 나비 등을 날카로운 발로 바구니처럼 낚아채서 강력한 턱으로 냠냠 맛있게 먹어치워 🦟.",
            "hunt": "Dragonflies are skilled hunters. They catch flies, mosquitoes, and butterflies in mid-air using their legs like a basket! 🦟",
            "날개": "잠자리의 얇고 투명한 날개에는 미세한 그물망 같은 날개맥이 가득 차 있어 🪽. 이 날개맥 덕분에 날개가 꺾이지 않고 엄청 튼튼하단다.",
            "wings": "Dragonfly wings have complex nets of veins. These veins act like strong frames to keep the wings stiff and prevent them from breaking! 🪽"
        },
        "grasshopper": {
            "높이": "메뚜기는 엄청나게 길고 튼튼한 뒷다리를 가졌어 🐸. 뒷다리 속 근육에 에너지를 용수철처럼 꾹 모았다가 튕겨내면 자기 몸길이의 20배 넘게 날아오를 수 있어!",
            "jump": "Grasshoppers have powerful back legs. They store energy in their legs like a spring and launch themselves up to 20 times their body length! 🐸",
            "노래": "메뚜기는 목청이 아니라, 튼튼한 뒷다리를 날개 깃 가장자리에 대고 슥슥 비벼서 아름답고 맑은 마찰 소리(음악)를 만들어 낸단다 🎵.",
            "sounds": "Grasshoppers make a chirping sound by rubbing the ridges of their hind legs against their wings. 🎵 It's like playing a tiny violin!",
            "위장술": "메뚜기는 자신이 사는 주변 풀숲과 똑같은 초록색이나 흙과 닮은 갈색 옷으로 몸 색깔을 맞춰 천적들의 눈을 속이는 완벽한 보호색을 써 🍃!",
            "camouflage": "Grasshoppers use camouflage to blend in with green grass or brown dirt so that hungry frogs and birds cannot find them! 🍃",
            "무엇을 먹": "메뚜기는 풀잎이나 벼 잎 같은 초록색 식물을 갉아먹고 사는 100% 채식주의(초식) 곤충이란다 🌾.",
            "eat": "Grasshoppers are herbivores, meaning they eat leaves, grass, and crops with their strong chewing mouths. 🌾",
            "황충": "메뚜기들이 너무 좁은 곳에 바글바글 많이 모여 살면, 몸빛이 어둡게 변하고 엄청나게 큰 날개가 돋아나 떼를 지어 날아가며 곡식을 다 먹어버리는 무서운 메뚜기 떼(황충)가 된단다 🦗.",
            "swarms": "When grasshoppers crowd together, they can transform into locusts. They grow larger wings, change color, and fly in massive crop-eating swarms! 🦗"
        },
        "mantis": {
            "기도": "사마귀가 두 앞다리를 공손히 가슴에 모으고 있는 모습이 마치 기도하는 것처럼 보이지만, 사실은 다가오는 먹이를 언제든지 낚아채려고 잔뜩 긴장해서 준비 동작을 하고 있는 거란다 🙏!",
            "pose": "A praying mantis folds its front legs in a praying position to stay ready to strike and grab passing prey in a split second! 🙏",
            "180도": "사마귀는 유일하게 목뼈가 유연하게 움직이는 곤충이야 🔄. 고개를 양옆과 뒤쪽까지 180도 부드럽게 돌려 주변을 넓게 경계할 수 있지!",
            "180": "A mantis is the only insect that can turn its head 180 degrees! 🔄 This helps them look behind their shoulders to search for prey.",
            "사냥용": "사마귀의 앞다리는 낫처럼 안쪽으로 굽어 있고 날카로운 가시가 촘촘하게 돋아 있어 ⚔️. 한 번 잡은 먹이는 절대 빠져나가지 못하는 무시무시한 사냥 도구지.",
            "legs": "Their front legs are raptorial, meaning they are lined with sharp spines to grip and trap struggling insects tightly! ⚔️",
            "장점": "두 눈이 얼굴 양끝에 멀리 떨어져 있어서 사물과의 거리를 입체적이고 정확하게 잴 수 있는 뛰어난 '입체시(3D vision)' 능력을 갖추었어 👁️!",
            "vision": "Their wide-spaced compound eyes give them stereoscopic vision (3D vision) to measure the exact distance to their prey before striking! 👁️",
            "역할": "사마귀는 농작물을 갉아먹는 나쁜 벌레들을 닥치는 대로 잡아먹어 풀과 꽃을 건강하게 지켜주는 정원의 훌륭한 꼬마 청소부(생물학적 방제)란다 🌿.",
            "role": "Mantises eat pest insects like crickets and caterpillars, acting as natural protectors that keep garden plants healthy and green! 🌿"
        },
        "cicada": {
            "우렁찬": "수컷 매미는 배 안에 있는 진동막(tymbal)을 1초에 수백 번 넘게 부르르 떨고, 비어 있는 통통한 배로 소리를 크게 울려서 확성기처럼 우렁찬 노래를 부른단다 📢!",
            "loud": "Male cicadas vibrate special drum-like organs in their bellies called tymbals. Their hollow bellies amplify the sound like a speaker! 📢",
            "얼마나": "종류에 따라 다르지만 매미 애벌레는 캄캄한 땅속에서 보통 3년, 5년, 혹은 길게는 17년 동안 나무뿌리 즙을 먹으며 자란단다 ⏳.",
            "underground": "Cicada nymphs live underground for a very long time, usually 3, 5, or even 17 years, drinking sap from tree roots in the dark! ⏳",
            "나오는": "여름 밤이 되면 기어 나와 단단한 나무껍질에 매달려 등을 쫙 가르고 나와 👕. 젖은 날개를 밤새 바짝 말리고 아침이 되면 하늘로 힘차게 날아가!",
            "emerge": "On summer nights, nymphs climb up trees, crack open their old shells, and step out. They dry their soft wings and fly by morning! 👕",
            "나무에": "매미는 단단한 빨대 같은 입을 나무 껍질에 꽂아 영양분이 가득한 수액(물관부 즙)을 쪽쪽 빨아먹고 산단다 🌳.",
            "eat": "Cicadas use their straw-like mouths to pierce tree bark and drink sap from the tree's water-transporting tubes (xylem). 🌳",
            "수컷만": "매미 소리는 수컷이 암컷 매미에게 '나 여기 있어, 나랑 친구 하자!' 하고 사랑을 고백하기 위해 부르는 세레나데 노래이기 때문에 수컷만 부른단다 🎶.",
            "sing": "Only male cicadas sing. They make loud calls to attract female cicadas and say 'hello' to their mates during hot summer days! 🎶"
        },
        "firefly": {
            "빛": "반딧불이 꽁무니에는 빛을 내는 특수한 물질(루시페린)과 산소가 만나 화학 반응을 일으키는 빛 공장이 있어서 스스로 아름다운 빛을 만들어 낼 수 있어 💡!",
            "light": "Fireflies produce light in their tails through a chemical reaction between luciferin and oxygen. 💡 They make their own natural lanterns!",
            "뜨겁지": "보통 전구는 켜두면 뜨거워지지만, 반딧불이가 만드는 빛은 에너지가 열로 변하지 않고 100% 빛으로만 바뀌는 아주 효율적인 '차가운 빛(냉광)'이라서 몸이 뜨거워지지 않아 ❄️.",
            "hot": "Their light is highly efficient 'cold light,' meaning 100% of the energy becomes light, not heat, so their bodies never get burned! ❄️",
            "이유": "캄캄한 어둠 속에서 '나 여기 있어!' 하고 짝꿍을 찾거나, 무서운 적에게 '나는 맛이 없으니까 잡아먹지 마!' 하고 경고하기 위해 반짝인단다 ✨.",
            "blinking": "Fireflies blink their lights to talk to friends, find mates in the dark forest, and warn predators that they taste bad! ✨",
            "애벌레": "아기 반딧불이는 물가나 습한 땅에 살면서 아주 느린 다슬기나 달팽이 같은 조개류의 살을 녹여 먹으며 자라는 육식 사냥꾼이야 🐌.",
            "larvae": "Baby fireflies (larvae) live in wet soil and are active hunters. They eat slugs and snails by dissolving them! 🐌",
            "깨끗한": "반딧불이는 작은 불빛 공해에도 짝꿍을 찾지 못하고, 물과 공기가 오염되면 금방 사라지는 아주 민감한 곤충이라서 우리 자연이 깨끗하다는 것을 보여주는 보물 같은 친구야 🧪!",
            "clean": "Fireflies are very sensitive to light pollution and chemical sprays. They can only survive in clean, healthy environments! 🧪"
        },
        "stagbeetle": {
            "닮았나요": "수컷 사슴벌레의 머리에는 나뭇가지처럼 멋지게 뻗은 커다란 집게 턱이 달려 있어 🪵. 이 모습이 사슴의 뿔(antlers)을 쏙 빼닮아서 사슴벌레라고 불려!",
            "head": "Male stag beetles have massive jaws that look like deer antlers. 🪵 That is why they are called 'stag' beetles!",
            "집게": "큰 턱은 밥을 먹는 입이 아니라, 장수풍뎅이나 다른 사슴벌레 라이벌과 영역을 다투거나 싸울 때 서로의 몸통을 꽉 꼬집어 던져버리는 무기 역할을 해 ⚔️.",
            "jaws": "Their large jaws are not for eating. Males use them to pinch, lift, and throw rival beetles off trees during territorial fights! ⚔️",
            "나무 속": "사슴벌레 아기는 쓰러져 썩어가는 참나무 속에 살면서 단단한 이빨로 썩은 우드 파이버(나무 섬유질)를 갉아먹고 소화시키며 굼벵이로 자라나 🍂.",
            "wood": "Stag beetle grubs live inside rotting tree trunks, chewing on decaying wood fiber and recycling nutrients back into the forest soil! 🍂",
            "긴가요": "장수풍뎅이는 어른이 되면 1~3달밖에 못 살지만, 사슴벌레는 성충이 된 후 춥고 배고픈 겨울철에도 나무 속에서 겨울잠을 자며 보통 1년에서 3년까지 훨씬 오래 살 수 있어 ⏳!",
            "longer": "Stag beetles live much longer than rhinoceros beetles. They hibernate in winter and can live for 1 to 3 years as adults! ⏳",
            "수액": "밤이 되면 사슴벌레는 껍질이 갈라진 참나무 줄기 위로 기어올라가 흘러나오는 달콤하고 톡 쏘는 나무 수액을 입가의 솔 모양 브러시로 핥아먹어 🌙.",
            "sap": "At night, stag beetles climb oak trees to drink sweet tree sap using their brush-like mouths to lick the juice. 🌙"
        },
        "spider": {
            "아닌가요": "거미는 다리가 8개인데 왜 곤충이 아닌가요?",
            "insect": "Spiders have 2 body parts and 8 legs, while insects have 3 body parts and 6 legs. That's why spiders are arachnids, not insects! 🕷️",
            "어디서": "거미 똥구멍 부근에 있는 '실돌기(spinnerets)'라는 방직 공장에서 액체 상태의 단백질 실이 나와 🕸️. 공기 중에 닿는 순간 굳어서 튼튼한 거미줄이 되지.",
            "silk": "Spiders produce liquid silk from organs called spinnerets on their abdomen. It turns into solid thread when exposed to the air! 🕸️",
            "질긴가요": "거미줄은 겉보기엔 약해 보이지만 같은 두께의 철사(강철)보다 무려 5배나 강하고 신축성이 뛰어나서 웬만큼 큰 벌레가 부딪쳐도 끊어지지 않고 꽉 잡아두지 ⛓️.",
            "strong": "Spider silk is incredibly strong and elastic. Weight for weight, it is 5 times stronger than steel and doesn't break easily! ⛓️",
            "안 붙나요": "거미줄은 끈적끈적한 방울이 묻은 가로선과, 끈적이지 않는 세로선이 있어. 거미는 끈적이지 않는 세로선만 골라서 조심조심 발을 디디며 다닌단다 🚶.",
            "web": "Spiders only walk on the dry, non-sticky threads of their webs, and they have special oils on their feet to prevent sticking! 🚶",
            "고마운": "거미는 파리, 모기, 진딧물, 바퀴벌레 등 우리 인간을 귀찮게 하고 식물을 괴롭히는 온갖 해충들을 거미줄로 다 잡아먹어 주는 자연 최고의 수호신 역할을 해 🦟!",
            "control": "Spiders are helpful pest controllers. They capture annoying flies, mosquitoes, and cockroaches in their webs to keep our homes clean! 🦟"
        }
    }

    sub_db = mock_db.get(bug["id"], {})
    for k, v in sub_db.items():
        if k in question:
            return v
            
    return f"오! {nameKo}에 대한 좋은 질문이야 {icon}! 인터넷(Gemini API)에 연결되면 더 자세히 알려줄 수 있어. 숲속 곤충들은 참 신비롭단다!" if not is_en else f"Oh! That's a great question about the {nameEn} {icon}! Once connected to the internet (Gemini API), I can tell you more details. Insects in the forest are so mysterious!"

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
    st.markdown("## 👨‍👩‍👧 학부모 관리 대시보드 <span style='font-size:1rem; color:#000000; font-weight:normal;'>v1.1.1</span>", unsafe_allow_html=True)
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
