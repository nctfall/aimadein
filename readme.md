# **Installation Guide: Node.js and Expo SDK 49**

This guide provides step-by-step instructions to install **Node.js**, the **Expo CLI**, and set up a project using **Expo SDK 49**.

## **Prerequisites**
Before you begin the installation process, make sure you have the following installed on your machine:
- A modern web browser (Chrome, Firefox, etc.)
- Administrative access to your machine

## **Step 1: Installing Node.js**

Node.js is required to run the Expo CLI and manage JavaScript dependencies.

### **1.1 Downloading Node.js**
1. Go to the [Node.js official website](https://nodejs.org/).
2. You will see two download options: **LTS (Long Term Support)** and **Current**. Choose the **LTS version** for stability.
3. Click the download button for your platform (Windows, macOS, or Linux).

### **1.2 Installing Node.js**
- **Windows:**
  - Run the installer `.msi` file after it’s downloaded.
  - Follow the prompts to install Node.js. Make sure to check the box that says “Add to PATH.”
  
- **macOS:**
  - Open the `.pkg` installer and follow the on-screen instructions.
  
- **Linux:**
  - For Linux-based systems, the installation can vary. Use the following commands for Ubuntu as an example:
    ```bash
    sudo apt update
    sudo apt install nodejs npm
    ```

### **1.3 Verifying the Installation**
After installing Node.js, you can verify that it is installed correctly by opening a terminal and running:
```bash
node -v
npm -v

npm install -g expo-cli
expo --version
expo init my-new-project
cd my-new-project
expo install expo@49
expo start

install dependencies
npm add axios
npm add moment
npm add firebase
npm add body-parser cors express jsonwebtoken mongoose multer nodemailer nodemon
npm install @react-native-firebase/app @react-native-firebase/storage
npx expo install expo-image-picker
npx expo install expo-file-system
npm install react-native-reanimated react-native-gesture-handler


Features
 - Login
 - Registration (choose company or employee profile)
 - HomePage 
        - contains the individual posts
        - option to update profile information
        - search function ( can search names)
- Network
        - will show list of people 
- Jobs        
        // for userType=employee
            - will list all the available job posted, sorted by newest created
            - ability to apply ( will send email notificaiton to company)
            - search functionality based on job name or skills
        // for userType=company
            - will only see the jobs they posted
            - ability to Edit job posts
            - ability to delete job posts
            - will see job details, and who had applied for the position
                -- will have the option to connect to applicants ( send connection request)    
                -- if applicant accepted the connection ( company can click send email to applicant )
- Post
        // for userType=employee
            - posts created by this user will be posted on the Home page as a community posts
        // for userType=company
            - posts created by this user will be added to the Jobs tab as a job posting


 ### **Maintenance Guildelines**
        Application is running the features intended for its purpose.
        - you can fork the repository to customize and optimize what best fit the Companies need


