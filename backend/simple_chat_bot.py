import os
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, START, END, MessagesState
from langchain_core.messages import HumanMessage, AIMessage

# ---------------------------
# Setup Gemini (via LangChain wrapper)
# ---------------------------
load_dotenv()  # loads variables from .env
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("API key not found! Did you set GOOGLE_API_KEY in .env?")

gemini_model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    api_key=api_key
)

# ---------------------------
# Node Functions
# ---------------------------
def gemini_node(state: MessagesState):
    """Send conversation to Gemini and get AIMessage."""
    response = gemini_model.invoke(state["messages"])
    bot_reply = response.content
    state["messages"].append(AIMessage(content=bot_reply))
    return state

# ---------------------------
# Build LangGraph
# ---------------------------
graph = StateGraph(MessagesState)
graph.add_node("gemini", gemini_node)
graph.add_edge(START, "gemini")
graph.add_edge("gemini", END)

app_graph = graph.compile()

# ---------------------------
# FastAPI setup
# ---------------------------
api_app = FastAPI()
# add this to your backend file (e.g., main.py) after `api_app = FastAPI()`
from fastapi.middleware.cors import CORSMiddleware

# During development use the exact origin of your frontend (Vite default: http://localhost:5173).
origins = [
    "http://localhost:5173",  # Vite dev server
    # "http://localhost:3000", # uncomment if using CRA
    # "http://127.0.0.1:5173",
]

api_app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   # or ["*"] for quick dev testing (less secure)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Keep a global chat state (stateful conversation)
chat_state = MessagesState(messages=[])

# Request body model
class ChatRequest(BaseModel):
    message: str

@api_app.post("/chat/")
async def chat(req: ChatRequest):
    global chat_state

    # Append new user message
    chat_state["messages"].append(HumanMessage(content=req.message))

    # Pass through LangGraph
    chat_state = app_graph.invoke(chat_state)

    # Last message is always the bot's reply
    bot_reply = chat_state["messages"][-1].content

    return {"response": bot_reply}

