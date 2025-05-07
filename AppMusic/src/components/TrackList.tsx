import React from 'react';
import {
  FlatList,
  FlatListProps,
  View,
  StyleSheet,
} from 'react-native';
import { Track } from 'react-native-track-player';
import { TrackListItem } from './TrackListItem';
import { useAppThemeStyles } from '../hooks/useAppThemeStyles';

export type TrackListProps = Partial<FlatListProps<Track>> & {
  tracks: Track[];
  activeTrackId?: string;
  onTrackPress?: (track: Track) => void;
  showIndex?: boolean;
  showViews?: boolean;
};

const ItemDivider = () => {
  const { colors } = useAppThemeStyles();
  return <View style={[styles.itemSeparator, { backgroundColor: colors.border }]} />;
};

export const TracksList = ({
  tracks,
  activeTrackId,
  onTrackPress,
  showIndex = false,
  showViews = false,
  ...flatlistProps
}: TrackListProps) => {
  return (
    <FlatList
      data={tracks}
      contentContainerStyle={styles.container}
      ListFooterComponent={ItemDivider}
      ItemSeparatorComponent={ItemDivider}
      renderItem={({ item: track, index }) => (
        <TrackListItem
          track={track}
          index={index}
          showIndex={showIndex}
          showViews={showViews}
          isActive={track.id === activeTrackId}
          onPress={() => onTrackPress?.(track)}
        />
      )}
      keyExtractor={(item) => item.id?.toString() ?? Math.random().toString()}
      {...flatlistProps}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 128,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 9,
    marginLeft: 60,
  },
});
