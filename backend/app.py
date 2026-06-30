from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config
import firebase_admin
from firebase_admin import credentials, firestore
import json
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    # Initialize Firebase if credentials exist
    try:
        cred_path = os.path.join(os.path.dirname(__file__), 'firebase_credentials.json')
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            print("Firebase Connected Successfully")
        else:
            print("WARNING: firebase_credentials.json not found in backend directory!")
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

    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "healthy", "storage": "local" if app.config['USE_LOCAL_STORAGE'] else "firebase"}), 200

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
