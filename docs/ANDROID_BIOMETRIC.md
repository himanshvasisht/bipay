# BiPay Biometric Verification Example (Android)

# This is a sample code snippet for Android biometric signing using Keystore

# 1. Generate key pair in Android Keystore (StrongBox if available)
# 2. Get attestation and send public key + attestation to backend
# 3. Sign canonical payload with biometric prompt

# Kotlin Example:

/*
val keyGen = KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_RSA, "AndroidKeyStore")
keyGen.initialize(
    KeyGenParameterSpec.Builder(
        "bipay_key",
        KeyProperties.PURPOSE_SIGN or KeyProperties.PURPOSE_VERIFY
    )
    .setDigests(KeyProperties.DIGEST_SHA256)
    .setUserAuthenticationRequired(true)
    .setUserAuthenticationValidityDurationSeconds(60)
    .setAttestationChallenge("random_nonce".toByteArray())
    .setIsStrongBoxBacked(true)
    .build()
)
val keyPair = keyGen.generateKeyPair()

// Get attestation
val certChain = keyPair.certificateChain
// Send public key + attestation to backend

// Sign payload
val signature = Signature.getInstance("SHA256withRSA")
signature.initSign(keyPair.private)
signature.update(payload.toByteArray())
val signed = signature.sign()
*/

# See backend API for enrollment and verification
