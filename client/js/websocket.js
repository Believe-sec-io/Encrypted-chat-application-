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


        try {

            /*
             * Export our public ECDH key.
             */

            const publicKey =
                await exportPublicKey();


            /*
             * Send ONLY the public key.
             *
             * The private key stays inside
             * this browser.
             */

            socket.send(
                JSON.stringify(
                    {
                        type: "public_key",
                        public_key: publicKey
                    }
                )
            );


            console.log(
                "[Crypto] Public key sent."
            );


        } catch (error) {

            console.error(
                "[Crypto] Public key error:",
                error
            );
        }
    });


    socket.addEventListener(
        "message",
        async (event) => {

            try {

                const data =
                    JSON.parse(event.data);


                // --------------------------------
                // Remote public key
                // --------------------------------

                if (data.type === "public_key") {

                    console.log(
                        "[Crypto] Remote public key received."
                    );


                    await handleRemotePublicKey(
                        data.public_key
                    );

                    return;
                }


                // --------------------------------
                // Chat message
                // --------------------------------

                if (data.type === "message") {

                    console.log(
                        "[WebSocket] Message received:",
                        data.data
                    );


                    displayMessage(
                        data.data,
                        "received"
                    );
                }


            } catch (error) {

                console.error(
                    "[WebSocket] Invalid message:",
                    error
                );
            }
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


/**
 * Handle a public key received from another client.
 */
async function handleRemotePublicKey(publicKeyData) {

    try {

        const remotePublicKey =
            await importPublicKey(
                publicKeyData
            );


        console.log(
            "[Crypto] Remote public key imported."
        );


        /*
         * Derive the shared secret.
         *
         * Local private key
         * +
         * Remote public key
         * =
         * Shared secret
         */

        const sharedSecret =
            await deriveSharedSecret(
                remotePublicKey
            );


        console.log(
            "[Crypto] Shared secret established."
        );


        console.log(
            "[Crypto] Shared secret:",
            bufferToHex(sharedSecret)
        );


    } catch (error) {

        console.error(
            "[Crypto] Failed to establish shared secret:",
            error
        );
    }
}
