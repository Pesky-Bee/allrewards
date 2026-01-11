import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../src/constants/theme';
import { useCards } from '../src/hooks/useCards';
import { RewardCard } from '../src/types';

export default function CardsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cards, loading, deleteCard, refreshCards } = useCards();
  const [refreshing, setRefreshing] = useState(false);

  // Refresh cards every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshCards();
    }, [refreshCards])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshCards();
    setRefreshing(false);
  }, [refreshCards]);

  const handleDelete = (card: RewardCard) => {
    Alert.alert(
      'Delete Card',
      `Are you sure you want to delete ${card.storeName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCard(card.id),
        },
      ]
    );
  };

  const getCardAccent = (index: number): string => {
    const colors = [Colors.cardBlue, Colors.cardGreen, Colors.cardOrange, Colors.cardRed];
    return colors[index % colors.length];
  };

  const renderCard = ({ item, index }: { item: RewardCard; index: number }) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/view/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={[styles.cardAccent, { backgroundColor: getCardAccent(index) }]} />
        <Image
          source={{ uri: item.imageUri }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardName}>{item.storeName}</Text>
          <Text style={styles.cardDate}>
            Added {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/edit/${item.id}`)}
          >
            <Ionicons name="pencil" size={16} color={Colors.cardBlue} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDanger]}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash" size={16} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrapper}>
        <Ionicons name="wallet-outline" size={48} color={Colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>No Cards Yet</Text>
      <Text style={styles.emptySubtitle}>
        Add your first reward card to get started
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/add')}
      >
        <Ionicons name="add-circle" size={20} color={Colors.textOnPrimary} />
        <Text style={styles.addButtonText}>Add Card</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.lg },
          cards.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {cards.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + Spacing.lg }]}
          onPress={() => router.push('/add')}
        >
          <Ionicons name="add" size={28} color={Colors.textOnPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardContainer: {
    marginBottom: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.md,
  },
  cardAccent: {
    width: 4,
    height: '100%',
  },
  cardImage: {
    width: 72,
    height: 72,
    margin: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundTertiary,
  },
  cardContent: {
    flex: 1,
    paddingVertical: Spacing.md,
  },
  cardName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  cardDate: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  cardActions: {
    flexDirection: 'row',
    paddingRight: Spacing.md,
    gap: Spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.cardBlue + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonDanger: {
    backgroundColor: Colors.error + '15',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
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
    marginBottom: Spacing.lg,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
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
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
});
