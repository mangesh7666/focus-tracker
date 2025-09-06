
// --- state ---

const API_URL = "https://focus-tracker-1-trs3.onrender.com";

let authToken = null;

let userSettings = {};

let siteLimits = {};

let hostnameSessions = {};

let sessionFreezeDurationMinutes = 1;

let currentActiveTabId = null;

let activeTabs = {};


let frozenTabs = {};

let frozenSites = {};

let trackingIntervalId = null;

let unfrozenSites = {}; // NEW: A temporary list of sites that were just unfrozen


function storageGet(keys) {
    return new Promise(resolve => chrome.storage.local.get(keys, resolve));
}

function storageSet(obj) {
    return new Promise(resolve => chrome.storage.local.set(obj, resolve));
}

function storageRemove(keys) {
    return new Promise(resolve => chrome.storage.local.remove(keys));
}


async function saveFrozenState() {
    await chrome.storage.local.set({ frozenTabs, frozenSites });
}


async function loadFrozenState() {
    const result = await chrome.storage.local.get(['frozenTabs', 'frozenSites']);
    frozenTabs = result.frozenTabs || {};
    frozenSites = result.frozenSites || {};
}


async function logScreenTime(url, startTimeMs, endTimeMs) {
    if (!authToken || !url) return;
    try {
        const response = await fetch(`${API_URL}/api/time/log`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({
                site: url,
                startTime: new Date(startTimeMs).toISOString(),
                endTime: new Date(endTimeMs).toISOString()
            })
        });
        if (response.ok) {
            console.log(`Logged session for ${url} from ${new Date(startTimeMs).toISOString()} to ${new Date(endTimeMs).toISOString()}`);
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error("Failed to log time:", response.status, errorData.message);
        }
    } catch (error) {
        console.error("Error logging time:", error);
    }
}


/*async function fetchUserSettings() {
    if (!authToken) {
        console.log("No auth token — using local defaults for session limits.");
        siteLimits = {};
        return;
    }
    try {
        const response = await fetch(`${API_URL}/api/settings`, {
            headers: { "Authorization": `Bearer ${authToken}` }
        });
        if (response.ok) {
            userSettings = await response.json();
            console.log("Settings loaded:", userSettings);

            siteLimits = {};
            if (Array.isArray(userSettings.customSiteLimits)) {
                userSettings.customSiteLimits.forEach(limit => {
                    if (limit.site && limit.dailyLimitMinutes) {
                        try {
                            let siteUrl = limit.site;
                            if (!siteUrl.startsWith('http://') && !siteUrl.startsWith('https://')) {
                                siteUrl = `https://${siteUrl}`;
                            }
                            
                            const hostname = new URL(siteUrl).hostname.replace(/^www\./, '');

                            if (hostname === 'googleusercontent.com') {
                                siteLimits['youtube.com'] = Number(limit.dailyLimitMinutes);
                            } else {
                                siteLimits[hostname] = Number(limit.dailyLimitMinutes);
                            }

                        } catch (e) {
                            console.warn("Invalid URL in site limits:", limit.site, e);
                        }
                    }
                });
            }

            if (userSettings.unfreezeDurationMinutes) {
                sessionFreezeDurationMinutes = Number(userSettings.unfreezeDurationMinutes) || sessionFreezeDurationMinutes;
            }

            console.log("Mapped site limits:", siteLimits);

        } else {
            console.error("Failed to fetch settings. Status:", response.status);
        }
    } catch (error) {
        console.error("Error fetching settings:", error);
    }
}*/



//pooling 
let pollingInterval = 30000; // 30 seconds

