export function loadTrafficContent() {
    const statisticsVisual = document.getElementById('statistics-visual');
    statisticsVisual.innerHTML = `<button id="start-traffic">Iniciar Monitoreo de Tráfico</button>`;

    const startButton = document.getElementById('start-traffic');
    startButton.addEventListener('click', () => {
        const socket = new WebSocket('ws:
        
        socket.onopen = () => {
            console.log('Conexión WebSocket establecida');
            socket.send('iniciar');
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            statisticsVisual.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        };

        socket.onerror = (error) => {
            console.error('Error en WebSocket:', error);
        };

        socket.onclose = () => {
            console.log('Conexión WebSocket cerrada');
        };
    });
}
