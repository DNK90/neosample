const neonjs = require('@cityofzion/neon-js');

let WIF_KEY = "KxDgvEKzgSBPPfuVfw67oPQBSjidEiqTHURKSDL1R7yGaGYAeYnr";
let account = new neonjs.wallet.Account(WIF_KEY);

// you can choose either neondb or neoscan,
// there is a switch function that will automatically switch between neoscan (v1) and neondb (v2) if exception is thrown
let net = {
    neoscan: "http://localhost:4000/api/main_net",
    neondb: "http://localhost:5000"
};

let rpcUrl = {
    local: [
        "http://localhost:30333",
        "http://localhost:30334",
        "http://localhost:30335",
        "http://localhost:30336"
    ]
};

module.exports = {
  neonjs: neonjs,
  account: account,
  net: net,
  rpcUrl: rpcUrl
};

