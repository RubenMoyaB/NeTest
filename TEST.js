const nmap = require('nmap');
const schedule = require('node-schedule');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

// Ruta al archivo CSV de fabricantes
const archivoCSVFabricantes = path.join(__dirname, 'mac-vendors.csv');

// Función para cargar la base de datos de fabricantes desde el CSV
function cargarFabricantes(archivoCSV) {
    return new Promise((resolve, reject) => {
        const fabricantes = {};
        fs.createReadStream(archivoCSV)
            .pipe(csv())
            .on('data', (fila) => {
                const prefix = fila['MAC Prefix'].toUpperCase();
                const fabricante = fila['Manufacturer'].trim();
                fabricantes[prefix] = fabricante;
            })
            .on('end', () => {
                resolve(fabricantes);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

// Función para descubrir dispositivos en la red
function escanearDispositivos(rangoRed) {
    return new Promise((resolve, reject) => {
        const scan = new nmap.NmapScan(rangoRed, '-sn'); // Ping scan
        scan.on('complete', (data) => {
            const dispositivos = data.map(dispositivo => ({
                IP: dispositivo.ip,
                MAC: dispositivo.mac || 'Desconocido',
                Fabricante: obtenerFabricante(dispositivo.mac),
                TipoDispositivo: "Desconocido" // Puedes mejorar este campo con un análisis avanzado
            }));
            resolve(dispositivos);
        });
        scan.on('error', (error) => reject(error));
        scan.start();
    });
}

// Objeto para almacenar los fabricantes cargados desde el CSV
let fabricantes = {};

// Función para obtener el fabricante por MAC
function obtenerFabricante(mac) {
    if (!mac) return "Desconocido";
    const prefix = mac.split(':').slice(0, 3).join(':').toUpperCase();
    return fabricantes[prefix] || "Desconocido";
}

// Función para escanear puertos abiertos
function escanearPuertos(ip) {
    return new Promise((resolve, reject) => {
        const scan = new nmap.NmapScan(ip, '-sU'); // Escaneo de puertos UDP
        scan.on('complete', (data) => {
            if (data.length === 0) {
                resolve([]);
                return;
            }
            const puertos = data[0].openPorts.map(p => `${p.port}/${p.protocol}`);
            resolve(puertos);
        });
        scan.on('error', (error) => reject(error));
        scan.start();
    });
}

// Función para capturar métricas de tráfico (simuladas)
function capturarTrafico() {
    return {
        ICMP: { Timestamp: "Sin tráfico", Cantidad: 0 },
        UDP: { Timestamp: new Date().toISOString(), Cantidad: Math.floor(Math.random() * 2000) },
        ARP: { Timestamp: "Sin tráfico", Cantidad: 0 },
        TCP: { Timestamp: new Date().toISOString(), Cantidad: Math.floor(Math.random() * 100) }
    };
}

// Función para generar métricas de red (simuladas)
function generarMetricasRed() {
    const metricas = [];
    const ahora = new Date();
    for (let i = 0; i < 10; i++) {
        const timestamp = new Date(ahora.getTime() - (i * 1000)).toISOString();
        metricas.push({
            Timestamp: timestamp,
            "Datos enviados (MB)": parseFloat((Math.random() * 200).toFixed(2)),
            "Datos recibidos (MB)": parseFloat((Math.random() * 4000).toFixed(2))
        });
    }
    return metricas;
}

// Función principal para ejecutar el pipeline
async function ejecutarPipeline() {
    try {
        console.log(`[${new Date().toISOString()}] Iniciando pipeline...`);

        // Escanear dispositivos en la red
        const rangoRed = '192.168.100.0/24'; // Ajusta esto a tu rango de red
        const dispositivos = await escanearDispositivos(rangoRed);

        // Agregar información adicional como escaneo de puertos
        for (const dispositivo of dispositivos) {
            dispositivo.EscaneoDePuertos = await escanearPuertos(dispositivo.IP);
            dispositivo.Latencia = '0ms'; // Este campo es estático aquí, pero podrías medirlo.
        }

        // Capturar tráfico y métricas de red
        const trafico = capturarTrafico();
        const metricasRed = generarMetricasRed();

        // Resultado final
        const resultado = {
            "Dispositivos": dispositivos,
            "Tráfico": trafico,
            "Métricas de Red": metricasRed
        };

        // Guardar en un archivo JSON
        const archivoSalida = path.join(__dirname, 'resultado.json');
        fs.writeFileSync(archivoSalida, JSON.stringify(resultado, null, 4), 'utf8');
        console.log(`[${new Date().toISOString()}] Resultados guardados en ${archivoSalida}`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error en el pipeline:`, error);
    }
}

// Función para inicializar el pipeline
async function inicializarPipeline() {
    try {
        console.log("Cargando base de datos de fabricantes desde CSV...");
        fabricantes = await cargarFabricantes(archivoCSVFabricantes);
        console.log("Base de datos de fabricantes cargada exitosamente.");

        // Ejecutar el pipeline inmediatamente al iniciar
        await ejecutarPipeline();

        // Programar la ejecución cada 30 minutos
        schedule.scheduleJob('*/30 * * * *', () => {
            ejecutarPipeline();
        });

        console.log("Pipeline configurado para ejecutarse cada 30 minutos.");
    } catch (error) {
        console.error("Error al inicializar el pipeline:", error);
    }
}

// Iniciar el pipeline
inicializarPipeline();
