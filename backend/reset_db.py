import os
import firebase_admin
from firebase_admin import credentials, firestore

def reset_database():
    local_cred_path = os.path.join(os.path.dirname(__file__), 'firebase_credentials.json')
    
    if os.path.exists(local_cred_path):
        cred = credentials.Certificate(local_cred_path)
        try:
            firebase_admin.initialize_app(cred)
        except ValueError:
            # Already initialized
            pass
            
        db = firestore.client()
        
        collections = [
            'users', 
            'materials', 
            'summaries', 
            'flashcards', 
            'quizzes', 
            'schedules', 
            'analytics', 
            'notifications', 
            'settings'
        ]
        
        print("Starting Firebase Firestore Reset...")
        for coll_name in collections:
            coll_ref = db.collection(coll_name)
            docs = coll_ref.stream()
            count = 0
            for doc in docs:
                doc.reference.delete()
                count += 1
            print(f"Deleted {count} documents from collection '{coll_name}'")
            
        print("Firebase Firestore Reset Complete!")
    else:
        print("ERROR: firebase_credentials.json not found locally. Skipping Firestore delete.")

if __name__ == '__main__':
    reset_database()
