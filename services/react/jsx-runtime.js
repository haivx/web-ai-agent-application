exports.jsx = function jsx(type, props, key) {
  return { type, key: key ?? null, props: props ?? {} };
};

exports.jsxs = exports.jsx;
exports.Fragment = require("./index.js").Fragment;
