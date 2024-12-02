import subprocess
import json
import csv
import ipaddress
import re
from scapy.all import ICMP, IP, sr1

def cargar_base_datos(archivo_csv):
    print(f"Cargando base de datos desde {archivo_csv}...")
    base_datos = {}
    with open(archivo_csv, mode="r", encoding="utf-8") as archivo:
        lector = csv.reader(archivo)
        next(lector)
        for fila in lector:
            mac_prefix = fila[0]
            fabricante = fila[1]
            base_datos[mac_prefix] = fabricante
    print(f"Base de datos cargada. Entradas: {len(base_datos)}")
    return base_datos

def escanear_red(rango_red):
    print(f"Escanear red: {rango_red}...")
    try:
        resultado = subprocess.check_output(
            ["nmap", "-sn", rango_red],
            stderr=subprocess.STDOUT, universal_newlines=True
        )
        dispositivos = []
        for line in resultado.split('\n'):
            if 'Nmap scan report for' in line:
                # Extraer dirección IP, manejando el caso con hostname y sin hostname
                match = re.search(r'Nmap scan report for (.*)', line)
                if match:
                    target = match.group(1)
                    # Si hay un paréntesis, extraer lo que está dentro de él
                    if '(' in target and ')' in target:
                        ip = target[target.find('(')+1 : target.find(')')]
                    else:
                        ip = target.strip()
                    dispositivos.append({
                        "IP": ip,
                        "MAC": "Desconocido"
                    })
        print(f"Dispositivos encontrados: {len(dispositivos)}")
        return dispositivos
    except subprocess.CalledProcessError as e:
        print(f"Error al escanear la red: {e}")
        return []

def escanear_puertos(ip):
    print(f"Escanear puertos para {ip}...")
    try:
        resultado = subprocess.check_output(
            ["nmap", "-sU", "-p", "22,23,25,53,80,443,8080,161,5000,3389,67,69", ip],
            stderr=subprocess.STDOUT, universal_newlines=True
        )
        puertos_abiertos = []

        for linea in resultado.splitlines():
            if "open" in linea:
                puertos_abiertos.append(linea.split()[0])
        print(f"Puertos abiertos en {ip}: {puertos_abiertos}")
        return puertos_abiertos
    except subprocess.CalledProcessError as e:
        print(f"Error al escanear los puertos de {ip}: {e}")
        return []

def obtener_latencia(ip):
    print(f"Obteniendo latencia para {ip}...")
    try:
        resultado = subprocess.check_output(
            ["ping", "-c", "1", ip],
            stderr=subprocess.STDOUT, universal_newlines=True
        )

        # Buscar la línea que contiene 'time='
        for line in resultado.split('\n'):
            if 'time=' in line:
                tiempo_match = re.search(r'time=(\d+\.\d+)', line)
                if tiempo_match:
                    tiempo_ms = tiempo_match.group(1)
                    print(f"Latencia para {ip}: {tiempo_ms} ms")
                    return f"{tiempo_ms} ms"
        print(f"No se pudo obtener la latencia para {ip}")
        return "Desconocido"
    except subprocess.CalledProcessError:
        print(f"Fallo al obtener latencia para {ip}")
        return "Desconocido"

def deducir_tipo_dispositivo(puertos_abiertos):
    print(f"Deduciendo tipo de dispositivo basado en puertos abiertos: {puertos_abiertos}")
    if any("22/" in puerto for puerto in puertos_abiertos):
        return "Servidor o dispositivo con SSH"
    elif any("80/" in puerto or "443/" in puerto for puerto in puertos_abiertos):
        return "Web Server (Servidor Web)"
    elif any("8080/" in puerto for puerto in puertos_abiertos):
        return "Proxy o Servidor Web (alternativo)"
    elif any("3389/" in puerto for puerto in puertos_abiertos):
        return "PC (Escritorio o Laptop) - Escritorio Remoto"
    elif any("23/" in puerto for puerto in puertos_abiertos):
        return "Dispositivo con Telnet (Router, Switch)"
    elif any("161/" in puerto for puerto in puertos_abiertos):
        return "Dispositivo de red (Switch, Router, Impresora, Cámaras IP)"
    elif any("5000/" in puerto for puerto in puertos_abiertos):
        return "Cámara IP o Dispositivo de Red"
    elif any("67/" in puerto for puerto in puertos_abiertos):
        return "Router o Servidor DHCP"
    elif any("69/" in puerto for puerto in puertos_abiertos):
        return "Dispositivo de red con TFTP (Posiblemente un switch)"
    else:
        return "Desconocido"

