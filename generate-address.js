'use strict';

const fs = require('fs');
const bcoin = require('bcoin');
const KeyRing = bcoin.KeyRing;
const Script = bcoin.Script;

// Network is important when creating addresses
// and storing private keys, You don't want to accidentally spend
// or confuse keys/transactions/addresses with different networks.
const network = 'regtest';

// use compressed pubkeys
// See notes in guide.
const compressed = true;

// This will generate two private keys
// See notes in guide
const ring1 = KeyRing.generate(compressed, network);
const ring2 = KeyRing.generate(compressed, network);

// export to wif for reimporting them later.
fs.writeFileSync(`${network}-key1.wif`, ring1.toSecret(network));
fs.writeFileSync(`${network}-key2.wif`, ring2.toSecret(network));

// create 2-of-2 address
const m = 2;
const n = 2;
const pubKeys = [ring1.publicKey, ring2.publicKey];

// assemble multisig script from pubkeys and m-of-n
const multiSigScript = Script.fromMultisig(m, n, pubKeys);

// now generate P2SH address
const base58addr = multiSigScript.getAddress().toBase58(network);

// store address too
fs.writeFileSync(`${network}-address`, base58addr);

// Print multisig address
console.log(`Address: ${base58addr}`);

