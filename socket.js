//var host_ip = location.host.split(":")[0];
//var socket_ip = "ws://".concat(host_ip).concat(":8080");
const socket = new WebSocket('/ws');

const cbuf_len = 1000;
const polling_rate = 0.05;

let chart_labels = [cbuf_len];
for (let i = 0; i < cbuf_len; i++) {
    chart_labels[i] = (cbuf_len-i)*polling_rate;
    chart_labels[i] = Math.round(chart_labels[i] * 10) / 10
}

let hall_effect_cbuf = new Dequeue(cbuf_len, 0);
let motor_psm_cbuf = new Dequeue(cbuf_len, 0);
let acceleration_cbuf = new Dequeue(cbuf_len, 0);
let regen_cbuf = new Dequeue(cbuf_len, 0);

// -- READOUTS -- //
const hall_effect_readout = document.getElementById("hall_effect_readout");
const motor_psm_readout = document.getElementById("motor_psm_readout");
const acceleration_readout = document.getElementById("acceleration_readout");
const regen_readout = document.getElementById("regen_readout");
const motor_state_readout = document.getElementById("motor_state_readout");
const vfm_readout = document.getElementById("vfm_readout");

const acceleration_slider_readout = document.getElementById("acceleration_slider_readout");
const regen_slider_readout = document.getElementById("regen_slider_readout");

//  -- GRAPHING -- //
const hall_effect_chart_ctx = document.getElementById("hall_effect_chart").getContext("2d");
const motor_psm_chart_ctx = document.getElementById("motor_psm_chart").getContext("2d");
const acceleration_chart_ctx = document.getElementById("acceleration_chart").getContext("2d");
const regen_chart_ctx = document.getElementById("regen_chart").getContext("2d");

let hall_effect_json = JSON.parse(JSON.stringify(GRAPH_CFG));
hall_effect_json.data.labels = chart_labels;
hall_effect_json.data.datasets[0].label = "Hall Effect";
let hall_effect_chart = new Chart(hall_effect_chart_ctx, hall_effect_json); // < Cursed AF

let motor_psm_json = JSON.parse(JSON.stringify(GRAPH_CFG));
motor_psm_json.data.labels = chart_labels;
motor_psm_json.data.datasets[0].label = "Motor PSM";
let motor_psm_chart = new Chart(motor_psm_chart_ctx, motor_psm_json); // < Cursed AF


let acceleration_json = JSON.parse(JSON.stringify(GRAPH_CFG));
acceleration_json.data.labels = chart_labels;
acceleration_json.data.datasets[0].label = "Acceleration";
acceleration_json.options.aspectRatio = 3;
let acceleration_chart = new Chart(acceleration_chart_ctx, acceleration_json); // < Cursed AF

let regen_json = JSON.parse(JSON.stringify(GRAPH_CFG));
regen_json.data.labels = chart_labels;
regen_json.data.datasets[0].label = "Regen";
regen_json.options.aspectRatio = 3;
let regen_chart = new Chart(regen_chart_ctx, regen_json);

// -- WEB SOCKETS -- //

socket.onopen = function(event) {
  // Handle connection open
};

socket.onmessage = function(event) {
      // Handle received message
      json_obj = JSON.parse(event.data);
      
      let hall_effect_data = json_obj.hall_effect;
      let motor_psm_data = json_obj.motor_psm;
      let acceleration_data = json_obj.acceleration;
      let regen_data = json_obj.regen;
      let motor_state_data = json_obj.motor_state;
      let vfm_data = json_obj.vfm;
    
      hall_effect_cbuf.push(hall_effect_data);
      motor_psm_cbuf.push(motor_psm_data);
      acceleration_cbuf.push(acceleration_data);
      regen_cbuf.push(regen_data);
    
      hall_effect_chart.data.datasets[0].data = hall_effect_cbuf.buffer;
      motor_psm_chart.data.datasets[0].data = motor_psm_cbuf.buffer;
      acceleration_chart.data.datasets[0].data = acceleration_cbuf.buffer;
      regen_chart.data.datasets[0].data = regen_cbuf.buffer;
      
      hall_effect_chart.update();
      motor_psm_chart.update();
      acceleration_chart.update();
      regen_chart.update();
      
      hall_effect_readout.innerHTML = "[".concat(hall_effect_data.toFixed(2)).concat("]");
      motor_psm_readout.innerHTML = "[".concat(motor_psm_data.toFixed(2)).concat("]");
      acceleration_readout.innerHTML = "[".concat(acceleration_data.toFixed(2)).concat("]");
      regen_readout.innerHTML = "[".concat(regen_data.toFixed(2)).concat("]");
      
      motor_state_readout.innerHTML = "MOTOR: ".concat(motor_state_data.toUpperCase());
      vfm_readout.innerHTML = "VFM: ".concat(vfm_data);
      
      acceleration_slider_readout.value = acceleration_data*100;
      regen_slider_readout.value = regen_data*100;
      
    //document.getElementById("latest_msg").innerHTML = "LAST WS MSG: ".concat(acceleration_cbuf.buffer);
};

