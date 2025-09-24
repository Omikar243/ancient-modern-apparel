import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useSession } from '../lib/auth-client';
import { useRouter } from '@react-navigation/native';

const mockGarments = [
  { id: 1, name: 'Saree Fusion', image: 'https://example.com/saree.jpg', materials: ['Khadi', 'Banarasi Silk'] },
  { id: 2, name: 'Dhoti Modern', image: 'https://example.com/dhoti.jpg', materials: ['Chanderi', 'Cotton'] },
  // More items...
];

const mockMaterials = [
  { id: 1, name: 'Khadi', origin: 'Ancient hand-spun cotton from Gandhi era' },
  // More...
];

export function CatalogScreen() {
  const [selectedGarment, setSelectedGarment] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [designs, setDesigns] = useState([]); // Fetch saved designs
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      fetch('http://localhost:3000/api/designs', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('bearer_token')}` },
      }).then(res => res.json()).then(setDesigns);
    }
  }, [session]);

  const saveDesign = async (garment, material) => {
    const response = await fetch('http://localhost:3000/api/designs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('bearer_token')}`,
      },
      body: JSON.stringify({ garmentId: garment.id, materialId: material.id, userId: session.user.id }),
    });
    if (response.ok) {
      setDesigns([...designs, { garment, material }]);
      router.navigate('Preview');
    }
  };

  return (
    <View className="flex-1 p-4 bg-background">
      <Text className="text-2xl font-bold mb-6 text-foreground">Garment Catalog</Text>
      
      <FlatList
        data={mockGarments}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedGarment(item)} className="mb-4 p-4 border border-input rounded-md bg-card">
            <Text className="font-semibold">{item.name}</Text>
            <Image source={{ uri: item.image }} className="w-20 h-20 mt-2 rounded" />
            <Text className="text-muted-foreground">Materials: {item.materials.join(', ')}</Text>
          </TouchableOpacity>
        )}
        className="mb-6"
      />

      {selectedGarment && (
        <FlatList
          data={mockMaterials}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => saveDesign(selectedGarment, item)} 
              className="mb-2 p-3 bg-muted rounded-md"
            >
              <Text className="font-semibold">{item.name}</Text>
              <Text className="text-sm text-muted-foreground">{item.origin}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity onPress={() => router.navigate('Preview')} className="bg-primary rounded-md p-4 mt-4" disabled={!designs.length}>
        <Text className="text-center text-primary-foreground font-semibold">View Saved Designs</Text>
      </TouchableOpacity>
    </View>
  );
}