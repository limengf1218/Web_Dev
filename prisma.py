import psycopg2

try:
    connection = psycopg2.connect(
        dbname="Miko_test",
        user="modelshare",
        password="MikoMiko123postgres",
        host="pgm-2zem33e8c3158677.pg.rds.aliyuncs.com",
        port="5432"
    )
    
    print("Connection to PostgreSQL successful!")
    cursor = connection.cursor()

    cursor.execute('SELECT * FROM "Leaderboard"')

    results = cursor.fetchall()

    for row in results:
        print(row)

    cursor.close()
    
except (Exception, psycopg2.Error) as error:
    print("Error while connecting to PostgreSQL:", error)