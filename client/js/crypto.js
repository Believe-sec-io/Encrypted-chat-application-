/*
 * End-to-End Encryption
 * Cryptographic layer
 *
 * Current implementation:
 * - ECDH P-256 key generation
 * - Public key export/import
 * - Shared secret derivation
 *
 * Next layer:
 * - HKDF
 * - AES-GCM
 */

let keyPair = null;


/**
 * Generate a local ECDH key pair.
 *
 * The private key never leaves this browser.
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

    console.log("[Crypto] ECDH key pair generated.");

    return keyPair;
}


/**
 * Export the public key as JWK.
 *
 * Only the public key is exported.
 */
async function exportPublicKey() {

    if (!keyPair) {
        throw new Error("Key pair has not been generated.");
    }

    return await crypto.subtle.exportKey(
        "jwk",
        keyPair.publicKey
    );
}


/**
 * Import a remote user's public key.
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
 * Derive the shared secret using ECDH.
 *
 * Local private key + remote public key
 * = shared secret
 */
async function deriveSharedSecret(remotePublicKey) {

    if (!keyPair) {
        throw new Error("Local key pair has not been generated.");
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
 * Used only for debugging.
 */
function bufferToHex(buffer) {

    const bytes = new Uint8Array(buffer);

    return Array.from(bytes)
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}


/**
 * Test ECDH locally.
 *
 * Alice and Bob independently calculate
 * the same shared secret.
 */
async function testECDH() {

    console.log("[Crypto] Testing ECDH...");

    const alice = await crypto.subtle.generateKey(
        {
            name: "ECDH",
            namedCurve: "P-256"
        },
        true,
        ["deriveBits"]
    );

    const bob = await crypto.subtle.generateKey(
        {
            name: "ECDH",
            namedCurve: "P-256"
        },
        true,
        ["deriveBits"]
    );


    // Alice uses:
    // Alice private key + Bob public key

    const aliceSecret = await crypto.subtle.deriveBits(
        {
            name: "ECDH",
            public: bob.publicKey
        },
        alice.privateKey,
        256
    );


    // Bob uses:
    // Bob private key + Alice public key

    const bobSecret = await crypto.subtle.deriveBits(
        {
            name: "ECDH",
            public: alice.publicKey
        },
        bob.privateKey,
        256
    );


    const aliceBytes = new Uint8Array(aliceSecret);
    const bobBytes = new Uint8Array(bobSecret);


    const identical =
        aliceBytes.length === bobBytes.length &&
        aliceBytes.every(
            (value, index) =>
                value === bobBytes[index]
        );


    console.log(
        "[Crypto] Shared secrets identical:",
        identical
    );


    if (identical) {
        console.log(
            "[Crypto] ECDH test successful."
        );
    } else {
        console.error(
            "[Crypto] ECDH test failed."
        );
    }


    return identical;
    }
