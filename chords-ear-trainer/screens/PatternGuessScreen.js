import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { chordPatternsByDifficulty } from '../data';
import { ThemeContext } from '../ThemeContext';
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const horizontalMargin = 20; // adjust however fancy you feel

export default function PatternGuessScreen() {
  const [currentChord, setCurrentChord] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Easy');
  const [clickedOption, setClickedOption] = useState(null);
  const [score, setScore] = useState(0);
  const { theme } = React.useContext(ThemeContext);
  const styles = createStyles(theme == 'dark');
  const chordPatterns = chordPatternsByDifficulty[selectedDifficulty];

  // inside component
  const [imgHeight, setImgHeight] = useState(null);

  useEffect(() => {
    if (!currentChord) return;

    try {
      const src = Image.resolveAssetSource(currentChord.image);
      if (src && src.width && src.height) {
        const displayW = screenWidth - horizontalMargin * 2;
        const h = Math.min(
          screenHeight * 0.3,
          Math.round(displayW * (src.height / src.width))
        );
        setImgHeight(h);
        return;
      }
    } catch (err) {
      // Web fallback – since resolveAssetSource isn't supported
    }

    // fallback height (web or failure)
    setImgHeight(screenHeight * 0.25);
  }, [currentChord]);

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
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          width: '100%',
        }}>
        {/* Main Content */}
        <View style={styles.content}>
          {currentChord && (

<View style={{ position: 'relative' }}>
  <Image
    source={currentChord.image}
    style={[
      styles.chordImage,
      imgHeight ? { height: imgHeight } : {},
    ]}
    resizeMode="contain"
  />

  {/* Watermark overlay */}
  <View
    style={{
      position: 'absolute',
      top: '87%',   // adjust as needed
      left: '50%',  // adjust as needed
      transform: 'translateX(-50%)',
      width: 60,    // adjust size
      height: 10,
      backgroundColor: 'rgba(0,0,0,1)', // cover-up color
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
  </View>
</View>

          )}
          <View style={styles.optionsContainer}>
            {options.map((opt, index) => {
              const isClicked = clickedOption === opt.name;
              const isCorrect = opt.name === currentChord?.name;
              const revealedCorrect =
                !isClicked && !!clickedOption && isCorrect; // correct but not clicked, and user already clicked wrong
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
                    onPress={() => handleOptionClick(opt.name, index)}
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

const createStyles = (d) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: d ? '#111' : '#eee' },
    toggleContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: d ? '#222' : '#fff',
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
      backgroundColor: d ? '#333' : '#eee',
    },
    toggleButtonActive: { backgroundColor: '#007BFF' },
    toggleText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: d ? '#eee' : '#333',
    },
    toggleTextActive: { color: '#fff' },
    scoreText: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
      color: d ? '#ddd' : '#333',
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-start', // <-- stop stretching everything apart
      paddingVertical: 20,
    },
    chordImage: {
      width: screenWidth - horizontalMargin * 2,
      maxHeight: screenHeight * 0.3, // <-- cap image height to ~45% of screen
      resizeMode: 'contain',
      alignSelf: 'center',
      marginVertical: 10,
      tintColor: d ? 'white' : undefined,
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
  });
