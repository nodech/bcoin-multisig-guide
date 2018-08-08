'use strict';

const assert = require('assert');
const {WalletClient} = require('bclient');

const port = 48334; // regtest port
const network = 'regtest';
const m = 2;
const n = 2;

const createMultisigWallet = async function createMultisigWallet(client, options, skipExists) {
  assert(client instanceof WalletClient, 'client should be WalletClient');
  assert(options.id, 'You need to provide id in options');

  const defaultOpts = {
    type: 'multisig',
    m: m,
    n: n
  };

  Object.assign(defaultOpts, options);

  let res;
  try {
    res = await client.createWallet(options.id, defaultOpts);
  } catch (e) {
    if (skipExists && e.message === 'WDB: Wallet already exists.') {
      return null;
    }

    throw e;
  }

  return res;
};

const addSharedKey = async function addSharedKey(client, account, xpubkey, skipRemoveError) {
  // Wallet class is not exposed.
  //assert(client instanceof WalletClient.Wallet, 'client should be Wallet');
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
  const client = new WalletClient({ network, port });

  // Let's create wallets if they don't exist
  await createMultisigWallet(client, { id: 'cosigner1' }, true);
  await createMultisigWallet(client, { id: 'cosigner2' }, true);

  const wallet1 = client.wallet('cosigner1');
  const wallet2 = client.wallet('cosigner2');

  const wallet1account = 'default';
  const wallet2account = 'default';

  // Both wallets need to exchange XPUBKEYs to each other
  // in order to generate receiving and change addresses.
  // Let's take it from the default account.
  const wallet1info = await wallet1.getAccount(wallet1account);
  const wallet2info = await wallet2.getAccount(wallet2account);

  assert(wallet1info, 'Could not get wallet info');
  assert(wallet2info, 'Could not get wallet info');

  // Grab the xpubkey from wallet, we need to share them
  const wallet1xpubkey = wallet1info.accountKey;
  const wallet2xpubkey = wallet2info.accountKey;

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

