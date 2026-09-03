const form =
    document.getElementById(
        "message-form"
    );


const input =
    document.getElementById(
        "message-input"
    );


const messages =
    document.getElementById(
        "messages"
    );


function displayMessage(
    message,
    type
) {

    const element =
        document.createElement(
            "div"
        );


    element.classList.add(
        "message",
        type
    );


    element.textContent =
        message;


    messages.appendChild(
        element
    );


    messages.scrollTop =
        messages.scrollHeight;
}


/**
 * Send an encrypted message.
 */
form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const message =
            input.value.trim();


        if (!message) {
            return;
        }


        if (
            !socket ||
            socket.readyState !== WebSocket.OPEN
        ) {

            console.error(
                "[WebSocket] Connection unavailable."
            );

            return;
        }


        try {

            /*
             * Encrypt BEFORE sending.
             */

            const encrypted =
                await encryptMessage(
                    message
                );


            /*
             * The server receives only:
             *
             * ciphertext
             * +
             * IV
             */

            socket.send(
                JSON.stringify(
                    {
                        type:
                            "encrypted_message",

                        data:
                            encrypted
                    }
                )
            );


            /*
             * Display our own plaintext locally.
             */

            displayMessage(
                message,
                "sent"
            );


            input.value = "";


        } catch (error) {

            console.error(
                "[Crypto] Encryption failed:",
                error
            );
        }
    }
);


async function initializeApplication() {

    try {

        console.log(
            "[App] Initializing..."
        );


        await generateKeyPair();


        connectWebSocket();


        console.log(
            "[App] Application initialized."
        );


    } catch (error) {

        console.error(
            "[App] Initialization failed:",
            error
        );
    }
}


initializeApplication();
