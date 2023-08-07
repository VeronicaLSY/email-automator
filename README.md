# email-automator

Email Automator is a tool for automating email management tasks, such as auto-replying to specific emails and managing your inbox.

## Features

- Auto-reply to specific emails with customizable responses.
- Monitor and manage your inbox.

## Installation

1. Make sure you have Node.js installed on your machine.

2. Clone this repository.

3. Run `npm install`

## Configuration

1. Create a .env file in the project root directory.

2. Open the .env file and add the following configuration:
   ```bash
   YOUR_NAME="Your Name"
   GMAIL_USER="your.email@gmail.com"
   GMAIL_PASSWORD="your-generated-app-password"
   ```

   Note: To generate an app-specific password for your Gmail account, go to https://myaccount.google.com/apppasswords

3. Run `node index.js`.
