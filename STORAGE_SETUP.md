# 📸 **Configuração do Supabase Storage para Upload de Imagens**

## 🎯 **Funcionalidades Implementadas**

### ✅ **Serviços Criados:**

- `storageService` - Upload, delete e listagem de arquivos
- `useImageUpload` - Hook React para gerenciar uploads com UI
- **Avatar do usuário** - Clique no avatar no perfil para alterar

### 🔧 **Buckets Necessários no Supabase**

Execute os seguintes comandos no **SQL Editor** do seu projeto Supabase:

```sql
-- 1. Criar bucket para avatares de usuário
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- 2. Criar bucket para imagens de produtos
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true);

-- 3. Configurar políticas de segurança para avatares
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND
  name LIKE auth.uid()::text || '%'
);

CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND
  name LIKE auth.uid()::text || '%'
);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND
  name LIKE auth.uid()::text || '%'
);

-- 4. Configurar políticas para produtos (apenas admin)
CREATE POLICY "Product images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Only authenticated users can upload product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'products' AND
  auth.role() = 'authenticated'
);
```

## 📱 **Como Usar no App**

### 1. **Avatar do Usuário:**

```tsx
// No perfil, o usuário pode clicar no avatar para alterar
// A funcionalidade já está integrada em app/tabs/profile.tsx
```

### 2. **Upload Personalizado:**

```tsx
import { useImageUpload } from 'src/hooks/useImageUpload';

function MyComponent() {
  const { uploading, pickAndUploadImage } = useImageUpload();

  const handleUpload = async () => {
    const result = await pickAndUploadImage('products', `product_${Date.now()}.jpg`);

    if (result.url) {
      console.log('Uploaded:', result.url);
    }
  };

  return (
    <TouchableOpacity onPress={handleUpload} disabled={uploading}>
      <Text>{uploading ? 'Uploading...' : 'Select Image'}</Text>
    </TouchableOpacity>
  );
}
```

### 3. **Upload Direto:**

```tsx
import { storageService } from 'src/services/storage';

const uploadFile = async (file: File | Blob) => {
  const result = await storageService.uploadFile('products', `my-file.jpg`, file, {
    contentType: 'image/jpeg',
  });

  return result.url;
};
```

## 🔐 **Políticas de Segurança**

### **Avatares:**

- ✅ Público para leitura
- ✅ Usuários podem fazer upload/update/delete apenas do próprio avatar

### **Produtos:**

- ✅ Público para leitura
- ✅ Apenas usuários autenticados podem fazer upload

## 📂 **Estrutura de Arquivos no Storage**

```
avatares/
  ├── {userId}.jpg        # Avatar do usuário
  └── {userId}.png        # Formatos suportados

products/
  ├── product_123_timestamp.jpg
  ├── product_456_timestamp.png
  └── ...
```

## 🚀 **Próximos Passos**

1. **✅ Implementado** - Upload de avatares no perfil
2. **🔄 Próximo** - Integrar upload de produtos no admin
3. **🔄 Futuro** - Redimensionamento automático de imagens
4. **🔄 Futuro** - Cache e otimização de imagens

## 📋 **Checklist de Implementação**

- [x] Instalar `expo-image-picker`
- [x] Implementar `storageService` com Supabase
- [x] Criar hook `useImageUpload`
- [x] Integrar avatar no perfil do usuário
- [ ] Configurar buckets no Supabase (execute o SQL acima)
- [ ] Testar upload de avatar
- [ ] Implementar upload de produtos (próximo)

---

**💡 Dica:** Após executar o SQL no Supabase, teste o upload de avatar no perfil do app!
