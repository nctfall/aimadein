import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
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
  const [jobDescriptionHeight, setJobDescriptionHeight] = useState(100); // Initial height for Job Description input

  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await axios.get(`http://192.168.2.34:3000/job/${id}`);
        setJob(response.data.jobPost);
        setJobTitle(response.data.jobPost.jobTitle);
        setJobDescription(response.data.jobPost.jobDescription);
        setSkills(response.data.jobPost.skills.join(", "));
        setSalary(response.data.jobPost.salary.toString());
      } catch (error) {
        console.log("Error fetching job details", error);
        setError("Failed to fetch job details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

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

  // Adjust Job Description input height based on content
  const handleContentSizeChange = (event) => {
    const { height } = event.nativeEvent.contentSize;
    setJobDescriptionHeight(Math.max(100, height)); // Ensure a minimum height of 100
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjust behavior based on platform
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // Adjust offset if needed
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled" // Handle taps outside the keyboard
      >
        <Text style={styles.title}>Edit Job Post</Text>
        <Text>Job Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Job Title"
          value={jobTitle}
          onChangeText={setJobTitle}
        />
        <Text>Salary</Text>
        <TextInput
          style={styles.input}
          placeholder="Salary"
          value={salary}
          onChangeText={setSalary}
          keyboardType="numeric"
        />
        <Text>Required skills (comma separated)</Text>
        <TextInput
          style={styles.input}
          placeholder="Skills (comma-separated)"
          value={skills}
          onChangeText={setSkills}
        />
        <Text>Job Description</Text>
        <TextInput
          style={[styles.input, { height: jobDescriptionHeight }]} // Dynamic height for Job Description
          placeholder="Job Description"
          value={jobDescription}
          onChangeText={setJobDescription}
          multiline
          onContentSizeChange={handleContentSizeChange} // Adjust height based on content
          textAlignVertical="top" // Align text to the top
        />
        <Pressable style={styles.button} onPress={handleUpdateJob}>
          <Text style={styles.buttonText}>Update Job</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100, // Add extra padding at the bottom to ensure content is scrollable
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