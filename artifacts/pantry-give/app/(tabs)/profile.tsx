import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { usePantry } from '@/context/PantryContext';
import { useClerk, useUser } from '@clerk/expo';

const C = colors.light;
const mascot = require('../../assets/images/mascot.png');

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { ingredients, donations, points, favoriteRecipeIds } = usePantry();
  const { user } = useUser();
  const { signOut } = useClerk();
  const claimedDonations = donations.filter((item) => item.status === 'Claimed').length;
  const displayName = user?.fullName || user?.firstName || 'Pantry friend';
  const email = user?.primaryEmailAddress?.emailAddress || 'Account email';
  const initials = displayName.split(' ').map((part) => part.charAt(0)).join('').slice(0, 2).toUpperCase();

  const confirmSignOut = () => {
    Alert.alert('Sign out?', 'Your local pantry stays on this device, and you can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
      <View style={styles.topBar}>
        <View style={styles.backCircle}><Feather name="arrow-left" size={17} color={C.foreground} /></View>
        <Text style={styles.topTitle}>Pantry Give Points</Text>
        <View style={styles.topSpacer} />
      </View>

      <View style={styles.pointsCard}>
        <View style={styles.pointsCopy}>
          <Text style={styles.cardEyebrow}>YOUR POINTS</Text>
          <Text style={styles.points}>{points.toLocaleString()}</Text>
          <Text style={styles.pointsDescription}>Keep making a difference.{'\n'}Every good deed counts.</Text>
        </View>
        <Image source={mascot} style={styles.mascot} resizeMode="contain" />
        <View style={styles.sparkle}><Feather name="star" size={13} color="#E39B32" /></View>
      </View>

      <View style={styles.accountCard}>
        <View style={styles.accountAvatar}>
          {user?.imageUrl ? <Image source={{ uri: user.imageUrl }} style={styles.accountImage} /> : <Text style={styles.accountInitials}>{initials}</Text>}
        </View>
        <View style={styles.accountCopy}>
          <Text style={styles.accountName}>{displayName}</Text>
          <Text style={styles.accountEmail}>{email}</Text>
        </View>
        <Feather name="check-circle" size={18} color={C.primary} />
      </View>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>How to earn</Text>
        <Text style={styles.sectionHint}>Small actions, big impact</Text>
      </View>
      <View style={styles.earnCard}>
        <EarnRow icon="package" title="Track food" detail="Add an item to your pantry" points="+20 pts" />
        <EarnRow icon="heart" title="Share food" detail="Give an item to a neighbor" points="+50 pts" />
        <EarnRow icon="book-open" title="Save a recipe" detail="Keep a recipe for later" points="+10 pts" />
        <EarnRow icon="refresh-cw" title="Waste less" detail="Use what you already have" points="+15 pts" last />
      </View>

      <Pressable style={styles.rewardsButton} onPress={() => Alert.alert('Rewards coming soon', 'Keep earning points and we’ll let you know when new community rewards are available.')}>
        <Text style={styles.rewardsText}>View Rewards</Text>
        <Feather name="arrow-up-right" size={16} color="#FFFFFF" />
      </Pressable>

      <View style={styles.impactCard}>
        <View><Text style={styles.impactNumber}>{ingredients.length}</Text><Text style={styles.impactLabel}>pantry items</Text></View>
        <View><Text style={styles.impactNumber}>{claimedDonations}</Text><Text style={styles.impactLabel}>food shared</Text></View>
        <View><Text style={styles.impactNumber}>{favoriteRecipeIds.length}</Text><Text style={styles.impactLabel}>recipes saved</Text></View>
      </View>

      <View style={styles.savedHeader}><Text style={styles.sectionTitle}>Saved recipes</Text><Text style={styles.savedCount}>{favoriteRecipeIds.length} saved</Text></View>
      {favoriteRecipeIds.length === 0 && <View style={styles.emptySaved}><Feather name="bookmark" size={18} color={C.mutedForeground} /><Text style={styles.emptySavedText}>Bookmark recipes you want to make later.</Text></View>}
      <Text style={styles.sectionTitle}>Preferences</Text>
      {['Notifications', 'Pickup preferences', 'Food safety guide'].map((label, index) => <Pressable key={label} style={styles.preferenceRow}><View style={styles.rowIcon}><Feather name={index === 0 ? 'bell' : index === 1 ? 'clock' : 'shield'} size={16} color={C.foreground} /></View><Text style={styles.rowText}>{label}</Text><Feather name="chevron-right" size={17} color={C.mutedForeground} /></Pressable>)}
      <Pressable style={styles.signOutButton} onPress={confirmSignOut}><Feather name="log-out" size={16} color={C.destructive} /><Text style={styles.signOutText}>Sign out</Text></Pressable>
    </ScrollView>
  );
}

