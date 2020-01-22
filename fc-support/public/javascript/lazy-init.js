/**
 * @param initMap {Object} map of init functions
 * @param selector {String} Dom portion to seek in
 *
 * Lazy init js behaviour based on the data-init custom attribute.
 * Value of the attribute matches a key in initMap which is called
 * with the element as parameter.
 * DOM branch to search for ini is scoped with param selector.
 */
export function lazyInit(initMap, selector) {
  document.querySelectorAll(`${selector} [data-init]`).forEach(element => {
    const initKey = element.getAttribute('data-init');
    if (initKey && typeof initMap[initKey] != 'undefined') {
      initMap[initKey].call(null, element);
    }
  });
}
  