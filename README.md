# Creating Multi Signature Transactions

```post-author
Nodar Chkuaselidze
```

## How It Works
In bitcoin there are several transaction types and one of them is Multisig. Multisig addresses and Transactions are created
from multiple private keys and can be used in multiple situations. For example, you can secure your fund using multiple
keys on multiple devices, so if you want to spend transactions received on multisig address, you'll need to sign transactions
on both devices. Also in large companies, where several people are in charge on funds, they can create multisig addresses for
company, where several people will have to sign the transaction in order to spend. This will improve security of the funds
for outside threat as well as inside threat (No one will be able to spend tx on its own). You can check other multisig
applications on [wiki][multisig-apps].  
Multisig transactions have form of `m-of-n`, where `m` stands for number of signatures required to spend funds and `n` stands
for maximum number of pubkeys that are permitted to sign these `m` transactions(`m <= n`). You can check the motivation
and specification in [BIP11][]. We'll also be using [Pay to Script Hash(P2SH)][BIP16] for our addresses and
for receiving the transactions.
When you want to create multisig address, first you need to aggree on numbers in `m-of-n`. If someone chooses
different `m` or different `n`, they'll end up with different address. You also need to know pubkey of all cosigners.
You can share these pubkeys however you want. Wallets support various ways for sharing pubkeys, using QR Code
or sending base58check encoded strings.  After you have collected all pubkeys and aggreed on `m` and `n`,
you construct the multisig script and generate P2SH address from that.  
After you've received transaction on your multisig address, you can spend it if all signatures are provided
in signature script.  
Signing process: You need all public keys (same that were used in address generation), from that
you can construct the redeem script, that is the original script you constructed for address. Once
you have redeem script, you can start creating signature script which will be constructed according
to BIP11 and BIP16. When you prepend your signature, you take this transaction (not yet fully valid) and send it
to another pubkey owner, who'll be signing next. Next person will do the same, until you have `m` signatures
in the sigscript. After this process is done, your redeem script is fully signed and you can broadcast your
transaction with outputs you provided in transaction.


[BIP11]: https://github.com/bitcoin/bips/blob/master/bip-0011.mediawiki
[BIP16]: https://github.com/bitcoin/bips/blob/master/bip-0016.mediawiki
[multisig-apps]: https://en.bitcoin.it/wiki/Multisignature#Multisignature_Applications
