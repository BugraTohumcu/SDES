import { P10_TABLE, P8_TABLE } from "../config/constants.js";
import { permute } from "../utils/sdes_utils.js";

export class KeyGenerator{

    static generateKeys(masterKey10bit){
        let p10Key = permute(masterKey10bit, P10_TABLE);

        // LS-1
        let left = this.leftShift(p10Key.substring(0,5), 1);
        let right = this.leftShift(p10Key.substring(5), 1);
        
        const k1 = permute(left + right, P8_TABLE);

        // LS-2
        left = this.leftShift(left, 2);
        right = this.leftShift(right, 2);

        const k2 = permute(left + right, P8_TABLE);
        
        return {k1,k2};
    }


    static leftShift(bits, n){
        return bits.substring(n) + bits.substring(0,n);
    }

}