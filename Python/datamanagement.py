import collections
from asyncio import sleep
import json
import random


class DataManager:
    def __init__(self, cbuf_len, update_period, update_callback):
        self.cbuf_len = cbuf_len
        self.update_period = update_period
        self.update_callback = update_callback
        
        # // LIVE READOUT //
        self.acceleration = 0.0
        self.regen = 0.0
        self.hall_effect = 0
        self.motor_psm = 0
        
        self.motor_state = "off"
        self.vfm = 0
        
        # // DATA BUFFERS //
        self.acceleration_cbuf = collections.deque(maxlen=cbuf_len)
        self.regen_cbuf = collections.deque(maxlen=cbuf_len)
        self.hall_effect_cbuf = collections.deque(maxlen=cbuf_len)
        self.motor_psm_cbuf = collections.deque(maxlen=cbuf_len)
        
        # // FILL DATA BUFFERS //
        for i in range(cbuf_len):
            self.update_buffers()
            
        
    def update_buffers(self):
        self.acceleration_cbuf.append(self.acceleration)
        self.regen_cbuf.append(self.regen)
        self.hall_effect_cbuf.append(self.hall_effect)
        self.motor_psm_cbuf.append(self.motor_psm)
        
    def latest_json(self):
        json_dat = {'acceleration': self.acceleration, 
                    'regen': self.regen, 
                    'hall_effect': self.hall_effect,
                    'motor_psm': self.motor_psm
                    }
        return json.dumps(json_dat)
        

    # TODO: Implement getting all cached results
    # def alltime_json(self):
        
        
    # update the buffers every {update_period} seconds
    async def periodic_update(self):
        while True:
            self.update_buffers()
            self.acceleration = random.uniform(0.45, 0.55)
            await self.update_callback(self.latest_json())
            await sleep(self.update_period)