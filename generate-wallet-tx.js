'use strict';

const bcoin = require('../bcoin');
const {Client, Wallet} = bcoin.http;
const Amount = bcoin.amount;

const network = 'regtest';
const sendTo = 'RBg1TLaNuRpH6UTFzogFXhjqubPYZaqWgs';

(async () => {
  const client = new Client({ network });
  const wallet1 = new Wallet({ id: 'cosigner1', network });
  const wallet2 = new Wallet({ id: 'cosigner2', network });

  // Because we can't sign and spend from account
  // we can't use `spend` and publish directly to network.
  // So we first create the transaction
  const outputs = [{ address: sendTo, value: Amount.fromBTC(1).toValue() }];
  const options = {
    // rate: 1000,
    outputs: outputs
  };

  // This will automatically find coins and fund the transaction (Sign it),
  // also create changeAddress and calculate fee
  const tx1 = await wallet1.createTX(options);

  // Now you can share this raw output 
  const raw = tx1.hex;

  // Wallet2 will also sign the transaction
  const tx2 = await wallet2.sign(raw);

  // Now we can broadcast this transaction to the network
  const broadcast = await client.broadcast(tx2.hex);
  console.log(broadcast);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

