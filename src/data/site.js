// Share JSON imports between the browser entry point and Node prerenderer.
export { default as company } from "./company.json" with { type: "json" };
export { default as products } from "./products.json" with { type: "json" };
export { default as navigation } from "./navigation.json" with { type: "json" };
export { default as locations } from "./locations.json" with { type: "json" };
