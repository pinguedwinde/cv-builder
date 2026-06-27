/** Webpack loader: forces pagedjs to always use the String.prototype.indexOf shim
 *  instead of the deprecated String.prototype.contains method.
 *  contains$1 is set at module-eval time; using the shim avoids all polyfill-timing issues.
 */
module.exports = function pagedJsPatchLoader(source) {
  return source.replace(
    /var contains\$1 = isImplemented\$4\(\)\s*\?\s*String\.prototype\.contains\s*:\s*requireShim\$3\(\);/g,
    "var contains$1 = requireShim$3();"
  );
};
