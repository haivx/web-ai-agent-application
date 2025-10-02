function createElement(type, props, ...children) {
  return { type, props: { ...props, children } };
}

function Fragment(props) {
  return props.children ?? null;
}

function useState(initial) {
  let state = typeof initial === "function" ? initial() : initial;
  function setState(value) {
    state = typeof value === "function" ? value(state) : value;
  }
  return [state, setState];
}

function noop() {}

function useMemo(factory) {
  return factory();
}

function useCallback(callback) {
  return callback;
}

function useRef(initial) {
  return { current: initial };
}

const Children = {
  toArray(children) {
    if (children === undefined || children === null) {
      return [];
    }
    return Array.isArray(children) ? children.flat(Infinity) : [children];
  },
};

module.exports = {
  Children,
  Fragment,
  createElement,
  useCallback,
  useEffect: noop,
  useMemo,
  useRef,
  useState,
  version: "0.0.0-stub",
};
