import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  return <Redirect href="/(drawer)/(tabs)/following-feed" />;
}
