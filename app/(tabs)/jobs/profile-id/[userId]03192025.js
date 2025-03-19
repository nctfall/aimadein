import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image } from "react-native";
import axios from "axios";

const Profile = () => {
  const { userId } = useLocalSearchParams(); // Get the userId from the URL
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`http://192.168.2.34:3000/profile/${userId}`);
        setUser(response.data.user);
      } catch (error) {
        console.log("Error fetching user profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
  }

  if (!user) {
    return <Text style={styles.notFound}>User not found</Text>;
  }

  return (
    <View style={styles.container}>
      <Image style={styles.profileImage} source={{ uri: user.profileImage }} />
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.description}>{user.userDescription}</Text>
      {/* Add more user details here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notFound: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "red",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
});

export default Profile;