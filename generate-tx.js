'use strict';

const fs = require('fs');
const assert = require('assert');
const bcoin = require('bcoin');
const KeyRing = bcoin.keyring;
const Script = bcoin.script;
const MTX = bcoin.mtx;
const Amount = bcoin.amount;
const Coin = bcoin.coin;

const network = 'regtest';

// grab private keys
const secret1 = fs.readFileSync('./regtest-key1.wif').toString();
const secret2 = fs.readFileSync('./regtest-key2.wif').toString();

// generate keyring object (pubkeys too)
const ring1 = KeyRing.fromSecret(secret1);
const ring2 = KeyRing.fromSecret(secret2);

const m = 2;
const n = 2;

// Each of them will have both pubkeys
const pubkey1 = ring1.publicKey;
const pubkey2 = ring2.publicKey;

// the redeem
const redeem = Script.fromMultisig(m, n, [pubkey1, pubkey2]);
// p2sh script
const script = Script.fromScripthash(redeem.hash160());

// NOTE: we'll send change to the same address for simplicity
// consider using HD Wallets and common Paths within HD Wallets.
// See BIP45 for multisig paths.
const changeAddr = script.getAddress().toBase58(network);

// tx info
const sendTo = 'RF1PJ1VkHG6H9dwoE2k19a5aigWcWr6Lsu';
const txInfo = {
  // How much we received with this transaction
  value: Amount.fromBTC('100').toValue(),

  // prevout txid and vout
  hash: '3b1dd17cc82e2ac43ba62bf8f1c6a0fe805df43911653d22c902571eb3a212ce',
  index: 0
};

// Coin provides information to the transaction
// which are aggregated in CoinView within mtx
// It's contains information about previous output
const coin = Coin.fromJSON({
  version: 1,
  height: -1,
  value: txInfo.value,
  coinbase: false,

  script: script.toJSON(),
  hash: txInfo.hash,
  index: txInfo.index
});

// Now we create mutable transaction object
const spend1 = new MTX();

// let's give redeemscript to ring1
// Later it will be used by signInput for
// signing transaction
ring1.script = redeem;

spend1.addCoin(coin);
spend1.scriptInput(0, coin, ring1);

// send
spend1.addOutput({
  address: sendTo,
  value: Amount.fromBTC('50').toValue()
});

// send change to ourselves 
spend1.addOutput({
  address: changeAddr,
  value: Amount.fromBTC('48.99').toValue()
});

// all info is here, all is left is to sign
// First signs first one and sends signed tx
// to another person for signing.
spend1.signInput(0, coin, ring1);

// Now we can take raw transaction and do the same
// thing with second user.
const raw = spend1.toRaw();

// let's simulate sending raw tx to another user
const spend2 = MTX.fromRaw(raw);

// information provided before `new MTX` in spend1
// is common for both, both need to construct them

// ring2 needs redeem script too, for signing input
spend2.script = redeem;

// Because input already exists in transaction
// we only need to provide Coin to CoinView
spend2.view.addCoin(coin);

// now we sign
spend2.signInput(0, coin, ring2);

// We are done.
// Both users signed the transactions

// Let's make sure that the transaction is valid
assert(spend2.verify(), 'Transaction isnt valid.');

console.log('');
console.log(spend2.toRaw().toString('hex'));
