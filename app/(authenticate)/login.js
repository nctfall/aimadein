import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { AntDesign } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from "../../firebase";  // Import storage from firebase.js
import { ref, getDownloadURL } from "firebase/storage";  // Import storage methods

const login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imageUri, setImageUri] = useState(null);  // State to store image URI
  const router = useRouter();

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Check if the user is already logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            if (token) {
                router.replace("/(tabs)/home");  // Redirect if already logged in
            }
        } catch (error) {
            console.log(error);
        }
    };

    checkLoginStatus();

    // Fetch image URL from Firebase Storage when component mounts
    const fetchImageUri = async () => {
      try {
        const imagePath = 'siteimage/logo-ai-crop.png';  // Adjust path to your image in Firebase
        const imageRef = ref(storage, imagePath);  // Get reference to the image in Firebase Storage
        const url = await getDownloadURL(imageRef);  // Fetch the download URL of the image
        setImageUri(url);  // Set image URL to state
      } catch (error) {
        console.log('Error fetching image URL:', error);
      }
    };

    fetchImageUri();
  }, []);  // Empty dependency array to run effect only once when component mounts

  // Handle login function
  const handleLogin = () => {
    // Validate email before login
    if (!validateEmail(email)) {
      Alert.alert(
        "Invalid Email",  // Title of the alert
        "Please enter a valid email address.",  // Message of the alert
        [{ text: "OK" }]  // Button to close the alert
      );
      return;  // Stop the login process if email is invalid
    }

    const user = {
      email: email,
      password: password
    };

      axios.post("http://192.168.2.34:3000/login", user).then((response) => {
          console.log(response);
          const token = response.data.token;
          AsyncStorage.setItem("authToken", token);
          router.replace("/(tabs)/home");
      }).catch((error) => {
        Alert.alert(
          "Login Failed",  // Title of the alert
          "Incorrect email or password. Please try again.",  // Message of the alert
          [{ text: "OK" }]  // Button to close the alert
        );
      });
  };

  return (
    
    <SafeAreaView style={{ flex: 1, backgroundColor: "black", alignItems: "center", justifyContent: 'flex-start' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "flex-start" }}>
      <View style={{ width:350 }}>
        {imageUri ? (
          <Image
            //style={{ width: 350, height: 300, resizeMode: "contain" }}
            style={{ width: "100%", aspectRatio: 16/9, resizeMode: "contain" }}
            source={{ uri: imageUri }}  // Use the image URL from Firebase Storage
          />
        ) : (
          <Text>Loading image...</Text>  // Show a loading message while fetching the image
        )}
      </View>

      <KeyboardAvoidingView>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 17, marginTop: 5, color: "white" }}>
            Login to your Account
          </Text>
        </View>

        <View style={{ marginTop: 15 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#E0E0E0", paddingVertical: 5, borderRadius: 5, marginTop: 5 }}>
            <MaterialIcons style={{ marginLeft: 8 }} name="email" size={24} color="gray" />
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

          <View style={{ marginTop: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#E0E0E0", paddingVertical: 5, borderRadius: 5, marginTop: 30 }}>
              <AntDesign style={{ marginLeft: 8 }} name="lock1" size={24} color="gray" />
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
          </View>

          <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text>Keep me logged in</Text>
            <Text style={{ color: "#007FFF", fontWeight: "500" }}>Forgot Password</Text>
          </View>

          <View style={{ marginTop: 80 }} />

          <Pressable
            onPress={handleLogin}
            style={{
              width: 200,
              backgroundColor: "#0072b1",
              borderRadius: 6,
              marginLeft: "auto",
              marginRight: "auto",
              padding: 15,
              
            }}
          >
            <Text style={{ textAlign: "center", color: "white", fontSize: 16, fontWeight: "bold" }}>
              Login
            </Text>
          </Pressable>

          <Pressable onPress={() => router.replace("/register")} style={{ marginTop: 10 }}>
          <Text style={{ textAlign: "center", color: "gray", fontSize: 16 }}>
          Don't have an account? 
            <Text style={{ color: "#007FFF" }}>  Sign Up</Text>
          </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default login;

const styles = StyleSheet.create({});
