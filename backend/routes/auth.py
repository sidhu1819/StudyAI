from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from services.firebase_db import _save_document, _query_documents
from services.auth_service import generate_token
import uuid

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    print(f"[Register Request] Data: {data}")

    if not data:
        return jsonify({'success': False, 'message': 'Request body is required'}), 400

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name:
        return jsonify({'success': False, 'message': 'Name is required'}), 400
    if not email:
        return jsonify({'success': False, 'message': 'Email is required'}), 400
    if not password:
        return jsonify({'success': False, 'message': 'Password is required'}), 400

    try:
        users = _query_documents('users', 'email', '==', email)
        if users:
            return jsonify({'success': False, 'message': 'User already exists'}), 400
    except Exception as e:
        print(f"Database query error during registration: {e}")
        pass

    user_id = str(uuid.uuid4())
    new_user = {
        'id': user_id,
        'name': name,
        'email': email,
        'password': generate_password_hash(password)
    }

    try:
        _save_document('users', user_id, new_user)
    except Exception as e:
        print(f"Database save error during registration: {e}")

    token = generate_token(user_id)
    return jsonify({
        'success': True,
        'message': 'User registered successfully',
        'token': token,
        'user': {'id': new_user['id'], 'name': new_user['name'], 'email': new_user['email']}
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    print(f"[Login Request] Data: {data}")

    if not data:
        return jsonify({'success': False, 'message': 'Request body is required'}), 400

    email = data.get('email')
    password = data.get('password')

    if not email:
        return jsonify({'success': False, 'message': 'Email is required'}), 400
    if not password:
        return jsonify({'success': False, 'message': 'Password is required'}), 400

    try:
        users = _query_documents('users', 'email', '==', email)
    except Exception as e:
        print(f"Database query error during login: {e}")
        return jsonify({'success': False, 'message': 'Database connection error'}), 500

    if not users:
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

    user = users[0]
    if not check_password_hash(user['password'], password):
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

    token = generate_token(user['id'])
    return jsonify({
        'success': True,
        'message': 'Login successful',
        'token': token,
        'user': {'id': user['id'], 'name': user['name'], 'email': user['email']}
    }), 200
