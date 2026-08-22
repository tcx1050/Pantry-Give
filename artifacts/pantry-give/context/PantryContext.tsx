import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Ingredient = {
  id: string;
  name: string;
  quantity: string;
  category: string;
  expires: string;
};

export type Donation = {
  id: string;
  title: string;
  quantity: string;
  foodBank: string;
  distance: string;
  pickup: string;
  status: 'Available' | 'Claimed';
};

type PantryContextValue = {
  ingredients: Ingredient[];
  donations: Donation[];
  points: number;
  favoriteRecipeIds: string[];
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  removeIngredient: (id: string) => void;
  addDonation: (donation: Omit<Donation, 'id' | 'status'>) => void;
  markDonationClaimed: (id: string) => void;
  toggleFavoriteRecipe: (id: string) => void;
};

const PantryContext = createContext<PantryContextValue | null>(null);
const ingredientKey = '@pantry-give/ingredients';
const donationKey = '@pantry-give/donations';
const pointsKey = '@pantry-give/points';
const favoriteRecipeKey = '@pantry-give/favorite-recipes';

const starterIngredients: Ingredient[] = [
  { id: '1', name: 'Brown rice', quantity: '2 bags', category: 'Grains', expires: 'Sep 18' },
  { id: '2', name: 'Chickpeas', quantity: '4 cans', category: 'Canned', expires: 'Nov 02' },
  { id: '3', name: 'Baby spinach', quantity: '1 bag', category: 'Produce', expires: 'Tomorrow' },
  { id: '4', name: 'Olive oil', quantity: '1 bottle', category: 'Pantry', expires: 'Dec 24' },
];

const starterDonations: Donation[] = [
  { id: 'd1', title: 'Fresh produce box', quantity: '1 box · serves 4', foodBank: 'Northside Community Pantry', distance: '1.8 mi away', pickup: 'Today, 4–6 PM', status: 'Available' },
  { id: 'd2', title: 'Canned soup & beans', quantity: '12 cans', foodBank: 'Open Table Food Bank', distance: '3.2 mi away', pickup: 'Tomorrow, 9 AM–12 PM', status: 'Available' },
];

export function PantryProvider({ children }: { children: React.ReactNode }) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(starterIngredients);
  const [donations, setDonations] = useState<Donation[]>(starterDonations);
  const [points, setPoints] = useState<number>(180);
  const [favoriteRecipeIds, setFavoriteRecipeIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(ingredientKey),
      AsyncStorage.getItem(donationKey),
      AsyncStorage.getItem(pointsKey),
      AsyncStorage.getItem(favoriteRecipeKey),
    ]).then(([savedIngredients, savedDonations, savedPoints, savedFavorites]) => {
      if (savedIngredients) setIngredients(JSON.parse(savedIngredients) as Ingredient[]);
      if (savedDonations) setDonations(JSON.parse(savedDonations) as Donation[]);
      if (savedPoints) setPoints(Number(savedPoints));
      if (savedFavorites) setFavoriteRecipeIds(JSON.parse(savedFavorites) as string[]);
      setHydrated(true);
    });
  }, []);

  useEffect(() => { if (hydrated) AsyncStorage.setItem(ingredientKey, JSON.stringify(ingredients)); }, [hydrated, ingredients]);
  useEffect(() => { if (hydrated) AsyncStorage.setItem(donationKey, JSON.stringify(donations)); }, [hydrated, donations]);
  useEffect(() => { if (hydrated) AsyncStorage.setItem(pointsKey, String(points)); }, [hydrated, points]);
  useEffect(() => { if (hydrated) AsyncStorage.setItem(favoriteRecipeKey, JSON.stringify(favoriteRecipeIds)); }, [favoriteRecipeIds, hydrated]);

  const value = useMemo(() => ({
    ingredients,
    donations,
    points,
    favoriteRecipeIds,
    addIngredient: (ingredient: Omit<Ingredient, 'id'>) => {
      setIngredients((current) => [{ ...ingredient, id: Date.now().toString() }, ...current]);
      setPoints((current) => current + 10);
    },
    removeIngredient: (id: string) => setIngredients((current) => current.filter((item) => item.id !== id)),
    addDonation: (donation: Omit<Donation, 'id' | 'status'>) => {
      setDonations((current) => [{ ...donation, id: Date.now().toString(), status: 'Available' }, ...current]);
      setPoints((current) => current + 50);
    },
    markDonationClaimed: (id: string) => {
      setDonations((current) => current.map((item) => item.id === id ? { ...item, status: 'Claimed' as const } : item));
      setPoints((current) => current + 25);
    },
    toggleFavoriteRecipe: (id: string) => {
      setFavoriteRecipeIds((current) => current.includes(id) ? current.filter((recipeId) => recipeId !== id) : [...current, id]);
    },
  }), [favoriteRecipeIds, ingredients, donations, points]);

  return <PantryContext.Provider value={value}>{children}</PantryContext.Provider>;
}

export function usePantry() {
  const context = useContext(PantryContext);
  if (!context) throw new Error('usePantry must be used inside PantryProvider');
  return context;
}