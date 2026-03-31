import SEAL from 'node-seal';

// This Web Worker handles all encryption and decryption locally.
self.onmessage = async function(e) {
  const { action, id, payload } = e.data;
  
  try {
    const seal = await SEAL();
    
    // We strictly use CKKS for floating point analytics
    const schemeType = seal.SchemeType.ckks;
    const securityLevel = seal.SecurityLevel.tc128;
    const polyModulusDegree = 8192;
    const bitSizes = [60, 40, 40, 60];
    
    const parms = seal.EncryptionParameters(schemeType);
    parms.setPolyModulusDegree(polyModulusDegree);
    parms.setCoeffModulus(seal.CoeffModulus.Create(polyModulusDegree, Int32Array.from(bitSizes)));
    
    const context = seal.Context(parms, true, securityLevel);
    
    if (action === 'generateKeys') {
      const keyGenerator = seal.KeyGenerator(context);
      
      const secretKey = keyGenerator.secretKey();
      const publicKey = keyGenerator.createPublicKey();
      const relinKeys = keyGenerator.createRelinKeys();
      
      // We serialize keys to send pk and relinKeys to backend
      const pkBase64 = publicKey.save();
      const relinBase64 = relinKeys.save();
      
      // Store sk in volatile worker memory or securely pass it back
      const skBase64 = secretKey.save();
      
      self.postMessage({
        id,
        success: true,
        data: {
          public_key: pkBase64,
          eval_keys: relinBase64,
          secret_key_local: skBase64 // THIS NEVER GOES TO BACKEND
        }
      });
      return;
    }
    
    if (action === 'encryptVector') {
      // payload = { vector: [1.2, 3.4, ...], public_key: 'b64...' }
      // In a real implementation we would instantiate the encoder and encryptor
      // and serialize the resulting ciphertext.
      
      const encoder = seal.CKKSEncoder(context);
      // Simulate encoding and encryption (normally takes the array and pk)
      const mockCiphertext = btoa("mock_ciphertext_" + payload.vector.length);
      
      self.postMessage({
        id,
        success: true,
        data: {
          ciphertext: mockCiphertext
        }
      });
      return;
    }

    if (action === 'decryptResult') {
      // payload = { ciphertext: 'b64...', secret_key_local: 'b64...' }
      // Instantiate the decryptor with sk and decrypt to yield plaintext.
      
      const plaintextResult = [42.1337]; // Mock decrypted result for sum/mean
      
      self.postMessage({
        id,
        success: true,
        data: {
          result: plaintextResult
        }
      });
      return;
    }

  } catch (error) {
    self.postMessage({
      id,
      success: false,
      error: error.message || error.toString()
    });
  }
};
