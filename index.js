const neonjs = require('@cityofzion/neon-js');

let PRIVATE_KEY = "KxDgvEKzgSBPPfuVfw67oPQBSjidEiqTHURKSDL1R7yGaGYAeYnr";
let account = new neonjs.wallet.Account(PRIVATE_KEY);
let fromAddrScriptHash = neonjs.wallet.getScriptHashFromAddress(account.address);

// you can choose either neondb or neoscan, 
// there is a switch function that will automatically switch between neoscan (v1) and neondb (v2) if exception is thrown 
let net = {
	neoscan: "http://localhost:4000/api/main_net",
	neondb: "http://localhost:5000"
}

let contract = "86d58778c8d29e03182f38369f0d97782d303cc0";
let gas = 1;

let rpcUrl = {
    local: [
    	"http://localhost:8081",
    	"http://localhost:30333",
    	"http://localhost:30334",
    	"http://localhost:30335",
    	"http://localhost:30336"
    ]
};

function signTx(tx, publicKey) {
    return Promise.resolve(neonjs.tx.signTransaction(tx, account.privateKey))
}

let tx_output = new neonjs.tx.TransactionOutput({
    assetId: neonjs.CONST.ASSET_ID.GAS,
    scriptHash: fromAddrScriptHash,
    value: new neonjs.u.Fixed8(gas)
});

let intents = [tx_output];

function sendrawtransaction(idx) {
	if (idx < rpcUrl.local.length) {
		neonjs.api.doInvoke({
		    url: rpcUrl.local[idx],
		    net: net.neondb,
		    intents: intents,
		    script: neonjs.default.create.script({
		        scriptHash: contract,
		        args: [
		            neonjs.u.str2hexstring("add"),
		            neonjs.u.int2hex(1),
		            neonjs.u.int2hex(2)
		        ]
		    }),
		    address: account.address,
		    publicKey: account.publicKey,
		    signingFunction: signTx,
		    privateKey: account.privateKey,
		    gas: gas,
		    override: {
		       attributes: [
		           {
		               data: neonjs.u.hash160(neonjs.wallet.getVerificationScriptFromPublicKey(account.publicKey)),
		               usage: neonjs.tx.TxAttrUsage.Script
		           }
		       ]
		    }
		}).then(function(result) {

			console.log(JSON.stringify(result));
			if (result.response.result == true) {
				return;
			} 
			sendrawtransaction(++idx);
		    
		});
	}
}

sendrawtransaction(0);
