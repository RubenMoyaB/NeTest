// Importar la biblioteca mysql2/promise para manejar la conexión a la base de datos
const mysql = require('mysql2/promise');
// Importar el módulo fs para leer el archivo JSON
const fs = require('fs');

// Configuración de conexión a la base de datos MySQL en Amazon RDS
const dbConfig = {
    host: 'dxdyhwsb.us-east-1.rds.amazonaws.com', // Hostname de la base de datos
    port: 3306, // Puerto estándar de MySQL
    user: 'aj1gumw6o3rvr00g', // Usuario de la base de datos
    password: '', // Reemplaza con tu contraseña
    database: 'reddispositivos', // Nombre de la base de datos
};

async function insertarDatos() {
    try {
        // Leer el archivo JSON y convertirlo a un objeto JavaScript
        const data = fs.readFileSync('resultado.json', 'utf8'); // Leer el archivo JSON
        const dispositivos = JSON.parse(data).Dispositivos; // Parsear el JSON y acceder al array "Dispositivos"

        // Establecer conexión con la base de datos
        const connection = await mysql.createConnection(dbConfig);

        // Iterar sobre cada dispositivo del JSON
        for (const dispositivo of dispositivos) {
            // Insertar datos del dispositivo en la tabla `dispositivos`
            const [result] = await connection.execute(
                `INSERT INTO dispositivos (ip, mac, fabricante, tipo, latencia_ms)
                 VALUES (?, ?, ?, ?, ?)`, // Consulta SQL con valores dinámicos
                [
                    dispositivo.IP, // Dirección IP del dispositivo
                    dispositivo.MAC === 'Desconocido' ? null : dispositivo.MAC, // Manejar "Desconocido" como NULL
                    dispositivo.Fabricante === 'Desconocido' ? null : dispositivo.Fabricante, // Igual que arriba
                    dispositivo['Tipo de dispositivo'] === 'Desconocido' ? null : dispositivo['Tipo de dispositivo'], // Tipo del dispositivo
                    dispositivo['Latencia (ms)'] === 'Desconocido' // Manejar la latencia en milisegundos
                        ? null
                        : parseFloat(dispositivo['Latencia (ms)'].replace(' ms', '')), // Convertir a número
                ]
            );

            // Obtener el ID generado automáticamente para el dispositivo
            const idDispositivo = result.insertId;

            // Insertar los puertos escaneados asociados al dispositivo en la tabla `puertos`
            for (const puerto of dispositivo['Escaneo de puertos']) {
                await connection.execute(
                    `INSERT INTO puertos (id_dispositivo, puerto) VALUES (?, ?)`, // Consulta SQL para puertos
                    [idDispositivo, puerto] // Asociar el ID del dispositivo con el puerto
                );
            }
        }

        // Confirmar que los datos se han insertado correctamente
        console.log('Datos insertados correctamente en la base de datos remota.');

        // Cerrar la conexión con la base de datos
        await connection.end();
    } catch (error) {
        // Manejar errores en el proceso de inserción
        console.error('Error al insertar datos:', error);
    }
}

// Ejecutar la función principal
insertarDatos();
