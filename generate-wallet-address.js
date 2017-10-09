'use strict';

const assert = require('assert');
const bcoin = require('../bcoin');
const {Client, Wallet} = bcoin.http;

const network = 'regtest';
const m = 2;
const n = 2;

const createMultisigWallet = async function createMultisigWallet(client, options, skipExists) {
  assert(client instanceof Client, 'client should be bcoin.http.Client');
  assert(options.id, 'You need to provide id in options');

  const defaultOpts = {
    type: 'multisig',
    m: m,
    n: n
  };

  Object.assign(defaultOpts, options);

  let res;
  try {
    res = await client.createWallet(defaultOpts);
  } catch (e) {
    if (skipExists && e.message === 'WDB: Wallet already exists.') {
      return null;
    }

    throw e;
  }

  return res;
};

const addSharedKey = async function addSharedKey(client, account, xpubkey, skipRemoveError) {
  assert(client instanceof Wallet, 'client should be bcoin.http.Wallet');
  assert(account, 'should provide account');
  assert(xpubkey, 'should provide xpubkey');

  let res;

  try {
    res = await client.addSharedKey(account, xpubkey);
  } catch (e) {
    if (e.message === 'Cannot remove key.') {
      return null;
    }

    throw e;
  }

  return res;
};

(async () => {
  const client = new Client({ network });

  // Let's create wallets if they don't exist
  await createMultisigWallet(client, { id: 'cosigner1' }, true);
  await createMultisigWallet(client, { id: 'cosigner2' }, true);

  const wallet1 = new Wallet({ id: 'cosigner1', network });
  const wallet2 = new Wallet({ id: 'cosigner2', network });

  const wallet1account = 'default';
  const wallet2account = 'default';

  // Both wallets need to exchange XPUBKEYs to each other
  // in order to generate receiving and change addresses.
  // Let's take it from the default account.
  const wallet1info = await wallet1.getInfo();
  const wallet2info = await wallet2.getInfo();

  // Grab the xpubkey from wallet, we need to share them
  const wallet1xpubkey = wallet1info.account.accountKey;
  const wallet2xpubkey = wallet2info.account.accountKey;

  // Here we share xpubkeys to each other
  await addSharedKey(wallet1, wallet1account, wallet2xpubkey);
  await addSharedKey(wallet2, wallet2account, wallet1xpubkey);

  // Now we can get address from both wallets
  // NOTE: that both wallets should be on the same index
  // (depth) of derivation to geth the same addresses
  // NOTE: Each time you createAddress index(depth) is
  // incremented an new address is generated
  const address1 = await wallet1.createAddress(wallet1account);
  const address2 = await wallet2.createAddress(wallet2account);

  console.log(address1);
  console.log(address2);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

