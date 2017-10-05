### Step 2: Generate Transaction
In this part, we assume that we received transaction on the network with following information:
```
Transaction ID: 3b1dd17cc82e2ac43ba62bf8f1c6a0fe805df43911653d22c902571eb3a212ce
Output index: 0
Amount: 100 BTC
```

We are going to send `50 BTC` to `RF1PJ1VkHG6H9dwoE2k19a5aigWcWr6Lsu` on the regtest network.

```js
// send change to ourselves 
spend1.addOutput({
  address: changeAddr,
  value: Amount.fromBTC('49.99').toValue()
});

// We can manually add this coin
// and this will also add input
// to our transaction
spend1.addCoin(coin);
```

Here we send change to ourselves and specify it manually.
Instead we could use `MTX.prototype.fund` which will automatically
allocate coins to outputs, based on amounts they need and
also calculate change and append output for it.  
Instead of code above, we could have simpler and more automated
calculations:

```js
// this will automatically select coins and
// send change back to our address
await spend1.fund([coin], {
  rate: 1000,

  changeAddress: changeAddr
});
```
