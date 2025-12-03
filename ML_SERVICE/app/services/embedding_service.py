import os
import json
import time
from pinecone import Pinecone, ServerlessSpec
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "medical-terminology"
MODEL_NAME = "all-mpnet-base-v2" # 768-dimensional, high quality, runs locally

# Go up 3 levels from app/services/embedding_service.py to ML_SERVICE
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DATA_FILE = os.path.join(BASE_DIR, 'data', 'unified_medical_corpus.jsonl')

# Initialize Clients
pc = Pinecone(api_key=PINECONE_API_KEY)

print(f"Loading local model '{MODEL_NAME}'... (This may take a moment)")
model = SentenceTransformer(MODEL_NAME)

def setup_pinecone_index():
    """Create Pinecone index if it doesn't exist"""
    print(f"Checking Pinecone index '{INDEX_NAME}'...")
    
    existing_indexes = [index.name for index in pc.list_indexes()]
    
    if INDEX_NAME not in existing_indexes:
        print(f"Creating new index '{INDEX_NAME}'...")
        pc.create_index(
            name=INDEX_NAME,
            dimension=768, # all-mpnet-base-v2 is 768 dims
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region="us-east-1"
            )
        )
        print("Index created successfully.")
    else:
        print("Index already exists.")
        
    return pc.Index(INDEX_NAME)

def process_and_upload():
    """Read data, generate embeddings locally, and upload to Pinecone"""
    index = setup_pinecone_index()
    
    print(f"Reading data from {DATA_FILE}...")
    if not os.path.exists(DATA_FILE):
        print(f"❌ Error: Data file not found at {DATA_FILE}")
        return

    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        records = [json.loads(line) for line in f]
        
    print(f"Found {len(records)} records. Starting processing...")
    
    BATCH_SIZE = 100 # Larger batch size since we are running locally
    
    total_batches = (len(records) + BATCH_SIZE - 1) // BATCH_SIZE
    
    for i in range(0, len(records), BATCH_SIZE):
        batch_records = records[i:i+BATCH_SIZE]
        batch_texts = []
        
        for record in batch_records:
            # Create rich text representation
            text = f"{record['primary_term']}. {record['definition']}. {record['synonyms']}"
            batch_texts.append(text)
            
        print(f"Processing Batch {i//BATCH_SIZE + 1}/{total_batches}...")
        
        # Generate embeddings locally
        try:
            embeddings = model.encode(batch_texts)
            # embeddings is a numpy array, convert to list
            embeddings = embeddings.tolist()
            
            vectors_to_upload = []
            for j, embedding in enumerate(embeddings):
                record = batch_records[j]
                vector = {
                    "id": record['id'],
                    "values": embedding,
                    "metadata": {
                        "code": record['code'],
                        "source": record['source'],
                        "primary_term": record['primary_term'],
                        "definition": record['definition'][:1000] if record['definition'] else "",
                        "synonyms": record['synonyms'][:1000] if record['synonyms'] else "",
                        "category": record['category']
                    }
                }
                vectors_to_upload.append(vector)
            
            # Upload to Pinecone
            index.upsert(vectors=vectors_to_upload)
            print(f"✅ Uploaded {len(vectors_to_upload)} vectors.")
            
        except Exception as e:
            print(f"❌ Error processing batch: {e}")
            
    print("✅ All processing complete!")

if __name__ == "__main__":
    if not PINECONE_API_KEY:
        print("❌ Error: Missing PINECONE_API_KEY in .env file")
    else:
        process_and_upload()
