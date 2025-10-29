import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Créer un tenant par défaut
    const defaultTenant = await prisma.tenant.upsert({
      where: { domain: 'antstrike.local' },
      update: {},
      create: {
        name: 'AntStrike CTI',
        domain: 'antstrike.local',
        apiKey: 'antstrike-default-key-2024',
        plan: 'enterprise',
        isActive: true,
      },
    });

    console.log('✅ Tenant créé:', defaultTenant.name);

    // Créer un utilisateur admin par défaut
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@antstrike.local' },
      update: {},
      create: {
        tenantId: defaultTenant.id,
        email: 'admin@antstrike.local',
        password: hashedPassword,
        name: 'Administrateur AntStrike',
        role: 'admin',
        isActive: true,
      },
    });

    console.log('✅ Utilisateur admin créé:', adminUser.email);
    console.log('🔑 Mot de passe: admin123');

    // Créer un utilisateur analyste par défaut
    const analystPassword = await bcrypt.hash('analyst123', 12);
    
    const analystUser = await prisma.user.upsert({
      where: { email: 'analyst@antstrike.local' },
      update: {},
      create: {
        tenantId: defaultTenant.id,
        email: 'analyst@antstrike.local',
        password: analystPassword,
        name: 'Analyste AntStrike',
        role: 'analyst',
        isActive: true,
      },
    });

    console.log('✅ Utilisateur analyst créé:', analystUser.email);
    console.log('🔑 Mot de passe: analyst123');

    console.log('\n🎉 Base de données initialisée avec succès !');
    console.log('\n📋 Comptes créés :');
    console.log('   👑 Admin: admin@antstrike.local / admin123');
    console.log('   👤 Analyst: analyst@antstrike.local / analyst123');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
