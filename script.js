const menuItems = [
  { name: 'Chicken Biryani', price: 450 },
  { name: 'Chicken Biryani Family Pack', price: 1499 },
  { name: 'Special Chicken Biryani', price: 550 },
  { name: 'Biryani Combo', price: 650 }
];

const deliveryFee = 250;
let cart = [];

const refs = {
  header: document.querySelector('.site-header'),
  navLinks: document.getElementById('navLinks'),
  menuToggle: document.querySelector('.menu-toggle'),
  cartButton: document.querySelector('[data-cart-toggle]'),
  cartDrawer: document.querySelector('.cart-drawer'),
  cartBackdrop: document.querySelector('.drawer-backdrop'),
  cartItems: document.querySelector('[data-cart-items]'),
  emptyState: document.querySelector('[data-empty-state]'),
  subtotal: document.querySelector('[data-subtotal]'),
  delivery: document.querySelector('[data-delivery]'),
  total: document.querySelector('[data-total]'),
  cartCount: document.querySelector('[data-cart-count]'),
  checkoutForm: document.getElementById('checkoutForm'),
  summaryItems: document.getElementById('summaryItems'),
  summarySubtotal: document.getElementById('summarySubtotal'),
  summaryDelivery: document.getElementById('summaryDelivery'),
  summaryTotal: document.getElementById('summaryTotal'),
  closeCart: document.querySelector('.close-cart'),
  checkoutButton: document.querySelector('.cart-checkout')
};

function updateHeaderOnScroll() {
  if (!refs.header) return;
  if (window.scrollY > 16) {
    refs.header.classList.add('scrolled');
  } else {
    refs.header.classList.remove('scrolled');
  }
}

function bindScrollButtons() {
  document.querySelectorAll('[data-scroll]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.scroll);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (window.innerWidth <= 860) {
        refs.navLinks.classList.remove('open');
        refs.menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

function toggleMobileMenu() {
  if (!refs.navLinks || !refs.menuToggle) return;
  const isOpen = refs.navLinks.classList.toggle('open');
  refs.menuToggle.setAttribute('aria-expanded', String(isOpen));
}

function toggleCart(forceOpen) {
  const open = typeof forceOpen === 'boolean' ? forceOpen : !refs.cartDrawer.classList.contains('open');
  refs.cartDrawer.classList.toggle('open', open);
  refs.cartBackdrop.classList.toggle('visible', open);
  refs.cartDrawer.setAttribute('aria-hidden', String(!open));
}

function getTotalItems() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function updateCartSummary() {
  const subtotal = getSubtotal();
  const total = subtotal + (cart.length ? deliveryFee : 0);

  refs.subtotal.textContent = `Rs. ${subtotal.toLocaleString()}`;
  refs.delivery.textContent = `Rs. ${cart.length ? deliveryFee.toLocaleString() : 0}`;
  refs.total.textContent = `Rs. ${total.toLocaleString()}`;
  refs.cartCount.textContent = getTotalItems();

  if (refs.summaryItems) refs.summaryItems.textContent = getTotalItems();
  if (refs.summarySubtotal) refs.summarySubtotal.textContent = `Rs. ${subtotal.toLocaleString()}`;
  if (refs.summaryDelivery) refs.summaryDelivery.textContent = `Rs. ${cart.length ? deliveryFee.toLocaleString() : 250}`;
  if (refs.summaryTotal) refs.summaryTotal.textContent = `Rs. ${total.toLocaleString()}`;
}

function renderCart() {
  refs.cartItems.innerHTML = '';

  if (!cart.length) {
    refs.emptyState.classList.add('visible');
    refs.checkoutButton.disabled = true;
    refs.checkoutButton.style.opacity = '0.5';
  } else {
    refs.emptyState.classList.remove('visible');
    refs.checkoutButton.disabled = false;
    refs.checkoutButton.style.opacity = '1';
  }

  cart.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'cart-input-row';
    row.innerHTML = `
      <div class="cart-item-details">
        <img class="cart-item-thumb" src="${item.image}" alt="${item.name}" />
        <div>
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">Rs. ${item.price.toLocaleString()}</span>
        </div>
      </div>
      <div class="quantity-control">
        <button class="qty-btn" type="button" data-action="decrease" data-id="${item.id}">-</button>
        <span class="qty-value">${item.quantity}</span>
        <button class="qty-btn" type="button" data-action="increase" data-id="${item.id}">+</button>
      </div>
      <button class="remove-item" type="button" data-action="remove" data-id="${item.id}" aria-label="Remove item">×</button>
    `;
    refs.cartItems.appendChild(row);
  });

  updateCartSummary();
}

