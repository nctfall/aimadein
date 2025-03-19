import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import axios from "axios";

// Format date function to display month name
const formatDate = (isoDate) => {
  if (!isoDate) return "Present";
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long", // 'long' for full month name (e.g., "January")
    day: "2-digit",
  });
};

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
    <ScrollView style={styles.container}>
      {/* Profile Picture */}
      <View style={styles.profileHeader}>
        <Image style={styles.profileImage} source={{ uri: user.profileImage }} />
      </View>

      {/* User Details */}
      <View style={styles.profileDetails}>
        <Text style={styles.name}>{user.name}</Text>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.bioText}>{user.userDescription || "No description provided."}</Text>
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text style={styles.skillsText}>
            {user.skills?.join(", ") || "No skills added."}
          </Text>
        </View>

        {/* Work Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Experience</Text>
          {user.workExperience?.map((item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{item.companyName}</Text>
              <Text style={styles.cardSubtitle}>{item.jobTitle}</Text>
              <Text style={styles.cardText}>
                {formatDate(item.startDate)} - {formatDate(item.endDate)}
              </Text>
              <Text style={styles.cardText}>{item.responsibilities}</Text>
            </View>
          ))}
        </View>

        {/* Education */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {user.education?.map((item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{item.degree}</Text>
              <Text style={styles.cardSubtitle}>{item.institution}</Text>
              <Text style={styles.cardText}>Graduated: {item.yearOfGraduation}</Text>
              <Text style={styles.cardText}>Field: {item.fieldOfStudy}</Text>
            </View>
          ))}
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <Text style={styles.cardText}>
            {user.address?.street}, {user.address?.city}, {user.address?.state}, {user.address?.country}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
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
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileDetails: {
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
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
});

export default Profile;