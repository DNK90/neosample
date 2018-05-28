const cfg = require("./config");
const neonjs = cfg.neonjs;
let account = cfg.account;
let net = cfg.net;

let fromAddrScriptHash = neonjs.wallet.getScriptHashFromAddress(account.address);
let contract = "77126565b201c46dd4dc5600082e12775aa75752";
let gas = 1;
let neo = 10;

console.log(new neonjs.u.Fixed8(10));
console.log(neonjs.CONST.ASSET_ID.GAS);
console.log(neonjs.CONST.ASSET_ID.NEO);

function signTx(tx, publicKey) {
    return Promise.resolve(neonjs.tx.signTransaction(tx, account.privateKey))
}

let gas_output = new neonjs.tx.TransactionOutput({
    assetId: neonjs.CONST.ASSET_ID.GAS,
    scriptHash: fromAddrScriptHash,
    value: new neonjs.u.Fixed8(gas)
});

let neo_output = new neonjs.tx.TransactionOutput({
    assetId: neonjs.CONST.ASSET_ID.NEO,
    scriptHash: contract,
    value: neo
});

let intents = [gas_output, neo_output];

function sendrawtransaction() {
    neonjs.api.doInvoke({
        url: "http://localhost:3000",
        net: net.neoscan,
        intents: intents,
        script: neonjs.default.create.script({
            scriptHash: contract,
            args: []
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
    }).catch(function(result) {
        console.log(JSON.stringify(result));
    });
}

sendrawtransaction();
