import { KeyGeneratorVisualizer } from "./src/visualize/KeyGeneratorVisualizer.js";
import { SDESVisualizer } from "./src/visualize/SDESVisualizer.js";

let allSteps = [];
let currentIdx = 0;

let savedPT = "";
let savedCT = "";

const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const startBtn = document.getElementById("start-system-btn");
const entryPage = document.getElementById("entry-page");
const processPage = document.getElementById("process-page");
const stepTitleEl = document.getElementById("step-title");
const stepContentEl = document.getElementById("step-content");
const currNumEl = document.getElementById("curr-num");
const totalNumEl = document.getElementById("total-num");
const endScreen = document.getElementById("end-screen");

const getBitsFromContainer = (containerId) => {
    const inputs = document.querySelectorAll(`#${containerId} input`);
    return Array.from(inputs).map(i => i.value).join("");
};

startBtn.addEventListener("click", () => {
    const pt = getBitsFromContainer("plaintext-input");
    const key = getBitsFromContainer("key-input");

    if (pt.length === 8 && key.length === 10) {
        const kData = KeyGeneratorVisualizer.generateKeys(key);
        const eData = SDESVisualizer.encrypt(pt, kData.keys);

        savedPT = pt;
        savedCT = eData.result;

        // LS adımlarını ayrı ayrı ekle
        allSteps = [];
        
        kData.logs.forEach(log => {
            if (log.title.includes("LS-1") || log.title.includes("LS-2")) {
                // LS adımını iki ayrı adıma böl: LEFT ve RIGHT
                allSteps.push({
                    ...log,
                    title: log.title + " - LEFT",
                    side: "left",
                    desc: `Left 5-bit half is rotated left by ${log.title.includes("LS-1") ? "1" : "2"} position(s).`
                });
                allSteps.push({
                    ...log,
                    title: log.title + " - RIGHT",
                    side: "right",
                    desc: `Right 5-bit half is rotated left by ${log.title.includes("LS-1") ? "1" : "2"} position(s).`
                });
            } else {
                allSteps.push(log);
            }
        });
        
        // Şifreleme adımlarını ekle
        eData.logs.forEach(log => allSteps.push(log));
        
        totalNumEl.textContent = allSteps.length.toString().padStart(2, '0');
        currentIdx = 0;

        startBtn.textContent = "PROCESSING...";
        setTimeout(() => {
            entryPage.classList.add("hidden");
            processPage.classList.remove("hidden");
            render();
        }, 800);
    } else {
        alert("Geçerli input değeri giriniz (PT: 8-bit, Key: 10-bit)!");
    }
});

// render() fonksiyonunun ilgili kısmını şu şekilde güncelle:

function render() {
    const step = allSteps[currentIdx];
    if (!step) return;

    currNumEl.textContent = (currentIdx + 1).toString().padStart(2, '0');
    stepTitleEl.textContent = `STEP DETAIL: ${step.title}`;

    let htmlContent = `<p class="step-description">${step.desc || ""}</p>`;

    let imgName = "";
    const t = step.title.toUpperCase();
    if (t.includes("P10")) imgName = "P10_table.png";
    else if (t.includes("P8") && !t.includes("LS")) imgName = "P8_table.png";
    else if (t.includes("S0")) imgName = "S0_box.png";
    else if (t.includes("S1")) imgName = "S1_box.png";
    else if (t.includes("INITIAL PERMUTATION") || t.includes("IP:")) imgName = "IP_table.png";
    else if (t.includes("IP⁻¹") || t.includes("IP-1")) imgName = "IP-1_table.png";
    else if (t.includes("EP")) imgName = "EP_table.png";
    else if (t.includes("P4")) imgName = "P4_table.png";

    if (imgName) {
        htmlContent += `
            <div class="step-visual-tool">
                <img src="./global/${imgName}" class="table-img" style="margin-top: 15px;">
            </div>`;
    }

    // XOR with Key adımı için özel gösterim
    if (t.includes("XOR WITH") && step.keyVal) {
        htmlContent += `
            <div class="xor-container">
                <div class="xor-row">
                    <div class="xor-item">
                        <div class="xor-label">EP OUTPUT</div>
                        <div class="xor-value">${step.prev}</div>
                    </div>
                    <div class="xor-symbol">⊕</div>
                    <div class="xor-item">
                        <div class="xor-label">${t.includes("K1") ? "SUBKEY K1" : "SUBKEY K2"}</div>
                        <div class="xor-value key-highlight">${step.keyVal}</div>
                    </div>
                </div>
                <div class="xor-equals">=</div>
                <div class="xor-result">
                    <div class="xor-label">XOR RESULT</div>
                    <div class="xor-value">${step.val}</div>
                </div>
            </div>`;
    }
    // L ⊕ P4 adımı için özel gösterim
    else if (t.includes("L ⊕ P4") && step.p4Val) {
        htmlContent += `
            <div class="xor-container">
                <div class="xor-row">
                    <div class="xor-item">
                        <div class="xor-label">LEFT HALF (L)</div>
                        <div class="xor-value">${step.prev}</div>
                    </div>
                    <div class="xor-symbol">⊕</div>
                    <div class="xor-item">
                        <div class="xor-label">P4 OUTPUT</div>
                        <div class="xor-value key-highlight">${step.p4Val}</div>
                    </div>
                </div>
                <div class="xor-equals">=</div>
                <div class="xor-result">
                    <div class="xor-label">NEW LEFT HALF</div>
                    <div class="xor-value">${step.val}</div>
                </div>
            </div>`;
    }
    // LS adımları için
    else if ((t.includes("LS-1") || t.includes("LS-2")) && step.l_prev) {
        const isLeft = step.side === "left";
        const prevBits = isLeft ? step.l_prev : step.r_prev;
        const newBits = isLeft ? step.l_val : step.r_val;
        const sideLabel = isLeft ? "LEFT HALF" : "RIGHT HALF";
        
        htmlContent += `
            <div class="ls-single-wrapper">
                <div class="ls-transition">
                    <div class="ls-item ls-before">
                        <div class="ls-label">BEFORE SHIFT (${sideLabel})</div>
                        <div class="ls-bits">
                            ${prevBits.split('').map(b => `<span>${b}</span>`).join('')}
                        </div>
                    </div>
                    <div class="down-arrow">▼</div>
                    <div class="ls-item">
                        <div class="ls-label">AFTER SHIFT (${sideLabel})</div>
                        <div class="ls-bits">
                            ${newBits.split('').map(b => `<span>${b}</span>`).join('')}
                        </div>
                    </div>
                </div>
            </div>`;
    } 
    // Normal INPUT → OUTPUT gösterimi
    else if (step.prev && step.val && !step.keyVal) {
        htmlContent += `
            <div class="comparison-container">
                <div class="comp-box">
                    <span class="comp-label">INPUT</span>
                    <div class="comp-value gray">${step.prev}</div>
                </div>
                <div class="comp-arrow">→</div>
                <div class="comp-box">
                    <span class="comp-label">OUTPUT</span>
                    <div class="comp-value">${step.val}</div>
                </div>
            </div>`;
    } 
    else {
        htmlContent += `<div class="step-value-display">${step.val || ""}</div>`;
    }

    stepContentEl.innerHTML = htmlContent;
    updateStepper(step.title);
    ensureButtonsVisible();
}

function ensureButtonsVisible() {
    // Footer'ın görünür olduğundan emin ol
    const footer = document.querySelector('.compact-footer');
    if (footer) {
        footer.style.display = 'flex';
        footer.style.visibility = 'visible';
        footer.style.opacity = '1';
    }
    
    // Process page yüksekliğini kontrol et
    const processPage = document.getElementById('process-page');
    if (processPage) {
        processPage.style.overflow = 'hidden';
    }
}

function updateStepper(stepTitle) {
    const upperTitle = stepTitle.toUpperCase();
    document.querySelectorAll(".step-item").forEach(item => {
        item.classList.remove("active");
        const stepType = item.dataset.step;
        
        if (stepType === "KEY GEN" && (upperTitle.includes("KEY") || upperTitle.includes("LS") || upperTitle.includes("P10") || upperTitle.includes("P8"))) {
            item.classList.add("active");
        } else if (upperTitle.includes(stepType)) {
            item.classList.add("active");
        }
    });
}

window.showEndScreen = () => {
    document.getElementById("final-pt").textContent = savedPT;
    document.getElementById("final-ct").textContent = savedCT;
    processPage.classList.add("hidden");
    endScreen.style.display = "flex";
};

nextBtn.onclick = () => {
    if (currentIdx < allSteps.length - 1) {
        currentIdx++;
        render();
    } else {
        window.showEndScreen();
    }
};

prevBtn.onclick = () => {
    if (currentIdx > 0) {
        currentIdx--;
        render();
    }
}

const setupAutoSkip = (containerId) => {
    const inputs = document.querySelectorAll(`#${containerId} input`);
    inputs.forEach((input, index) => {
        input.addEventListener('keypress', (e) => {
            if (e.key !== '0' && e.key !== '1') {
                e.preventDefault();
            }
        });
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^01]/g, '');
            if (e.target.value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && index > 0) {
                inputs[index - 1].focus();
            }
        });
        input.addEventListener('click', () => input.select());
    });
};

setupAutoSkip("plaintext-input");
setupAutoSkip("key-input");