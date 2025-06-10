document.addEventListener('DOMContentLoaded', function () {
  const basePrices = {
    Chocolate: 100, // Replace with actual variant prices via data-* or Ajax
    Vanilla: 100,
    Orange: 100
  };

  const originalPrice = document.getElementById('original-price');
  const finalPrice = document.getElementById('final-price');
  const includedContent = document.getElementById('included-content');

  const modeInputs = document.querySelectorAll('input[name="purchase_mode"]');
  const flavorRows = document.querySelectorAll('.flavor-row');
  const flavorSwatches = document.querySelectorAll('.flavor-swatch');
  const addToCartBtn = document.getElementById('add-to-cart');

  let selectedMode = 'single';
  let selectedFlavor = 'Chocolate';

  function updateUI() {
    // Show relevant flavor selector row
    flavorRows.forEach(row => {
      row.style.display = row.dataset.mode === selectedMode ? 'block' : 'none';
    });

    // Update price
    const base = basePrices[selectedFlavor] || 100;
    const subscriptionPrice = selectedMode === 'try' ? base : base * 0.75;
    const final = subscriptionPrice * 0.8;

    originalPrice.textContent = `$${base.toFixed(2)}`;
    finalPrice.textContent = `$${final.toFixed(2)}`;

    // Update metafield content
    includedContent.innerHTML = Shopify.product.metafields[`custom.${selectedMode}_mode_info`] || '';
  }

  modeInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      selectedMode = e.target.value;
      updateUI();
    });
  });

  flavorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      flavorSwatches.forEach(s => s.classList.remove('selected'));
      swatch.classList.add('selected');
      selectedFlavor = swatch.dataset.flavor;
      updateUI();
    });
  });

  addToCartBtn.addEventListener('click', () => {
    // Replace logic with correct variant mapping
    const variantId = addToCartBtn.dataset.defaultVariant;

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: variantId, quantity: 1 }] })
    }).then(res => res.json()).then(data => {
      alert('Item added to cart!');
    });
  });

  // Initial UI setup
  updateUI();
});
