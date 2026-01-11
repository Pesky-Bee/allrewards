import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Brightness from 'expo-brightness';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../src/constants/theme';
import { StorageService } from '../../src/services/storage';
import { RewardCard } from '../../src/types';

const { width } = Dimensions.get('window');

export default function ViewCardScreen() {
  const router = useRouter();
  const { id, fullscreen } = useLocalSearchParams<{ id: string; fullscreen?: string }>();
  const insets = useSafeAreaInsets();
  
  const [card, setCard] = useState<RewardCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(fullscreen === 'true');
  const savedBrightness = useRef<number>(-1); // -1 means not saved yet
  const initialFullscreen = useRef(fullscreen === 'true');

  // Set max brightness immediately if opening in fullscreen mode
  useEffect(() => {
    if (initialFullscreen.current) {
      const setInitialBrightness = async () => {
        try {
          const current = await Brightness.getBrightnessAsync();
          savedBrightness.current = current;
          await Brightness.setBrightnessAsync(1);
          // Also unlock orientation for fullscreen
          await ScreenOrientation.unlockAsync();
        } catch (e) {
          console.log('Failed to set initial brightness:', e);
        }
      };
      setInitialBrightness();
    }
  }, []);

  useEffect(() => {
    loadCard();
    
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, [id]);

  const loadCard = async () => {
    if (!id) return;
    
    try {
      const loadedCard = await StorageService.getCard(id);
      setCard(loadedCard);
    } catch (error) {
      console.error('Error loading card:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      // Exiting fullscreen - restore brightness and lock portrait
      try {
        // Use restoreSystemBrightnessAsync to return to system default
        await Brightness.restoreSystemBrightnessAsync();
      } catch (e) {
        // Fallback: try setting to saved value
        if (savedBrightness.current >= 0) {
          try {
            await Brightness.setBrightnessAsync(savedBrightness.current);
          } catch (e2) {}
        }
      }
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
      setIsFullscreen(false);
    } else {
      // Entering fullscreen - save current brightness, then set to max
      try {
        const current = await Brightness.getBrightnessAsync();
        savedBrightness.current = current;
        await Brightness.setBrightnessAsync(1);
      } catch (e) {
        console.log('Failed to set brightness:', e);
      }
      await ScreenOrientation.unlockAsync();
      setIsFullscreen(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!card) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorIconWrapper}>
          <Ionicons name="alert-circle" size={48} color={Colors.error} />
        </View>
        <Text style={styles.errorText}>Card not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isFullscreen) {
    return (
      <View style={styles.fullscreenContainer}>
        <StatusBar hidden />
        <TouchableOpacity
          style={styles.fullscreenImageContainer}
          onPress={toggleFullscreen}
          activeOpacity={1}
        >
          <Image
            source={{ uri: card.imageUri }}
            style={styles.fullscreenImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fullscreenCloseButton, { top: insets.top + Spacing.md }]}
          onPress={toggleFullscreen}
        >
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
        <View style={[styles.fullscreenHint, { bottom: insets.bottom + Spacing.lg }]}>
          <Text style={styles.fullscreenHintText}>Tap anywhere to exit fullscreen</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {card.storeName}
        </Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push(`/edit/${card.id}`)}
        >
          <Ionicons name="create-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Card Display */}
      <View style={styles.cardContainer}>
        <View style={styles.storeNameBadge}>
          <Ionicons name="storefront" size={16} color={Colors.primary} />
          <Text style={styles.storeNameText}>{card.storeName}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.cardWrapper}
          onPress={toggleFullscreen}
          activeOpacity={0.95}
        >
          <Image
            source={{ uri: card.imageUri }}
            style={styles.cardImage}
            resizeMode="contain"
          />
          <View style={styles.expandBadge}>
            <Ionicons name="expand" size={20} color="#FFF" />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.tapHint}>
          <Ionicons name="hand-left-outline" size={14} color={Colors.textMuted} /> Tap card to expand fullscreen
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={[styles.actions, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={toggleFullscreen}
        >
          <View style={[styles.actionIcon, { backgroundColor: Colors.primary + '15' }]}>
            <Ionicons name="expand" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.actionLabel}>Fullscreen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/edit/${card.id}`)}
        >
          <View style={[styles.actionIcon, { backgroundColor: Colors.cardBlue + '15' }]}>
            <Ionicons name="create" size={24} color={Colors.cardBlue} />
          </View>
          <Text style={styles.actionLabel}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/cards')}
        >
          <View style={[styles.actionIcon, { backgroundColor: Colors.accent + '15' }]}>
            <Ionicons name="wallet" size={24} color={Colors.accent} />
          </View>
          <Text style={styles.actionLabel}>All Cards</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: Typography.sizes.lg,
    color: Colors.text,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.lg,
  },
  backButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  backButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.textOnPrimary,
    fontWeight: Typography.weights.semibold,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  storeNameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  storeNameText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: width - Spacing.lg * 2,
    aspectRatio: 16 / 9,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  expandBadge: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapHint: {
    marginTop: Spacing.lg,
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  actionLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreenImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
  fullscreenCloseButton: {
    position: 'absolute',
    right: Spacing.md,
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenHint: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fullscreenHintText: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
