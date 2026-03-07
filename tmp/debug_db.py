import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

conn_str = os.getenv("NEXT_PUBLIC_NEON_DB_CONNECTION_STRING")
if not conn_str:
    print("Error: NEXT_PUBLIC_NEON_DB_CONNECTION_STRING not found in .env")
    exit(1)

try:
    conn = psycopg2.connect(conn_str)
    cur = conn.cursor()
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
    tables = cur.fetchall()
    print("Tables in database:", [t[0] for t in tables])
    
    cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'roadmaps'")
    columns = cur.fetchall()
    print("Columns in 'roadmaps':", columns)
    
except Exception as e:
    print("Error connecting to database or querying:", e)
finally:
    if 'conn' in locals():
        conn.close()
