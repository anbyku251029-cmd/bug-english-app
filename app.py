import os
import streamlit as st
import streamlit.components.v1 as components

# 스트림릿 페이지 설정 (가로를 넓게 채우기 위해 wide 모드 사용)
st.set_page_config(
    page_title="Bug Read & Play - 곤충 영어 나라",
    page_icon="🌿",
    layout="wide"
)

# 타이틀 숨기기 및 기본 패딩 제거 (웹앱 화면을 꽉 채우기 위함)
st.markdown("""
    <style>
        .reportview-container .main .block-container {
            padding-top: 1rem;
            padding-bottom: 1rem;
        }
        #MainMenu {visibility: hidden;}
        footer {visibility: hidden;}
    </style>
""", unsafe_allow_html=True)

# 빌드된 dist/index.html이 있으면 우선 읽고, 없으면 루트의 index.html을 읽습니다.
html_path = "dist/index.html" if os.path.exists("dist/index.html") else "index.html"

try:
    with open(html_path, "r", encoding="utf-8") as f:
        html_code = f.read()
    
    # 스트림릿 화면에 HTML 삽입 (scroller=True 에서 발생할 수 있는 매개변수 에러 방지를 위해 scrolling=True 사용)
    components.html(html_code, height=900, scrolling=True)
    
except FileNotFoundError:
    st.error("HTML 파일을 찾을 수 없습니다. 프로젝트를 먼저 빌드(npm run build)하거나 index.html 위치를 확인해 주세요.")
