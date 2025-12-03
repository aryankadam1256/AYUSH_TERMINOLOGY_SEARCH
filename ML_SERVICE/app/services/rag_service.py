import os
from pinecone import Pinecone
from sentence_transformers import SentenceTransformer
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
HF_API_KEY = os.getenv("HF_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = "medical-terminology"
EMBEDDING_MODEL = "all-mpnet-base-v2"
GENERATION_MODEL = "mistralai/Mistral-7B-Instruct-v0.2"

# Initialize Clients
pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)

print(f"Loading local embedding model '{EMBEDDING_MODEL}'...")
embed_model = SentenceTransformer(EMBEDDING_MODEL)

print(f"Initializing Hugging Face Client with model '{GENERATION_MODEL}'...")
hf_client = InferenceClient(model=GENERATION_MODEL, token=HF_API_KEY)

def get_embedding(text):
    """Generate embedding using local model"""
    return embed_model.encode(text).tolist()

def expand_query(query):
    """Expand query with Ayurvedic terms using LLM"""
    messages = [
        {
            "role": "user",
            "content": f"Provide 3-5 Ayurvedic or medical synonyms for the term '{query}'. Return ONLY the terms separated by spaces. Example: 'fever' -> 'jvara pitta hyperthermia'"
        }
    ]
    try:
        response = hf_client.chat_completion(messages, max_tokens=50)
        expanded = response.choices[0].message.content.strip()
        # Remove quotes if present
        expanded = expanded.replace('"', '').replace("'", "")
        print(f"Expanded query: {query} -> {expanded}")
        return f"{query} {expanded}"
    except Exception:
        return query

def retrieve_context(query, top_k=10):
    """Search Pinecone for similar documents and return structured data"""
    # Expand query for better recall
    search_query = expand_query(query)
    query_vector = get_embedding(search_query)
    
    results = index.query(
        vector=query_vector,
        top_k=top_k,
        include_metadata=True
    )
    
    structured_results = []
    for match in results['matches']:
        meta = match['metadata']
        structured_results.append({
            "code": meta.get('code'),
            "primary_term": meta.get('primary_term'),
            "definition": meta.get('definition'),
            "source": meta.get('source'),
            "synonyms": meta.get('synonyms'),
            "score": match['score']
        })
        
    return structured_results

def format_context_for_llm(structured_results):
    """Convert structured results to string for LLM prompt"""
    contexts = []
    for item in structured_results:
        context_text = f"Term: {item['primary_term']}\n" \
                       f"Code: {item['code']}\n" \
                       f"Source: {item['source']}\n" \
                       f"Definition: {item['definition']}\n" \
                       f"Synonyms: {item['synonyms']}"
        contexts.append(context_text)
    return "\n\n---\n\n".join(contexts)

def generate_answer(query):
    """Full RAG Pipeline with Open Source Model"""
    print(f"Analyzing query: {query}")
    
    # 1. Retrieve
    structured_results = retrieve_context(query)
    context_str = format_context_for_llm(structured_results)
    
    # 2. Augment Prompt (Chat Format)
    messages = [
        {
            "role": "user",
            "content": f"""You are an expert medical assistant specializing in Ayurveda (NAMASTE) and Modern Medicine (ICD-11).
    
Use the following retrieved context to answer the user's question accurately.
If the answer is not in the context, say "I don't have enough information in my database."

Context from Database:
{context_str}

User Question: {query}"""
        }
    ]

    # 3. Generate
    try:
        response = hf_client.chat_completion(
            messages,
            max_tokens=512,
            temperature=0.3
        )
        return response.choices[0].message.content, structured_results
    except Exception as e:
        return f"Error generating answer: {e}", []

if __name__ == "__main__":
    # Test the pipeline
    test_query = "fever"
    print(f"\nTesting Open Source RAG with query: '{test_query}'\n")
    
    try:
        answer, sources = generate_answer(test_query)
        print("\n--- Generated Answer ---\n")
        print(answer)
        print("\n--- Top 3 Sources ---\n")
        for s in sources[:3]:
            print(f"- {s['primary_term']} ({s['code']})")
    except Exception as e:
        print(f"Error: {e}")
