import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSession } from '../lib/auth-client'; // Adapt from web

export default function Header() {
  const navigation = useNavigation();
  const { data: session } = useSession();

  return (
    <View className="bg-background border-b border-border px-4 py-3 flex-row items-center justify-between">
      <Text className="text-lg font-semibold text-foreground">IndiFusion Wear</Text>
      <View className="flex-row gap-4">
        <TouchableOpacity onPress={() => navigation.navigate('Avatar')}>
          <Text className="text-muted-foreground">Avatar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Catalog')}>
          <Text className="text-muted-foreground">Catalog</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Preview')}>
          <Text className="text-muted-foreground">Preview</Text>
        </TouchableOpacity>
        {session ? (
          <TouchableOpacity onPress={() => {/* signOut */}}>
            <Text className="text-primary">Logout</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md">Register</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}