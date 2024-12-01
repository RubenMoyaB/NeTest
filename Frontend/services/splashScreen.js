export function showSplashScreen() {
    const splashScreen = document.createElement('div');
    splashScreen.id = 'splash-screen';
    splashScreen.innerHTML = 'NeTest';
    document.body.appendChild(splashScreen);

    return splashScreen;
}

export function hideSplashScreen(splashScreen, callback) {
    splashScreen.classList.add('fade-out');
    setTimeout(() => {
        splashScreen.remove();
        callback(); 
    }, 1000); 
}
