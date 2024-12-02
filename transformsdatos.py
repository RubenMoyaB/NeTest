import pandas as pd  # Biblioteca para manipulación de datos tabulares

# Función para transformar datos extraídos
def transform_data(data):                           # Carga los datos en un DataFrame de pandas para su procesamiento
    
    df = pd.DataFrame(data)
    
    
    df = df.drop_duplicates()                       # Limpieza: Elimina registros duplicados para evitar redundancias
    
    # Transformación de tipos de datos: Convierte columnas de texto a fechas, manejando errores
    df['uptime'] = pd.to_datetime(df['uptime'], errors='coerce')  # Convierte uptime a datetime
    df['fecha_ultima_consulta'] = pd.to_datetime(df['fecha_ultima_consulta'], errors='coerce')  # Convierte fecha_ultima_consulta
    
    # Estandarización: Limpia espacios innecesarios y convierte texto a mayúsculas
    df['nombre'] = df['nombre'].str.strip().str.upper()
    
    # Registra información sobre los datos transformados
    logging.info(f"Datos transformados. {len(df)} registros listos para cargar.")
    return df  # Devuelve los datos transformados
