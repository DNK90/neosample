const cfg = require('./config');

let to_address = "AVzvbL4pYYK4tfBg8TsZPFcpaozqcSmbWF";
let neo = 10;

let config = {
	net: cfg.net.neoscan,
	intents: cfg.neonjs.api.makeIntent({NEO: neo}, to_address),
    address: cfg.account.address,
    privateKey: cfg.account.privateKey
};

function sendAsset(idx) {
	if (idx < cfg.rpcUrl.local.length) {
	    config["url"] = cfg.rpcUrl.local[idx];
		cfg.neonjs.api.sendAsset(config)
        .then(function(result) {
            console.log(JSON.stringify(result.response));
        })
        .catch(function(config) {
            console.log(config);
            sendAsset(++idx);
        });
	}
}

sendAsset(0);
