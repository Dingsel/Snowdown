export function numberConverter(n) {
    const prefixes = ['', 'k', 'M', 'G', 'T', 'P', 'E'];
    const thresholds = [1e3, 1e6, 1e9, 1e12, 1e15, 1e18];

    for (let i = 0; i < thresholds.length; i++) {
        if (n >= thresholds[i]) {
            return (n / thresholds[i]).toFixed(1) + prefixes[i + 1];
        }
    }

    return n;
}