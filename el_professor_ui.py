import time
import requests
import streamlit as st

# === Constants ===
APP_TITLE = "El Professor"
APP_ICON = "👒"
LOGO_URL = "https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/light/anthropic.png"
API_URL = "http://localhost:8000/generate"  # Replace actual backend
TYPING_DELAY = 0.04  # seconds

# === Page Config ===
st.set_page_config(page_title=APP_TITLE, page_icon=APP_ICON, layout="wide")
st.logo(LOGO_URL)


# === Sidebar ===
def render_sidebar():
    with st.sidebar:
        st.header("Resources")
        st.markdown("📚 [AWS Documentation](https://docs.aws.amazon.com)")
        st.markdown("📘 [Terraform](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)")
        st.markdown("🐍 [Python](https://www.python.org/doc)")

        st.markdown("---")
        st.header("Chat Controls")
        if st.button("🧹 Clear Chat Session"):
            st.session_state.messages = []
            st.rerun()


# === Chat Functions ===
def display_chat_history():
    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])


def get_assistant_response(_prompt: str) -> str:
    try:
        res = requests.post(API_URL, json={"prompt": _prompt})
        res.raise_for_status()
        return res.json().get("response", "")
    except Exception as e:
        return f"❌ Error: {e}"


def stream_response(_response: str) -> str:
    output = ""
    placeholder = st.empty()
    for word in _response.split():
        output += word + " "
        placeholder.markdown(output + "▌")
        time.sleep(TYPING_DELAY)
    placeholder.markdown(output)
    return output


# === App State Init ===
if "messages" not in st.session_state:
    st.session_state.messages = []

# === Render ===
render_sidebar()
st.title(f"{APP_TITLE} {APP_ICON}")
display_chat_history()

# === User Input ===
if prompt := st.chat_input("Ask El Professor about..."):
    # User message
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Assistant response
    with st.chat_message("assistant"):
        response = get_assistant_response(prompt)
        final_response = stream_response(response)

    # Save assistant message
    st.session_state.messages.append({"role": "assistant", "content": final_response})
