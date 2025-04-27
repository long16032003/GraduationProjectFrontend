// https://learn.snyk.io/lesson/prototype-pollution/?ecosystem=javascript
// https://www.npmjs.com/package/nopp
[
  Object,
  Object.prototype,
  Function,
  Function.prototype,
  Array,
  Array.prototype,
  String,
  String.prototype,
  Number,
  Number.prototype,
  Boolean,
  Boolean.prototype,
].forEach(Object.freeze);