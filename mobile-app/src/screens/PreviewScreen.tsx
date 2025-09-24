import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { Renderer, Loaders } from 'expo-three';
import { useSession } from '../lib/auth-client';
import { useRouter } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';

const { width, height } = Dimensions.get('window');

export function PreviewScreen() {
  const [designs, setDesigns] = useState([]); // Fetch from API
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:3000/api/designs', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('bearer_token')}` },
    }).then(res => res.json()).then(setDesigns);
  }, []);

  const dummyPurchase = async (designId) => {
    setLoading(true);
    const response = await fetch('http://localhost:3000/api/designs', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('bearer_token')}`,
      },
      body: JSON.stringify({ id: designId, purchased: true }),
    });
    if (response.ok) {
      setIsPurchased(true);
      Alert.alert('Purchased', 'Design unlocked for export!');
    }
    setLoading(false);
  };

  const exportDesign = async () => {
    if (!isPurchased) return Alert.alert('Error', 'Purchase required');
    
    // Mock GLB/PDF - in prod, generate real files
    const mockData = { design: selectedDesign, measurements: {} };
    const json = JSON.stringify(mockData);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(`data:application/json;base64,${btoa(json)}`, { mimeType: 'application/json', dialogTitle: 'Export Design' });
      // PDF via jsPDF or similar, share similarly
    }
  };

  const Watermark = () => (
    <mesh>
      <textGeometry args={['PURCHASE TO REMOVE WATERMARK', { size: 0.5, height: 0.1 }]} />
      <meshStandardMaterial color="white" transparent opacity={0.5} />
    </mesh>
  );

  return (
    <View className="flex-1 bg-background">
      <Text className="text-xl font-bold p-4 text-foreground">Preview Designs</Text>
      
      {/* Design Selector */}
      <FlatList // Simplified, assume imported
        data={designs}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedDesign(item)} className="p-4 border-b border-input">
            <Text>{item.garment.name} - {item.material.name}</Text>
          </TouchableOpacity>
        )}
      />

      {selectedDesign && (
        <View className="flex-1 justify-center items-center">
          <Canvas style={{ width, height: height * 0.6 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            {/* Mock 3D Avatar + Garment - load GLTF models */}
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="blue" />
            </mesh>
            {!isPurchased && <Watermark />}
          </Canvas>

          {!isPurchased ? (
            <TouchableOpacity 
              onPress={() => dummyPurchase(selectedDesign.id)} 
              disabled={loading}
              className="bg-accent rounded-md p-4 m-4"
            >
              <Text className="text-center text-accent-foreground font-semibold">Purchase ($9.99)</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={exportDesign} 
              className="bg-primary rounded-md p-4 m-4"
            >
              <Text className="text-center text-primary-foreground font-semibold">Export Design Pack</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}