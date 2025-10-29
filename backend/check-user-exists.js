const { PrismaClient } = require('@prisma/client');

async function checkUser() {
  try {
    const prisma = new PrismaClient();
    console.log('🔍 Recherche utilisateur soc@antstrike.com...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'soc@antstrike.com' }
    });
    
    if (user) {
      console.log('✅ Utilisateur existe déjà:');
      console.log('  ID:', user.id);
      console.log('  Email:', user.email);
      console.log('  Tenant ID:', user.tenantId);
      console.log('  Role:', user.role);
    } else {
      console.log('❌ Utilisateur non trouvé');
    }
    
    await prisma.$disconnect();
  } catch (e) {
    console.log('❌ Erreur:', e.message);
  }
}

checkUser();
