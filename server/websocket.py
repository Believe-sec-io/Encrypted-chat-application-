import websockets


connected_clients = set()


async def register(websocket):
    connected_clients.add(websocket)
    print(f"[+] Client connected: {websocket.remote_address}")


async def unregister(websocket):
    connected_clients.discard(websocket)
    print(f"[-] Client disconnected: {websocket.remote_address}")


async def broadcast(message, sender):
    for client in connected_clients.copy():
        if client != sender:
            await client.send(message)


async def handle_client(websocket):
    await register(websocket)

    try:
        async for message in websocket:
            print(f"[MESSAGE] {message}")

            await broadcast(message, websocket)

    except websockets.exceptions.ConnectionClosed:
        pass

    finally:
        await unregister(websocket)