async function fetchUserSettings() {
    if (!authToken) {
        console.log("No auth token — using local defaults for session limits.");
        siteLimits = {};
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/settings`, {
            headers: { "Authorization": `Bearer ${authToken}` }
        });

        if (response.ok) {
            const data = await response.json();
            userSettings = data;
            console.log("Settings loaded:", userSettings);

            // Map site limits
            siteLimits = {};
            if (Array.isArray(userSettings.customSiteLimits)) {
                userSettings.customSiteLimits.forEach(limit => {
                    if (limit.site && limit.dailyLimitMinutes) {
                        try {
                            let siteUrl = limit.site;
                            if (!siteUrl.startsWith('http://') && !siteUrl.startsWith('https://')) {
                                siteUrl = `https://${siteUrl}`;
                            }

                            const hostname = new URL(siteUrl).hostname.replace(/^www\./, '');
                            if (hostname === 'googleusercontent.com') {
                                siteLimits['youtube.com'] = Number(limit.dailyLimitMinutes);
                            } else {
                                siteLimits[hostname] = Number(limit.dailyLimitMinutes);
                            }

                        } catch (e) {
                            console.warn("Invalid URL in site limits:", limit.site, e);
                        }
                    }
                });
            }

            if (userSettings.unfreezeDurationMinutes) {
                sessionFreezeDurationMinutes = Number(userSettings.unfreezeDurationMinutes) || sessionFreezeDurationMinutes;
            }

            console.log("Mapped site limits:", siteLimits);
        } else {
            console.error("Failed to fetch settings. Status:", response.status);
        }
    } catch (error) {
        console.error("Error fetching settings:", error);
    } finally {
        // Poll again after interval
        setTimeout(fetchUserSettings, pollingInterval);
    }
}

// Start polling
fetchUserSettings();


//freez site
async function freezeSite(tabId, originalUrl, hostname) {
    console.log(`Freezing tab ${tabId} (original ${originalUrl})`);

    let unfreezeTime = frozenSites[hostname];
    if (!unfreezeTime) {
        unfreezeTime = Date.now() + sessionFreezeDurationMinutes * 60 * 1000;
        frozenSites[hostname] = unfreezeTime;
    }

    frozenTabs[tabId] = {
        originalUrl,
        hostname,
        unfreezeTime
    };

    await saveFrozenState();

    try {
        await chrome.tabs.update(tabId, { url: chrome.runtime.getURL("frozen.html") + "?hostname=" + hostname });
        console.log(`Tab ${tabId} redirected to frozen.html`);
    } catch (err) {
        console.warn("Could not update tab to frozen page:", err);
    }
}


async function checkIfFrozenAndUnfreeze(tabId) {
    const frozenState = frozenTabs[tabId];
    if (!frozenState) {
        return;
    }

    const now = Date.now();
    if (now >= frozenState.unfreezeTime) {
        console.log(`Unfreezing site for tab ${tabId}...`);

        const originalUrl = frozenState.originalUrl;
        const hostname = frozenState.hostname;

        delete frozenTabs[tabId];

        const stillFrozen = Object.values(frozenTabs).some(tab => tab.hostname === hostname);
        if (!stillFrozen) {
            delete frozenSites[hostname];
        }

        // Reset the hostname session entirely to ensure no stale data remains
        delete hostnameSessions[hostname];
        // NEW: Set a flag for the unfrozen site to prevent logging its first session
        unfrozenSites[hostname] = true;
        console.log(`Session data for ${hostname} has been reset and a temporary block is active.`);


        await saveFrozenState();

        try {
            await chrome.tabs.update(tabId, { url: originalUrl });
            console.log(`Tab ${tabId} restored to original URL ${originalUrl}`);
        } catch (err) {
            console.warn("Could not restore original tab URL:", err);
        }
    }
}


