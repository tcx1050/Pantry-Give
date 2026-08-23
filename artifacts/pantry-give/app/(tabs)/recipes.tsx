import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { usePantry } from '@/context/PantryContext';

const C = colors.light;

type Recipe = {
  id: string;
  name: string;
  description: string;
  time: string;
  difficulty: string;
  ingredients: string[];
  tone: string;
  icon: string;
  image: number;
};

const recipes: Recipe[] = [
  { id: 'r1', name: 'Chickpea & spinach bowl', description: 'A bright, filling bowl for the days you want something fast.', time: '20 min', difficulty: 'Easy', ingredients: ['chickpeas', 'spinach', 'olive oil'], tone: '#F7C9BE', icon: 'sun', image: require('../../assets/images/food/chickpeas.jpg') },
  { id: 'r2', name: 'Golden rice & beans', description: 'Comforting pantry staples with a warm, herby finish.', time: '35 min', difficulty: 'Easy', ingredients: ['rice', 'beans', 'olive oil'], tone: '#F7D9A8', icon: 'coffee', image: require('../../assets/images/food/rice.jpg') },
  { id: 'r3', name: 'Green pantry pasta', description: 'A flexible weeknight recipe for greens that need using.', time: '25 min', difficulty: 'Easy', ingredients: ['spinach', 'pasta', 'garlic'], tone: '#DDEBDD', icon: 'zap', image: require('../../assets/images/food/pasta.jpg') },
  { id: 'r4', name: 'Roasted vegetable toast', description: 'Turn a few almost-too-ripe vegetables into a crisp lunch.', time: '30 min', difficulty: 'Easy', ingredients: ['vegetables', 'bread', 'olive oil'], tone: '#F7C9BE', icon: 'heart', image: require('../../assets/images/food/toast.jpg') },
  { id: 'r5', name: 'Tomato chickpea stew', description: 'A one-pot dinner with deep flavor and very little effort.', time: '40 min', difficulty: 'Easy', ingredients: ['chickpeas', 'tomato', 'onion'], tone: '#F7D9A8', icon: 'package', image: require('../../assets/images/food/vegetables.jpg') },
];

