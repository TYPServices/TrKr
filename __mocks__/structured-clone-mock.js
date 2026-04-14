// Node 17+ has structuredClone natively — no polyfill needed in test environment
module.exports = { default: global.structuredClone ?? ((v) => JSON.parse(JSON.stringify(v))) };
module.exports.default = module.exports.default;
