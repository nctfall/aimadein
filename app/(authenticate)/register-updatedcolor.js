import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  Pressable,
  KeyboardAvoidingView,
  TextInput,
  Alert
} from "react-native";
import React, { useState, useEffect } from "react";
import { AntDesign } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Entypo } from '@expo/vector-icons';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import { firebase } from "../../firebase";  // Import your Firebase setup
import { ref, getDownloadURL } from "firebase/storage";  // Import storage methods

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [imageUri, setImageUri] = useState(null);  // State to store image URI
  const router = useRouter();

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

  const handleRegister = () => {
    console.log("hello")
    const user = {
        name: name,
        email: email,
        password: password,
        profileImage: image
    }

    axios.post("http://192.168.2.34:3000/register", user).then((response) => {
        console.log(response);
        Alert.alert("Registration successful", "You have been registered successfully");
        setName("");
        setEmail("");
        setPassword("");
        setImage("");
    }).catch((error) => {
        Alert.alert("Registration failed", "An error occurred while registering");
        console.log("registration failed", error)
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black", alignItems: "center" }}>
      <View style={{ width: 350 }}>
        {imageUri ? (
          <Image
            style={{ width: "100%", aspectRatio: 16 / 9, resizeMode: "contain" }}
            source={{ uri: imageUri }}  // Use the image URL from Firebase Storage
          />
        ) : (
          <Text>Loading image...</Text>  // Show a loading message while fetching the image
        )}
      </View>

      <KeyboardAvoidingView>
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

          <Pressable onPress={() => router.replace("/login")} style={{ marginTop: 15 }}>
          <Text style={{ textAlign: "center", color: "gray", fontSize: 16 }}>
          Already have an account? 
            <Text style={{ color: "#007FFF" }}>  Sign-in</Text>
          </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Register;

const styles = StyleSheet.create({});
