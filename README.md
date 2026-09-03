🔐 Encrypted Chat

A lightweight end-to-end encrypted web chat prototype built with Python, WebSockets, and the Web Crypto API.

The project demonstrates how two clients can establish a shared encryption key and exchange encrypted messages without the WebSocket server ever seeing the plaintext.

«⚠️ Security notice: This is an educational prototype, not a production-ready secure messaging application.»

---

📌 Overview

The application uses:

- WebSocket for real-time communication
- ECDH P-256 for key agreement
- HKDF-SHA-256 for symmetric key derivation
- AES-256-GCM for message encryption
- SHA-256 for public-key fingerprints
- Web Crypto API for client-side cryptographic operations

The server acts only as a message relay.

The plaintext message is encrypted inside the browser before it is sent to the server.

---

🏗️ Architecture

                  ┌──────────────────────┐
                  │    WebSocket Server  │
                  │      Python          │
                  │                      │
                  │   Relay only         │
                  └──────────┬───────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
        ┌───────────────┐        ┌───────────────┐
        │   Client A    │        │   Client B    │
        │    Browser    │        │    Browser    │
        └───────┬───────┘        └───────┬───────┘
                │                         │
                │       ECDH P-256        │
                │◄───────────────────────►│
                │                         │
                │      Shared Secret      │
                │◄───────────────────────►│
                │                         │
                │      HKDF-SHA-256       │
                │           ↓             │
                │      AES-256-GCM        │
                │                         │
                └─────────────────────────┘

---

🔐 Cryptographic Flow

1. Key generation

Each client generates its own ECDH key pair:

Client A
├── Private Key A
└── Public Key A

Client B
├── Private Key B
└── Public Key B

The private keys never leave the browser.

---

2. Public-key exchange

The clients exchange their public keys through the WebSocket server.

Client A
   │
   │ Public Key A
   ▼
Server
   │
   │ Public Key A
   ▼
Client B

The server does not need to know the private keys.

---

3. ECDH shared secret

Both clients independently calculate the same shared secret.

Client A:

Private A + Public B
        ↓
   Shared Secret


Client B:

Private B + Public A
        ↓
   Shared Secret

The resulting secret is identical on both sides.

---

4. HKDF key derivation

The ECDH shared secret is passed through:

HKDF
 ├── SHA-256
 ├── Salt
 └── Info
      ↓
AES-256 encryption key

This produces the symmetric encryption key used for messages.

---

5. AES-256-GCM encryption

Before a message is sent:

Plaintext
    ↓
AES-256-GCM
    ↓
Ciphertext + IV
    ↓
WebSocket
    ↓
Server

The server receives encrypted data such as:

{
    "type": "encrypted_message",
    "data": {
        "ciphertext": "...",
        "iv": "..."
    }
}

The server never receives the plaintext message.

---

📂 Project Structure

encrypted-chat/
│
├── server/
│   ├── __init__.py
│   ├── server.py
│   ├── websocket.py
│   └── rooms.py
│
├── client/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── app.js
│       ├── websocket.js
│       └── crypto.js
│
├── tests/
│   ├── test_crypto.py
│   └── test_websocket.py
│
├── requirements.txt
├── .gitignore
└── README.md

---

⚙️ Requirements

You need:

- Python 3.10+
- A modern web browser
- pip

The browser must support the Web Crypto API.

---

## 🚀 Installation

Clone the repository:

git clone https://github.com/Believe-sec-io/Encrypted-chat-application.git

Enter the project directory:

cd encrypted-chat

Create a virtual environment:

python -m venv venv

Activate it.

## Windows

venv\Scripts\activate

## Linux/macOS

source venv/bin/activate

Install dependencies:

pip install -r requirements.txt

---

## ▶️ Running the Server

From the project root:

python server/server.py

The server should display:

[SERVER] Secure Chat WebSocket Server
[SERVER] Listening on ws://localhost:8765

---

## 🌐 Running the Client

Open a second terminal from the project root and run:

python -m http.server 8000 --directory client

Then open:

http://localhost:8000

---

## 🧪 Testing the Chat

To simulate two users:

1. Start the WebSocket server

python server/server.py

2. Start the web server

python -m http.server 8000 --directory client

3. Open the application

Open:

http://localhost:8000

4. Open a second client

Open another browser tab:

http://localhost:8000

Each browser instance generates its own ECDH key pair.

You should see:

Connected

followed by:

🔐 Secure

---

## 🔎 Testing Encryption

Open the browser developer console.

You should see messages similar to:

[App] Initializing...
[Crypto] ECDH key pair generated.
[WebSocket] Connected.
[Identity] Local fingerprint:
...
[Identity] Remote public key received.
[Identity] Remote fingerprint:
...
[Identity] Fingerprint verified.
[Crypto] AES-256-GCM key derived.
[Crypto] Secure session established.

When sending a message:

[MESSAGE] Encrypted message received.

The server should not receive the plaintext message.

---

## 🛡️ Security Model

The current prototype provides:

Client-side encryption

Messages are encrypted before transmission.

Private-key protection

Private ECDH keys remain inside the browser.

Authenticated encryption

AES-GCM provides confidentiality and integrity for encrypted messages.

Key agreement

ECDH allows both clients to derive the same shared secret without transmitting that secret.

Key fingerprints

Public keys are represented by SHA-256 fingerprints for basic identity verification.

---

## ⚠️ Security Limitations

This project is intentionally an educational prototype.

It should not currently be considered equivalent to Signal, WhatsApp, or another production-grade secure messaging system.

Important limitations include:

- No persistent user identity
- No authenticated key directory
- No complete protection against man-in-the-middle attacks
- No forward secrecy across sessions
- No replay protection
- No message authentication outside AES-GCM
- No persistent encrypted message storage
- WebSocket currently uses "ws://" instead of "wss://"
- No production authentication system
- No robust session management

Important fingerprint limitation

The current fingerprint mechanism verifies that the fingerprint corresponds to the public key received.

However, a malicious relay could potentially replace both the public key and its fingerprint.

Therefore, the fingerprint system does not independently provide complete protection against a man-in-the-middle attack.

A production implementation would need a trusted mechanism for authenticating public keys.

---

## 🔮 Future Improvements

Possible improvements include:

- "wss://" TLS encryption
- Persistent user identities
- Digital signatures
- QR-code identity verification
- Safety numbers
- Perfect forward secrecy
- Ephemeral session keys
- Replay protection
- User authentication
- Private chat rooms
- Group encryption
- Encrypted message history
- Key rotation
- Secure key storage
- Security audit
- Automated cryptographic tests

---

## 🎯 Learning Objectives

This project was designed to demonstrate practical concepts in:

- End-to-end encryption
- Public-key cryptography
- ECDH
- Symmetric encryption
- AES-GCM
- HKDF
- SHA-256
- WebSockets
- Client-side security
- Secure communication architecture
- Threat modeling
- Man-in-the-middle attacks

---

🧠 What This Project Demonstrates

The most important concept is:

                PLAINTEXT
                    │
                    ▼
             Client Browser
                    │
              AES-256-GCM
                    │
                    ▼
               CIPHERTEXT
                    │
                    ▼
              WebSocket
                    │
                    ▼
                 SERVER
                    │
               RELAY ONLY
                    │
                    ▼
               CIPHERTEXT
                    │
                    ▼
             Client Browser
                    │
              AES-256-GCM
                    │
                    ▼
                PLAINTEXT

The server is intentionally designed so that it does not need access to the plaintext.

---

📜 License

This project is intended for educational and cybersecurity research purposes.

Add an appropriate open-source license before publishing the repository.
