import React, { useState } from "react";
import { View, StyleSheet, Dimensions, Image, Text, TouchableOpacity, Animated } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Reanimated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  interpolate,
  Extrapolate
} from "react-native-reanimated";

const { width: wWidth, height } = Dimensions.get("window");

const aspectRatio = 722 / 368;
const CARD_WIDTH = wWidth - 128;
const CARD_HEIGHT = CARD_WIDTH * aspectRatio;
const IMAGE_WIDTH = CARD_WIDTH * 0.9;

interface CardProps {
  card: {
    name: string;
    description: string;
    image: string;
  };
  index: number;
  onFlip?: () => void;
  isRevealed?: boolean;
  position?: 'left' | 'center' | 'right';
  meaning?: string;
}

export const Card = ({ 
  card: { name, description, image }, 
  index, 
  onFlip, 
  isRevealed = false,
  position = 'center',
  meaning = ''
}: CardProps) => {
  const flip = useSharedValue(isRevealed ? 1 : 0);
  const [isFlipped, setIsFlipped] = useState(isRevealed);
  
  // API image URL (we use localhost:3000 since that's where the API is running)
  const imageUrl = `http://localhost:3000${image}`;
  
  const handleFlip = () => {
    const newValue = flip.value === 0 ? 1 : 0;
    flip.value = withTiming(newValue, { duration: 500 });
    setIsFlipped(newValue === 1);
    if (onFlip) {
      onFlip();
    }
  };

  const frontStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { 
          rotateY: interpolate(
            flip.value, 
            [0, 1], 
            [0, 180], 
            Extrapolate.CLAMP
          ) + 'deg' 
        }
      ],
      opacity: interpolate(
        flip.value,
        [0, 0.5, 1],
        [1, 0, 0],
        Extrapolate.CLAMP
      )
    };
  });

  const backStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { 
          rotateY: interpolate(
            flip.value, 
            [0, 1], 
            [180, 360], 
            Extrapolate.CLAMP
          ) + 'deg' 
        }
      ],
      opacity: interpolate(
        flip.value,
        [0, 0.5, 1],
        [0, 0, 1],
        Extrapolate.CLAMP
      )
    };
  });

  // Different positions for the 3-card spread
  let positionStyle = {};
  if (position === 'left') {
    positionStyle = { left: -CARD_WIDTH / 2 };
  } else if (position === 'right') {
    positionStyle = { left: CARD_WIDTH / 2 };
  }

  return (
    <View style={[styles.container, positionStyle]} pointerEvents="box-none">
      <TouchableOpacity onPress={handleFlip} activeOpacity={0.9}>
        <Reanimated.View style={[styles.cardContainer]}>
          {/* Card Front (Back of the tarot card) */}
          <Reanimated.View style={[styles.card, styles.cardFace, frontStyle]}>
            <Image
              source={require('./assets/card-back.png')}
              style={{
                width: IMAGE_WIDTH,
                height: IMAGE_WIDTH * aspectRatio,
              }}
              resizeMode="contain"
            />
          </Reanimated.View>
          
          {/* Card Back (Front of the tarot card with the image) */}
          <Reanimated.View style={[styles.card, styles.cardFace, styles.cardBack, backStyle]}>
            <Image
              source={{ uri: imageUrl }}
              style={{
                width: IMAGE_WIDTH * 0.8,
                height: IMAGE_WIDTH * aspectRatio * 0.6,
                borderRadius: 8,
                marginBottom: 10,
              }}
              resizeMode="cover"
            />
            <Text style={styles.cardTitle}>{name}</Text>
            {meaning ? (
              <Text style={styles.cardMeaning}>{meaning}</Text>
            ) : null}
          </Reanimated.View>
        </Reanimated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: "center",
    alignItems: "center",
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backfaceVisibility: 'hidden',
  },
  cardFace: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardBack: {
    backgroundColor: '#FFFFFF',
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 5,
  },
  cardMeaning: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 5,
  }
});