function EarnRow({ icon, title, detail, points, last = false }: { icon: React.ComponentProps<typeof Feather>['name']; title: string; detail: string; points: string; last?: boolean }) {
  return <View style={[styles.earnRow, last && styles.lastEarnRow]}><View style={styles.earnIcon}><Feather name={icon} size={16} color={C.primary} /></View><View style={styles.earnCopy}><Text style={styles.earnTitle}>{title}</Text><Text style={styles.earnDetail}>{detail}</Text></View><Text style={styles.earnPoints}>{points}</Text><Feather name="chevron-right" size={15} color={C.mutedForeground} /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.background, paddingHorizontal: 20 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  backCircle: { height: 32, width: 32, borderRadius: 16, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  topTitle: { color: C.foreground, fontSize: 14, fontWeight: '700' },
  topSpacer: { width: 32 },
  pointsCard: { minHeight: 170, backgroundColor: '#FFF2D8', borderRadius: 20, padding: 18, overflow: 'hidden', flexDirection: 'row', marginBottom: 22 },
  pointsCopy: { flex: 1, zIndex: 1 },
  cardEyebrow: { color: '#7C806F', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  points: { color: C.foreground, fontSize: 36, fontWeight: '800', letterSpacing: -1, marginTop: 5 },
  pointsDescription: { color: '#687362', fontSize: 11, lineHeight: 16, marginTop: 10 },
  mascot: { width: 124, height: 100, position: 'absolute', right: 8, bottom: 8 },
  sparkle: { position: 'absolute', right: 122, top: 52, height: 24, width: 24, borderRadius: 12, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  accountCard: { backgroundColor: '#FFFFFF', borderRadius: 17, padding: 13, flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  accountAvatar: { height: 42, width: 42, borderRadius: 21, backgroundColor: C.foreground, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  accountImage: { height: 42, width: 42 },
  accountInitials: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  accountCopy: { flex: 1, marginLeft: 11 },
  accountName: { color: C.foreground, fontSize: 13, fontWeight: '800' },
  accountEmail: { color: C.mutedForeground, fontSize: 11, marginTop: 3 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  sectionTitle: { color: C.foreground, fontSize: 19, fontWeight: '800' },
  sectionHint: { color: C.mutedForeground, fontSize: 10, fontWeight: '600' },
  earnCard: { backgroundColor: '#FFFFFF', borderRadius: 17, paddingHorizontal: 13, paddingVertical: 2, marginBottom: 14 },
  earnRow: { minHeight: 57, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EEF0E9', gap: 9 },
  lastEarnRow: { borderBottomWidth: 0 },
  earnIcon: { height: 30, width: 30, borderRadius: 10, backgroundColor: '#E7EFE8', alignItems: 'center', justifyContent: 'center' },
  earnCopy: { flex: 1 },
  earnTitle: { color: C.foreground, fontSize: 12, fontWeight: '800' },
  earnDetail: { color: C.mutedForeground, fontSize: 10, marginTop: 3 },
  earnPoints: { color: C.primary, fontSize: 10, fontWeight: '800' },
  rewardsButton: { backgroundColor: C.primary, minHeight: 46, borderRadius: 11, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9, marginBottom: 14 },
  rewardsText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  impactCard: { backgroundColor: '#DDEBDD', borderRadius: 17, padding: 15, flexDirection: 'row', justifyContent: 'space-around', marginBottom: 22 },
  impactNumber: { color: C.foreground, fontSize: 19, fontWeight: '800', textAlign: 'center' },
  impactLabel: { color: '#4D6655', fontSize: 10, marginTop: 3 },
  savedHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 },
  savedCount: { color: C.mutedForeground, fontSize: 11, fontWeight: '600' },
  emptySaved: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  emptySavedText: { color: C.mutedForeground, fontSize: 12 },
  preferenceRow: { backgroundColor: '#FFFFFF', padding: 13, borderRadius: 14, flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  rowIcon: { height: 31, width: 31, borderRadius: 10, backgroundColor: C.muted, justifyContent: 'center', alignItems: 'center', marginRight: 11 },
  rowText: { color: C.foreground, fontSize: 13, fontWeight: '600', flex: 1 },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 18 },
  signOutText: { color: C.destructive, fontSize: 13, fontWeight: '700' },
});