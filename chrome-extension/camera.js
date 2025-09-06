let cameraStream;
let mediaRecorder;
let isProcessing = false;

document.getElementById('startCameraButton').addEventListener('click', startCameraAndRecord);

async function startCameraAndRecord() {
    if (isProcessing) return;
    isProcessing = true;

    try {
        const videoElement = document.getElementById('camera');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        cameraStream = stream;
        videoElement.srcObject = stream;
        videoElement.play();
        videoElement.style.display = 'block';

        const recordedChunks = [];
        const options = { mimeType: 'video/webm; codecs=vp9' };
        mediaRecorder = new MediaRecorder(stream, options);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
            const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
            await processVideo(videoBlob);
            stopCamera();
            isProcessing = false;
        };

        mediaRecorder.start();
        setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }
        }, 3000); // Record for 5 seconds
    } catch (err) {
        console.error("Camera access error:", err);
        stopCamera();
        isProcessing = false;
    }
}

async function processVideo(videoBlob) {
    const authToken = await new Promise(resolve => {
        chrome.storage.local.get("authToken", (result) => {
            resolve(result.authToken);
        });
    });

    if (!authToken) {
        console.error("Failed to process video: No authentication token found.");
        return;
    }

    const formData = new FormData();
    formData.append('video', videoBlob, 'stress-video.webm');
    
    // Get the current tab's URL and append it to the FormData
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const siteUrl = tabs[0]?.url || 'unknown_site';
    formData.append('site', siteUrl);

    try {
        const response = await fetch("https://focus-tracker-1-trs3.onrender.com/api/stress/process-video", {
            method: 'POST',
            body: formData,
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Video processed, stress score received:", data.stress_score);
            chrome.runtime.sendMessage({ action: "stressScoreUpdate", score: data.log.level });
        } else {
            console.error("Failed to process video:", response.status);
        }
    } catch (error) {
        console.error("Error processing video:", error);
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
        console.log("Camera stopped");
    }
    window.close();
}
