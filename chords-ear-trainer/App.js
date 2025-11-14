import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Text} from 'react-native'; 
// Import your screens
import AudioGuessScreen from './screens/AudioGuessScreen';
import PatternGuessScreen from './screens/PatternGuessScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
                          tabBarIcon: ({ focused, color, size }) => {
                  let iconName;

                  if (route.name === 'Audio') {
                    iconName = focused ? 'musical-notes' : 'musical-notes-outline';
                  } else if (route.name === 'Pattern') {
                    iconName = focused ? 'image' : 'image-outline';
                  } 

                  return (
                    <Ionicons
                      name={iconName}
                      size={size}
                      color={
                        focused ? ('#007BFF') : '#aaa'
                      }
                    />
                  );
                },
          tabBarLabel: ({ focused, color }) => (
            <Text
              style={{
                color: focused ? ( '#007BFF') :  '#aaa',
                fontWeight: focused ? 'bold' : 'normal',
                fontSize: 12,
              }}>
              {route.name}
            </Text>
          ),
          tabBarActiveTintColor: '#007BFF',
          tabBarInactiveTintColor: 'gray',
          // headerShown: false,
          tabBarStyle: {
            height: 80,
            paddingTop: 10,
            backgroundColor: '#fff',
            borderColor: '#fff',
          },
          

          headerStyle: {
            backgroundColor: '#fff'
          },
          headerTintColor: '#222',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },

        })}>
        <Tab.Screen name="Audio" component={AudioGuessScreen} options={{ title: 'Audio Chord Trainer' }} />
        <Tab.Screen name="Pattern" component={PatternGuessScreen} options={{ title: 'Chord Pattern Trainer' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
