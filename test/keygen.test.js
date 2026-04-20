/**
 * @fileoverview S-DES Key Generation tests.
 * These tests validate the P10, P8, and LS-n operations against 
 * official reference vectors.
 */
import { KeyGenerator } from "../src/core/KeyGenerator.js";
import { describe,it, assertEquals } from "./test.helper.js";

const TEST_VECTORS = [
    {
        masterKey:  "0111111101",
        keys: { k1: "01011111", k2: "11111100" }
    },

];

describe("Key generation test", () => {
    /**
     * Reference test case from Stallings Textbook (Chapter 3).
     * Input: 10-bit Master Key
     * Expected: 8-bit K1 and K2
     */
   TEST_VECTORS.forEach(({ masterKey, keys }, i) => {
        it(`should generate correct K1 and K2 from 10-bit master key #${i + 1}\n
            Masterkey: ${masterKey} → k1: ${keys.k1} - k2: ${keys.k2}`,() => {
        let {k1, k2} = KeyGenerator.generateKeys(masterKey);
        assertEquals(k1, keys.k1, "K1 is wrong");
        assertEquals(k2, keys.k2, "K2 is wrong");
    });
   })
})