import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Slider, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSession } from '../lib/auth-client';
import { useRouter } from '@react-navigation/native';
// Assume fetch to web API for saving

export function AvatarScreen() {
  const [photos, setPhotos] = useState({ front: null, back: null, left: null, right: null });
  const [measurements, setMeasurements] = useState({ height: 170, weight: 65, bust: 90 /* etc. */ });
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    router.replace('/login');
    return null;
  }

  const pickImage = async (direction) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotos({ ...photos, [direction]: result.assets[0].uri });
    }
  };

  const saveAvatar = async () => {
    setLoading(true);
    // Mock measurement extraction - in prod, use ML API
    const mockMeasurements = { /* extracted from photos */ ...measurements };
    const formData = new FormData();
    // Append photos, measurements, userId: session.user.id
    Object.keys(photos).forEach(key => {
      formData.append(key, { uri: photos[key], type: 'image/jpeg', name: `${key}.jpg` } as any);
    });

    try {
      const response = await fetch('http://localhost:3000/api/init-storage', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('bearer_token')}` }, // Adapt for RN
        body: formData,
      });
      if (response.ok) {
        Alert.alert('Success', 'Avatar saved! Proceed to catalog.');
        router.navigate('Catalog');
      } else {
        Alert.alert('Error', 'Failed to save avatar');
      }
    } catch (err) {
      Alert.alert('Error', 'Upload failed');
    }
    setLoading(false);
  };

  return (
    <ScrollView className="flex-1 p-4 bg-background">
      <Text className="text-2xl font-bold mb-6 text-foreground">Create Avatar</Text>
      <Text className="mb-4 text-muted-foreground">Upload 4 directional photos</Text>
      
      <View className="mb-6">
        {['front', 'back', 'left', 'right'].map(dir => (
          <TouchableOpacity key={dir} onPress={() => pickImage(dir)} className="mb-2">
            <View className="h-32 w-32 border-2 border-dashed border-input rounded-md items-center justify-center">
              {photos[dir] ? <Image source={{ uri: photos[dir] }} className="h-full w-full rounded-md" /> : <Text>Pick {dir} photo</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-xl font-semibold mb-4">Adjust Measurements</Text>
      <View className="mb-4">
        <Text>Height: {measurements.height} cm</Text>
        <Slider 
          minimumValue={150} maximumValue={200} 
          value={measurements.height} 
          onValueChange={(val) => setMeasurements({ ...measurements, height: val })}
          minimumTrackTintColor="#10b981" maximumTrackTintColor="#e5e7eb"
          thumbTintColor="#3b82f6"
        />
        {/* Similar sliders for weight, bust, etc. */}
      </View>

      {/* Privacy Consent */}
      <TouchableOpacity className="bg-accent rounded-md p-3 mb-4">
        <Text className="text-accent-foreground">I consent to photo storage with encryption (can delete later)</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={saveAvatar} 
        disabled={loading || Object.values(photos).some(p => !p)}
        className="bg-primary rounded-md p-4"
      >
        <Text className="text-center text-primary-foreground font-semibold">{loading ? 'Saving...' : 'Save Avatar'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}