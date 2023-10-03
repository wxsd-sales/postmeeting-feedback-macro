/*********************************************************
 * 
 * Author:              William Mills
 *                    	Technical Solutions Specialist 
 *                    	wimills@cisco.com
 *                    	Cisco Systems
 * 
 * Version: 1-0-0
 * Released: 10/02/23
 * 
 * This is a Webex Device macro which collects user feedback
 * after a meeting has ended and then sends the data to a remote
 * service.
 * 
 * 
 * Full Readme, source code and license details are available here:
 * https://github.com/wxsd-sales/postmeeting-feedback-macro
 * 
 ********************************************************/

import xapi from 'xapi';

/*********************************************************
 * Configure the settings below
**********************************************************/

const config = {
  name: 'Report Issue',     // Name of the Button and Panel
  serviceUrl: 'https://webhook.site/07b132eb-0517-4681-b810-1a389753f8ac',
  allowInsecureHTTPs: true, // Allow insecure HTTPS connections to the instant connect broker for testing
  showNotifications: false, // Show sending, sent and errorSending Alerts and error alerts
  minimumCallDurationSeconds: 5,
  feedback: [
    {
      id: 'meetingRating',
      type: 'rating',
      options: {
        Duration: 30,
        Text: 'How was your meeting experience?',
        Title: 'Meeting Feedback'
      },
      nextAction: 'officeRating'
    },
    {
      id: 'officeRating',
      type: 'rating',
      options: {
        Duration: 30,
        Text: 'How was your overall office experience today?',
        Title: 'Office Feedback'
      },
      nextAction: 'userFeedback'
    },
    {
      id: 'userFeedback',
      type: 'text',
      triggers: [
        ['meetingRating', '<', 3],
        ['officeRating', '<', 3]
      ],
      options: {
        Duration: 60,
        Placeholder: 'Share your feedback',
        SubmitText: 'Send',
        Text: 'Sorry for the poor rating, care to share additional details?',
        Title: 'Please share more'
      },
      nextAction: 'send'
    }
  ],
  notifications: {          // Customise the text of the 3 possible alerts
    sending: {              // When a new notification is displayed, it will close the previous
      Title: 'Sending Feedback',
      Text: 'Your feedback is being sent',
      Duration: 10          // How long you want the alert to display in seconds
    },
    sent: {
      Title: 'Feedback Recevied 👍',
      Text: 'Thanks for your feedback ❤️',
      Duration: 10          // *When a new notification is displayed, it will close any currently open alert*
    },
    errorSending: {
      Title: 'Error Sending Feedback 🥲',
      Text: 'There was an error while sending your feedback',
      Duration: 10
    }
  },
  panelId: 'postmeetingfeedback'
}


/*********************************************************
 * Main function to setup and add event listeners
**********************************************************/

/// Macro variables
let inputs = {};
let identification = {};

function main() {

  xapi.Config.HttpClient.Mode.set('On');
  xapi.Config.HttpClient.AllowInsecureHTTPS.set(config.allowInsecureHTTPs ? 'True' : 'False');

  // Get Device Details
  xapi.Status.SystemUnit.Software.DisplayName.get()
    .then(result => { identification.software = result })
    .catch(e => console.log('Could not get DisplayName: ' + e.message))

  xapi.Status.SystemUnit.Hardware.Module.SerialNumber.get()
    .then(result => { identification.SerialNumber = result })
    .catch(e => console.log('Could not get SerialNumber: ' + e.message))

  xapi.Status.SystemUnit.ProductId.get()
    .then(result => { identification.ProductId = result })
    .catch(e => console.log('Could not get ProductId: ' + e.message))

  xapi.Status.Webex.DeveloperId.get()
    .then(result => { identification.deviceId = result })
    .catch(e => console.log('Could not get Device Id: ' + e.message))

  xapi.Status.UserInterface.ContactInfo.ContactMethod[1].Number.get()
    .then(result => { identification.contactNumber = result })
    .catch(e => console.log('Could not get Contact Number: ' + e.message))

  xapi.Status.UserInterface.ContactInfo.Name.get()
    .then(result => { identification.contactInfoName = result })
    .catch(e => console.log('Could not get Contact Info Name: ' + e.message))

  xapi.Event.CallDisconnect.on(value => {
    console.log('Call Disconnected', JSON.stringify(value))
    inputs = {};
    if (value.Duration < config.minimumCallDurationSeconds) return;
    startPrompt(config.feedback[0])

  });

  xapi.Event.UserInterface.Message.Rating.Response.on(async event => {
    if (!event.FeedbackId.startsWith(config.panelId)) return;
    await xapi.Command.UserInterface.Message.Rating.Clear();
    const id = event.FeedbackId.split('-').pop();
    console.log(`Rating Reponse of [${event.Rating}] for [${id}]`)
    inputs[id] = parseInt(event.Rating);
    proccesAction(id);
  })

  xapi.Event.UserInterface.Message.Rating.Cleared
    .on(value => console.log('Rating Cleared', JSON.stringify(value)));

    xapi.Event.UserInterface.Message.Rating.Display
    .on(value => console.log('Rating Display', JSON.stringify(value)));

  xapi.Event.UserInterface.Message.TextInput.Response.on(event => {
    if (!event.FeedbackId.startsWith(config.panelId)) return;
    const id = event.FeedbackId.split('-').pop();
    console.log(`Text Input Reponse of [${event.Text}] for [${id}]`)
    inputs[id] = event.Text;
    proccesAction(id);
  });
}

