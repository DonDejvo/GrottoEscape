export const math = (function() {
    return {
        rand(min, max) {
            return Math.random() * (max - min) + min;
        },
        randint(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        },
        lerp(x, a, b) {
            return a + (b - a) * x;
        },
        clamp(x, a, b) {
            return Math.min(Math.max(x, a), b);
        },
        sat(x) {
            return Math.min(Math.max(x, 0), 1);
        },
        ease_out(x) {
            return Math.min(Math.max(x**0.5, 0), 1);
        },
        ease_in(x) {
            return Math.min(Math.max(x * x, 0), 1);
        }
    }
})();