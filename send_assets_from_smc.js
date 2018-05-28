const cfg = require('./config');
let to_address = "AbCunncuRGDR7CVMe8vLtbfqTATkDRfDsY";
let contract_address = "APHG4WsthtmYP9jY53LS5nMgBZzzSFWjNw";
let neo = 10;
let neonjs = cfg.neonjs;

function signTx(tx, publicKey) {
    return Promise.resolve(tx.sign(cfg.account.privateKey));
} 


let config = {
	net: cfg.net.neoscan,
	intents: cfg.neonjs.api.makeIntent({NEO: neo}, to_address),
    address: contract_address,
    sendingFromSmartContract: true,
    publicKey: cfg.account.publicKey,
    privateKey: cfg.account.privateKey,
    signingFunction: signTx
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
