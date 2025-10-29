/**
 * 🔧 CRÉER USER DE TEST
 * Crée un user de test pour les scripts automatisés
 */

const axios = require('axios');

const API_URL = 'http://localhost:4000';

const TEST_USER = {
  username: 'test_analyst',
  email: 'test@antstrike.com',
  password: 'Test123456!',
  tenantName: 'Test SOC',
  role: 'analyst'
};

async function createTestUser() {
  console.log('\n🔧 Création du user de test...\n');
  
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, TEST_USER);
    
    console.log('✅ User créé avec succès !');
    console.log('   Email:', TEST_USER.email);
    console.log('   Password:', TEST_USER.password);
    console.log('   Token:', response.data.token.substring(0, 30) + '...');
    console.log('\n🎉 Vous pouvez maintenant lancer: node test-endpoints.js\n');
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('⚠️  User existe déjà - Tentative de login...\n');
      
      try {
        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
          email: TEST_USER.email,
          password: TEST_USER.password
        });
        
        console.log('✅ Login réussi !');
        console.log('   Email:', TEST_USER.email);
        console.log('   Token:', loginResponse.data.token.substring(0, 30) + '...');
        console.log('\n🎉 Vous pouvez maintenant lancer: node test-endpoints.js\n');
        
        return loginResponse.data;
      } catch (loginError) {
        console.log('❌ Login échoué - Password incorrect ?');
        console.log('\n💡 Solution: Utilisez vos credentials existants dans test-endpoints.js');
        console.log('   Ligne 10: Modifier TEST_USER avec vos vrais credentials\n');
        throw loginError;
      }
    } else {
      console.log('❌ Erreur:', error.response?.data || error.message);
      throw error;
    }
  }
}

createTestUser()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));


