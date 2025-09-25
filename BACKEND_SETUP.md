# Studio T Black App - Setup Backend

Este documento contém as instruções para configurar o Supabase e Firebase no app.

## 🚀 Status Atual

✅ **Estrutura Preparada:**

- Sistema de autenticação (AuthContext)
- Tipagens completas (User, Booking, Course, Product, etc.)
- Serviços organizados (auth, database, storage, notifications)
- Hooks customizados para API calls
- Sistema de tratamento de erros
- Carrinho com persistência local
- Configuração de notificações push

## 📋 Próximos Passos

### 1. Configurar Supabase

1. **Criar conta no Supabase:**
   - Acesse https://supabase.com
   - Crie uma conta e um novo projeto

2. **Obter credenciais:**
   - No dashboard do projeto, vá em Settings → API
   - Copie a `URL` e `anon public key`

3. **Configurar no app:**
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione suas credenciais reais:
     ```env
     EXPO_PUBLIC_SUPABASE_URL=sua-url-aqui
     EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
     ```
   - ⚠️ **IMPORTANTE**: O arquivo `.env` está no `.gitignore` e não será commitado

4. **Criar tabelas no banco:** (SQL para executar no Supabase)

   ```sql
   -- Tabela de usuários (extend auth.users)
   CREATE TABLE public.users (
     id UUID REFERENCES auth.users ON DELETE CASCADE,
     email TEXT,
     name TEXT,
     phone TEXT,
     avatar TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     PRIMARY KEY (id)
   );

   -- Tabela de barbeiros
   CREATE TABLE public.barbers (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     avatar TEXT,
     specialties TEXT[],
     working_hours TEXT[],
     active BOOLEAN DEFAULT true,
     description TEXT,
     rating DECIMAL(2,1) DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Tabela de serviços
   CREATE TABLE public.services (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT,
     duration INTEGER NOT NULL, -- em minutos
     price DECIMAL(10,2) NOT NULL,
     category TEXT,
     active BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Tabela de agendamentos
   CREATE TABLE public.bookings (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES public.users(id),
     barber_id UUID REFERENCES public.barbers(id),
     service_id UUID REFERENCES public.services(id),
     date DATE NOT NULL,
     time TIME NOT NULL,
     status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
     notes TEXT,
     total_price DECIMAL(10,2),
     payment_method TEXT CHECK (payment_method IN ('card', 'pix', 'cash', 'pending')),
     payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Tabela de cursos
   CREATE TABLE public.courses (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT,
     instructor TEXT,
     thumbnail TEXT,
     video_url TEXT,
     duration INTEGER, -- em minutos
     price DECIMAL(10,2),
     level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
     category TEXT,
     tags TEXT[],
     active BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Tabela de produtos
   CREATE TABLE public.products (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT,
     price DECIMAL(10,2) NOT NULL,
     images TEXT[],
     category TEXT,
     brand TEXT,
     stock INTEGER DEFAULT 0,
     active BOOLEAN DEFAULT true,
     featured BOOLEAN DEFAULT false,
     specifications JSONB,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Tabela de compras de curso
   CREATE TABLE public.course_purchases (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES public.users(id),
     course_id UUID REFERENCES public.courses(id),
     purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     price DECIMAL(10,2),
     payment_method TEXT CHECK (payment_method IN ('card', 'pix')),
     payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded'))
   );

   -- Tabela de progresso dos cursos
   CREATE TABLE public.course_progress (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES public.users(id),
     course_id UUID REFERENCES public.courses(id),
     watched_minutes INTEGER DEFAULT 0,
     total_minutes INTEGER,
     completed BOOLEAN DEFAULT false,
     last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     UNIQUE(user_id, course_id)
   );

   -- Configurar RLS (Row Level Security)
   ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;
   ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;

   -- Políticas RLS
   CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
   CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
   CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "Users can create own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
   ```

### 2. Configurar Firebase (Push Notifications)

1. **Criar projeto no Firebase:**
   - Acesse https://console.firebase.google.com
   - Crie um novo projeto

