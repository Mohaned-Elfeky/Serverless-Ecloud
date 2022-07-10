
  
var classes_container=document.getElementById("classes_container");

url="https://3rs5pl7c9c.execute-api.us-east-1.amazonaws.com/Dev/classes"
  
  fetch(url, {
    method: 'POST', // or 'PUT'
    headers: {
      'Content-Type': 'application/json',
    },
    body:JSON.stringify({
      "user_token": getCookie("usertoken"),
    }),
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
    let n=Object.keys(data.body).length
    
    for(let i=1; i<=n ; i++){
      let Class=data.body[i];
      
      
      classes_container.innerHTML+=`            
    <div  class="column">
      
      
      <div class="ui ${Class.class_theme.theme_color} link card">
        
          <a class="image" href="class.html?id=${Class.class_id}/posts">
            <img src="${Class.class_theme.theme_image}">
          </a>
          
          <div class="content">
            <a href="class.html?id=${Class.class_id}/posts" class="header">${Class.class_name}</a>
            <div class="meta">
              <span class="date">Dr.${Class.class_teacher}</span>
            </div>
          </div>
          <div class="extra content">
          <a>
            <i class="user icon"></i>
            ${Class.class_number_of_students}
          </a>
        </div>
      </div>
  </div>
  `
      
    }
    
    
    
  })
  .catch((error) => {
    console.error('Error:', error);
  });



  