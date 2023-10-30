### OpeningApp-Assessment
An automated solution to respond to incoming Gmail messages when you're away. Built using Node.js, Express, and the Gmail API, this app provides a dashboard to toggle the autoresponder service, ensuring timely responses without manual intervention. Integrated with OAuth2 for secure Gmail authentication. 📧🤖🛠.

## Libraries and Technologies Specification

Below is a detailed specification of the libraries and technologies used in the project:

- **dotenv (^16.3.1)**:
  - `dotenv` is a zero-dependency module that loads environment variables from a `.env` file into `process.env`. It's beneficial in separating configurations from the codebase, thereby making the app more secure and easily configurable.

- **ejs (^3.1.9)**:
  - `ejs` stands for "Embedded JavaScript Templates." It's a templating engine that lets developers generate HTML markup with plain JavaScript. We use it for rendering dynamic content on the front-end.

- **express (^4.18.2)**:
  - `express` is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications. It simplifies the development of web servers.

- **express-session (^1.17.3)**:
  - `express-session` is a middleware for Express applications that allows us to manage sessions. It's instrumental in persisting user data across requests, such as authentication tokens in our use case.

- **googleapis (^128.0.0)**:
  - `googleapis` is Google's officially supported Node.js client library for accessing Google APIs. We use it to interact with the Gmail API for automating email functionalities.

- **nodemon (^3.0.1)**:
  - `nodemon` is a utility that monitors for any changes in the Node.js application and automatically restarts the server. It's particularly useful during the development phase, reducing the need for manual server restarts.

---

## Gmail Autoresponder App

This application automatically responds to incoming Gmail messages with a predefined message. Once authenticated, it periodically checks for new emails and sends auto-responses.

### Setup and Installation

1. **Clone the Repository**: 
   ```
   git clone (https://github.com/itsBURO/OpeningApp-Assessment
   cd OpeningApp-Assessment
   ```

2. **Install Dependencies**:
   ```
   npm install
   ```

3. **Setup Environment Variables**:
   Create a `.env` file in the root of the project. Add the following variables:
   ```
   CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
   CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
   SECRET = YOUR_SECRET_TOKEN_FOR_EXPRESS_SESSION
   REDIRECT_URL = https://developers.google.com/oauthplayground
   ACCESS_TOKEN = YOUR_ACCESS_TOKEN
   REFRESH_TOKEN = YOUR_REFRESH_TOKEN
   SECRET=YOUR_EXPRESS_SESSION_SECRET
   PORT=3000
   ```

4. **Start the Application**:
   - For development:
     ```
     nodemon app.js
     ```
   - For production:
     ```
     node app.js
     ```

5. Open a browser and navigate to `http://localhost:3000/dashboard` to start the authentication process and use the application.

### Usage

1. Authenticate with your Gmail account.
2. Navigate to the dashboard to see the service status.
3. You can start or stop the Gmail auto-responder service from the dashboard.

### Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page for open tasks.

### License

This project is [MIT](LICENSE) licensed.

---

*For further information or queries, please reach out or open an issue.*
