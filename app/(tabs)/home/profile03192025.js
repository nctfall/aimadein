import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import { Ionicons, AntDesign } from "@expo/vector-icons";

// Format date function to display month name
const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long", // 'long' for full month name (e.g., "January")
    day: "2-digit",
  });
};

const Profile = () => {
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(""); // Add userType to state
  const router = useRouter();
  const [userDescription, setUserDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [workExperience, setWorkExperience] = useState([]);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
  });
  const [education, setEducation] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem("authToken");
      const decodedToken = jwt_decode(token);
      const userId = decodedToken.userId;
      setUserId(userId);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(
        `http://192.168.2.34:3000/profile/${userId}`
      );
      const userData = response.data.user;
      setUser(userData);
      setUserType(userData.userType); // Set userType from the fetched data
      setSkills(userData.skills?.join(", ") || "");
      setWorkExperience(userData.workExperience?.map(work => ({
        ...work,
        startDate: work.startDate ? new Date(work.startDate).toISOString().slice(0, 10) : "",
        endDate: work.endDate ? new Date(work.endDate).toISOString().slice(0, 10) : ""
      })) || []);
      setAddress(userData.address || {
        street: "",
        city: "",
        state: "",
        country: "",
      });
      setEducation(userData.education?.map(education => ({
        ...education,
        yearOfGraduation: education.yearOfGraduation?.toString() || ""
      })) || []);
      setUserDescription(userData.userDescription || "");
    } catch (error) {
      console.log("Error fetching user profile", error);
      Alert.alert("Error", "Failed to fetch user profile. Please try again.");
    }
  };

  const handleSaveDescription = async () => {
    try {
      const payload = {
        userDescription,
        skills: skills.split(",").map((skill) => skill.trim()),
        workExperience,
        address,
        education: education.map(item => ({
          ...item,
          yearOfGraduation: item.yearOfGraduation ? parseInt(item.yearOfGraduation, 10) : null,
        })),
      };

      const response = await axios.put(
        `http://192.168.2.34:3000/profile/${userId}`,
        payload
      );

      if (response.status === 200) {
        await fetchUserProfile();
        setIsEditing(false);
        Alert.alert("Success", "Profile updated successfully!");
      }
    } catch (error) {
      console.log("Error saving user description", error);
      Alert.alert("Error", "Failed to save profile. Please try again.");
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("authToken");
    router.replace("/(authenticate)/login");
  };

  const addWorkExperience = () => {
    setWorkExperience([...workExperience, { companyName: "", jobTitle: "", startDate: "", endDate: "", responsibilities: "" }]);
  };

  const addEducation = () => {
    setEducation([...education, { degree: "", institution: "", yearOfGraduation: "", fieldOfStudy: "" }]);
  };

  const handleWorkExperienceChange = (index, field, value) => {
    const newWorkExperience = [...workExperience];
    newWorkExperience[index][field] = value;
    setWorkExperience(newWorkExperience);
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...education];
    newEducation[index][field] = value;
    setEducation(newEducation);
  };

  const handleAddressChange = (field, value) => {
    setAddress({ ...address, [field]: value });
  };

  if (!user) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/home");
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerTitle}>        </Text>
      </View>

      {/* Profile Picture */}
      <View style={styles.profileHeader}>
        <Image
          style={styles.profilePic}
          source={{ uri: user?.profileImage }}
        />
      </View>

      {/* User Details */}
      <View style={styles.profileDetails}>
        <Text style={styles.name}>{user?.name}</Text>
        <Pressable onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
          <Text style={styles.editButtonText}>{user?.userDescription ? "Edit Profile" : "Add Bio"}</Text>
        </Pressable>

        {/* Bio and Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {userType === "company" ? "About Company" : "About Me"}
          </Text>
          {isEditing ? (
            <TextInput
              style={styles.inputField}
              placeholder={userType === "company" ? "Enter company description" : "Enter your description"}
              value={userDescription}
              onChangeText={(text) => setUserDescription(text)}
              multiline
            />
          ) : (
            <Text style={styles.bioText}>{user?.userDescription || "No description provided."}</Text>
          )}
        </View>

        {userType === "employee" && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>
              {isEditing ? (
                <TextInput
                  style={styles.inputField}
                  placeholder="Enter your skills (comma separated)"
                  value={skills}
                  onChangeText={(text) => setSkills(text)}
                />
              ) : (
                <Text style={styles.skillsText}>{skills || "No skills added."}</Text>
              )}
            </View>

            {/* Work Experience */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Work Experience</Text>
              {workExperience.map((item, index) => (
                <View key={index} style={styles.card}>
                  {isEditing ? (
                    <>
                      <TextInput
                        style={styles.inputField}
                        placeholder="Company Name"
                        value={item.companyName}
                        onChangeText={(text) => handleWorkExperienceChange(index, "companyName", text)}
                      />
                      <TextInput
                        style={styles.inputField}
                        placeholder="Job Title"
                        value={item.jobTitle}
                        onChangeText={(text) => handleWorkExperienceChange(index, "jobTitle", text)}
                      />
                      <TextInput
                        style={styles.inputField}
                        placeholder="Start Date (yyyy-mm-dd)"
                        value={item.startDate}
                        onChangeText={(text) => handleWorkExperienceChange(index, "startDate", text)}
                      />
                      <TextInput
                        style={styles.inputField}
                        placeholder="End Date (yyyy-mm-dd)"
                        value={item.endDate}
                        onChangeText={(text) => handleWorkExperienceChange(index, "endDate", text)}
                      />
                      <TextInput
                        style={styles.inputField}
                        placeholder="Responsibilities"
                        value={item.responsibilities}
                        onChangeText={(text) => handleWorkExperienceChange(index, "responsibilities", text)}
                        multiline
                      />
                    </>
                  ) : (
                    <>
                      <Text style={styles.cardTitle}>{item.companyName}</Text>
                      <Text style={styles.cardSubtitle}>{item.jobTitle}</Text>
                      <Text style={styles.cardText}>
                        {formatDate(item.startDate)} - {formatDate(item.endDate)}
                      </Text>
                      <Text style={styles.cardText}>{item.responsibilities}</Text>
                    </>
                  )}
                </View>
              ))}
              {isEditing && (
                <TouchableOpacity style={styles.addButton} onPress={addWorkExperience}>
                  <Text style={styles.addButtonText}>+ Add Work Experience</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Education */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
              {education.map((item, index) => (
                <View key={index} style={styles.card}>
                  {isEditing ? (
                    <>
                      <TextInput
                        style={styles.inputField}
                        placeholder="Degree"
                        value={item.degree}
                        onChangeText={(text) => handleEducationChange(index, "degree", text)}
                      />
                      <TextInput
                        style={styles.inputField}
                        placeholder="Institution"
                        value={item.institution}
                        onChangeText={(text) => handleEducationChange(index, "institution", text)}
                      />
                      <TextInput
                        style={styles.inputField}
                        placeholder="Year of Graduation"
                        value={item.yearOfGraduation}
                        onChangeText={(text) => handleEducationChange(index, "yearOfGraduation", text)}
                      />
                      <TextInput
                        style={styles.inputField}
                        placeholder="Field of Study"
                        value={item.fieldOfStudy}
                        onChangeText={(text) => handleEducationChange(index, "fieldOfStudy", text)}
                      />
                    </>
                  ) : (
                    <>
                      <Text style={styles.cardTitle}>{item.degree}</Text>
                      <Text style={styles.cardSubtitle}>{item.institution}</Text>
                      <Text style={styles.cardText}>Graduated: {item.yearOfGraduation}</Text>
                      <Text style={styles.cardText}>Field: {item.fieldOfStudy}</Text>
                    </>
                  )}
                </View>
              ))}
              {isEditing && (
                <TouchableOpacity style={styles.addButton} onPress={addEducation}>
                  <Text style={styles.addButtonText}>+ Add Education</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          {isEditing ? (
            <>
              <TextInput
                style={styles.inputField}
                placeholder="Street"
                value={address.street}
                onChangeText={(text) => handleAddressChange("street", text)}
              />
              <TextInput
                style={styles.inputField}
                placeholder="City"
                value={address.city}
                onChangeText={(text) => handleAddressChange("city", text)}
              />
              <TextInput
                style={styles.inputField}
                placeholder="State"
                value={address.state}
                onChangeText={(text) => handleAddressChange("state", text)}
              />
              <TextInput
                style={styles.inputField}
                placeholder="Country"
                value={address.country}
                onChangeText={(text) => handleAddressChange("country", text)}
              />
            </>
          ) : (
            <Text style={styles.cardText}>
              {address.street}, {address.city}, {address.state}, {address.country}
            </Text>
          )}
        </View>

        {/* Save Button */}
        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveDescription}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileDetails: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  editButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  bioText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  skillsText: {
    fontSize: 16,
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  cardText: {
    fontSize: 14,
    color: "#666",
  },
  inputField: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  addButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#28A745",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Profile;