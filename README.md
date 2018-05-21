# NEO_sample

## Requirements
- Docker and docker-compose
- Python 3 (3.6)
- [Neo python](https://github.com/CityOfZion/neo-python)
- [Neon Wallet DB project](https://github.com/CityOfZion/neon-wallet-db)
## Installation
1. Private Network
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


2. Neon wallet DB
- Neon-js is using this project for checking wallet balances therefore we must have it in order to invoke a transaction
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
- add **PRIVATE_SEEDS** to **api/util.py** with the following content:
```python
PRIVATENET_SEEDS = [
    "http://localhost:30333",
    "http://localhost:30334",
    "http://localhost:30335",
    "http://localhost:30336",
]
```
- In **api/blockchain.py** modify the following:
> line 7:
