/**
 * Utility helper to conditionally merge class names
 * @param  {...any} classes 
 * @returns {string}
 */
export function cn(...classes) {
  return classes
    .flat()
    .filter(Boolean)
    .join(' ');
}

export default cn;
