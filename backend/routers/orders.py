import random
import string
from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from database import get_db
from schemas import OrderCreate, OrderResponse, OrderItemResponse, OrderStatusUpdate
from auth import get_current_user, get_current_farmer, get_current_consumer

router = APIRouter(prefix="/orders", tags=["Orders"])

def generate_order_number() -> str:
    rand_suffix = "".join(random.choices(string.digits, k=5))
    return f"ORD-{rand_suffix}"

def fetch_order_with_items(cursor, order_id: int) -> dict:
    cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    order_row = cursor.fetchone()
    if not order_row:
        return None
    order_dict = dict(order_row)
    
    cursor.execute("SELECT * FROM order_items WHERE order_id = ?", (order_id,))
    items = [dict(i) for i in cursor.fetchall()]
    order_dict["items"] = items
    return order_dict

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(req: OrderCreate, consumer: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Validate stock and calculate pricing
        subtotal = 0.0
        validated_items = []
        
        for item in req.items:
            cursor.execute("SELECT * FROM products WHERE id = ?", (item.product_id,))
            product = cursor.fetchone()
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID {item.product_id} no longer exists"
                )
            if not product["is_active"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product '{product['name']}' is currently not available for purchase"
                )
            if product["quantity"] < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for '{product['name']}'. Only {product['quantity']} {product['unit']} left."
                )
                
            item_total = float(product["price"]) * float(item.quantity)
            subtotal += item_total
            validated_items.append({
                "product_id": product["id"],
                "farmer_id": product["farmer_id"],
                "product_name": product["name"],
                "unit": product["unit"],
                "unit_price": float(product["price"]),
                "quantity": float(item.quantity),
                "total_price": item_total
            })
            
        delivery_fee = 20.0
        total = subtotal + delivery_fee
        order_number = generate_order_number()
        
        # Insert order
        cursor.execute("""
        INSERT INTO orders (
            order_number, consumer_id, consumer_name, consumer_email,
            delivery_address, payment_method, payment_status,
            subtotal, delivery_fee, total, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
        """, (
            order_number,
            consumer["id"],
            consumer["name"],
            consumer["email"],
            req.delivery_address.strip(),
            req.payment_method.upper(),
            "Pending" if req.payment_method == "cod" else "Completed",
            subtotal,
            delivery_fee,
            total
        ))
        
        order_id = cursor.lastrowid
        
        # Insert items and decrement product stock
        for vi in validated_items:
            cursor.execute("""
            INSERT INTO order_items (
                order_id, product_id, farmer_id, product_name,
                unit, unit_price, quantity, total_price
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                order_id,
                vi["product_id"],
                vi["farmer_id"],
                vi["product_name"],
                vi["unit"],
                vi["unit_price"],
                vi["quantity"],
                vi["total_price"]
            ))
            
            # Decrement product quantity
            cursor.execute("""
            UPDATE products 
            SET quantity = MAX(0, quantity - ?) 
            WHERE id = ?
            """, (vi["quantity"], vi["product_id"]))
            
        return fetch_order_with_items(cursor, order_id)

@router.get("/my-orders", response_model=List[OrderResponse])
def get_consumer_orders(consumer: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM orders WHERE consumer_id = ? ORDER BY id DESC", (consumer["id"],))
        order_ids = [r[0] for r in cursor.fetchall()]
        
        orders = []
        for oid in order_ids:
            ord_data = fetch_order_with_items(cursor, oid)
            if ord_data:
                orders.append(ord_data)
        return orders

@router.get("/farmer-orders", response_model=List[OrderResponse])
def get_farmer_orders(farmer: dict = Depends(get_current_farmer)):
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Find distinct orders that contain items from this farmer
        cursor.execute("""
        SELECT DISTINCT o.id 
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE oi.farmer_id = ?
        ORDER BY o.id DESC
        """, (farmer["id"],))
        
        order_ids = [r[0] for r in cursor.fetchall()]
        
        orders = []
        for oid in order_ids:
            ord_data = fetch_order_with_items(cursor, oid)
            if ord_data:
                # Optionally filter items to only this farmer's products
                farmer_items = [i for i in ord_data["items"] if i["farmer_id"] == farmer["id"]]
                ord_data["items"] = farmer_items
                # Recalculate subtotal for this farmer's portion
                ord_data["subtotal"] = sum(i["total_price"] for i in farmer_items)
                ord_data["total"] = ord_data["subtotal"]
                orders.append(ord_data)
        return orders

@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: int, req: OrderStatusUpdate, user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
        order = cursor.fetchone()
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
            
        cursor.execute("UPDATE orders SET status = ? WHERE id = ?", (req.status, order_id))
        return fetch_order_with_items(cursor, order_id)
