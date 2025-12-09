# Deployment Guide

This project consists of 3 parts. To deploy it for **free**, we will use 3 different services:

1.  **Frontend (React)** -> **Vercel** (Free, Fast)
2.  **Backend (Node.js)** -> **Render** (Free Web Service)
3.  **ML Service (Python)** -> **Hugging Face Spaces** (Free CPU Tier - 16GB RAM)

> **Why Hugging Face?**
> Your Python service uses AI models that need ~1GB of RAM. Render's free tier only gives 512MB, so it would crash. Hugging Face Spaces gives 16GB for free.

---

## Step 1: Deploy ML Service (Hugging Face)

1.  Go to [huggingface.co/spaces](https://huggingface.co/spaces) and create a **New Space**.
    *   **Name:** `ayush-rag-service`
    *   **SDK:** `Docker` (Important!)
    *   **Visibility:** Public
2.  Clone the Space locally or use the Web UI to add files.
3.  You need to upload the contents of your `ML_SERVICE` folder to the root of this Space.
4.  Create a `Dockerfile` in the Space with this content:
    ```dockerfile
    FROM python:3.9

    WORKDIR /app

    COPY requirements.txt .
    RUN pip install --no-cache-dir -r requirements.txt

    COPY . .

    CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
    ```
5.  Add your secrets in **Settings > Variables and secrets**:
    *   `HF_API_KEY`
    *   `PINECONE_API_KEY`
6.  Once built, your URL will look like: `https://huggingface.co/spaces/YOUR_USERNAME/ayush-rag-service` (Click "Embed this space" to get the direct API URL, usually `https://YOUR_USERNAME-ayush-rag-service.hf.space`).

---

## Step 2: Deploy Backend (Render)

1.  Go to [render.com](https://render.com) and create a **New Web Service**.
2.  Connect your GitHub repo.
3.  **Root Directory:** `BACKEND`
4.  **Build Command:** `npm install`
5.  **Start Command:** `node server.js`
6.  **Environment Variables:**
    *   `MONGODB_URI`: Your MongoDB Atlas URL.
    *   `ELASTICSEARCH_NODE`: (Optional, we removed it).
    *   `RAG_SERVICE_URL`: **The URL from Step 1** (e.g., `https://your-hf-space.hf.space`).
7.  Click **Deploy**.
8.  Copy your new Backend URL (e.g., `https://ayush-backend.onrender.com`).

---

## Step 3: Deploy Frontend (Vercel)

1.  Go to [vercel.com](https://vercel.com) and **Add New Project**.
2.  Import your GitHub repo.
3.  **Root Directory:** `FRONTEND` (Click Edit to select it).
4.  **Environment Variables:**
    *   `VITE_API_BASE_URL`: **The URL from Step 2** (e.g., `https://ayush-backend.onrender.com/api/v1`).
5.  Click **Deploy**.

---

## Final Check
1.  Open your Vercel URL.
2.  Try the **Search Bar** (Should hit Render -> HF Space -> Pinecone).
3.  Try the **AI Chat** (Should hit Render -> HF Space -> LLM).
