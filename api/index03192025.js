const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const router = express.Router();


const app = express();
const port = 3000;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const jwt = require("jsonwebtoken");

mongoose
  .connect("mongodb+srv://ericdelacruzh:E8TG7z5r68mm0X8S@cluster0.yiyau.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

app.listen(port, () => {
  console.log("Server is running on port 3000");
});

const User = require("./models/user");
const Post = require("./models/post");
const PostJob = require("./models/postjob"); // Import PostJob model

// Endpoint to register a user in the backend
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, profileImage, userType } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email already registered");
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create a new User
    const newUser = new User({
      name,
      email,
      password,
      profileImage,
      userType,
    });

    // Generate the verification token
    newUser.verificationToken = crypto.randomBytes(20).toString("hex");

    // Save the user to the database
    await newUser.save();

    // Send the verification email to the registered user
    sendVerificationEmail(newUser.email, newUser.verificationToken);

    res.status(202).json({
      message: "Registration successful. Please check your mail for verification",
    });
  } catch (error) {
    console.log("Error registering user", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

//Send verification email via gmail SMTP
const sendVerificationEmail = async (email, verificationToken) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "aaimadein@gmail.com",
      pass: "lhihnowtyknczwck ",
    },
  });

  const mailOptions = {
    from: "aaimadein@gmail.com",
    to: email,
    subject: "Email Verification",
    text: `Please click the following link to verify your email: http://192.168.2.34:3000/verify/${verificationToken}`,
  };

  // Send the mail
  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully");
  } catch (error) {
    console.log("Error sending the verification email");
  }
};

// Endpoint to verify email
app.get("/verify/:token", async (req, res) => {
  try {
    const token = req.params.token;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(404).json({ message: "Invalid verification token" });
    }

    // Mark the user as verified
    user.verified = true;
    user.verificationToken = undefined;

    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Email verification failed" });
  }
});

const generateSecretKey = () => {
  const secretKey = crypto.randomBytes(32).toString("hex");
  return secretKey;
};

const secretKey = generateSecretKey();

// Endpoint to login a user
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if password is correct
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id, userType: user.userType, userName:user.name }, secretKey);

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

// GET User's profile
app.get("/profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user profile" });
  }
});

//GET users
app.get("/users/:userId", async (req, res) => {
  try {
    const loggedInUserId = req.params.userId;

    //fetch the logged-in user's connections
    const loggedInuser = await User.findById(loggedInUserId).populate(
      "connections",
      "_id"
    );
    if (!loggedInuser) {
      return res.status(400).json({ message: "User not found" });
    }

    //get the ID's of the connected users
    const connectedUserIds = loggedInuser.connections.map(
      (connection) => connection._id
    );

    //find the users who are not connected to the logged-in user Id
    const users = await User.find({
      _id: { $ne: loggedInUserId, $nin: connectedUserIds },
    });

    res.status(200).json(users);
  } catch (error) {
    console.log("Error retrieving users", error);
    res.status(500).json({ message: "Error retrieving users" });
  }
});


//POST job posts
app.post("/create-job", async (req, res) => {
  try {
    const { jobTitle, jobDescription, skills, salary, userId } = req.body;

    // Ensure that only companies can post jobs
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.userType !== 'company') {
      return res.status(403).json({ message: "Only companies can post jobs" });
    }

    const newJobPost = new PostJob({
      jobTitle,
      jobDescription,
      skills,
      salary,
      user,  ///// updated userid to user
      createdAt: Date.now(),
    });

    // Save the job post
    await newJobPost.save();

    res.status(201).json({
      message: "Job post created successfully",
      jobPost: newJobPost,
    });
  } catch (error) {
    console.log("Error creating job post", error);
    res.status(500).json({ message: "Error creating job post" });
  }
});


//get all jobs
app.get("/all-jobs", async (req, res) => {
  try {
    const { userId } = req.query; // Get userId from query params

    console.log("Fetching jobs for userId:", userId); // Log the userId

    let jobPosts;
    if (userId) {
      // Fetch jobs posted by a specific user (company) and populate user details
      jobPosts = await PostJob.find({ user: userId })
        .populate("user", "name profileImage") // Populate user details
        .sort({ createdAt: -1 });

      console.log("Jobs for company:", jobPosts); // Log the fetched jobs
    } else {
      // Fetch all jobs and populate user details
      jobPosts = await PostJob.find()
        .populate("user", "name profileImage") // Populate user details
        .sort({ createdAt: -1 });

      console.log("All jobs:", jobPosts); // Log all jobs
    }

    res.status(200).json({ jobPosts });
  } catch (error) {
    console.log("Error fetching all job posts", error);
    res.status(500).json({ message: "Error fetching all job posts" });
  }
});