2. **Adicionar app ao projeto:**
   - Clique em "Adicionar app" → "Web"
   - Registre o app e copie as configurações

3. **Configurar no app:**
   - No mesmo arquivo `.env`
   - Adicione as credenciais do Firebase:
     ```env
     EXPO_PUBLIC_FIREBASE_API_KEY=sua-api-key
     EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu-project-id
     EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-project.appspot.com
     EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
     EXPO_PUBLIC_FIREBASE_APP_ID=seu-app-id
     # ... outras configurações conforme necessário
     ```

4. **Configurar notificações:**
   - No console Firebase, vá em "Cloud Messaging"
   - Configure as notificações push

### 3. Ativar os Serviços

Depois de configurar as credenciais:

1. **No arquivo `src/services/auth.ts`:**
   - Descomente as linhas do Supabase
   - Remova os mocks

2. **No arquivo `src/services/database.ts`:**
   - Descomente as queries do Supabase
   - Remova os dados mockados

3. **No arquivo `src/services/firebase.ts`:**
   - Descomente o código do Firebase
   - Configure as notificações

### 4. Testar

1. **Teste de autenticação:**
   - Tente criar uma conta
   - Faça login/logout

2. **Teste de dados:**
   - Verifique se os dados são salvos no Supabase

3. **Teste de notificações:**
   - Teste as notificações push

## 🔧 Comandos Úteis

```bash
# Instalar dependências (já feito)
npm install @supabase/supabase-js
npx expo install expo-notifications expo-device expo-constants

# Rodar o app
npm start

# Ver logs
npx expo logs
```

## 📁 Estrutura Criada

```
src/
  services/          # Serviços para backend
    auth.ts         # Autenticação
    database.ts     # Banco de dados
    storage.ts      # Upload de arquivos
    notifications.ts # Notificações push
    firebase.ts     # Configuração Firebase
    supabase.ts     # Configuração Supabase
    index.ts        # Exports centralizados

  contexts/          # Contextos React
    AuthContext.tsx # Autenticação global
    CartContext.tsx # Carrinho (com persistência)
    ThemeContext.tsx # Temas

  hooks/             # Hooks customizados
    useApi.ts       # Hook genérico para API
    useBookings.ts  # Hooks para agendamentos
    useCourses.ts   # Hooks para cursos
    useProducts.ts  # Hooks para produtos
    useBarbers.ts   # Hooks para barbeiros

  types/             # Tipagens TypeScript
    user.ts         # Tipos do usuário
    booking.ts      # Tipos de agendamento
    course.ts       # Tipos de curso
    product.ts      # Tipos de produto
    notification.ts # Tipos de notificação
    api.ts          # Tipos de API

  utils/             # Utilitários
    errorHandler.ts # Tratamento de erros
    index.ts        # Funções utilitárias
```

## 🔒 Segurança

### ⚠️ **IMPORTANTE - Segurança:**

- **`.env`** → Suas credenciais reais (NUNCA commitado, está no .gitignore)

### 🛡️ **Como usar:**

1. Crie o arquivo `.env` na raiz do projeto
2. Adicione suas credenciais reais
3. O arquivo ficará local e nunca será enviado ao git

### � **Variáveis necessárias no .env:**

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=sua-url-aqui
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui

# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=sua-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=seu-app-id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=seu-measurement-id
EXPO_PUBLIC_FIREBASE_VAPID_KEY=sua-vapid-key

# App
EXPO_PUBLIC_APP_NAME=Studio T Black
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### �🚨 **NUNCA faça:**

- ❌ Commitar o arquivo `.env`
- ❌ Compartilhar credenciais em chat/email
- ❌ Usar credenciais em código hardcoded

## ✅ Próximo Passo

**Agora você pode criar as contas no Supabase e Firebase!**

Após criar as contas e configurar as credenciais no arquivo `.env`, o app estará pronto para usar os serviços de backend de forma completa.

O app já está **100% preparado** para integração - é só conectar! 🚀
