import subprocess
import json
import csv
from datetime import datetime
from scapy.all import ARP, Ether, srp
import psutil
import pyshark

def cargar_base_datos(archivo_csv):
    print("1. Base de Datos")
    base_datos = {}
    with open(archivo_csv, mode="r", encoding="utf-8") as archivo:
        lector = csv.reader(archivo)
        next(lector)
        for fila in lector:
            mac_prefix = fila[0]
            fabricante = fila[1]
            base_datos[mac_prefix] = fabricante
    return base_datos

def escanear_red(rango_red):
    print("2. Escaneo de Red")
    paquete = Ether(dst="ff:ff:ff:ff:ff:ff") / ARP(pdst=rango_red)
    resultado = srp(paquete, timeout=2, verbose=0)[0]

    dispositivos = []
    for _, recibido in resultado:
        dispositivos.append({
            "IP": recibido.psrc,
            "MAC": recibido.hwsrc
        })

    return dispositivos

def escanear_puertos(ip):
    print("3. Escaneo de Puertos")
    try:
        resultado = subprocess.check_output(
            ["nmap", "-sU", "-p", "22,23,25,53,80,443,8080,161,5000,3389,161,67,69,161", ip],
            stderr=subprocess.STDOUT, universal_newlines=True
        )
        puertos_abiertos = []

        for linea in resultado.splitlines():
            if "open" in linea:
                puertos_abiertos.append(linea.split()[0])

        return puertos_abiertos
    except subprocess.CalledProcessError as e:
        print(f"Error al escanear los puertos de {ip}: {e}")
        return []

