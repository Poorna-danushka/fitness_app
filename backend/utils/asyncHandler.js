/**
 * Wrapper for async route handlers to catch errors
 * @param {Function} fn - Async function
 * @returns {Function} Wrapped function
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Wrap a promise-based function
 * @param {Function} fn - Function returning a promise
 * @returns {Array} [data, error]
 */
export const withErrorHandling = async (fn) => {
  try {
    const data = await fn();
    return [data, null];
  } catch (error) {
    return [null, error];
  }
};
