// const homeTemplateString = `

// <div class="card p-3 m-2 d-flex flex-column" style="max-width: 17rem;" id="cardLoop">
//   <div class="card-image">
//     <a href="/viewproduct/{{_id}}"> <img style="width: auto; height:15rem; object-fit: contain;"
//         src="/images/uploads/{{prodData.Images.[0]}}" class="card-img-top" alt="..."></a>
//   </div>
//   <div class="card-body flex-grow-1">
//     <h5 class="card-title text-uppercase m-0 fw-bold">{{prodData.Name}}</h5>
//     <p class="card-text m-0 mt-1">
//       {{prodData.Features.RAM}}|ROM:{{prodData.Features.Storage}}|OS:{{prodData.Features.Operating_system}}
//     </p>
//   </div>
//   <div class="mt-auto">
//     <p class="card-text ms-3 fw-bold fs-2">₹{{prodData.Price}}
//     </p>
    
//     {{#if user}}
//     {{#if prodData.isInWishList}}
//     <button class="btn float-end  mb-2" >
//       <i class=" fa-regular fa-heart love-button loved" product-id="{{prodData._id}}" user-id="{{user._id}}"></i>
//     </button>
//     {{else}}
//     <button class="btn float-end  mb-2" >
//       <i class=" fa-regular fa-heart love-button" product-id="{{prodData._id}}" user-id="{{user._id}}"></i>
//     </button>
//     {{/if}}
//    {{/if}}
//   </div>
//   <div class="card-btn">
//     <a href="/viewproduct/{{prodData._id}}" class="btn btn-dark me-1">View Product</a>
//     {{#if prodData.Stock_quantity}}
//     <button product-id="{{prodData._id}}" class="btn addCart btn-dark"> Add to cart</button>
//     {{else}}
//     <button class="btn btn-danger disabled">out of stock</button>
//     {{/if}}
//   </div>
// </div>

// `


// const template = Handlebars.compile(homeTemplateString)
// const container = document.querySelector('.product-container');


// const paginationTemplate=
// `
// <ul class="pagination justify-content-center">
//           <li class="page-item disabled">
//             <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Previous</a>
//           </li>
//           {{#each totalPageArr}}
//           {{#equal pageNumber "this"}}
//           <li class="page-item active"><a class="page-link" href="/?page={{this}}">{{this}}</a></li>
//           {{else}}
//           <li class="page-item"><a class="page-link" href="/?page={{this}}">{{this}}</a></li>
//           {{/equal}}
//           {{/each}}
//           <li class="page-item">
//             <a class="page-link" href="#">Next</a>
//           </li>
//         </ul>
// `
// const template = Handlebars.compile(paginationTemplate)
// const container = document.querySelector('#pagination');
// const totalPage=document.querySelector('#totalPage').value
// const pageNumber=document.querySelector('#pageNumber').value
// let totalPageArr=[]

// for(let i=1;i<=totalPage;i++){
//   totalPageArr.push(i)
// }

// document.addEventListener('DOMContentLoaded',(e)=>{
//   const productHtml = template({ totalPageArr,pageNumber });
//   container.innerHTML = productHtml
// })

// const loadThreshold = 100;
// let page = 0;
// let isLoading = false
// let noMoreData = false;




// function loadMoreContent() {
//   if (isLoading || noMoreData) {
//     return;
//   }
//   isLoading = true
//   fetch(`/api/products?page=${page}`)
//     .then((response) => {
//       response.json()
//         .then((response) => {
//           if (response.response.length > 0) {
//             let user = response.user
//             response.response.forEach((prodData) => {

//               const productHtml = template({ prodData, user });
//               container.innerHTML += productHtml

//             })
//             page++
//           } else {
//             noMoreData = true
//           }
//           isLoading = false
//         })
//     })

// }

// function handleScroll() {
//   const containerHeight = container.clientHeight;
//   const scrollTop = container.scrollTop;
//   const scrollHeight = container.scrollHeight;
//   if (scrollHeight - (scrollTop + containerHeight) < loadThreshold) {
//     loadMoreContent();
//   }
// }
// container.addEventListener('click', async (e) => {
//   if (e.target.classList.contains('love-button')) {
//     const productId = e.target.getAttribute('product-id')
//     const userId = e.target.getAttribute('user-id')

//     const wishListData = {
//       productId,
//       userId
//     }
//     e.target.classList.toggle('loved');
//     await fetch('/api/wishlist', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(wishListData)
//     }).catch((err) => console.log(err))
//   }
//   else if (e.target.classList.contains('addCart')) {
//     const productId = e.target.getAttribute('product-id');
//     await fetch('/api/addcart', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ productId })
//     }).then((response) => {
//       return response.json();
//     }).then((data) => {
//       if (data.loggedIn) {
//         window.location.href = '/viewcart';
//       } else {
//         window.location.href = '/login';
//       }
//     });
//   }
// });
// container.addEventListener('scroll', handleScroll);
// loadMoreContent()
// getWishList()

const addCart=document.querySelectorAll('.addCart');
const loveButton=document.querySelectorAll('.love-button');

addCart.forEach((btn)=>{
  const productId = btn.getAttribute('product-id');
  btn.addEventListener('click',async(e)=>{
    await fetch('/api/addcart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId })
          }).then((response) => {
            return response.json();
          }).then((data) => {
            if (data.loggedIn) {
              window.location.href = '/viewcart';
            } else {
              window.location.href = '/login';
            }
          });
  })
})

loveButton.forEach((btn)=>{
  btn.addEventListener('click',async(e)=>{
    const productId = btn.getAttribute('product-id')
        const userId = btn.getAttribute('user-id')
    
        const wishListData = {
          productId,
          userId
        }
        btn.classList.toggle('loved');
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(wishListData)
        }).catch((err) => console.log(err))
  })
})