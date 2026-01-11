import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../src/constants/theme';
import { useCards } from '../src/hooks/useCards';
import { useLocation } from '../src/hooks/useLocation';
import { RewardCard } from '../src/types';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cards, loading: cardsLoading, refreshCards } = useCards();
  const { location, loading: locationLoading, refreshLocation, hasPermission, requestPermission, detectNearbyCardByPlace } = useLocation();
  const [nearbyCard, setNearbyCard] = useState<RewardCard | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Refresh cards and location every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshCards();
      if (hasPermission) {
        refreshLocation();
      }
    }, [refreshCards, refreshLocation, hasPermission])
  );

  // Detect nearby card based on place name (reverse geocoding)
  useEffect(() => {
    const detectNearby = async () => {
      if (cards.length === 0) {
        setNearbyCard(null);
        return;
      }

      if (location) {
        // Use GPS location - detect by place name
        const nearby = await detectNearbyCardByPlace(cards);
        setNearbyCard(nearby);
      } else {
        setNearbyCard(null);
      }
    };

    detectNearby();
  }, [location, cards, detectNearbyCardByPlace]);

  useEffect(() => {
    if (hasPermission) {
      refreshLocation();
    }
  }, [hasPermission]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshCards(), refreshLocation()]);
    setRefreshing(false);
  }, [refreshCards, refreshLocation]);

  const handleEnableLocation = async () => {
    await requestPermission();
    if (hasPermission) {
      refreshLocation();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Ionicons name="wallet" size={32} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.greeting}>Welcome to</Text>
            <Text style={styles.title}>All Rewards</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Location Status */}
        {!hasPermission && (
          <TouchableOpacity style={styles.locationBanner} onPress={handleEnableLocation}>
            <View style={styles.locationIconContainer}>
              <Ionicons name="location" size={20} color={Colors.accent} />
            </View>
            <Text style={styles.locationBannerText}>
              Enable location to auto-detect stores
            </Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}


        {/* Nearby Card Section */}
        {nearbyCard ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Nearby Store Detected</Text>
            <TouchableOpacity
              style={styles.featuredCard}
              onPress={() => router.push(`/view/${nearbyCard.id}?fullscreen=true`)}
            >
              <Image
                source={{ uri: nearbyCard.imageUri }}
                style={styles.featuredCardImage}
                resizeMode="contain"
              />
              <View style={styles.featuredCardOverlay}>
                <Text style={styles.featuredCardName}>{nearbyCard.storeName}</Text>
                <Text style={styles.featuredCardHint}>Tap to show card →</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : cards.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {hasPermission && location
                ? '🔍 No nearby stores detected'
                : '💳 Your Cards'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {hasPermission && location
                ? 'Pull down to refresh or select a card below'
                : 'Select a card to view'}
            </Text>
          </View>
        ) : null}

        {/* Cards Grid */}
        {cards.length > 0 ? (
          <View style={styles.cardsGrid}>
            {cards.map((card, index) => (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.cardItem,
                  { backgroundColor: getCardColor(index) }
                ]}
                onPress={() => router.push(`/view/${card.id}`)}
              >
                <Image
                  source={{ uri: card.imageUri }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName} numberOfLines={1}>
                    {card.storeName}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="wallet-outline" size={64} color={Colors.primary} />
              <View style={styles.starBadge}>
                <Ionicons name="star" size={20} color={Colors.star} />
              </View>
            </View>
            <Text style={styles.emptyTitle}>No Reward Cards Yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your first reward card to get started. Take a screenshot of your loyalty card and add it here!
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/add')}
            >
              <Ionicons name="add-circle" size={20} color={Colors.textOnPrimary} />
              <Text style={styles.emptyButtonText}>Add Your First Card</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.md }]}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add')}
        >
          <Ionicons name="add" size={24} color={Colors.textOnPrimary} />
          <Text style={styles.addButtonText}>Add Card</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function getCardColor(index: number): string {
  const colors = [Colors.cardBlue, Colors.cardGreen, Colors.cardOrange, Colors.cardRed];
  return colors[index % colors.length] + '15';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 160,
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationBannerText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    fontWeight: Typography.weights.medium,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  featuredCard: {
    marginTop: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    ...Shadows.lg,
  },
  featuredCardImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.backgroundTertiary,
  },
  featuredCardOverlay: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
  },
  featuredCardName: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  featuredCardHint: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    marginTop: Spacing.xs,
    fontWeight: Typography.weights.medium,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  cardItem: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
  },
  cardImage: {
    width: '100%',
    height: 100,
    backgroundColor: Colors.backgroundTertiary,
  },
  cardInfo: {
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  cardName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  starBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  emptyTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  emptyButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textOnPrimary,
  },
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  addButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textOnPrimary,
  },
});
