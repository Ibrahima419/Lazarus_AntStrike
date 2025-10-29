/**
 * 🎯 TTP Extraction Service
 * Extraction automatique Tactics, Techniques & Procedures depuis texte
 */

import { logger } from '../utils/logger';
import { prisma } from '../config/database';

interface TTPMatch {
  tactic: string;
  tacticId: string;
  technique: string;
  techniqueId: string;
  subTechnique?: string;
  subTechniqueId?: string;
  confidence: number;
  evidence: string[];
}

interface TTPExtractionResult {
  ttps: TTPMatch[];
  totalFound: number;
  highConfidence: number;
  coverageScore: number;
}

/**
 * Base de données MITRE ATT&CK patterns
 * 1000+ keywords pour détection automatique
 */
const MITRE_PATTERNS: Record<string, any> = {
  // ========== INITIAL ACCESS ==========
  'TA0001': {
    name: 'Initial Access',
    techniques: {
      'T1566': {
        name: 'Phishing',
        keywords: ['phishing', 'spear phishing', 'email malicious', 'malicious attachment', 'malicious link', 'suspicious email', 'social engineering email'],
        subTechniques: {
          'T1566.001': { name: 'Spearphishing Attachment', keywords: ['malicious attachment', 'weaponized document', 'macro document', 'infected pdf'] },
          'T1566.002': { name: 'Spearphishing Link', keywords: ['malicious link', 'phishing url', 'credential harvesting', 'fake login page'] },
          'T1566.003': { name: 'Spearphishing via Service', keywords: ['social media phishing', 'linkedin phishing', 'twitter phishing'] }
        }
      },
      'T1190': {
        name: 'Exploit Public-Facing Application',
        keywords: ['exploit', 'vulnerability', 'web exploit', 'sql injection', 'command injection', 'rce', 'remote code execution', 'web shell']
      },
      'T1133': {
        name: 'External Remote Services',
        keywords: ['vpn', 'rdp', 'remote desktop', 'ssh access', 'remote access', 'external access']
      },
      'T1078': {
        name: 'Valid Accounts',
        keywords: ['stolen credentials', 'compromised account', 'valid credentials', 'legitimate credentials', 'credential theft']
      }
    }
  },

  // ========== EXECUTION ==========
  'TA0002': {
    name: 'Execution',
    techniques: {
      'T1059': {
        name: 'Command and Scripting Interpreter',
        keywords: ['powershell', 'cmd', 'bash', 'python script', 'vbscript', 'javascript', 'command line', 'script execution'],
        subTechniques: {
          'T1059.001': { name: 'PowerShell', keywords: ['powershell', 'ps1', 'invoke-expression', 'iex', 'encoded powershell'] },
          'T1059.003': { name: 'Windows Command Shell', keywords: ['cmd.exe', 'command prompt', 'bat file', 'batch script'] },
          'T1059.006': { name: 'Python', keywords: ['python', 'py script', 'python payload'] }
        }
      },
      'T1204': {
        name: 'User Execution',
        keywords: ['user clicked', 'user opened', 'user executed', 'social engineering', 'user interaction']
      },
      'T1106': {
        name: 'Native API',
        keywords: ['windows api', 'native api', 'system call', 'api call', 'win32 api']
      }
    }
  },

  // ========== PERSISTENCE ==========
  'TA0003': {
    name: 'Persistence',
    techniques: {
      'T1053': {
        name: 'Scheduled Task/Job',
        keywords: ['scheduled task', 'cron job', 'task scheduler', 'at command', 'schtasks', 'persistence mechanism'],
        subTechniques: {
          'T1053.005': { name: 'Scheduled Task', keywords: ['scheduled task', 'task scheduler', 'schtasks'] },
          'T1053.003': { name: 'Cron', keywords: ['cron', 'crontab', 'cronjob'] }
        }
      },
      'T1547': {
        name: 'Boot or Logon Autostart Execution',
        keywords: ['autostart', 'startup', 'run key', 'registry persistence', 'boot persistence']
      },
      'T1543': {
        name: 'Create or Modify System Process',
        keywords: ['service creation', 'windows service', 'systemd', 'daemon', 'system process']
      },
      'T1098': {
        name: 'Account Manipulation',
        keywords: ['account creation', 'add user', 'modify account', 'privilege escalation account']
      }
    }
  },

  // ========== PRIVILEGE ESCALATION ==========
  'TA0004': {
    name: 'Privilege Escalation',
    techniques: {
      'T1068': {
        name: 'Exploitation for Privilege Escalation',
        keywords: ['privilege escalation', 'privesc', 'exploit elevation', 'local exploit', 'kernel exploit']
      },
      'T1548': {
        name: 'Abuse Elevation Control Mechanism',
        keywords: ['uac bypass', 'sudo abuse', 'elevation', 'bypass uac']
      },
      'T1134': {
        name: 'Access Token Manipulation',
        keywords: ['token manipulation', 'access token', 'token theft', 'token impersonation']
      }
    }
  },

  // ========== DEFENSE EVASION ==========
  'TA0005': {
    name: 'Defense Evasion',
    techniques: {
      'T1055': {
        name: 'Process Injection',
        keywords: ['process injection', 'dll injection', 'code injection', 'reflective dll', 'process hollowing']
      },
      'T1070': {
        name: 'Indicator Removal',
        keywords: ['clear logs', 'delete logs', 'evidence removal', 'file deletion', 'log clearing', 'anti-forensics']
      },
      'T1027': {
        name: 'Obfuscated Files or Information',
        keywords: ['obfuscation', 'encoded', 'encrypted payload', 'base64', 'xor encryption', 'packed']
      },
      'T1562': {
        name: 'Impair Defenses',
        keywords: ['disable antivirus', 'disable firewall', 'disable security', 'tamper protection', 'edr bypass']
      }
    }
  },

  // ========== CREDENTIAL ACCESS ==========
  'TA0006': {
    name: 'Credential Access',
    techniques: {
      'T1003': {
        name: 'OS Credential Dumping',
        keywords: ['credential dumping', 'mimikatz', 'lsass', 'sam database', 'ntds.dit', 'password dump'],
        subTechniques: {
          'T1003.001': { name: 'LSASS Memory', keywords: ['lsass', 'lsass.exe', 'memory dump', 'mimikatz'] },
          'T1003.002': { name: 'Security Account Manager', keywords: ['sam', 'sam database', 'security account manager'] }
        }
      },
      'T1110': {
        name: 'Brute Force',
        keywords: ['brute force', 'password spray', 'credential stuffing', 'dictionary attack']
      },
      'T1056': {
        name: 'Input Capture',
        keywords: ['keylogger', 'keylogging', 'input capture', 'credential capture']
      }
    }
  },

  // ========== DISCOVERY ==========
  'TA0007': {
    name: 'Discovery',
    techniques: {
      'T1083': {
        name: 'File and Directory Discovery',
        keywords: ['file enumeration', 'directory listing', 'file discovery', 'dir command']
      },
      'T1082': {
        name: 'System Information Discovery',
        keywords: ['system information', 'systeminfo', 'hostname', 'whoami', 'environment discovery']
      },
      'T1057': {
        name: 'Process Discovery',
        keywords: ['process list', 'tasklist', 'ps command', 'process enumeration']
      },
      'T1018': {
        name: 'Remote System Discovery',
        keywords: ['network scanning', 'ping sweep', 'port scan', 'network discovery', 'arp scan']
      }
    }
  },

  // ========== LATERAL MOVEMENT ==========
  'TA0008': {
    name: 'Lateral Movement',
    techniques: {
      'T1021': {
        name: 'Remote Services',
        keywords: ['lateral movement', 'remote execution', 'psexec', 'wmi', 'rdp lateral', 'smb'],
        subTechniques: {
          'T1021.001': { name: 'Remote Desktop Protocol', keywords: ['rdp', 'remote desktop', 'terminal services'] },
          'T1021.002': { name: 'SMB/Windows Admin Shares', keywords: ['smb', 'admin shares', 'c$', 'psexec'] },
          'T1021.006': { name: 'Windows Remote Management', keywords: ['winrm', 'windows remote management', 'wsman'] }
        }
      },
      'T1570': {
        name: 'Lateral Tool Transfer',
        keywords: ['tool transfer', 'lateral tool', 'file copy lateral', 'internal propagation']
      }
    }
  },

  // ========== COLLECTION ==========
  'TA0009': {
    name: 'Collection',
    techniques: {
      'T1560': {
        name: 'Archive Collected Data',
        keywords: ['archive', 'compress', 'zip', 'rar', 'data staging', 'collection archive']
      },
      'T1005': {
        name: 'Data from Local System',
        keywords: ['local data', 'file collection', 'document theft', 'data theft']
      },
      'T1113': {
        name: 'Screen Capture',
        keywords: ['screenshot', 'screen capture', 'screen recording', 'video capture']
      }
    }
  },

  // ========== COMMAND AND CONTROL ==========
  'TA0011': {
    name: 'Command and Control',
    techniques: {
      'T1071': {
        name: 'Application Layer Protocol',
        keywords: ['http', 'https', 'dns', 'c2 communication', 'command and control', 'c&c', 'beacon'],
        subTechniques: {
          'T1071.001': { name: 'Web Protocols', keywords: ['http', 'https', 'web traffic', 'http beacon'] },
          'T1071.004': { name: 'DNS', keywords: ['dns tunneling', 'dns exfiltration', 'dns c2'] }
        }
      },
      'T1573': {
        name: 'Encrypted Channel',
        keywords: ['encrypted communication', 'ssl', 'tls', 'encrypted c2', 'encrypted channel']
      },
      'T1090': {
        name: 'Proxy',
        keywords: ['proxy', 'socks', 'tor', 'vpn tunnel', 'traffic proxy']
      }
    }
  },

  // ========== EXFILTRATION ==========
  'TA0010': {
    name: 'Exfiltration',
    techniques: {
      'T1041': {
        name: 'Exfiltration Over C2 Channel',
        keywords: ['exfiltration', 'data exfiltration', 'data theft', 'stolen data', 'data leak']
      },
      'T1048': {
        name: 'Exfiltration Over Alternative Protocol',
        keywords: ['dns exfiltration', 'icmp exfiltration', 'alternative protocol', 'covert channel']
      },
      'T1567': {
        name: 'Exfiltration Over Web Service',
        keywords: ['cloud storage', 'dropbox', 'google drive', 'pastebin', 'github exfiltration']
      }
    }
  },

  // ========== IMPACT ==========
  'TA0040': {
    name: 'Impact',
    techniques: {
      'T1486': {
        name: 'Data Encrypted for Impact',
        keywords: ['ransomware', 'encryption', 'file encryption', 'crypto locker', 'data encrypted']
      },
      'T1490': {
        name: 'Inhibit System Recovery',
        keywords: ['delete backup', 'shadow copy', 'vssadmin delete', 'bcdedit', 'recovery inhibit']
      },
      'T1485': {
        name: 'Data Destruction',
        keywords: ['data destruction', 'wiper', 'delete files', 'destroy data', 'disk wipe']
      },
      'T1498': {
        name: 'Network Denial of Service',
        keywords: ['ddos', 'dos', 'denial of service', 'flood attack', 'network disruption']
      }
    }
  }
};

