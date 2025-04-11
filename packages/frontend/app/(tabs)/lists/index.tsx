import { StyleSheet, useWindowDimensions, View, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { FAB } from '@/components/ui/FAB';
import { useListLists } from '@/api/hooks/lists';
import { ListChecks } from 'lucide-react';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useState, useEffect } from 'react';

function ListsSkeleton({ contentWidth }: { contentWidth: number }) {
  const skeletonColor = useThemeColor({}, 'border');
  const cardBackground = useThemeColor({}, 'card');

  const skeletonItems = new Array(3).fill(0);

  return (
    <View style={[styles.content, { width: contentWidth }]}>
      <View style={styles.header}>
        <View
          style={[
            styles.skeleton,
            styles.skeletonTitle,
            { backgroundColor: skeletonColor },
          ]}
        />
      </View>

      {skeletonItems.map((_, index) => (
        <View key={index} style={[styles.card, { backgroundColor: cardBackground }]}>
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.skeleton,
                styles.skeletonIcon,
                { backgroundColor: skeletonColor },
              ]}
            />
            <View
              style={[
                styles.skeleton,
                styles.skeletonCardTitle,
                { backgroundColor: skeletonColor },
              ]}
            />
          </View>
          <View
            style={[
              styles.skeleton,
              styles.skeletonCardDescription,
              { backgroundColor: skeletonColor, marginLeft: 36 },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

export default function ListsScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const contentWidth = Math.min(800, screenWidth - 32);
  const iconColor = useThemeColor({}, 'text');
  const cardBackground = useThemeColor({}, 'card');
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const { data, isLoading, error, isFetching } = useListLists();

  useEffect(() => {
    if (isFirstLoad && !isLoading) {
      setIsFirstLoad(false);
    }
  }, [isLoading]);

  if (isLoading && isFirstLoad) {
    return (
      <ThemedView style={styles.container}>
        <ListsSkeleton contentWidth={contentWidth} />
        <FAB onPress={() => router.push('/lists/create')} />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.content, { width: contentWidth }]}>
          <View style={styles.header}>
            <ThemedText type="title">Lists</ThemedText>
          </View>
          <ThemedText>Error loading lists</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.content, { width: contentWidth }]}>
        <View style={styles.header}>
          <ThemedText type="title">Lists</ThemedText>
          {isFetching && <View style={styles.loadingIndicator} />}
        </View>

        <FlatList
          data={data?.data || []}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: { item: any }) => (
            <Pressable
              style={[styles.card, { backgroundColor: cardBackground }]}
              onPress={() => router.push(`/lists/${item.id}`)}
            >
              <View style={styles.cardHeader}>
                <ListChecks size={24} color={iconColor} style={styles.cardIcon} />
                <ThemedText style={styles.cardTitle}>{item.name}</ThemedText>
              </View>
              {item.description && (
                <ThemedText style={styles.cardDescription}>{item.description}</ThemedText>
              )}
            </Pressable>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>No lists found</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Create a list to get started
              </ThemedText>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />

        <FAB onPress={() => router.push('/lists/create')} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 80, // Space for FAB
  },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginLeft: 36, // Align with title after icon
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
  },
  skeleton: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  skeletonTitle: {
    height: 28,
    width: 120,
  },
  skeletonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  skeletonCardTitle: {
    height: 20,
    width: 180,
  },
  skeletonCardDescription: {
    height: 16,
    width: 240,
    marginTop: 8,
  },
  loadingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0066ff',
    marginLeft: 8,
  },
});
