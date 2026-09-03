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

        console.error(
            "[WebSocket] Connection is not available."
        );

        return;
    }


    socket.send(message);

    displayMessage(message, "sent");

    input.value = "";
});


async function initializeApplication() {

    try {

        console.log("[App] Initializing...");


        // Generate our local ECDH key pair.
        await generateKeyPair();


        // Run a local cryptographic test.
        const ecdhWorking = await testECDH();


        if (!ecdhWorking) {

            console.error(
                "[App] Cryptographic initialization failed."
            );

            return;
        }


        // Connect to the WebSocket server.
        connectWebSocket();


        console.log(
            "[App] Application initialized successfully."
        );

    } catch (error) {

        console.error(
            "[App] Initialization error:",
            error
        );
    }
}


initializeApplication();
