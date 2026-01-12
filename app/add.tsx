import { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../src/constants/theme';
import { useCards } from '../src/hooks/useCards';
import { KNOWN_STORES } from '../src/types';

export default function AddCardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addCard } = useCards();
  
  const [storeName, setStoreName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photos to add reward card images.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      aspect: [16, 9],
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
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
      await addCard({
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
              <Text style={styles.imagePickerText}>Tap to add card image</Text>
              <Text style={styles.imagePickerHint}>
                Use a screenshot of your loyalty card
              </Text>
            </View>
          )}
          {imageUri && (
            <View style={styles.changeImageBadge}>
              <Ionicons name="camera" size={16} color={Colors.textOnPrimary} />
            </View>
          )}
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
              <Text style={styles.saveButtonText}>Save Card</Text>
            </>
          )}
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
    color: Colors.text,
    fontWeight: Typography.weights.medium,
  },
  imagePickerHint: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
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
});
