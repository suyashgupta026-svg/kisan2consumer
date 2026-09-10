from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from database import get_db
from schemas import ProductCreate, ProductUpdate, ProductResponse
from auth import get_current_farmer, get_current_user

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=List[ProductResponse])
def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    farmer_id: Optional[int] = None,
    only_active: bool = True
):
    with get_db() as conn:
        cursor = conn.cursor()
        
        query = "SELECT * FROM products WHERE 1=1"
        params = []
        
        if only_active:
            query += " AND is_active = 1"
            
        if category and category != "All":
            query += " AND category = ?"
            params.append(category)
            
        if search:
            query += " AND (LOWER(name) LIKE ? OR LOWER(location) LIKE ? OR LOWER(farmer_name) LIKE ?)"
            term = f"%{search.strip().lower()}%"
            params.extend([term, term, term])
            
        if farmer_id:
            query += " AND farmer_id = ?"
            params.append(farmer_id)
            
        query += " ORDER BY id DESC"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [dict(r) for r in rows]

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        return dict(row)

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(req: ProductCreate, farmer: dict = Depends(get_current_farmer)):
    with get_db() as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
        INSERT INTO products (
            farmer_id, farmer_name, name, category, quantity, unit,
            price, location, distance, rating, description, image_url, is_active
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """, (
            farmer["id"],
            farmer["name"],
            req.name.strip(),
            req.category,
            float(req.quantity),
            req.unit.strip() or "kg",
            float(req.price),
            req.location.strip() or farmer.get("location", "Farm Direct"),
            float(req.distance or 2.5),
            4.8, # Default new product rating
            req.description or "",
            req.image_url or ""
        ))
        
        product_id = cursor.lastrowid
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        return dict(cursor.fetchone())

@router.patch("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, req: ProductUpdate, farmer: dict = Depends(get_current_farmer)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
            
        if row["farmer_id"] != farmer["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to update another farmer's product"
            )
            
        updates = []
        params = []
        data = req.dict(exclude_unset=True)
        
        for key, value in data.items():
            updates.append(f"{key} = ?")
            params.append(value)
            
        if updates:
            params.append(product_id)
            cursor.execute(f"UPDATE products SET {', '.join(updates)} WHERE id = ?", params)
            
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        return dict(cursor.fetchone())

@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
def delete_product(product_id: int, farmer: dict = Depends(get_current_farmer)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
            
        if row["farmer_id"] != farmer["id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to delete another farmer's product"
            )
            
        cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
        return {"status": "success", "message": f"Product '{row['name']}' successfully deleted"}
