from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from services.firebase_db import _save_document, _query_documents
import uuid
# Note: In a real production app with Firebase Auth, we would verify Firebase tokens here.

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    users = _query_documents('users', 'email', '==', data['email'])
    if users:
        return jsonify({'error': 'User already exists'}), 400
        
    user_id = str(uuid.uuid4())
    new_user = {
        'id': user_id,
        'name': data['name'],
        'email': data['email'],
        'password': generate_password_hash(data['password'])
    }
    
    _save_document('users', user_id, new_user)
    
    return jsonify({
        'message': 'User registered successfully',
        'user': {'id': new_user['id'], 'name': new_user['name'], 'email': new_user['email']}
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400
        
    users = _query_documents('users', 'email', '==', data['email'])
    if not users:
        return jsonify({'error': 'Invalid credentials'}), 401
        
    user = users[0]
    if not check_password_hash(user['password'], data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
        
    return jsonify({'message': 'Login successful', 'user': user}), 200
