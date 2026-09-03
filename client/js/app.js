const form = document.getElementById("message-form");
const input = document.getElementById("message-input");
const messages = document.getElementById("messages");


function displayMessage(message, type) {

    const element = document.createElement("div");

    element.classList.add("message", type);

    element.textContent = message;

    messages.appendChild(element);

    messages.scrollTop = messages.scrollHeight;
}


form.addEventListener("submit", (event) => {

    event.preventDefault();

    const message = input.value.trim();

    if (!message) {
        return;
    }

    if (!socket || socket.readyState !== WebSocket.OPEN) {

        console.error("WebSocket is not connected.");

        return;
    }

    socket.send(message);

    displayMessage(message, "sent");

    input.value = "";
});


connectWebSocket();
