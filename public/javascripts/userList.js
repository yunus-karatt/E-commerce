const prev = document.querySelector('#prev');
const next = document.querySelector('#next');
const searchForm = document.getElementById('searchForm')
const templateString = `
<thead>
<tr>
  <th scope="col">Username</th>
  <th scope="col">Email</th>
  <th scope="col">mobile Number</th>
  <th scope="col">Wallet Balance</th>
  <th scope="col">Block/Unblock</th>
</tr>
</thead>
{{#each userList}}
  <tbody>
    <tr>
      <td>{{this.Username}}</td>
      <td>{{this.Email}}</td>
      <td>{{this.Mobilenumber}}</td>
      <td>{{WalletBalance}}</td>
      {{#if this.Isblocked}}
      <td><a href="/admin/blockuser/{{this._id}}" class="btn btn-success">Unblock</a></td>
      {{else}}
      <td><a href="/admin/blockuser/{{this._id}}" class="btn btn-danger">Block</a></td>
      {{/if}}
    </tr>
  </tbody>
{{/each}}`;

let pageNumber = 1;
const skip = 5;

// Function to update button visibility
function updateButtonVisibility(data) {
  if(data.length<5){
    next.disabled = true;
  }
  else if (data.length === 0) {
    next.disabled = true;
    
  } else {
    next.disabled = false;
    
  }
  
  if (pageNumber === 1) {
    prev.disabled = true;
  } else {
    prev.disabled = false;
  }
}

next.addEventListener('click', async (e) => {
  const skipLimit = pageNumber * skip;
  await fetch('/admin/get-limited-user/' + skipLimit)
    .then((response) => {
      response.json()
      .then((data) => {
        const template = Handlebars.compile(templateString);
        const html = template({ userList: data });
        document.getElementById('tableContainer').innerHTML = html;
        pageNumber++;
        updateButtonVisibility(data);
      });
    });
});

prev.addEventListener('click', async (e) => {
  pageNumber = pageNumber - 1;
  const skipLimit = (pageNumber - 1) * skip; 
  await fetch('/admin/get-limited-user/' + skipLimit)
    .then((response) => {
      response.json().then((data) => {
        const template = Handlebars.compile(templateString);
        const html = template({ userList: data });
        document.getElementById('tableContainer').innerHTML = html;
        updateButtonVisibility(data);
      });
    });
});

searchForm.addEventListener('submit',async(e)=>{
  e.preventDefault()
  const searchQuery= searchForm.search.value;
  await fetch('/admin/search-user/'+searchQuery,{ method:'GET',})
  .then((response)=>{
    response.json()
    .then((data)=>{
      next.style.display='none'
      prev.style.display='none'
      if(data.length==0){
        document.getElementById('tableContainer').innerHTML=''
        document.querySelector('.searchErr').innerHTML='NO USER FOUND '
      }else{
        document.querySelector('.searchErr').innerHTML=''
        const template = Handlebars.compile(templateString);
      const html = template({ userList: data });
      document.getElementById('tableContainer').innerHTML = html;
      }
      
    })
  })
})

prev.disabled = true;
