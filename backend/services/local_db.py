import json
import os
import uuid
import hashlib

DB_DIR = 'local_data'

def _get_db_path(collection):
    return os.path.join(DB_DIR, f"{collection}.json")

def _load_collection(collection):
    path = _get_db_path(collection)
    if not os.path.exists(path):
        return []
    with open(path, 'r') as f:
        return json.load(f)

def _save_collection(collection, data):
    os.makedirs(DB_DIR, exist_ok=True)
    path = _get_db_path(collection)
    with open(path, 'w') as f:
        json.dump(data, f, indent=4)

def add_user(email, password, name):
    users = _load_collection('users')
    if any(u['email'] == email for u in users):
        return None # User exists
    
    user_id = str(uuid.uuid4())
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    
    new_user = {
        'id': user_id,
        'email': email,
        'password': hashed_password,
        'name': name
    }
    
    users.append(new_user)
    _save_collection('users', users)
    
    # Don't return password
    return { 'id': user_id, 'email': email, 'name': name }

def verify_user(email, password):
    users = _load_collection('users')
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    
    for u in users:
        if u['email'] == email and u['password'] == hashed_password:
             return { 'id': u['id'], 'email': u['email'], 'name': u.get('name', '') }
    return None