setTimeout(main, 1000);

/*********************************************************
 * Additional functions which this macros uses
**********************************************************/

function proccesAction(id) {

  const current = config.feedback.find(field => field.id === id)
  if (current.nextAction === 'send') {
    sendInformation();
    return;
  } 

  const next = config.feedback.find(field => field.id === current.nextAction)
  console.log('Checking Action', JSON.stringify(next))
  if (next.hasOwnProperty('triggers')) {
    console.log('No conditions met, going to next action')
    for (let i = 0; i < next.triggers.length; i++) {
      const [field, condition, value] = next.triggers[i];
      console.log(field, condition, value)
      switch (condition) {
        case '<':
          console.log(field, condition, value, inputs[field] < value)
          if (inputs[field] < value) {
            startPrompt(next)
            return;
          }
          break;
        case '>':
          console.log(field, condition, value, inputs[field] > value)
          if (inputs[field] > value) {
            startPrompt(next)
            return;
          }
          break;
        case '=':
          console.log(field, condition, value, inputs[field] == value)
          if (inputs[field] == value) {
            startPrompt(next)
            return;
          }
          break;
      }
    }
    console.log('No conditions met, going to next action')
    proccesAction(next.nextAction);
  } else {
    startPrompt(next);
  }
}

function startPrompt(next) {
  const options = Object.assign(next.options, { FeedbackId: config.panelId + '-' + next.id });
  switch (next.type) {
    case 'rating':
      setTimeout(ratingPrompt, 800, options);
      break;
    case 'text':
      textInputPrompt(options)
      break;
  }
}

function ratingPrompt(options) {
  console.log('Prompting for Rating: ', JSON.stringify(options))
  xapi.Command.UserInterface.Message.Rating.Display(options);
}

function textInputPrompt(options) {
  console.log('Prompting for Text Input: ', JSON.stringify(options))
  xapi.Command.UserInterface.Message.TextInput.Display(options);
}

function alert(notification) {
  if (!config.showNotifications) return;
  console.log(`Displaying alert - Title [${notification.Title}] - Text [${notification.Text}] - Duration [${notification.Duration}]`);
  xapi.Command.UserInterface.Message.Alert.Display(notification);
}

function parseJSON(inputString) {
  if (inputString) {
    try {
      return JSON.parse(inputString);
    } catch (e) {
      return false;
    }
  }
}

// The function will post the current inputs objects to a configured service URL
async function sendInformation() {
  alert(config.notifications.sending);
  inputs.identification = identification;
  inputs.bookingId = await getBookingId();
  inputs.callHistory = await getCallHistory();

  console.log('Sending Payload:', JSON.stringify(inputs))
  xapi.Command.HttpClient.Post(
    {
      AllowInsecureHTTPS: true,
      Header: ["Content-Type: application/json"],
      ResultBody: "PlainText",
      Url: config.serviceUrl
    },
    JSON.stringify(inputs)
  ).then(result => {
    // Check the response from the server display the correct message
    const body = parseJSON(result.Body);
    alert(config.notifications.sent);
  })
    .catch(err => {
      alert(config.notifications.errorSending)
    });
}

function getCallHistory() {
  return xapi.Command.CallHistory.Get({Limit: 1, DetailLevel: 'Full'})
    .then(result => {
      console.log('Call History: ', JSON.stringify(result))
      if(!result.hasOwnProperty('Entry')) return null;
      return result.Entry[0]
    });
}

function getBookingId() {
  return xapi.Status.Bookings.Current.Id.get()
    .then(result => {
      console.log('Current Booking Id:', (result == '') ? null : result)
      return (result == '') ? null : result;
    });
}
