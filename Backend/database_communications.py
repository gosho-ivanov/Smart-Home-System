import mysql.connector

def connect_to_db():
    try:
        conn = mysql.connector.connect(
            host="127.0.01",
            user="root",
            password="",
            database="SmartHome"
        )
        return conn
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

def insert_data(conn, table, data):
    cursor = conn.cursor()
    cursor.execute("INSERT INTO %s (name, email) VALUES (" + ",".join(["%s" for i in data])+ ")" (table))
    conn.commit()
    cursor.close()

def fetch_data(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users")
    rows = cursor.fetchall()
    for row in rows:
        print(row)
    cursor.close()

def main():
    pass
if __name__ == "__main__":
    main()

