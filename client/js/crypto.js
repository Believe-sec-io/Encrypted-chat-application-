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
 * Identity:
 *
 * Public Key
 *      ↓
 * SHA-256
 *      ↓
 * Fingerprint
 */

let keyPair = null;
let encryptionKey = null;

let localFingerprint = null;
let remoteFingerprint = null;


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
 * Export the public key as JWK.
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
 * Import a remote public key.
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
 * Convert an ArrayBuffer to Base64.
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

    const binary = atob(base64);

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
 * Convert ArrayBuffer to hexadecimal.
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


/**
 * Calculate SHA-256 hash.
 */
async function sha256(data) {

    return await crypto.subtle.digest(
        "SHA-256",
        data
    );
}


/**
 * Generate a fingerprint from a public key.
 *
 * The JWK is converted into a deterministic string
 * before hashing.
 */
async function generateFingerprint(
    publicKeyData
) {

    const canonicalKey = JSON.stringify({
        crv: publicKeyData.crv,
        kty: publicKeyData.kty,
        x: publicKeyData.x,
        y: publicKeyData.y
    });

    const encoded =
        new TextEncoder().encode(
            canonicalKey
        );

    const hash =
        await sha256(encoded);

    const hex =
        bufferToHex(hash);

    /*
     * Format:
     *
     * 12AB 34CD 56EF ...
     */

    return hex
        .match(/.{1,4}/g)
        .join(" ")
        .toUpperCase();
}


/**
 * Derive ECDH shared secret.
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
 * Derive AES-256-GCM key using HKDF.
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

                salt:
                    new TextEncoder().encode(
                        "encrypted-chat-v1"
                    ),

                info:
                    new TextEncoder().encode(
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
 * Encrypt a plaintext message.
 */
async function encryptMessage(
    plaintext
) {

    if (!encryptionKey) {

        throw new Error(
            "Encryption key is not established."
        );
    }


    const iv =
        crypto.getRandomValues(
            new Uint8Array(12)
        );


    const plaintextBytes =
        new TextEncoder().encode(
            plaintext
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
        ciphertext:
            bufferToBase64(
                ciphertext
            ),

        iv:
            bufferToBase64(
                iv
            )
    };
}


/**
 * Decrypt an AES-GCM message.
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
