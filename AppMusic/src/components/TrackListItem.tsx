import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Track } from 'react-native-track-player';
import Icon from 'react-native-vector-icons/Ionicons';
import { fontSize } from '../constants/tokens';
import { unknownTrackImageUri } from '../constants/images';
import { TrackOptionsModal } from './TrackOptionsModal';
import { useAppThemeStyles } from '../hooks/useAppThemeStyles';

type Props = {
  track: Track;
  index?: number;
  showIndex?: boolean;
  showViews?: boolean;
  isActive?: boolean;
  onPress?: () => void;
};

export const TrackListItem = ({
  track,
  index,
  showIndex,
  showViews,
  isActive = false,
  onPress,
}: Props) => {
  const [showOptions, setShowOptions] = useState(false);
  const { colors } = useAppThemeStyles();

  const trackImage =
    typeof track.artwork === 'string'
      ? { uri: track.artwork }
      : unknownTrackImageUri;

  const isTopThree = showIndex && index !== undefined && index < 3;

  return (
    <>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View style={styles.container}>
          {showIndex && (
            <Text
              style={[
                styles.index,
                { color: isTopThree ? '#FF4136' : colors.subtext },
              ]}
            >
              {(index ?? 0) + 1}
            </Text>
          )}

          <Image source={trackImage} style={styles.image} resizeMode="cover" />

          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.title,
                { color: isActive ? colors.primary : colors.text },
              ]}
              numberOfLines={1}
            >
              {track.title || 'Unknown Title'}
            </Text>

            <View style={styles.rowText}>
              <Text
                style={[styles.artist, { color: colors.subtext }]}
                numberOfLines={1}
              >
                {track.artist || 'Unknown Artist'}
              </Text>
              {showViews && (
                <Text
                  style={[styles.views, { color: colors.subtext }]}
                  numberOfLines={1}
                >
                  • {track.views || 0} lượt nghe
                </Text>
              )}
            </View>
          </View>

          <Pressable onPress={() => setShowOptions(true)} hitSlop={10}>
            <Icon name="ellipsis-vertical" size={20} color={colors.subtext} />
          </Pressable>
        </View>
      </TouchableOpacity>

      <TrackOptionsModal
        visible={showOptions}
        onClose={() => setShowOptions(false)}
        track={track}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  index: {
    width: 24,
    fontWeight: 'bold',
    marginRight: 8,
    textAlign: 'center',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#222',
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  artist: {
    fontSize: fontSize.sm,
  },
  rowText: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  views: {
    fontSize: fontSize.sm,
    marginLeft: 6,
  },
});
