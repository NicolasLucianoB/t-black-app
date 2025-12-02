import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AdminHeader } from '../../../src/components/AdminHeader';
import Button from '../../../src/components/Button';
import Input from '../../../src/components/Input';
import LoadingSpinner from '../../../src/components/LoadingSpinner';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { supabase } from '../../../src/services/supabase';
import { Product } from '../../../src/types/product';

const categories = [
  'Shampoo',
  'Condicionador',
  'Pomada',
  'Cera',
  'Gel',
  'Óleo para Barba',
  'Balm para Barba',
  'Acessórios',
  'Outros',
];

export default function EditarProduto() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: categories[0],
  });

  const loadProduct = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();

      if (error) throw error;

      setProduct(data);
      setForm({
        name: data.name,
        description: data.description,
        price: data.price.toString(),
        category: data.category,
      });
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      Alert.alert('Erro', 'Não foi possível carregar o produto', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      Alert.alert('Erro', 'Nome do produto é obrigatório');
      return false;
    }

    if (!form.description.trim()) {
      Alert.alert('Erro', 'Descrição do produto é obrigatória');
      return false;
    }

    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Erro', 'Preço deve ser um valor válido maior que zero');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !product) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: form.name.trim(),
          description: form.description.trim(),
          price: parseFloat(form.price),
          category: form.category,
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id);

      if (error) throw error;

      Alert.alert('Sucesso', 'Produto atualizado com sucesso!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o produto');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    form: {
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    categoryContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryButtonText: {
      fontSize: 14,
      color: colors.text,
    },
    categoryButtonTextSelected: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    footer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    saveButton: {
      flex: 2,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <AdminHeader title="Carregando..." showBack />
        <LoadingSpinner />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <AdminHeader title="Produto não encontrado" showBack />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>Produto não encontrado</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <AdminHeader title="Editar Produto" subtitle={product.name} showBack />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Informações Básicas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações Básicas</Text>

            <Input
              label="Nome do Produto"
              value={form.name}
              onChangeText={(text: string) => setForm((prev) => ({ ...prev, name: text }))}
              placeholder="Ex: Pomada Modeladora Premium"
            />

            <Input
              label="Descrição"
              value={form.description}
              onChangeText={(text: string) => setForm((prev) => ({ ...prev, description: text }))}
              placeholder="Descreva o produto, seus benefícios e modo de uso..."
              multiline
              numberOfLines={4}
            />

            <Input
              label="Preço (R$)"
              value={form.price}
              onChangeText={(text: string) => setForm((prev) => ({ ...prev, price: text }))}
              placeholder="0,00"
              keyboardType="numeric"
            />
          </View>

          {/* Categoria */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categoria</Text>
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    form.category === category && styles.categoryButtonSelected,
                  ]}
                  onPress={() => setForm((prev) => ({ ...prev, category }))}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      form.category === category && styles.categoryButtonTextSelected,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          <Button
            title="Cancelar"
            onPress={() => router.back()}
            style={styles.cancelButton}
            textStyle={{ color: colors.text }}
          />
          <Button
            title="Salvar Alterações"
            onPress={handleSave}
            loading={saving}
            style={styles.saveButton}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
