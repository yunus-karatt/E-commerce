const checkBox = document.querySelectorAll('input[type="checkbox"]')
const filterBtn = document.querySelectorAll('.filterBtn')
const filterForm = document.querySelectorAll('.filterForm')
const catId = document.getElementById('catID').value
const clearBtn = document.getElementById('clearBtn')
const priceBtn = document.getElementById('priceBtn')
const priceForm = document.getElementById('priceForm')
const ascBtn = document.getElementById('btn btn-light');
const dscBtn = document.getElementById('dscBtn')
const sortBtn = document.querySelectorAll('.sortBtn')
const latest = document.querySelector('#latest')
const loveButton=document.querySelectorAll('.love-button')
const cardDiv= document.querySelector('#cardDiv')

const templateString = `
<div class="col d-flex flex-column h-sm-100" id="cardDiv">
      <div class="d-flex mt-5 ms-5">
            <p class="h6 text-uppercase fw-bold mt-1 me-3">sort:</p>
            <p class="btn btn-light h6 fw-semibold me-3 sortBtn" id="latest" catId="{{prodData.[0].Category._id}}" sort="latest">Latest</p>
            <p class="btn btn-light h6 fw-semibold me-3 sortBtn" id="ascBtn" catId="{{prodData.[0].Category._id}}" sort="asc">Price:low-to-high</p>
            <p class="btn btn-light h6 fw-semibold me-3 sortBtn" id="dscBtn" catId="{{prodData.[0].Category._id}}" sort="dsc">price:High-to-low</p>
          </div>
      <main class="row overflow-auto">
        
        <div class="col pt-4">
          
          <div class="container-fluid ">
            <div class="row ms-3 d-flex" style="width: 100%;">
              {{#each prodData}}
              <div class="card p-3 m-2 d-flex flex-column" style="max-width: 17rem;">
                <div class="card-image">
                  <a href="/viewproduct/{{_id}}"> <img style="width: auto; height:15rem; object-fit: contain;"
                      src="/images/uploads/{{Images.[0]}}" class="card-img-top" alt="..."></a>
                </div>
                <div class="card-body flex-grow-1">
                  <h5 class="card-title text-uppercase m-0 fw-bold">{{Name}}</h5>
                  <p class="card-text m-0 mt-1">
                    {{Features.RAM}}|ROM:{{Features.Storage}}|OS:{{Features.Operating_system}}
                  </p>
                </div>
                <div class="mt-auto">
                  {{#if offerPrice}}
                  <p class="card-text ms-3  fs-5 text-decoration-line-through">₹{{Price}}
                  </p>
                  <p class=" ms-3 text-success">{{offerPercentage}}%off</p>

                  <p class="card-text ms-3 fw-bold fs-2">₹{{offerPrice}}
                  </p>
                  {{else}}
                  <p class="card-text ms-3 fw-bold fs-2">₹{{Price}}
                  </p>
                  {{/if}}
                  {{#if ../user}}
                  {{#if inWishlist}}
                  <button class="btn float-end  mb-2">
                    <i class=" fa-regular fa-heart love-button loved" product-id="{{_id}}"
                      user-id="{{../user._id}}"></i>
                  </button>
                  {{else}}
                  <button class="btn float-end  mb-2">
                    <i class=" fa-regular fa-heart love-button" product-id="{{_id}}" user-id="{{../user._id}}"></i>
                  </button>
                  {{/if}}
                  {{/if}}
                </div>
                <div class="card-btn">
                  <a href="/viewproduct/{{_id}}" class="btn btn-dark me-1">View Product</a>
                  {{#if Stock_quantity}}
                  <button product-id="{{_id}}" class="btn addCart btn-dark"> Add to cart</button>
                  {{else}}
                  <button class="btn btn-danger disabled">out of stock</button>
                  {{/if}}
                </div>
              </div>
              {{/each}}

            </div>
          </div>


        </div>
      </main>

    </div>
`

const currentURL = window.location.href;
let selectedValues = []
let sortValues;

function fetchAndRender() {
  if (currentURL.includes('search')) {

    if (selectedValues.length > 0 || sortValues != '') {
      const url = new URL(currentURL);
      const searchQuery = url.searchParams.get('search');
      clearBtn.style.display = 'block'
      fetch(`/search-filter?search=${searchQuery}&values=${selectedValues.join(',')}&sort=${sortValues}`)
        .then((response) => {
          response.json()
            .then((prodData) => {
              const template = Handlebars.compile(templateString)
              const html = template({ prodData:prodData.prodData,user:prodData.user })
              cardDiv.innerHTML = html
              attachEventListeners()
            })
        })
    } else {
      window.location.reload()
    }
  } else {
    if (selectedValues.length > 0 || sortValues != '') {
      clearBtn.style.display = 'block'
      fetch(`/categroy-filter?category=${catId}&values=${selectedValues.join(',')}&sort=${sortValues}`)
        .then((response) => {
          response.json()
            .then((prodData) => {

              const template = Handlebars.compile(templateString)
              const html = template({ prodData:prodData.prodData,user:prodData.user })
              cardDiv.innerHTML = html
              attachEventListeners()
            })
        })
    } else {
      window.location.reload()
    }
  }
}

function attachEventListeners() {
  const sortBtns = document.querySelectorAll('.sortBtn');
  sortBtns.forEach((btn) => {
    btn.addEventListener('click', handleSortButtonClick);

  });
}

function handleSortButtonClick(e) {
  const sortBy = e.target.getAttribute('sort');
  const sortBtns = document.querySelectorAll('.sortBtn');
  sortValues = sortBy;
  fetchAndRender()
}

attachEventListeners()

filterBtn.forEach((btn, index) => {
  btn.addEventListener('click', (e) => {
    if (filterForm[index].style.display === 'block') {
      filterForm[index].style.display = 'none'
    } else {
      filterForm[index].style.display = 'block'
    }
  })
})

checkBox.forEach((checkBox) => {
  checkBox.addEventListener('click', (e) => {
    const checkBoxValue = checkBox.value
    const index = selectedValues.indexOf(checkBoxValue)

    if (index === -1) {
      selectedValues.push(checkBoxValue);
    } else {
      selectedValues.splice(index, 1)
    }
    fetchAndRender(selectedValues)

  })
})
clearBtn.addEventListener('click', (e) => {
  window.location.reload()
})

cardDiv.addEventListener('click', async (e) => {
  if (e.target.classList.contains('love-button')) {
    const productId = e.target.getAttribute('product-id')
    const userId = e.target.getAttribute('user-id')

    const wishListData = {
      productId,
      userId
    }
    e.target.classList.toggle('loved');
    await fetch('/api/wishlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(wishListData)
    }).catch((err) => console.log(err))
  }
  else if (e.target.classList.contains('addCart')) {
    const productId = e.target.getAttribute('product-id');
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
  }
});