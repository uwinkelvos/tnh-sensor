load('api_config.js');
load('api_rpc.js');
load('api_dht.js');
load('api_timer.js');
load("api_sys.js");
load("api_net.js");
load("api_file.js");
load("api_esp8266.js");

let APP_PIN = Cfg.get('app.pin');
let APP_SAMPLE_INTERVAL = Cfg.get('app.sampleInterval');
let APP_SAMPLE_COUNT = Cfg.get('app.sampleCount');
let APP_SLEEP_INTERVAL = Cfg.get('app.sleepInterval');

let dht = DHT.create(APP_PIN, DHT.DHT11);

let ev = null;
let sampleCounter = 0;
let timer = null;

Net.setStatusEventHandler(function (ev, arg) {
	if (ev === Net.STATUS_GOT_IP) {
		print("####### connected!");
		timer = Timer.set(APP_SAMPLE_INTERVAL, true, function () {
			sampleCounter++;
			let data = {
				date: Timer.now(),
				temp: dht.getTemp(),
				humidity: dht.getHumidity()
			};
			print("##### data: " + JSON.stringify(data));
			File.write(JSON.stringify(data.date) + ";" + JSON.stringify(data.temp) + ";" + JSON.stringify(data.humidity) + "\n", "data.csv", "a");
			if (sampleCounter >= APP_SAMPLE_COUNT) {
				Timer.del(timer);
				print("####### going to sleep!");
				ESP8266.deepSleep(APP_SLEEP_INTERVAL);
			}
		}, null);
	}
}, null);
