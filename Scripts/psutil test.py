import pyshark
import time
import json

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
            print(f"Segundos transcurridos: {segundos_transcurridos}")

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

if __name__ == "__main__":
    duracion = 5
    interfaz = "Ethernet"
    trafico = capturar_paquetes(duracion=duracion, interfaz=interfaz)

    # Guardar en archivo JSON
    with open("metricas_trafico.json", "w") as archivo_json:
        json.dump(trafico, archivo_json, indent=4)

    print(json.dumps(trafico, indent=4))
