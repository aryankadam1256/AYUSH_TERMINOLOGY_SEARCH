# Interview Preparation Guide: Ayush Medical RAG System

> **Target Audience**: ML Engineers, Full Stack Developers, and System Architects.
> **Goal**: To provide "Model Answers" for high-stakes technical interviews based on this specific project.

---

## Part 1: Machine Learning & NLP (The "Hard" Questions)

### Q1: "Explain the entire RAG pipeline in this project. Why not just use ChatGPT?"
**The "Star" Answer**:
"We built a specialized RAG (Retrieval-Augmented Generation) system to bridge Ayurveda and Modern Medicine.
1.  **Ingestion**: We unified ICD-11 and NAMASTE datasets into a structured JSONL format.
2.  **Indexing**: We used `sentence-transformers/all-mpnet-base-v2` to create 768-dimensional embeddings and stored them in **Pinecone**.
3.  **Retrieval**: When a user asks a question, we first **expand the query** using an LLM (Mistral-7B) to include Ayurvedic synonyms (e.g., 'Fever' -> 'Jvara'). This solves the vocabulary mismatch problem.
4.  **Generation**: We retrieve the top 10 matches and feed them as context to Mistral-7B to generate the final answer.

**Why not just ChatGPT?**
*   **Domain Knowledge**: ChatGPT doesn't know the specific NAMASTE codes or our proprietary mapping logic.
*   **Hallucinations**: RAG grounds the model. If the data isn't in our vector DB, the model says 'I don't know' instead of making up a cure.
*   **Data Privacy**: We can run the embedding model locally and only send anonymized context to the LLM."

### Q2: "How did you handle the vocabulary mismatch between English and Sanskrit?"
**The "Star" Answer**:
"This was our biggest challenge. A simple vector search for 'Fever' might miss 'Jvara' if the embedding model hasn't seen enough Sanskrit.
We implemented a **Query Expansion** step using an LLM *before* the search.
*   **User Query**: 'Treatment for Fever'
*   **Expansion Agent**: We prompt Mistral-7B: *'Give me Ayurvedic synonyms for Fever'*. It returns 'Jvara, Pitta'.
*   **Search Query**: 'Treatment for Fever Jvara Pitta'.
This hybrid query ensures we hit the semantic clusters for both modern and traditional terms in the vector space."

### Q3: "Why did you choose `all-mpnet-base-v2`? Why not OpenAI's `text-embedding-3`?"
**The "Star" Answer**:
"We prioritized **Latency** and **Cost**.
*   `all-mpnet-base-v2` is a 420MB model that runs locally on CPU/low-tier GPU. It ranks very high on the MTEB leaderboard for semantic search.
*   OpenAI's embeddings require an API call (latency) and cost money per token.
*   Since our domain is specific (Medical), the MPNet model provided excellent separation between distinct medical concepts without the overhead of a closed-source API."

### Q4: "How does Pinecone work under the hood? What is HNSW?"
**The "Star" Answer**:
"Pinecone is a managed vector database that uses **HNSW (Hierarchical Navigable Small World)** graphs for indexing.
*   **Naive Search (k-NN)**: Comparing a query vector to *every* document vector is $O(N)$. Too slow for millions of records.
*   **HNSW**: It builds a multi-layer graph. The top layers have few nodes (long jumps), and bottom layers have many nodes (short jumps). It's like a highway system: you take the highway (top layer) to get close to the destination, then local roads (bottom layer) to find the exact house.
*   **Complexity**: This reduces search from $O(N)$ to $O(\log N)$."

---

## Part 2: Backend & System Design

### Q5: "How would you scale this system to 100,000 concurrent users?"
**The "Star" Answer**:
"Currently, the bottleneck is the **LLM Inference**.
1.  **Queueing System**: I would introduce **Redis** or **RabbitMQ** to decouple the Node.js backend from the Python ML service. Requests would be queued, preventing the ML service from crashing under load.
2.  **Batching**: The ML service could process embeddings in batches (e.g., encode 32 queries at once) to utilize GPU parallelism.
3.  **Caching**: Implement **Redis Cache** for common queries. If 100 people ask 'What is Jvara?', we shouldn't run the RAG pipeline 100 times. We serve the cached answer.
4.  **Horizontal Scaling**:
    *   **Backend**: Spin up more Node.js instances behind a Load Balancer (Nginx).
    *   **Vector DB**: Pinecone handles scaling automatically (serverless).
    *   **LLM**: Switch from a single Hugging Face Inference endpoint to a dedicated cluster (e.g., vLLM or TGI) on AWS SageMaker."

