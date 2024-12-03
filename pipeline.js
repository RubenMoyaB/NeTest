// Importamos las bibliotecas necesarias
const mysql = require('mysql2/promise'); // Biblioteca para manejar la conexión a MySQL de forma asíncrona
const fs = require('fs');               // Biblioteca para manejar archivos en el sistema de archivos (opcional para logs)

// Configuración de la conexión a la base de datos
const dbConfig = {
    host: '127.0.0.1',    // Dirección del servidor de base de datos
    port: 8080,           // Puerto donde se encuentra la base de datos
    database: 'reddispositivos', // Nombre de la base de datos que vamos a usar
    user: '',             // Nombre de usuario para autenticar
    password: ''          // Contraseña del usuario
};

// Función para extraer datos de la base de datos
async function extractData() {
    let connection; // Variable para manejar la conexión a la base de datos
    try {
        // Establece la conexión usando la configuración definida
        connection = await mysql.createConnection(dbConfig);

        // Ejecuta la consulta SQL para extraer todos los datos de la tabla `dispositivos`
        const [rows] = await connection.execute("SELECT * FROM dispositivos");

        // Imprime en consola la cantidad de registros extraídos
        console.log(`Se extrajeron ${rows.length} registros.`);

        return rows; // Retorna los datos extraídos como un array de objetos JSON
    } catch (error) {
        // Manejo de errores: si ocurre un problema, imprime un mensaje en la consola
        console.error(`Error al extraer datos: ${error.message}`);
        return []; // Retorna un array vacío si ocurre un error
    } finally {
        // Asegura que la conexión a la base de datos se cierre, incluso si ocurre un error
        if (connection) await connection.end();
    }
}

// Función para cargar datos transformados en la base de datos
async function loadData(data) {
    let connection; // Variable para manejar la conexión a la base de datos
    try {
        // Establece la conexión usando la configuración definida
        connection = await mysql.createConnection(dbConfig);

        // Consulta SQL para insertar o actualizar registros en la tabla `dispositivos`
        const query = `
            INSERT INTO dispositivos (
                id_dispositivo, nombre, modelo, fabricante, tipo, uptime, firmware_version, fecha_ultima_consulta
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                nombre=VALUES(nombre),
                modelo=VALUES(modelo),
                fabricante=VALUES(fabricante),
                tipo=VALUES(tipo),
                uptime=VALUES(uptime),
                firmware_version=VALUES(firmware_version),
                fecha_ultima_consulta=VALUES(fecha_ultima_consulta);
        `;

        // Recorremos el array de datos y ejecutamos la consulta para cada registro
        for (const row of data) {
            await connection.execute(query, [
                row.id_dispositivo,         // ID del dispositivo
                row.nombre,                 // Nombre del dispositivo
                row.modelo,                 // Modelo del dispositivo
                row.fabricante,             // Fabricante del dispositivo
                row.tipo,                   // Tipo (Switch, Router, etc.)
                row.uptime,                 // Tiempo en línea del dispositivo
                row.firmware_version,       // Versión del firmware
                row.fecha_ultima_consulta   // Fecha de la última consulta
            ]);
        }

        // Mensaje en consola indicando que la carga se completó correctamente
        console.log(`Carga completada. ${data.length} registros procesados.`);
    } catch (error) {
        // Manejo de errores: si ocurre un problema, imprime un mensaje en la consola
        console.error(`Error al cargar datos: ${error.message}`);
    } finally {
        // Asegura que la conexión a la base de datos se cierre, incluso si ocurre un error
        if (connection) await connection.end();
    }
}

// Función principal que coordina la ejecución del proceso ETL
async function etlPipeline() {
    while (true) { // Bucle infinito para ejecutar el proceso ETL de forma periódica
        try {
            // Paso 1: Extracción de datos
            const data = await extractData();

            if (data.length > 0) {
                // Paso 2: Transformación de datos (simulación)
                // Aquí podemos aplicar modificaciones a los datos antes de cargarlos
                const transformedData = data.map(item => ({
                    ...item,
                    fecha_ultima_consulta: new Date().toISOString() // Añade o actualiza la fecha actual
                }));

                // Paso 3: Carga de datos transformados en la base de datos
                await loadData(transformedData);
            }

            // Mensaje indicando que el proceso esperará 30 minutos antes de volver a ejecutarse
            console.log('Esperando 30 minutos para la siguiente ejecución...');
            await new Promise(resolve => setTimeout(resolve, 1800 * 1000)); // Pausa de 30 minutos
        } catch (error) {
            // Manejo de errores en el proceso ETL
            console.error(`Error en el pipeline ETL: ${error.message}`);
        }
    }
}

// Inicia la ejecución del pipeline ETL
etlPipeline();
