function sendRequest(origin_tab, url, args) {
    fetch(url, args)
    .then(function(response) {
        console.log(response)
        response.json().then(function(json) {
            console.log(json)
            chrome.tabs.sendMessage(origin_tab.id, {data: json})
        })
    })
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.url) {
            sendRequest(sender.tab, request.url, request.args)
        }
    }
)

// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;

var pusher = new Pusher('c1cd6b4a6f1f795b00ec', {
    encrypted: true
});

var channel = pusher.subscribe('my-channel');
channel.bind('feed', function (json) {
    console.log("Got message", json)
    chrome.tabs.query({}, function(tabs) {
        tabs.forEach(function(tab) {
            chrome.tabs.sendMessage(tab.id, {data: json})
        });
    });
});

channel.bind('game', function (json) {
    console.log("Got message", json)
    chrome.tabs.query({}, function(tabs) {
        tabs.forEach(function(tab) {
            chrome.tabs.sendMessage(tab.id, {data: json})
        });
    });
});