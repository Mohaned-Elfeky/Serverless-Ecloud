
var cont_btn=document.getElementById("cont_btn")

cont_btn.addEventListener("click",event=>{
  
  var username="mohaned";
  var password="Password99";
  
  var body=JSON.stringify({
    "username": username,
    "password": password
  })
  
  url="https://3rs5pl7c9c.execute-api.us-east-1.amazonaws.com/Dev/signin"
  
  fetch(url, {
    method: 'POST', // or 'PUT'
    headers: {
      'Content-Type': 'application/json',
    },
    body: body,
  })
  .then(response => response.json())
  .then(data => {
    
    console.log('Success:', data);
    
    if(data.body.error != ""){
      document.getElementById("error_msg").innerHTML="<p>No user found with those credentials. </p>"
      document.getElementById("error_msg").style.display="block";
    }else{
      
     var user_token=data.body.token;
     const d = new Date();
     d.setTime(d.getTime() + (7*24*60*60*1000));
     expiry=d.toUTCString();
     document.cookie = "usertoken="+user_token+"; expires="+expiry;
     
     window.location.replace("home.html");
      
    }
 
    
  })
  .catch((error) => {
    console.error('Error:', error);
  });
})

