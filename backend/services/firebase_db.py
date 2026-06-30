from firebase_admin import firestore

def get_db():
    return firestore.client()

def _save_document(collection_name, doc_id, data):
    db = get_db()
    db.collection(collection_name).document(doc_id).set(data)
    return data

def _get_document(collection_name, doc_id):
    db = get_db()
    doc = db.collection(collection_name).document(doc_id).get()
    if doc.exists:
        return doc.to_dict()
    return None

def _delete_document(collection_name, doc_id):
    db = get_db()
    db.collection(collection_name).document(doc_id).delete()
    return True

def _query_documents(collection_name, field, operator, value):
    db = get_db()
    docs = db.collection(collection_name).where(field, operator, value).stream()
    return [doc.to_dict() for doc in docs]

def _get_all_documents(collection_name):
    db = get_db()
    docs = db.collection(collection_name).stream()
    return [doc.to_dict() for doc in docs]
