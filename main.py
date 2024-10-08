import asyncio
from email.policy import default

import aioconsole
import serial_asyncio
from serial_asyncio import open_serial_connection

from Python.server import Server
from Python.datamanagement import DataManager

async def stdout_xbee(msg):
    writer.write(msg.encode("utf-8"))

async def stdout_echo(msg):
    print(msg)
    
async def do_nothing(msg):
    pass

async def xbee_listener():
    while True:
        line = await reader.readline()
        await parse_xbee(line.decode("utf-8"))

async def mock_listener():
    print("!! RUNNING IN TERMINAL MODE !!")
    while True:
        line = await aioconsole.ainput('>>')
        await parse_xbee(line)

async def parse_xbee(cmd_str):
    cmd = cmd_str.split(" ")
    if len(cmd) < 2:
        print("Too Few Args")
        return
    match(cmd[0]):
        case "hall_effect":
            data_manager.hall_effect = float(cmd[1])
        case "motor_psm_voltage":
            data_manager.motor_psm_voltage = float(cmd[1])
        case "motor_psm_current":
            data_manager.motor_psm_current = float(cmd[1])
        case "motor_state":
            data_manager.motor_state = cmd[1]
        case "regen":
            data_manager.regen = float(cmd[1])
        case "acceleration":
            data_manager.acceleration = float(cmd[1])
        case "vfm":
            data_manager.vfm = int(cmd[1])
        case _:
            print(f"Unknown Command {cmd[0]}")
            return
    
    # await radio_server.broadcast(cmd_str)

async def open_ser(url, baudrate):
    global reader
    global writer
    reader, writer = await serial_asyncio.open_serial_connection(url=url, baudrate=baudrate)
    print(f"opened serial on {url} -- BD: {baudrate}") 
    
async def main():
    global radio_server
    global data_manager
    
    await open_ser(url="/dev/serial0", baudrate=115200)
    radio_server = Server(host= '', port=8000, ws_callback=stdout_xbee)
    data_manager = DataManager(cbuf_len=10, update_period=0.1, update_callback=radio_server.broadcast)

    await asyncio.gather(radio_server.start_server(), data_manager.periodic_update(), xbee_listener())

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(main())
        loop.run_forever()
    finally:
        loop.close()
    
