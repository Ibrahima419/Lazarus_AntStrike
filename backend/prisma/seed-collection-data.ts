/**
 * 🌱 Collection Data Seed - Données de test pour le Collection Hub
 * Crée des données réalistes pour tester le frontend
 */

import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function seedCollectionData() {
  try {
    console.log('🌱 Seeding collection data...');

    // Récupérer le tenant par défaut
    const tenant = await prisma.tenant.findFirst({
      where: { domain: 'antstrike.local' }
    });

    if (!tenant) {
      console.error('❌ Tenant not found. Run prisma:seed first.');
      return;
    }

    console.log(`✅ Using tenant: ${tenant.name}`);

    // 1. Créer des alertes de test
    console.log('📊 Creating test alerts...');
    const testAlerts = [
      {
        id: uuidv4(),
        tenantId: tenant.id,
        title: 'Suspicious Network Activity Detected',
        description: 'Multiple failed login attempts from IP 192.168.1.100',
        severity: 'HIGH',
        status: 'open',
        source: 'firewall',
        priority: 'high',
        category: 'network',
        tags: ['network', 'intrusion', 'brute-force'],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: uuidv4(),
        tenantId: tenant.id,
        title: 'Malware Detection - Trojan.Generic',
        description: 'Trojan detected on workstation WS-001',
        severity: 'CRITICAL',
        status: 'investigating',
        source: 'antivirus',
        priority: 'critical',
        category: 'malware',
        tags: ['malware', 'trojan', 'workstation'],
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        id: uuidv4(),
        tenantId: tenant.id,
        title: 'Phishing Email Campaign',
        description: 'Suspicious email patterns detected',
        severity: 'MEDIUM',
        status: 'open',
        source: 'email-security',
        priority: 'medium',
        category: 'phishing',
        tags: ['phishing', 'email', 'social-engineering'],
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      }
    ];

    for (const alert of testAlerts) {
      await prisma.alert.upsert({
        where: { id: alert.id },
        update: {},
        create: alert
      });
    }

    console.log(`✅ Created ${testAlerts.length} test alerts`);

    // 2. Créer des menaces de test
    console.log('🎯 Creating test threats...');
    const testThreats = [
      {
        id: uuidv4(),
        tenantId: tenant.id,
        title: 'APT29 - Cozy Bear Campaign',
        description: 'Advanced Persistent Threat group targeting government entities',
        severity: 'HIGH',
        status: 'active',
        source: 'osint',
        category: 'apt',
        tags: ['apt', 'government', 'espionage'],
        confidence: 0.85,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: uuidv4(),
        tenantId: tenant.id,
        title: 'Ransomware - LockBit 3.0',
        description: 'New variant of LockBit ransomware targeting healthcare',
        severity: 'CRITICAL',
        status: 'active',
        source: 'threat-intel',
        category: 'ransomware',
        tags: ['ransomware', 'lockbit', 'healthcare'],
        confidence: 0.92,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      }
    ];

    for (const threat of testThreats) {
      await prisma.threat.upsert({
        where: { id: threat.id },
        update: {},
        create: threat
      });
    }

    console.log(`✅ Created ${testThreats.length} test threats`);

    // 3. Créer des CVEs de test
    console.log('🔐 Creating test CVEs...');
    const testCVEs = [
      {
        id: uuidv4(),
        tenantId: tenant.id,
        cveId: 'CVE-2024-12345',
        description: 'Buffer overflow in web server component',
        severity: 'HIGH',
        cvssScore: 8.5,
        publishedDate: new Date('2024-01-15'),
        lastModifiedDate: new Date('2024-01-20'),
        references: ['https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2024-12345'],
        affectedProducts: ['WebServer v2.1', 'WebServer v2.2'],
        exploitAvailable: true,
        patchAvailable: true,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        id: uuidv4(),
        tenantId: tenant.id,
        cveId: 'CVE-2024-67890',
        description: 'SQL injection vulnerability in database module',
        severity: 'CRITICAL',
        cvssScore: 9.2,
        publishedDate: new Date('2024-02-01'),
        lastModifiedDate: new Date('2024-02-05'),
        references: ['https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2024-67890'],
        affectedProducts: ['Database v3.0', 'Database v3.1'],
        exploitAvailable: true,
        patchAvailable: false,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      }
    ];

    for (const cve of testCVEs) {
      await prisma.cVEVulnerability.upsert({
        where: { cveId: cve.cveId },
        update: {},
        create: cve
      });
    }

    console.log(`✅ Created ${testCVEs.length} test CVEs`);

    // 4. Créer des données de collection
    console.log('📡 Creating collection test data...');
    
    // Simuler des données de queue
    const queueData = {
      waiting: 3,
      active: 1,
      completed: 15,
      failed: 2,
      total: 21
    };

    // Simuler des statistiques de collection
    const collectionStats = {
      totalItems: 1250,
      itemsLast24h: 45,
      itemsLast7d: 320,
      itemsLast30d: 1250,
      sourcesCount: 8,
      successRate: 0.92,
      avgDuration: 45.5,
      lastCollection: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      nextScheduled: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours from now
    };

    console.log('✅ Collection test data prepared');

    console.log('\n🎉 Collection data seeded successfully!');
    console.log('\n📊 Test Data Summary:');
    console.log(`   🚨 Alerts: ${testAlerts.length}`);
    console.log(`   🎯 Threats: ${testThreats.length}`);
    console.log(`   🔐 CVEs: ${testCVEs.length}`);
    console.log(`   📡 Queue: ${queueData.total} jobs`);
    console.log(`   📈 Collection Stats: ${collectionStats.totalItems} items`);

  } catch (error) {
    console.error('❌ Error seeding collection data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedCollectionData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });



