import mysql.connector                     # Librería para conexión con MySQL
from mysql.connector import Error          # Manejo de excepciones específicas de MySQL
import logging                             # Registro de logs para seguimiento
import time                                # Permite la ejecución periódica con pausas
import pandas as pd                        # Manejo de datos en DataFrame

# Configuración del sistema de logs para rastrear errores y eventos importantes
logging.basicConfig(
    filename='etl_pipeline.log',           # Nombre del archivo de log
    level=logging.INFO,                    # Nivel de registro (INFO para seguimiento general)
    format='%(asctime)s - %(message)s'     # Formato del log con timestamp
)

# Función para obtener la conexión a la base de datos
def get_connection():
    """
    Configura y retorna una conexión a la base de datos.
    """
    return mysql.connector.connect(
        host='127.0.0.1',                            # Dirección del servidor de base de datos
        port=8080,                                   # Puerto estándar de MySQL
        database='reddispositivos',                  # Nombre de la base de datos
        user='',                                     # Usuario de la base de datos
        password=''                                  # Contraseña del usuario
    )

# Función para extraer datos de la tabla `dispositivos`
def extract_data():
    """
    Extrae datos de la base de datos desde la tabla 'dispositivos'.
    """
    try:
        conn = get_connection()                                   # Obtiene la conexión a la base de datos
        cursor = conn.cursor(dictionary=True)                     # Cursor para ejecutar consultas (con resultados como diccionario)
        query = "SELECT * FROM dispositivos"                      # Consulta SQL para extraer datos de la tabla
        cursor.execute(query)                                     # Ejecuta la consulta
        results = cursor.fetchall()                               # Obtiene todos los resultados
        logging.info(f"Se extrajeron {len(results)} registros.")  # Registra el número de registros extraídos
        return results                                            # Devuelve los datos extraídos
    except Error as e:
        # Maneja errores en la extracción y los registra en los logs
        logging.error(f"Error al extraer datos: {e}")
        return []
    finally:
        # Cierra la conexión y el cursor para liberar recursos
        if conn.is_connected():
            cursor.close()
            conn.close()

# Función para cargar datos transformados en la base de datos
def load_data(df):
    """
    Carga un DataFrame transformado a la base de datos en la tabla 'dispositivos'.
    """
    try:
        conn = get_connection()  # Obtiene la conexión a la base de datos
        cursor = conn.cursor()  # Cursor para ejecutar las consultas SQL
        
        # Recorre cada fila del DataFrame transformado
        for _, row in df.iterrows():
            # Consulta SQL para insertar o actualizar los datos (UPSERT)
            query = """
                INSERT INTO dispositivos (
                    id_dispositivo, nombre, modelo, fabricante, tipo, uptime, firmware_version, fecha_ultima_consulta
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    nombre=VALUES(nombre),
                    modelo=VALUES(modelo),
                    fabricante=VALUES(fabricante),
                    tipo=VALUES(tipo),
                    uptime=VALUES(uptime),
                    firmware_version=VALUES(firmware_version),
                    fecha_ultima_consulta=VALUES(fecha_ultima_consulta);
            """
            # Ejecuta la consulta con los valores de la fila
            cursor.execute(query, tuple(row))
        
        conn.commit()  # Confirma los cambios en la base de datos
        logging.info(f"Carga completada. {len(df)} registros procesados.")  # Log de éxito
    except Error as e:
        # Manejo de errores en la carga
        logging.error(f"Error al cargar datos: {e}")
    finally:
        # Cierra la conexión y el cursor para liberar recursos
        if conn.is_connected():
            cursor.close()
            conn.close()

# Ejecución periódica del pipeline ETL
if __name__ == "__main__":
    while True:                                      # Bucle infinito para ejecutar continuamente
        # Extracción de datos
        data = extract_data()                        # Llama a la función de extracción
        if data:
            # Simulación de transformación
            df = pd.DataFrame(data)                 # Convierte los datos extraídos a un DataFrame para transformación
            # Puedes realizar transformaciones aquí antes de cargar los datos

            # Carga de datos
            load_data(df)                           # Llama a la función de carga
        
        time.sleep(1800)                             # Espera 1/2 hora antes de volver a ejecutar (1800 segundos)
