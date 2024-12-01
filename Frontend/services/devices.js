export function loadDevicesContent() {
    fetch('information.json')
        .then(response => response.json())
        .then(data => {
            const deviceListContainer = document.getElementById('device-list');
            deviceListContainer.innerHTML = ''; 

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

                deviceInfo.appendChild(deviceName);
                deviceInfo.appendChild(deviceIp);
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
            document.getElementById('device-list').innerHTML = '<p>Error al cargar los dispositivos. Por favor, intenta nuevamente.</p>';
        });
}

function setActiveDevice(device) {
    document.querySelectorAll('.device-item').forEach(deviceButton => {
        deviceButton.classList.remove('active');
    });

    const activeDevice = document.querySelector(`.device-item[data-device="${device}"]`);
    if (activeDevice) {
        activeDevice.classList.add('active');
    }
}
