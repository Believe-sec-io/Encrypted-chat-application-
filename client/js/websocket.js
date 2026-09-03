let socket;


/**
 * Connect to the WebSocket server.
 */
function connectWebSocket() {

    socket = new WebSocket(
        "ws://localhost:8765"
    );


    socket.addEventListener(
        "open",
        async () => {

            console.log(
                "[WebSocket] Connected."
            );


            document.getElementById(
                "status"
            ).textContent = "Connected";


            try {

                const publicKey =
                    await exportPublicKey();


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
        }
    );


    socket.addEventListener(
        "message",
        async (event) => {

            try {

                const data =
                    JSON.parse(event.data);


                /*
                 * Remote public key
                 */
                if (data.type === "public_key") {

                    console.log(
                        "[Crypto] Remote public key received."
                    );


                    const remotePublicKey =
                        await importPublicKey(
                            data.public_key
                        );


                    const sharedSecret =
                        await deriveSharedSecret(
                            remotePublicKey
                        );


                    await deriveEncryptionKey(
                        sharedSecret
                    );


                    console.log(
                        "[Crypto] Secure encryption session established."
                    );


                    return;
                }


                /*
                 * Encrypted message
                 */
                if (data.type === "encrypted_message") {

                    const plaintext =
                        await decryptMessage(
                            data.data
                        );


                    displayMessage(
                        plaintext,
                        "received"
                    );


                    return;
                }


            } catch (error) {

                console.error(
                    "[Crypto] Message processing failed:",
                    error
                );
            }
        }
    );


    socket.addEventListener(
        "close",
        () => {

            console.log(
                "[WebSocket] Disconnected."
            );


            document.getElementById(
                "status"
            ).textContent = "Disconnected";
        }
    );


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