def main():
    print("Inicio del programa de escaneo de red")
    subredes = ["192.168.1.0/24", "192.168.2.0/24", "192.168.3.0/24"]  # Lista de subredes a escanear
    archivo_csv = "mac-vendors-export.csv"

    base_datos = cargar_base_datos(archivo_csv)

    resultados = {"Dispositivos": []}

    # Obtener la subred local para identificar dispositivos en la misma subred
    try:
        interfaz = subprocess.check_output(
            ["ip", "route", "get", "8.8.8.8"],
            stderr=subprocess.STDOUT, universal_newlines=True
        )
        match = re.search(r'dev\s+(\S+)', interfaz)
        if match:
            nombre_interfaz = match.group(1)
            direccion_ip = subprocess.check_output(
                ["ip", "addr", "show", nombre_interfaz],
                stderr=subprocess.STDOUT, universal_newlines=True
            )
            ip_match = re.search(r'inet\s+(\d+\.\d+\.\d+\.\d+)/(\d+)', direccion_ip)
            if ip_match:
                ip_local = ip_match.group(1)
                prefijo = ip_match.group(2)
                subred_local = f"{ip_local}/{prefijo}"
                red_local = ipaddress.IPv4Network(subred_local, strict=False)
            else:
                red_local = None
        else:
            red_local = None
    except subprocess.CalledProcessError:
        red_local = None

    for rango in subredes:
        print(f"\nEscaneando la subred: {rango}")
        dispositivos_encontrados = escanear_red(rango)

        for dispositivo in dispositivos_encontrados:
            mac_address = dispositivo['MAC']
            ip_dispositivo = dispositivo['IP']

            # Intentar obtener la MAC si el dispositivo está en la misma subred local
            if red_local and ipaddress.IPv4Address(ip_dispositivo) in red_local:
                try:
                    respuesta_arp = subprocess.check_output(
                        ["arp", "-n", ip_dispositivo],
                        stderr=subprocess.STDOUT, universal_newlines=True
                    )
                    mac_match = re.search(r"(([a-fA-F0-9]{2}:){5}[a-fA-F0-9]{2})", respuesta_arp)
                    if mac_match:
                        mac_address = mac_match.group(1)
                except subprocess.CalledProcessError:
                    pass

            mac_prefix = mac_address[:8].upper()
            fabricante = base_datos.get(mac_prefix, "Desconocido")

            puertos_abiertos = escanear_puertos(ip_dispositivo)
            latencia = obtener_latencia(ip_dispositivo)

            tipo_dispositivo = deducir_tipo_dispositivo(puertos_abiertos)

            dispositivo_info = {
                "IP": ip_dispositivo,
                "MAC": mac_address,
                "Fabricante": fabricante,
                "Tipo de dispositivo": tipo_dispositivo,
                "Escaneo de puertos": puertos_abiertos if puertos_abiertos else [],
                "Latencia (ms)": latencia
            }

            resultados["Dispositivos"].append(dispositivo_info)

    print("\nGuardando resultados en JSON...")
    with open("test.json", "w", encoding="utf-8") as archivo_json:
        json.dump(resultados, archivo_json, ensure_ascii=False, indent=4)

    print("El escaneo ha terminado y los resultados se han guardado en 'test.json'.")
    print("Fin del programa")

if __name__ == "__main__":
    main()
