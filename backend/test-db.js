const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres' // Connexion à la base par défaut
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Connexion PostgreSQL réussie');

    // Créer la base de données antstrike si elle n'existe pas
    await client.query('CREATE DATABASE antstrike');
    console.log('✅ Base de données antstrike créée');

    await client.end();
    console.log('✅ Connexion fermée');
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

testConnection();
