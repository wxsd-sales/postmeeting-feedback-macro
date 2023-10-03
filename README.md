


# Postmeeting Feedback Macro

This is an example Webex Device macro which collected user feedback once a meeting has ended and can send the collected data to a backend server.

![meetingFeedbackPrompt](https://github.com/wxsd-sales/postmeeting-feedback-macro/assets/21026209/bdb6d518-293c-4d9f-b0ba-fb5791bb6833)

## Overview

This macro is an example in how you can monitor when a Webex Device has finished a call and then prompt a series of feedback and text input prompt to collect user feedback.

Once the data has been collected, it is then send as a HTTP POST JSON payload to server of your choice.

The macro will also collect the last call history detail and the devices serial number, firmware laod and other information which is also included the send payload.


### Flow Diagram

<!-- *MANDATORY*  Insert Your Flow Diagram Here (if small PoC, alternative option is to include break down how it works here instead of diagram) -->
![image/gif](insert img link here)



## Setup

### Prerequisites & Dependencies: 

- Webex Device with RoomOS 11.x or Greater
- Web admin access to the device to upload the macro
- A backend service to recieve the collected user feedback


<!-- GETTING STARTED -->

### Installation Steps:
1.  Log into your Webex Devices web interface
2.  Upload the macro from this repo called ```postmeeting-feedback.js``` and configure it using the configuration section at the beginning of the macro.
3.  Save the changes and then enable the macro.
    
    
    
## Demo

<!-- Keep the following statement -->
*For more demos & PoCs like this, check out our [Webex Labs site](https://collabtoolbox.cisco.com/webex-labs).

## License
<!-- MAKE SURE an MIT license is included in your Repository. If another license is needed, verify with management. This is for legal reasons.--> 

<!-- Keep the following statement -->
All contents are licensed under the MIT license. Please see [license](LICENSE) for details.


## Disclaimer
<!-- Keep the following here -->  
Everything included is for demo and Proof of Concept purposes only. Use of the site is solely at your own risk. This site may contain links to third party content, which we do not warrant, endorse, or assume liability for. These demos are for Cisco Webex use cases, but are not Official Cisco Webex Branded demos.


## Questions
Please contact the WXSD team at [wxsd@external.cisco.com](mailto:wxsd@external.cisco.com?subject=RepoName) for questions. Or, if you're a Cisco internal employee, reach out to us on the Webex App via our bot (globalexpert@webex.bot). In the "Engagement Type" field, choose the "API/SDK Proof of Concept Integration Development" option to make sure you reach our team. 
