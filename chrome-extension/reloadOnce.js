if (!sessionStorage.getItem('firstLoadReloadDone')) {
    sessionStorage.setItem('firstLoadReloadDone', 'true');

    window.addEventListener('load', () => {
        setTimeout(() => {
            location.reload();
        }, 5000); // reload after 0.5 seconds
    });
}
