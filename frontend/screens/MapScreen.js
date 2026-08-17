import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    getLocationAndListings();
  }, []);

  const getLocationAndListings = async () => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location access is required to find nearby donations');
        setLoading(false);
        return;
      }

      // Get current location
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      // Fetch nearby listings
      const response = await axios.get(`${API_URL}/listings/nearby`, {
        params: {
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          radius: 5,
        },
      });

      setListings(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load donations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !location) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#27ae60" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* User location marker */}
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="Your Location"
          pinColor="#27ae60"
        />

        {/* Listings markers */}
        {listings.map((listing) => (
          <Marker
            key={listing.id}
            coordinate={{
              latitude: parseFloat(listing.latitude),
              longitude: parseFloat(listing.longitude),
            }}
            title={listing.title}
            description={`${listing.quantity} ${listing.unit}`}
            onPress={() => setSelectedListing(listing)}
          />
        ))}
      </MapView>

      {/* Selected listing details */}
      {selectedListing && (
        <View style={styles.listingDetail}>
          <Text style={styles.listingTitle}>{selectedListing.title}</Text>
          <Text style={styles.listingDescription}>{selectedListing.description}</Text>
          <View style={styles.listingInfo}>
            <Text style={styles.infoText}>Quantity: {selectedListing.quantity} {selectedListing.unit}</Text>
            <Text style={styles.infoText}>Type: {selectedListing.item_type}</Text>
            <Text style={styles.infoText}>Veg: {selectedListing.veg ? 'Yes' : 'No'}</Text>
          </View>
          <TouchableOpacity style={styles.requestButton}>
            <Text style={styles.requestButtonText}>Request Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Listings list fallback */}
      {listings.length > 0 && !selectedListing && (
        <View style={styles.listingsContainer}>
          <Text style={styles.listingsTitle}>Available Donations ({listings.length})</Text>
          <FlatList
            data={listings}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.listingCard}
                onPress={() => setSelectedListing(item)}
              >
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardInfo}>{item.quantity} {item.unit}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  listingDetail: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: -20,
    elevation: 5,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  listingDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  listingInfo: {
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#555',
    marginVertical: 4,
  },
  requestButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  requestButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listingsContainer: {
    backgroundColor: '#f9f9f9',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  listingsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  listingCard: {
    backgroundColor: '#fff',
    marginHorizontal: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 150,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000',
  },
  cardInfo: {
    fontSize: 12,
    color: '#27ae60',
    marginTop: 4,
  },
});
