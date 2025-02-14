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
      setSkills(userData.skills?.join(", ") || "");
      setWorkExperience(userData.workExperience || []);
      setAddress(userData.address || {
        street: "",
        city: "",
        state: "",
        country: "",
      });
      setEducation(userData.education || []);
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
        education,
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
    <ScrollView style={{ flex: 1, backgroundColor: "#F8F8F8" }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.profilePicWrapper}>
            <Image style={styles.profilePic} source={{ uri: user?.profilePic }} />
          </Pressable>

          <View style={styles.searchBar}>
            <AntDesign name="search1" size={20} color="gray" />
            <TextInput style={styles.searchInput} placeholder="Search" />
          </View>

          <Ionicons name="chatbox-ellipses-outline" size={24} color="black" />
        </View>

        <Image
          style={styles.coverImage}
          source={{
            uri: "https://media.istockphoto.com/id/937025430/photo/abstract-defocused-blue-soft-background.jpg?b=1&s=612x612&w=0&k=20&c=FwJnRNxkX_lZKImOoJbo5VsgZPCMNiODdsRsggJqejA=",
          }}
        />

        <View style={styles.profileDetails}>
          <Text style={styles.name}>{user?.name}</Text>
          <Pressable onPress={() => setIsEditing(!isEditing)}>
            <Text style={styles.editText}>{user?.userDescription ? "Edit" : "Add Bio"}</Text>
          </Pressable>

          <View style={styles.bioContainer}>
            {isEditing ? (
              <>
                <TextInput
                  style={styles.inputField}
                  placeholder="Enter your description"
                  value={userDescription}
                  onChangeText={(text) => setUserDescription(text)}
                />
                <TextInput
                  style={styles.inputField}
                  placeholder="Enter your skills (comma separated)"
                  value={skills}
                  onChangeText={(text) => setSkills(text)}
                />
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Work Experience:</Text>
                  {workExperience.map((item, index) => (
                    <View key={index}>
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
                        value={item.startDate?.toString()} // Convert to string
                        onChangeText={(text) => handleWorkExperienceChange(index, "startDate", text)}
                      />
                      <TextInput
                        style={styles.inputField}
                        placeholder="End Date (yyyy-mm-dd)"
                        value={item.endDate?.toString()} // Convert to string
                        onChangeText={(text) => handleWorkExperienceChange(index, "endDate", text)}
                      />
                      <TextInput
                        style={styles.inputField}
                        placeholder="Responsibilities"
                        value={item.responsibilities}
                        onChangeText={(text) => handleWorkExperienceChange(index, "responsibilities", text)}
                      />
                    </View>
                  ))}
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={addWorkExperience}
                  >
                    <Text style={styles.addButtonText}>+ Add Work Experience</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Education:</Text>
                  {education.map((item, index) => (
                    <View key={index}>
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
                        value={item.yearOfGraduation?.toString()} // Convert to string
                        onChangeText={(text) => handleEducationChange(index, "yearOfGraduation", text)}
                      />
                      <TextInput
                        style={styles.inputField}
                        placeholder="Field of Study"
                        value={item.fieldOfStudy}
                        onChangeText={(text) => handleEducationChange(index, "fieldOfStudy", text)}
                      />
                    </View>
                  ))}
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={addEducation}
                  >
                    <Text style={styles.addButtonText}>+ Add Education</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Address:</Text>
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
                </View>

                <Pressable onPress={handleSaveDescription}>
                  <Text style={styles.saveButton}>Save</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.bioText}>{userDescription}</Text>
                <Text style={styles.skillsText}>{skills}</Text>
              </>
            )}
          </View>
        </View>

        <Pressable onPress={logout}>
          <Text style={styles.logoutButton}>Logout</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  profilePicWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#ccc",
  },
  profilePic: {
    width: "100%",
    height: "100%",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: "60%",
  },
  searchInput: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
  },
  coverImage: {
    width: "100%",
    height: 150,
  },
  profileDetails: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 10,
    marginTop: -30,
    elevation: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  editText: {
    color: "blue",
    marginTop: 5,
    fontSize: 14,
  },
  bioContainer: {
    marginTop: 15,
  },
  inputField: {
    backgroundColor: "#f1f1f1",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginVertical: 5,
    fontSize: 16,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#0066cc",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    padding: 10,
    textAlign: "center",
    borderRadius: 5,
    fontSize: 16,
    marginTop: 20,
  },
  bioText: {
    fontSize: 16,
    marginTop: 15,
  },
  skillsText: {
    fontSize: 16,
    marginTop: 5,
    color: "gray",
  },
  logoutButton: {
    backgroundColor: "red",
    color: "#fff",
    padding: 10,
    textAlign: "center",
    borderRadius: 5,
    marginTop: 20,
  },
});

export default Profile;
