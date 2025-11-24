# 📋 Guia: Criação das Tabelas Products e Courses

## 🎯 **Objetivo**
Criar a infraestrutura de dados no Supabase para produtos e cursos, preparando o terreno para o painel admin futuro.

## 🗄️ **Tabelas que serão criadas:**

### 📦 **Products (Produtos)**
- Pomadas, shampoos, produtos para cabelo
- Campos: nome, descrição, preço, imagens, categoria, estoque
- Preparado para e-commerce

### 🎓 **Courses (Cursos)**
- Cursos do Tiago (marketing, técnicas de corte, etc.)
- Campos: título, instrutor, vídeo URL, duração, preço, nível
- Integração com YouTube

### 👨‍💼 **Barbers (Barbeiros)**
- Profissionais do estúdio
- Campos: nome, especialidades, horários, foto, avaliação
- Para sistema de agendamentos

### ✂️ **Services (Serviços)**
- Tipos de corte/serviços oferecidos
- Campos: nome, duração, preço, categoria
- Para agendamentos

### 📊 **Tabelas Auxiliares**
- `course_purchases`: histórico de compras de cursos
- `course_progress`: progresso do usuário nos cursos

## 🚀 **Como executar:**

### 1. **Acesse o Supabase Dashboard**
- Vá para [supabase.com/dashboard](https://supabase.com/dashboard)
- Selecione seu projeto T-Black

### 2. **Abra o SQL Editor**
- No menu lateral, clique em **"SQL Editor"**
- Clique em **"New query"**

### 3. **Execute o Script**
- Copie todo o conteúdo do arquivo `PRODUCTS_COURSES_TABLES.sql`
- Cole no editor SQL
- Clique em **"RUN"**

### 4. **Verificar Criação**
Execute esta query para verificar:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('products', 'courses', 'barbers', 'services', 'course_purchases', 'course_progress');
```

## ✅ **O que você terá após executar:**

- ✅ **6 tabelas** criadas e prontas para uso
- ✅ **Índices** configurados para performance
- ✅ **RLS (segurança)** habilitada com políticas básicas
- ✅ **Triggers** de updated_at funcionando
- ✅ **Estrutura completa** para painel admin

## 🔄 **Próximos Passos (futuro):**

1. **Painel Admin** para gerenciar produtos/cursos
2. **Upload de imagens** para products
3. **Integração com YouTube** para courses
4. **População inicial** com dados reais do estúdio

## 📝 **Observações:**

- **Tabelas ficam vazias** por enquanto (como solicitado)
- **Estrutura preparada** para receber dados via admin
- **App continuará funcionando** com dados mockados até população
- **Compatível** com sistema de pedidos já implementado

---

**💡 Resultado:** Infraestrutura de dados completa e pronta para o painel admin!