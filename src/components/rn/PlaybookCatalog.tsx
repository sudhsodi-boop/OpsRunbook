import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRunbookStore } from '../../store/useRunbookStore';
import type { Playbook, Severity } from '../../types/runbook';

interface PlaybookCatalogProps { onEditPlaybook: (playbook?: Playbook) => void; }

export const PlaybookCatalog: React.FC<PlaybookCatalogProps> = ({ onEditPlaybook }) => {
  const { playbooks, startExecutionSession, deletePlaybook } = useRunbookStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const categories = ['All', 'Infrastructure', 'Database', 'Security', 'Deployment'];

  const filteredPlaybooks = playbooks.filter((pb) => {
    const matchesSearch = pb.title.toLowerCase().includes(searchTerm.toLowerCase()) || pb.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || pb.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.banner}>
        <View style={styles.bannerHeader}>
          <Text style={styles.bannerTitle}>Operational Runbooks</Text>
          <TouchableOpacity style={styles.createButton} onPress={() => onEditPlaybook()}>
            <Ionicons name="add" size={16} color="#ffffff" />
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.bannerSub}>Standardized incident procedures & runnable commands</Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#94a3b8" />
        <TextInput style={styles.searchInput} placeholder="Search playbooks..." placeholderTextColor="#64748b" value={searchTerm} onChangeText={setSearchTerm} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
        {categories.map((cat) => (
          <TouchableOpacity key={cat} style={[styles.categoryPill, selectedCategory === cat && styles.activePill]} onPress={() => setSelectedCategory(cat)}>
            <Text style={[styles.pillText, selectedCategory === cat && styles.activePillText]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.list}>
        {filteredPlaybooks.map((pb) => (
          <View key={pb.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.badgeRow}>
                <View style={styles.sevBadge}><Text style={styles.sevBadgeText}>{pb.severity}</Text></View>
                <Text style={styles.catText}>{pb.category}</Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => onEditPlaybook(pb)} style={styles.iconBtn}><Ionicons name="pencil" size={16} color="#94a3b8" /></TouchableOpacity>
                <TouchableOpacity onPress={() => { Alert.alert('Delete Playbook', `Delete "${pb.title}"?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deletePlaybook(pb.id) }]); }} style={styles.iconBtn}><Ionicons name="trash-outline" size={16} color="#ef4444" /></TouchableOpacity>
              </View>
            </View>
            <Text style={styles.cardTitle}>{pb.title}</Text>
            <Text style={styles.cardDesc} numberOfLines={2}>{pb.description}</Text>
            <View style={styles.cardFooter}>
              <View style={styles.metaInfo}>
                <Ionicons name="time-outline" size={14} color="#64748b" />
                <Text style={styles.metaText}>~{pb.estimatedTotalMinutes} min</Text>
                </View>
              <TouchableOpacity style={styles.executeBtn} onPress={() => startExecutionSession(pb.id)}>
                <Ionicons name="play" size={14} color="#ffffff" />
                <Text style={styles.executeBtnText}>Run</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 16, paddingBottom: 30 },
  banner: { backgroundColor: '#1e293b', padding: 16, borderRadius: 12, marginBottom: 16 },
  bannerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bannerTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  bannerSub: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  createButton: { backgroundColor: '#4f46e5', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 4 },
  createButtonText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12, gap: 8 },
  searchInput: { flex: 1, color: '#ffffff', fontSize: 14, padding: 0 },
  categoriesRow: { flexDirection: 'row', marginBottom: 16 },
  categoryPill: { backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8 },
  activePill: { backgroundColor: '#4f46e5' },
  pillText: { color: '#94a3b8', fontSize: 12 },
  activePillText: { color: '#ffffff', fontWeight: 'bold' },
  list: { gap: 12 },
  card: { backgroundColor: '#1e293b', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#334155' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sevBadge: { borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, borderColor: '#991b1b', backgroundColor: '#450a0a' },
  sevBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#f87171' },
  catText: { color: '#94a3b8', fontSize: 12 },
  cardActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 4 },
  cardTitle: { color: '#ffffff', fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  cardDesc: { color: '#94a3b8', fontSize: 12, lineHeight: 18, marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#334155' },
  metaInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: '#64748b', fontSize: 11 },
  executeBtn: { backgroundColor: '#10b981', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, gap: 4 },
  executeBtnText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' }
});
