/**
In order to run this sample, you need to do the following: 
    1 - Your smart contract should implement Verification. Eg: 
        ```
            from boa.interop.Neo.Runtime import GetTrigger

            trigger = GetTrigger()

            if trigger == Verification():
                return True
        ```
    2 - Import a contract hash into cfg.account.address using cfg.account.publicKey from your 'Prompt'
    3 - Replace to_address with your target address
**/

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
