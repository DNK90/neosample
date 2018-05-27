const cfg = require("./config");
const neonjs = cfg.neonjs;
let account = cfg.account;
let net = cfg.net;

let fromAddrScriptHash = neonjs.wallet.getScriptHashFromAddress(account.address);

let contract = "86d58778c8d29e03182f38369f0d97782d303cc0";
let gas = 1;

function signTx(tx, publicKey) {
    return Promise.resolve(neonjs.tx.signTransaction(tx, account.privateKey))
}

let tx_output = new neonjs.tx.TransactionOutput({
    assetId: neonjs.CONST.ASSET_ID.GAS,
    scriptHash: fromAddrScriptHash,
    value: new neonjs.u.Fixed8(gas)
});

let intents = [tx_output];

function sendrawtransaction() {
    neonjs.api.doInvoke({
        url: "http://localhost:3000",
        net: net.neoscan,
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
    }).catch(function(result) {
        console.log(JSON.stringify(result));
    });
}

sendrawtransaction();
