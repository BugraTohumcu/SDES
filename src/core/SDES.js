import * as Tables from "../config/constants.js"
import { permute, xor } from "../utils/sdes_utils.js"

export class SDES {
    static encrypt(plainText8bit, keys) {
        const { k1, k2 } = keys;

        let state = this.ip(plainText8bit);
        
        state = this.fk(state.substring(0, 4), state.substring(4), k1);
        state = this.switchBits(state);
        
        state = this.fk(state.substring(0, 4), state.substring(4), k2);

        return this.inverseIp(state);
    }

    static decrypt(cipherText8bit, keys) {
        return this.encrypt(cipherText8bit, { k1: keys.k2, k2: keys.k1 });
    }

    static fk(left, right, sk) {
        const expandedRight = this.ep(right);
        const xorResult = xor(expandedRight, sk);

        const s0Results = this.lookupSBox(xorResult.substring(0, 4), Tables.S0);
        const s1Result = this.lookupSBox(xorResult.substring(4), Tables.S1);

        const finalRight = this.p4(s0Results + s1Result);

        return xor(left, finalRight) + right;
    }

    static lookupSBox(bits, table) {
        const row = parseInt(bits[0] + bits[3], 2);
        const col = parseInt(bits[1] + bits[2], 2);
        const value = table[row][col];
        return value.toString(2).padStart(2, "0");
    }

    static switchBits(bits) {
        return bits.substring(4) + bits.substring(0, 4);
    }

    static ip(bits) {
        return permute(bits, Tables.IP_TABLE);
    }

    static inverseIp(bits) {
        return permute(bits, Tables.INVERSE_IP_TABLE);
    }

    static ep(bits) {
        return permute(bits, Tables.EP_TABLE);
    }

    static p4(bits) {
        return permute(bits, Tables.P4_TABLE);
    }

    static p10(bits) {
        return permute(bits, Tables.P10_TABLE);
    }

    static p8(bits) {
        return permute(bits, Tables.P8_TABLE);
    }
}