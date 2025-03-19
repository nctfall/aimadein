import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";

const EditJob = () => {
  const { id } = useLocalSearchParams(); // Get the job ID from the URL
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [salary, setSalary] = useState("");
  const [hasApplied, setHasApplied] = useState(false); // State to track if the user has applied
  const [userId, setUserId] = useState("your-user-id"); // Replace with actual user ID

  // Fetch job details and check if the user has applied
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await axios.get(`http://192.168.2.34:3000/job/${id}`);
        setJob(response.data.jobPost);
        setJobTitle(response.data.jobPost.jobTitle);
        setJobDescription(response.data.jobPost.jobDescription);
        setSkills(response.data.jobPost.skills.join(", "));
        setSalary(response.data.jobPost.salary.toString());

        // Check if the user has applied for the job
        const applicationStatus = await axios.get(`http://192.168.2.34:3000/job/${id}/apply/status`, {
          params: { userId },
        });
        setHasApplied(applicationStatus.data.hasApplied);
      } catch (error) {
        console.log("Error fetching job details", error);
        setError("Failed to fetch job details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id, userId]);

  // Handle job update
  const handleUpdateJob = async () => {
    try {
      const updatedJob = {
        jobTitle,
        jobDescription,
        skills: skills.split(",").map((skill) => skill.trim()),
        salary: parseFloat(salary),
      };

      await axios.put(`http://192.168.2.34:3000/jobs/${id}`, updatedJob);
      Alert.alert("Success", "Job post updated successfully");
      router.back(); // Go back to the previous screen
    } catch (error) {
      console.log("Error updating job post", error);
      Alert.alert("Error", "Failed to update job post");
    }
  };

  // Handle job application
  const handleApply = async () => {
    try {
      await axios.post(`http://192.168.2.34:3000/job/${id}/apply`, { userId });
      setHasApplied(true); // Update the state to reflect that the user has applied
      Alert.alert("Success", "You have successfully applied for this job");
    } catch (error) {
      console.log("Error applying for job", error);
      Alert.alert("Error", "Failed to apply for the job");
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
    <View style={styles.container}>
      <Text style={styles.title}>Edit Job Post</Text>
      <TextInput
        style={styles.input}
        placeholder="Job Title"
        value={jobTitle}
        onChangeText={setJobTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Job Description"
        value={jobDescription}
        onChangeText={setJobDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Skills (comma-separated)"
        value={skills}
        onChangeText={setSkills}
      />
      <TextInput
        style={styles.input}
        placeholder="Salary"
        value={salary}
        onChangeText={setSalary}
        keyboardType="numeric"
      />
      <Pressable style={styles.button} onPress={handleUpdateJob}>
        <Text style={styles.buttonText}>Update Job</Text>
      </Pressable>
      <Pressable
        style={[styles.button, hasApplied && styles.disabledButton]}
        onPress={handleApply}
        disabled={hasApplied}
      >
        <Text style={styles.buttonText}>{hasApplied ? "Applied" : "Apply"}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#0072b1",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
});

export default EditJob;