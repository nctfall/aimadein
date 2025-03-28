import {
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
} from "react-native";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import axios from "axios";
import { AntDesign } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import UserProfile from "../../../components/UserProfile";
import ConnectionRequest from "../../../components/ConnectionRequest";
import { useRouter } from "expo-router";

const index = () => {
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState();
  const [users, setUsers] = useState([]);
  const router = useRouter();
  const [connectionRequests, setConnectionRequests] = useState([]);

  // Logout function
  const logout = async () => {
    await AsyncStorage.removeItem("authToken");
    router.replace("/(authenticate)/login");
  };

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
    } catch (error) {
      console.log("error fetching user profile", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUsers();
    }
  }, [userId]);

  const fetchUsers = async () => {
    axios
      .get(`http://192.168.2.34:3000/users/${userId}`)
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.log("error fetching user profile", error);
      });
  };

  useEffect(() => {
    if (userId) {
      fetchFriendRequests();
    }
  }, [userId]);

  const fetchFriendRequests = async () => {
    try {
      const response = await axios.get(
        `http://192.168.2.34:3000/connection-request/${userId}`
      );
      if (response.status === 200) {
        const connectionRequestsData = response.data?.map((friendRequest) => ({
          _id: friendRequest._id,
          name: friendRequest.name,
          email: friendRequest.email,
          image: friendRequest.profileImage,
        }));

        setConnectionRequests(connectionRequestsData);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const renderHeader = () => (
    <>
      {/* Top Bar with Logout Button and Texts */}
      <View
        style={{
          marginTop: 10,
          marginHorizontal: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>Manage My Network</Text>
        <Pressable onPress={logout} style={{ flexDirection: "row", alignItems: "center" }}>
          <AntDesign name="logout" size={22} color="black" />
          <Text style={{ marginLeft: 5, fontSize: 16, fontWeight: "500", color: "black" }}>
            Logout
          </Text>
        </Pressable>
      </View>

      <View style={{ borderColor: "#E0E0E0", borderWidth: 2, marginVertical: 10 }} />

      <View
        style={{
          marginTop: 10,
          marginHorizontal: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600" }}>Invitations (0)</Text>
        <AntDesign name="arrowright" size={22} color="black" />
      </View>

      <View style={{ borderColor: "#E0E0E0", borderWidth: 2, marginVertical: 10 }} />

      <View>
        {connectionRequests?.map((item, index) => (
          <ConnectionRequest
            item={item}
            key={index}
            connectionRequests={connectionRequests}
            setConnectionRequests={setConnectionRequests}
            userId={userId}
          />
        ))}
      </View>

      <View style={{ marginHorizontal: 15 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text>Grow your network faster</Text>
          <Entypo name="cross" size={24} color="black" />
        </View>

        <Text>
          Find and contact the right people. Explore more Job Opportunities
        </Text>
        
      </View>
    </>
  );

  const renderUserProfiles = ({ item }) => (
    <UserProfile userId={userId} item={item} />
  );

  return (
    <FlatList
      ListHeaderComponent={renderHeader}
      data={users}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      numColumns={2}
      keyExtractor={(item) => item._id}
      renderItem={renderUserProfiles}
      contentContainerStyle={{ flexGrow: 1, backgroundColor: "white" }}
    />
  );
};

export default index;

const styles = StyleSheet.create({});
