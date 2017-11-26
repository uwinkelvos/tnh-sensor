load('api_config.js');
load('api_rpc.js');
load('api_dht.js');
load('api_timer.js');
load("api_sys.js");
load("api_net.js");
load("api_file.js");

let pin = Cfg.get('app.pin');
let dht = DHT.create(pin, DHT.DHT11);

let ev = null;
Net.setStatusEventHandler(function (ev, arg) {
	print("== Net event:", ev);
}, null);

RPC.addHandler('Sensors.Temp.Read', function (args) {
	return dht.getTemp();
});

RPC.addHandler('Sensors.Humidity.Read', function (args) {
	return dht.getHumidity();
});


//Sys.usleep(1000);
let data = {
	date: Timer.now(),
	temp: dht.getTemp(),
	humidity: dht.getHumidity()
};
print("##### data: " + JSON.stringify(data));
File.write(JSON.stringify(data), "data.json", "a");
let newdata = JSON.parse(File.read("data.json"));
print("##### newdata: " + JSON.stringify(newdata));

