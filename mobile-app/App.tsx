import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Register } from './src/screens/Register';
import { Login } from './src/screens/Login';
import { AvatarScreen } from './src/screens/AvatarScreen';
import { CatalogScreen } from './src/screens/CatalogScreen';
import { PreviewScreen } from './src/screens/PreviewScreen';
import Header from './src/components/Header';
import { SessionProvider } from './src/lib/auth-client'; // Adapt session wrapper

const Stack = createStackNavigator();

export default function App() {
  return (
    <SessionProvider>
      <NavigationContainer>
        <Stack.Navigator 
          screenOptions={{
            header: (props) => <Header {...props} />,
          }}
        >
          <Stack.Screen name="Home" component={() => null /* Splash or redirect */} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Avatar" component={AvatarScreen} />
          <Stack.Screen name="Catalog" component={CatalogScreen} />
          <Stack.Screen name="Preview" component={PreviewScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SessionProvider>
  );
}