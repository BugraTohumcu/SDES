/**
 * @fileoverview S-DES Encryption and Decryption Unit Tests.
 * This suite validates the core S-DES algorithm using known test vectors 
 * to ensure correct implementation of Feistel rounds, permutations, and S-Box lookups.
 */

import { SDES } from "../src/core/SDES.js"
import { describe, it, assertEquals } from "./test.helper.js";

/**
 * @constant {Array<Object>} TEST_VECTORS
 * Defines a set of known-answer tests (KAT) for validation.
 * Each vector contains the plaintext, expected ciphertext, and pre-generated subkeys.
 */
const TEST_VECTORS = [
    {
        plainText:  "10101010",
        cipherText: "00010110",
        keys: { k1: "01011111", k2: "11111100" }
    },

    {
        plainText:  "01110010",
        cipherText: "01110111",
        keys: { k1: "10100100", k2: "01000011" }
    },
];

/**
 * Validates the Forward Encryption process.
 * Ensures that the IP -> Round 1 -> SW -> Round 2 -> IP-1 flow 
 * produces the correct ciphertext for a given plaintext and key pair.
 */
describe("SDES Encryption", () => {
    TEST_VECTORS.forEach(({ plainText, cipherText, keys }, i) => {
        it(`should encrypt vector #${i + 1}: ${plainText} → ${cipherText}`, () => {
            assertEquals(SDES.encrypt(plainText, keys), cipherText);
        });
    });
});

/**
 * Validates the Reverse Decryption process.
 * Ensures that applying the encryption logic with reversed subkeys (K2, K1)
 * correctly recovers the plaintext from the ciphertext.
 */
describe("SDES Decryption", () => {
    TEST_VECTORS.forEach(({ plainText, cipherText, keys }, i) => {
        it(`should decrypt vector #${i + 1}: ${cipherText} → ${plainText}`, () => {
            assertEquals(SDES.decrypt(cipherText, keys), plainText);
        });
    });
});

/**
 * Validates the full cryptographic cycle (Round-trip).
 * This "Sanity Check" ensures that D(E(P)) = P, confirming that no 
 * data is lost or corrupted during the transformation process.
 */
describe("SDES Round-trip", () => {
    TEST_VECTORS.forEach(({ plainText, keys }, i) => {
        it(`should recover original plaintext for vector #${i + 1}`, () => {
            const encrypted = SDES.encrypt(plainText, keys);
            const decrypted = SDES.decrypt(encrypted, keys);
            assertEquals(decrypted, plainText);
        });
    });
});