function addToCart(name, price) {
  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name,
      price,
      quantity: 1,
      image: getImageForItem(name)
    });
  }

  renderCart();
  toggleCart(true);
}

function getImageForItem(name) {
  const lookup = {
    'Chicken Biryani': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80',
    'Chicken Biryani Family Pack': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80',
    'Special Chicken Biryani': 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=500&q=80',
    'Biryani Combo': 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=500&q=80'
  };

  return lookup[name] || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=80';
}

function updateItemQuantity(id, action) {
  const item = cart.find((entry) => entry.id === id);
  if (!item) return;

  if (action === 'increase') item.quantity += 1;
  if (action === 'decrease') item.quantity -= 1;
  if (action === 'remove') {
    cart = cart.filter((entry) => entry.id !== id);
  }

  cart = cart.filter((entry) => entry.quantity > 0);
  renderCart();
}

function bindMenuButtons() {
  document.querySelectorAll('.add-to-cart').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.food-card');
      const name = card.dataset.menuItem;
      const price = Number(card.dataset.price);
      addToCart(name, price);
    });
  });

  refs.cartItems.addEventListener('click', (event) => {
    const control = event.target.closest('[data-action]');
    if (!control) return;
    const { action, id } = control.dataset;
    updateItemQuantity(id, action);
  });

  refs.checkoutButton.addEventListener('click', () => {
    if (!cart.length) return;
    document.getElementById('checkout').scrollIntoView({ behavior: 'smooth' });
    toggleCart(false);
  });

  refs.closeCart.addEventListener('click', () => toggleCart(false));
  refs.cartBackdrop.addEventListener('click', () => toggleCart(false));
  refs.cartButton.addEventListener('click', () => toggleCart());

  const emptyBrowseButton = document.querySelector('[data-empty-state] .btn');
  if (emptyBrowseButton) {
    emptyBrowseButton.addEventListener('click', () => {
      document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
      toggleCart(false);
    });
  }
}

function initCounters() {
  const counters = document.querySelectorAll('.stat-number');

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const element = entry.target;
      const target = Number(element.dataset.target);
      const isDecimal = Number.isInteger(target) === false;
      let current = 0;
      const duration = 1400;
      const stepTime = 30;
      const steps = Math.ceil(duration / stepTime);
      const increment = target / steps;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          element.textContent = `${isDecimal ? target.toFixed(1) : target}${isDecimal ? '' : '+'}`;
          clearInterval(timer);
          return;
        }
        element.textContent = `${isDecimal ? current.toFixed(1) : Math.ceil(current)}${isDecimal ? '' : '+'}`;
      }, stepTime);

      obs.unobserve(element);
    });
  }, { threshold: 0.5 });

  counters.forEach((counter) => observer.observe(counter));
}

function setupRevealAnimations() {
  const revealItems = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => observer.observe(item));
}

function setupCheckoutForm() {
  refs.checkoutForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const inputs = form.querySelectorAll('input, textarea');
    let valid = true;

    inputs.forEach((input) => {
      const isRequired = input.required;
      const parent = input.closest('label');
      let errorElement = parent.querySelector('.error-text');

      if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'error-text';
        parent.appendChild(errorElement);
      }

      if (!isRequired || input.value.trim() !== '') {
        input.setCustomValidity('');
        errorElement.textContent = '';
        return;
      }

      valid = false;
      input.setCustomValidity('This field is required');
      errorElement.textContent = 'This field is required.';
    });

    if (!valid) {
      form.reportValidity();
      return;
    }

    const customerName = form.fullName.value.trim();
    const total = getSubtotal() + (cart.length ? deliveryFee : 0);
    alert(`Thank you, ${customerName}! Your order has been placed successfully. Total: Rs. ${total.toLocaleString()}`);

    form.reset();
    cart = [];
    renderCart();
  });
}

function setupGlobalEvents() {
  window.addEventListener('scroll', updateHeaderOnScroll);
  refs.menuToggle.addEventListener('click', toggleMobileMenu);

  document.addEventListener('click', (event) => {
    if (window.innerWidth > 860) return;
    const insideNav = event.target.closest('.nav-links') || event.target.closest('.menu-toggle');
    if (!insideNav) {
      refs.navLinks.classList.remove('open');
      refs.menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function init() {
  updateHeaderOnScroll();
  bindScrollButtons();
  bindMenuButtons();
  setupGlobalEvents();
  setupRevealAnimations();
  initCounters();
  setupCheckoutForm();
  renderCart();
}

init();

window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 860) {
    refs.navLinks.classList.remove('open');
    refs.menuToggle.setAttribute('aria-expanded', 'false');
  }
});
