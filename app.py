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

# 빌드 파일(dist/index.html) 존재 여부 검사
html_path = "dist/index.html"

if not os.path.exists(html_path):
    st.warning("⚠️ 빌드 완료 파일(dist/index.html)을 찾을 수 없습니다!")
    st.markdown("""
    ### 💡 해결 방법 (How to Fix)
    Streamlit Cloud는 파이썬(Python) 호스팅 서버이므로 Node.js 컴파일 과정(`npm run build`)을 자동으로 수행하지 않습니다. 
    따라서 로컬 컴퓨터에서 웹앱을 빌드한 후, 생성된 **`dist` 폴더를 GitHub에 업로드**해야 합니다.
    
    아래 순서대로 터미널 명령어를 실행해 주세요:
    
    1. **로컬 컴퓨터 터미널**에서 빌드 실행:
       ```bash
       npm run build
       ```
       *(실행하면 `dist` 폴더 안에 모든 파일이 합쳐진 단 하나의 `index.html`이 생성됩니다.)*
       
    2. 생성된 **`dist` 폴더**를 Git에 추가하여 GitHub에 업로드(Push):
       ```bash
       git add dist
       git commit -m "배포용 빌드 파일 추가"
       git push
       ```
       *(만약 `.gitignore` 파일에 `dist`가 등록되어 있다면 지워주시거나 `git add -f dist`로 강제 추가해 주세요.)*
       
    3. 업로드 완료 후, 본 Streamlit 페이지를 새로고침(F5) 해주세요!
    """)
else:
    try:
        with open(html_path, "r", encoding="utf-8") as f:
            html_code = f.read()
        
        # 스트림릿 화면에 빌드된 단일 HTML 삽입
        components.html(html_code, height=900, scrolling=True)
    except Exception as e:
        st.error(f"HTML 파일을 읽는 도중 오류가 발생했습니다: {e}")
