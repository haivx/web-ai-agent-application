function createPortal(children, container) {
  if (!container) {
    throw new Error("[react-dom-stub] createPortal requires a container");
  }
  container.__portalChildren = children;
  return children;
}

function noop() {}

module.exports = {
  createPortal,
  findDOMNode: noop,
  flushSync: noop,
  render: noop,
  unmountComponentAtNode: noop,
  version: "0.0.0-stub",
};
