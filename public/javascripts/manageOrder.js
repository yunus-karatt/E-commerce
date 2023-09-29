const orderStatus = document.getElementById('orderStatus');

orderStatus.addEventListener('submit', async (e) => {
  e.preventDefault()
  const mngOrderData = {
    orderId: orderStatus.orderID.value,
    productId: orderStatus.productID.value,
    status: orderStatus.status.value
  }

  fetch('/admin/update-order-status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mngOrderData }),
  }).then((response) => {
    response.json()
      .then((response) => {
        if (response.updated) {
          window.location.href = '/admin/get-orders';
        }
      })
  })
})