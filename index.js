
// Importing required modules
const dotenv = require('dotenv')
dotenv.config()
const ejs = require('ejs');
const express = require('express');
const session = require('express-session');
const {google} = require('googleapis');
const {startApp,stopApp} = require('./gmailAPI')

// Creating an express application 
const app = express();


// Define Gmail scopes and OAuth2 settings
const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL ='http://localhost:3000/oauth2callback';

let serviceActive = false;


// Configure Express app settings
app.set('view engine', 'ejs');
app.use(express.static('public'));  
app.use(session({ secret: process.env.SECRET, resave: false, saveUninitialized: false }));


// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

// Endpoint to redirect the user to Google OAuth2 consent page
app.get('/auth', (_, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    res.redirect(url);
});

// Callback endpoint to handle OAuth2 code and get access tokens
app.get('/oauth2callback', async (req, res) => {
    const { code } = req.query;
    const { tokens } =await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    req.session.tokens = tokens;

    res.redirect('/dashboard');
});


// Endpoint to start the Gmail service
app.get('/startService', (req, res) => {
    if (req.session.tokens) { 
        startApp(req.session.tokens)
        serviceActive = true;
        res.redirect('/dashboard');
    } else {

        res.redirect("/auth");
    }
});


// Endpoint to stop the Gmail service
app.get('/stopService', (req, res) => {
    if (req.session.tokens) { 
        stopApp()
        serviceActive = false;
        res.redirect('/dashboard');
    } else {

        res.redirect("/auth");
    }
});


// Dashboard endpoint, showing the status of the Gmail service
app.get('/dashboard', (req, res) => {
    if (!req.session.tokens) {
        return res.redirect('/auth');
    }
    oauth2Client.setCredentials(req.session.tokens);
    res.render('index.ejs',{serviceActive});

});


app.listen(process.env.PORT, () => {
    console.log(`Server started on http://localhost:${process.env.PORT}`);
});
