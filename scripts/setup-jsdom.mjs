import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://127.0.0.1/",
  pretendToBeVisual: true,
});

const { window } = dom;

const define = (key, value) => {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    writable: true,
    value,
  });
};

// Keep DOM constructors on the same realm as jsdom events (needed by Radix).
define("window", window);
define("document", window.document);
define("navigator", window.navigator);
define("location", window.location);
define("history", window.history);
define("Event", window.Event);
define("CustomEvent", window.CustomEvent);
define("MouseEvent", window.MouseEvent);
define("KeyboardEvent", window.KeyboardEvent);
define("FocusEvent", window.FocusEvent);
define("HTMLElement", window.HTMLElement);
define("HTMLButtonElement", window.HTMLButtonElement);
define("HTMLInputElement", window.HTMLInputElement);
define("HTMLDivElement", window.HTMLDivElement);
define("Node", window.Node);
define("NodeFilter", window.NodeFilter);
define("TreeWalker", window.TreeWalker);
define("Element", window.Element);
define("DocumentFragment", window.DocumentFragment);
define("MutationObserver", window.MutationObserver);
define("getComputedStyle", window.getComputedStyle.bind(window));
define("requestAnimationFrame", (cb) => setTimeout(() => cb(Date.now()), 0));
define("cancelAnimationFrame", (id) => clearTimeout(id));
define("IS_REACT_ACT_ENVIRONMENT", true);

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

define("ResizeObserver", NoopObserver);
define("IntersectionObserver", NoopObserver);

define(
  "PointerEvent",
  class PointerEvent extends window.MouseEvent {
    constructor(type, props = {}) {
      super(type, props);
    }
  },
);

window.HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};
window.HTMLElement.prototype.hasPointerCapture = function hasPointerCapture() {
  return false;
};
window.HTMLElement.prototype.setPointerCapture = function setPointerCapture() {};
window.HTMLElement.prototype.releasePointerCapture = function releasePointerCapture() {};

if (!window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    media: "",
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
  });
}

if (!globalThis.crypto?.randomUUID) {
  define("crypto", {
    ...globalThis.crypto,
    randomUUID() {
      return `test-${Math.random().toString(16).slice(2)}`;
    },
  });
}
