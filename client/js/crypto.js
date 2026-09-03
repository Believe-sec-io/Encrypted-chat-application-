/*
 * End-to-End Encryption
 *
 * Cryptographic architecture:
 *
 * ECDH P-256
 *     ↓
 * Shared Secret
 *     ↓
 * HKDF
 *     ↓
 * AES-GCM
 */


let keyPair = null;


/**
 * Generate an ECDH key pair.
 */
async function generateKeyPair() {

    keyPair = await crypto.subtle.generateKey(
        {
            name: "ECDH",
            namedCurve: "P-256"
        },
        true,
        [
            "deriveBits"
        ]
    );


    console.log(
        "[Crypto] ECDH key pair generated."
    );


    return keyPair;
}


/**
 * Export the public key as JWK.
 *
 * Only the public key is exported.
 */
async function exportPublicKey() {

    if (!keyPair) {

        throw new Error(
            "Key pair has not been generated."
        );
    }


    return await crypto.subtle.exportKey(
        "jwk",
        keyPair.publicKey
    );
}


/**
 * Import a remote ECDH public key.
 */
async function importPublicKey(publicKeyData) {

    return await crypto.subtle.importKey(
        "jwk",
        publicKeyData,
        {
            name: "ECDH",
            namedCurve: "P-256"
        },
        true,
        []
    );
}


/**
 * Derive the ECDH shared secret.
 */
async function deriveSharedSecret(
    remotePublicKey
) {

    if (!keyPair) {

        throw new Error(
            "Local key pair has not been generated."
        );
    }


    return await crypto.subtle.deriveBits(
        {
            name: "ECDH",
            public: remotePublicKey
        },
        keyPair.privateKey,
        256
    );
}


/**
 * Convert ArrayBuffer to hexadecimal.
 *
 * Used for debugging only.
 */
function bufferToHex(buffer) {

    const bytes =
        new Uint8Array(buffer);


    return Array.from(bytes)
        .map(
            byte =>
                byte
                    .toString(16)
                    .padStart(2, "0")
        )
        .join("");
}
