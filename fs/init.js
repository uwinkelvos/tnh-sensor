load("api_config.js");
load("api_dht.js");
load("api_timer.js");
load("api_sys.js");
load("api_events.js");
load("api_net.js");
load("api_esp8266.js");
load("api_mqtt.js");
load("api_file.js");

let dht = DHT.create(Cfg.get("app.pin"), DHT.DHT22);

let ev = null;
let sampleCounter = 0;
let timer = null;

Event.addGroupHandler(Net.EVENT_GRP, function (ev, evdata, arg) {
	if (ev === Net.STATUS_GOT_IP) {
		print("####### connected!");
		timer = Timer.set(Cfg.get("app.sampleInterval"), true, function () {
			sampleCounter++;
			let data = {
				date: Timer.now(),
				temp: dht.getTemp(),
				humidity: dht.getHumidity()
			};
			print("##### data: " + JSON.stringify(data));
			outputData(data);

			if (sampleCounter > Cfg.get("app.sampleCount")) {
				Timer.del(timer);
				ESP8266.deepSleep(Cfg.get("app.sleepInterval"));
			}
		}, null);
	}
}, null);

function outputData(data) {
	if (Cfg.get("app.output.file.enable")) {
		let csv = JSON.stringify(data.date) + ";" + JSON.stringify(data.temp) + ";" + JSON.stringify(data.humidity) + "\n";
		File.write(csv, Cfg.get("app.output.file.name"), "a");
	}
	if (Cfg.get("app.output.mqtt.enable")) {
		let res = MQTT.pub(Cfg.get("app.output.mqtt.topic"), JSON.stringify(data), 2, true);
		if (!res) {
			print("###### Could not publish!");
		}
	}
}
