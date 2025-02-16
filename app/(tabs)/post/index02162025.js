import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Pressable,
  TextInput
} from "react-native";
import React, { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { firebase } from "../../../firebase";
import axios from "axios";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

const index = () => {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [userId, setUserId] = useState("");
  const [userType, setUserType] = useState("");  // Add userType state
  const [jobTitle, setJobTitle] = useState(""); // State for company job title
  const [skills, setSkills] = useState(""); // State for company skills
  const [salary, setSalary] = useState(""); // State for company salary
  const [jobDescription, setJobDescription] = useState(""); // State for company job description
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem("authToken");
      const decodedToken = jwt_decode(token);
      console.log("Decoded Token: ", decodedToken); // Log the entire decoded token
      
      const userId = decodedToken.userId;
      const userName = decodedToken.name;
      const userType = decodedToken.userType;  // This is where 'undefined' is coming from
      setUserId(userId);
      setUserType(userType);  // Store the userType in the state
  
      console.log("Fetched userType: ", userType); // Confirm userType
    };
  
    fetchUser();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const createPost = async () => {
    try {
      const uploadedUrl = userType === "employee" ? await uploadFile() : ""; // Only upload image if employee
      let postData;

      if (userType === "employee") {
        postData = {
          description: description,
          imageUrl: uploadedUrl,
          userId: userId,
        };
      } else if (userType === "company") {
        postData = {
          jobTitle: jobTitle,
          jobDescription: jobDescription,
          skills: skills,
          salary: salary,
          userId: userId,
        };
      }

      const response = await axios.post(
        userType === "employee" ? "http://192.168.2.34:3000/create" : "http://192.168.2.34:3000/create-job",
        postData
      );

      console.log("post created", response.data);
      if (response.status === 201) {
        router.replace("/(tabs)/home");
      }
    } catch (error) {
      console.log("error creating post", error);
    }
  };

  const uploadFile = async () => {
    try {
      console.log("Image URI:", image);

      const { uri } = await FileSystem.getInfoAsync(image);

      if (!uri) {
        throw new Error("Invalid file URI");
      }

      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          resolve(xhr.response);
        };
        xhr.onerror = (e) => {
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      });

      const filename = image.substring(image.lastIndexOf("/") + 1);

      const ref = firebase.storage().ref().child(filename);
      await ref.put(blob);

      const downloadURL = await ref.getDownloadURL();
      return downloadURL;
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("authToken");
    router.replace("/(authenticate)/login");
  };

  return (
    <ScrollView style={styles.container}>
      
      {/* Top Bar with Logout Button */}
      <View style={styles.topBar}>
        <Text style={styles.headerText}>Post</Text>
        <Pressable onPress={logout} style={styles.logoutContainer}>
          <AntDesign name="logout" size={22} color="black" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      <View style={styles.formContainer}>
        {/* Conditionally Render Fields Based on User Type */}
        {userType === "employee" ? (
          <TextInput
            value={description}
            onChangeText={(text) => setDescription(text)}
            placeholder="What do you want to talk about?"
            placeholderTextColor={"#7D7D7D"}
            style={styles.textInputEmployee}
            multiline={true}
            numberOfLines={10}
            textAlignVertical={"top"}
          />
        ) : (
          <>
            <TextInput
              value={jobTitle}
              onChangeText={(text) => setJobTitle(text)}
              placeholder="Job Title"
              placeholderTextColor={"#7D7D7D"}
              style={styles.textInputCompany}
            />
            <TextInput
              value={skills}
              onChangeText={(text) => setSkills(text)}
              placeholder="Skills"
              placeholderTextColor={"#7D7D7D"}
              style={styles.textInputCompany}
            />
            <TextInput
              value={salary}
              onChangeText={(text) => setSalary(text)}
              placeholder="Salary"
              placeholderTextColor={"#7D7D7D"}
              style={styles.textInputCompany}
            />
            <TextInput
              value={jobDescription}
              onChangeText={(text) => setJobDescription(text)}
              placeholder="Job Description"
              placeholderTextColor={"#7D7D7D"}
              style={styles.textInputCompany}
            />
          </>
        )}
      </View>

      {/* Image Picker for Employee */}
      {userType === 'employee' && (
        <Pressable
          onPress={pickImage}
          style={styles.imagePickerButton}
        >
          <MaterialIcons name="perm-media" size={24} color="black" />
          <Text style={styles.imagePickerText}>Upload Image</Text>
        </Pressable>
      )}

      {/* Post Button at the Bottom */}
      <Pressable
        onPress={createPost}
        style={styles.postButton}
      >
        <Text style={styles.postButtonText}>
          {userType === 'employee' ? 'Post' : 'Post Job'}
        </Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  topBar: {
    marginTop: 10,
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  logoutContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: "500",
    color: "black",
  },
  divider: {
    borderColor: "#E0E0E0",
    borderWidth: 1,
    marginVertical: 15,
  },
  formContainer: {
    marginHorizontal: 16,
    marginVertical: 10,
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontWeight: "500",
    fontSize: 16,
  },
  textInputEmployee: {
    fontSize: 16,
    fontWeight: "500",
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 8,
  },
  textInputCompany: {
    fontSize: 16,
    fontWeight: "500",
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 8,
  },
  imagePickerButton: {
    width: 200,
    height: 40,
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    alignSelf: "center",
    flexDirection: "row",
  },
  imagePickerText: {
    fontSize: 16,
    marginLeft: 10,
    color: "black",
  },
  postButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#0072b1",
    borderRadius: 20,
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  postButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default index;