async function checkTimeLimitAndFreeze(tab) {
    if (!tab || !tab.url || frozenTabs[tab.id]) return;

    let urlHostname;
    try {
        urlHostname = new URL(tab.url).hostname.replace(/^www\./, '');
    } catch {
        return;
    }

    if (urlHostname === 'googleusercontent.com' && tab.url.includes('youtube.com')) {
        urlHostname = 'youtube.com';
    }
    
    // NEW: Remove the temporary block for this site
    if(unfrozenSites[urlHostname]) {
        console.log(`Unfreeze block removed for ${urlHostname}.`);
        delete unfrozenSites[urlHostname];
    }
    
    const siteLimitMinutes = siteLimits[urlHostname];
    if (!siteLimitMinutes) return;

    if (frozenSites[urlHostname] && frozenSites[urlHostname] > Date.now()) {
        await freezeSite(tab.id, tab.url, urlHostname);
        return;
    }

    const hostnameSession = hostnameSessions[urlHostname];

    if (!hostnameSession) return;

    const now = Date.now();
    const currentSessionDuration = now - hostnameSession.startTime;
    const totalDurationMs = hostnameSession.accumulatedTime + currentSessionDuration;
    const limitMs = siteLimitMinutes * 60 * 1000;

    if (totalDurationMs >= limitMs) {
        console.log(`Limit exceeded for ${urlHostname}: usage=${totalDurationMs}ms limit=${limitMs}ms`);
        await freezeSite(tab.id, tab.url, urlHostname);
    }
}


async function startTrackingInterval() {

    if (trackingIntervalId) clearInterval(trackingIntervalId);


    trackingIntervalId = setInterval(async () => {

        try {
            for (const tabIdStr of Object.keys(frozenTabs)) {
                const tabId = parseInt(tabIdStr);
                await checkIfFrozenAndUnfreeze(tabId);
            }

            if (currentActiveTabId) {
                try {
                    const tab = await chrome.tabs.get(currentActiveTabId);
                    if (tab) await checkTimeLimitAndFreeze(tab);
                } catch (e) {
                    console.warn('Error fetching current active tab:', e);
                }
            }
        } catch (err) {
            console.warn("Tracking interval error:", err);
        }
    }, 1000 * 10);
}


async function handleTabChange(newTabId) {
    const now = Date.now();

    if (currentActiveTabId && activeTabs[currentActiveTabId]) {
        const { url, hostname, startTime } = activeTabs[currentActiveTabId];
        const endTime = now;

        // NEW: Check for the temporary block
        if (!unfrozenSites[hostname] && hostnameSessions[hostname]) {
            const elapsed = endTime - startTime;
            hostnameSessions[hostname].accumulatedTime += elapsed;
        } else {
            hostnameSessions[hostname] = { accumulatedTime: endTime - startTime };
        }

        if (url && !url.startsWith("chrome://") && !url.startsWith("chrome-extension://")) {
            await logScreenTime(url, startTime, endTime);
        }
    }

    currentActiveTabId = newTabId;

    if (newTabId !== null) {
        try {
            const tab = await chrome.tabs.get(newTabId);

            if (tab?.url && !tab.url.startsWith("chrome://") && !tab.url.startsWith("chrome-extension://") && !tab.url.startsWith(chrome.runtime.getURL("frozen.html"))) {
                let hostname;
                try {
                    hostname = new URL(tab.url).hostname.replace(/^www\./, '');
                } catch {
                    return;
                }
                
                if (hostname === 'googleusercontent.com' && tab.url.includes('youtube.com')) {
                    hostname = 'youtube.com';
                }

                if (frozenSites[hostname] && frozenSites[hostname] > now) {
                    await freezeSite(newTabId, tab.url, hostname);
                } else {
                    activeTabs[newTabId] = { url: tab.url, hostname, startTime: now };
                    if (!hostnameSessions[hostname]) {
                        hostnameSessions[hostname] = { accumulatedTime: 0 };
                    }
                    hostnameSessions[hostname].startTime = now;
                }
            }
        } catch (err) {
            console.warn(`Could not get tab details for ${newTabId}:`, err);
        }
    }
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.action === "checkUnfreeze") {
        const tabId = sender?.tab?.id;
        if (tabId != null) checkIfFrozenAndUnfreeze(tabId);
        sendResponse({ result: "ok" });
        return true;
    }

    if (message?.action === "getStatus") {
        (async () => {
            const status = {
                authTokenPresent: !!authToken,
                sessionFreezeDurationMinutes,
                siteLimits,
                frozenTabs: frozenTabs
            };

            if (currentActiveTabId && activeTabs[currentActiveTabId]) {
                    status.currentTabUsageSeconds = Math.floor((Date.now() - activeTabs[currentActiveTabId].startTime) / 1000);
            }

            sendResponse(status);
        })();
        return true;
    }

    if (message?.action === "loginSuccessful") {
        loadAuthToken();
        sendResponse({ result: "ok" });
        return true;
    }

    return false;
});


chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
    chrome.windows.get(windowId, { populate: true }, (window) => {
        if (window && window.focused) handleTabChange(tabId);
    });
});


chrome.tabs.onCreated.addListener(async (tab) => {
    if (!tab || !tab.url) return;

    let hostname;
    try {
        hostname = new URL(tab.url).hostname.replace(/^www\./, '');
    } catch {
        return;
    }
    
    if (hostname === 'googleusercontent.com' && tab.url.includes('youtube.com')) {
        hostname = 'youtube.com';
    }


    const result = await chrome.storage.local.get('frozenSites');
    const frozenSitesCheck = result.frozenSites || {};


    if (frozenSitesCheck[hostname] && frozenSitesCheck[hostname] > Date.now()) {
        await freezeSite(tab.id, tab.url, hostname);
    }
});


chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.active) {
        if (tab.url && tab.url.startsWith(chrome.runtime.getURL("frozen.html"))) {
            console.log(`Re-establishing frozen state for tab ${tabId}.`);
            return;
        }

        let hostname;
        try {
            hostname = new URL(tab.url).hostname.replace(/^www\./, '');
        } catch {
            return;
        }
        
        if (hostname === 'googleusercontent.com' && tab.url.includes('youtube.com')) {
            hostname = 'youtube.com';
        }

        const result = await chrome.storage.local.get('frozenSites');
        const frozenSitesCheck = result.frozenSites || {};

        if (frozenSitesCheck[hostname] && frozenSitesCheck[hostname] > Date.now()) {
            await freezeSite(tabId, tab.url, hostname);
        } else {
            handleTabChange(tabId);
        }
    }
});


chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        handleTabChange(null);
    } else {
        chrome.tabs.query({ active: true, windowId }, (tabs) => {
            if (tabs[0]) handleTabChange(tabs[0].id);
        });
    }
});


chrome.tabs.onRemoved.addListener(async (tabId) => {
    if (activeTabs[tabId]) {
        const { url, startTime } = activeTabs[tabId];
        const endTime = Date.now();

        if (url && !url.startsWith("chrome://") && !url.startsWith("chrome-extension://")) {
            await logScreenTime(url, startTime, endTime);
        }

        delete activeTabs[tabId];
    }
    if (frozenTabs[tabId]) {
        const hostname = frozenTabs[tabId].hostname;
        delete frozenTabs[tabId];
        
        await saveFrozenState();
    }
    if (tabId === currentActiveTabId) {
        currentActiveTabId = null;
    }
});


async function initializeAfterLogin() {
    if (initializeAfterLogin._running) return;
    initializeAfterLogin._running = true;

    await fetchUserSettings();

    await loadFrozenState();

    console.log("Per-site limits are now active.");

    startTrackingInterval();

    initializeAfterLogin._running = false;
}


function loadAuthToken() {
    chrome.storage.local.get(["authToken"], (result) => {
        if (result?.authToken) {
            authToken = result.authToken;
            console.log("Token loaded.");
        } else {
            authToken = null;
            console.log("No auth token found (running with local defaults).");
        }
        initializeAfterLogin();
    });
}


loadAuthToken();


chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed — starting session loop.");
    loadAuthToken();
});

chrome.runtime.onStartup.addListener(() => {
    console.log("Browser startup — starting session loop.");
    loadAuthToken();
});
