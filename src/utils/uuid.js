// the smallest uuid generator in the world!
// https://gist.github.com/jed/982883
function b(a) {
    return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, b)
}
module.exports = {
    generator: b,
    pattern: '^[a-z0-9]{8}-([a-z0-9]{4}-){3}[a-z0-9]{12}$',
};