socket.onclose = function(event) {
  // Handle connection close
};

// -- HELPERS -- //

// Define terminals
const sent_terminal = document.getElementById("sent_terminal");
const recv_terminal = document.getElementById("recv_terminal");

function SendCommand(s) {
    //let utf8Encode = new TextEncoder();
    sent_terminal.textContent += s.concat("\n > ");
    sent_terminal.scrollTop = sent_terminal.scrollHeight;
    socket.send(s);
}

function FloatToCMD(f) {
    var buf = new ArrayBuffer(4);
    (new Float32Array(buf))[0] = f;
    let decoder = new TextDecoder("utf-8");
    return(decoder.decode(buf));
}

function CheckValue(val) {
    if (isNaN(val)) { return false; }
    if (val < 0 || val > 100)   { return false; }
    return true;
}

// SLIDERS + NUMBER INPUTS //

const acceleration_slider = document.getElementById("acceleration_slider");
const acceleration_number = document.getElementById("acceleration_number");
const acceleration_button = document.getElementById("acceleration_button");

const regen_slider = document.getElementById("regen_slider");
const regen_number = document.getElementById("regen_number");
const regen_button = document.getElementById("regen_button");

function ErrorNumber(e, btn) {
    e.style.borderColor = 'rgba(255, 0, 0, 1)';
    btn.style.opacity = '0.5';
    btn.style.pointerEvents = 'none';
}

function GoodNumber(e, btn) {
    e.style.borderColor = 'rgba(255,255,255,0.2)';
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
}

acceleration_slider.oninput = function () {
    acceleration_number.value = this.value;
    GoodNumber(acceleration_number, acceleration_button);
}

acceleration_number.oninput = function () {
    let checkval = this.value;
    if (acceleration_number.value === '') { checkval = 0; }

    if (CheckValue(checkval)) {
        acceleration_slider.value = checkval;
        GoodNumber(acceleration_number, acceleration_button);
    } else {
        ErrorNumber(acceleration_number, acceleration_button);
    }
}

regen_slider.oninput = function () {
    regen_number.value = this.value;
    GoodNumber(regen_number, regen_button);
}

regen_number.oninput = function () {
    let checkval = this.value;
    if (regen_number.value === '') { checkval = 0; }

    if (CheckValue(checkval)) {
        regen_slider.value = checkval;
        GoodNumber(regen_number, regen_button);
    } else {
        ErrorNumber(regen_number, regen_button);
    }
}

// -- COMMANDS -- //

function set_motor_state(state) {
    SendCommand("set_motor_state ".concat(state));
}

function get_motor_state() {
    SendCommand("get_motor_state");
}

function set_regen() {
    let val = (regen_slider.value/100.0).toFixed(2);
    //SendCommand("set_regen ".concat(FloatToCMD(val)));
    SendCommand("set_regen ".concat(val));
}

function get_regen() {
    SendCommand("get_regen");
}

function set_acceleration() {
    let val = (acceleration_slider.value/100.0).toFixed(2);
    //SendCommand("set_acceleration ".concat(FloatToCMD(val)));
    SendCommand("set_acceleration ".concat(val));
}

function get_acceleration() {
    SendCommand("get_acceleration");
}

function set_vfm(val) {
    SendCommand("set_vfm ".concat(val));
}

function get_vfm() {
    SendCommand("get_vfm");
}

// Get the input field
const console = document.getElementById("conole_send");

// Execute a function when the user presses a key on the keyboard
console.addEventListener("keypress", function(event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
        // Cancel the default action, if needed
        event.preventDefault();
        
        SendCommand(console.value);
        console.value = "";
    }
});