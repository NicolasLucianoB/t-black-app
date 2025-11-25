# 🎯 Cadastro do Tiago Real - Passo a Passo

## 📋 **Instruções:**

### **1. Abrir Supabase Dashboard:**

1. Vá para: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto `t-black-app`
4. Vá em **SQL Editor** (ícone de banco de dados na sidebar)

### **2. Executar SQL:**

1. Clique em **New query**
2. Cole o conteúdo do arquivo `TIAGO_REAL_BARBER.sql`
3. Clique em **Run** (botão verde)

### **3. Verificar se funcionou:**

Deve aparecer algo como:

```
Barbeiro: | Tiago Santos | Cortes Modernos & Barbas Estilizadas | R$ 40 - R$ 90
Serviços: | Corte + Barba Completa | ... | R$ 85.0 - 90 min
Serviços: | Corte Moderno | ... | R$ 55.0 - 60 min
Serviços: | Barba Estilizada | ... | R$ 40.0 - 45 min
Serviços: | Corte Clássico | ... | R$ 40.0 - 45 min
```

### **4. Testar no App:**

1. Recarregue o app (R no terminal)
2. Vá na aba **Agendamento**
3. Deve aparecer o **Tiago Santos** com horários disponíveis
4. Tente agendar um horário

### **5. O que testar:**

- ✅ Tiago aparece na lista de barbeiros
- ✅ Horários disponíveis aparecem corretamente
- ✅ Pode selecionar serviço
- ✅ Pode escolher data/hora
- ✅ Consegue finalizar agendamento
- ✅ Notificação de confirmação aparece

## 🚨 **O que isso resolve:**

- ❌ Remove dados mockados/fake
- ✅ Cadastra Tiago com dados reais
- ✅ Horários de funcionamento corretos
- ✅ Serviços com preços reais
- ✅ Sistema de agendamento funcionando

**Execute o SQL e depois teste agendar um corte com o Tiago!** ✂️
