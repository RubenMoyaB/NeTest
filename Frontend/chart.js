
import Chart from 'chart.js/auto';

export function createTrafficChart(data) {
    const ctx = document.getElementById('traffic-chart').getContext('2d');

    
    const trafficChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map((_, index) => index + 1), 
            datasets: [
                {
                    label: 'Bytes Enviados',
                    data: data.map(item => item.bytes_sent),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    fill: false
                },
                {
                    label: 'Bytes Recibidos',
                    data: data.map(item => item.bytes_recv),
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    enabled: true
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Puntos en el tiempo'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Bytes'
                    }
                }
            }
        }
    });
}
