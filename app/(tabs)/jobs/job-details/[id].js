import { useLocalSearchParams } from "expo-router";
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

const JobDetails = () => {
  const { id } = useLocalSearchParams(); // Get the job ID from the URL
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null); // State to store userType
  const [userId, setUserId] = useState(null); // State to store the logged-in user's ID
  const [applicants, setApplicants] = useState([]); // State to store applicants

  // Fetch logged-in user's details
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const decodedToken = jwt_decode(token);
          setUserType(decodedToken.userType); // Set the userType from the token
          setUserId(decodedToken.userId); // Set the userId from the token
        }
      } catch (error) {
        console.log("Error fetching user details", error);
      }
    };

    fetchUserDetails();
  }, []);

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await axios.get(`http://192.168.2.34:3000/jobs/${id}`);
        setJob(response.data.jobPost);
      } catch (error) {
        console.log("Error fetching job details", error);
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
          console.log("Applicants:", response.data.applicants); // Log the applicants
          setApplicants(response.data.applicants);
        } catch (error) {
          console.log("Error fetching applicants", error);
        }
      };
  
      fetchApplicants();
    }
  }, [userType, id]);

  // Handle Apply button click
  const handleApply = async () => {
    try {
      const response = await axios.post(`http://192.168.2.34:3000/jobs/${id}/apply`, {
        userId, // Send the logged-in user's ID
      });
      Alert.alert("Success", response.data.message); // Show success message
    } catch (error) {
      console.log("Error applying for job", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to apply for job");
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
    } catch (error) {
      console.log("Error sending connection request", error);
      Alert.alert("Error", "Failed to send connection request");
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
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply</Text>
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
          {applicants.map((applicant) => (
            <View key={applicant._id} style={styles.applicantCard}>
              <Image
                style={styles.applicantImage}
                source={{ uri: applicant.profileImage }}
              />
              <Text style={styles.applicantName}>{applicant.name}</Text>
              <TouchableOpacity
                style={styles.connectButton}
                onPress={() => handleConnect(applicant._id)}
              >
                <Text style={styles.connectButtonText}>Connect</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Apply Button at the End */}
      {userType === "employee" && ( // Conditionally render Apply button
        <TouchableOpacity style={styles.bottomApplyButton} onPress={handleApply}>
          <Text style={styles.bottomApplyButtonText}>Apply Now</Text>
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