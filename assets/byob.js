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

})();

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

function isValidQuantity(quantity) {
  return (
    Number.isInteger(quantity) &&
    quantity >= 0 &&
    quantity <= MAX_ITEMS
  );
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