import { P10_TABLE, P8_TABLE } from "../config/constants.js";
import { permute } from "../utils/sdes_utils.js";

export class KeyGenerator {
    static generateKeys(masterKey10bit) {
        let p10Key = this.p10(masterKey10bit);
        
        let left = this.leftShift(p10Key.substring(0, 5), 1);
        let right = this.leftShift(p10Key.substring(5), 1);
        const k1 = this.p8(left + right);

        left = this.leftShift(left, 2);
        right = this.leftShift(right, 2);
        const k2 = this.p8(left + right);

        return { k1, k2 };
    }

    static leftShift(bits, n) {
        return bits.substring(n) + bits.substring(0, n);
    }

    static p10(bits) {
        return permute(bits, P10_TABLE);
    }

    static p8(bits) {
        return permute(bits, P8_TABLE);
    }
}