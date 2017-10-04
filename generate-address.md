### Step 1: Address Creation
In following code, we'll import all necessary libraries, generate private and public keys, and create
multisig address.

[generate-address.js](./generate-address.js)

```js
const ring1 = KeyRing.generate(compressed, network);
```
Here we generate private key, public key is generated too. We need to provide
information about network and public key format. There are two [Public key formats][bitcoin-pubkeyformat]
one compressed and uncompressed. You can check details on [Bitcoin Developer Guide][bitcoin-pubkeyformat]

[bitcoin-pubkeyformat]: https://bitcoin.org/en/developer-guide#public-key-formats
