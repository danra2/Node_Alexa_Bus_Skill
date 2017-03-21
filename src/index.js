//-------------------------------------------Connections-------------------------------------------//
var http       = require('http')
  , AlexaSkill = require('./AlexaSkill')
  , APP_ID     = 'arn:aws:lambda:us-east-1:501102788766:function:MetroBusSchedule'
  , API_KEY    = '52af9580-c72b-49c3-986c-70c75e474255';

//Requiring the Node package http so we can interact with the MTA API, the Alexa Skills KIT SDK.
//Grab the APP ID from your skills kits in AWS

//-------------------------------------------API Setup-------------------------------------------//
var url = function(stopNumber, busNumber){
return 'http://api.pugetsound.onebusaway.org/api/where/arrival-and-departure-for-stop/' + stopNumber + '.xml?key=' + API_KEY + '&serviceDate=1291536000000&vehicleId=' + busNumber + '&stopSequence=42';
};
//This is the onebusaway API we will be drawing the bus times/information from. 
//There is no point in inputting a time, because it defaults to using the current time. 

//-------------------------------------------Event Handlers-------------------------------------------//
BusSchedule.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("BusSchedule onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
};

BusSchedule.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("BusSchedule onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = 'Welcome to Daniel\'s Bus Schedule Alexa Skill. ' +
    'Which bus stop, and bus number are you looking up information for?';
    var repromptText = 'Which bus stop, and bus number are you looking up information for?';
    response.ask(speechOutput, repromptText);
};

BusSchedule.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("BusSchedule onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
};

//-------------------------------------------Intent Handlers-------------------------------------------//
BusSchedule.prototype.intentHandlers = {
  GetNextBusIntent: function(intent, session, response){
    handleNextBusRequest(intent, session, response);
  },

  HelpIntent: function(intent, session, response){
    var speechOutput = 'How may I help you?';
    response.ask(speechOutput);
  }
};

//-------------------------------------------JSON/API/CALL-------------------------------------------//
var getJsonFromAPI = function(stopNumber, busNumber, callback){
  http.get(url(stopNumber,busNumber), function(res){
    var body = '';

    res.on('data', function(data){
      body += data;
    });

    res.on('end', function(){
      var result = JSON.parse(body);
      callback(result);
    });

  }).on('error', function(e){
    console.log('Error: ' + e);
  x});
};
//This whole block of text essentially just grabs JSON from the MTA. 
//The function accepts two arguments, the stopId the requested and a callback to handle the data once we're finished grabbing it. 
//BusNumberIntent which bus are you looking up information for {BusNumber}?

//-------------------------------------------JSON/API/OUTPUT/ALEXA/RESULT-------------------------------------------//
var handleNextBusRequest = function(intent, session, response){
  getJsonFromAPI(intent.slots.stopNumber.value, intent.slots.busNumber.value, function(results){
    if(results.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit){
      var text = results
                  .ServiceDelivery
                  .PresentableDistance;
                
      var cardText = 'The next bus is: ' + text;
    } else {
      var text = 'That bus stop does not exist.'
      var cardText = text;
    }

    var heading = 'Next bus for' + stopNumber + ':' + intent.slots.busNumber.value;
    response.tellWithCard(text, heading, cardText);
  });
  //Vary Heading, tell with card is just the log that gets saved to the alexa app in the form of text. 
};

//-------------------------------------------Handler that responds to the Alexa Request-------------------------------------------//
exports.handler = function(event, context) {
    var skill = new BusSchedule();
    skill.execute(event, context);
};

//-------------------------------------------Handler that responds to the Alexa Request-------------------------------------------//
var BusSchedule = function(){
  AlexaSkill.call(this, APP_ID);
};

BusSchedule.prototype = Object.create(AlexaSkill.prototype);
BusSchedule.prototype.constructor = BusSchedule;
//Creating the BusSchedule Constructor. We are extending the AlexaSkill SDK and creating our own BusSchedule constructor. 