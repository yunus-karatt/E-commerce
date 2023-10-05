// Define a function to handle the click event
function handleDeleteClick(e) {
  e.preventDefault();
  const productId = this.getAttribute('productId');
  console.log(productId);

  Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = `/admin/deleteproduct/${productId}`;
    }
  });
}

document.querySelectorAll('.deleteLink').forEach((btn) => {
  btn.addEventListener('click', handleDeleteClick);
});

$('#yourDataTableId').on('draw.dt', function () {
  document.querySelectorAll('.deleteLink').forEach((btn) => {
    btn.addEventListener('click', handleDeleteClick);
  });
});