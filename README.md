Steps to Update Alexa's Skills' Manifest:

--- Cd to skill-pakage Directory and run the command:

ask smapi update-skill-manifest -s amzn1.ask.skill.29c6180f-ce98-4bd4-84ba-979d412b5543 --manifest "file:skill.json"

--- Login to Amazon Alexa mobile app :

-- More
-- Skills and Games
-- Your Skills
-- Dev
-- Enable BUSmartSkills - Search the Smart Plug and Link the Dev Skill
-- Settings - Grant Permission to Alexa's Notifications and Reminders

--- Cd back to Lambda Directory and run the command to get "Succeed" status:

    ask smapi get-skill-status --skill-id amzn1.ask.skill.29c6180f-ce98-4bd4-84ba-979d412b5543 --resource manifest --debug

---- Read the current and updated manifest:

    ask smapi get-skill-manifest --skill-id amzn1.ask.skill.29c6180f-ce98-4bd4-84ba-979d412b5543

Steps to issue a fresh access token to send Alexa a proactive event:

--- Run "npm run budev" to execute the testJson.js file using Nodemon

    -- Get the Fresh Access Token
    -- Send an Immidaite Notification to Alexa
    -- Check out Alexa for the received Notifications : "Alexa, what are my notifications?"
