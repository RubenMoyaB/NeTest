
document.addEventListener('DOMContentLoaded', () => {
    const showSplashScreen = false;

    const splashScreen = document.createElement('div');
    splashScreen.id = 'splash-screen';
    splashScreen.innerHTML = 'NeTest';
    document.body.appendChild(splashScreen);

    function hideSplashScreen() {
        splashScreen.classList.add('fade-out');
        setTimeout(() => {
            splashScreen.remove();
            loadContent('trafico');
        }, 1000); 
    }

    function loadTraffic() {
        const statisticsVisual = document.getElementById('statistics-visual');
        statisticsVisual.innerHTML = `<button id="start-traffic">Iniciar Monitoreo de Tráfico</button>`;
    
        const startButton = document.getElementById('start-traffic');
        startButton.addEventListener('click', () => {
            const socket = new WebSocket('ws://localhost:8765');  
            socket.onopen = () => {
                console.log('Conexión WebSocket establecida');
                socket.send('iniciar'); 
            };
            socket.onmessage = (event) => {
                console.log('Datos recibidos: ', event.data);
                const data = JSON.parse(event.data); 
                statisticsVisual.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
            };
            socket.onerror = (error) => {
                console.error('Error en WebSocket: ', error);
            };
            socket.onclose = () => {
                console.log('Conexión WebSocket cerrada');
            };
        });
    }
    
    function loadContent(section, device = null) {
        const mainContent = document.getElementById('main-content');

        mainContent.classList.add('fade-out');

        setTimeout(() => {
            if (section === 'trafico') {
                mainContent.innerHTML = ` 
                <section>
                    <header class="app-header">
                        <h2>TRAFICO DE RED</h2>
                        <select class="minimal-dropdown">
                            <option value="option1">Opción 1</option>
                            <option value="option2">Opción 2</option>
                            <option value="option3">Opción 3</option>
                        </select>
                    </header>
                    <div class="traffic-visual" id="traffic-visual"></div>
                </section>
                <section>
                    <header class="app-header">
                        <h2>ANCHO DE BANDA</h2>
                        <select class="minimal-dropdown">
                            <option value="option1">Opción 1</option>
                            <option value="option2">Opción 2</option>
                            <option value="option3">Opción 3</option>
                        </select>
                    </header>
                    <div class="statistics-visual" id="statistics-visual"></div>
                    <div class="statistics-table" id="statistics-table"></div>
                </section>
                `;
                loadTraffic();
                setActiveButton('statistics');
            } else if (section === 'ancho_banda') {
                mainContent.innerHTML = `
                <div class="main-content-devices">
                    <div class="interfaces">
                        <h2>INTERFACES</h2>
                    </div>
                    <div class="sub-content">
                        <div class="rutas">
                            <h2>RUTAS</h2>
                        </div>
                        <div class="vlans">
                            <h2>VLANS</h2>
                        </div>
                    </div>
                </div>
                `;
                setActiveButton('devices');
            } else if (section === 'device' && device) {
                fetch('information.json')
                    .then(response => response.json())
                    .then(data => {
                        if (!data.Dispositivos || data.Dispositivos.length === 0) {
                            throw new Error('No se encontraron dispositivos en el archivo JSON.');
                        }
                        const selectedDevice = data.Dispositivos.find(dev => dev.IP === device);
                        
                        if (!selectedDevice) {
                            console.error('Dispositivo no encontrado:', device);
                            throw new Error(`Dispositivo con IP ${device} no encontrado.`);
                        }
                        mainContent.innerHTML = `
                            <section>
                                <header class="app-header">
                                    <img src="assets/switch.svg" class="switch-image">
                                    <h2>${selectedDevice["Tipo de dispositivo"]} - ${selectedDevice.Fabricante}</h2>
                                </header>
                                <section>
                                    <h2 class="titles">Información del Dispositivo</h2>
                                    <div class="device-info">
                                        <p><strong>IP:</strong> ${selectedDevice.IP}</p>
                                        <p><strong>MAC:</strong> ${selectedDevice.MAC}</p>
                                        <p><strong>Latencia:</strong> ${selectedDevice["Latencia (ms)"]}</p>
                                        <p><strong>Fabricante:</strong> ${selectedDevice.Fabricante}</p>
                                        <p><strong>Tipo de dispositivo:</strong> ${selectedDevice["Tipo de dispositivo"]}</p>
                                        <p><strong>Puertos Disponibles:</strong></p>
                                        <ul>
                                            ${selectedDevice["Escaneo de puertos"].map(puerto => `<li>${puerto}</li>`).join('')}
                                        </ul>
                                    </div>
                                </section>
                                <section>
                                    <h2 class="titles">TRÁFICO</h2>
                                    <div class="traffic-visual" id="traffic-visual"></div>
                                </section>
                            </section>
                        `;
                    })
                    .catch(error => {
                        console.error('Error al cargar el dispositivo:', error);
                        mainContent.innerHTML = `<p>Error al cargar la información del dispositivo. Por favor, intenta nuevamente.</p>`;
                    });            
            }
            mainContent.classList.remove('fade-out');
            mainContent.classList.add('fade-in');
        }, 50);
    }

function loadDevices() {
    fetch('information.json') 
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar el archivo JSON: ' + response.statusText);
            }
            return response.json(); 
        })
        .then(data => {
            const deviceListContainer = document.getElementById('device-list');
            deviceListContainer.innerHTML = ''; 

            if (!data.Dispositivos || data.Dispositivos.length === 0) {
                throw new Error('No se encontraron dispositivos en el archivo JSON.');
            }

            data.Dispositivos.forEach(device => {
                const deviceItemContainer = document.createElement('div');
                deviceItemContainer.classList.add('device-item-container');

                const deviceButton = document.createElement('button');
                deviceButton.classList.add('device-item');
                deviceButton.dataset.device = device.IP;

                const deviceInfo = document.createElement('div');
                const deviceName = document.createElement('div');
                deviceName.classList.add('device-name');
                deviceName.textContent = `${device["Tipo de dispositivo"]} ${device.Fabricante}`; 
                
                const deviceIp = document.createElement('div');
                deviceIp.classList.add('device-ip');
                deviceIp.textContent = `IP ${device.IP}`;

                const deviceLatency = document.createElement('div');
                deviceLatency.classList.add('device-latency');
                deviceLatency.textContent = `Latencia: ${device["Latencia (ms)"]}`;

                const deviceMac = document.createElement('div');
                deviceMac.classList.add('device-latency');
                deviceMac.textContent = `${device.MAC}`;

                deviceInfo.appendChild(deviceName);
                deviceInfo.appendChild(deviceIp);
                deviceInfo.appendChild(deviceMac);
                deviceInfo.appendChild(deviceLatency);
                
                deviceButton.appendChild(deviceInfo);

                deviceItemContainer.appendChild(deviceButton);
                deviceListContainer.appendChild(deviceItemContainer);

                deviceButton.addEventListener('click', () => {
                    setActiveDevice(device.IP); 
                    loadContent('device', device.IP); 
                });
            });
        })
        .catch(error => {
            console.error('Error al cargar los dispositivos:', error);
            const deviceListContainer = document.getElementById('device-list');
            deviceListContainer.innerHTML = '<p>Error al cargar los dispositivos. Por favor, intenta nuevamente.</p>';
        });
}

    function setActiveButton(activeButtonClass) {
        document.querySelectorAll('.bottom-bar-btn').forEach(button => {
            button.classList.remove('active');
        });

        document.querySelectorAll('.device-item').forEach(deviceButton => {
            deviceButton.classList.remove('active');
        });

        const activeButton = document.querySelector(`.${activeButtonClass}`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    function setActiveDevice(device) {
        document.querySelectorAll('.device-item').forEach(deviceButton => {
            deviceButton.classList.remove('active');
        });

        const activeDevice = document.querySelector(`.device-item[data-device="${device}"]`);
        if (activeDevice) {
            activeDevice.classList.add('active');
        }

        document.querySelectorAll('.bottom-bar-btn').forEach(button => {
            button.classList.remove('active');
        });
    }

    loadDevices(); 

    document.querySelector('.statistics').addEventListener('click', () => {
        loadContent('trafico');
    });

    document.querySelector('.devices').addEventListener('click', () => {
        loadContent('ancho_banda');
    });

    document.querySelectorAll('.device-item').forEach(deviceButton => {
        deviceButton.addEventListener('click', (event) => {
            const device = event.currentTarget.dataset.device;
            setActiveDevice(device);
            loadContent('device', device);
        });
    });

    if (showSplashScreen) {
        setTimeout(hideSplashScreen, 2000);
    } else {
        splashScreen.remove(); 
        loadContent('trafico'); 
    }
});
