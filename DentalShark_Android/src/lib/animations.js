/**
 * Spatial fly-to-cart animation — image flies from product card to cart icon
 */
export function flyToCart(sourceElement) {
  const cartBtn = document.getElementById('nav-cart-btn') || document.querySelector('.nav-cart');
  if (!sourceElement || !cartBtn) return;

  const img = sourceElement.querySelector('.pc-img') || sourceElement.querySelector('img');
  if (!img) return;

  const imgRect = img.getBoundingClientRect();
  const cartRect = cartBtn.getBoundingClientRect();

  // Clone the image
  const clone = img.cloneNode(true);
  clone.style.cssText = `
    position: fixed;
    z-index: 99999;
    top: ${imgRect.top}px;
    left: ${imgRect.left}px;
    width: ${imgRect.width}px;
    height: ${imgRect.height}px;
    opacity: 1;
    border-radius: 12px;
    pointer-events: none;
    transition: all 0.8s cubic-bezier(0.19, 1, 0.22, 1);
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    object-fit: cover;
  `;

  document.body.appendChild(clone);
  void clone.offsetWidth; // force reflow

  // Animate to cart position
  clone.style.top = `${cartRect.top + cartRect.height / 2 - 12}px`;
  clone.style.left = `${cartRect.left + cartRect.width / 2 - 12}px`;
  clone.style.width = '24px';
  clone.style.height = '24px';
  clone.style.opacity = '0.15';
  clone.style.transform = 'rotate(360deg) scale(0.2)';

  setTimeout(() => {
    clone.remove();
    // Cart badge bounce
    const badge = document.getElementById('cart-badge-count') || cartBtn;
    if (badge) {
      badge.classList.remove('cart-bounce');
      void badge.offsetWidth;
      badge.classList.add('cart-bounce');
      setTimeout(() => badge.classList.remove('cart-bounce'), 450);
    }
    // Cart icon bounce
    cartBtn.classList.remove('cart-bounce');
    void cartBtn.offsetWidth;
    cartBtn.classList.add('cart-bounce');
    setTimeout(() => cartBtn.classList.remove('cart-bounce'), 450);
  }, 800);
}

/**
 * Floating emoji particle pop on reaction click
 */
export function emojiPop(element, type) {
  const particles = { likes: '👍', hearts: '❤️', claps: '👏', science: '🔬' };
  const emoji = particles[type] || '👍';

  const rect = element.getBoundingClientRect();
  const f = document.createElement('span');
  f.textContent = emoji;
  f.style.cssText = `
    position: fixed;
    font-size: 22px;
    pointer-events: none;
    z-index: 99999;
    top: ${rect.top - 15}px;
    left: ${rect.left}px;
  `;
  f.className = 'reaction-pop-float';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 750);
}

/**
 * Reaction pulse effect on the button
 */
export function reactionPulse(btnElement) {
  if (!btnElement) return;
  btnElement.classList.add('react-pulsing');
  setTimeout(() => btnElement.classList.remove('react-pulsing'), 300);
}

/**
 * Wishlist heart burst
 */
export function heartBurst(btnElement) {
  if (!btnElement) return;
  btnElement.classList.add('heart-burst');
  setTimeout(() => btnElement.classList.remove('heart-burst'), 600);
}
