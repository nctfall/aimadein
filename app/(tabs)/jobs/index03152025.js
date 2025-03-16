import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Image,
  TextInput,
} from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import axios from "axios";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as DocumentPicker from 'expo-document-picker';

const Index = () => {
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState();
  const [jobs, setJobs] = useState([]); // State to hold job posts

  // Fetch User
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

  // Fetch User Profile
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

  // Fetch Job Posts
  useEffect(() => {
    console.log("Fetching all job posts...");
    const fetchAllJobs = async () => {
      try {
        const response = await axios.get("http://192.168.2.34:3000/all-jobs");
        console.log("Fetched jobs:", response.data); // Log the full response data
        setJobs(response.data.jobPosts); // Set jobs with the correct key
      } catch (error) {
        console.log("Error fetching job posts", error);
      }
    };
    fetchAllJobs();
  }, []);

  const router = useRouter();

  return (
    <ScrollView>
      <View
        style={{
          padding: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Pressable onPress={() => router.push("/home/profile")}>
          <Image
            style={{ width: 30, height: 30, borderRadius: 15 }}
            source={{ uri: user?.profileImage }}
          />
        </Pressable>

        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginHorizontal: 7,
            gap: 10,
            backgroundColor: "white",
            borderRadius: 3,
            height: 30,
            flex: 1,
          }}
        >
          <AntDesign
            style={{ marginLeft: 10 }}
            name="search1"
            size={20}
            color="black"
          />
          <TextInput placeholder="Search" />
        </Pressable>
      </View>

      <View>
        {jobs?.map((item, index) => (
          <Pressable
            key={index}
            onPress={() => router.push(`/home/job-details/${item._id}`)} // Navigate to job details page
          >
            <View style={{ marginBottom: 15 }}>
              {/* Job Header (Profile Image & Job Title with Apply button) */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between", // This will push Apply button to the right
                  marginHorizontal: 10,
                  marginBottom: 10,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    style={{ width: 60, height: 60, borderRadius: 30 }}
                    source={{ uri: item?.user?.profileImage }}
                  />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={{ fontSize: 16, fontWeight: "600" }}>
                      {item?.jobTitle}
                    </Text>
                    <Text style={{ color: "gray", fontSize: 14 }}>
                      {item?.user?.name}
                    </Text>
                  </View>
                </View>

                {/* Apply Button */}
                <Pressable
                  style={{
                    backgroundColor: "#0072b1",
                    paddingVertical: 8,
                    paddingHorizontal: 15,
                    borderRadius: 5,
                  }}
                  onPress={() => {
                    // Handle apply action
                    console.log(`Applying to job: ${item?.jobTitle}`);
                  }}
                >
                  <Text style={{ color: "white", fontSize: 14 }}>Apply</Text>
                </Pressable>
              </View>

              {/* Skills */}
              <View style={{ marginHorizontal: 10 }}>
                <Text style={{ fontSize: 14, color: "gray" }}>
                  {item?.skills?.join(", ")}
                </Text>
              </View>

              {/* Salary */}
              {item?.salary && (
                <View style={{ marginHorizontal: 10, marginTop: 5 }}>
                  <Text style={{ fontSize: 15, fontWeight: "600" }}>
                    Salary: ${item?.salary}
                  </Text>
                </View>
              )}

              {/* Job Description */}
              <View style={{ marginHorizontal: 10, marginTop: 10 }}>
                <Text style={{ fontSize: 15 }}>{item?.jobDescription}</Text>
              </View>

              {/* Divider */}
              <View
                style={{
                  height: 2,
                  borderColor: "#E0E0E0",
                  borderWidth: 2,
                  marginVertical: 10,
                }}
              />
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};

export default Index;

const styles = StyleSheet.create({});