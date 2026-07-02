from functools import wraps
from flask import request, jsonify
import jwt
import datetime
import os

SECRET_KEY = os.environ.get("SECRET_KEY", "studyai-super-secret-production-key-12345")

def generate_token(user_id):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
        'iat': datetime.datetime.utcnow(),
        'sub': user_id
    }
    # Standard PyJWT encode returns string in newer versions, handles bytes decode in older
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        
        if not token:
            print("[Auth Error] Missing Authorization token")
            return jsonify({
                "success": False,
                "message": "Missing Authorization token"
            }), 401
            
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            request.user_id = payload['sub']
        except jwt.ExpiredSignatureError:
            print("[Auth Error] Token has expired")
            return jsonify({
                "success": False,
                "message": "Invalid or expired token"
            }), 401
        except jwt.InvalidTokenError:
            print("[Auth Error] Invalid token")
            return jsonify({
                "success": False,
                "message": "Invalid or expired token"
            }), 401
            
        return f(*args, **kwargs)
    return decorated
