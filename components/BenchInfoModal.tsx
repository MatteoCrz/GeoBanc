import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

const { width } = Dimensions.get('window');

interface BenchInfo {
  id: string;
  location: {
    coordinates: [number, number];
  };
  average_rating: string | number;
  ratings_count: string | number;
  properties?: any;
  createdAt: string;
  updatedAt: string;
  ratings?: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
      id: string;
      username: string;
    };
  }>;
  photos?: Array<{
    id: string;
    url: string;
    createdAt: string;
    user: {
      id: string;
      username: string;
    };
  }>;
}

interface BenchInfoModalProps {
  visible: boolean;
  bench: BenchInfo | null;
  onClose: () => void;
}

export default function BenchInfoModal({ visible, bench, onClose }: BenchInfoModalProps) {
  if (!bench) return null;

  const renderStars = (rating: string | number) => {
    const stars = [];
    const safeRating = parseFloat(String(rating)) || 0;
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Text key={i} style={styles.star}>⭐</Text>);
    }
    if (hasHalfStar) {
      stars.push(<Text key="half" style={styles.star}>⭐</Text>);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Text key={i} style={styles.emptyStar}>☆</Text>);
    }
    return stars;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Informations du banc
          </ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Rating Section */}
          <View style={styles.section}>
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars(bench.average_rating)}
              </View>
              <ThemedText style={styles.ratingText}>
                {(parseFloat(String(bench.average_rating)) || 0).toFixed(1)} / 5
              </ThemedText>
              <ThemedText style={styles.ratingsCount}>
                ({parseInt(String(bench.ratings_count)) || 0} avis)
              </ThemedText>
            </View>
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              📍 Localisation
            </ThemedText>
            <ThemedText style={styles.coordinates}>
              Lat: {bench.location.coordinates[1].toFixed(6)}
            </ThemedText>
            <ThemedText style={styles.coordinates}>
              Lng: {bench.location.coordinates[0].toFixed(6)}
            </ThemedText>
          </View>

          {/* Properties Section */}
          {bench.properties && Object.keys(bench.properties).length > 0 && (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                ℹ️ Propriétés
              </ThemedText>
              {Object.entries(bench.properties).map(([key, value]) => (
                <View key={key} style={styles.propertyRow}>
                  <ThemedText style={styles.propertyKey}>{key}:</ThemedText>
                  <ThemedText style={styles.propertyValue}>
                    {String(value)}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}

          {/* Photos Section */}
          {bench.photos && bench.photos.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                📸 Photos ({bench.photos.length})
              </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {bench.photos.map((photo) => (
                  <View key={photo.id} style={styles.photoContainer}>
                    <Image source={{ uri: photo.url }} style={styles.photo} />
                    <ThemedText style={styles.photoAuthor}>
                      Par {photo.user.username}
                    </ThemedText>
                    <ThemedText style={styles.photoDate}>
                      {formatDate(photo.createdAt)}
                    </ThemedText>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Recent Reviews Section */}
          {bench.ratings && bench.ratings.length > 0 && (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                💬 Avis récents
              </ThemedText>
              {bench.ratings.slice(0, 3).map((rating) => (
                <View key={rating.id} style={styles.reviewContainer}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewStars}>
                      {renderStars(rating.rating)}
                    </View>
                    <ThemedText style={styles.reviewAuthor}>
                      {rating.user.username}
                    </ThemedText>
                    <ThemedText style={styles.reviewDate}>
                      {formatDate(rating.createdAt)}
                    </ThemedText>
                  </View>
                  {rating.comment && (
                    <ThemedText style={styles.reviewComment}>
                      "{rating.comment}"
                    </ThemedText>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Metadata Section */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              🕒 Informations
            </ThemedText>
            <View style={styles.metadataRow}>
              <ThemedText style={styles.metadataLabel}>ID:</ThemedText>
              <ThemedText style={styles.metadataValue}>
                {bench.id.slice(0, 8)}...
              </ThemedText>
            </View>
            <View style={styles.metadataRow}>
              <ThemedText style={styles.metadataLabel}>Ajouté le:</ThemedText>
              <ThemedText style={styles.metadataValue}>
                {formatDate(bench.createdAt)}
              </ThemedText>
            </View>
            <View style={styles.metadataRow}>
              <ThemedText style={styles.metadataLabel}>Mis à jour:</ThemedText>
              <ThemedText style={styles.metadataValue}>
                {formatDate(bench.updatedAt)}
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  ratingContainer: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  star: {
    fontSize: 24,
    marginHorizontal: 2,
  },
  emptyStar: {
    fontSize: 24,
    marginHorizontal: 2,
    color: '#ddd',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ratingsCount: {
    fontSize: 14,
    color: '#666',
  },
  coordinates: {
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  propertyRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  propertyKey: {
    fontWeight: '600',
    marginRight: 8,
    minWidth: 100,
  },
  propertyValue: {
    flex: 1,
  },
  photoContainer: {
    marginRight: 16,
    alignItems: 'center',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  photoAuthor: {
    fontSize: 12,
    fontWeight: '600',
  },
  photoDate: {
    fontSize: 10,
    color: '#666',
  },
  reviewContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewStars: {
    flexDirection: 'row',
    marginRight: 12,
  },
  reviewAuthor: {
    fontWeight: '600',
    marginRight: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 'auto',
  },
  reviewComment: {
    fontStyle: 'italic',
    lineHeight: 20,
  },
  metadataRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metadataLabel: {
    fontWeight: '600',
    marginRight: 8,
    minWidth: 80,
  },
  metadataValue: {
    flex: 1,
    color: '#666',
  },
});
