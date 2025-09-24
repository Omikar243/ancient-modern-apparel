import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from '@react-navigation/native';
import { authClient } from '../lib/auth-client';
import { toast } from 'react-hot-toast/native'; // Or use RN toast lib

export function Login() {
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    const { data, error } = await authClient.signIn.email({
      email: formData.email,
      password: formData.password,
      rememberMe: formData.rememberMe,
      callbackURL: '/avatar', // Redirect to avatar after login
    });

    if (error?.code) {
      Alert.alert('Error', 'Invalid email or password. Please make sure you have already registered an account and try again.');
      setLoading(false);
      return;
    }

    setLoading(false);
    router.replace('/avatar');
  };

  return (
    <View className="flex-1 justify-center p-4 bg-background">
      <Text className="text-2xl font-bold text-center mb-8 text-foreground">Login</Text>
      <TextInput
        className="border border-input rounded-md p-3 mb-4 bg-card"
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        className="border border-input rounded-md p-3 mb-4 bg-card"
        placeholder="Password"
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        secureTextEntry
        autoComplete="off"
      />
      <TouchableOpacity className="mb-4">
        <Text className="text-right text-muted-foreground">Remember Me</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={handleSubmit} 
        disabled={loading}
        className="bg-primary rounded-md p-3 mb-4"
      >
        <Text className="text-center text-primary-foreground font-semibold">{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.navigate('Register')}>
        <Text className="text-center text-muted-foreground">Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}