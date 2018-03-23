const crypto = require('crypto')
const secp256k1 = require('secp256k1')
const tape = require('tape')
const cbor = require('borc')
const DfinityTx = require('../')

tape('tests', async t => {
  const tx = new DfinityTx({
    version: 1,
    actorId: Buffer.from('d82b84f4646d61696e80d82900', 'hex'),
    funcname: "main",
    args: new Array([1,1.2,3,4]),
    ticks: 1000,
    ticksPrice: 0,
    nonce: 0,
  })

  const unsignedTx = cbor.encode(tx)
  const tx1 = DfinityTx.decode(unsignedTx)
  t.equals(tx1.ticks, 1000, 'should validate unsigned message')
  t.deepEquals(cbor.encode(tx1), unsignedTx)

  const sk = crypto.randomBytes(32)
  const pk = secp256k1.publicKeyCreate(sk)

  const signedTx = tx.sign(sk)
  t.equals(DfinityTx.verify(signedTx), true, 'should validate signed message')

  const [tx2, publicKey, signature] = DfinityTx.decode(signedTx)
  t.equals(tx2.ticks, 1000, 'should validate signed message')
  t.deepEqual(publicKey, pk, 'public key should match')
  t.deepEquals(cbor.encode([tx2, publicKey, signature]), signedTx, "should serialize the same")

  const sk2 = Buffer.from('ac15e6273a31c0c22cbad5241a875872108278a690423d912e6d33cc7544bd71', 'hex')
  const tx2hash = Buffer.from('43d85421120e12760d086504d3aec1c29f4e3e70b1176df681aaf9756e87bd83', 'hex')

  const signedTx2 = tx2.sign(sk2)
  t.deepEquals(DfinityTx._hash(signedTx2), tx2hash, 'should hash identically')

  t.end()
})
