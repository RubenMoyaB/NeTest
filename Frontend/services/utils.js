export function setActiveButton(activeButtonClass) {
    document.querySelectorAll('.bottom-bar-btn').forEach(button => {
        button.classList.remove('active');
    });

    const activeButton = document.querySelector(`.${activeButtonClass}`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

export function loadContent(section, device = null) {
    const mainContent = document.getElementById('main-content');
    mainContent.classList.add('fade-out');

    setTimeout(() => {
        
        mainContent.classList.remove('fade-out');
        mainContent.classList.add('fade-in');
    }, 50);
}