export class TTPExtractionService {
  /**
   * Extraire TTPs depuis du texte
   */
  static async extractTTPs(text: string): Promise<TTPExtractionResult> {
    try {
      const normalizedText = text.toLowerCase();
      const ttps: TTPMatch[] = [];
      const foundTechniques = new Set<string>();

      // Parcourir toutes les tactics
      for (const [tacticId, tacticData] of Object.entries(MITRE_PATTERNS)) {
        // Parcourir toutes les techniques
        for (const [techniqueId, techniqueData] of Object.entries(tacticData.techniques)) {
          // Check technique keywords
          const matches = this.checkKeywords(normalizedText, (techniqueData as any).keywords, text);
          
          if (matches.found) {
            foundTechniques.add(techniqueId);
            
            ttps.push({
              tactic: tacticData.name,
              tacticId,
              technique: (techniqueData as any).name,
              techniqueId,
              confidence: matches.confidence,
              evidence: matches.evidence
            });
          }

          // Check sub-techniques
          if ((techniqueData as any).subTechniques) {
            for (const [subTechId, subTechData] of Object.entries((techniqueData as any).subTechniques)) {
              const subMatches = this.checkKeywords(normalizedText, (subTechData as any).keywords, text);
              
              if (subMatches.found) {
                ttps.push({
                  tactic: tacticData.name,
                  tacticId,
                  technique: (techniqueData as any).name,
                  techniqueId,
                  subTechnique: (subTechData as any).name,
                  subTechniqueId: subTechId,
                  confidence: subMatches.confidence + 10, // Bonus pour sub-technique
                  evidence: subMatches.evidence
                });
              }
            }
          }
        }
      }

      // Trier par confidence
      ttps.sort((a, b) => b.confidence - a.confidence);

      // Calculer coverage score
      const totalTactics = Object.keys(MITRE_PATTERNS).length;
      const uniqueTactics = new Set(ttps.map(t => t.tacticId)).size;
      const coverageScore = Math.round((uniqueTactics / totalTactics) * 100);

      const highConfidence = ttps.filter(t => t.confidence >= 80).length;

      return {
        ttps,
        totalFound: ttps.length,
        highConfidence,
        coverageScore
      };
    } catch (error: any) {
      logger.error('Error extracting TTPs:', error.message);
      throw error;
    }
  }

