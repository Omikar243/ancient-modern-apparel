import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from '@react-navigation/native';
import { authClient } from '../lib/auth-client';

export function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    const { data, error } = await authClient.signUp.email({
      email: formData.email,
      name: formData.name,
      password: formData.password,
    });

    if (error?.code) {
      const errorMap = { USER_ALREADY_EXISTS: 'Email already registered' };
      Alert.alert('Error', errorMap[error.code] || 'Registration failed');
      setLoading(false);
      return;
    }

    setLoading(false);
    Alert.alert('Success', 'Account created! Please check your email to verify.');
    router.replace('/login');
  };

  return (
    <View className="flex-1 justify-center p-4 bg-background">
      <Text className="text-2xl font-bold text-center mb-8 text-foreground">Register</Text>
      <TextInput
        className="border border-input rounded-md p-3 mb-4 bg-card"
        placeholder="Name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
      />
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
      <TextInput
        className="border border-input rounded-md p-3 mb-4 bg-card"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
        secureTextEntry
        autoComplete="off"
      />
      <TouchableOpacity 
        onPress={handleSubmit} 
        disabled={loading}
        className="bg-primary rounded-md p-3 mb-4"
      >
        <Text className="text-center text-primary-foreground font-semibold">{loading ? 'Registering...' : 'Register'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.navigate('Login')}>
        <Text className="text-center text-muted-foreground">Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}