import L from 'leaflet';

interface LeafletElement extends HTMLElement {
  _leaflet_pos?: L.Point;
}

/**
 * Defensive safety patches for Leaflet in React / Next.js environments.
 * Prevents "Cannot read properties of undefined (reading '_leaflet_pos')"
 * and animation race conditions when layers/markers unmount during animations.
 */
if (typeof window !== 'undefined' && L && L.DomUtil) {
  const origGetPosition = L.DomUtil.getPosition;
  L.DomUtil.getPosition = function (el: HTMLElement) {
    if (!el) {
      return new L.Point(0, 0);
    }
    try {
      if (origGetPosition) {
        return origGetPosition(el);
      }
      return (el as LeafletElement)._leaflet_pos || new L.Point(0, 0);
    } catch {
      return (el as LeafletElement)?._leaflet_pos || new L.Point(0, 0);
    }
  };

  const origSetPosition = L.DomUtil.setPosition;
  L.DomUtil.setPosition = function (el: HTMLElement, point: L.Point) {
    if (!el) return;
    try {
      if (origSetPosition) {
        origSetPosition(el, point);
      } else {
        (el as LeafletElement)._leaflet_pos = point;
      }
    } catch {
      // ignore
    }
  };
}

export * from 'leaflet';
export default L;
