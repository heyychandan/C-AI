from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import FakeEmbeddings
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv

load_dotenv()

vectorstore_store = {}
embeddings = FakeEmbeddings(size=384)

def process_pdf(session_id: str, file_path: str):
    loader = PyPDFLoader(file_path)
    documents = loader.load()
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(documents)
    vectorstore = FAISS.from_documents(chunks, embeddings)
    vectorstore_store[session_id] = vectorstore
    return len(chunks)

def query_pdf(session_id: str, question: str) -> str:
    if session_id not in vectorstore_store:
        return "No PDF uploaded yet. Please upload a PDF first."
    vectorstore = vectorstore_store[session_id]
    docs = vectorstore.similarity_search(question, k=3)
    context = "\n\n".join([doc.page_content for doc in docs])
    llm = ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model="llama-3.3-70b-versatile",
        temperature=0.7
    )
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant. Answer the question using only the context provided below.\n\nContext:\n{context}"),
        ("human", "{question}")
    ])
    chain = prompt | llm
    result = chain.invoke({"context": context, "question": question})
    return result.content

def clear_pdf_session(session_id: str):
    if session_id in vectorstore_store:
        del vectorstore_store[session_id]