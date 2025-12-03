# Project Technical Documentation: Ayush Medical RAG System

## 1. Executive Summary
This project is a **Retrieval-Augmented Generation (RAG)** system designed to bridge the gap between **Modern Medicine (ICD-11)** and **Ayurveda (NAMASTE)**. It allows users to search for medical terms (e.g., "Fever") and receive:
1.  **AI-Generated Explanations**: Context-aware answers synthesizing Ayurvedic and Modern concepts.
2.  **Structured Data**: Precise medical codes, synonyms, and definitions from the unified database.
3.  **Semantic Search**: Finding relevant terms even if the exact keywords don't match (e.g., mapping "Fever" to "Jvara").

---

## 2. Technology Stack

### Frontend (User Interface)
*   **Framework**: [React.js](https://react.dev/) (Vite) - For a fast, reactive UI.
*   **Styling**: Custom CSS (Premium Medical Theme) - No external heavy frameworks, ensuring lightweight performance.
*   **State Management**: React `useState` & `useEffect`.
*   **HTTP Client**: `axios` - For communicating with the backend.

### Backend (Orchestrator)
*   **Runtime**: [Node.js](https://nodejs.org/) - Handles API requests and orchestration.
*   **Framework**: [Express.js](https://expressjs.com/) - REST API structure.
*   **Database**: MongoDB (Atlas) - Stores user metadata (optional future use).
*   **Search Engine**: **Pinecone** (Vector Database) - Replaced Elasticsearch for semantic search.

### ML Service ( The "Brain")
*   **Language**: Python 3.9+
*   **API Framework**: [FastAPI](https://fastapi.tiangolo.com/) - High-performance API for ML inference.
*   **Vector Database**: [Pinecone](https://www.pinecone.io/) - Stores high-dimensional vector embeddings of medical terms.
*   **Embedding Model**: `sentence-transformers/all-mpnet-base-v2` (Local) - Converts text into 768-dimensional vectors.
*   **LLM (Large Language Model)**: `mistralai/Mistral-7B-Instruct-v0.2` (via Hugging Face Inference API) - Generates human-like answers and performs query expansion.

---

## 3. System Architecture & Data Flow

```mermaid
graph TD
    User[User] -->|Types 'Fever'| Frontend[React Frontend]
    Frontend -->|POST /chat| Backend[Node.js Backend]
    Backend -->|Proxy Request| ML[Python ML Service]
    
    subgraph "ML Service Logic"
        ML -->|1. Expand Query| LLM[Mistral-7B (HF API)]
        LLM -->|'Fever' -> 'Jvara Pitta'| ML
        ML -->|2. Generate Embedding| Embed[SentenceTransformer]
        Embed -->|Vector [0.1, -0.5, ...]| Pinecone[Pinecone Vector DB]
        Pinecone -->|3. Return Top Matches| ML
        ML -->|4. Construct Prompt| LLM
        LLM -->|5. Generate Answer| ML
    end
    
    ML -->|Answer + Sources| Backend
    Backend -->|JSON Response| Frontend
    Frontend -->|Render UI| User
```

---

## 4. Key Concepts Explained

### 4.1. Retrieval-Augmented Generation (RAG)
Standard LLMs (like ChatGPT) can hallucinate or lack specific domain knowledge. **RAG** solves this by:
1.  **Retrieving** trustworthy data from our own database (Pinecone) first.
2.  **Augmenting** the prompt to the LLM with this data.
3.  **Generating** the answer based *only* on that data.

### 4.2. Vector Embeddings
Computers don't understand text; they understand numbers. An **embedding model** (`all-mpnet-base-v2`) converts a sentence like "Patient has high temperature" into a list of 768 numbers (a vector).
*   "Fever" vector is mathematically close to "Jvara" vector.
*   "Fever" vector is far from "Fracture" vector.
This allows **Semantic Search**: finding results by *meaning*, not just keyword matching.

### 4.3. Query Expansion
A major challenge was that users search in **English** ("Fever"), but the dataset contains **Sanskrit** ("Jvara").
*   **Solution**: Before searching, we ask the LLM to "translate" the medical intent.
*   **Process**: User: "Fever" -> LLM: "Jvara, Pitta, Hyperthermia" -> Search Engine.
*   **Result**: We find relevant Ayurvedic records even if the English word isn't present in them.

---

## 5. Detailed File Logic

### 5.1. Frontend (`FRONTEND/src`)
*   **`App.jsx`**: The main layout container. Implements the "Split View" (Search on top, Chat on bottom).
*   **`api.js`**: Centralized API service.
    *   `searchTerms(q)`: Calls `/search` (Legacy/Direct search).
    *   `chatWithAI(query)`: Calls `/chat` (The RAG pipeline).
*   **`ChatInterface.jsx`**: The core UI component.
    *   Maintains chat state (`query`, `response`, `isLoading`).
    *   Renders the "AI Bubble" and the list of "Source Cards" (Citations).

### 5.2. Backend (`BACKEND/src`)
*   **`server.js`**: Entry point. Starts the Express server on Port 3001.
*   **`api/terminologyRoutes.js`**: Defines the API endpoints.
    *   `POST /chat`: Receives request, validates input, calls `ragIntegrationService`.
*   **`services/ragIntegrationService.js`**: The bridge between Node.js and Python.
    *   Uses `axios` to send HTTP POST requests to `http://localhost:8000`.
    *   Handles timeouts and error logging.

### 5.3. ML Service (`ML_SERVICE/app`)
*   **`main.py`**: FastAPI application entry point.
    *   Defines `/chat` and `/search` endpoints.
    *   Handles CORS and request validation (Pydantic models).
*   **`services/rag_service.py`**: The heart of the system.
    *   **`expand_query()`**: Calls Hugging Face API to get synonyms.
    *   **`get_embedding()`**: Uses local `SentenceTransformer` to vectorize text.
    *   **`retrieve_context()`**: Queries Pinecone with the vector.
    *   **`generate_answer()`**: Constructs the final prompt:
        > "You are an Ayurvedic expert. Use this context: [Retrieved Data]. Answer this question: [User Query]."
*   **`utils/data_preprocessing.py`**: (Used during setup)
    *   Cleans raw CSV/Excel data.
    *   Fixes `#NAME?` Excel errors.
    *   Sanitizes IDs for Pinecone compatibility.

---

## 6. Deployment Strategy

To run this complex stack for free, we use a distributed deployment:

1.  **Hugging Face Spaces (Docker)**: Hosts the **ML Service**.
    *   *Reason*: Requires ~1GB RAM for the Embedding Model. HF offers 16GB Free.
2.  **Render (Web Service)**: Hosts the **Node.js Backend**.
    *   *Reason*: Lightweight, persistent HTTP service.
3.  **Vercel**: Hosts the **React Frontend**.
    *   *Reason*: Best-in-class static site hosting and CDN.

---

## 7. Future Improvements
1.  **Knowledge Graph**: Integrate Neo4j to map relationships (e.g., "Jvara" *causes* "Daha").
2.  **Voice Interface**: Add Speech-to-Text to allow doctors to speak queries.
3.  **Multi-lingual Support**: Expand query expansion to support Hindi and local languages.
