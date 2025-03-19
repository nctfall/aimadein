import { useLocalSearchParams, useRouter } from "expo-router"; // Import useRouter
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import { Feather } from "@expo/vector-icons";
import * as MailComposer from 'expo-mail-composer'; // Import MailComposer

const JobDetails = () => {
  const { id } = useLocalSearchParams(); // Get the job ID from the URL
  const router = useRouter(); // Initialize the router
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null); // State to store userType
  const [userId, setUserId] = useState(null); // State to store the logged-in user's ID
  const [applicants, setApplicants] = useState([]); // State to store applicants
  const [hasApplied, setHasApplied] = useState(false); // State to track if user has applied
  const [connections, setConnections] = useState([]); // State to store connections (initialized as an empty array)

  // Fetch logged-in user's details and connections
  useEffect(() => {
    const fetchUserDetailsAndConnections = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const decodedToken = jwt_decode(token);
          setUserType(decodedToken.userType); // Set the userType from the token
          setUserId(decodedToken.userId); // Set the userId from the token
  
          // Fetch the logged-in user's connections
          const response = await axios.get(`http://192.168.2.34:3000/users/${decodedToken.userId}/connections`);
          console.log("Connections:", response.data.connections); // Log the connections
          setConnections(response.data.connections || []); // Ensure connections is an array
        }
      } catch (error) {
        console.log("Error fetching user details or connections", error);
        Alert.alert("Error", "Failed to fetch connections. Please try again later.");
      }
    };
  
    fetchUserDetailsAndConnections();
  }, []);

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await axios.get(`http://192.168.2.34:3000/jobs/${id}`);
        setJob(response.data.jobPost);
      } catch (error) {
        console.log("Error fetching job details", error);
        Alert.alert("Error", "Failed to fetch job details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  // Fetch applicants if the user is a company
  useEffect(() => {
    if (userType === "company") {
      const fetchApplicants = async () => {
        try {
          const response = await axios.get(`http://192.168.2.34:3000/jobs/${id}/applicants`);
          setApplicants(response.data.applicants);
        } catch (error) {
          console.log("Error fetching applicants", error);
          Alert.alert("Error", "Failed to fetch applicants. Please try again later.");
        }
      };

      fetchApplicants();
    }
  }, [userType, id]);

  // Check if the user has applied
  useEffect(() => {
    if (userType === "employee" && job?.applicants) {
      const userApplied = job.applicants.includes(userId); // Check if userId is in the applicants array
      setHasApplied(userApplied);
    }
  }, [job, userId, userType]);

  // Handle Apply button click
  const handleApply = async () => {
    if (hasApplied) {
      Alert.alert("Error", "You have already applied for this job");
      return;
    }

    try {
      // Apply for the job
      const applyResponse = await axios.post(`http://192.168.2.34:3000/jobs/${id}/apply`, {
        userId,
      });
      setHasApplied(true);
      Alert.alert("Success", applyResponse.data.message);
  
      // Fetch applicant details (logged-in user)
      const applicantResponse = await axios.get(`http://192.168.2.34:3000/users/${userId}`);
      console.log("Applicant Response:", applicantResponse.data);
      const applicantName = applicantResponse.data.name; // Extract the applicant's name
  
      // Fetch job details to get the job poster's ObjectId
      const jobResponse = await axios.get(`http://192.168.2.34:3000/jobs/${id}`);
      console.log("Job Response:", jobResponse.data);
      const jobTitle = jobResponse.data.jobPost.jobTitle;
      const jobPosterId = jobResponse.data.jobPost.user._id; // Extract the job poster's ID
  
      // Fetch job poster's details to get their email
      const jobPosterResponse = await axios.get(`http://192.168.2.34:3000/user-details/${jobPosterId}`); // Use the new endpoint
      console.log("Job Poster Response:", jobPosterResponse.data);
      const jobPosterEmail = jobPosterResponse.data.email; // Extract the job poster's email
  
      // Log the extracted data
      console.log("Extracted Data:", {
        applicantName,
        jobTitle,
        jobPosterEmail,
      });
  
      // Check for missing data
      if (!applicantName || !jobPosterEmail || !jobTitle) {
        Alert.alert("Error", "Missing required data. Please try again later.");
        return;
      }
  
      // Send email notification
      await axios.post(`http://192.168.2.34:3000/send-email`, {
        to: jobPosterEmail,
        applicantName: applicantName,
        jobTitle: jobTitle,
      });
      console.log("Email notification sent successfully");
    } catch (error) {
      console.error("Error applying for job or sending email:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to apply for job or send email notification");
    }
  };

  // Handle Connect button click
  const handleConnect = async (applicantId) => {
    try {
      const response = await axios.post("http://192.168.2.34:3000/connection-request", {
        currentUserId: userId, // Logged-in user (company)
        selectedUserId: applicantId, // Applicant to connect with
      });
      Alert.alert("Success", "Connection request sent successfully");

      // Update the connections state to reflect the new connection
      setConnections((prevConnections) => [...prevConnections, applicantId]);
    } catch (error) {
      console.log("Error sending connection request", error);
      Alert.alert("Error", "Failed to send connection request");
    }
  };

  // Handle clicking on an applicant to view their profile
  const handleApplicantPress = (applicantId) => {
    router.push(`/jobs/profile-id/${applicantId}`); // Navigate to the applicant's profile page
  };

  // Handle sending email to a connected user
  const handleSendEmail = async (email) => {
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (isAvailable) {
        await MailComposer.composeAsync({
          recipients: [email], // Pre-fill the recipient's email address
          subject: 'Regarding Job Application', // Pre-fill the subject
          body: 'Hello,', // Pre-fill the body
        });
      } else {
        Alert.alert("Error", "Email services are not available on this device.");
      }
    } catch (error) {
      console.log("Error sending email", error);
      Alert.alert("Error", "Failed to send email. Please try again later.");
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
  }

  if (!job) {
    return <Text style={styles.notFound}>Job not found</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header with Apply Button */}
      <View style={styles.header}>
        <Text style={styles.title}>{job.jobTitle}</Text>
        {userType === "employee" && ( // Conditionally render Apply button
          <TouchableOpacity
            style={[
              styles.applyButton,
              hasApplied && styles.appliedButton, // Apply different style if user has applied
            ]}
            onPress={handleApply}
            disabled={hasApplied} // Disable the button if user has applied
          >
            <Text style={styles.applyButtonText}>
              {hasApplied ? "Applied" : "Apply"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Posted By */}
      <View style={styles.postedByContainer}>
        <Image
          style={styles.profileImage}
          source={{ uri: job.user.profileImage }}
        />
        <Text style={styles.postedBy}>Posted by: {job.user.name}</Text>
      </View>

      {/* Separator */}
      <View style={styles.separator} />

      {/* Salary */}
      {job.salary && (
        <Text style={styles.salary}>Salary: ${job.salary}</Text>
      )}

      {/* Skills */}
      <Text style={styles.sectionHeading}>Skills Required</Text>
      <View style={styles.skillsContainer}>
        {job.skills.map((skill, index) => (
          <View key={index} style={styles.skillPill}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
      </View>

      {/* Job Description */}
      <Text style={styles.sectionHeading}>Job Description</Text>
      <Text style={styles.description}>{job.jobDescription}</Text>

      {/* Applicants Section (Visible only to company) */}
      {userType === "company" && (
        <View style={styles.applicantsContainer}>
          <Text style={styles.sectionHeading}>
            Applicants: {applicants.length}
          </Text>
          {applicants.map((applicant) => {
            // Ensure connections is an array before calling .some()
            const isConnected = Array.isArray(connections) && connections.some((conn) => conn.toString() === applicant._id.toString());
            return (
              <TouchableOpacity
                key={applicant._id}
                style={styles.applicantCard}
                onPress={() => handleApplicantPress(applicant._id)} // Navigate to applicant's profile
              >
                <Image
                  style={styles.applicantImage}
                  source={{ uri: applicant.profileImage }}
                />
                <Text style={styles.applicantName}>{applicant.name}</Text>
                {isConnected ? ( // Check if applicant is already connected
                  <TouchableOpacity
                    style={styles.mailButton}
                    onPress={() => handleSendEmail(applicant.email)} // Open email client
                  >
                    <Feather name="mail" size={24} color="#007AFF" />
                    <Text style={styles.connectedText}>Send Email</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.connectButton}
                    onPress={() => handleConnect(applicant._id)}
                  >
                    <Text style={styles.connectButtonText}>Connect</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Apply Button at the End */}
      {userType === "employee" && ( // Conditionally render Apply button
        <TouchableOpacity
          style={[
            styles.bottomApplyButton,
            hasApplied && styles.appliedButton, // Apply different style if user has applied
          ]}
          onPress={handleApply}
          disabled={hasApplied} // Disable the button if user has applied
        >
          <Text style={styles.bottomApplyButtonText}>
            {hasApplied ? "Applied" : "Apply Now"}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notFound: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "red",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  applyButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  appliedButton: {
    backgroundColor: "#CCCCCC", // Grayed out color
  },
  applyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  postedByContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postedBy: {
    fontSize: 16,
    color: "gray",
  },
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginBottom: 20,
  },
  salary: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  skillPill: {
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    marginBottom: 10,
  },
  skillText: {
    fontSize: 14,
    color: "#000",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 20,
  },
  applicantsContainer: {
    marginBottom: 20,
  },
  applicantCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  applicantImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  applicantName: {
    fontSize: 16,
    flex: 1,
  },
  connectButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  connectButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  mailButton: {
    flexDirection: "row", // Ensure icon and text are in the same line
    alignItems: "center", // Vertically align icon and text
    paddingHorizontal: 10, // Add some padding for better spacing
    paddingVertical: 5, // Add some padding for better spacing
    borderRadius: 5, // Optional: Add rounded corners
    backgroundColor: "#F0F0F0", // Optional: Add a light background color
  },
  connectedText: {
    color: "#666666", // Gray text color
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8, // Add some spacing between the icon and text
  },

  bottomApplyButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  bottomApplyButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default JobDetails;