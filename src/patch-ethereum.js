if (typeof window !== 'undefined') {
  const orig = Object.defineProperty;
  Object.defineProperty = function(o, p, d) {
    if (o === window && p === 'ethereum') {
      try {
        return orig(o, p, d);
      } catch(e) {
        return o;
      }
    }
    return orig(o, p, d);
  };
}
