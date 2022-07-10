var ongoing_meeting;  //boolean variable to check if ongoing meeting exists
var ongoing_meeting_response; 

var join_btn=document.getElementById("join_meeting_btn");
var create_btn=document.getElementById("create_meeting_btn");
var leave_btn=document.getElementById("leave_meeting_container");

var url_string =  window.location.href
var url = new URL(url_string);
var class_url = url.searchParams.get("id");
const myArray = class_url.split("/");
class_id=myArray[0];   //class_id from GET url

//create meeting and new attendee
function createMeetingWithAttendee(){
    
    url="https://3rs5pl7c9c.execute-api.us-east-1.amazonaws.com/Dev/meetings/create";
  
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "class_id": class_id,
      }),
    })
    .then(response => response.json())
    .then(data => {
        meeting_response=data.body.Meeting;
        
        createAttendee(meeting_response)
        
    })
    .catch((error) => {
      console.error('Error:', error);
    });
    
    
}

//Add attendee to the class meeting
function createAttendee(meeting_response){
    url="https://3rs5pl7c9c.execute-api.us-east-1.amazonaws.com/Dev/meetings/attendee/create";
    console.log(meeting_response.MeetingId);
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "meeting_id": meeting_response.MeetingId,
        "user_token": getCookie('usertoken')
      }),
    })
    .then(response => response.json())
    .then(data => {
        
        leave_btn.classList.remove("hidden");
        console.log(leave_btn.classList);
        create_btn.classList.add("hidden");
        join_btn.classList.add("hidden");
        
        
        console.log(data);
        attendee_response=data.body.Attendee;
        joinCall(meeting_response,attendee_response)

    })
    .catch((error) => {
      console.error('Error:', error);
    });   

}



async function joinCall(meeting_response,attendee_response){
  
  
  
  const logger = new ChimeSDK.ConsoleLogger('ChimeMeetingLogs', ChimeSDK.LogLevel.INFO);
  const deviceController = new ChimeSDK.DefaultDeviceController(logger);
  const configuration = new ChimeSDK.MeetingSessionConfiguration(meeting_response, attendee_response);
  var meetingSession = new ChimeSDK.DefaultMeetingSession(configuration, logger, deviceController);
  current_meetingSession=meetingSession;
  const audioInputs = await meetingSession.audioVideo.listAudioInputDevices();
  const videoInputs = await meetingSession.audioVideo.listVideoInputDevices();

  await meetingSession.audioVideo.chooseAudioInputDevice(
      audioInputs[0].deviceId
  );
  await meetingSession.audioVideo.chooseVideoInputDevice(
      videoInputs[0].deviceId
  );

  const observer = {
      videoTileDidUpdate: (tileState) => {
          
          // Ignore a tile without attendee ID and other attendee's tile.
          updateTiles(meetingSession);
      },
  };
  
 

  meetingSession.audioVideo.addObserver(observer);
  const audioOutputElement = document.getElementById("meeting-audio");
  meetingSession.audioVideo.bindAudioElement(audioOutputElement);
  meetingSession.audioVideo.start();
  
  var localTileId = meetingSession.audioVideo.startLocalVideoTile();
 

}


//checks if any ongoing meetings for this class exists
function getClassMeeting(){
  
  url="https://3rs5pl7c9c.execute-api.us-east-1.amazonaws.com/Dev/meetings/"+class_id;
    
    
  fetch(url, {
    method: 'GET',
  })
  .then(response => response.json())
  .then(data => {
   
    console.log(data.body);
    
    if(!Object.keys(data.body).length){
      ongoing_meeting=false;
      ongoing_meeting_response=null;
    }
    else{
      ongoing_meeting=true;
      ongoing_meeting_response=data.body;
    }
    
    rendermeetings();

  })
  .catch((error) => {
    console.error('Error:', error);
  });   

  
}

//renders video-chat container according to the status of ongoing meeting(exists or not)
function rendermeetings(){
  console.log("meeting true:",ongoing_meeting);
  if(ongoing_meeting){
    
    create_btn.classList.add("hidden");
    
    join_btn.classList.remove("hidden");
    join_btn.addEventListener("click", event=>{
      createAttendee(ongoing_meeting_response);
    })
    
  }
  else{
    //add teacher student visibility here
    
    
  }
}

//exits the current meeting 
async function leaveCall(){
  current_meetingSession.audioVideo.stop()  
  window.location.reload();
}

//add video tiles of all meeting attendees to the html element
function updateTiles(meetingSession) {
  const tiles = meetingSession.audioVideo.getAllVideoTiles();
  console.log(tiles);
  tiles.forEach(tile => {
    
      let tileId = tile.tileState.tileId
      var videoElement = document.getElementById("video-" + tileId);
     
      
      if (!videoElement) {
          videoElement = document.createElement("video");
          videoElement.classList.add("video_tile")
          videoElement.id = "video-" + tileId;
          document.getElementById("video-list").append(videoElement);
          meetingSession.audioVideo.bindVideoElement(
              tileId,
              videoElement
          );
      }
      else{
        document.getElementById("video-list").append(videoElement);
        meetingSession.audioVideo.bindVideoElement(
            tileId,
            videoElement
        );
      }
  }) 
}




 