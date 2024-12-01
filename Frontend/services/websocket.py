import asyncio
import websockets
import psutil
import json
import time

# Función para capturar el tráfico de red durante 20 segundos
def get_network_usage():
    print("Iniciando la recopilación de datos de red...")
    network_data = []
    for _ in range(20):  # Obtener datos cada segundo durante 20 segundos
        net_io = psutil.net_io_counters()
        network_data.append({
            'bytes_sent': net_io.bytes_sent,
            'bytes_recv': net_io.bytes_recv,
        })
        time.sleep(1)
    
    print("Recopilación de datos finalizada.")
    return network_data

async def manejar_conexion(websocket, path):
    print("Esperando solicitud de datos del frontend...")
    mensaje = await websocket.recv()  # Espera hasta recibir el mensaje
    print("Solicitud recibida, comenzando a recopilar datos...")
    
    if mensaje == "iniciar":  # Cuando recibe "iniciar", comienza a monitorear
        data = get_network_usage()
        # Enviar los datos recopilados al frontend
        await websocket.send(json.dumps(data))  # Enviar datos en formato JSON
        print("Datos enviados al frontend.")
    else:
        await websocket.send("Solicitud no válida")  # Enviar error si no recibe "iniciar"

# Configuración del servidor WebSocket
async def main():
    async with websockets.serve(manejar_conexion, "localhost", 8765):
        print("Servidor WebSocket escuchando en ws:
        await asyncio.Future()  # Mantiene el servidor corriendo

# Ejecutar el servidor
asyncio.run(main())
