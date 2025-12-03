import React from 'react';
import * as RN from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Text} from 'react-native'; 
// Import your screens
import AudioGuessScreen from './screens/AudioGuessScreen';
import PatternGuessScreen from './screens/PatternGuessScreen';
import { ThemeContext } from './ThemeContext';

const Tab = createBottomTabNavigator();

export default function Navigation() {
  const {theme, toggleTheme} = React.useContext(ThemeContext)
  const styles = createStyles(theme == 'dark')
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
            backgroundColor: theme == "dark" ? "#222": '#fff',
            borderColor: theme == "dark" ? "#222": '#fff',
          },
                headerRight: () => (
        // <RN.View style={{ marginRight: 8 }}>
        //   <RN.Button title="dark" onPress={toggleTheme} />
        // </RN.View>
                <RN.TouchableOpacity onPress={toggleTheme}>
          <Ionicons name={theme == "dark" ? "sunny" : "moon"} size={26} style={styles.icon}  />
        </RN.TouchableOpacity>
      ),

          headerTintColor: '#222',

      headerStyle: {
        backgroundColor: theme === 'dark' ? '#222' : '#fff',
        borderBottomWidth: 1,
        borderBottomColor: theme === 'dark' ? '#000' : '#ccc',
      },
      headerTitleStyle: {
                    fontWeight: 'bold',
            fontSize: 18,
        color: theme === 'dark' ? '#ddd' : '#333',
      },
      headerTitleAlign: 'left',
        })}>
        <Tab.Screen name="Pattern" component={PatternGuessScreen} options={{ title: 'Chord Sense' }} />
        <Tab.Screen name="Audio" component={AudioGuessScreen} options={{ title: 'Audio Chord Trainer' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
const createStyles = (d) => RN.StyleSheet.create({
    icon: { opacity: 1, color: d ? '#999' : '#888' , marginRight: 16},

})
