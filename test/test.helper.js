export const describe = (label, testFn) => {
    console.log(`\n---Category : ${label}---`);
    testFn();
}

export const assertEquals = (actual, expected, message) => {
    if (actual !== expected) {
        throw new Error(`${message} | Actual: ${actual} - Expected: ${expected}`);
    }
};


export const it = (description, assertionFn) => {
    try {
        assertionFn();
        console.log(`PASSED: ${description}`);
    } catch (error) {
        console.log(`FAILED: ${description}`);
        console.error(`Error: ${error.message}`);
    }
};
