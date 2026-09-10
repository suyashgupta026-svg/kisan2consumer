from fastapi import APIRouter, HTTPException, status, Depends
from database import get_db
from schemas import UserRegister, UserLogin, TokenResponse, UserProfile
from auth import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(req: UserRegister):
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Check duplicate email
        cursor.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(?)", (req.email.strip(),))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists"
            )
            
        hashed = get_password_hash(req.password)
        cursor.execute("""
        INSERT INTO users (name, email, hashed_password, role, location, phone)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (req.name.strip(), req.email.strip().lower(), hashed, req.role, req.location or "", req.phone or ""))
        
        user_id = cursor.lastrowid
        cursor.execute("SELECT id, name, email, role, location, phone, created_at FROM users WHERE id = ?", (user_id,))
        user_row = dict(cursor.fetchone())
        
        token = create_access_token(data={"sub": str(user_id), "role": user_row["role"]})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user_row
        }

@router.post("/login", response_model=TokenResponse)
def login(req: UserLogin):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, email, hashed_password, role, location, phone, created_at FROM users WHERE LOWER(email) = LOWER(?)", (req.email.strip(),))
        row = cursor.fetchone()
        
        if not row or not verify_password(req.password, row["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
            
        user_data = dict(row)
        user_id = user_data["id"]
        del user_data["hashed_password"]
        
        token = create_access_token(data={"sub": str(user_id), "role": user_data["role"]})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user_data
        }

@router.get("/me", response_model=UserProfile)
def get_profile(current_user: dict = Depends(get_current_user)):
    return current_user

@router.get("/demo-accounts")
def get_demo_accounts():
    return {
        "farmer": {
            "name": "Raj Kumar",
            "email": "raj@farmer.com",
            "password": "farmer123",
            "role": "farmer",
            "location": "Gorakhpur, UP"
        },
        "farmer_2": {
            "name": "Meena Devi",
            "email": "meena@farmer.com",
            "password": "farmer123",
            "role": "farmer",
            "location": "Bareilly, UP"
        },
        "consumer": {
            "name": "Priya Sharma",
            "email": "priya@consumer.com",
            "password": "consumer123",
            "role": "consumer",
            "location": "Lucknow, UP"
        }
    }
