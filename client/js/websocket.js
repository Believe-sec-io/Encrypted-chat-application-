let socket;


/**
 * Connect to the WebSocket server.
 */
function connectWebSocket() {

    socket = new WebSocket(
        "ws://localhost:8765"
    );


    socket.addEventListener("open", async () => {

        console.log(
            "[WebSocket] Connected."
        );


        document.getElementById("status").textContent =
            "Connected";


        /*
         * Prepare the public key.
         *
         * The public key can be shared.
         * The private key NEVER leaves this browser.
         */

        try {

            const publicKey =
                await exportPublicKey();

            console.log(
                "[Crypto] Local public key:",
                publicKey
            );


            /*
             * Public-key exchange will be implemented
             * in the next stage.
             */

        } catch (error) {

            console.error(
                "[Crypto] Public key error:",
                error
            );
        }
    });


    socket.addEventListener(
        "message",
        (event) => {

            console.log(
                "[WebSocket] Message received:",
                event.data
            );


            displayMessage(
                event.data,
                "received"
            );
        }
    );


    socket.addEventListener("close", () => {

        console.log(
            "[WebSocket] Disconnected."
        );


        document.getElementById("status").textContent =
            "Disconnected";
    });


    socket.addEventListener(
        "error",
        (error) => {

            console.error(
                "[WebSocket] Error:",
                error
            );
        }
    );
                            }
