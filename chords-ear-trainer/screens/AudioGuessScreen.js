import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

const chords = ['C', 'G', 'D', 'Am', 'Em', 'F'];

export default function AudioGuessScreen() {
  const [currentChord, setCurrentChord] = useState(null);
  const [options, setOptions] = useState([]);
  const [message, setMessage] = useState('');
  const [buttonLabel, setButtonLabel] = useState('Play Chord');

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function playRandomChord() {
    let randomChord;
    do {
      randomChord = chords[Math.floor(Math.random() * chords.length)];
    } while (currentChord && randomChord === currentChord);

    setCurrentChord(randomChord);

    const shuffled = [...chords].sort(() => 0.5 - Math.random()).slice(0, 4);
    if (!shuffled.includes(randomChord)) shuffled[0] = randomChord;
    setOptions(shuffled.sort(() => 0.5 - Math.random()));

    setMessage('Guess the chord!');
    setButtonLabel('Next');
  }

  function checkAnswer(selected) {
    if (selected === currentChord) {
      setMessage('✅ Correct!');
      triggerScale();
    } else {
      setMessage('❌ Try Again!');
      triggerShake(); // Animate button on wrong answer
    }
  }

  function triggerScale() {
    scaleAnim.setValue(1);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  }

  function triggerShake() {
    shakeAnim.setValue(0);
    Animated.sequence([
            // Animated.timing(shakeAnim, { toValue: 20, duration: 50, useNativeDriver: true }),

      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio Chord Trainer</Text>
      <Text style={styles.message}>{message}</Text>

      <View style={styles.optionsContainer}>
        {options.map((opt, index) => (
          <TouchableOpacity key={index} onPress={() => checkAnswer(opt)} style={styles.option}>
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      
{/* Animated Button */}
<Animated.View
  style={{
    width: '100%',
    alignItems: 'center', // ✅ Center the button horizontally
    transform: [{ translateX: shakeAnim }, { scale: scaleAnim }],
  }}
>
  <TouchableOpacity onPress={playRandomChord} style={styles.nextButton}>
    <Text style={styles.nextButtonText}>{buttonLabel}</Text>
  </TouchableOpacity>
</Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  message: { fontSize: 18, marginVertical: 10, fontWeight: 'bold' },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
  },
  option: {
    width: '40%',
    padding: 15,
    margin: 10,
    backgroundColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  optionText: { fontSize: 18, fontWeight: 'bold' },
  nextButton: {
    width: '85%',
    padding: 15,
    marginTop: 20,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
});
