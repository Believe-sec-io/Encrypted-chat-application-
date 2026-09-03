/*
 * End-to-End Encryption
 *
 * Cryptographic architecture:
 *
 * ECDH P-256
 *      ↓
 * Shared Secret
 *      ↓
 * HKDF-SHA-256
 *      ↓
 * AES-256-GCM
 *
 * The private ECDH key never leaves the browser.
 */

let keyPair = null;
let encryptionKey = null;


/**
 * Generate the local ECDH key pair.
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
 * Export only the public ECDH key.
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
 * Import a remote public ECDH key.
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
 * Derive the raw ECDH shared secret.
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
 * Convert the ECDH shared secret into an AES key.
 *
 * HKDF is used as a Key Derivation Function.
 */
async function deriveEncryptionKey(
    sharedSecret
) {

    const hkdfKey =
        await crypto.subtle.importKey(
            "raw",
            sharedSecret,
            "HKDF",
            false,
            [
                "deriveKey"
            ]
        );


    encryptionKey =
        await crypto.subtle.deriveKey(
            {
                name: "HKDF",

                hash: "SHA-256",

                salt: new TextEncoder().encode(
                    "encrypted-chat-v1"
                ),

                info: new TextEncoder().encode(
                    "message-encryption"
                )
            },

            hkdfKey,

            {
                name: "AES-GCM",
                length: 256
            },

            false,

            [
                "encrypt",
                "decrypt"
            ]
        );


    console.log(
        "[Crypto] AES-256-GCM key derived."
    );


    return encryptionKey;
}


/**
 * Encrypt a plaintext message using AES-256-GCM.
 */
async function encryptMessage(
    plaintext
) {

    if (!encryptionKey) {

        throw new Error(
            "Encryption key is not established."
        );
    }


    const encoder =
        new TextEncoder();


    const plaintextBytes =
        encoder.encode(plaintext);


    /*
     * AES-GCM requires a unique IV.
     *
     * 96-bit IV = 12 bytes.
     */
    const iv =
        crypto.getRandomValues(
            new Uint8Array(12)
        );


    const ciphertext =
        await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },

            encryptionKey,

            plaintextBytes
        );


    return {
        ciphertext: bufferToBase64(ciphertext),
        iv: bufferToBase64(iv)
    };
}


/**
 * Decrypt an AES-256-GCM message.
 */
async function decryptMessage(
    encryptedData
) {

    if (!encryptionKey) {

        throw new Error(
            "Encryption key is not established."
        );
    }


    const iv =
        base64ToBuffer(
            encryptedData.iv
        );


    const ciphertext =
        base64ToBuffer(
            encryptedData.ciphertext
        );


    const plaintext =
        await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },

            encryptionKey,

            ciphertext
        );


    return new TextDecoder().decode(
        plaintext
    );
}


/**
 * Convert ArrayBuffer / Uint8Array to Base64.
 */
function bufferToBase64(buffer) {

    const bytes =
        new Uint8Array(buffer);


    let binary = "";


    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }


    return btoa(binary);
}


/**
 * Convert Base64 to Uint8Array.
 */
function base64ToBuffer(base64) {

    const binary =
        atob(base64);


    const bytes =
        new Uint8Array(
            binary.length
        );


    for (let i = 0; i < binary.length; i++) {

        bytes[i] =
            binary.charCodeAt(i);
    }


    return bytes;
}


/**
 * Convert a buffer to hexadecimal.
 *
 * Debug
