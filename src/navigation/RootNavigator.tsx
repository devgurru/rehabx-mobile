import { Feather } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoadingView } from '@/components/States';
import AssessmentScreen from '@/screens/AssessmentScreen';
import ExerciseCompleteScreen from '@/screens/ExerciseCompleteScreen';
import ExerciseDetailScreen from '@/screens/ExerciseDetailScreen';
import ExerciseSessionScreen from '@/screens/ExerciseSessionScreen';
import ExercisesScreen from '@/screens/ExercisesScreen';
import HomeScreen from '@/screens/HomeScreen';
import LoginScreen from '@/screens/LoginScreen';
import MilestonesScreen from '@/screens/MilestonesScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import ProgramScreen from '@/screens/ProgramScreen';
import ProgressScreen from '@/screens/ProgressScreen';
import TimelineScreen from '@/screens/TimelineScreen';
import { useAppSelector } from '@/store';
import { colors, fonts } from '@/theme';
import type { RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<keyof TabParamList, keyof typeof Feather.glyphMap> = {
  Home: 'home',
  Program: 'clipboard',
  Exercises: 'activity',
  Progress: 'trending-up',
  Profile: 'user',
};

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
        tabBarStyle: { borderTopColor: colors.border, backgroundColor: colors.card },
        tabBarIcon: ({ color, size }) => (
          <Feather name={TAB_ICONS[route.name]} color={color} size={size - 2} />
        ),
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Program" component={ProgramScreen} options={{ title: 'Plan' }} />
      <Tabs.Screen name="Exercises" component={ExercisesScreen} />
      <Tabs.Screen name="Progress" component={ProgressScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

export function RootNavigator() {
  const status = useAppSelector((s) => s.auth.status);
  if (status === 'restoring') return <LoadingView label="Opening RehabX…" />;

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { fontFamily: fonts.bold, color: colors.text },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {status === 'signedOut' ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="ExerciseDetail"
            component={ExerciseDetailScreen}
            options={{ title: '' }}
          />
          <Stack.Screen
            name="ExerciseSession"
            component={ExerciseSessionScreen}
            options={{ headerShown: false, presentation: 'fullScreenModal', gestureEnabled: false }}
          />
          <Stack.Screen
            name="ExerciseComplete"
            component={ExerciseCompleteScreen}
            options={{ headerShown: false, presentation: 'fullScreenModal', gestureEnabled: false }}
          />
          <Stack.Screen
            name="Milestones"
            component={MilestonesScreen}
            options={{ title: 'Goals & milestones' }}
          />
          <Stack.Screen
            name="Assessment"
            component={AssessmentScreen}
            options={{ title: 'Assessment summary' }}
          />
          <Stack.Screen
            name="Timeline"
            component={TimelineScreen}
            options={{ title: 'Rehabilitation journey' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
