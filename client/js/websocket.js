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


                /*
                 * Generate our identity fingerprint.
                 */

                localFingerprint =
                    await generateFingerprint(
                        publicKey
                    );


                console.log(
                    "[Identity] Local fingerprint:"
                );

                console.log(
                    localFingerprint
                );


                /*
                 * Send the public key
                 * and its fingerprint.
                 */

                socket.send(
                    JSON.stringify(
                        {
                            type:
                                "public_key",

                            public_key:
                                publicKey,

                            fingerprint:
                                localFingerprint
                        }
                    )
                );


                console.log(
                    "[Crypto] Public key sent."
                );


            } catch (error) {

                console.error(
                    "[Crypto] Initialization error:",
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
                    JSON.parse(
                        event.data
                    );


                /*
                 * Public key received.
                 */

                if (
                    data.type ===
                    "public_key"
                ) {

                    console.log(
                        "[Identity] Remote public key received."
                    );


                    remoteFingerprint =
                        await generateFingerprint(
                            data.public_key
                        );


                    console.log(
                        "[Identity] Remote fingerprint:"
                    );

                    console.log(
                        remoteFingerprint
                    );


                    /*
                     * Verify that the fingerprint
                     * matches the fingerprint sent
                     * by the remote client.
                     */

                    if (
                        remoteFingerprint !==
                        data.fingerprint
                    ) {

                        console.error(
                            "[SECURITY] Fingerprint mismatch!"
                        );

                        document.getElementById(
                            "status"
                        ).textContent =
                            "⚠️ Key mismatch";


                        return;
                    }


                    console.log(
                        "[Identity] Fingerprint verified."
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


                    document.getElementById(
                        "status"
                    ).textContent =
                        "🔐 Secure";


                    console.log(
                        "[Crypto] Secure session established."
                    );


                    return;
                }


                /*
                 * Encrypted message received.
                 */

                if (
                    data.type ===
                    "encrypted_message"
                ) {

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
            ).textContent =
                "Disconnected";
        }
    );


    socket.addEventListener(
        "error",
        error => {

            console.error(
                "[WebSocket] Error:",
                error
            );
        }
    );
                }
