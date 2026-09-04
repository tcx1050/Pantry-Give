import { useAuth } from '@clerk/expo';
import { Redirect, type Href } from 'expo-router';
import SignInScreen from './(auth)/sign-in';

export default function IndexRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  if (isLoaded && isSignedIn) return <Redirect href={'/(tabs)' as Href} />;
  return <SignInScreen />;
}