import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRunbookStore } from '../../store/useRunbookStore';

export const AnalyticsView = () => {
  const { playbooks, completedSessions } = useRunbookStore();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0f172a', padding: 16 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Operational Analytics</Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <View style={{ flex: 1, backgroundColor: '#1e293b', padding: 12, borderRadius: 8 }}><Text style={{ color: '#94a3b8', fontSize: 12 }}>Playbooks</Text><Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{playbooks.length}</Text></View>
        <View style={{ flex: 1, backgroundColor: '#1e293b', padding: 12, borderRadius: 8 }}><Text style={{ color: '#94a3b8', fontSize: 12 }}>Completed</Text><Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>{completedSessions.length}</Text></View>
      </View>
    </ScrollView>
  );
};
