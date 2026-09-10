from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# --- Auth Schemas ---
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=150)
    password: str = Field(..., min_length=6, max_length=100)
    role: str = Field(..., pattern="^(farmer|consumer)$")
    location: Optional[str] = ""
    phone: Optional[str] = ""

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    id: int
    name: str
    email: str
    role: str
    location: Optional[str] = ""
    phone: Optional[str] = ""
    created_at: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile

# --- Product Schemas ---
class ProductCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    category: str
    quantity: float = Field(..., gt=0)
    unit: str = Field("kg", max_length=20)
    price: float = Field(..., gt=0)
    location: str
    distance: Optional[float] = 2.5
    description: Optional[str] = ""
    image_url: Optional[str] = ""

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    price: Optional[float] = None
    location: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class ProductResponse(BaseModel):
    id: int
    farmer_id: int
    farmer_name: str
    name: str
    category: str
    quantity: float
    unit: str
    price: float
    location: str
    distance: float
    rating: float
    image_url: Optional[str] = ""
    description: Optional[str] = ""
    is_active: bool
    created_at: Optional[str] = None

# --- Order Schemas ---
class OrderItemInput(BaseModel):
    product_id: int
    quantity: float = Field(..., gt=0)

class OrderCreate(BaseModel):
    delivery_address: str = Field(..., min_length=5)
    payment_method: str = Field(..., pattern="^(upi|card|cod)$")
    items: List[OrderItemInput] = Field(..., min_items=1)

class OrderItemResponse(BaseModel):
    id: int
    product_id: Optional[int] = None
    farmer_id: int
    product_name: str
    unit: str
    unit_price: float
    quantity: float
    total_price: float

class OrderResponse(BaseModel):
    id: int
    order_number: str
    consumer_id: int
    consumer_name: str
    consumer_email: str
    delivery_address: str
    payment_method: str
    payment_status: str
    subtotal: float
    delivery_fee: float
    total: float
    status: str
    created_at: str
    items: List[OrderItemResponse] = []

class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(Pending|Confirmed|Out for Delivery|Delivered|Cancelled)$")

# --- Stats & Earnings Schemas ---
class ProductEarningItem(BaseModel):
    product_name: str
    quantity_sold: float
    unit: str
    revenue: float

class FarmerEarningsResponse(BaseModel):
    farmer_id: int
    farmer_name: str
    total_revenue: float
    delivered_revenue: float
    pending_revenue: float
    total_orders_count: int
    delivered_orders_count: int
    pending_orders_count: int
    products_breakdown: List[ProductEarningItem]
