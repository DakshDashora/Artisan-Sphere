import os
import re
import psycopg
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("Error: DATABASE_URL not found in environment variables.")
    exit(1)

print("Connecting to PostgreSQL database...")
try:
    with psycopg.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            # Get existing columns
            cur.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='products';
            """)
            columns = [row[0] for row in cur.fetchall()]
            print("Found existing columns:", columns)
            
            # Add new columns if missing
            updated = False
            if 'title_hi' not in columns:
                print("Adding column 'title_hi'...")
                cur.execute("ALTER TABLE products ADD COLUMN title_hi VARCHAR;")
                updated = True
            if 'description_hi' not in columns:
                print("Adding column 'description_hi'...")
                cur.execute("ALTER TABLE products ADD COLUMN description_hi VARCHAR;")
                updated = True
            if 'story_hi' not in columns:
                print("Adding column 'story_hi'...")
                cur.execute("ALTER TABLE products ADD COLUMN story_hi VARCHAR;")
                updated = True
            
            if updated:
                conn.commit()
                print("Columns added successfully!")
            else:
                print("Columns already exist, no changes made to schema.")
                
except Exception as e:
    print("Database migration error:", e)
    exit(1)