//edit job-post
app.put("/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { jobTitle, jobDescription, skills, salary } = req.body;

    const updatedJob = await PostJob.findByIdAndUpdate(
      id,
      { jobTitle, jobDescription, skills, salary },
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ message: "Job post not found" });
    }

    res.status(200).json({ message: "Job post updated successfully", jobPost: updatedJob });
  } catch (error) {
    console.log("Error updating job post", error);
    res.status(500).json({ message: "Error updating job post" });
  }
});


//delete job-post
app.delete("/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedJob = await PostJob.findByIdAndDelete(id);

    if (!deletedJob) {
      return res.status(404).json({ message: "Job post not found" });
    }

    res.status(200).json({ message: "Job post deleted successfully" });
  } catch (error) {
    console.log("Error deleting job post", error);
    res.status(500).json({ message: "Error deleting job post" });
  }
});


//apply jobs
app.post("/jobs/:id/apply", async (req, res) => {
  try {
    const { id } = req.params; // Job ID
    const { userId } = req.body; // Applicant's user ID

    // Find the job post
    const jobPost = await PostJob.findById(id);
    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }

    // Check if the user has already applied
    if (jobPost.applicants.includes(userId)) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    // Add the applicant's user ID to the applicants array
    jobPost.applicants.push(userId);
    await jobPost.save();

    res.status(200).json({ message: "Application submitted successfully" });
  } catch (error) {
    console.log("Error applying for job", error);
    res.status(500).json({ message: "Error applying for job" });
  }
});

//fetch the list of applicants for a specific job post:
app.get("/jobs/:id/applicants", async (req, res) => {
  try {
    const { id } = req.params; // Job ID

    // Find the job post and populate the applicants field
    const jobPost = await PostJob.findById(id).populate("applicants", "name profileImage email");

    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }

    res.status(200).json({ applicants: jobPost.applicants });
  } catch (error) {
    console.log("Error fetching applicants", error);
    res.status(500).json({ message: "Error fetching applicants" });
  }
});

// Send a connection request
app.post("/connection-request", async (req, res) => {
  try {
    const { currentUserId, selectedUserId } = req.body;

    await User.findByIdAndUpdate(selectedUserId, {
      $push: { connectionRequests: currentUserId },
    });

    await User.findByIdAndUpdate(currentUserId, {
      $push: { sentConnectionRequests: selectedUserId },
    });

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: "Error creating connection request" });
  }
});

// Endpoint to show all the connection requests
app.get("/connection-request/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate("connectionRequests", "name email profileImage")
      .lean();

    const connectionRequests = user.connectionRequests;

    res.json(connectionRequests);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to accept a connection request
app.post("/connection-request/accept", async (req, res) => {
  try {
    const { senderId, recepientId } = req.body;

    const sender = await User.findById(senderId);
    const recepient = await User.findById(recepientId);

    sender.connections.push(recepientId);
    recepient.connections.push(senderId);

    recepient.connectionRequests = recepient.connectionRequests.filter(
      (request) => request.toString() !== senderId.toString()
    );

    sender.sentConnectionRequests = sender.sentConnectionRequests.filter(
      (request) => request.toString() !== recepientId.toString()
    );

    await sender.save();
    await recepient.save();

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to fetch all the connections of a user
app.get("/connections/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId)
      .populate("connections", "name profileImage createdAt")
      .exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ connections: user.connections });
  } catch (error) {
    console.log("Error fetching connections", error);
    res.status(500).json({ message: "Error fetching connections" });
  }
});

// Endpoint to create a post
app.post("/create", async (req, res) => {
  try {
    const { description, imageUrl, userId } = req.body;

    const newPost = new Post({
      description: description,
      imageUrl: imageUrl,
      user: userId,
    });

    await newPost.save();

    res.status(201).json({ message: "Post created successfully", post: newPost });
  } catch (error) {
    console.log("Error creating the post", error);
    res.status(500).json({ message: "Error creating the post" });
  }
});

// Endpoint to fetch all the posts
app.get("/all", async (req, res) => {
  try {
    const posts = await Post.find().populate("user", "name profileImage");

    res.status(200).json({ posts });
  } catch (error) {
    console.log("Error fetching all posts", error);
    res.status(500).json({ message: "Error fetching all posts" });
  }
});

app.listen(port, () => {
  console.log("Server is running on port 3000");
});


