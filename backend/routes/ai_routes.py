from flask import Blueprint, request, jsonify
from services.firebase_db import _save_document, _query_documents, _get_document
from services.ai_service import generate_summary, generate_flashcards, generate_quiz, generate_study_schedule
import uuid
from datetime import datetime

ai_bp = Blueprint('ai', __name__)

def get_material(material_id):
    return _get_document('materials', material_id)

@ai_bp.route('/summary', methods=['POST'])
def create_summary():
    data = request.json
    material_id = data.get('material_id')
    user_id = data.get('user_id')
    
    if not material_id or not user_id:
        return jsonify({'error': 'Material ID and User ID required'}), 400
        
    material = get_material(material_id)
    if not material:
        return jsonify({'error': 'Material not found'}), 404
        
    # Generate summary using Groq
    summary_text = generate_summary(material['content'])
    if isinstance(summary_text, dict) and 'error' in summary_text:
        return jsonify({'error': summary_text['error']}), 500
        
    summary_id = str(uuid.uuid4())
    new_summary = {
        'id': summary_id,
        'material_id': material_id,
        'user_id': user_id,
        'content': summary_text,
        'created_at': datetime.utcnow().isoformat()
    }
    
    _save_document('summaries', summary_id, new_summary)
    
    return jsonify({'message': 'Summary generated', 'summary': new_summary}), 201

@ai_bp.route('/flashcards', methods=['POST'])
def create_flashcards():
    data = request.json
    material_id = data.get('material_id')
    user_id = data.get('user_id')
    
    if not material_id or not user_id:
        return jsonify({'error': 'Material ID and User ID required'}), 400
        
    material = get_material(material_id)
    if not material:
        return jsonify({'error': 'Material not found'}), 404
        
    # Generate flashcards using Groq
    flashcards_data = generate_flashcards(material['content'])
    if isinstance(flashcards_data, dict) and 'error' in flashcards_data:
        return jsonify({'error': flashcards_data['error']}), 500
        
    flashcard_id = str(uuid.uuid4())
    new_flashcard_set = {
        'id': flashcard_id,
        'material_id': material_id,
        'user_id': user_id,
        'cards': flashcards_data,
        'created_at': datetime.utcnow().isoformat()
    }
    
    _save_document('flashcards', flashcard_id, new_flashcard_set)
    
    return jsonify({'message': 'Flashcards generated', 'flashcardSet': new_flashcard_set}), 201

@ai_bp.route('/quiz', methods=['POST'])
def create_quiz():
    data = request.json
    material_id = data.get('material_id')
    user_id = data.get('user_id')
    
    if not material_id or not user_id:
        return jsonify({'error': 'Material ID and User ID required'}), 400
        
    material = get_material(material_id)
    if not material:
        return jsonify({'error': 'Material not found'}), 404
        
    quiz_data = generate_quiz(material['content'])
    if isinstance(quiz_data, dict) and 'error' in quiz_data:
        return jsonify({'error': quiz_data['error']}), 500
        
    quiz_id = str(uuid.uuid4())
    new_quiz = {
        'id': quiz_id,
        'material_id': material_id,
        'user_id': user_id,
        'questions': quiz_data,
        'created_at': datetime.utcnow().isoformat()
    }
    
    _save_document('quizzes', quiz_id, new_quiz)
    
    return jsonify({'message': 'Quiz generated', 'quiz': new_quiz}), 201

@ai_bp.route('/schedule', methods=['POST'])
def create_schedule():
    data = request.json
    material_id = data.get('material_id')
    user_id = data.get('user_id')
    
    if not material_id or not user_id:
        return jsonify({'error': 'Material ID and User ID required'}), 400
        
    material = get_material(material_id)
    if not material:
        return jsonify({'error': 'Material not found'}), 404
        
    schedule_text = generate_study_schedule(material['content'])
    if isinstance(schedule_text, dict) and 'error' in schedule_text:
        return jsonify({'error': schedule_text['error']}), 500
        
    schedule_id = str(uuid.uuid4())
    new_schedule = {
        'id': schedule_id,
        'material_id': material_id,
        'user_id': user_id,
        'content': schedule_text,
        'created_at': datetime.utcnow().isoformat()
    }
    
    _save_document('schedules', schedule_id, new_schedule)
    
    return jsonify({'message': 'Schedule generated', 'schedule': new_schedule}), 201

@ai_bp.route('/summary/<material_id>', methods=['GET'])
def get_summary(material_id):
    summaries = _query_documents('summaries', 'material_id', '==', material_id)
    if not summaries:
        return jsonify({'summary': None}), 200
        
    summaries.sort(key=lambda x: x['created_at'], reverse=True)
    return jsonify({'summary': summaries[0]}), 200

@ai_bp.route('/flashcards/<material_id>', methods=['GET'])
def get_flashcards(material_id):
    flashcards = _query_documents('flashcards', 'material_id', '==', material_id)
    if not flashcards:
        return jsonify({'flashcardSet': None}), 200
        
    flashcards.sort(key=lambda x: x['created_at'], reverse=True)
    return jsonify({'flashcardSet': flashcards[0]}), 200

@ai_bp.route('/quiz/<material_id>', methods=['GET'])
def get_quiz(material_id):
    quizzes = _query_documents('quizzes', 'material_id', '==', material_id)
    if not quizzes:
        return jsonify({'quiz': None}), 200
        
    quizzes.sort(key=lambda x: x['created_at'], reverse=True)
    return jsonify({'quiz': quizzes[0]}), 200

@ai_bp.route('/schedule/<material_id>', methods=['GET'])
def get_schedule(material_id):
    schedules = _query_documents('schedules', 'material_id', '==', material_id)
    if not schedules:
        return jsonify({'schedule': None}), 200
        
    schedules.sort(key=lambda x: x['created_at'], reverse=True)
    return jsonify({'schedule': schedules[0]}), 200
