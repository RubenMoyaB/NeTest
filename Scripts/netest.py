import csv
import json
from scapy.all import ARP, Ether, srp

def cargar_base_datos(archivo_csv):
    """
    Carga una base de datos OUI desde un archivo CSV.
    :param archivo_csv: Ruta del archivo CSV.
    :return: Diccionario con los prefijos MAC como claves y los fabricantes como valores.
    """
    base_datos = {}
    with open(archivo_csv, mode="r", encoding="utf-8") as f:  # Especificar la codificación
        lector = csv.reader(f)
        next(lector)  # Saltar la cabecera
        for fila in lector:
            mac_prefix = fila[0].upper()  # Prefijo MAC en mayúsculas
            vendor_name = fila[1].strip('"')  # Nombre del fabricante
            base_datos[mac_prefix] = vendor_name
    return base_datos

def obtener_fabricante_local(mac, base_datos):
    """
    Busca el fabricante de una MAC en la base local.
    :param mac: Dirección MAC.
    :param base_datos: Diccionario de fabricantes.
    :return: Fabricante o 'Desconocido'.
    """
    oui = ":".join(mac.split(":")[:3]).upper()  # Extrae los primeros 3 octetos
    return base_datos.get(oui, "Desconocido")

def escanear_red(rango_red):
    """
    Escanea dispositivos activos en la red mediante ARP.
    :param rango_red: Rango de IPs a escanear.
    :return: Lista de dispositivos detectados con IP y MAC.
    """
    paquete = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(pdst=rango_red)
    # Enviar el paquete y recibir las respuestas
    resultado = srp(paquete, timeout=2, verbose=0)[0]

    dispositivos = []
    for _, recibido in resultado:
        dispositivos.append({
            "IP": recibido.psrc,
            "MAC": recibido.hwsrc
        })

    return dispositivos

def guardar_en_json(dispositivos, archivo_salida):
    """
    Guarda la información de los dispositivos detectados en un archivo JSON.
    :param dispositivos: Lista de dispositivos.
    :param archivo_salida: Ruta del archivo JSON de salida.
    """
    with open(archivo_salida, "w", encoding="utf-8") as f:
        json.dump(dispositivos, f, ensure_ascii=False, indent=4)

if __name__ == "__main__":
    # Ruta al archivo CSV de la base de datos OUI
    archivo_csv = "mac-vendors-export.csv"  # Cambia esto por la ubicación de tu archivo

    # Cargar la base de datos
    base_datos = cargar_base_datos(archivo_csv)

    # Escanear la red
    rango = "192.168.100.1/24"  # Cambia esto según tu red
    print(f"Escaneando la red: {rango}...\n")
    dispositivos_encontrados = escanear_red(rango)

    # Lista para almacenar la información de los dispositivos con sus fabricantes
    dispositivos_info = []

    # Obtener el fabricante para cada dispositivo y agregar a la lista
    for dispositivo in dispositivos_encontrados:
        mac = dispositivo['MAC']
        fabricante = obtener_fabricante_local(mac, base_datos)
        dispositivo_info = {
            "IP": dispositivo['IP'],
            "MAC": mac,
            "Fabricante": fabricante
        }
        dispositivos_info.append(dispositivo_info)

    # Guardar los resultados en un archivo JSON
    archivo_salida = "dispositivos_detectados.json"
    guardar_en_json(dispositivos_info, archivo_salida)

    print(f"Los resultados se han guardado en {archivo_salida}")
