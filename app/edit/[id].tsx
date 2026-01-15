import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../src/constants/theme';
import { useCards } from '../../src/hooks/useCards';
import { StorageService } from '../../src/services/storage';
import { KNOWN_STORES, RewardCard } from '../../src/types';

export default function EditCardScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { updateCard, deleteCard } = useCards();
  
  const [card, setCard] = useState<RewardCard | null>(null);
  const [storeName, setStoreName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCard();
  }, [id]);

  const loadCard = async () => {
    if (!id) return;
    
    try {
      const loadedCard = await StorageService.getCard(id);
      if (loadedCard) {
        setCard(loadedCard);
        setStoreName(loadedCard.storeName);
        setImageUri(loadedCard.imageUri);
      }
    } catch (error) {
      console.error('Error loading card:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Permission Needed',
          'Please allow photo access to choose your card screenshot.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        aspect: [16, 9],
      });

      if (!result.canceled && result.assets?.[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', `Could not open your photos: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleSave = async () => {
    if (!id) return;

    if (!storeName.trim()) {
      Alert.alert('Missing Name', 'Please enter a store name.');
      return;
    }

    if (!imageUri) {
      Alert.alert('Missing Image', 'Please select an image of your reward card.');
      return;
    }

    setSaving(true);
    try {
      await updateCard(id, {
        storeName: storeName.trim(),
        imageUri,
        storeLocations: undefined, // no stored coordinates; detection uses place name
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save card. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!id) return;

    Alert.alert(
      'Delete Card',
      `Are you sure you want to delete ${storeName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCard(id);
            router.back();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!card) {
    return (
      <View style={styles.errorContainer}>
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

  const storeNames = Object.keys(KNOWN_STORES);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.lg },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image Picker */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
          ) : (
            <View style={styles.imagePickerPlaceholder}>
              <View style={styles.imagePickerIconWrapper}>
                <Ionicons name="camera" size={32} color={Colors.primary} />
              </View>
              <Text style={styles.imagePickerText}>Tap to select card image</Text>
            </View>
          )}
          <View style={styles.changeImageBadge}>
            <Ionicons name="camera" size={16} color={Colors.textOnPrimary} />
          </View>
        </TouchableOpacity>

        {/* Store Name Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Store Name</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="storefront-outline" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.input}
              value={storeName}
              onChangeText={setStoreName}
              placeholder="e.g., Tesco, Lidl, Boots"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Quick Select Stores */}
        <View style={styles.quickSelectSection}>
          <Text style={styles.label}>Quick Select</Text>
          <View style={styles.storeChips}>
            {storeNames.slice(0, 12).map((store) => (
              <TouchableOpacity
                key={store}
                style={[
                  styles.storeChip,
                  storeName === store && styles.storeChipActive,
                ]}
                onPress={() => setStoreName(store)}
              >
                <Text
                  style={[
                    styles.storeChipText,
                    storeName === store && styles.storeChipTextActive,
                  ]}
                >
                  {store}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={Colors.textOnPrimary} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color={Colors.textOnPrimary} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash" size={20} color={Colors.error} />
          <Text style={styles.deleteButtonText}>Delete Card</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  imagePicker: {
    aspectRatio: 16 / 9,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  imagePickerPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.xl,
    margin: 2,
  },
  imagePickerIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  imagePickerText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  changeImageBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  inputSection: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.text,
  },
  quickSelectSection: {
    marginBottom: Spacing.lg,
  },
  storeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  storeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  storeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  storeChipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  storeChipTextActive: {
    color: Colors.textOnPrimary,
    fontWeight: Typography.weights.medium,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    marginTop: Spacing.md,
    ...Shadows.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textOnPrimary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error + '10',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  deleteButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.error,
  },
});
