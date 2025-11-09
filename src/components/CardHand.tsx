import React, { useRef } from 'react';
import { View, StyleSheet, FlatList, Animated } from 'react-native';
import { CardState } from '../types';
import Card from './Card';
import { CARD_DIMENSIONS } from '../constants/dimensions';

interface CardHandProps {
  cards: CardState[];
  revealed?: boolean;
  onCardSelect?: (cardIndex: number) => void;
  selectedCardIndex?: number | null;
  showImages?: boolean;
}

export default function CardHand({
  cards,
  revealed = false,
  onCardSelect,
  selectedCardIndex = null,
  showImages = true,
}: CardHandProps) {
  const animatedValues = useRef(
    cards.map(() => new Animated.Value(0))
  ).current;

  React.useEffect(() => {
    // Animações de entrada
    const animations = animatedValues.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      })
    );

    Animated.stagger(50, animations).start();
  }, [cards.length]);

  const renderCard = ({ item, index }: { item: CardState; index: number }) => {
    const animatedStyle = {
      opacity: animatedValues[index],
      transform: [
        {
          translateY: animatedValues[index].interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          }),
        },
        {
          scale: selectedCardIndex === index
            ? animatedValues[index].interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.1],
              })
            : 1,
        },
      ],
    };

    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          animatedStyle,
          selectedCardIndex === index && styles.selectedCard,
        ]}
      >
        <Card
          character={item.type}
          revealed={revealed}
          size="hand"
          onPress={() => onCardSelect?.(index)}
          showImage={showImages}
        />
        {selectedCardIndex === index && (
          <View style={styles.selectedIndicator} />
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(_, index) => `card-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => (
          <View style={{ width: CARD_DIMENSIONS.marginBetweenCards }} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  listContent: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cardWrapper: {
    position: 'relative',
  },
  selectedCard: {
    zIndex: 10,
  },
  selectedIndicator: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderWidth: 3,
    borderColor: '#f39c12',
    borderRadius: CARD_DIMENSIONS.borderRadius + 4,
    borderStyle: 'dashed',
  },
});

