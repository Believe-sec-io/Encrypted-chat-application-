import json
import websockets


connected_clients = set()


async def register(websocket):
    connected_clients.add(websocket)

    print(
        f"[+] Client connected: {websocket.remote_address}"
    )


async def unregister(websocket):
    connected_clients.discard(websocket)

    print(
        f"[-] Client disconnected: {websocket.remote_address}"
    )


async def broadcast(data, sender):
    """
    Send data to every connected client except the sender.
    """

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

                print("[!] Invalid JSON received.")

                continue


            message_type = data.get("type")


            # ----------------------------------------
            # Public key exchange
            # ----------------------------------------

            if message_type == "public_key":

                print(
                    "[KEY] Public key received."
                )


                await broadcast(
                    {
                        "type": "public_key",
                        "public_key": data.get("public_key")
                    },
                    websocket
                )


            # ----------------------------------------
            # Chat message
            # ----------------------------------------

            elif message_type == "message":

                print(
                    "[MESSAGE] Message received."
                )


                await broadcast(
                    {
                        "type": "message",
                        "data": data.get("data")
                    },
                    websocket
                )


            else:

                print(
                    f"[!] Unknown message type: {message_type}"
                )


    except websockets.exceptions.ConnectionClosed:

        pass

    finally:

        await unregister(websocket)
