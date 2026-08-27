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