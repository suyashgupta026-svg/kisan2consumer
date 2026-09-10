from fastapi import APIRouter, Depends
from database import get_db
from schemas import FarmerEarningsResponse, ProductEarningItem
from auth import get_current_farmer

router = APIRouter(tags=["Stats & Analytics"])

@router.get("/farmer/earnings", response_model=FarmerEarningsResponse)
def get_farmer_earnings(farmer: dict = Depends(get_current_farmer)):
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Product-wise breakdown
        cursor.execute("""
        SELECT 
            oi.product_name,
            oi.unit,
            SUM(oi.quantity) as quantity_sold,
            SUM(oi.total_price) as revenue
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE oi.farmer_id = ? AND o.status != 'Cancelled'
        GROUP BY oi.product_name, oi.unit
        ORDER BY revenue DESC
        """, (farmer["id"],))
        
        breakdown_rows = cursor.fetchall()
        breakdown = [
            ProductEarningItem(
                product_name=r["product_name"],
                unit=r["unit"],
                quantity_sold=float(r["quantity_sold"] or 0),
                revenue=float(r["revenue"] or 0)
            )
            for r in breakdown_rows
        ]
        
        # Total revenue
        total_rev = sum(item.revenue for item in breakdown)
        
        # Delivered revenue vs pending revenue
        cursor.execute("""
        SELECT 
            COALESCE(SUM(oi.total_price), 0)
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE oi.farmer_id = ? AND o.status = 'Delivered'
        """, (farmer["id"],))
        delivered_rev = float(cursor.fetchone()[0])
        
        cursor.execute("""
        SELECT 
            COALESCE(SUM(oi.total_price), 0)
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE oi.farmer_id = ? AND o.status IN ('Pending', 'Confirmed', 'Out for Delivery')
        """, (farmer["id"],))
        pending_rev = float(cursor.fetchone()[0])
        
        # Order counts
        cursor.execute("""
        SELECT 
            COUNT(DISTINCT o.id) as total_orders,
            COUNT(DISTINCT CASE WHEN o.status = 'Delivered' THEN o.id END) as delivered_orders,
            COUNT(DISTINCT CASE WHEN o.status IN ('Pending', 'Confirmed', 'Out for Delivery') THEN o.id END) as pending_orders
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE oi.farmer_id = ?
        """, (farmer["id"],))
        counts = cursor.fetchone()
        
        return FarmerEarningsResponse(
            farmer_id=farmer["id"],
            farmer_name=farmer["name"],
            total_revenue=total_rev,
            delivered_revenue=delivered_rev,
            pending_revenue=pending_rev,
            total_orders_count=counts["total_orders"],
            delivered_orders_count=counts["delivered_orders"],
            pending_orders_count=counts["pending_orders"],
            products_breakdown=breakdown
        )

@router.get("/stats/platform")
def get_platform_stats():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'farmer'")
        farmers_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'consumer'")
        consumers_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM products WHERE is_active = 1")
        products_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COALESCE(SUM(total), 0) FROM orders WHERE status != 'Cancelled'")
        trade_volume = cursor.fetchone()[0]
        
        return {
            "farmers_count": farmers_count,
            "consumers_count": consumers_count,
            "products_count": products_count,
            "trade_volume_inr": float(trade_volume),
            "middlemen_commission_saved_inr": round(float(trade_volume) * 0.25, 2)
        }