// Endpoint to fetch a specific job post by ID
app.get("/jobs/:id", async (req, res) => {
  try {
    const jobId = req.params.id;

    // Find the job post by ID and populate the user field
    const jobPost = await PostJob.findById(jobId).populate("user", "name profileImage");

    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }

    res.status(200).json({ jobPost });
  } catch (error) {
    console.log("Error fetching job post", error);
    res.status(500).json({ message: "Error fetching job post" });
  }
});

// User's profile update endpoint
app.put("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { userDescription, skills, workExperience, education, address, userType } = req.body;

    console.log("Received Payload:", JSON.stringify(req.body, null, 2)); // Log the received payload

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields based on userType
    if (user.userType === 'company') {
      // Only update userDescription and address for companies
      user.userDescription = userDescription || user.userDescription;
      if (address) {
        user.address = {
          street: address.street || user.address?.street,
          city: address.city || user.address?.city,
          state: address.state || user.address?.state,
          zipcode: address.zipcode || user.address?.zipcode,
          country: address.country || user.address?.country,
        };
      }
    } else if (user.userType === 'employee') {
      // Update all fields for employees
      user.userDescription = userDescription || user.userDescription;
      user.skills = skills || user.skills;

      // Update work experience with proper date formatting
      if (workExperience) {
        user.workExperience = workExperience.map((exp) => ({
          companyName: exp.companyName,
          jobTitle: exp.jobTitle,
          startDate: exp.startDate ? new Date(exp.startDate) : null,
          endDate: exp.endDate ? new Date(exp.endDate) : null,
          responsibilities: exp.responsibilities,
        }));
      }

      // Update education
      user.education = education || user.education;

      // Update address
      if (address) {
        user.address = {
          street: address.street || user.address?.street,
          city: address.city || user.address?.city,
          state: address.state || user.address?.state,
          zipcode: address.zipcode || user.address?.zipcode,
          country: address.country || user.address?.country,
        };
      }
    } else {
      return res.status(400).json({ message: "Invalid user type" });
    }

    await user.save();
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.log("Error updating user profile", error);
    res.status(500).json({ message: "Error updating user profile" });
  }
});



// Endpoint to check if a user has applied for a job
app.post("/jobs/:id/apply", async (req, res) => {
  try {
    const { id } = req.params; // Job ID
    const { userId } = req.body; // Applicant's user ID

    // Find the job post
    const jobPost = await PostJob.findById(id);
    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }

    // Check if the user has already applied
    if (jobPost.applicants.includes(userId)) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    // Add the applicant's user ID to the applicants array
    jobPost.applicants.push(userId);
    await jobPost.save();

    res.status(200).json({ message: "Application submitted successfully" });
  } catch (error) {
    console.log("Error applying for job", error);
    res.status(500).json({ message: "Error applying for job" });
  }
});


// Endpoint to fetch the logged-in user's connections
router.get("/users/:userId/connections", async (req, res) => {
  try {
    const loggedInUserId = req.params.userId;

    // Fetch the logged-in user's connections
    const loggedInUser = await User.findById(loggedInUserId).populate(
      "connections",
      "_id"
    );

    if (!loggedInUser) {
      return res.status(400).json({ message: "User not found" });
    }

    // Get the IDs of the connected users
    const connectedUserIds = loggedInUser.connections.map(
      (connection) => connection._id
    );

    // Return the connections array
    res.status(200).json({ connections: connectedUserIds });
  } catch (error) {
    console.log("Error retrieving user connections", error);
    res.status(500).json({ message: "Error retrieving user connections" });
  }
});



//notification email transporter 
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "aaimadein@gmail.com",
    pass: "lhihnowtyknczwck",
  },
});


// Function to send job application email
const sendJobApplicationEmail = async (to, applicantName, jobTitle) => {
  const mailOptions = {
    from: "aaimadein@gmail.com",
    to: to,
    subject: "New Job Application",
    text: `${applicantName} has applied for the job titled "${jobTitle}".`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Job application email sent successfully");
  } catch (error) {
    console.error("Error sending job application email:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

// Endpoint to handle email sending
router.post('/send-email', async (req, res) => {
  const { to, applicantName, jobTitle } = req.body;

  if (!to || !applicantName || !jobTitle) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const mailOptions = {
    from: "aaimadein@gmail.com",
    to: to,
    subject: "New Job Application",
    text: `${applicantName} has applied for the job titled "${jobTitle}".`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email", error: error.message });
  }
});




// Export the router
module.exports = router;
app.use(router);