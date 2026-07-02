from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime
from services.file_extractor import extract_text
from services.firebase_db import _save_document, _query_documents, _delete_document, _get_document
from services.auth_service import token_required

materials_bp = Blueprint('materials', __name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@materials_bp.route('/upload', methods=['POST'])
@token_required
def upload_material():
    user_id = request.user_id  # Extract securely from JWT instead of trusting form data
    title = request.form.get('title', 'Untitled Document')
    raw_text = request.form.get('text')
    material_id = str(uuid.uuid4())
    
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
            return jsonify({'success': False, 'message': 'Invalid file type. Allowed: pdf, docx, txt'}), 400
    elif raw_text:
        text_content = raw_text
    else:
        return jsonify({'success': False, 'message': 'No file or text provided'}), 400

    if not text_content:
        return jsonify({'success': False, 'message': 'Failed to extract text or text is empty'}), 400

    new_material = {
        'id': material_id,
        'user_id': user_id,
        'title': title,
        'content': text_content,
        'created_at': datetime.utcnow().isoformat()
    }
    
    try:
        _save_document('materials', material_id, new_material)
    except Exception as e:
        print(f"Firestore save error: {e}")
        return jsonify({'success': False, 'message': 'Database save error'}), 500
    
    return jsonify({
        'success': True,
        'message': 'Material uploaded successfully',
        'material': {
            'id': new_material['id'],
            'title': new_material['title'],
            'created_at': new_material['created_at']
        }
    }), 201

@materials_bp.route('/<user_id>', methods=['GET'])
@token_required
def get_materials(user_id):
    if user_id != request.user_id:
        return jsonify({'success': False, 'message': 'Unauthorized user access'}), 401

    try:
        user_materials = _query_documents('materials', 'user_id', '==', user_id)
        user_materials.sort(key=lambda x: x['created_at'], reverse=True)
    except Exception as e:
        print(f"Firestore query error: {e}")
        return jsonify({'success': False, 'message': 'Database query error'}), 500
    
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
@token_required
def delete_material(material_id):
    try:
        material = _get_document('materials', material_id)
    except Exception as e:
        print(f"Firestore fetch error: {e}")
        return jsonify({'success': False, 'message': 'Database fetch error'}), 500

    if not material:
        return jsonify({'success': False, 'message': 'Material not found'}), 404

    if material.get('user_id') != request.user_id:
        return jsonify({'success': False, 'message': 'Unauthorized user access'}), 401

    try:
        _delete_document('materials', material_id)
    except Exception as e:
        print(f"Firestore delete error: {e}")
        return jsonify({'success': False, 'message': 'Database delete error'}), 500
    
    return jsonify({'success': True, 'message': 'Material deleted successfully'}), 200
