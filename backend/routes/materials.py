from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime
from services.file_extractor import extract_text
from services.firebase_db import _save_document, _query_documents, _delete_document

materials_bp = Blueprint('materials', __name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@materials_bp.route('/upload', methods=['POST'])
def upload_material():
    user_id = request.form.get('user_id')
    title = request.form.get('title', 'Untitled Document')
    raw_text = request.form.get('text')
    material_id = str(uuid.uuid4())
    
    if not user_id:
        return jsonify({'error': 'User ID required'}), 401

    text_content = ""

    if 'file' in request.files and request.files['file'].filename != '':
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}_{filename}")
            file.save(filepath)
            text_content = extract_text(filepath, filename)
            os.remove(filepath)
        else:
            return jsonify({'error': 'Invalid file type. Allowed: pdf, docx, txt'}), 400
    elif raw_text:
        text_content = raw_text
    else:
        return jsonify({'error': 'No file or text provided'}), 400

    if not text_content:
        return jsonify({'error': 'Failed to extract text or text is empty'}), 400

    new_material = {
        'id': material_id,
        'user_id': user_id,
        'title': title,
        'content': text_content,
        'created_at': datetime.utcnow().isoformat()
    }
    
    _save_document('materials', material_id, new_material)
    
    return jsonify({
        'message': 'Material uploaded successfully',
        'material': new_material
    }), 201

@materials_bp.route('/<user_id>', methods=['GET'])
def get_materials(user_id):
    user_materials = _query_documents('materials', 'user_id', '==', user_id)
    user_materials.sort(key=lambda x: x['created_at'], reverse=True)
    
    # Don't send full content to the list view to save bandwidth
    summary_materials = [
        {
            'id': m['id'],
            'title': m['title'],
            'created_at': m['created_at']
        }
        for m in user_materials
    ]
    
    return jsonify({'materials': summary_materials}), 200

@materials_bp.route('/<material_id>', methods=['DELETE'])
def delete_material(material_id):
    _delete_document('materials', material_id)
    
    # Note: We should also delete associated summaries, flashcards, quizzes, etc.
    # In a full implementation, this could be handled by a cloud function or batch delete
    return jsonify({'message': 'Material deleted successfully'}), 200
