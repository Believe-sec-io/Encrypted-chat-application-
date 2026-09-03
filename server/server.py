import asyncio
import websockets

from websocket import handle_client


async def main():
    server = await websockets.serve(
        handle_client,
        "localhost",
        8765
    )

    print("[SERVER] Secure Chat WebSocket Server")
    print("[SERVER] Listening on ws://localhost:8765")

    await server.wait_closed()


if __name__ == "__main__":
    asyncio.run(main())
