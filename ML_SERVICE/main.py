from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.services.rag_service import generate_answer, retrieve_context
import uvicorn
import os

app = FastAPI(title="Medical RAG Service", description="API for Medical Terminology RAG Pipeline")

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    answer: str
    sources: list[dict]

@app.get("/")
def read_root():
    return {"status": "online", "service": "Medical RAG Service"}

@app.post("/chat", response_model=QueryResponse)
def chat_endpoint(request: QueryRequest):
    try:
        # Generate answer and get structured sources
        answer, sources = generate_answer(request.query)
        
        return {
            "answer": answer,
            "sources": sources
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search")
def search_endpoint(request: QueryRequest):
    """Pure semantic search endpoint returning structured data"""
    try:
        results = retrieve_context(request.query, top_k=10)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
