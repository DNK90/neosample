# NEO_sample

## Reason:
I am working with neo private network, but I couldn't invoke a transaction using neonjs.
Then I found out that neonjs is using an API to get the balance which is not provided by rpc.
And finally, I found **Neon wallet DB project** which is mentioned in its README that:
> This code runs a database for Neon that mirrors the NEO blockchain and serves several APIs that don't exist anywhere else (for example, an API to get claims and the full transaction history associated with an address).

There you go, this sample will guide you steps-by-steps how to setup and invoke transaction in private network.

## Requirements
- Docker and docker-compose
- Python 3 (3.6)
- [Neo python](https://github.com/CityOfZion/neo-python)
- [Neon Wallet DB project](https://github.com/CityOfZion/neon-wallet-db)
## Installation
1. **Private Network**
- From **neo-python/docker**, modify **docker-compose-neoscan.yml** to expose 8081 port (or any port you want to expose for your rpc server)
```yaml
version: "3"
services:
  neo-scan:
    image: slipoh/neo-scan
    container_name: "neo-scan"
    ports:
      - 4000:4000
    links:
      - postgresql:postgres
      - neo-privnet:20333
      - neo-privnet:20334
      - neo-privnet:20335
      - neo-privnet:20336
      - neo-privnet:30333
      - neo-privnet:30334
      - neo-privnet:30335
      - neo-privnet:30336
    depends_on:
      - postgresql
      - neo-privnet
  postgresql:
    image: postgres:10.1
    ports:
      - 5432:5432
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
  neo-privnet:
    image: cityofzion/neo-privatenet
    container_name: "neo-privnet"
    ports:
      - 8081:8081
      - 20333:20333
      - 20334:20334
      - 20335:20335
      - 20336:20336
      - 30333:30333
      - 30334:30334
      - 30335:30335
      - 30336:30336

```
- From command line, go to neo-python/docker and start neo-privnet, neo-scan and postgresql using the following command:
```docker-compose -f docker-compose-neoscan.yml up```
- Wait until every container is started, access to **neo-privnet** by typing the following command:
```docker exec -it neo-privnet bash```
- Start claiming GAS by typing the following command:
`python3 claim_gas_fixedwallet.py` and wait until it finish running.
- Rebuild wallet to update gas. Open prompt in **private net mode** by typing `neopy`
- open wallet by typing the following:
```open wallet neo-privnet.wallet``` and type password ```coz```
then type ```wallet rebuild``` to update gas to wallet. Type ```wallet``` to see wallet info
- By default, sample contract has already been built within **/neo-python/docs/source/example/** directory. In this example, I import sample2.avm in to the network by typing the following (for more information about this command please see [here](https://neo-python.readthedocs.io/en/latest/neo/SmartContract/smartcontracts.html#importing-a-smart-contract)):
>```import contract /neo-python/docs/source/example/sample2.avm 070202 02 False False```
- After contract is deployed the contract hash should be **86d58778c8d29e03182f38369f0d97782d303cc0**
- You may want to test it, if so please refer [here](https://neo-python.readthedocs.io/en/latest/neo/SmartContract/smartcontracts.html#test-invoke-your-contracts).
- Exit prompt by typing ```exit``` then start rpc by the following command:
> ```np-api-server --privnet --port-rpc 8081```
- The server will start syncing with the current nodes by displaying following log
> [I <date_time> threading:<thread_number>] [PrivateNet] Block <synced_block> / <total_block>
- Whenever synced_block and total_block are equal, your RPC server is ready to use.


2. **Neon wallet DB**
- Neon wallet DB is used to watch all data from listened nodes and update those to mongoDB
- There are 3 main components:
> A clock which periodically watch to targeted node and put data to redis queue.

> A worker which is a listener to redis queue, whenever there is data in queue, it will get data and update them into mongoDB.

> A Flask server which provides api to get necessary data such as transaction info or address's balance. For more information please read code in **api/api.py**
- Neon-js is using this project for checking wallet balances therefore we must have it in order to invoke a transaction
- Note: I will create pull request for this, but in the mean time, just modify the following in order to make it work with private network.
- create ```docker-compose.yml``` file with the following content:
```yaml
version: "3"
services:
  my-mongo:
    image: mongo
    environment:
      - MONGODB_APPLICATION_DATABASE=neo
    ports:
      - "27017:27017"

  redis:
    image: redis:latest
    ports:
      - "6379:6379"

```
- Then ```docker-compose up``` to start these container
- Replace **api/db.py** with the following content:
```python
from pymongo import MongoClient
import os
import redis
from rq import Queue

MONGOURL = os.environ.get('MONGOURL', '127.0.0.1:27017')
MONGOAPP = os.environ.get('MONGOAPP', 'neo')
MONGOURL = "mongodb://{}/{}".format(MONGOURL, MONGOAPP)

client = MongoClient(MONGOURL)
db = client[MONGOAPP]


# db["meta"].insert_one({"name":"lastTrustedBlock", "value":1162327})
# db["meta"].insert_one({"name":"lastTrustedTransaction", "value":1162327})

# redis

redis_url = os.environ.get('REDISTOGO_URL', '127.0.0.1:6379')

redis_db = redis.from_url(redis_url)

# redis_db.flushdb()

q = Queue(connection=redis_db)

transaction_db = db['transactions']
blockchain_db = db['blockchain']
meta_db = db['meta']
logs_db = db['logs']
address_db = db['addresses']

```
- add **PRIVATENET_SEEDS** to **api/util.py** with the following content:
```python
PRIVATENET_SEEDS = [
    "http://localhost:30333",
    "http://localhost:30334",
    "http://localhost:30335",
    "http://localhost:30336",
]
```
- In **api/blockchain.py** modify the following:
> line 7: add **PRIVATENET_SEEDS**, it should look like `from .util import MAINNET_SEEDS, TESTNET_SEEDS, PRIVATENET_SEEDS`
> line 11: this is get NODEAPI environment, add `PRIVATENET_SEEDS[0]` at default value `nodeAPI = os.environ.get('NODEAPI', PRIVATENET_SEEDS[0])`
> line 13: add 'PrivNet' at default value, it should look like `net = os.environ.get('NET', 'PrivNet')`
> at **checkSeeds** function, replace the body with the following content (I just add check private net condition into it):
```python
def checkSeeds():
    if net == "MainNet":
        seed_list = MAINNET_SEEDS
    elif net == "PrivNet":
        seed_list = PRIVATENET_SEEDS
    else:
        seed_list = TESTNET_SEEDS

    seeds = []

    for test_rpc in seed_list:
        print(test_rpc)
        try:
            start = time.time()
            data = getBlockCount(test_rpc)
            getBlock(int(data["result"])-1, test_rpc)
            elapsed = time.time() - start
            seeds.append({"url": test_rpc, "status": True, "block_height": int(data["result"]), "time": elapsed })
        except:
            seeds.append({"url": test_rpc, "status": False, "block_height": None, "time": None})
            continue
        print(seeds[-1])
    blockchain_db['meta'].update_one({"name": "node_status"}, {"$set": {"nodes": seeds}}, upsert=True)
    return True
```
> Finally, add the following function in order to drop all db when you want to init again
```python
def drop_db():
    blockchain_db["transactions"].drop()
    blockchain_db["meta"].drop()
    blockchain_db["blockchain"].drop()
    blockchain_db["logs"].drop()
    blockchain_db["addresses"].drop()
```
- In **clock.py** change the following:
> line 4: add **drop_db** at the end of the line, `from api.blockchain import storeLatestBlockInDB, getBlockCount, blockchain_db, storeBlockInDB, checkSeeds, get_highest_node, drop_db`
> line 41: comment `sched.start()`, we will move this action into **main** function
> Add the following after line 41:
```python
def str2bool(v):
    if v.lower() in ('yes', 'true', 't', 'y', '1'):
        return True
    elif v.lower() in ('no', 'false', 'f', 'n', '0'):
        return False
    else:
        raise argparse.ArgumentTypeError('Boolean value expected.')


if __name__ == "__main__":

    import argparse

    parser = argparse.ArgumentParser("clock")
    parser.add_argument("--init", help="True/False", type=str2bool)
    args = parser.parse_args()

    if args.init is True:
        try:
            drop_db()
            checkSeeds()
            blockchain_db["meta"].insert_one({"name": "lastTrustedBlock", "value": 0})
        except Exception as e:
            print(e)

    sched.start()
```
> If **--init** is **True** then all data will be dropped and clock will watch from the beginning.
> Otherwise passing **False** then clock will continue watching data from targeted nodes.
- OK everything is ready to run.
- Firstly, run clock to start watching and init database
```bash
python3 clock.py --init=True
```
- Then run worker. Note: you can run many workers at once
```bash
python3 worker.py
```
- Then start server:
```bash
python3 api/app.py
```
- Use any mongoUI tool you like to check mongo database. Check whether number of block equal to the current block in rpc server then you are ready to invoke the transaction.

## Run the sample
- Go to **neo_sample**
```bash
npm install
node index.js
```

## Good luck
