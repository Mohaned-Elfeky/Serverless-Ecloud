
var posts_nav=document.getElementById("posts_nav");
var assignments_nav=document.getElementById("assignments_nav");
var materials_nav=document.getElementById("materials_nav");

var class_header=document.getElementsByClassName("class_header")[0];
var posts_container=document.getElementsByClassName("posts_container")[0];
var assignments_container=document.getElementById("assignments_container");
var materials_container=document.getElementById("materials_container");
var videos_container=document.getElementById("videos_container");


var navs=document.getElementsByClassName("class_nav");
var dimmer_container=document.getElementById("dimmer_container");




var bucketName = "e-cloud-bucket";
var awsRegion = "us-east-1";
var IdentityPoolId = "us-east-1:2131a7d2-b4ca-4532-93b3-af4afbaf3cfe";

var current_class={
  class_name:"",
  class_id:""
}

AWS.config.update({
  region: awsRegion,
  credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: IdentityPoolId
  })
});

var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {Bucket: bucketName}
});



//highlight selected element from top nav bar
function highlighSelected(ele){
  ele.classList.add("selected");
  
 
  for(let i=0; i<navs.length; i++){
    if(navs[i]==ele) continue;
    navs[i].classList.remove("selected");
  }
  
  
}


//video nav is selected
function selectVideos(){
  videos_container.classList.remove("hidden");
  posts_container.classList.add("hidden");
  assignments_container.classList.add("hidden");
  materials_container.classList.add("hidden");

  getClassMeeting();
 
}


//posts nav is selected
function selectPosts(){
  posts_container.classList.remove("hidden");
  assignments_container.classList.add("hidden");
  materials_container.classList.add("hidden");
  videos_container.classList.add("hidden");
  
  
  renderPosts();
}

//assignments nav is selected
function selectAssignments(newely_added,assignment_title){
  assignments_container.classList.remove("hidden");
  posts_container.classList.add("hidden");
  materials_container.classList.add("hidden");
  videos_container.classList.add("hidden");
  
  getAssignments(newely_added,assignment_title);
  
}

//materials nav is selected
function selectMaterials(){
  materials_container.classList.remove("hidden");
  posts_container.classList.add("hidden");
  assignments_container.classList.add("hidden");
  videos_container.classList.add("hidden");
  
  renderMaterials();
  
}


videos_nav.addEventListener("click",event => {
  
  window.history.pushState({ data: 'some data' },'Some history entry title', `/class.html?id=${class_id}/video-chat`);
  renderSelected();

  
})


posts_nav.addEventListener("click",event => {
  
  window.history.pushState({ data: 'some data' },'Some history entry title', `/class.html?id=${class_id}/posts`);
  renderSelected();
  
})

assignments_nav.addEventListener("click",event => {
  
  window.history.pushState({ data: 'some data' },'Some history entry title', `/class.html?id=${class_id}/assignments`);
  renderSelected();
})

materials_nav.addEventListener("click",event => {
  
  window.history.pushState({ data: 'some data' },'Some history entry title', `/class.html?id=${class_id}/materials`);
  renderSelected();
  
  
})




