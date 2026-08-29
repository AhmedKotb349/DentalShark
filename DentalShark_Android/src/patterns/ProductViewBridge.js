/**
 * BRIDGE PATTERN
 * -------------------------------------------------------------------------
 * The product detail page can present the same product data as a compact
 * "Simple View" or a rich "Fancy View", and that choice must be able to
 * change independently of the product data itself (and independently of
 * any future new view types). `ProductPresentation` is the abstraction —
 * it holds a product and delegates rendering to a `ViewRenderer`
 * implementor (`SimpleViewRenderer` / `FancyViewRenderer`). Both sides can
 * vary independently: a new renderer doesn't touch ProductPresentation,
 * and a new presentation subclass doesn't touch the renderers.
 *
 * Renderers return plain "view descriptors" (data describing what to show
 * and how), which the React component (ProductPage) turns into JSX. This
 * keeps the bridge itself framework-agnostic and testable outside React.
 */

class ViewRenderer {
  /** @returns {{mode:string, sections:Array<{label:string, value:string}>, showGallery:boolean, showFullDescription:boolean}} */
  render(product) { throw new Error('render() not implemented'); }
}

class SimpleViewRenderer extends ViewRenderer {
  render(product) {
    return {
      mode: 'simple',
      showGallery: false,
      showFullDescription: false,
      sections: [
        { label: 'Brand', value: product.brand },
        { label: 'Price', value: `EGP ${product.price?.toLocaleString()}` },
        { label: 'Rating', value: `${product.rating ?? '—'} / 5` },
      ],
    };
  }
}

class FancyViewRenderer extends ViewRenderer {
  render(product) {
    return {
      mode: 'fancy',
      showGallery: true,
      showFullDescription: true,
      sections: [
        { label: 'Brand', value: product.brand },
        { label: 'Category', value: product.cat2 || product.cat },
        { label: 'Price', value: `EGP ${product.price?.toLocaleString()}` },
        { label: 'List Price', value: product.old ? `EGP ${product.old.toLocaleString()}` : '—' },
        { label: 'Rating', value: `${product.rating ?? '—'} / 5 (${product.rev ?? 0} reviews)` },
        { label: 'SHARK Points', value: `+${product.pts ?? 0} pts` },
      ],
    };
  }
}

/** Abstraction: holds a product + a swappable renderer implementor. */
class ProductPresentation {
  constructor(product, renderer) {
    this.product = product;
    this.renderer = renderer; // implementor, swappable at runtime
  }
  setRenderer(renderer) { this.renderer = renderer; }
  present() { return this.renderer.render(this.product); }
}

const VIEW_RENDERERS = {
  simple: new SimpleViewRenderer(),
  fancy: new FancyViewRenderer(),
};

export { ViewRenderer, SimpleViewRenderer, FancyViewRenderer, ProductPresentation, VIEW_RENDERERS };
