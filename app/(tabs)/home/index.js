import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Image,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import axios from "axios";
import { useRouter } from "expo-router";
import moment from "moment";
import {
  Ionicons,
  Entypo,
  Feather,
  FontAwesome,
  AntDesign,
  SimpleLineIcons,
} from "@expo/vector-icons";

// Reusable Components
const UserProfileImage = ({ uri, onPress }) => (
  <Pressable onPress={onPress}>
    <Image style={styles.profileImage} source={{ uri }} />
  </Pressable>
);

 
  // Logout function
  const logout = async () => {
    await AsyncStorage.removeItem("authToken");
    router.replace("/(authenticate)/login");
  };

const PostHeader = ({ user, createdAt }) => (
  <View style={styles.postHeader}>
    <UserProfileImage uri={user?.profileImage} />
    <View style={styles.userInfo}>
      <Text style={styles.userName}>{user?.name}</Text>
      <Text style={styles.userDetails}>{moment(createdAt).format("MMMM Do YYYY")}</Text>
    </View>
    <View style={styles.postActions}>
      <Entypo name="dots-three-vertical" size={20} color="black" />
      <Feather name="x" size={20} color="black" />
    </View>
  </View>
);

const PostContent = ({ description, imageUrl, showfullText, toggleShowFullText }) => (
  <View style={styles.postContent}>
    <Text style={styles.postText} numberOfLines={showfullText ? undefined : 2}>
      {description}
    </Text>
    {!showfullText && (
      <Pressable onPress={toggleShowFullText}>
        <Text style={styles.seeMoreText}>See more</Text>
      </Pressable>
    )}
    {imageUrl && ( // Conditionally render the image only if imageUrl exists
      <Image style={styles.postImage} source={{ uri: imageUrl }} />
    )}
  </View>
);

const PostFooter = ({ likes, isLiked, handleLikePost, postId }) => (
  <View style={styles.postFooter}>
    {likes?.length > 0 && (
      <View style={styles.likesContainer}>
        <SimpleLineIcons name="like" size={16} color="#0072b1" />
        <Text style={styles.likesText}>{likes.length}</Text>
      </View>
    )}
    <View style={styles.footerActions}>
      <Pressable onPress={() => handleLikePost(postId)}>
        <AntDesign
          name="like2"
          size={24}
          color={isLiked ? "#0072b1" : "gray"}
        />
        <Text style={[styles.actionText, isLiked && styles.likedText]}>Like</Text>
      </Pressable>
      <Pressable>
        <FontAwesome name="comment-o" size={20} color="gray" />
        <Text style={styles.actionText}>Comment</Text>
      </Pressable>
      <Pressable>
        <Ionicons name="md-share-outline" size={20} color="gray" />
        <Text style={styles.actionText}>Repost</Text>
      </Pressable>
      <Pressable>
        <Feather name="send" size={20} color="gray" />
        <Text style={styles.actionText}>Send</Text>
      </Pressable>
    </View>
  </View>
);

const HomeScreen = () => {
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [showfullText, setShowfullText] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem("authToken");
      const decodedToken = jwt_decode(token);
      setUserId(decodedToken.userId);
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
      const response = await axios.get(`http://192.168.2.34:3000/profile/${userId}`);
      setUser(response.data.user);
    } catch (error) {
      console.log("Error fetching user profile", error);
    }
  };

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        const response = await axios.get("http://192.168.2.34:3000/all");
        const sortedPosts = response.data.posts.sort((a, b) => 
          moment(b.createdAt).valueOf() - moment(a.createdAt).valueOf()
        );
        setPosts(sortedPosts);
        setFilteredPosts(sortedPosts);
      } catch (error) {
        console.log("Error fetching posts", error);
      }
    };

    fetchAllPosts();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = query 
      ? posts.filter(post => 
          post.user.name.toLowerCase().includes(query.toLowerCase())
        )
      : posts;
    setFilteredPosts(filtered);
  };

  const toggleShowFullText = () => setShowfullText(!showfullText);

  const handleLikePost = async (postId) => {
    try {
      const response = await axios.post(`http://192.168.2.34:3000/like/${postId}/${userId}`);
      if (response.status === 200) {
        setIsLiked(response.data.post.likes.some(like => like.user === userId));
      }
    } catch (error) {
      console.log("Error liking/unliking the post", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <UserProfileImage uri={user?.profileImage} onPress={() => router.push("/home/profile")} />
        <View style={styles.searchContainer}>
          <AntDesign name="search1" size={20} color="black" />
          <TextInput
            placeholder="Search by name"
            value={searchQuery}
            onChangeText={handleSearch}
            style={styles.searchInput}
          />
        </View>
         <Pressable onPress={logout} style={{ flexDirection: "row", alignItems: "center" }}>
            <AntDesign name="logout" size={22} color="black" />
             <Text style={{ marginLeft: 5, fontSize: 16, fontWeight: "500", color: "black" }}>
              Logout
             </Text>
          </Pressable>
      </View>

      {filteredPosts.map((post, index) => (
        <View key={post._id} style={styles.postCard}>
          <PostHeader user={post.user} createdAt={post.createdAt} />
          <PostContent
            description={post.description}
            imageUrl={post.imageUrl} // Pass imageUrl conditionally
            showfullText={showfullText}
            toggleShowFullText={toggleShowFullText}
          />
          <PostFooter
            likes={post.likes}
            isLiked={isLiked}
            handleLikePost={handleLikePost}
            postId={post._id}
          />
        </View>
      ))}
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    height: 40,
    flex: 1,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "column",
    gap: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  userDetails: {
    color: "gray",
    fontSize: 14,
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  postContent: {
    marginTop: 10,
    marginBottom: 12,
  },
  postText: {
    fontSize: 15,
    lineHeight: 20,
  },
  seeMoreText: {
    color: "#0072b1",
    marginTop: 5,
  },
  postImage: {
    width: "100%",
    height: 240,
    borderRadius: 10,
    marginTop: 10,
  },
  likesContainer: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  likesText: {
    color: "gray",
  },
  postFooter: {
    borderTopWidth: 1,
    borderColor: "#e0e0e0",
    paddingVertical: 10,
  },
  footerActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  actionText: {
    textAlign: "center",
    fontSize: 12,
    color: "gray",
    marginTop: 2,
  },
  likedText: {
    color: "#0072b1",
  },
});