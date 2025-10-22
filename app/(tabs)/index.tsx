import { ThemedView } from '@/components/ThemedView';
import axios from 'axios';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { debounce } from 'lodash';

const getZoomLevel = (longitudeDelta: number) => {
  return Math.floor(Math.log2(360 / longitudeDelta));
};

export default function HomeScreen() {
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [points, setPoints] = useState<any[]>([]);
  const mapRef = useRef<MapView>(null);

  // 1. Center map on user location on initial load
  useEffect(() => {
    const locateUser = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        setMapRegion({
          latitude: 48.8566,
          longitude: 2.3522,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    };
    locateUser();
  }, []);

  // 2. Function to fetch clusters/benches from the backend
  const fetchPoints = useCallback(async (region: Region) => {
    if (!mapRef.current) return;

    try {
      const boundaries = await mapRef.current.getMapBoundaries();
      const bbox = [
        boundaries.southWest.longitude,
        boundaries.southWest.latitude,
        boundaries.northEast.longitude,
        boundaries.northEast.latitude,
      ].join(',');

      const zoom = getZoomLevel(region.longitudeDelta);

      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/benches?zoom=${zoom}&bbox=${bbox}`,
      );
      console.log('Data received from API:', JSON.stringify(response.data.features, null, 2));
      setPoints(response.data.features);
    } catch (error) {
      console.error('Failed to fetch points:', error);
    }
  }, []);

  // 3. Debounced version of the fetch function
  const debouncedFetchPoints = useRef(debounce(fetchPoints, 300)).current;



  console.log(`Rendering component with ${points.length} points.`);

  if (!mapRegion) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={mapRegion}
        showsUserLocation={true}
        onMapReady={() => mapRegion && fetchPoints(mapRegion)}
        onRegionChangeComplete={debouncedFetchPoints}
      >
        {points
        .filter(point => {
          if (!point || !point.geometry || !point.geometry.coordinates) return false;
          const [longitude, latitude] = point.geometry.coordinates;
          if (!isFinite(latitude) || !isFinite(longitude)) {
            console.warn('Invalid coordinates found, filtering point:', JSON.stringify(point));
            return false;
          }
          return true;
        })
        .map(point => {
          try {
            const [longitude, latitude] = point.geometry.coordinates;
            const coordinate = { latitude, longitude };

            if (point.properties.cluster) {
              return (
                <Marker coordinate={coordinate} key={point.id}>
                  <View style={styles.clusterContainer}>
                    <Text style={styles.clusterText}>{String(point.properties.point_count)}</Text>
                  </View>
                </Marker>
              );
            }

            return (
              <Marker
                key={point.id}
                coordinate={coordinate}
              />
            );
          } catch (e) {
            console.error('CRASH INSIDE MAP:', e, 'Point data:', JSON.stringify(point));
            return null;
          }
        })}
      </MapView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clusterContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 99, 71, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clusterText: {
    color: 'white',
    fontWeight: 'bold',
  },
});