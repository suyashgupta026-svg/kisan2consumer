from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import init_db
from routers.auth import router as auth_router
from routers.products import router as products_router
from routers.orders import router as orders_router
from routers.stats import router as stats_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite tables and seed data
    init_db()
    print("🌾 Kisan2Consumer Database initialized successfully.")
    yield
    print("🌾 Kisan2Consumer Backend shutting down.")

app = FastAPI(
    title="Kisan2Consumer Backend API",
    description="Responsive, secure FastAPI backend for Kisan2Consumer with JWT Authentication, SQLite database, product management, and order tracking.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers under /api
app.include_router(auth_router, prefix="/api")
app.include_router(products_router, prefix="/api")
app.include_router(orders_router, prefix="/api")
app.include_router(stats_router, prefix="/api")

@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "Kisan2Consumer FastAPI Backend",
        "version": "1.0.0",
        "database": "SQLite (Persistent)",
        "security": "JWT + Bcrypt Hashing"
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to Kisan2Consumer API",
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
