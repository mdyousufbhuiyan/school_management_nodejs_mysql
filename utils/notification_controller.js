const fs = require("fs");
const configs = require("../config/config.json");
const mysqldb = require("../config/mysqldb");
const constants = require("../utils/constants");
const { GoogleAuth } = require("google-auth-library");
const axios = require("axios");
const serviceAccountPath = "./utils/student-care-cce2f-firebase-adminsdk-fbsvc-a399345ac4.json";

// Initialize GoogleAuth with the service account credentials
async function getAccessToken() {
    const auth = new GoogleAuth({
      keyFile: serviceAccountPath,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'], // FCM scope
    });
  
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
  
    return accessToken.token;
  }
  
  // Send notification to a single topic
  async function sendNotificationToTopic(accessToken, topic,title,description) {
    const message = {
      message: {
        topic: topic, // Topic to send notification to
        notification: {
          title: title,
          body: description,
        },
        android: {
          priority: 'high',
        },
      },
    };
  
    try {
      const response = await axios.post(
        'https://fcm.googleapis.com/v1/projects/student-care-cce2f/messages:send', // Replace with your Firebase project ID
        message,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      console.log(`Notification sent to topic: ${topic}`, response.data);
    } catch (error) {
      console.error(`Error sending notification to topic ${topic}:`, error.response ? error.response.data : error.message);
    }
  }

  // Send notifications to a list of topics
  exports.sendNotificationToAllStudentTopics= async(topics,title,description)=> {
    const accessToken = await getAccessToken();
  
    for (const topic of topics) {
        console.log(`........topic.........>${topic}....`);
      await sendNotificationToTopic(accessToken, `student`,title,description);
    }
  }
exports.sendNotificationToStuentIdsTopics= async(topics,title,description)=> {
    const accessToken = await getAccessToken();
  
    for (const topic of topics) {
        console.log(`........topic.........>${topic}....`);
      await sendNotificationToTopic(accessToken, `st-${topic}`,title,description);
    }
  }
  exports.sendNotificationToClassRoomIdsTopics= async(topics,title,description)=> {
    const accessToken = await getAccessToken();
  
    for (const topic of topics) {
        console.log(`........topic.........>${topic}....`);
      await sendNotificationToTopic(accessToken, `cr-${topic}`,title,description);
    }
  }