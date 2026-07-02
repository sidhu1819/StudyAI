from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config
import firebase_admin
from firebase_admin import credentials, firestore
import json
import os
import sys

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configure CORS for production and development
    CORS(app)

    # Initialize Firebase if credentials exist
    try:
        local_cred_path = os.path.join(os.path.dirname(__file__), 'firebase_credentials.json')
        render_cred_path = '/etc/secrets/firebase_credentials.json'
        
        if os.path.exists(local_cred_path):
            cred = credentials.Certificate(local_cred_path)
            firebase_admin.initialize_app(cred)
            print("Firebase Connected Successfully (Local)")
        elif os.path.exists(render_cred_path):
            cred = credentials.Certificate(render_cred_path)
            firebase_admin.initialize_app(cred)
            print("Firebase Connected Successfully (Render)")
        else:
            print("ERROR: firebase_credentials.json not found in backend directory or /etc/secrets!")
            print("Meaningful Startup Error: Firebase credentials are required for the application to function properly.")
    except ValueError:
        # App already initialized
        print("Firebase Connected Successfully")
    except Exception as e:
        print(f"Error initializing Firebase: {e}")
        os.makedirs('local_data', exist_ok=True)
        app.db = None # We will use file I/O instead of firestore

    from routes.auth import auth_bp
    from routes.materials import materials_bp
    from routes.ai_routes import ai_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(materials_bp, url_prefix='/api/materials')
    app.register_blueprint(ai_bp, url_prefix='/api')

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "ok",
            "message": "StudyAI API is running"
        }), 200

    return app

# Expose app object for gunicorn (Required for Render Start Command: gunicorn app:app)
app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    
    # Disable debug mode in production (e.g., if RENDER env var is present)
    is_development = os.environ.get("RENDER") is None
    
    # Bind to 0.0.0.0 for Render deployments to avoid port binding errors
    app.run(host="0.0.0.0", port=port, debug=is_development)
