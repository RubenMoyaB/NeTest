document.addEventListener('DOMContentLoaded', () => {
    // Función para cargar contenido en la sección main-content con animación
    function loadContent(section) {
        const mainContent = document.getElementById('main-content');

        // Paso 1: Agregar clase 'fade-out' para desvanecer el contenido actual
        mainContent.classList.add('fade-out');

        // Paso 2: Esperar a que termine la animación de salida antes de cambiar el contenido
        setTimeout(() => {
            // Cambiar contenido dependiendo de la sección
            if (section === 'trafico') {
                mainContent.innerHTML = `
                <section>
                    <header class="app-header">
                        <h2>TRAFICO DE RED</h2>
                        <button>Ci</button>
                    </header>
                    <div class="traffic-visual" id="traffic-visual"></div>
                </section>
                <section>
                    <header class="app-header">
                        <h2>ANCHO DE BANDA</h2>
                        <button>Ci</button>
                    </header>
                    <div class="statistics-visual" id="statistics-visual"></div>
                    <div class="statistics-table" id="statistics-table"></div>
                </section>
                `;
                setActiveButton('statistics'); // Marcar botón activo
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
                setActiveButton('devices'); // Marcar botón activo
            }

            // Paso 3: Eliminar clase 'fade-out' y agregar clase 'fade-in' para mostrar el nuevo contenido
            mainContent.classList.remove('fade-out');
            mainContent.classList.add('fade-in');
        }, 50); // Esperar 500ms para la transición de desvanecimiento
    }

    // Función para establecer el botón activo
    function setActiveButton(activeButtonClass) {
        // Eliminar la clase 'active' de todos los botones
        document.querySelectorAll('.bottom-bar-btn').forEach(button => {
            button.classList.remove('active');
        });

        // Añadir la clase 'active' al botón seleccionado
        const activeButton = document.querySelector(`.${activeButtonClass}`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    // Eventos para cambiar el contenido según las opciones de la sidebar
    document.querySelector('.statistics').addEventListener('click', () => {
        loadContent('trafico');
    });

    document.querySelector('.devices').addEventListener('click', () => {
        loadContent('ancho_banda');
    });

    // Cargar contenido inicial
    loadContent('trafico');
});
