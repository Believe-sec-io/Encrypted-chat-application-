let socket;

function connectWebSocket() {

    socket = new WebSocket("ws://localhost:8765");

    socket.addEventListener("open", () => {
        console.log("[WebSocket] Connected");

        document.getElementById("status").textContent =
            "Connected";
    });

    socket.addEventListener("message", (event) => {

        console.log("[WebSocket] Message received:", event.data);

        displayMessage(event.data, "received");
    });

    socket.addEventListener("close", () => {

        console.log("[WebSocket] Disconnected");

        document.getElementById("status").textContent =
            "Disconnected";
    });

    socket.addEventListener("error", (error) => {

        console.error("[WebSocket] Error:", error);
    });
}