### Q6: "Explain the communication between Node.js and Python."
**The "Star" Answer**:
"We used a **Synchronous HTTP** pattern for simplicity in the MVP, but it mimics a **Microservices** architecture.
*   The Node.js server acts as the **API Gateway** and **Orchestrator**.
*   It makes an HTTP POST request to the Python service running on port 8000.
*   **Trade-off**: This is blocking. If the Python service hangs, the Node request times out.
*   **Improvement**: In production, I would use **gRPC** for faster, strictly-typed communication, or an **Event Bus** for asynchronous processing."

---

## Part 3: Frontend & React

### Q7: "How did you manage state in the Chat Interface?"
**The "Star" Answer**:
"I used a combination of local component state (`useState`) and optimistic UI updates.
*   **Optimistic UI**: When the user sends a message, I immediately disable the input and show a 'Thinking...' indicator. This provides instant feedback.
*   **Error Handling**: I wrapped the API call in a `try-catch` block. If the backend fails, I set an error state that renders a friendly red alert, rather than crashing the app.
*   **Prop Drilling**: The app is simple enough that I didn't need Redux. I passed data down from `ChatInterface` to child components like `SourceCard`."

### Q8: "How would you optimize the Frontend performance?"
**The "Star" Answer**:
"1.  **Code Splitting**: Use `React.lazy()` to load the Chat component only when the user navigates to it.
2.  **Memoization**: Use `React.memo` for the `SourceCard` components. They are pure components (same props = same output), so they shouldn't re-render when the parent types in the input box.
3.  **Debouncing**: If we had a 'search-as-you-type' feature, I would debounce the input to avoid hitting the API on every keystroke."

---

## Part 4: Behavioral & Scenarios

### Q9: "Tell me about a difficult bug you faced."
**The "Star" Answer**:
"**Situation**: We were getting poor search results for Ayurvedic terms. 'Fever' returned nothing relevant.
**Task**: Fix the retrieval quality.
**Action**: I analyzed the data and realized the embeddings for English 'Fever' and Sanskrit 'Jvara' were too far apart because the model was trained primarily on English text.
**Result**: I implemented the **Query Expansion** module. By forcing the LLM to inject the Sanskrit synonym *into the query string* before embedding, we improved recall by over 40%. It was a simple engineering fix that solved a complex ML problem."

### Q10: "What would you do differently if you started over?"
**The "Star" Answer**:
"I would implement **Evaluation Metrics** (RAGas) from Day 1.
Currently, we judge quality by 'eye-balling' it. I would create a 'Golden Dataset' of 50 questions and answers. Every time we change the prompt or the embedding model, I would run a script to calculate:
1.  **Context Precision**: Did we retrieve the right documents?
2.  **Faithfulness**: Did the LLM answer based *only* on the documents?
This would allow us to iterate with confidence rather than guessing."

---

## Part 5: Quick-Fire Concepts (Cheat Sheet)

*   **Tokenization**: Breaking text into sub-word units (e.g., "chatting" -> "chat", "##ting").
*   **Context Window**: The limit on how much text the LLM can read (Mistral-7B is 8k or 32k tokens).
*   **Temperature**: A setting (0.0 - 1.0) controlling randomness. We use **0.3** for factual medical answers.
*   **Cosine Similarity**: The angle between two vectors. 1.0 = Identical, 0.0 = Orthogonal (Unrelated).
*   **REST API**: Representational State Transfer. Uses standard HTTP methods (GET, POST).
*   **CORS**: Cross-Origin Resource Sharing. A browser security feature we had to configure to allow React (Port 5173) to talk to Node (Port 3001).
