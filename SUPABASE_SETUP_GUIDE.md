# 🚀 Guia de Implementação no Supabase

## 📋 Pré-requisitos

- ✅ Conta no Supabase criada
- ✅ Projeto no Supabase configurado
- ✅ Tabelas `products` e `courses` já existentes

## 🔧 Passo a Passo

### 1. **Acessar o SQL Editor**

1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. No menu lateral, clique em **"SQL Editor"**
3. Clique em **"New query"**

### 2. **Executar o Script SQL**

1. Copie todo o conteúdo do arquivo `PURCHASE_SYSTEM_SQL.sql`
2. Cole no editor SQL do Supabase
3. Clique em **"RUN"** (ou pressione `Ctrl+Enter`)

### 3. **Verificar se foi Criado Corretamente**

#### Verificar Tabelas:

```sql
-- Execute esta query para verificar as tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('purchases', 'purchase_items');
```

#### Verificar Colunas da Tabela purchases:

```sql
-- Verificar estrutura da tabela purchases
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'purchases'
AND table_schema = 'public'
ORDER BY ordinal_position;
```

#### Verificar a View:

```sql
-- Testar a view purchase_history
SELECT * FROM purchase_history LIMIT 1;
```

### 4. **Testar a Função Helper**

#### Teste Básico (sem dados reais):

```sql
-- Criar um pedido de teste (substitua os UUIDs pelos reais)
SELECT create_purchase_with_items(
    'your-user-uuid-here',  -- Substitua pelo UUID de um usuário real
    59.90,                  -- Total
    'Pedido de teste',      -- Notas
    '[
        {
            "product_id": "product-uuid-here",
            "course_id": null,
            "item_name": "Produto Teste",
            "item_type": "product",
            "quantity": 1,
            "unit_price": 59.90,
            "total_price": 59.90
        }
    ]'::jsonb
);
```

### 5. **Verificar Policies de Segurança**

```sql
-- Verificar se as policies foram criadas
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('purchases', 'purchase_items');
```

### 6. **Verificar Índices**

```sql
-- Verificar se os índices foram criados
SELECT indexname, tablename
FROM pg_indexes
WHERE tablename IN ('purchases', 'purchase_items')
AND schemaname = 'public';
```

## ✅ Checklist de Validação

- [ ] ✅ Tabela `purchases` criada com as colunas corretas
- [ ] ✅ Tabela `purchase_items` criada
- [ ] ✅ Índices criados para performance
- [ ] ✅ RLS (Row Level Security) habilitado
- [ ] ✅ Policies de segurança criadas
- [ ] ✅ Função `create_purchase_with_items` criada
- [ ] ✅ View `purchase_history` criada
- [ ] ✅ Triggers de `updated_at` funcionando

## 🔍 Troubleshooting

### ✅ ERROS CORRIGIDOS:

**Erro 1:** `ERROR: 42P13: input parameters after one with a default value must also have defaults`
**Solução:** Reordenação dos parâmetros na função `create_purchase_with_items`

**Erro 2:** `ERROR: 42809: "purchase_history" is not a table`
**Solução:** Removida policy da view (views herdam RLS das tabelas subjacentes automaticamente)

### Se der erro de permissões:

```sql
-- Garantir permissões para a view
GRANT SELECT ON purchase_history TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
```

### Se der erro de política:

```sql
-- Recriar política se necessário
DROP POLICY IF EXISTS "Users can view own purchase history" ON purchase_history;
-- E depois executar novamente a criação da policy
```

### Verificar se há tabelas products/courses:

```sql
-- Verificar se as tabelas referenciadas existem
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('products', 'courses');
```

## 🎯 Próximos Passos

Após executar com sucesso:

1. **Testar no app React Native**
   - O service `database.ts` já está configurado
   - Testar criação de pedido via app

2. **Configurar Authentication**
   - Garantir que o auth do Supabase está funcionando
   - Testar se as policies de RLS funcionam

3. **Deploy e Monitoramento**
   - Verificar logs no dashboard do Supabase
   - Monitorar performance das queries

---

💡 **Dica:** Execute uma seção por vez e verifique se não há erros antes de continuar para a próxima seção.
