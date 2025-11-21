// Advanced notification manager for T-Black App
// Handles smart notifications based on user actions and app state

import { notificationService } from './notifications';

export interface SmartNotification {
  id: string;
  title: string;
  body: string;
  data: Record<string, any>;
  triggerSeconds?: number;
  category: 'booking' | 'course' | 'product' | 'profile' | 'marketing' | 'system';
}

export const notificationManager = {
  // 🗓️ BOOKING NOTIFICATIONS
  async scheduleBookingReminder(bookingId: string, date: string, time: string, barberName: string) {
    const bookingDate = new Date(`${date} ${time}`);
    const now = new Date();

    // Reminder 24 hours before
    const reminder24h = new Date(bookingDate.getTime() - 24 * 60 * 60 * 1000);
    if (reminder24h > now) {
      const seconds = Math.floor((reminder24h.getTime() - now.getTime()) / 1000);
      await notificationService.scheduleLocalNotification(
        {
          title: '📅 Lembrete T-Black',
          body: `Seu corte com ${barberName} é amanhã às ${time}! Confirmado?`,
          data: { screen: 'bookings', bookingId, type: 'reminder_24h' },
        },
        seconds,
      );
    }

    // Reminder 2 hours before
    const reminder2h = new Date(bookingDate.getTime() - 2 * 60 * 60 * 1000);
    if (reminder2h > now) {
      const seconds = Math.floor((reminder2h.getTime() - now.getTime()) / 1000);
      await notificationService.scheduleLocalNotification(
        {
          title: '⏰ Quase na hora!',
          body: `Seu horário com ${barberName} é em 2 horas (${time}). Preparado?`,
          data: { screen: 'bookings', bookingId, type: 'reminder_2h' },
        },
        seconds,
      );
    }
  },

  async notifyBookingConfirmed(barberName: string, date: string, time: string) {
    await notificationService.scheduleLocalNotification({
      title: '✅ Agendamento Confirmado!',
      body: `Horário marcado com ${barberName} para ${new Date(date).toLocaleDateString('pt-BR')} às ${time}`,
      data: { screen: 'bookings', type: 'booking_confirmed' },
    });
  },

  async notifyBookingCancelled(barberName: string, date: string, time: string) {
    await notificationService.scheduleLocalNotification({
      title: '❌ Agendamento Cancelado',
      body: `Seu horário com ${barberName} em ${new Date(date).toLocaleDateString('pt-BR')} foi cancelado`,
      data: { screen: 'tabs/booking', type: 'booking_cancelled' },
    });
  },

  // 🛍️ ECOMMERCE NOTIFICATIONS
  async notifyItemAddedToCart(itemName: string, itemType: 'product' | 'course') {
    const emoji = itemType === 'product' ? '🛍️' : '📚';
    await notificationService.scheduleLocalNotification({
      title: `${emoji} Adicionado ao Carrinho`,
      body: `${itemName} está esperando por você!`,
      data: { screen: 'cart', type: 'item_added' },
    });
  },

  async notifyCartAbandonment() {
    // Notification after 1 hour of cart inactivity
    await notificationService.scheduleLocalNotification(
      {
        title: '🛒 Esqueceu alguma coisa?',
        body: 'Você tem itens no seu carrinho esperando para serem finalizados!',
        data: { screen: 'cart', type: 'cart_abandoned' },
      },
      3600,
    ); // 1 hour
  },

  async notifyPurchaseCompleted(totalValue: number, itemCount: number) {
    await notificationService.scheduleLocalNotification({
      title: '🎉 Compra Realizada!',
      body: `${itemCount} ${itemCount === 1 ? 'item' : 'itens'} por R$ ${totalValue.toFixed(2)}. Obrigado pela preferência!`,
      data: { screen: 'purchase-history', type: 'purchase_completed' },
    });
  },

  // 📚 COURSE NOTIFICATIONS
  async notifyCourseAccess(courseName: string) {
    await notificationService.scheduleLocalNotification({
      title: '📚 Curso Disponível!',
      body: `"${courseName}" já está disponível para assistir. Bora aprender?`,
      data: { screen: 'courses/mine', type: 'course_access' },
    });
  },

  async scheduleStudyReminder() {
    // Daily study reminder at 8 PM
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(20, 0, 0, 0);

    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const seconds = Math.floor((reminderTime.getTime() - now.getTime()) / 1000);

    await notificationService.scheduleLocalNotification(
      {
        title: '📖 Hora de Estudar!',
        body: 'Que tal assistir uma aula hoje? O conhecimento não espera!',
        data: { screen: 'courses/mine', type: 'study_reminder' },
      },
      seconds,
    );
  },

  async notifyCourseProgress(courseName: string, progressPercent: number) {
    if (progressPercent === 50) {
      await notificationService.scheduleLocalNotification({
        title: '🏆 Metade Concluída!',
        body: `Você já assistiu 50% de "${courseName}". Continue assim!`,
        data: { screen: 'courses/mine', type: 'course_progress' },
      });
    } else if (progressPercent === 100) {
      await notificationService.scheduleLocalNotification({
        title: '🎓 Parabéns!',
        body: `Curso "${courseName}" concluído! Você é incrível!`,
        data: { screen: 'courses/mine', type: 'course_completed' },
      });
    }
  },

  // 👤 PROFILE NOTIFICATIONS
  async notifyProfileUpdated() {
    await notificationService.scheduleLocalNotification({
      title: '✅ Perfil Atualizado!',
      body: 'Suas informações foram salvas com sucesso.',
      data: { screen: 'tabs/profile', type: 'profile_updated' },
    });
  },

  async notifyAvatarUpdated() {
    await notificationService.scheduleLocalNotification({
      title: '📸 Foto Atualizada!',
      body: 'Seu avatar foi atualizado. Ficou show!',
      data: { screen: 'tabs/profile', type: 'avatar_updated' },
    });
  },

  async scheduleProfileCompletion() {
    // Reminder to complete profile after 24 hours
    await notificationService.scheduleLocalNotification(
      {
        title: '👤 Complete seu Perfil',
        body: 'Adicione uma foto e complete suas informações para uma experiência melhor!',
        data: { screen: 'editProfile', type: 'complete_profile' },
      },
      86400,
    ); // 24 hours
  },

  // 🎯 MARKETING NOTIFICATIONS
  async scheduleWelcomeSequence() {
    // Welcome message after 10 minutes
    await notificationService.scheduleLocalNotification(
      {
        title: '👋 Bem-vindo ao T-Black!',
        body: 'Explore nossos serviços, produtos e cursos. Estamos aqui para você!',
        data: { screen: 'tabs/home', type: 'welcome' },
      },
      600,
    ); // 10 minutes

    // Feature discovery after 1 day
    await notificationService.scheduleLocalNotification(
      {
        title: '💡 Dica do T-Black',
        body: 'Sabia que você pode agendar, comprar produtos e fazer cursos tudo no app?',
        data: { screen: 'menu', type: 'feature_discovery' },
      },
      86400,
    ); // 1 day

    // Engagement after 3 days
    await notificationService.scheduleLocalNotification(
      {
        title: '✂️ Que tal um corte novo?',
        body: 'Já faz um tempo! Agende seu horário e venha renovar o visual.',
        data: { screen: 'tabs/booking', type: 'engagement' },
      },
      259200,
    ); // 3 days
  },

  async scheduleWeeklyPromotions() {
    // Weekly promotion on Mondays at 9 AM
    const now = new Date();
    const nextMonday = new Date();
    nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7));
    nextMonday.setHours(9, 0, 0, 0);

    if (nextMonday <= now) {
      nextMonday.setDate(nextMonday.getDate() + 7);
    }

    const seconds = Math.floor((nextMonday.getTime() - now.getTime()) / 1000);

    await notificationService.scheduleLocalNotification(
      {
        title: '🔥 Promoção da Semana!',
        body: 'Confira as ofertas especiais desta semana. Não perca!',
        data: { screen: 'product', type: 'weekly_promotion' },
      },
      seconds,
    );
  },

  async notifySpecialOffer(discount: number, category: string) {
    await notificationService.scheduleLocalNotification({
      title: `🎉 ${discount}% OFF!`,
      body: `Oferta especial em ${category}! Válida por tempo limitado.`,
      data: { screen: category === 'products' ? 'product' : 'courses/all', type: 'special_offer' },
    });
  },

  // 🔧 SYSTEM NOTIFICATIONS
  async notifyAppUpdate() {
    await notificationService.scheduleLocalNotification({
      title: '🆕 App Atualizado!',
      body: 'Nova versão disponível com melhorias e novidades.',
      data: { screen: 'tabs/home', type: 'app_update' },
    });
  },

  async scheduleMaintenanceWarning(maintenanceDate: Date) {
    const now = new Date();
    const warningTime = new Date(maintenanceDate.getTime() - 2 * 60 * 60 * 1000); // 2 hours before

    if (warningTime > now) {
      const seconds = Math.floor((warningTime.getTime() - now.getTime()) / 1000);
      await notificationService.scheduleLocalNotification(
        {
          title: '⚠️ Manutenção Programada',
          body: 'O app ficará indisponível das 02:00 às 04:00 para manutenção.',
          data: { type: 'maintenance_warning' },
        },
        seconds,
      );
    }
  },

  async scheduleInactivityReminder() {
    // Reminder after 7 days of inactivity
    await notificationService.scheduleLocalNotification(
      {
        title: '😢 Sentimos sua falta!',
        body: 'Há novidades esperando por você no T-Black. Que tal dar uma olhada?',
        data: { screen: 'tabs/home', type: 'inactivity_reminder' },
      },
      604800,
    ); // 7 days
  },

  // 🎂 SPECIAL OCCASIONS
  async scheduleBirthdayWish(birthdayDate: Date) {
    const now = new Date();
    const nextBirthday = new Date(birthdayDate);
    nextBirthday.setFullYear(now.getFullYear());

    if (nextBirthday < now) {
      nextBirthday.setFullYear(now.getFullYear() + 1);
    }

    const seconds = Math.floor((nextBirthday.getTime() - now.getTime()) / 1000);

    await notificationService.scheduleLocalNotification(
      {
        title: '🎂 Feliz Aniversário!',
        body: 'O T-Black deseja um feliz aniversário! Ganhe 15% OFF hoje.',
        data: { screen: 'product', type: 'birthday_wish', discount: 15 },
      },
      seconds,
    );
  },

  async scheduleHolidayGreeting() {
    // Christmas greeting
    const christmas = new Date();
    christmas.setMonth(11, 25); // December 25
    christmas.setHours(9, 0, 0, 0);

    const now = new Date();
    if (christmas > now) {
      const seconds = Math.floor((christmas.getTime() - now.getTime()) / 1000);
      await notificationService.scheduleLocalNotification(
        {
          title: '🎄 Feliz Natal!',
          body: 'O T-Black deseja um Natal repleto de alegria e cortes incríveis!',
          data: { screen: 'tabs/home', type: 'holiday_greeting' },
        },
        seconds,
      );
    }
  },

  // 🔄 UTILITY FUNCTIONS
  async cancelNotificationsByType(type: string) {
    // This would need to be implemented to track and cancel specific notification types
    console.log(`Canceling notifications of type: ${type}`);
  },

  async scheduleSmartNotifications(userPreferences?: {
    marketing?: boolean;
    reminders?: boolean;
    promotions?: boolean;
  }) {
    const prefs = {
      marketing: true,
      reminders: true,
      promotions: true,
      ...userPreferences,
    };

    if (prefs.marketing) {
      await this.scheduleWelcomeSequence();
      await this.scheduleWeeklyPromotions();
    }

    if (prefs.reminders) {
      await this.scheduleStudyReminder();
      await this.scheduleInactivityReminder();
    }

    if (prefs.promotions) {
      await this.scheduleHolidayGreeting();
    }
  },
};
