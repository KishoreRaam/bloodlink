"""
Run this once to create the admin account:
    python create_admin.py
"""
import mysql.connector
from auth_utils import hash_password

conn = mysql.connector.connect(
    host="shuttle.proxy.rlwy.net",
    port=44519,
    user="root",
    password="CzVUBaOLekByVcZBVtjzphBPTPVcjGVG",
    database="blood_management_system",
)
cursor = conn.cursor()

# Create users table if not exists
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    user_id         INT AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(150) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    role            ENUM('admin','staff') NOT NULL DEFAULT 'staff',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

# Insert default admin
try:
    cursor.execute(
        "INSERT INTO users (email, hashed_password, name, role) VALUES (%s, %s, %s, %s)",
        ("admin@bloodlink.com", hash_password("admin123"), "Admin", "admin"),
    )
    conn.commit()
    print("✅ Admin created: admin@bloodlink.com / admin123")
except mysql.connector.IntegrityError:
    print("ℹ️  Admin already exists.")

cursor.close()
conn.close()
