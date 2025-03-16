import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  Pressable,
  KeyboardAvoidingView,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Entypo } from '@expo/vector-icons';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import { firebase } from "../../firebase";  // Import your Firebase setup
import { ref, getDownloadURL } from "firebase/storage";  // Import storage methods
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [userType, setUserType] = useState("employee");  // Set default userType to "employee"
  const router = useRouter();

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Fetch image URL from Firebase Storage when component mounts
  useEffect(() => {
    const fetchImageUri = async () => {
      try {
        const imagePath = 'siteimage/logo-ai-crop.png';  // Adjust the path to your image in Firebase
        const imageRef = ref(firebase.storage(), imagePath);  // Get reference to the image in Firebase Storage
        const url = await getDownloadURL(imageRef);  // Fetch the download URL of the image
        setImageUri(url);  // Set image URL to state
      } catch (error) {
        console.log('Error fetching image URL:', error);
      }
    };

    fetchImageUri();
  }, []);  // Empty dependency array to run effect only once when component mounts

  // Validation to ensure required fields are filled out
  const validateRequiredFields = () => {
    if (!name) {
      Alert.alert("Validation Error", "Name is required.");
      return false;
    }
    if (!email) {
      Alert.alert("Validation Error", "Email is required.");
      return false;
    }
    if (!password) {
      Alert.alert("Validation Error", "Password is required.");
      return false;
    }
    if (!userType) {
      Alert.alert("Validation Error", "User type is required.");
      return false;
    }
    return true;
  };

  const handleRegister = () => {
    // Check if all required fields are filled
    if (!validateRequiredFields()) {
      return; // Stop registration if fields are missing
    }

    // Validate email format
    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;  // Don't proceed if email is invalid
    }

    const user = {
      name: name,
      email: email,
      password: password,
      profileImage: image,
      userType: userType === "employee" ? "employee" : "company",  // Map radio button value to DB field
    };

    axios.post("http://192.168.2.34:3000/register", user).then((response) => {
      console.log(response);
      Alert.alert("Registration successful", "You have been registered successfully");
      setName("");
      setEmail("");
      setPassword("");
      setImage("");
    }).catch((error) => {
      Alert.alert("Registration failed", "An error occurred while registering");
      console.log("Registration failed", error);
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black", alignItems: "center" }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center" }}>
        <View style={{ width: 300 }}>
          {imageUri ? (
            <Image
              style={{ width: "100%", aspectRatio: 16 / 9, resizeMode: "contain" }}
              source={{ uri: imageUri }}
            />
          ) : (
            <Text>Loading image...</Text>
          )}
        </View>

        <KeyboardAvoidingView
          behavior="padding"  // This will make sure the keyboard adjusts its position for iOS
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <View style={{ alignItems: "center" }}>
            <Text
              style={{
                fontSize: 17,
                marginTop: 5,
                color: "white",
              }}
            >
              Register to your Account
            </Text>
          </View>

          <View style={{ marginTop: 15 }}>
            {/* Name Input */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: "#E0E0E0",
                paddingVertical: 5,
                borderRadius: 5,
                marginTop: 5,
              }}
            >
              <Ionicons
                name="person"
                size={24}
                color="gray"
                style={{ marginLeft: 8 }}
              />
              <TextInput
                value={name}
                onChangeText={(text) => setName(text)}
                style={{
                  color: "gray",
                  marginVertical: 10,
                  width: 300,
                  fontSize: name ? 18 : 18,
                }}
                placeholder="Enter your Name"
              />
            </View>

            {/* Email Input */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: "#E0E0E0",
                paddingVertical: 5,
                borderRadius: 5,
                marginTop: 20,
              }}
            >
              <MaterialIcons
                style={{ marginLeft: 8 }}
                name="email"
                size={24}
                color="gray"
              />
              <TextInput
                value={email}
                onChangeText={(text) => setEmail(text)}
                style={{
                  color: "gray",
                  marginVertical: 10,
                  width: 300,
                  fontSize: email ? 18 : 18,
                }}
                placeholder="Enter your Email"
              />
            </View>

            {/* Password Input */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: "#E0E0E0",
                paddingVertical: 5,
                borderRadius: 5,
                marginTop: 20,
              }}
            >
              <AntDesign
                style={{ marginLeft: 8 }}
                name="lock1"
                size={24}
                color="gray"
              />
              <TextInput
                value={password}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry={true}
                style={{
                  color: "gray",
                  marginVertical: 10,
                  width: 300,
                  fontSize: password ? 18 : 18,
                }}
                placeholder="Enter your Password"
              />
            </View>

            {/* Image URL Input */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: "#E0E0E0",
                paddingVertical: 5,
                borderRadius: 5,
                marginTop: 20,
              }}
            >
              <Entypo name="image" size={24} color="gray" style={{ marginLeft: 8 }} />
              <TextInput
                value={image}
                onChangeText={(text) => setImage(text)}
                style={{
                  color: "gray",
                  marginVertical: 10,
                  width: 300,
                  fontSize: image ? 18 : 18,
                }}
                placeholder="Enter your image URL"
              />
            </View>

            {/* Radio Buttons for User Type */}
            <View style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: "gray", fontSize: 18, marginRight: 10 }}>User Type</Text>

              <Pressable
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginRight: 20,
                  borderWidth: 2,
                  borderColor: userType === "employee" ? "#0072b1" : "gray",
                  padding: 10,
                  borderRadius: 5,
                }}
                onPress={() => setUserType("employee")}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: userType === "employee" ? "#0072b1" : "gray",
                    marginRight: 10,
                  }}
                >
                  {userType === "employee" && (
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: "#0072b1",
                      }}
                    />
                  )}
                </View>
                <Text style={{ color: "gray" }}>Individual</Text>
              </Pressable>

              <Pressable
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 2,
                  borderColor: userType === "company" ? "#0072b1" : "gray",
                  padding: 10,
                  borderRadius: 5,
                }}
                onPress={() => setUserType("company")}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: userType === "company" ? "#0072b1" : "gray",
                    marginRight: 10,
                  }}
                >
                  {userType === "company" && (
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: "#0072b1",
                      }}
                    />
                  )}
                </View>
                <Text style={{ color: "gray" }}>Company</Text>
              </Pressable>
            </View>

            {/* Register Button */}
            <Pressable
              onPress={handleRegister}
              style={{
                width: 200,
                backgroundColor: "#0072b1",
                borderRadius: 6,
                marginLeft: "auto",
                marginRight: "auto",
                padding: 15,
                marginTop: 20,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "white",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                Register
              </Text>
            </Pressable>

            {/* Login Redirect */}
            <Pressable onPress={() => router.replace("/login")} style={{ marginTop: 15 }}>
              <Text style={{ textAlign: "center", color: "gray", fontSize: 16 }}>
                Already have an account? 
                <Text style={{ color: "#007FFF" }}>  Sign-in</Text>
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Register;

const styles = StyleSheet.create({});