function renderPosts(){
  
  
  url="https://3rs5pl7c9c.execute-api.us-east-1.amazonaws.com/Dev/posts/"+class_id
 
  posts_container.innerHTML=`
  <div class="ui segment">
  <div class="ui active loader"></div>
  <p></p>
</div>
  `
  
  fetch(url, {
    method: 'GET', 
  })
  .then(response => response.json())
  .then(data => {
    
    posts_container.innerHTML=`  
<div class="ui card">
  <div class="content"> 
       <div class="ui large transparent left icon input">
           <i class=" circle user icon"></i>
           <input id="new_post_input" onkeypress="addPost(this)"  type="text" placeholder="Create new post">
       </div>
   </div>
</div>`; 
    
   let posts_count=Object.keys(data.body).length
   if(posts_count == 0){
    assignments_container.innerHTML=`
    <div class="container ui empty_msg">
      No posts published in this class.
    
    </div>
    
    `
    return;
  }
   
   for(let i=0; i<posts_count ; i++){
     
    let post=data.body[i];
    let replies=post.replies;
    let replies_count=Object.keys(replies).length
    var replies_html=""
    
    
      for(let j=0; j<replies_count; j++){
        reply=replies[j];
         replies_html+=`
        <div class="reply content">
            
        <div class="content">
            <div class="right floated meta">${reply.reply_date}</div>
            <i class=" circle user icon"></i> ${reply.reply_publisher}
            <br>
          </div>
        
          <div class="content">
          ${reply.reply_content}
          </div>
      </div>`
      }
    

 
    
    
    posts_container.innerHTML+=`
                 
    <div class="post">
        
        <div class="ui card">
            
            <div class="content">
              <div class="right floated meta">${post.post_date}</div>
              <i class=" circle user icon"></i> ${post.post_publisher}
            </div>
          
            <div class="content">
              ${post.post_content}
            </div>
            
            
            ${replies_html}
            
            
            
            <div class="extra content">
              <div class="ui large transparent left icon input">
                <i class=" circle user icon"></i>
                <input onkeypress="addReply(this)" reply_post_id=${post.post_id}  type="text" placeholder="Add Comment...">
              </div>
            </div>
          </div>
          <br>
    </div>        
`


    
   }
  
  })
  .catch((error) => {
    console.error('Error:', error);
  });
  
}

function getAssignments(newely_added,assignment_title){
  var submissions={};
  
 
  
  url="https://3rs5pl7c9c.execute-api.us-east-1.amazonaws.com/Dev/submissions/"+class_id+"/"+getCookie("usertoken");

  fetch(url, {
    method: 'GET', 
  })
  .then(response => response.json())
  .then(data => {
      
      
      let subm_count=Object.keys(data.body).length;
      for(let i=0; i<subm_count ; i++){
        let subm=data.body[i];
        submissions[subm.assignment]={
          status:"Turned in",
          date:subm.date,
          grade:subm.grade,
          file:subm.url
        }
      }
      
      renderAssignments(submissions,newely_added,assignment_title);
      
      
  })
  .catch((error) => {
    console.error('Error:', error);
  });
  
  
}


function renderAssignments(submissions,newely_added,assignment_title){
  
  assignments_container.innerHTML=`
  <div class="ui segment">
  <div class="ui active loader"></div>
  <p></p>
</div>
  `
  
  url="https://3rs5pl7c9c.execute-api.us-east-1.amazonaws.com/Dev/assignments/"+class_id
  fetch(url, {
    method: 'GET', 
  })
  .then(response => response.json())
  .then(data => {
    assignments_container.innerHTML="";
    
    let assignments_count=Object.keys(data.body).length
    if(assignments_count == 0){
      assignments_container.innerHTML=`
      <div class="container ui empty_msg">
        No assignments assigned to this class
      
      </div>
      
      `
      return;
    }
    
   for(let i=0; i<assignments_count ; i++){
    let assignment=data.body[i];
    
    if(submissions[assignment.title]==undefined){
      var subm_status={
        status:"No submission made",
          date:"No submission made",
          grade:"No submission made",
          file:"No submission made"
      };
    }
    else{
      var subm_status=submissions[assignment.title];
    }
    
    
    
    assignments_container.innerHTML+=`
    <div class="assignment">
    <div class="ui card">
    <div class="content">
        <h4><div class="right floated meta">Due ${assignment.due_date}</div>
     <i class="clipboard big outline icon"></i>
      ${assignment.title}</h4>
    </div>
    <div class="content">
      <span class="right floated">
        ${subm_status.status}
      </span>
      
     Posted on ${assignment.post_date}
    </div>
    <div class="assignment_desc content">
    ${assignment.desc}
    </div>
    <div class="extra content">
    
        <button id="show_dimmer_${assignment.id}" assign_id=${assignment.id}  assign_title='${assignment.title}' subm_status='${subm_status.status}' subm_grade='${subm_status.grade}'
        subm_date='${subm_status.date}' subm_file='${subm_status.file}'
        class="ui  button add_subm_btn" 
        onClick=showDimmer(this) >
            View/Add submission
          </button>
    </div>
  </div>
  <br>
  </div>  
    `
   if(newely_added && assignment_title == assignment.title){
    let current_assign_dimmer = document.getElementById(`show_dimmer_${assignment.id}`);
    showDimmer(current_assign_dimmer);
   }
    
   }})
  .catch((error) => {
    console.error('Error:', error);
  });
  
  
}

