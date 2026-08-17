import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3000';

export default function CreateListingScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [itemType, setItemType] = useState('cooked');
  const [isVeg, setIsVeg] = useState(true);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [address, setAddress] = useState('');
  const [pickupStart, setPickupStart] = useState(new Date());
  const [pickupEnd, setPickupEnd] = useState(new Date(Date.now() + 3600000));
  const [showPickupStartPicker, setShowPickupStartPicker] = useState(false);
  const [showPickupEndPicker, setShowPickupEndPicker] = useState(false);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGetLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Location access denied');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      // Get address from coordinates
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        setAddress(`${addr.street}, ${addr.city}, ${addr.region}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const handleCreateListing = async () => {
    if (!title || !quantity || !address || !location) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');

      const response = await axios.post(
        `${API_URL}/listings`,
        {
          title,
          description,
          item_type: itemType,
          veg: isVeg,
          quantity: parseFloat(quantity),
          unit,
          address,
          latitude: location.latitude,
          longitude: location.longitude,
          pickup_start: pickupStart,
          pickup_end: pickupEnd,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Success', 'Donation created successfully!');
      // Reset form
      setTitle('');
      setDescription('');
      setQuantity('');
      setAddress('');
      setItemType('cooked');
      setIsVeg(true);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate, isStart) => {
    if (isStart) {
      setShowPickupStartPicker(false);
      if (selectedDate) setPickupStart(selectedDate);
    } else {
      setShowPickupEndPicker(false);
      if (selectedDate) setPickupEnd(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.heading}>Share Your Donation</Text>

      <View style={styles.form}>
        {/* Title */}
        <Text style={styles.label}>Donation Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Fresh Biryani, Mixed Vegetables"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#999"
        />

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Additional details about the food..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          placeholderTextColor="#999"
        />

        {/* Item Type */}
        <Text style={styles.label}>Food Type *</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, itemType === 'cooked' && styles.typeButtonActive]}
            onPress={() => setItemType('cooked')}
          >
            <Text style={[styles.typeButtonText, itemType === 'cooked' && styles.typeButtonTextActive]}>
              Cooked
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, itemType === 'raw' && styles.typeButtonActive]}
            onPress={() => setItemType('raw')}
          >
            <Text style={[styles.typeButtonText, itemType === 'raw' && styles.typeButtonTextActive]}>
              Raw
            </Text>
          </TouchableOpacity>
        </View>

        {/* Veg Toggle */}
        <View style={styles.vegToggle}>
          <Text style={styles.label}>Vegetarian</Text>
          <Switch
            value={isVeg}
            onValueChange={setIsVeg}
            trackColor={{ false: '#ccc', true: '#27ae60' }}
          />
        </View>

        {/* Quantity */}
        <Text style={styles.label}>Quantity *</Text>
        <View style={styles.quantityInput}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Enter quantity"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="decimal-pad"
            placeholderTextColor="#999"
          />
          <TextInput
            style={[styles.input, { flex: 0.3, marginLeft: 8 }]}
            placeholder="Unit"
            value={unit}
            onChangeText={setUnit}
            placeholderTextColor="#999"
          />
        </View>

        {/* Address */}
        <Text style={styles.label}>Pickup Location *</Text>
        <View style={styles.locationInput}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Enter pickup address"
            value={address}
            onChangeText={setAddress}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.locationButton} onPress={handleGetLocation}>
            <Text style={styles.locationButtonText}>📍</Text>
          </TouchableOpacity>
        </View>

        {/* Pickup Time */}
        <Text style={styles.label}>Pickup Window *</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowPickupStartPicker(true)}
        >
          <Text style={styles.dateText}>
            Start: {pickupStart.toLocaleString()}
          </Text>
        </TouchableOpacity>

        {showPickupStartPicker && (
          <DateTimePicker
            value={pickupStart}
            mode="datetime"
            display="default"
            onChange={(e, date) => handleDateChange(e, date, true)}
          />
        )}

        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowPickupEndPicker(true)}
        >
          <Text style={styles.dateText}>
            End: {pickupEnd.toLocaleString()}
          </Text>
        </TouchableOpacity>

        {showPickupEndPicker && (
          <DateTimePicker
            value={pickupEnd}
            mode="datetime"
            display="default"
            onChange={(e, date) => handleDateChange(e, date, false)}
          />
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleCreateListing}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Share Donation</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  form: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 14,
    color: '#000',
  },
  textArea: {
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  vegToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 16,
  },
  quantityInput: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  locationInput: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  locationButton: {
    padding: 12,
    marginLeft: -4,
  },
  locationButtonText: {
    fontSize: 20,
  },
  dateText: {
    color: '#000',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
