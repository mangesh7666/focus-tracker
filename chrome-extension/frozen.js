// frozen.js
// This script runs on the frozen.html page and displays a persistent countdown timer.
// It retrieves the unfreeze time directly from chrome.storage.local.

document.addEventListener('DOMContentLoaded', async () => {
    const countdownEl = document.getElementById('countdown');
    
    // Get the hostname from the URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const hostname = urlParams.get('hostname');

    if (!hostname) {
        countdownEl.textContent = 'Error: No hostname found.';
        console.error("Frozen page loaded without a hostname parameter.");
        return;
    }

    // Access chrome.storage.local directly to get the persistent data
    const result = await chrome.storage.local.get('frozenSites');
    const frozenSites = result.frozenSites || {};
    const unfreezeTime = frozenSites[hostname];

    if (!unfreezeTime) {
        countdownEl.textContent = 'Site is now unfrozen.';
        // If the unfreeze time isn't found, assume it's unfrozen and notify
        // the background script to handle a potential redirect.
        chrome.runtime.sendMessage({ action: 'checkUnfreeze' });
        return;
    }

    // Set up the countdown interval to update the display every second
    const countdownInterval = setInterval(() => {
        const now = Date.now();
        const timeLeftMs = unfreezeTime - now;

        if (timeLeftMs <= 0) {
            // Timer has expired
        
            clearInterval(countdownInterval);
            countdownEl.textContent = "Unfreezing now...";
            
            // Send a message to the background script to restore the original tab.
            chrome.runtime.sendMessage({ action: 'checkUnfreeze' });
        } else {
            // Update the countdown display
            const timeLeftSeconds = Math.floor(timeLeftMs / 1000);
            const minutes = Math.floor(timeLeftSeconds / 60);
            const seconds = timeLeftSeconds % 60;
            
            const formattedSeconds = String(seconds).padStart(2, '0');
            countdownEl.textContent = `${minutes}m ${formattedSeconds}s`;
        }
    }, 1000); // Update every 1 second (1000 milliseconds)
});






window.addEventListener('load', () => {
    const hostname = new URLSearchParams(window.location.search).get('hostname') || '';

    // Step 1: Open root domain in new tab
    chrome.tabs.create({
        url: `https://${hostname}`,
        active: true
    }, function () {
        // Step 2: Delay closing old tab for better UX
        setTimeout(() => {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                const currentTabId = tabs[0].id;
                chrome.tabs.remove(currentTabId);
            });
        }, 1500);
    });
});





//images 

const API_KEY = "DgKZVlw7WWQIm5fFdVchk6gL40K1xyFE4ruadHaue3fJC46Senn7S8xf"; // Replace with your Pexels API key
const imageElement = document.getElementById("relaxImage");
const quoteElement = document.getElementById("quote");


const quotes = [
    "Relax your mind, recharge your body.",
    "A short break can boost productivity.",
    "Breathe deeply and let go of stress.",
    "Movement is the key to staying healthy.",
    "Water and fresh air rejuvenate your soul."
];


function loadRandomImage() {
    fetch("https://api.pexels.com/v1/search?query=relax&per_page=50", {
        headers: {
            Authorization: API_KEY
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.photos && data.photos.length > 0) {
            // Pick a random image from the results
            const randomIndex = Math.floor(Math.random() * data.photos.length);
            const imageUrl = data.photos[randomIndex].src.large;

            imageElement.src = imageUrl;
        } else {
            console.error("No images found.");
        }
    })
    .catch(error => console.error("Error fetching image:", error));
}

// Load a new image every 15 seconds
loadRandomImage();
setInterval(loadRandomImage, 15000);


// Change quote every 20 seconds
function changeQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteElement.textContent = `“${quotes[randomIndex]}”`;
}
changeQuote();
setInterval(changeQuote, 20000);




//open camera
document.getElementById('openCamera').addEventListener('click', () => {
    chrome.windows.create({
        url: chrome.runtime.getURL("camera.html"),
        type: "popup",
        width: 400,
        height: 350,
        focused: true
    });
});



//data 
// Listen for stress score messages from camera.js
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "stressScoreUpdate") {
        const stressEl = document.getElementById("stressResult");
        if (stressEl) {
            stressEl.textContent = `Stress Level: ${message.score}`;
            stressEl.style.color = message.score > 70 ? "red" 
                                : message.score > 40 ? "orange" 
                                : "green";
        }
    }
});