function renderClass(){
  
  url="https://3rs5pl7c9c.execute-api.us-east-1.amazonaws.com/Dev/classes/"+class_id
  
  fetch(url, {
    method: 'GET', 
  })
  .then(response => response.json())
  .then(data => {
    Class=data.body; 
    current_class.class_name=Class.class_name;
    current_class.class_id=Class.class_id;
    
    
    
    
    class_header.innerHTML=`


    <img class="image" src="${Class.class_theme.theme_image}">
    <div class="class_image_text">${Class.class_name}</div>



`

  })
  .catch((error) => {
    console.error('Error:', error);
  });
}


function renderMaterials(){
  
  let container_html=materials_container.innerHTML;
  
  materials_container.innerHTML=`
  <div class="ui segment">
  <div class="ui active loader"></div>
  <p></p>
</div>`
  
  url="https://3rs5pl7c9c.execute-api.us-east-1.amazonaws.com/Dev/materials/"+class_id
  
  fetch(url, {
    method: 'GET', 
  })
  .then(response => response.json())
  .then(data => {
    
    materials_container.innerHTML=container_html;
    
    let materials_videos_container=document.getElementById("materials_videos_content");
    let materials_docs_container=document.getElementById("materials_docs_content");
    let materials_externals_container=document.getElementById("materials_externals_content");
    
    
    
    materials_videos_container.innerHTML="";
    materials_docs_container.innerHTML="";
    materials_externals_container.innerHTML="";
    
    
    let videos_count=Object.keys(data.body.videos).length
    
    
    for(let i=1; i<=videos_count;  i++){
      let video=data.body.videos[i];
      
      materials_videos_container.innerHTML+=`
      <div  class="column">
      <div class="ui link card">

          <div class="content">
              <i class="smallcircular play icon"></i> 
              <a href="${video.url}" target="_blank" class="">${video.title}.mp4</a>
          </div>
      
      </div>
  </div>
      
      `
      
    }
    
    let docs_count=Object.keys(data.body.docs).length
    
    
    for(let i=1; i<=docs_count;  i++){
      let doc=data.body.docs[i];
      
      materials_docs_container.innerHTML+=`
      <div  class="column">
      <div class="ui  link card">

          <div class="content">
              <i class="smallcircular file alternate icon"></i> 
              <a href="${doc.url}" class="">${doc.title}.pdf</a>
          </div>
      
      </div>
  </div>
      
      `
      
    }
    
    
    let externals_count=Object.keys(data.body.externals).length
    
    
    for(let i=1; i<=externals_count;  i++){
      let external=data.body.externals[i];
      
      materials_externals_container.innerHTML+=`
      <div  class="column">
      <div class="ui  link card">

          <div class="content">
              <i class="smallcircular book  icon"></i> 
              <a href="${external.url}" target="_blank" class="">${external.title}</a>
          </div>
      
      </div>
  </div>
      
      `
      
    }

    
    
    
  })
  .catch((error) => {
    console.error('Error:', error);
  });
  
  
}


function addPost(ele){
  if(event.keyCode == 13) {
    url="https://3rs5pl7c9c.execute-api.us-east-1.amazonaws.com/Dev/posts/add";
    
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "post_content": ele.value,
        "post_class": class_id,
        "user_token": getCookie("usertoken")
      }),
    })
    .then(response => response.json())
    .then(data => {
      
      selectPosts();
      $("#add_ok_msg").removeClass("hidden")
      $("#add_ok_msg").transition({
    animation : 'fade',
    duration  : 5000,
})
    })
    .catch((error) => {
      console.error('Error:', error);
    });   
}
}


function addReply(ele){
  if(event.keyCode == 13) {
    url="https://3rs5pl7c9c.execute-api.us-east-1.amazonaws.com/Dev/replies/add";
    
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "reply_content": ele.value,
        "reply_class": class_id,
        "user_token": getCookie("usertoken"),
        "reply_post": ele.getAttribute("reply_post_id")
      }),
    })
    .then(response => response.json())
    .then(data => {
      
      renderPosts();

    })
    .catch((error) => {
      console.error('Error:', error);
    });   
}
}

