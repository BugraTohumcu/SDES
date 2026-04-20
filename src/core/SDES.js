import * as Tables from "../config/constants.js"
import { permute, xor } from "../utils/sdes_utils.js"

export class SDES{

    static encrypt(plainText8bit, keys){
        let {k1, k2} = keys        
        // Initial Permutation(IP)
        let state = permute(plainText8bit, Tables.IP_TABLE);
    
        //Round one
        state = this.fk(state.substring(0,4), state.substring(4), k1);
        state = this.switchBits(state);
    
        //Round two
        state = this.fk(state.substring(0,4), state.substring(4), k2);
    
        return permute(state, Tables.INVERSE_IP_TABLE);
    
    }
    
    static fk(left, right, sk){
    
        let expandedRight = permute(right, Tables.EP_TABLE);
    
        let xorResult = xor(expandedRight, sk);
    
        let s0Results = this.lookupSBox(xorResult.substring(0,4), Tables.S0);
        let s1Result = this.lookupSBox(xorResult.substring(4), Tables.S1);
    
        let finalRight = permute(s0Results + s1Result, Tables.P4_TABLE)
    
        return xor(left, finalRight) + right;
    
    }
    
    static lookupSBox(bits, table){
        let row = parseInt(bits[0] + bits[3], 2);
        let col = parseInt(bits[1] + bits[2], 2);
    
        const value = table[row][col];
    
        return value.toString(2).padStart(2,"0");
    }


    static decrypt(cipherText8bit, keys){
        return this.encrypt(cipherText8bit, {k1: keys.k2, k2:keys.k1});
    }
    
    static switchBits(bits){
        return bits.substring(4) + bits.substring(0,4);
    }
}

