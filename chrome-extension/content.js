// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'freeze') {
        document.body.innerHTML = '';
        document.body.style.backgroundColor = '#222';
        document.body.style.color = '#fff';
        document.body.style.fontSize = '24px';
        document.body.style.textAlign = 'center';
        document.body.style.paddingTop = '100px';
        document.body.innerText = 'Time\'s up! Please take a break.';
    }
});