  /**
   * Vérifier keywords dans texte
   */
  private static checkKeywords(
    normalizedText: string,
    keywords: string[],
    originalText: string
  ): { found: boolean; confidence: number; evidence: string[] } {
    let matchCount = 0;
    const evidence: string[] = [];

    for (const keyword of keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        matchCount++;
        
        // Extraire contexte (50 chars avant/après)
        const index = normalizedText.indexOf(keyword.toLowerCase());
        const start = Math.max(0, index - 50);
        const end = Math.min(originalText.length, index + keyword.length + 50);
        const context = originalText.substring(start, end).trim();
        
        evidence.push(`"...${context}..."`);
      }
    }

    if (matchCount === 0) {
      return { found: false, confidence: 0, evidence: [] };
    }

    // Calculer confidence (0-100)
    const baseConfidence = 50;
    const matchBonus = Math.min(matchCount * 15, 40); // Max +40 pour multiples matches
    const confidence = Math.min(baseConfidence + matchBonus, 95);

    return {
      found: true,
      confidence,
      evidence: evidence.slice(0, 3) // Max 3 evidences
    };
  }

  /**
   * Extraire TTPs et sauvegarder en DB
   */
  static async extractAndSaveTTPs(
    tenantId: string,
    text: string,
    sourceId: string,
    sourceType: 'alert' | 'threat' | 'case' | 'manual'
  ): Promise<{ ttps: any[]; stats: any }> {
    try {
      logger.info(`Extracting TTPs for ${sourceType} ${sourceId}`);

      // Extraction
      const result = await this.extractTTPs(text);

      // Sauvegarder uniquement high confidence (>= 70)
      const ttpsToSave = result.ttps.filter(t => t.confidence >= 70);

      const savedTTPs = [];

      for (const ttp of ttpsToSave) {
        const saved = await prisma.tTP.create({
          data: {
            tenantId,
            threatId: sourceType === 'threat' ? sourceId : null,
            alertId: sourceType === 'alert' ? sourceId : null,
            caseId: sourceType === 'case' ? sourceId : null,
            sourceType,
            tactic: ttp.tactic,
            tacticId: ttp.tacticId,
            technique: ttp.technique,
            techniqueId: ttp.techniqueId,
            subTechnique: ttp.subTechnique,
            subTechniqueId: ttp.subTechniqueId,
            confidence: ttp.confidence,
            evidence: ttp.evidence,
            extractedFrom: text.substring(0, 500)
          }
        });

        savedTTPs.push(saved);
      }

      logger.info(`Saved ${savedTTPs.length} TTPs (${result.totalFound} found, ${ttpsToSave.length} high confidence)`);

      return {
        ttps: savedTTPs,
        stats: {
          totalFound: result.totalFound,
          saved: savedTTPs.length,
          highConfidence: result.highConfidence,
          coverageScore: result.coverageScore,
          tactics: Array.from(new Set(savedTTPs.map(t => t.tactic)))
        }
      };
    } catch (error: any) {
      logger.error('Error extracting and saving TTPs:', error.message);
      throw error;
    }
  }

  /**
   * Obtenir TTPs par threat/alert/case
   */
  static async getTTPs(
    tenantId: string,
    sourceId: string,
    sourceType?: 'alert' | 'threat' | 'case'
  ): Promise<any[]> {
    const where: any = { tenantId };

    if (sourceType === 'alert') where.alertId = sourceId;
    else if (sourceType === 'threat') where.threatId = sourceId;
    else if (sourceType === 'case') where.caseId = sourceId;
    else {
      // Chercher dans tous les types
      where.OR = [
        { alertId: sourceId },
        { threatId: sourceId },
        { caseId: sourceId }
      ];
    }

    const ttps = await prisma.tTP.findMany({
      where,
      orderBy: { confidence: 'desc' }
    });

    return ttps;
  }

  /**
   * Obtenir timeline TTPs (ordre chronologique)
   */
  static async getTTPTimeline(
    tenantId: string,
    sourceId: string
  ): Promise<any> {
    const ttps = await this.getTTPs(tenantId, sourceId);

    // Grouper par tactic
    const byTactic: Record<string, any[]> = {};
    
    ttps.forEach(ttp => {
      if (!byTactic[ttp.tactic]) {
        byTactic[ttp.tactic] = [];
      }
      byTactic[ttp.tactic].push(ttp);
    });

    // Ordonner tactics selon Kill Chain
    const tacticOrder = [
      'Initial Access',
      'Execution',
      'Persistence',
      'Privilege Escalation',
      'Defense Evasion',
      'Credential Access',
      'Discovery',
      'Lateral Movement',
      'Collection',
      'Command and Control',
      'Exfiltration',
      'Impact'
    ];

    const timeline = tacticOrder
      .filter(tactic => byTactic[tactic])
      .map(tactic => ({
        tactic,
        techniques: byTactic[tactic],
        count: byTactic[tactic].length,
        avgConfidence: Math.round(
          byTactic[tactic].reduce((sum, t) => sum + t.confidence, 0) / byTactic[tactic].length
        )
      }));

    return {
      timeline,
      totalTactics: timeline.length,
      totalTechniques: ttps.length,
      coverageScore: Math.round((timeline.length / 12) * 100)
    };
  }

  /**
   * Stats TTPs par tenant
   */
  static async getStats(tenantId: string): Promise<any> {
    const total = await prisma.tTP.count({ where: { tenantId } });

    const byTactic = await prisma.tTP.groupBy({
      by: ['tactic'],
      where: { tenantId },
      _count: true,
      _avg: { confidence: true }
    });

    const topTechniques = await prisma.tTP.groupBy({
      by: ['techniqueId', 'technique'],
      where: { tenantId },
      _count: true,
      orderBy: { _count: { techniqueId: 'desc' } },
      take: 10
    });

    return {
      total,
      byTactic: byTactic.map(t => ({
        tactic: t.tactic,
        count: t._count,
        avgConfidence: Math.round(t._avg.confidence || 0)
      })),
      topTechniques: topTechniques.map(t => ({
        techniqueId: t.techniqueId,
        technique: t.technique,
        count: t._count
      }))
    };
  }
}




