import * as Tables from "../config/constants.js";
import { permute, xor } from "../utils/sdes_utils.js";

export class SDESVisualizer {
    static encrypt(pt, keys) {
        let logs = [];
        let state = permute(pt, Tables.IP_TABLE);
        logs.push({ 
            title: "INITIAL PERMUTATION (IP)", 
            prev: pt,
            val: state, 
            desc: "The 8-bit plaintext is rearranged using the IP table. This mixing step prepares data for the Feistel rounds." 
        });
          
        let L = state.substring(0, 4);
        let R = state.substring(4);
        logs.push({ 
            title: "Split → L0 and R0", 
            prev: state,
            val: `L0: ${L} | R0: ${R}`, 
            desc: "Split the IP result into two 4-bit halves: L0 (left 4 bits) and R0 (right 4 bits). This starts the Feistel structure." 
        });
          
        state = this.fkProcess(state, keys.k1, "Round 1", logs);

        let round1Result = state.substring(0, 4);
        logs.push({ 
            title: "Round 1: L0 ⊕ F → New Left", 
            prev: L,
            val: round1Result, 
            desc: "XOR L0 with F(R0,K1) to get the new left half. R0 remains unchanged as the new right half." 
        });

        let beforeSwap = state;
        state = state.substring(4) + state.substring(0, 4);
        logs.push({ 
            title: "SW-Swap the Halves", 
            prev: beforeSwap,
            val: state, 
            desc: "The two halves swap roles: the current right (R0) becomes the new left, and the new left (L0⊕F) becomes the new right." 
        });

        state = this.fkProcess(state, keys.k2, "Round 2", logs);
        
        logs.push({ 
            title: "Round 2: R0 ⊕ F → Final Halves", 
            prev: state.substring(4),
            val: state, 
            desc: "XOR the left half (R0 from SW) with F(R1,K2) to get the final left. The right half remains as R1." 
        });

        let final = permute(state, Tables.INVERSE_IP_TABLE);
        logs.push({ 
            title: "IP⁻¹ — Final Permutation", 
            prev: state,
            val: final, 
            desc: "Apply the inverse of IP to produce the final ciphertext. IP⁻¹ undoes the initial permutation, completing SDES." 
        });

        return { result: final, logs };
    }

    static fkProcess(bits, key, round, logs) {
        let L = bits.substring(0, 4), R = bits.substring(4);
        let ep = permute(R, Tables.EP_TABLE);
        logs.push({ 
            title: `${round}: EP Permutation`, 
            prev: R,
            val: ep, 
            desc: "R0 (4 bits) is expanded to 8 bits using EP. Some bits are duplicated so we can XOR with the 8-bit key." 
        });

        let xored = xor(ep, key);
        const keyName = round.includes("1") ? "K1" : "K2";

        logs.push({ 
            title: `${round}: XOR with ${keyName}`, 
            prev: ep,
            keyVal: key,           // Key değeri eklendi
            val: xored, 
            desc: `The 8-bit expanded block (EP output) is XORed with subkey ${keyName} (${key}).` 
        });

        let s0In = xored.substring(0, 4), s1In = xored.substring(4);
        let s0R = parseInt(s0In[0] + s0In[3], 2), s0C = parseInt(s0In[1] + s0In[2], 2);
        let s0V = Tables.S0[s0R][s0C].toString(2).padStart(2, "0");
        logs.push({ 
            title: `${round}: S0-Box Substitution`, 
            prev: s0In,
            val: s0V, 
            desc: `S0 Input: ${s0In} -> Row: ${s0R}, Col: ${s0C} -> Output: ${s0V}` 
        });

        let s1R = parseInt(s1In[0] + s1In[3], 2), s1C = parseInt(s1In[1] + s1In[2], 2);
        let s1V = Tables.S1[s1R][s1C].toString(2).padStart(2, "0");
        logs.push({ 
            title: `${round}: S1-Box Substitution`, 
            prev: s1In,
            val: s1V, 
            desc: `S1 Input: ${s1In} -> Row: ${s1R}, Col: ${s1C} -> Output: ${s1V}` 
        });

        let combinedS = s0V + s1V;
        let p4 = permute(combinedS, Tables.P4_TABLE);
        logs.push({ 
            title: `${round}: P4 → Function F`, 
            prev: combinedS,
            val: p4, 
            desc: "Apply P4 to the 4-bit S-box output to complete the Feistel round function." 
        });

        let newL = xor(L, p4);
        
        // Son XOR işlemini de logla (L ⊕ P4)
        logs.push({ 
            title: `${round}: L ⊕ P4 → New Left Half`, 
            prev: L,
            p4Val: p4,             // P4 değeri eklendi
            val: newL, 
            desc: `XOR the left half (${L}) with P4 output (${p4}) to produce the new left half (${newL}).` 
        });
        
        return newL + R;
    }
}