def obtener_latencia(ip, timeout=5):
    print("4. Latencia")
    try:
        resultado = subprocess.Popen(
            ["ping", "-n", "1", ip],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        try:
            stdout, stderr = resultado.communicate(timeout=timeout)
        except subprocess.TimeoutExpired:
            print(f"Tiempo de espera agotado para {ip}")
            return "Desconocido"

        lineas = stdout.splitlines()
        ultima_linea = lineas[-1]

        if "Media =" in ultima_linea:
            tiempo = ultima_linea.split("Media = ")[1]
            return tiempo
        return "Desconocido"
    except subprocess.CalledProcessError:
        return "Desconocido"

import time

from datetime import datetime
import psutil
import time

def obtener_metricas_red():
    print("6. Métricas de Red")
    metricas_por_segundo = []  # Lista para guardar métricas por segundo

    print("Midiendo métricas durante 10 segundos...")
    for segundos_restantes in range(10, 0, -1):
        metricas = psutil.net_io_counters()
        
        # Obtener el timestamp y convertirlo al formato deseado
        timestamp_actual = datetime.now().strftime("%d/%m/%y - %H:%M:%S")

        # Convertir bytes a megabytes (1 MB = 1024 * 1024 bytes)
        datos_enviados_mb = metricas.bytes_sent / (1024 * 1024)
        datos_recibidos_mb = metricas.bytes_recv / (1024 * 1024)

        # Guardar las métricas actuales en la lista
        metricas_por_segundo.append({
            "Timestamp": timestamp_actual,
            "Datos enviados (MB)": round(datos_enviados_mb, 2),
            "Datos recibidos (MB)": round(datos_recibidos_mb, 2)
        })

        # Mostrar en pantalla cuánto tiempo queda
        print(f"Faltan {segundos_restantes} segundos...")
        time.sleep(1)

    print("Medición completada.")
    return metricas_por_segundo

def deducir_tipo_dispositivo(puertos_abiertos):
    print("5. Tipo de Dispositivo")
    if "22/tcp" in puertos_abiertos:
        return "Servidor o dispositivo con SSH"
    elif "80/tcp" in puertos_abiertos or "443/tcp" in puertos_abiertos:
        return "Web Server (Servidor Web)"
    elif "8080/tcp" in puertos_abiertos:
        return "Proxy o Servidor Web (alternativo)"
    elif "3389/tcp" in puertos_abiertos:
        return "PC (Escritorio o Laptop) - Escritorio Remoto"
    elif "23/tcp" in puertos_abiertos:
        return "Dispositivo con Telnet (Router, Switch)"
    elif "161/udp" in puertos_abiertos:
        return "Dispositivo de red (Switch, Router, Impresora, Cámaras IP)"
    elif "5000/tcp" in puertos_abiertos:
        return "Cámara IP o Dispositivo de Red"
    elif "67/udp" in puertos_abiertos:
        return "Router o Servidor DHCP"
    elif "69/udp" in puertos_abiertos:
        return "Dispositivo de red con TFTP (Posiblemente un switch)"
    else:
        return "Desconocido"
    
import pyshark

def capturar_paquetes(duracion, interfaz):
    print(f"Capturando tráfico durante {duracion} segundos...")

    # Captura en vivo de tráfico UDP, ICMP, ARP y TCP
    captura = pyshark.LiveCapture(interface=interfaz, display_filter="icmp or udp or arp or tcp")

    # Diccionario para almacenar las métricas
    metricas = {
        "ICMP": {"Timestamp": None, "Cantidad": 0},
        "UDP": {"Timestamp": None, "Cantidad": 0},
        "ARP": {"Timestamp": None, "Cantidad": 0},
        "TCP": {"Timestamp": None, "Cantidad": 0},
    }

    inicio = time.time()
    try:
        # Captura de paquetes durante el tiempo especificado
        for paquete in captura.sniff_continuously():
            segundos_transcurridos = int(time.time() - inicio)
            #print(f"Segundos transcurridos: {segundos_transcurridos}")

            # Detener captura después del tiempo especificado
            if segundos_transcurridos >= duracion:
                break

            timestamp = time.strftime("%d/%m/%y - %H:%M:%S")

            # Si el paquete es ICMP
            if 'ICMP' in paquete:
                if metricas["ICMP"]["Cantidad"] == 0:
                    metricas["ICMP"]["Timestamp"] = timestamp
                metricas["ICMP"]["Cantidad"] += 1

            # Si el paquete es UDP
            elif 'UDP' in paquete:
                if metricas["UDP"]["Cantidad"] == 0:
                    metricas["UDP"]["Timestamp"] = timestamp
                metricas["UDP"]["Cantidad"] += 1

            # Si el paquete es ARP
            elif 'ARP' in paquete:
                if metricas["ARP"]["Cantidad"] == 0:
                    metricas["ARP"]["Timestamp"] = timestamp
                metricas["ARP"]["Cantidad"] += 1

            # Si el paquete es TCP
            elif 'TCP' in paquete:
                if metricas["TCP"]["Cantidad"] == 0:
                    metricas["TCP"]["Timestamp"] = timestamp
                metricas["TCP"]["Cantidad"] += 1

    finally:
        captura.close()

    # Asignar un timestamp y cantidad cero si no hubo tráfico
    for tipo in metricas:
        if metricas[tipo]["Cantidad"] == 0:
            metricas[tipo]["Timestamp"] = "Sin trafico"
            metricas[tipo]["Cantidad"] = 0

    print("Captura de tráfico completada.")
    return metricas


def main():
    rango = "192.168.100.1/24"
    archivo_csv = "mac-vendors-export.csv"

    base_datos = cargar_base_datos(archivo_csv)
    
    print(f"Escaneando la red: {rango}...\n")
    dispositivos_encontrados = escanear_red(rango)
    
    resultados = {"Dispositivos": []}
    metricas_red = obtener_metricas_red()

    # Capturar tráfico ICMP durante 10 segundos
    trafico_icmp = capturar_paquetes(duracion=10, interfaz="Ethernet")

    for dispositivo in dispositivos_encontrados:
        mac_prefix = dispositivo['MAC'][:8].upper()
        fabricante = base_datos.get(mac_prefix, "Desconocido")
        print(f"\nIP: {dispositivo['IP']}")
        puertos_abiertos = escanear_puertos(dispositivo['IP'])
        latencia = obtener_latencia(dispositivo['IP'])
        
        tipo_dispositivo = deducir_tipo_dispositivo(puertos_abiertos)

        dispositivo_info = {
            "IP": dispositivo['IP'],
            "MAC": dispositivo['MAC'],
            "Fabricante": fabricante,
            "Tipo de dispositivo": tipo_dispositivo,
            "Escaneo de puertos": puertos_abiertos if puertos_abiertos else [],
            "Latencia (ms)": latencia
        }
        
        resultados["Dispositivos"].append(dispositivo_info)
    
    # Añadir la sección de tráfico ICMP a los resultados
    resultados["Tráfico"] = trafico_icmp
    resultados["Métricas de Red"] = metricas_red

    # Guardar los resultados en un archivo JSON
    with open("test.json", "w", encoding="utf-8") as archivo_json:
        json.dump(resultados, archivo_json, ensure_ascii=False, indent=4)
    
    print("El escaneo ha terminado y los resultados se han guardado en 'test.json'.")

if __name__ == "__main__":
    main()