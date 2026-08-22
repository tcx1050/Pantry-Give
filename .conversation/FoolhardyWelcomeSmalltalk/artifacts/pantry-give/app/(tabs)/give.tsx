import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import { Donation, usePantry } from '@/context/PantryContext';

const C = colors.light;
const foodBanks = [
  { id: 'northside', name: 'Northside Community Pantry', distance: '1.8 mi away', coordinate: { latitude: 37.78825, longitude: -122.4324 }, short: 'Northside Pantry' },
  { id: 'open-table', name: 'Open Table Food Bank', distance: '3.2 mi away', coordinate: { latitude: 37.7839, longitude: -122.4215 }, short: 'Open Table' },
  { id: 'harvest', name: 'Harvest Neighbors', distance: '4.6 mi away', coordinate: { latitude: 37.7938, longitude: -122.414 }, short: 'Harvest Neighbors' },
];

export default function GiveScreen() {
  const insets = useSafeAreaInsets();
  const { donations, addDonation, markDonationClaimed } = usePantry();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedBankId, setSelectedBankId] = useState<string>('northside');
  const selectedBank = foodBanks.find((bank) => bank.id === selectedBankId) ?? foodBanks[0];
  const available = donations.filter((item) => item.status === 'Available').length;

  const post = () => {
    if (!title.trim() || !quantity.trim()) return;
    addDonation({ title: title.trim(), quantity: quantity.trim(), foodBank: selectedBank.name, distance: selectedBank.distance, pickup: 'Set pickup time after posting' });
    setTitle(''); setQuantity(''); setShowForm(false); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return <ScrollView style={styles.screen} contentContainerStyle={{ paddingTop: insets.top + 18, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><View><Text style={styles.eyebrow}>COMMUNITY PORTAL</Text><Text style={styles.title}>Give food</Text></View><View style={styles.heart}><Feather name="heart" size={22} color={C.primary} /></View></View>
    <View style={styles.intro}><Text style={styles.introTitle}>Good food deserves{'\n'}a second table.</Text><Text style={styles.introBody}>Choose a nearby food bank and share what you have.</Text><View style={styles.introStat}><Text style={styles.statNumber}>{available}</Text><Text style={styles.statText}>active listings in your area</Text></View></View>
    <Pressable testID="post-donation" onPress={() => setShowForm(!showForm)} style={styles.postButton}><Feather name={showForm ? 'x' : 'plus'} size={18} color="#FFFFFF" /><Text style={styles.postText}>{showForm ? 'Close form' : 'Post food to give'}</Text></Pressable>
    {showForm && <View style={styles.form}><Text style={styles.formTitle}>What would you like to share?</Text><Text style={styles.formBank}><Feather name="map-pin" size={13} color={C.primary} /> Going to {selectedBank.short}</Text><TextInput value={title} onChangeText={setTitle} placeholder="e.g. Fresh vegetables" placeholderTextColor={C.mutedForeground} style={styles.input} /><TextInput value={quantity} onChangeText={setQuantity} placeholder="Quantity or serving size" placeholderTextColor={C.mutedForeground} style={styles.input} /><Pressable onPress={post} style={styles.save}><Text style={styles.saveText}>Publish listing</Text></Pressable></View>}
    <View style={styles.listHeader}><Text style={styles.sectionTitle}>Choose a food bank</Text><Text style={styles.nearby}><Feather name="navigation" size={13} color={C.primary} /> Your area</Text></View>
    <View style={styles.mapWrap}>
      <View style={styles.mapFallback}>
        <View style={styles.mapRoadOne} /><View style={styles.mapRoadTwo} /><View style={styles.mapWater} />
        <Text style={styles.mapLabel}>YOUR NEIGHBORHOOD</Text>
        {foodBanks.map((bank, index) => <Pressable key={bank.id} testID={`map-marker-${bank.id}`} onPress={() => setSelectedBankId(bank.id)} style={[styles.mapPin, index === 0 ? { left: '28%', top: '38%' } : index === 1 ? { left: '61%', top: '57%' } : { left: '73%', top: '22%' }, selectedBankId === bank.id && styles.mapPinSelected]}><Feather name="heart" size={14} color="#FFFFFF" /></Pressable>)}
      </View>
      <View style={styles.mapLegend}><View style={styles.legendIcon}><Feather name="heart" size={14} color="#FFFFFF" /></View><View><Text style={styles.selectedLabel}>SELECTED FOOD BANK</Text><Text style={styles.selectedName}>{selectedBank.name}</Text><Text style={styles.selectedDistance}>{selectedBank.distance}</Text></View><Feather name="check-circle" size={19} color={C.primary} style={{ marginLeft: 'auto' }} /></View>
    </View>
    <Text style={styles.mapHint}>Tap a marker to choose where your donation goes</Text>
    {donations.map((item: Donation) => <View key={item.id} style={styles.donationCard}><View style={styles.donationTop}><View style={styles.foodIcon}><Feather name="package" size={20} color={C.foreground} /></View><View style={{ flex: 1 }}><Text style={styles.donationTitle}>{item.title}</Text><Text style={styles.donationMeta}>{item.quantity}</Text></View><View style={[styles.badge, item.status === 'Claimed' && styles.claimed]}><Text style={styles.badgeText}>{item.status}</Text></View></View><View style={styles.divider} /><View style={styles.details}><View><Text style={styles.detailLabel}>FOOD BANK</Text><Text style={styles.detailValue}>{item.foodBank}</Text><Text style={styles.detailMuted}>{item.distance}</Text></View><View><Text style={styles.detailLabel}>PICKUP</Text><Text style={styles.detailValue}>{item.pickup}</Text></View></View>{item.status === 'Available' && <Pressable onPress={() => Alert.alert('Claim this food?', 'This will let the giver know you are interested.', [{ text: 'Not now', style: 'cancel' }, { text: 'Claim listing', onPress: () => { markDonationClaimed(item.id); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } }])} style={styles.claimButton}><Text style={styles.claimText}>I can help with this</Text><Feather name="arrow-up-right" size={16} color={C.foreground} /></Pressable>}</View>)}
    <View style={styles.note}><Feather name="shield" size={16} color={C.mutedForeground} /><Text style={styles.noteText}>Please only share unopened, in-date food. Food banks will confirm pickup details with you.</Text></View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.background, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  eyebrow: { color: C.mutedForeground, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  title: { color: C.foreground, fontSize: 31, fontWeight: '700', marginTop: 4, letterSpacing: -1 },
  heart: { height: 44, width: 44, borderRadius: 22, backgroundColor: '#F7D9A8', justifyContent: 'center', alignItems: 'center' },
  intro: { backgroundColor: '#F7C9BE', borderRadius: 22, padding: 20, marginBottom: 14 },
  introTitle: { color: C.foreground, fontSize: 25, lineHeight: 30, fontWeight: '700' },
  introBody: { color: '#5E6C61', fontSize: 12, lineHeight: 18, marginTop: 10, maxWidth: 260 },
  introStat: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 17 },
  statNumber: { color: C.foreground, fontSize: 24, fontWeight: '700' },
  statText: { color: '#5E6C61', fontSize: 12, fontWeight: '600' },
  postButton: { backgroundColor: '#6B9B63', borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, padding: 14, marginBottom: 23 },
  postText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  form: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 15, gap: 10, marginBottom: 20 },
  formTitle: { color: C.foreground, fontWeight: '700', fontSize: 16, marginBottom: 3 },
  input: { backgroundColor: C.background, borderRadius: 11, padding: 13, color: C.foreground, fontSize: 14 },
  save: { backgroundColor: C.foreground, borderRadius: 11, padding: 13, alignItems: 'center' },
  saveText: { color: '#FFFFFF', fontWeight: '700' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: C.foreground, fontSize: 20, fontWeight: '700' },
  nearby: { color: C.primary, fontWeight: '700', fontSize: 12 },
  donationCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 15, marginBottom: 12 },
  donationTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  foodIcon: { height: 43, width: 43, borderRadius: 14, backgroundColor: '#F7D9A8', justifyContent: 'center', alignItems: 'center' },
  donationTitle: { color: C.foreground, fontWeight: '700', fontSize: 15 },
  donationMeta: { color: C.mutedForeground, marginTop: 4, fontSize: 12 },
  badge: { backgroundColor: '#DDEBDD', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  claimed: { backgroundColor: C.muted },
  badgeText: { color: C.foreground, fontSize: 10, fontWeight: '700' },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 14 },
  details: { flexDirection: 'row', justifyContent: 'space-between', gap: 14 },
  detailLabel: { color: C.mutedForeground, fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: 5 },
  detailValue: { color: C.foreground, fontSize: 12, fontWeight: '600', maxWidth: 180 },
  detailMuted: { color: C.mutedForeground, fontSize: 11, marginTop: 3 },
  claimButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: C.border, marginTop: 14, paddingTop: 13 },
  claimText: { color: C.foreground, fontSize: 13, fontWeight: '700' },
  note: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', paddingHorizontal: 5, marginTop: 4 },
  noteText: { color: C.mutedForeground, fontSize: 11, lineHeight: 16, flex: 1 },
  formBank: { color: C.mutedForeground, fontSize: 11, marginBottom: 2 },
  mapWrap: { height: 285, borderRadius: 20, overflow: 'hidden', backgroundColor: '#DDEBDD', marginBottom: 7, position: 'relative' },
  map: { flex: 1 },
  mapFallback: { flex: 1, backgroundColor: '#DDEBDD', overflow: 'hidden' },
  mapRoadOne: { position: 'absolute', backgroundColor: '#F7F5EF', width: '150%', height: 18, transform: [{ rotate: '-23deg' }], top: 95, left: -65 },
  mapRoadTwo: { position: 'absolute', backgroundColor: '#F7F5EF', width: '150%', height: 12, transform: [{ rotate: '46deg' }], top: 88, left: -30 },
  mapWater: { position: 'absolute', backgroundColor: '#BFD8E0', width: 170, height: 170, borderRadius: 95, right: -50, bottom: -62, opacity: .7 },
  mapLabel: { position: 'absolute', top: 18, left: 20, color: '#6C7A70', fontSize: 9, fontWeight: '700', letterSpacing: 1.3 },
  mapPin: { position: 'absolute', height: 32, width: 32, borderRadius: 18, backgroundColor: '#6C7A70', borderWidth: 3, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#17352C', shadowOpacity: .18, shadowRadius: 5 },
  mapPinSelected: { backgroundColor: C.primary, transform: [{ scale: 1.2 }] },
  mapLegend: { position: 'absolute', left: 12, right: 12, bottom: 12, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 9, shadowColor: '#17352C', shadowOpacity: .12, shadowRadius: 8 },
  legendIcon: { backgroundColor: C.primary, height: 30, width: 30, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  selectedLabel: { color: C.mutedForeground, fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  selectedName: { color: C.foreground, fontSize: 12, fontWeight: '700', marginTop: 2 },
  selectedDistance: { color: C.mutedForeground, fontSize: 10, marginTop: 2 },
  mapHint: { textAlign: 'center', color: C.mutedForeground, fontSize: 11, marginBottom: 19 },
});