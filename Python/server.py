import aiohttp
from aiohttp import web, WSCloseCode
import asyncio

class Server:
    
    def __init__(self, host, port, ws_callback):
        # Set host/port
        self.host = host
        self.port = port
        # Keep track of connected websocket clients
        self.ws_clients = set()
        # create the runner with routes
        self.runner = self.create_runner()
        # Sets the callback function for websocket rcv
        self.ws_callback = ws_callback

    # starts the server - call this with an event loop
    async def start_server(self):
        await self.runner.setup()
        site = web.TCPSite(self.runner, self.host, self.port)
        await site.start()

    # creates the runner
    def create_runner(self):
        app = web.Application()
        app.add_routes([
            web.get('/',    self.http_handler),
            web.get('/ws',  self.websocket_handler)
        ])
        app.router.add_static('/',
                              path='./',
                              name='index')

        return web.AppRunner(app)

    async def http_handler(self, request):
        return web.FileResponse("./index.html")

    # handles the websocket callback
    async def websocket_handler(self, request):
        ws = web.WebSocketResponse()
        await ws.prepare(request)
    
        self.ws_clients.add(ws)
        print("opened ws")
    
        async for msg in ws:
            if msg.type == aiohttp.WSMsgType.TEXT:
                if msg.data == 'close':
                    ws.close()
                else:
                    await self.ws_callback(msg.data)
            elif msg.type == aiohttp.WSMsgType.ERROR:
                print('ws connection closed with exception %s' % ws.exception())

        print("closed ws")
        return ws
    
    # broadcasts a message to every connected websocket client
    async def broadcast(self, message):
        inactive_clients = []
        for ws in self.ws_clients:
            try:
                await ws.send_str(message)
            except:
                inactive_clients.append(ws)
    
        for ina_ws in inactive_clients:
            self.ws_clients.remove(ina_ws)
