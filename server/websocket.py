import json
import websockets


connected_clients = set()


async def register(websocket):
    connected_clients.add(websocket)

    print(
        f"[+] Client connected: "
        f"{websocket.remote_address}"
    )


async def unregister(websocket):
    connected_clients.discard(websocket)

    print(
        f"[-] Client disconnected: "
        f"{websocket.remote_address}"
    )


async def broadcast(data, sender):

    message = json.dumps(data)

    disconnected = set()

    for client in connected_clients.copy():

        if client == sender:
            continue

        try:
            await client.send(message)

        except websockets.exceptions.ConnectionClosed:
            disconnected.add(client)

    for client in disconnected:
        connected_clients.discard(client)


async def handle_client(websocket):

    await register(websocket)

    try:

        async for raw_message in websocket:

            try:

                data = json.loads(raw_message)

            except json.JSONDecodeError:

                print("[!] Invalid JSON.")
                continue

            message_type = data.get("type")


            if message_type == "public_key":

                print("[KEY] Public key received.")

                await broadcast(
                    {
                        "type": "public_key",
                        "public_key": data.get("public_key"),
                        "fingerprint": data.get("fingerprint")
                    },
                    websocket
                )


            elif message_type == "encrypted_message":

                print(
                    "[MESSAGE] Encrypted message received."
                )

                await broadcast(
                    {
                        "type": "encrypted_message",
                        "data": data.get("data")
                    },
                    websocket
                )


            else:

                print(
                    f"[!] Unknown message type: "
                    f"{message_type}"
                )


    except websockets.exceptions.ConnectionClosed:

        pass

    finally:

        await unregister(websocket)
