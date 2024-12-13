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
                
                mainContent.innerHTML = `
                <section>
                    <header class="app-header">
                        <img src="assets/switch.svg" class="switch-image">
                        <h2>${device}</h2>
                        <div class="device-ip">IP 192.168.1.1</div>
                    </header>
                    <section>
                        <h2 class="titles">TRAFICO</h2>
                        <div class="traffic-visual" id="traffic-visual"></div>
                    </section>
                </section>
                `;
            }

            mainContent.classList.remove('fade-out');
            mainContent.classList.add('fade-in');
        }, 50);
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
