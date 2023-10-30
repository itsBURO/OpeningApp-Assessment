//dotenv config
const dotenv = require('dotenv')
dotenv.config()

//setting up google api
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;

//function to set a random interval between so and so time in seconds
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

//storing the app start time. the app will only consider the mails received after the app was started
let appStartTime = Math.floor(new Date().getTime() / 1000);

/*
* variable to save the intervalID for the setInterval function. 
* this will be used for removing the interval if in case 
* we want to stop the functionality.
*/
let intervalId = null;

/**
 * setting the clientID,Client_secret,redirect_URL, refresh_token.
 * This works magically, but needs some fixing. beyond my understanding. 
 */
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

//oauth2 client creation
const oauth2Client = new OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
);

//this is repeated. otherwise the app is breaking. not sure why
//setting the credentials for the oauth2 client
oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN,
});

//this is also repeated, otherwise the app is breaking. not sure why
// creating the gmail client
const gmail = google.gmail({
    version: 'v1',
    auth: oauth2Client
});


/**
 * Check for new emails and handle them accordingly.
 * @param {Object} tokens - The authentication tokens.
 */
async function checkForNewEmails(tokens) {
    //setting the credentials with the tokens received after authentication. 
    oauth2Client.setCredentials({
       refresh_token:tokens.refresh_token
    });

    const gmail = google.gmail({
        version: 'v1',
        auth: oauth2Client
    });


    // Fetch unread primary emails after application start time
    try {
        const response = await gmail.users.messages.list({
            userId: 'me',
            q: `is:unread category:primary after:${Math.floor(appStartTime)}`
        });
        

        //If there are messages, pass it to the handleEmail() function which will determine what needs to be done
        const messages = response.data.messages;
        if (messages && messages.length) {
            for (let message of messages) {
                await handleEmail(message.id);
            }
        }
        
    } catch (error) {
        console.error('Error while checking for new emails:', error);
    }
}


/**
 * Handle a specific email based on its ID.
 * @param {string} emailId - The ID of the email.
 */
async function handleEmail(emailId) {

    try {
        const email = await gmail.users.messages.get({
            userId: 'me',
            id: emailId
        });
        
        // check if the email is in a new thread
        if (await isNewThread(email)) {

            //send a reply and label it with autoreplied
            await sendReply(emailId);
            await labelEmail(emailId); 
        }
    } catch (error) {
        console.error(`Error handling email ${emailId}:`, error);
    }
}

/**
 * Determine if the email is from a new thread.
 * @param {Object} email - The email object.
 * @returns {boolean} - True if it's a new thread, false otherwise.
 */
async function isNewThread(email) {

    try {
        
        const emailThread = await gmail.users.threads.get({
            userId: 'me',
            id: email.data.threadId
        });

        //get the last message of the thread
        const lastMessage = emailThread.data.messages[emailThread.data.messages.length - 1];

        /**
         * check the labels of the last message
         * If SENT is present, this was already replied to, hence doesn't require replying back anymore.
         * newThread will only be returned as true when lastMessage doesn't have a SENT label
         */
        const status =  !lastMessage.labelIds.includes('SENT');
        return status
    } catch (error) {
        console.error('Error in determining if the email is from a new thread:', error);
        return false;
    }
}

/**
 * Send a reply to a specific email based on its ID.
 * @param {string} emailId - The ID of the email.
 */

async function sendReply(emailId) {
    try {
        const email = await gmail.users.messages.get({
            userId: 'me',
            id: emailId
        });

        const emailData = email.data;
        const subject = `Re: ${getEmailSubject(emailData)}`;
        const to = getEmailSender(emailData);
        const bodyText = "Hello, \n\nThank you for trying to get hold of me. \n\nUnfortunately I am out of the office. I have access to my emails. If it is urgent, I will try and get back to you as soon as I can. \n\nBest wishes, \nShibasis"; 

        const rawEmail = createRawEmail(to, 'shibasisswarnakar@gmail.com', subject, bodyText,);
        await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: rawEmail,
                threadId:emailData.threadId
            }
        });
        
        console.log(`Reply sent to email: ${emailId}`);

    } catch (error) {
        console.error(`Error replying to email ${emailId}:`, error);
    }
}
/**
 * Extract the subject of an email.
 * @param {Object} emailData - The email data object.
 * @returns {string} - The subject of the email.
 */
function getEmailSubject(emailData) {
    const headers = emailData.payload.headers;
    const subjectHeader = headers.find(header => header.name === "Subject");
    return (subjectHeader && subjectHeader.value) || "";
}

/**
 * Extract the sender of an email.
 * @param {Object} emailData - The email data object.
 * @returns {string} - The sender of the email.
 */
function getEmailSender(emailData) {
    const headers = emailData.payload.headers;
    const fromHeader = headers.find(header => header.name === "From");
    return (fromHeader && fromHeader.value) || "";
}

/**
 * Construct a raw email for sending.
 * @param {string} to - The recipient.
 * @param {string} from - The sender.
 * @param {string} subject - The email subject.
 * @param {string} bodyText - The email body.
 * @returns {string} - The base64 encoded email string.
 */
function createRawEmail(to, from, subject, bodyText) {
    const email = `To: ${to}\nFrom: ${from}\nSubject: ${subject}\n\n${bodyText}`;
    return Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * Label an email as "AutoReplied".
 * @param {string} emailId - The ID of the email.
 */
async function labelEmail(emailId) {
    try {
    
        const labels = await gmail.users.labels.list({ userId: 'me' });
        let label = labels.data.labels.find(l => l.name === "AutoReplied");

        if (!label) {
            const createdLabel = await gmail.users.labels.create({
                userId: 'me',
                requestBody: {
                    name: "AutoReplied",
                    labelListVisibility: 'labelShow',
                    messageListVisibility: 'show'
                }
            });
            label = createdLabel.data;
        }

        await gmail.users.messages.modify({
            userId: 'me',
            id: emailId,
            requestBody: {
                addLabelIds: [label.id]
            }
        });
        console.log(`Label "${label.name}" added for email: ${emailId}`);
    } catch (error) {
        console.error(`Error labeling email ${emailId}:`, error);
    }
}



/**
 * Start the email checking loop.
 * @param {Object} tokens - The authentication tokens.
 */
function startApp(tokens) {
    
    //change the interval here to set it to 45 to 120 seconds
    if(!intervalId){
        try {
            intervalId = setInterval(async () => {
                await checkForNewEmails(tokens);
            }, randomInt(4, 6) * 1000); 
            
        } catch (error) {
            console.error('Error in the application loop:', error);
        }
    }
    
}

/**
 * Stop the email checking loop.
 */
function stopApp(){
    console.log(intervalId)
    if (intervalId) {
        console.log('stopping' + intervalId)
        clearInterval(intervalId);
        intervalId = null;
    }
}

module.exports = {
    startApp,
    stopApp,
    labelEmail,
    sendReply,
    checkForNewEmails
}