export default function RecipesScreen() {
  const insets = useSafeAreaInsets();
  const { ingredients, favoriteRecipeIds, toggleFavoriteRecipe } = usePantry();
  const [search, setSearch] = useState('');
  const [activeIngredient, setActiveIngredient] = useState<string | null>(null);
  const pantryNames = ingredients.slice(0, 5).map((item) => item.name);
  const visibleRecipes = useMemo(() => recipes.filter((recipe) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || recipe.name.toLowerCase().includes(query) || recipe.ingredients.some((item) => item.includes(query));
    const matchesIngredient = !activeIngredient || recipe.ingredients.some((item) => activeIngredient.toLowerCase().includes(item) || item.includes(activeIngredient.toLowerCase()));
    return matchesSearch && matchesIngredient;
  }), [search, activeIngredient]);

  return <ScrollView style={styles.screen} contentContainerStyle={{ paddingTop: insets.top + 18, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
    <View style={styles.header}><View><Text style={styles.eyebrow}>USE WHAT YOU HAVE</Text><Text style={styles.title}>Recipes</Text></View><View style={styles.headerIcon}><Feather name="book-open" size={21} color={C.foreground} /></View></View>
    <View style={styles.intro}><View style={{ flex: 1 }}><Text style={styles.introTitle}>Turn leftovers into{'\n'}something lovely.</Text><Text style={styles.introBody}>Search recipes around the ingredients already in your kitchen.</Text></View><View style={styles.introBadge}><Feather name="star" size={18} color={C.primary} /></View></View>
    <View style={styles.search}><Feather name="search" size={18} color={C.mutedForeground} /><TextInput testID="recipe-search" value={search} onChangeText={setSearch} placeholder="Search by ingredient or recipe" placeholderTextColor={C.mutedForeground} style={styles.searchInput} /></View>
    <Text style={styles.sectionTitle}>Your ingredients</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      {pantryNames.map((name) => <Pressable key={name} testID={`ingredient-chip-${name}`} onPress={() => setActiveIngredient(activeIngredient === name ? null : name)} style={[styles.chip, activeIngredient === name && styles.chipActive]}><Text style={[styles.chipText, activeIngredient === name && styles.chipTextActive]}>{name}</Text></Pressable>)}
    </ScrollView>
    <View style={styles.resultsHeader}><Text style={styles.sectionTitle}>{activeIngredient ? `Recipes with ${activeIngredient}` : 'Good matches for you'}</Text><Text style={styles.resultCount}>{visibleRecipes.length} found</Text></View>
    {visibleRecipes.map((recipe) => <View key={recipe.id} style={styles.recipeCard}><View style={styles.recipeTop}><Image source={recipe.image} contentFit="cover" style={styles.recipeImage} /><View style={{ flex: 1 }}><Text style={styles.recipeName}>{recipe.name}</Text><Text style={styles.recipeDescription}>{recipe.description}</Text></View><Pressable testID={`bookmark-${recipe.id}`} accessibilityLabel={`${favoriteRecipeIds.includes(recipe.id) ? 'Remove' : 'Save'} ${recipe.name}`} onPress={() => toggleFavoriteRecipe(recipe.id)} hitSlop={10}><Feather name="bookmark" size={18} color={favoriteRecipeIds.includes(recipe.id) ? C.primary : C.mutedForeground} /></Pressable></View><View style={styles.recipeBottom}><View style={styles.recipeMeta}><Feather name="clock" size={13} color={C.mutedForeground} /><Text style={styles.metaText}>{recipe.time}</Text><View style={styles.metaDot} /><Text style={styles.metaText}>{recipe.difficulty}</Text></View><View style={styles.match}><Feather name="check" size={12} color={C.primary} /><Text style={styles.matchText}>{recipe.ingredients.filter((item) => pantryNames.some((name) => name.toLowerCase().includes(item))).length} pantry matches</Text></View></View></View>)}
    {visibleRecipes.length === 0 && <View style={styles.empty}><Feather name="search" size={24} color={C.mutedForeground} /><Text style={styles.emptyTitle}>No recipes yet</Text><Text style={styles.emptyCopy}>Try searching for a different leftover ingredient.</Text></View>}
    <View style={styles.tip}><Feather name="refresh-cw" size={15} color={C.primary} /><Text style={styles.tipText}>Recipes are suggestions — swap ingredients freely and make them your own.</Text></View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.background, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  eyebrow: { color: C.mutedForeground, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  title: { color: C.foreground, fontSize: 31, fontWeight: '700', marginTop: 4, letterSpacing: -1 },
  headerIcon: { height: 44, width: 44, borderRadius: 22, backgroundColor: '#DDEBDD', justifyContent: 'center', alignItems: 'center' },
  intro: { backgroundColor: '#F7C9BE', borderRadius: 22, padding: 20, minHeight: 154, flexDirection: 'row', marginBottom: 14 },
  introTitle: { color: C.foreground, fontSize: 23, lineHeight: 28, fontWeight: '700' },
  introBody: { color: '#5E6C61', fontSize: 12, lineHeight: 18, marginTop: 10, maxWidth: 240 },
  introBadge: { height: 46, width: 46, borderRadius: 23, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  search: { backgroundColor: '#FFFFFF', borderRadius: 13, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  searchInput: { flex: 1, paddingVertical: 13, paddingLeft: 10, color: C.foreground, fontSize: 13 },
  sectionTitle: { color: C.foreground, fontSize: 18, fontWeight: '700' },
  chips: { gap: 8, paddingVertical: 12, paddingRight: 20 },
  chip: { backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 },
  chipActive: { backgroundColor: '#6B9B63' },
  chipText: { color: C.mutedForeground, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF' },
  resultsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, marginBottom: 12 },
  resultCount: { color: C.mutedForeground, fontSize: 11, fontWeight: '600' },
  recipeCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, marginBottom: 10 },
  recipeTop: { flexDirection: 'row', gap: 11, alignItems: 'flex-start' },
  recipeImage: { height: 58, width: 58, borderRadius: 15 },
  recipeName: { color: C.foreground, fontSize: 15, fontWeight: '700', marginTop: 1 },
  recipeDescription: { color: C.mutedForeground, fontSize: 11, lineHeight: 16, marginTop: 5, paddingRight: 5 },
  recipeBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: C.border, marginTop: 13, paddingTop: 11 },
  recipeMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { color: C.mutedForeground, fontSize: 11 },
  metaDot: { height: 3, width: 3, borderRadius: 2, backgroundColor: C.mutedForeground, marginHorizontal: 3 },
  match: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  matchText: { color: C.primary, fontSize: 10, fontWeight: '700' },
  empty: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 28, alignItems: 'center', marginTop: 4 },
  emptyTitle: { color: C.foreground, fontSize: 15, fontWeight: '700', marginTop: 10 },
  emptyCopy: { color: C.mutedForeground, fontSize: 12, marginTop: 5 },
  tip: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 9, paddingHorizontal: 8 },
  tipText: { color: C.mutedForeground, fontSize: 10, lineHeight: 15, flex: 1 },
});