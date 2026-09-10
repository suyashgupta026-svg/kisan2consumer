import sqlite3
import os
from contextlib import contextmanager
import bcrypt

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "kisan2consumer.db")

def hash_pw(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

@contextmanager
def get_db():
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('farmer', 'consumer')),
            location TEXT DEFAULT '',
            phone TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        
        # Create products table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farmer_id INTEGER NOT NULL,
            farmer_name TEXT NOT NULL,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            quantity REAL NOT NULL DEFAULT 0,
            unit TEXT NOT NULL DEFAULT 'kg',
            price REAL NOT NULL,
            location TEXT NOT NULL,
            distance REAL DEFAULT 2.5,
            rating REAL DEFAULT 4.8,
            image_url TEXT DEFAULT '',
            description TEXT DEFAULT '',
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """)
        
        # Create orders table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT UNIQUE NOT NULL,
            consumer_id INTEGER NOT NULL,
            consumer_name TEXT NOT NULL,
            consumer_email TEXT NOT NULL,
            delivery_address TEXT NOT NULL,
            payment_method TEXT NOT NULL,
            payment_status TEXT DEFAULT 'Completed',
            subtotal REAL NOT NULL,
            delivery_fee REAL NOT NULL DEFAULT 20.0,
            total REAL NOT NULL,
            status TEXT NOT NULL DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (consumer_id) REFERENCES users(id) ON DELETE SET NULL
        )
        """)
        
        # Create order_items table
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER,
            farmer_id INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            unit TEXT NOT NULL,
            unit_price REAL NOT NULL,
            quantity REAL NOT NULL,
            total_price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """)
        
        # Seed initial users if table is empty
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        
        if user_count == 0:
            demo_farmer_hash = hash_pw("farmer123")
            demo_consumer_hash = hash_pw("consumer123")
            demo_farmer2_hash = hash_pw("farmer123")
            
            cursor.execute("""
            INSERT INTO users (name, email, hashed_password, role, location, phone)
            VALUES (?, ?, ?, ?, ?, ?)
            """, ("Raj Kumar", "raj@farmer.com", demo_farmer_hash, "farmer", "Gorakhpur, UP", "+91 98765 43210"))
            farmer1_id = cursor.lastrowid
            
            cursor.execute("""
            INSERT INTO users (name, email, hashed_password, role, location, phone)
            VALUES (?, ?, ?, ?, ?, ?)
            """, ("Meena Devi", "meena@farmer.com", demo_farmer2_hash, "farmer", "Bareilly, UP", "+91 98765 43211"))
            farmer2_id = cursor.lastrowid

            cursor.execute("""
            INSERT INTO users (name, email, hashed_password, role, location, phone)
            VALUES (?, ?, ?, ?, ?, ?)
            """, ("Priya Sharma", "priya@consumer.com", demo_consumer_hash, "consumer", "Lucknow, UP", "+91 98765 43212"))
            consumer_id = cursor.lastrowid
            
            # Seed initial products
            products_data = [
                (farmer1_id, "Raj Kumar", "Tomatoes", "Vegetables", 120.0, "kg", 30.0, "Gorakhpur", 2.4, 4.6, "Farm fresh red ripe hybrid tomatoes grown with organic compost.", 1),
                (farmer2_id, "Meena Devi", "Basmati Rice", "Grains", 350.0, "kg", 65.0, "Bareilly", 5.1, 4.8, "Aromatic long-grain traditional Taraori basmati rice.", 1),
                (farmer1_id, "Raj Kumar", "Organic Wheat", "Grains", 500.0, "kg", 28.0, "Gorakhpur", 3.8, 4.5, "Sharbati golden wheat, sun-dried and cleaned.", 1),
                (farmer1_id, "Raj Kumar", "Green Chillies", "Vegetables", 45.0, "kg", 40.0, "Gorakhpur", 1.9, 4.3, "Spicy green chillies freshly picked this morning.", 1),
                (farmer2_id, "Meena Devi", "Alphonso Mangoes", "Fruits", 80.0, "dozen", 120.0, "Bareilly", 8.2, 4.9, "Naturally ripened sweet aromatic mangoes without carbide.", 1),
                (farmer2_id, "Meena Devi", "Toor Dal", "Pulses", 200.0, "kg", 110.0, "Bareilly", 4.0, 4.4, "Unpolished desi toor dal, rich in protein.", 1),
                (farmer1_id, "Raj Kumar", "Fresh Cow Milk", "Dairy", 60.0, "liter", 55.0, "Gorakhpur", 1.2, 4.9, "A2 cow milk chilled immediately after morning milking.", 1),
                (farmer2_id, "Meena Devi", "Pure Turmeric Powder", "Spices", 75.0, "kg", 180.0, "Bareilly", 6.5, 4.7, "High-curcumin farm grounded turmeric with rich color.", 1)
            ]
            
            cursor.executemany("""
            INSERT INTO products (farmer_id, farmer_name, name, category, quantity, unit, price, location, distance, rating, description, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, products_data)
            
            # Seed sample initial completed order
            cursor.execute("""
            INSERT INTO orders (order_number, consumer_id, consumer_name, consumer_email, delivery_address, payment_method, payment_status, subtotal, delivery_fee, total, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 days'))
            """, ("ORD-83921", consumer_id, "Priya Sharma", "priya@consumer.com", "Flat 402, Green Valley Apartments, Lucknow", "UPI", "Completed", 125.0, 20.0, 145.0, "Delivered"))
            sample_order_id = cursor.lastrowid
            
            cursor.execute("""
            INSERT INTO order_items (order_id, product_id, farmer_id, product_name, unit, unit_price, quantity, total_price)
            VALUES (?, 1, ?, 'Tomatoes', 'kg', 30.0, 2.0, 60.0)
            """, (sample_order_id, farmer1_id))
            
            cursor.execute("""
            INSERT INTO order_items (order_id, product_id, farmer_id, product_name, unit, unit_price, quantity, total_price)
            VALUES (?, 2, ?, 'Basmati Rice', 'kg', 65.0, 1.0, 65.0)
            """, (sample_order_id, farmer2_id))
            
            # Seed a pending order
            cursor.execute("""
            INSERT INTO orders (order_number, consumer_id, consumer_name, consumer_email, delivery_address, payment_method, payment_status, subtotal, delivery_fee, total, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-1 hours'))
            """, ("ORD-92044", consumer_id, "Priya Sharma", "priya@consumer.com", "Flat 402, Green Valley Apartments, Lucknow", "Cash on Delivery", "Pending", 150.0, 20.0, 170.0, "Confirmed"))
            sample_order_2 = cursor.lastrowid
            
            cursor.execute("""
            INSERT INTO order_items (order_id, product_id, farmer_id, product_name, unit, unit_price, quantity, total_price)
            VALUES (?, 1, ?, 'Tomatoes', 'kg', 30.0, 5.0, 150.0)
            """, (sample_order_2, farmer1_id))
