import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import axios from "axios";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const Index = () => {
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState();
  const [jobs, setJobs] = useState([]); // State to hold job posts
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  const router = useRouter();


    // Logout function
    const logout = async () => {
      await AsyncStorage.removeItem("authToken");
      router.replace("/(authenticate)/login");
    };

  // Fetch User
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const decodedToken = jwt_decode(token);
        const userId = decodedToken.userId;
        setUserId(userId);
      } catch (error) {
        console.log("Error fetching user", error);
      }
    };

    fetchUser();
  }, []);

  // Fetch User Profile
  useEffect(() => {
    if (userId) {
      const fetchUserProfile = async () => {
        try {
          const response = await axios.get(
            `http://192.168.2.34:3000/profile/${userId}`
          );
          const userData = response.data.user;
          setUser(userData);
        } catch (error) {
          console.log("Error fetching user profile", error);
        }
      };

      fetchUserProfile();
    }
  }, [userId]);

// Fetch Job Posts
useEffect(() => {
  const fetchAllJobs = async () => {
    try {
      let url = "http://192.168.2.34:3000/all-jobs";
      if (user?.userType === "company") {
        url += `?userId=${userId}`; // Add userId to the query if the user is a company
      }

      console.log("Fetching jobs from:", url); // Log the URL

      const response = await axios.get(url);
      console.log("Fetched jobs:", response.data); // Log the API response

      // Sort jobs by createdAt in descending order (newest first)
      const sortedJobs = response.data.jobPosts.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setJobs(sortedJobs); // Set sorted jobs
    } catch (error) {
      console.log("Error fetching job posts", error);
      setError("Failed to fetch jobs. Please try again later.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  fetchAllJobs();
}, [userId, user?.userType]); // Add dependencies

  // Filter jobs based on search query (job title or skills)
  const filteredJobs = jobs.filter((job) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      job.jobTitle.toLowerCase().includes(lowerCaseQuery) || // Check job title
      job.skills?.some((skill) =>
        skill.toLowerCase().includes(lowerCaseQuery) // Check skills
      )
    );
  });

  // Filter jobs for company user
  const companyJobs = user?.userType === "company" ? filteredJobs.filter(job => job.user._id === user._id) : filteredJobs;

  //delete function
  const handleDeleteJob = async (jobId) => {
    try {
      await axios.delete(`http://192.168.2.34:3000/jobs/${jobId}`);
      setJobs(jobs.filter((job) => job._id !== jobId)); // Remove the deleted job from the state
      Alert.alert("Success", "Job post deleted successfully");
    } catch (error) {
      console.log("Error deleting job post", error);
      Alert.alert("Error", "Failed to delete job post");
    }
  };
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0072b1" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/home/profile")}>
          <Image
            style={styles.profileImage}
            source={{ uri: user?.profileImage || "https://via.placeholder.com/150" }} // Fallback image
          />
        </Pressable>

        <Pressable style={styles.searchBar}>
          <AntDesign
            style={styles.searchIcon}
            name="search1"
            size={20}
            color="black"
          />
          <TextInput
            placeholder="Search by title or skills"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Pressable>
                <Pressable onPress={logout} style={{ flexDirection: "row", alignItems: "center" }}>
                  <AntDesign name="logout" size={22} color="black" />
                  <Text style={{ marginLeft: 5, fontSize: 16, fontWeight: "500", color: "black" }}>
                    Logout
                  </Text>
                </Pressable>
      </View>

      {/* Jobs List */}
      <View style={styles.jobsList}>
        {companyJobs?.map((item, index) => (
          <Pressable
            key={index}
            onPress={() => router.push(`/jobs/job-details/${item._id}`)}
          >
            <View style={styles.jobCard}>
              {/* Job Header (Profile Image & Job Title with Apply button) */}
              <View style={styles.jobHeader}>
                <View style={styles.jobUserInfo}>
                  <View style={styles.jobUserDetails}>
                    <Text style={styles.jobTitle}>{item?.jobTitle}</Text>
                  </View>
                </View>
                {user?.userType === "company" && (
                  <View style={styles.jobActions}>
                    <Pressable onPress={() => router.push(`/jobs/edit-job/${item._id}`)}>
                      <Text style={styles.editButton}>Edit</Text>
                    </Pressable>
                    <Pressable onPress={() => handleDeleteJob(item._id)}>
                      <Text style={styles.deleteButton}>Delete</Text>
                    </Pressable>
                  </View>
                )}
              </View>

              {/* Skills */}
              <View style={styles.skillsContainer}>
                <Text style={styles.skillsText}>Skills:
                  {item?.skills?.join(", ") || "No skills specified"}
                </Text>
              </View>

              {/* Salary */}
              {item?.salary && (
                <View style={styles.salaryContainer}>
                  <Text style={styles.salaryText}>Salary: ${item?.salary}</Text>
                </View>
              )}

              {/* Job Description */}
              <View style={styles.jobDescriptionContainer}>
                <Text 
                  style={styles.jobDescriptionText}
                  numberOfLines={4} // Limit to 4 lines
                >
                  Job Description: {item?.jobDescription || "No description available"}
                </Text>
                {/* Show "Read more" if the description is truncated */}
                {item?.jobDescription && item.jobDescription.split('\n').length > 4 && (
                  <Text style={styles.readMoreText}>Read more</Text>
                )}
              </View>

              {/* Divider */}
              <View style={styles.divider} />
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 5,
    height: 40,
    flex: 1,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  jobsList: {
    padding: 10,
  },
  jobCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  jobUserInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  jobUserImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  jobUserDetails: {
    marginLeft: 10,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: "bold",
    fontWeight: "600",
  },
  jobUserName: {
    color: "gray",
    fontSize: 14,
  },
  applyButton: {
    backgroundColor: "#0072b1",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  skillsContainer: {
    marginBottom: 10,
  },
  skillsText: {
    fontSize: 14,
    color: "gray",
  },
  salaryContainer: {
    marginBottom: 10,
  },
  salaryText: {
    fontSize: 15,
    fontWeight: "600",
  },
  jobDescriptionContainer: {
    marginBottom: 10,
  },
  jobDescriptionText: {
    fontSize: 15,
    lineHeight: 20,
  },
  readMoreText: {
    color: "#0072b1",
    marginTop: 5,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
  jobActions: {
    flexDirection: "row",
    gap: 10,
  },
  editButton: {
    color: "#0072b1",
    fontSize: 14,
  },
  deleteButton: {
    color: "red",
    fontSize: 14,
  },
});