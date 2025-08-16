import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ImageBackground,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginScreen() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const validateForm = () => {
    if (!mobile.trim() || mobile.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Password is required');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        mobile,
        password,
      };

      const response = await fetch('https://appapi.ddabattalion.com/api/students/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store token and user data in AsyncStorage
        if (data.data.token) {
          await AsyncStorage.setItem('userToken', data.data.token);
          await AsyncStorage.setItem('userData', JSON.stringify(data.data.student));
          
          // Update AuthContext with the new token and student ID
          login(data.data.token, data.data.student.id);
          console.log('✅ AuthContext updated with token and student ID:', data.data.student.id);
        }

        // Navigate to home screen immediately
        console.log('Login successful, navigating to home...');
        // Try different navigation approaches
        router.replace('/(tabs)/');
        // Alternative: router.push('/(tabs)/index');
      } else {
        // Show error message
        Alert.alert('Error', data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/signin-up.png")}
      style={styles.backgroundImage}
      // resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Sign in</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.welcome}>Welcome Back</Text>
          <Text style={styles.subtitle}>Hello there, sign in to continue!</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your Mobile number"
            value={mobile}
            onChangeText={setMobile}
            placeholderTextColor="#999"
            maxLength={10}
            keyboardType="phone-pad"
          />

          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />

          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign in</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(1, 63, 196, 0.8)",
  },
  header: {
    height: 200,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerImage: {
    width: "100%",
    height: 100,
    marginBottom: 10,
  },
  headerText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  form: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    marginTop: 20, // Added to create space between header and form
  },
  welcome: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#f5f5f5",
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  forgotPassword: {
    color: "#013FC4",
    fontWeight: "600",
    textAlign: "right",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#013FC4",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    color: "#666",
  },
  footerLink: {
    color: "#013FC4",
    fontWeight: "600",
  },
});
