import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRunbookStore } from '../../store/useRunbookStore';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, activeSessions, alerts, resetToDefaults } = useRunbookStore();

  const activeSessionCount = activeSessions.length;
  const openAlertCount = alerts.filter((a) => a.status === 'open').length;

  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={styles.brandGroup}>
          <View style={styles.iconBox}>
            <Ionicons name="shield-checkmark" size={20} color="#6366f1" />
          </View>
          <View>
            <Text style={styles.title}>OpsRunbook</Text>
            <Text style={styles.subtitle}>Expo Go Mobile Edition</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}>
          <Ionicons name="refresh" size={18} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'playbooks' && styles.activeTab]}
          onPress={() => setActiveTab('playbooks')}
        >
          <Ionicons name="book-outline" size={16} color={activeTab === 'playbooks' ? '#818cf8' : '#94a3b8'} />
          <Text style={[styles.tabText, activeTab === 'playbooks' && styles.activeTabText]}>Catalog</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'runner' && styles.activeTab]}
          onPress={() => setActiveTab('runner')}
        >
          <Ionicons name="play-circle-outline" size={16} color={activeTab === 'runner' ? '#818cf8' : '#94a3b8'} />
          <Text style={[styles.tabText, activeTab === 'runner' && styles.activeTabText]}>Runner</Text>
          {activeSessionCount > 0 && (
            <View style={styles.badge}><Text style={styles.badgeText}>{activeSessionCount}</Text></View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'simulator' && styles.activeTab]}
          onPress={() => setActiveTab('simulator')}
        >
          <Ionicons name="notifications-outline" size={16} color={activeTab === 'simulator' ? '#818cf8' : '#94a3b8'} />
          <Text style={[styles.tabText, activeTab === 'simulator' && styles.activeTabText]}>Alerts</Text>
          {openAlertCount > 0 && (
            <View style={[styles.badge, { backgroundColor: '#ef4444' }]}><Text style={styles.badgeText}>{openAlertCount}</Text></View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
          >
          <Ionicons name="stats-chart-outline" size={16} color={activeTab === 'analytics' ? '#818cf8' : '#94a3b8'} />
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>Metrics</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { backgroundColor: '#0f172a', borderBottomWidth: 1, borderBottomColor: '#1e293b', paddingTop: 10, paddingHorizontal: 16, paddingBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  brandGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { backgroundColor: '#1e1b4b', padding: 8, borderRadius: 8 },
  title: { color: '#ffffff', fontWeight: 'bold', fontSize: 18 },
  subtitle: { color: '#94a3b8', fontSize: 11 },
  resetButton: { padding: 8, backgroundColor: '#1e293b', borderRadius: 8 },
  tabBar: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#1e293b', borderRadius: 10, padding: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8, gap: 4 },
  activeTab: { backgroundColor: '#312e81' },
  tabText: { color: '#94a3b8', fontSize: 12, fontWeight: '500' },
  activeTabText: { color: '#818cf8', fontWeight: '700' },
  badge: { backgroundColor: '#10b981', borderRadius: 10, paddingHorizontal: 5, paddingVertical: 1, marginLeft: 2 },
  badgeText: { color: '#ffffff', fontSize: 10, fontWeight: 'bold' }
});
