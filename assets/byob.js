(() => {
  'use strict';

  const BYOB_TIERS = [
    {
      minItems: 3,
      maxItems: 5,
      discountPercent: 10,
      label: '10% off'
    },
    {
      minItems: 6,
      maxItems: 8,
      discountPercent: 15,
      label: '15% off'
    },
    {
      minItems: 9,
      maxItems: Infinity,
      discountPercent: 20,
      label: '20% off'
    }
  ];

  const MIN_ITEMS = 1;
  const MAX_ITEMS = 99;

  const state = {
    items: new Map(),
    busy: false
  };

  function getTier(totalItems) {
    return BYOB_TIERS.find((tier) => {
      return (
        totalItems >= tier.minItems &&
        totalItems <= tier.maxItems
      );
    }) || null;
  }

  function calculateBox() {
    let totalItems = 0;
    let subtotal = 0;

    state.items.forEach((item) => {
      totalItems += item.quantity;
      subtotal += item.price * item.quantity;
    });

    const tier = getTier(totalItems);

    const discount = tier
      ? Math.round(subtotal * tier.discountPercent / 100)
      : 0;

    const total = subtotal - discount;

    return {
      totalItems,
      subtotal,
      tier,
      discount,
      total
    };
  }

  function normalizeQuantity(value) {
    const quantity = Number.parseInt(value, 10);

    if (Number.isNaN(quantity)) {
      return 0;
    }

    return Math.max(
      0,
      Math.min(MAX_ITEMS, quantity)
    );
  }

  function updateItem(productElement, quantity) {
    const variantId = Number(
      productElement.dataset.variantId
    );

    const productId = Number(
      productElement.dataset.productId
    );

    const price = Number(
      productElement.dataset.price
    );

    const title = productElement.dataset.productTitle;

    quantity = normalizeQuantity(quantity);

    if (!variantId || !productId) {
      showError('This product is unavailable.');
      return;
    }

    if (quantity === 0) {
      state.items.delete(variantId);
    } else {
      state.items.set(variantId, {
        variantId,
        productId,
        title,
        price,
        quantity
      });
    }

    render();
  }

  function changeQuantity(productElement, amount) {
    const input = productElement.querySelector(
      '[data-byob-quantity]'
    );

    if (!input) {
      return;
    }

    const current = normalizeQuantity(input.value);
    const next = normalizeQuantity(current + amount);

    input.value = next;

    updateItem(productElement, next);
  }

  function render() {
    const result = calculateBox();

    document.querySelectorAll('[data-byob-total-items]')
      .forEach((element) => {
        element.textContent = result.totalItems;
      });

    document.querySelectorAll('[data-byob-subtotal]')
      .forEach((element) => {
        element.textContent = formatMoney(result.subtotal);
      });

    document.querySelectorAll('[data-byob-total]')
      .forEach((element) => {
        element.textContent = formatMoney(result.total);
      });

    const discountRow = document.querySelector(
      '[data-byob-discount-row]'
    );

    const discountElement = document.querySelector(
      '[data-byob-discount]'
    );

    if (discountRow && discountElement) {
      if (result.discount > 0) {
        discountRow.hidden = false;
        discountElement.textContent =
          `-${formatMoney(result.discount)}`;
      } else {
        discountRow.hidden = true;
      }
    }

    renderTierMessage(result);
    updateAddButton(result);
  }

  function formatMoney(cents) {
    return new Intl.NumberFormat(
      document.documentElement.lang || 'en',
      {
        style: 'currency',
        currency: window.Shopify?.currency?.active || 'USD'
      }
    ).format(cents / 100);
  }

  function renderTierMessage(result) {
    const element = document.querySelector(
      '[data-byob-tier-message]'
    );

    if (!element) {
      return;
    }

    if (result.totalItems === 0) {
      element.hidden = true;
      return;
    }

    if (!result.tier) {
      element.textContent =
        'Add more items to unlock your first box discount.';
      element.hidden = false;
      return;
    }

    const nextTier = BYOB_TIERS.find(
      tier => tier.minItems > result.totalItems
    );

    if (nextTier) {
      const remaining =
        nextTier.minItems - result.totalItems;

      element.textContent =
        `${result.tier.label}. Add ${remaining} more ` +
        `item${remaining === 1 ? '' : 's'} for ` +
        `${nextTier.discountPercent}% off.`;
    } else {
      element.textContent =
        `You unlocked ${result.tier.label}!`;
    }

    element.hidden = false;
  }

  function updateAddButton(result) {
    const button = document.querySelector(
      '[data-byob-add]'
    );

    if (!button) {
      return;
    }

    button.disabled =
      state.busy ||
      result.totalItems < MIN_ITEMS;
  }

  document.addEventListener('click', (event) => {
    const increase = event.target.closest(
      '[data-byob-increase]'
    );

    const decrease = event.target.closest(
      '[data-byob-decrease]'
    );

    if (increase) {
      const product = increase.closest(
        '[data-byob-product]'
      );

      if (product) {
        changeQuantity(product, 1);
      }
    }

    if (decrease) {
      const product = decrease.closest(
        '[data-byob-product]'
      );

      if (product) {
        changeQuantity(product, -1);
      }
    }
  });

  document.addEventListener('change', (event) => {
    const input = event.target.closest(
      '[data-byob-quantity]'
    );

    if (!input) {
      return;
    }

    const product = input.closest(
      '[data-byob-product]'
    );

    if (!product) {
      return;
    }

    const quantity = normalizeQuantity(input.value);

    input.value = quantity;

    updateItem(product, quantity);
  });

  document.addEventListener('input', (event) => {
    const input = event.target.closest(
      '[data-byob-quantity]'
    );

    if (!input) {
      return;
    }

    input.value = input.value.replace(
      /[^0-9]/g,
      ''
    );
  });

  function buildCartItems() {
    const groupId =
      `BYOB-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

    return {
      groupId,
      items: Array.from(state.items.values()).map(item => ({
        id: item.variantId,
        quantity: item.quantity,
        properties: {
          '_BYOB': 'true',
          '_BYOB Group': groupId
        }
      }))
    };
  }

  function validateBeforeCart() {
    const result = calculateBox();

    if (result.totalItems < MIN_ITEMS) {
      return {
        valid: false,
        message: `Please select at least ${MIN_ITEMS} item.`
      };
    }

    if (result.totalItems > MAX_ITEMS) {
      return {
        valid: false,
        message: `You can select a maximum of ${MAX_ITEMS} items.`
      };
    }

    if (state.items.size === 0) {
      return {
        valid: false,
        message: 'Please select at least one product.'
      };
    }

    return {
      valid: true
    };
  }

  async function addBoxToCart() {
    if (state.busy) {
      return;
    }

    clearError();

    const validation = validateBeforeCart();

    if (!validation.valid) {
      showError(validation.message);
      return;
    }

    state.busy = true;
    updateAddButton(calculateBox());

    try {
      const cartData = buildCartItems();

      const response = await fetch(
        `${window.Shopify.routes.root}cart/add.js`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            items: cartData.items
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.description ||
          'Unable to add your box to cart.'
        );
      }

      showStatus('Your box was added to cart.');

      // Refresh cart UI
      await refreshCart();

    } catch (error) {
      console.error('BYOB cart error:', error);

      showError(
        error.message ||
        'Something went wrong. Please try again.'
      );

    } finally {
      state.busy = false;
      render();
    }
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest(
      '[data-byob-add]'
    );

    if (!button) {
      return;
    }

    addBoxToCart();
  });

  function showError(message) {
    const element = document.querySelector(
      '[data-byob-error]'
    );

    if (!element) {
      return;
    }

    element.textContent = message;
    element.hidden = false;
  }

  function clearError() {
    const element = document.querySelector(
      '[data-byob-error]'
    );

    if (!element) {
      return;
    }

    element.textContent = '';
    element.hidden = true;
  }

  function showStatus(message) {
    const element = document.querySelector(
      '[data-byob-status]'
    );

    if (!element) {
      return;
    }

    element.textContent = message;
  }

  async function refreshCart() {
    // If the theme exposes a cart-drawer/cart-refresh hook, call it here.
    // Left as a no-op placeholder so addBoxToCart() doesn't throw
    // ReferenceError: refreshCart is not defined.
    if (typeof window.refreshCartDrawer === 'function') {
      await window.refreshCartDrawer();
    }
  }

  document.addEventListener('DOMContentLoaded', render);
})();