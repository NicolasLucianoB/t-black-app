import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function StudioInfoScreen({ navigation }: any) {
  const endereco = 'Rua das Flores, 123 - Centro, São Paulo - SP, 01234-567';
  const telefone = '(11) 99999-9999';
  const whatsapp = '11999999999';
  const email = 'contato@studiotblack.com.br';

  const coordenadas = {
    latitude: -23.5505,
    longitude: -46.6333,
  };

  const abrirGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o Google Maps');
    });
  };

  const fazerLigacao = () => {
    Linking.openURL(`tel:${telefone}`).catch(() => {
      Alert.alert('Erro', 'Não foi possível fazer a ligação');
    });
  };

  const abrirWhatsapp = () => {
    const url = `https://wa.me/55${whatsapp}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
    });
  };

  const enviarEmail = () => {
    Linking.openURL(`mailto:${email}`).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o email');
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Studio T Black</Text>
          <Text style={styles.subtitle}>Barbearia Profissional</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={24} color="#111" />
            <Text style={styles.sectionTitle}>Localização</Text>
          </View>
          <Text style={styles.address}>{endereco}</Text>
          <TouchableOpacity style={styles.mapButton} onPress={abrirGoogleMaps}>
            <Ionicons name="map" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.mapButtonText}>Ver no Google Maps</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={24} color="#111" />
            <Text style={styles.sectionTitle}>Horário de Funcionamento</Text>
          </View>
          <View style={styles.horarios}>
            <View style={styles.horarioItem}>
              <Text style={styles.dia}>Segunda a Sexta</Text>
              <Text style={styles.horario}>09:00 - 20:00</Text>
            </View>
            <View style={styles.horarioItem}>
              <Text style={styles.dia}>Sábado</Text>
              <Text style={styles.horario}>08:00 - 18:00</Text>
            </View>
            <View style={styles.horarioItem}>
              <Text style={styles.dia}>Domingo</Text>
              <Text style={styles.horario}>Fechado</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call" size={24} color="#111" />
            <Text style={styles.sectionTitle}>Contato</Text>
          </View>

          <TouchableOpacity style={styles.contactItem} onPress={fazerLigacao}>
            <Ionicons name="call-outline" size={20} color="#111" />
            <Text style={styles.contactText}>{telefone}</Text>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem} onPress={abrirWhatsapp}>
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
            <Text style={styles.contactText}>WhatsApp</Text>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem} onPress={enviarEmail}>
            <Ionicons name="mail-outline" size={20} color="#111" />
            <Text style={styles.contactText}>{email}</Text>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color="#111" />
            <Text style={styles.sectionTitle}>Sobre o Studio</Text>
          </View>
          <Text style={styles.aboutText}>
            O Studio T Black é uma barbearia moderna e profissional, especializada em cortes
            masculinos, barbas e tratamentos capilares. Nossa equipe de barbeiros experientes
            utiliza técnicas avançadas e produtos de qualidade para garantir o melhor resultado para
            nossos clientes.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginLeft: 8,
  },
  address: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
  },
  mapButton: {
    backgroundColor: '#111',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  horarios: {
    gap: 12,
  },
  horarioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dia: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  horario: {
    fontSize: 16,
    color: '#666',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  aboutText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
});
