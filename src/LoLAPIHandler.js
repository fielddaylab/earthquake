//Contains all functions for interacting with the LoL API

//Send messages
function LoLApi (messageName, payloadObj) {
    parent.postMessage({
        message: messageName,
        payload: JSON.stringify(payloadObj)
    }, 
'*')};

//Listen for messages
window.addEventListener("message", function (msg) {
    console.log('[PARENT => UNITY]', msg)

    switch (msg.data.messageName) 
    {
        case 'pause':
            gameIsPaused = true;
            break;
        case 'resume':
            gameIsPaused = false;
            break;
    }
});

var gameIsPaused = false;

//Called when loading screen starts
function gameStart()
{
    LoLApi('gameIsReady', 
    { 
        aspectRatio: "16:9",
        resolution: "1024x576",
    });

	console.log("Game is ready"); 
}

//Progress Handling
  var tutProgressPoints = 0;
  var playProgressPoints = 0;
  var currProgress = 0;
  var maxTutPoints = 32;
  var maxPlayPoints = 32;
  var maxProgress = maxTutPoints + maxPlayPoints;
  var addedPoints = false;

  //Add tutorial progress
  function setTutPoints(newPoints)
  {
    //first time player is reaching this part of the tutorial
    if (newPoints > tutProgressPoints)
    {
        tutProgressPoints = newPoints;
        sendProgress();
    }
  }

  //Add play progress
  function addPlayPoints(numTurns)
  {
    var pointsToAdd = 24/numTurns;
    playProgressPoints = min(playProgressPoints + pointsToAdd, maxPlayPoints);
    sendProgress();
  }

  //Send new progress to LoL API
  function sendProgress()
  {
    currProgress = min((tutProgressPoints + playProgressPoints), maxProgress);
    LoLApi('progress', {score: 0, currentProgress: currProgress, maximumProgress: maxProgress});

    console.log("progress: " + currProgress + "/"+maxProgress);
  }

//Determine if progress points are maxed. If so, end the game
function checkGameEnd()
{
  if (currProgress >= maxProgress)
  {
    endGame();
  }
}

//Tell LoL API to end the game
function endGame()
{
  LoLApi('complete', {});
  console.log("Complete");
}
