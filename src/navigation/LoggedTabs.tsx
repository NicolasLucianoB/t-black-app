import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Importar as telas
import HomeScreen from '../screens/HomeScreen';
import BookingScreen from '../screens/BookingScreen';
import CommunityScreen from '../screens/CommunityScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CoursesScreen from '../screens/CoursesScreen';
import ProductsScreen from '../screens/ProductsScreen';
import StudioInfoScreen from '../screens/StudioInfoScreen';
import CartScreen from '../screens/CartScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import CourseVideoScreen from '../screens/CourseVideoScreen';
import FAQScreen from '../screens/FAQScreen';
import MenuScreen from '../screens/MenuScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Componente principal com Bottom Tabs
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          paddingBottom: 16,
          paddingTop: 8,
          height: 75,
          paddingHorizontal: 10,
        },
        tabBarActiveTintColor: '#111',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Início',
        }}
      />
      <Tab.Screen
        name="Agendar"
        component={BookingScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Agendar',
        }}
      />
      <Tab.Screen
        name="Comunidade"
        component={CommunityScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Chat',
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
}

// Componente principal que combina Tabs + Modais
export default function LoggedTabs() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="TabNavigator" component={TabNavigator} />
      <Stack.Screen 
        name="Courses" 
        component={CoursesScreen} 
        options={{
          headerShown: true,
          title: 'Cursos',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#111',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="Products" 
        component={ProductsScreen} 
        options={{
          headerShown: true,
          title: 'Produtos',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#111',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="StudioInfo" 
        component={StudioInfoScreen} 
        options={{
          headerShown: true,
          title: 'Informações do Studio',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#111',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{
          headerShown: true,
          title: 'Carrinho',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#111',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{
          headerShown: true,
          title: 'Editar Perfil',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#111',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="CourseVideo" 
        component={CourseVideoScreen} 
        options={{
          headerShown: true,
          title: 'Aula',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#111',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{
          headerShown: true,
          title: 'Notificações',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#111',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="FAQ" 
        component={FAQScreen} 
        options={{
          headerShown: true,
          title: 'Perguntas Frequentes',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#111',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen} 
        options={{
          headerShown: true,
          title: 'Alterar Senha',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#111',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="MyBookings" 
        component={MyBookingsScreen} 
        options={{
          headerShown: true,
          title: 'Meus Agendamentos',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#111',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="PurchaseHistory" 
        component={PurchaseHistoryScreen} 
        options={{
          headerShown: true,
          title: 'Histórico de Compras',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#111',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="MyCourses" 
        component={MyCoursesScreen} 
        options={{
          headerShown: true,
          title: 'Meus Cursos',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#111',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="Help" 
        component={HelpScreen} 
        options={{
          headerShown: true,
          title: 'Ajuda',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#111',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="PrivacyPolicy" 
        component={PrivacyPolicyScreen} 
        options={{
          headerShown: true,
          title: 'Política de Privacidade',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#111',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="TermsOfUse" 
        component={TermsOfUseScreen} 
        options={{
          headerShown: true,
          title: 'Termos de Uso',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#111',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="Menu" 
        component={MenuScreen} 
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}

// Tela temporária de notificações
function NotificationsScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, color: '#666' }}>Notificações em breve!</Text>
    </View>
  );
} 

// Telas temporárias
function ChangePasswordScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, color: '#666' }}>Alterar Senha em breve!</Text>
    </View>
  );
}

function MyBookingsScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, color: '#666' }}>Meus Agendamentos em breve!</Text>
    </View>
  );
}

function PurchaseHistoryScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, color: '#666' }}>Histórico de Compras em breve!</Text>
    </View>
  );
}

function MyCoursesScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, color: '#666' }}>Meus Cursos em breve!</Text>
    </View>
  );
}

function HelpScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, color: '#666' }}>Ajuda em breve!</Text>
    </View>
  );
}

function PrivacyPolicyScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, color: '#666' }}>Política de Privacidade em breve!</Text>
    </View>
  );
}

function TermsOfUseScreen({ navigation }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: '#f7f7f7', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, color: '#666' }}>Termos de Uso em breve!</Text>
    </View>
  );
} 