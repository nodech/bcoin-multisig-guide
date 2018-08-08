'use strict';

const fs = require('fs');
const bcoin = require('bcoin');
const Script = bcoin.Script;
const {HDPrivateKey} = bcoin.hd;

const assert = require('assert');
const {WalletClient} = require('bclient');

const PORT = 48334; // regtest port
const NETWORK = 'regtest';

const m = 2;
const n = 2;

const COMPRESSED = true;

(async () => {
  const master1 = getKey(1, NETWORK);
  const master2 = getKey(2, NETWORK);

  const xpubKey1 = deriveXPUB(master1, 0);
  const xpubKey2 = deriveXPUB(master2, 0);

  const xpub1 = xpubKey1.xpubkey(NETWORK);
  const xpub2 = xpubKey2.xpubkey(NETWORK);

  const client = new WalletClient({ network: NETWORK, port: PORT });
  const id = 'watchonly-4';
  const accountName = 'default';

  await createMultisigWallet(client, {
    id,
    watchOnly: true,
    accountKey: xpub1
  }, true);

  const wallet = client.wallet(id)

  // let's add another as shared key
  await addSharedKey(wallet, accountName, xpub2);

  const account = await wallet.getAccount(accountName);
  // print account ?

  // incremented an new address is generated
  const address = await wallet.createAddress(accountName);

  console.log(address);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

async function createMultisigWallet(client, options, skipExists) {
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
}

async function addSharedKey(client, account, xpubkey, skipRemoveError) {
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


/*
 * Helpers
 */

function getKey(n, network) {
  const filename = `${network}-hd-key${n}.wif`;

  if (fs.existsSync(filename))
    return HDPrivateKey.fromBase58(fs.readFileSync(filename).toString(), network);

  const key = HDPrivateKey.generate();

  fs.writeFileSync(filename, key.toBase58(network));

  return key;
}

function deriveXPUB(master, acct) {
  // 44 - purpose, 10 - just a number for regtest, acct - for account
  const priv = master.deriveAccount(44, 10, acct);
  const xpub = priv.toPublic();

  return xpub;
}
