import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
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
import { useTheme } from '../../../src/contexts/ThemeContext';
import { supabase } from '../../../src/services/supabase';

interface ProductForm {
  name: string;
  description: string;
  price: string;
  category: string;
  images: string[];
}

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

export default function NovoProduto() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProductForm>({
    name: '',
    description: '',
    price: '',
    category: categories[0],
    images: [],
  });

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        // Por enquanto vamos apenas armazenar a URI local
        // Em produção, você faria upload para um storage (Supabase Storage, Cloudinary, etc.)
        const imageUri = result.assets[0].uri;
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, imageUri],
        }));
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
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
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('products').insert([
        {
          name: form.name.trim(),
          description: form.description.trim(),
          price: parseFloat(form.price),
          category: form.category,
          images: form.images,
        },
      ]);

      if (error) throw error;

      Alert.alert('Sucesso', 'Produto criado com sucesso!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      Alert.alert('Erro', 'Não foi possível criar o produto');
    } finally {
      setLoading(false);
    }
  };

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
    imagesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 16,
    },
    addImageButton: {
      width: 100,
      height: 100,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.border,
      borderStyle: 'dashed',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    imageContainer: {
      position: 'relative',
    },
    productImage: {
      width: 100,
      height: 100,
      borderRadius: 8,
    },
    removeImageButton: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: colors.error,
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <AdminHeader title="Novo Produto" subtitle="Adicionar produto ao catálogo" showBack />

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

          {/* Imagens */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Imagens do Produto</Text>
            <View style={styles.imagesContainer}>
              <TouchableOpacity style={styles.addImageButton} onPress={handleImagePicker}>
                <Ionicons name="camera-outline" size={24} color={colors.textSecondary} />
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                  Adicionar
                </Text>
              </TouchableOpacity>

              {form.images.map((imageUri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: imageUri }} style={styles.productImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close" size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
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
            title="Salvar Produto"
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
