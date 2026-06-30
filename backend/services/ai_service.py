from openai import OpenAI
from config import Config
import json

client = OpenAI(
    api_key=Config.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
) if Config.GROQ_API_KEY else None

def _call_groq(prompt, system_message="You are a helpful AI assistant."):
    if not client:
        return {"error": "Groq API key not configured."}
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        return {"error": str(e)}

def generate_summary(text):
    prompt = f"Please generate a summary, important concepts, definitions, examples, key points, and revision notes for the following text. Output in Markdown format:\n\n{text}"
    return _call_groq(prompt, "You are an expert tutor. Create a detailed study summary.")

def _parse_json(text):
    text = text.strip()
    if text.startswith('```json'):
        text = text[7:]
    elif text.startswith('```'):
        text = text[3:]
    if text.endswith('```'):
        text = text[:-3]
    return json.loads(text.strip())

def generate_flashcards(text):
    prompt = f"Generate 5 flashcards based on this text. Output as a JSON array with objects containing 'front' (the question), 'back' (the answer), 'topic', and 'difficulty' (easy, medium, hard). DO NOT wrap in markdown code blocks, just return raw JSON.\n\nText: {text}"
    result = _call_groq(prompt, "You are a flashcard generator. Output only valid JSON.")
    try:
         if isinstance(result, dict) and "error" in result:
             return result
         return _parse_json(result)
    except:
         return {"error": "Failed to parse JSON from AI response."}

def generate_quiz(text, num_questions=5):
    prompt = f"Generate a {num_questions}-question multiple choice quiz based on this text. Output as a JSON array with objects containing 'question', 'options' (array of 4 strings), 'answer' (string matching one option), and 'explanation'. DO NOT wrap in markdown code blocks, just return raw JSON.\n\nText: {text}"
    result = _call_groq(prompt, "You are a quiz generator. Output only valid JSON.")
    try:
         if isinstance(result, dict) and "error" in result:
             return result
         return _parse_json(result)
    except:
         return {"error": "Failed to parse JSON from AI response."}

def generate_study_schedule(text, days=3):
    prompt = f"Create a personalized {days}-day study plan based on the following text. Include dates (Day 1, Day 2, etc.), topics to cover, estimated time, and breaks. Output in Markdown format:\n\n{text}"
    return _call_groq(prompt, "You are an expert tutor. Create a detailed and actionable study schedule.")
