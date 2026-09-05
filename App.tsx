import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Navbar } from './src/components/rn/Navbar';
import { PlaybookCatalog } from './src/components/rn/PlaybookCatalog';
import { PlaybookEditor } from './src/components/rn/PlaybookEditor';
import { IncidentSimulator } from './src/components/rn/IncidentSimulator';
import { ExecutionRunner } from './src/components/rn/ExecutionRunner';
import { AnalyticsView } from './src/components/rn/AnalyticsView';
import { useRunbookStore } from './src/store/useRunbookStore';
import type { Playbook } from './src/types/runbook';

export default function App() {
  const { activeTab, loadSavedData } = useRunbookStore();
  const [editingPlaybook, setEditingPlaybook] = useState<Playbook | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (loadSavedData) {
      loadSavedData().finally(() => setIsLoaded(true));
    } else {
      setIsLoaded(true);
    }
  }, []);

  const handleEditPlaybook = (playbook?: Playbook) => {
    setEditingPlaybook(playbook);
    setIsEditing(true);
  };

  const handleBackFromEditor = () => {
    setIsEditing(false);
    setEditingPlaybook(undefined);
  };

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        <Navbar />

        <View style={styles.content}>
          {activeTab === 'playbooks' && (
            isEditing ? (
              <PlaybookEditor playbook={editingPlaybook} onBack={handleBackFromEditor} />
            ) : (
              <PlaybookCatalog onEditPlaybook={handleEditPlaybook} />
            )
          )}

          {activeTab === 'runner' && <ExecutionRunner />}

          {activeTab === 'simulator' && <IncidentSimulator />}

          {activeTab === 'analytics' && <AnalyticsView />}
        </View>
        </SafeAreaView>
</SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
  },
});