function addSubm(file_url,ele){
  url="https://3rs5pl7c9c.execute-api.us-east-1.amazonaws.com/Dev/submissions/add";
  var assignment_title=ele.getAttribute("assign_title");
  var assignment_id= ele.getAttribute("assign_id"); 
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "file_url": file_url,
        "assignment_title": assignment_title,
        "class_id": class_id ,
        "user_token": getCookie("usertoken")
      }),
    })
    .then(response => response.json())
    .then(data => {
      
      console.log("uploaaad");
      $('#subm_dimmer').dimmer('hide'); 
      selectAssignments(true,assignment_title);
  
    })
    .catch((error) => {
      console.error('Error:', error);
    });   
}


function renderSelected(){
  
  var url_string =  window.location.href
  var url = new URL(url_string);
  var class_url = url.searchParams.get("id");
  const myArray = class_url.split("/");
  class_id=myArray[0];
  selected_nav=myArray[1];
  
  renderClass();
  
  
  console.log(selected_nav);
  switch(selected_nav) {
    
    case "posts":
      highlighSelected(document.getElementById("posts_nav"));
      selectPosts()
      break;
    case "assignments":
      highlighSelected(document.getElementById("assignments_nav"));
      selectAssignments();
      break;
    case "materials":
      highlighSelected(document.getElementById("materials_nav"));
      selectMaterials();
      break  
    case "video-chat":
      highlighSelected(document.getElementById("videos_nav"));
      selectVideos();
      break 
    
  }
}



renderSelected();

window.onpopstate = function(event) {
  renderSelected();
};

function showDimmer(ele){
  var assign_id=ele.getAttribute("assign_id");
  var assign_title=ele.getAttribute("assign_title");
  
  var subm_status=ele.getAttribute("subm_status");
  var subm_grade=ele.getAttribute("subm_grade");
  var subm_date=ele.getAttribute("subm_date");
  var subm_file=ele.getAttribute("subm_file");
  var subm_file_name=subm_file.split('/')[7]
 
  
  if(subm_status=="No submission made"){
    var file_html=`
    <td id="submission_col">
    <div class="ui input">
            
    <input id="fileUpload" type="file"/>
    
      <div> 
      <button id="submit_file_btn"  class="ui primary button">
      Submit
      </button>  
      </div> 
    </div>
    </td>
    `
  }
  else{
    
    var file_html=`
    <td id="submission_col">
    <a href="${subm_file}">${subm_file_name}</a>
    </td>
    `
    
  }
  
  
  
  dimmer_container.innerHTML=`
  <h3>${assign_title}</h3>
  <table class="ui celled striped table">
    
    <tbody>
    
    
      <tr class=${subm_status=='Turned in' ? 'positive' : 'negative'} colspan="2">
        <td colspan="2" class="collapsing">
          Status
        </td>
        <td>${subm_status}        
        </td>                  
      </tr>
      
      <tr>
        <td colspan="2">
          Submission date
        </td>
        <td>${subm_date}</td>                      
      </tr>
      
      <tr>
        <td colspan="2">
          Grade
        </td>
        <td>${subm_grade}</td>
      </tr>
      
      <tr>
        <td colspan="2">
          Submitted file
        </td>
        
       ${file_html}
        
        
      </tr>
  
    </tbody>
  </table>`
  
  if( subm_status == "No submission made"){
    let submit_file_btn=document.getElementById("submit_file_btn");
    submit_file_btn.addEventListener("click",event=>{
      s3Upload(ele)
    })
  }
 
  
  $('#subm_dimmer').dimmer('show');
}




function s3Upload(ele) {
  

  assign_title=ele.getAttribute("assign_title");
  
  var files = document.getElementById('fileUpload').files;
  if (files) 
  {
    var file = files[0];
    var filename=file.name
    
    var params = {Key: `assignments_submissions/${current_class.class_name}/${assign_title}/mohaned/${filename}` , Body: file};
    s3.upload(params, function(err, data) {
      console.log("uploaded file");
    addSubm(data.Location,ele)
});

  }
}