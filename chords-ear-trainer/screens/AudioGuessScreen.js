import React, { useState, useRef, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Button,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { ThemeContext } from '../ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons'; // you already have this

import { Audio } from 'expo-av';
const chords = ['Am', 'Bb', 'C', 'Em', 'Dm', 'F', 'G'];

const chordFiles = {
  Am: require('../assets/audio/Am.wav'),
  Bb: require('../assets/audio/Bb.wav'),
  C: require('../assets/audio/C.wav'),
  Em: require('../assets/audio/Em.wav'),
  Dm: require('../assets/audio/Dm.wav'),
  F: require('../assets/audio/F.wav'),
  G: require('../assets/audio/G.wav'),
};

export default function AudioGuessScreen({ navigation }) {
  const [currentChord, setCurrentChord] = useState(null);
  const [options, setOptions] = useState([]);
  const [message, setMessage] = useState('');
  const [buttonLabel, setButtonLabel] = useState('Start');
  const [highScore, setHighScore] = useState(0);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [clickedOption, setClickedOption] = useState(null);
  const [score, setScore] = useState(0);

  const { theme, toggleTheme } = useContext(ThemeContext);
  const styles = createStyles(theme == 'dark');
  const soundsRef = useRef({});

  useEffect(() => {
    let mounted = true;
    async function loadHigh() {
      try {
        const v = await AsyncStorage.getItem('HIGH_SCORE:AUDIO');
        if (v != null && mounted) setHighScore(Number(v) || 0);
      } catch (e) {
        console.log('Failed to load high score', e);
      }
    }
    loadHigh();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    async function saveIfHigh() {
      try {
        if (score > highScore) {
          setHighScore(score);
          await AsyncStorage.setItem('HIGH_SCORE:AUDIO', String(score));
          console.log('New high score saved:', score);
        }
      } catch (e) {
        console.log('Failed to save high score', e);
      }
    }
    saveIfHigh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  useEffect(() => {
    async function loadAll() {
      try {
        const loaded = {};
        let index = 0;
        const total = chords.length;

        for (const chord of chords) {
          console.log(`Loading ${chord} (${index + 1}/${total})...`);
          const s = new Audio.Sound();
          await s.loadAsync(chordFiles[chord]);
          loaded[chord] = s;
          console.log(`Loaded ${chord}`);
          index++;
        }

        console.log('All sounds loaded.');
        soundsRef.current = loaded;
      } catch (e) {
        console.log('Error loading sounds:', e);
      }
    }

    loadAll();

    return () => {
      Object.values(soundsRef.current).forEach((s) => s.unloadAsync());
    };
  }, []);

  function replayChord() {
    if (!currentChord) {
      console.log('No chord to replay');
      return;
    }
    console.log('Replaying', currentChord);
    playChord(currentChord);
  }

  async function playChord(chord) {
    try {
      console.log(`Request to play: ${chord}`);

      const sound = soundsRef.current[chord];
      if (!sound) {
        console.log(`Sound not found for ${chord}`);
        console.log(soundsRef.current, chord);
        return;
      }

      const status = await sound.getStatusAsync();
      console.log(`Current status of ${chord}:`, status);

      if (status.isPlaying) {
        console.log(`${chord} is already playing. Stopping first...`);
        await sound.stopAsync();
      }

      console.log(`Playing ${chord}...`);
      await sound.playAsync();
      console.log(`${chord} playback started`);
    } catch (e) {
      console.log('Error in playChord:', e);
    }
  }

  function playRandomChord() {
    let randomChord;
    do {
      randomChord = chords[Math.floor(Math.random() * chords.length)];
    } while (currentChord && randomChord === currentChord);

    setCurrentChord(randomChord);

    const shuffled = [...chords].sort(() => 0.5 - Math.random()).slice(0, 4);
    if (!shuffled.includes(randomChord)) shuffled[0] = randomChord;
    let s = shuffled.sort(() => 0.5 - Math.random());
    setOptions(s);

    setMessage('Guess the chord!');
    setButtonLabel('Next');
    playChord(randomChord);
    setClickedOption(null);
  }
  // Animated values for 4 options (since you always show 4)
  const optionShake = useRef(
    Array(4)
      .fill(0)
      .map(() => new Animated.Value(0))
  ).current;

  const optionScale = useRef(
    Array(4)
      .fill(0)
      .map(() => new Animated.Value(1))
  ).current;

  function checkAnswer(selected) {
    if (selected === currentChord) {
      setMessage('✅ Correct!');
      triggerScale();
    } else {
      setMessage('❌ Try Again!');
      triggerShake(); // Animate button on wrong answer
    }
  }

  function handleOptionClick(selected, index) {
    if (!clickedOption) {
      setClickedOption(selected);
      console.log(
        'SELECTED',
        selected,
        'CURRENT CHORD',
        currentChord,
        selected === currentChord
      );
      if (selected === currentChord) {
        console.log('trigging sclae');
        setScore((prev) => prev + 10);

        triggerScale(index);
      } else {
        triggerShake(index); // Wrong answer animation
        setScore(0);
      }
    }
  }

  function triggerShake(index) {
    optionShake[index].setValue(0);
    Animated.sequence([
      Animated.timing(optionShake[index], {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(optionShake[index], {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(optionShake[index], {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(optionShake[index], {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function triggerScale(index) {
    console.log('trigged sclae');
    optionScale[index].setValue(1);
    Animated.sequence([
      Animated.timing(optionScale[index], {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(optionScale[index], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }

  return (
    <View style={styles.container}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          marginBottom: 8,
          justifyContent: 'center',
        }}>
        <Text style={styles.scoreText}>Score: {score}</Text>
        <Text style={styles.highScoreText}>High: {highScore}</Text> 
      </View>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flexGrow: 1,
        }}>
        <Text style={styles.title}>Select the right chord!</Text>
        {/* Replay button */}
        {currentChord && (
          <TouchableOpacity onPress={replayChord} style={styles.replayButton}>
            <Ionicons
              name="refresh"
              size={20}
              color={theme === 'dark' ? '#fff' : '#000'}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.replayButtonText}>Replay {currentChord}</Text>
          </TouchableOpacity>
        )}
        <View style={styles.optionsContainer}>
          {options.map((opt, index) => {
            const isClicked = clickedOption === opt;
            const isCorrect = opt === currentChord;
            const revealedCorrect = !isClicked && !!clickedOption && isCorrect; // correct but not clicked, and user already clicked wrong
            const showWhiteText = isClicked || revealedCorrect;

            return (
              <Animated.View
                key={index}
                style={[
                  {
                    transform: [
                      { translateX: optionShake[index] },
                      { scale: optionScale[index] },
                    ],
                  },
                  styles.optionWrapper,
                ]}>
                <TouchableOpacity
                  onPress={() => handleOptionClick(opt, index)}
                  disabled={!!clickedOption}
                  style={[
                    styles.option,
                    isClicked &&
                      (isCorrect ? styles.correctOption : styles.wrongOption),
                    revealedCorrect && styles.correctOption, // reveal the correct one when user already clicked wrong
                  ]}>
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color: showWhiteText
                          ? '#fff'
                          : theme == 'dark'
                          ? '#eee'
                          : '#111',
                      }, // <-- use our boolean
                    ]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
        {/* Animated Button */}
        <Animated.View
          style={{
            width: '100%',
            alignItems: 'center', // ✅ Center the button horizontally
            transform: [{ translateX: shakeAnim }, { scale: scaleAnim }],
          }}>
          <TouchableOpacity onPress={playRandomChord} style={styles.nextButton}>
            <Text style={styles.nextButtonText}>{buttonLabel}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const createStyles = (d) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: d ? '#111' : '#eee' },

    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: d ? '#eee' : '#111',
    },
    message: { fontSize: 18, marginVertical: 10, fontWeight: 'bold' },
    optionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      width: '90%',
      marginBottom: 10,
    },

    optionWrapper: {
      width: '45%', // ✅ Animated.View gets width
      marginVertical: 10,
    },

    option: {
      width: '100%', // ✅ Touchable fills wrapper
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      backgroundColor: d ? '#444' : '#ddd',
    },

    correctOption: { backgroundColor: '#28a745' },

    wrongOption: { backgroundColor: '#dc3545' },
    optionText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: d ? '#eee' : '#111',
    },
    nextButton: {
      alignSelf: 'stretch', // <-- makes it fill parent's width
      // marginHorizontal: horizontalMargin, // <-- gives same left/right padding as image
      padding: 15,
      backgroundColor: '#007BFF',
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 20,
    },

    nextButtonDisabled: { backgroundColor: '#7CB5F2' },

    nextButtonText: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
    replayButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 10,
      backgroundColor: d ? '#6c757d' : '#ddd',
      borderRadius: 8,
      marginBottom: 12,
      // width: 140, // not full width anymore
      alignSelf: 'center',
    },
    replayButtonText: {
      fontSize: 16,
      color: d ? '#fff' : '#000',
      fontWeight: '600',
    },
    scoreText: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
      color: d ? '#ddd' : '#333',
    },
    highScoreText: {
      fontSize: 14,
      fontWeight: '600',
      color: d ? '#ccc' : '#666',
    },
  });
