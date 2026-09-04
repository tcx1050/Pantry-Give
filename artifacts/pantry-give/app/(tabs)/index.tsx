import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import colors from '@/constants/colors';
import { Ingredient, usePantry } from '@/context/PantryContext';
import { useUser } from '@clerk/expo';

const C = colors.light;
const ingredientImages: Record<string, number> = {
  'brown rice': require('../../assets/images/food/rice.jpg'),
  chickpeas: require('../../assets/images/food/chickpeas.jpg'),
  'baby spinach': require('../../assets/images/food/spinach.jpg'),
  'olive oil': require('../../assets/images/food/olive-oil.webp'),
};

export default function PantryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { ingredients, addIngredient, removeIngredient } = usePantry();
  const { user } = useUser();
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const filtered = ingredients.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
  const soonCount = ingredients.filter((item) => item.expires === 'Tomorrow').length;
  const displayName = user?.firstName || user?.fullName?.split(' ')[0] || 'friend';
  const initials = (user?.fullName || user?.firstName || 'PG').split(' ').map((part) => part.charAt(0)).join('').slice(0, 2).toUpperCase();

  const save = () => {
    if (!name.trim() || !quantity.trim()) return;
    addIngredient({ name: name.trim(), quantity: quantity.trim(), category: 'Pantry', expires: 'In 2 weeks' });
    setName(''); setQuantity(''); setShowForm(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingTop: insets.top + 18, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>SATURDAY, AUG 22</Text>
          <Text style={styles.title}>Your pantry</Text>
        </View>
        <Pressable testID="profile-button" onPress={() => router.push('/(tabs)/profile')} style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></Pressable>
      </View>

      <View style={styles.hero}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroKicker}>WELCOME BACK</Text>
          <Text style={styles.heroTitle}>Hello, {displayName}!{'\n'}Let’s make a difference.</Text>
          <Text style={styles.heroBody}>Track your food, share what you can, and help your community.</Text>
        </View>
        <View style={styles.heroIcon}><Image source={require('../../assets/images/mascot.png')} contentFit="contain" style={styles.mascot} /></View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}><Text style={styles.summaryNumber}>{ingredients.length}</Text><Text style={styles.summaryLabel}>items tracked</Text></View>
        <View style={[styles.summaryCard, { backgroundColor: '#F7D9A8' }]}><Text style={styles.summaryNumber}>{soonCount}</Text><Text style={styles.summaryLabel}>use soon</Text></View>
        <Pressable style={[styles.summaryCard, { backgroundColor: '#DDEBDD' }]} onPress={() => router.push('/(tabs)/give')}><Feather name="heart" size={20} color={C.foreground} /><Text style={styles.summaryLabel}>give food</Text></Pressable>
      </View>

      <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>What you have</Text><Pressable onPress={() => setShowForm(!showForm)}><Text style={styles.action}>{showForm ? 'Close' : '+ Add item'}</Text></Pressable></View>
      {showForm && <View style={styles.form}>
        <TextInput value={name} onChangeText={setName} placeholder="Ingredient name" placeholderTextColor={C.mutedForeground} style={styles.input} />
        <TextInput value={quantity} onChangeText={setQuantity} placeholder="Quantity (e.g. 2 cans)" placeholderTextColor={C.mutedForeground} style={styles.input} />
        <Pressable testID="save-ingredient" onPress={save} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Save to pantry</Text></Pressable>
      </View>}
      <View style={styles.search}><Feather name="search" size={18} color={C.mutedForeground} /><TextInput value={query} onChangeText={setQuery} placeholder="Search ingredients" placeholderTextColor={C.mutedForeground} style={styles.searchInput} /></View>
      {filtered.map((item: Ingredient) => <Pressable key={item.id} onLongPress={() => removeIngredient(item.id)} style={styles.itemRow}>
        <View style={styles.itemDot}>{ingredientImages[item.name.toLowerCase()] ? <Image source={ingredientImages[item.name.toLowerCase()]} contentFit="cover" style={styles.ingredientImage} /> : <Text style={styles.dotText}>{item.name.charAt(0)}</Text>}</View>
        <View style={{ flex: 1 }}><Text style={styles.itemName}>{item.name}</Text><Text style={styles.itemMeta}>{item.quantity} · {item.category}</Text></View>
        <View style={{ alignItems: 'flex-end' }}><Text style={[styles.expiry, item.expires === 'Tomorrow' && { color: C.primary }]}>{item.expires}</Text><Text style={styles.expiryLabel}>{item.expires === 'Tomorrow' ? 'use soon' : 'best before'}</Text></View>
      </Pressable>)}
      <Text style={styles.tip}><Feather name="info" size={14} color={C.mutedForeground} /> Long press an item to remove it</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.background, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  eyebrow: { color: C.mutedForeground, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  title: { color: C.foreground, fontSize: 31, fontWeight: '700', marginTop: 4, letterSpacing: -1 },
  avatar: { height: 44, width: 44, borderRadius: 22, backgroundColor: C.foreground, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  hero: { backgroundColor: '#F7C9BE', borderRadius: 22, padding: 20, minHeight: 174, flexDirection: 'row', overflow: 'hidden' },
  heroKicker: { color: '#6F7F70', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },
  heroTitle: { color: C.foreground, fontSize: 24, lineHeight: 29, fontWeight: '700', letterSpacing: -.5 },
  heroBody: { color: '#5E6C61', fontSize: 12, lineHeight: 18, marginTop: 11, maxWidth: 220 },
  heroIcon: { height: 62, width: 62, borderRadius: 31, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginTop: 2, overflow: 'hidden' },
  mascot: { height: 62, width: 62 },
  summaryRow: { flexDirection: 'row', gap: 10, marginVertical: 18 },
  summaryCard: { flex: 1, minHeight: 84, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 13, justifyContent: 'space-between' },
  summaryNumber: { color: C.foreground, fontSize: 23, fontWeight: '700' },
  summaryLabel: { color: C.mutedForeground, fontSize: 12, fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: C.foreground, fontSize: 20, fontWeight: '700' },
  action: { color: C.primary, fontWeight: '700', fontSize: 13 },
  form: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, gap: 10, marginBottom: 12 },
  input: { backgroundColor: C.background, borderRadius: 11, paddingHorizontal: 14, paddingVertical: 12, color: C.foreground, fontSize: 14 },
  primaryButton: { backgroundColor: C.primary, padding: 14, borderRadius: 12, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700' },
  search: { backgroundColor: '#FFFFFF', borderRadius: 13, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  searchInput: { flex: 1, paddingVertical: 13, paddingLeft: 10, color: C.foreground, fontSize: 14 },
  itemRow: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  itemDot: { height: 38, width: 38, borderRadius: 12, backgroundColor: '#E7EFE8', justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden' },
  ingredientImage: { height: '100%', width: '100%' },
  dotText: { color: C.foreground, fontWeight: '700', fontSize: 16 },
  itemName: { color: C.foreground, fontWeight: '700', fontSize: 15 },
  itemMeta: { color: C.mutedForeground, fontSize: 12, marginTop: 4 },
  expiry: { color: C.foreground, fontSize: 12, fontWeight: '700' },
  expiryLabel: { color: C.mutedForeground, fontSize: 10, marginTop: 3 },
  tip: { color: C.mutedForeground, textAlign: 'center', fontSize: 11, marginTop: 8 },
});