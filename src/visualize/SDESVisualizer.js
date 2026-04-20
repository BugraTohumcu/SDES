import * as Tables from "../config/constants.js";
import { permute, xor } from "../utils/sdes_utils.js";

export class SDESVisualizer {
    static encrypt(pt, keys) {
        let logs = [];
        
        // Initial Permutation
        let state = permute(pt, Tables.IP_TABLE);
        logs.push({ 
            title: "IP: INITIAL PERMUTATION", 
            val: state, 
            desc: "8-bit data is permuted according to the IP table." 
        });

        // Round 1
        state = this.fkProcess(state, keys.k1, "ROUND 1", logs);
        
        // Switching Function
        state = state.substring(4) + state.substring(0, 4);
        logs.push({ 
            title: "SW: SWITCH BITS", 
            val: state, 
            desc: "The left and right 4-bit blocks are swapped (Switching function)." 
        });

        // Round 2
        state = this.fkProcess(state, keys.k2, "ROUND 2", logs);
        
        // Inverse Initial Permutation
        let final = permute(state, Tables.INVERSE_IP_TABLE);
        logs.push({ 
            title: "RESULT: IP-1", 
            val: final, 
            desc: "Inverse permutation applied. The Ciphertext is ready." 
        });

        return { result: final, logs };
    }

    static fkProcess(bits, key, round, logs) {
        let L = bits.substring(0, 4), R = bits.substring(4);
        
        // Expansion / Permutation (EP)
        let ep = permute(R, Tables.EP_TABLE);
        logs.push({ 
            title: `${round}: EP`, 
            val: ep, 
            desc: "Right block expanded from 4-bit to 8-bit using EP table." 
        });

        // XOR with Key
        let xored = xor(ep, key);
        logs.push({ 
            title: `${round}: XOR`, 
            val: xored, 
            desc: "Expansion result XORed with the subkey." 
        });

        // S-Box 0 Lookup
        let s0In = xored.substring(0, 4);
        let s0R = parseInt(s0In[0] + s0In[3], 2), s0C = parseInt(s0In[1] + s0In[2], 2);
        let s0V = Tables.S0[s0R][s0C].toString(2).padStart(2, "0");
        logs.push({ 
            title: `${round}: S-BOX 0`, 
            val: s0V, 
            desc: `S0 Input: ${s0In}. Row: ${s0R}, Column: ${s0C}. Output: ${s0V}` 
        });

        // S-Box 1 Lookup
        let s1In = xored.substring(4);
        let s1R = parseInt(s1In[0] + s1In[3], 2), s1C = parseInt(s1In[1] + s1In[2], 2);
        let s1V = Tables.S1[s1R][s1C].toString(2).padStart(2, "0");
        logs.push({ 
            title: `${round}: S-BOX 1`, 
            val: s1V, 
            desc: `S1 Input: ${s1In}. Row: ${s1R}, Column: ${s1C}. Output: ${s1V}` 
        });

        // P4 Permutation
        let p4 = permute(s0V + s1V, Tables.P4_TABLE);
        logs.push({ 
            title: `${round}: P4`, 
            val: p4, 
            desc: "S-Box outputs combined and passed through the P4 permutation table." 
        });

        // Final XOR and combine for the round
        let newL = xor(L, p4);
        return newL + R;
    }
}