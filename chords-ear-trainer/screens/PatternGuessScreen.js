import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  ScrollView
} from 'react-native'; 
import {chordPatternsByDifficulty} from '../data';

export default function PatternGuessScreen() {
  const [currentChord, setCurrentChord] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Easy');
  const [clickedOption, setClickedOption] = useState(null);
  const [score, setScore] = useState(0);

const chordPatterns = chordPatternsByDifficulty[selectedDifficulty];
  // Animated values for each option
  const optionShake = useRef(
    chordPatterns.map(() => new Animated.Value(0))
  ).current;
  const optionScale = useRef(
    chordPatterns.map(() => new Animated.Value(1))
  ).current;

  useEffect(() => {
    generateNewQuestion();
  }, []);
    
function generateNewQuestion() {
  const patterns = chordPatternsByDifficulty[selectedDifficulty]; // ✅ Get based on difficulty
  let randomChord;
  do {
    randomChord = patterns[Math.floor(Math.random() * patterns.length)];
  } while (currentChord && randomChord.name === currentChord.name);

  setCurrentChord(randomChord);

  const shuffled = [...patterns].sort(() => 0.5 - Math.random()).slice(0, 4);
  if (!shuffled.includes(randomChord)) shuffled[0] = randomChord;
  setOptions(shuffled.sort(() => 0.5 - Math.random()));

  setClickedOption(null);
}
useEffect(() => {
  generateNewQuestion();
}, [selectedDifficulty]); // ✅ Runs whenever difficulty changes

  function handleOptionClick(selected, index) {
    if (!clickedOption) {
      setClickedOption(selected);
      if (selected === currentChord.name) {
        setScore(score + 10); // Correct answer
        triggerScale(index);
      } else {
        triggerShake(index); // Wrong answer animation
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
      {/* Difficulty Toggle */}
      <View style={styles.toggleContainer}>
        {['Easy', 'Medium', 'Hard'].map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.toggleButton,
              selectedDifficulty === level && styles.toggleButtonActive,
            ]}
            onPress={() => setSelectedDifficulty(level)}>
            <Text
              style={[
                styles.toggleText,
                selectedDifficulty === level && styles.toggleTextActive,
              ]}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Score Display */}
      <Text style={styles.scoreText}>Score: {score}</Text>
<ScrollView>
      {/* Main Content */}
      <View style={styles.content}>
        {currentChord && (
          <Image source={currentChord.image} style={styles.chordImage} />
        )}
        <View style={styles.optionsContainer}>
          {options.map((opt, index) => {
            const isClicked = clickedOption === opt.name;
            const isCorrect = opt.name === currentChord?.name;

            return (
              <Animated.View
                key={index}
                style={[
                  { transform: [{ translateX: optionShake[index] }, { scale: optionScale[index] }] },
                  styles.optionWrapper, // ✅ Added wrapper style
                ]}>
                <TouchableOpacity
                  onPress={() => handleOptionClick(opt.name, index)}
                  disabled={!!clickedOption}
                  style={[
                    styles.option,
                    isClicked &&
                      (isCorrect ? styles.correctOption : styles.wrongOption),
                  ]}>
                  <Text
                    style={[
                      styles.optionText,
                      { color: isClicked ? '#fff' : '#000' },
                    ]}>
                    {opt.name}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Next Button */}
        <TouchableOpacity
          onPress={generateNewQuestion}
          style={[
            styles.nextButton,
            !clickedOption && styles.nextButtonDisabled,
          ]}
          disabled={!clickedOption}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1},
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 5,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 2,
    borderRadius: 50,
    backgroundColor: '#eee',
  },
  toggleButtonActive: { backgroundColor: '#007BFF' },
  toggleText: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  toggleTextActive: { color: '#fff' },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
chordImage: {
  width: '80%',       // ✅ Width is 80% of parent
  aspectRatio: 3 / 4, // ✅ Maintains aspect ratio (width:height)
  resizeMode: 'contain',
  marginVertical: 0,
}, 
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
    backgroundColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },

  correctOption: { backgroundColor: '#28a745' },
  wrongOption: { backgroundColor: '#dc3545' },
  optionText: { fontSize: 18, fontWeight: 'bold' },
  nextButton: {
    width: '90%',
    padding: 15,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  nextButtonDisabled: { backgroundColor: '#7CB5F2' },
  nextButtonText: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
});
