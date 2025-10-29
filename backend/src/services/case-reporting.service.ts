/**
 * 📊 Case Reporting Service
 * Génération de rapports pour cases (Executive, Technical, Post-Incident)
 */

import { logger } from '../utils/logger';
import { prisma } from '../config/database';

export class CaseReportingService {
  /**
   * Générer rapport Executive
   */
  static async generateExecutiveReport(
    tenantId: string,
    caseId: string
  ): Promise<string> {
    try {
      logger.info(`Generating executive report for case: ${caseId}`);

      const caseData = await prisma.case.findFirst({
        where: { id: caseId, tenantId },
        include: {
          threats: { include: { threat: true } },
          alerts: { include: { alert: true } },
          evidence: true,
          tasks: true
        }
      });

      if (!caseData) {
        throw new Error('Case not found');
      }

      let report = `# 📊 Executive Case Report\n\n`;
      report += `**Case ID**: ${caseData.id}\n`;
      report += `**Title**: ${caseData.title}\n`;
      report += `**Type**: ${caseData.type}\n`;
      report += `**Severity**: ${caseData.severity}\n`;
      report += `**Status**: ${caseData.status}\n`;
      report += `**Priority**: ${caseData.priority}\n\n`;

      // Summary
      report += `## 📝 Summary\n\n`;
      report += `${caseData.description || 'No description provided'}\n\n`;

      // Impact
      report += `## 🎯 Impact\n\n`;
      report += `- **Impact Level**: ${caseData.impactLevel}\n`;
      report += `- **Confidence Score**: ${caseData.confidenceScore}%\n`;
      
      const systems = (caseData.affectedSystems as string[]) || [];
      const users = (caseData.affectedUsers as string[]) || [];
      
      if (systems.length > 0) {
        report += `- **Affected Systems**: ${systems.length}\n`;
      }
      if (users.length > 0) {
        report += `- **Affected Users**: ${users.length}\n`;
      }
      report += `\n`;

      // Timeline
      report += `## ⏰ Timeline\n\n`;
      report += `- **Created**: ${caseData.createdAt.toISOString()}\n`;
      if (caseData.triagedAt) report += `- **Triaged**: ${caseData.triagedAt.toISOString()}\n`;
      if (caseData.containedAt) report += `- **Contained**: ${caseData.containedAt.toISOString()}\n`;
      if (caseData.remediatedAt) report += `- **Remediated**: ${caseData.remediatedAt.toISOString()}\n`;
      if (caseData.closedAt) report += `- **Closed**: ${caseData.closedAt.toISOString()}\n`;
      report += `\n`;

      // Response Times
      if (caseData.closedAt) {
        const totalTime = (caseData.closedAt.getTime() - caseData.createdAt.getTime()) / 60000;
        report += `**Total Resolution Time**: ${Math.round(totalTime)} minutes\n\n`;
      }

      // Threats & Alerts
      if (caseData.threats.length > 0) {
        report += `## 🚨 Related Threats (${caseData.threats.length})\n\n`;
        caseData.threats.forEach((ct: any) => {
          report += `- ${ct.threat.name} (${ct.threat.severity})\n`;
        });
        report += `\n`;
      }

      if (caseData.alerts.length > 0) {
        report += `## ⚠️ Related Alerts (${caseData.alerts.length})\n\n`;
        caseData.alerts.slice(0, 5).forEach((ca: any) => {
          report += `- ${ca.alert.title}\n`;
        });
        report += `\n`;
      }

      // Evidence
      report += `## 🔍 Evidence Collected\n\n`;
      report += `- **Total Evidence**: ${caseData.evidence.length}\n`;
      const verifiedEvidence = caseData.evidence.filter(e => e.verified).length;
      report += `- **Verified**: ${verifiedEvidence}/${caseData.evidence.length}\n\n`;

      // Tasks
      const completedTasks = caseData.tasks.filter(t => t.status === 'done').length;
      report += `## ✅ Tasks\n\n`;
      report += `- **Completed**: ${completedTasks}/${caseData.tasks.length}\n`;
      report += `- **Progress**: ${Math.round((completedTasks / (caseData.tasks.length || 1)) * 100)}%\n\n`;

      // Recommendations
      report += `## 💡 Recommendations\n\n`;
      report += this.generateRecommendations(caseData);

      report += `\n---\n`;
      report += `*Report generated: ${new Date().toISOString()}*\n`;

      return report;
    } catch (error: any) {
      logger.error('Error generating executive report:', error.message);
      throw error;
    }
  }

  /**
   * Générer rapport Technique
   */
  static async generateTechnicalReport(
    tenantId: string,
    caseId: string
  ): Promise<string> {
    try {
      const caseData = await prisma.case.findFirst({
        where: { id: caseId, tenantId },
        include: {
          evidence: true,
          tasks: true,
          timeline: { orderBy: { timestamp: 'desc' } },
          notes: { orderBy: { createdAt: 'desc' } }
        }
      });

      if (!caseData) {
        throw new Error('Case not found');
      }

      let report = `# 🔬 Technical Case Report\n\n`;
      report += `**Case ID**: ${caseData.id}\n`;
      report += `**Title**: ${caseData.title}\n\n`;

      // Technical Details
      report += `## 🔍 Technical Analysis\n\n`;
      report += `${caseData.description || 'No description'}\n\n`;

      // Evidence Analysis
      report += `## 📁 Evidence Analysis\n\n`;
      caseData.evidence.forEach((ev: any, i: number) => {
        report += `### ${i + 1}. ${ev.name}\n`;
        report += `- **Type**: ${ev.type}\n`;
        report += `- **Hash**: ${ev.hash || 'N/A'}\n`;
        report += `- **Size**: ${ev.fileSize ? `${Math.round(ev.fileSize / 1024)} KB` : 'N/A'}\n`;
        report += `- **Collected**: ${ev.collectedAt.toISOString()}\n`;
        report += `- **Verified**: ${ev.verified ? 'Yes' : 'No'}\n`;
        
        const extractedIOCs = (ev.extractedIOCs as any[]) || [];
        if (extractedIOCs.length > 0) {
          report += `- **Extracted IOCs**: ${extractedIOCs.length}\n`;
        }
        report += `\n`;
      });

      // Timeline
      report += `## 📅 Investigation Timeline\n\n`;
      caseData.timeline.slice(0, 20).forEach((entry: any) => {
        report += `- **${entry.timestamp.toISOString()}**: ${entry.action}`;
        if (entry.description) report += ` - ${entry.description}`;
        report += `\n`;
      });
      report += `\n`;

      // Findings (from notes)
      const findings = caseData.notes.filter((n: any) => n.type === 'observation');
      if (findings.length > 0) {
        report += `## 🔎 Key Findings\n\n`;
        findings.forEach((note: any) => {
          report += `- ${note.content}\n`;
        });
        report += `\n`;
      }

      report += `---\n`;
      report += `*Report generated: ${new Date().toISOString()}*\n`;

      return report;
    } catch (error: any) {
      logger.error('Error generating technical report:', error.message);
      throw error;
    }
  }

  /**
   * Générer rapport Post-Incident
   */
  static async generatePostIncidentReport(
    tenantId: string,
    caseId: string
  ): Promise<string> {
    try {
      const caseData = await prisma.case.findFirst({
        where: { id: caseId, tenantId },
        include: {
          evidence: true,
          tasks: true,
          timeline: true,
          notes: true
        }
      });

      if (!caseData) {
        throw new Error('Case not found');
      }

      let report = `# 📋 Post-Incident Report\n\n`;
      report += `**Case ID**: ${caseData.id}\n`;
      report += `**Incident**: ${caseData.title}\n`;
      report += `**Date**: ${caseData.createdAt.toISOString()}\n\n`;

      // Incident Summary
      report += `## 📝 Incident Summary\n\n`;
      report += `${caseData.description}\n\n`;

      // Timeline of Events
      report += `## ⏰ Timeline of Events\n\n`;
      caseData.timeline.forEach((entry: any) => {
        report += `- **${entry.timestamp.toISOString()}**: ${entry.description || entry.action}\n`;
      });
      report += `\n`;

      // Root Cause
      report += `## 🎯 Root Cause Analysis\n\n`;
      const rootCauseNote = caseData.notes.find((n: any) => n.type === 'decision' && n.content.includes('root cause'));
      report += rootCauseNote ? rootCauseNote.content : 'Root cause analysis pending.\n';
      report += `\n`;

      // Response Actions
      report += `## 🛡️ Response Actions Taken\n\n`;
      const completedTasks = caseData.tasks.filter((t: any) => t.status === 'done');
      completedTasks.forEach((task: any) => {
        report += `- ${task.title}\n`;
      });
      report += `\n`;

      // Lessons Learned
      report += `## 📚 Lessons Learned\n\n`;
      const lessonsNote = caseData.notes.find((n: any) => n.content.includes('lesson'));
      report += lessonsNote ? lessonsNote.content : 'Lessons learned to be documented.\n';
      report += `\n`;

      // Recommendations
      report += `## 💡 Recommendations\n\n`;
      report += this.generatePostIncidentRecommendations(caseData);

      report += `\n---\n`;
      report += `*Report generated: ${new Date().toISOString()}*\n`;

      return report;
    } catch (error: any) {
      logger.error('Error generating post-incident report:', error.message);
      throw error;
    }
  }

  /**
   * Générer recommandations
   */
  private static generateRecommendations(caseData: any): string {
    let recommendations = '';

    if (caseData.status !== 'closed') {
      recommendations += '- Complete the investigation and close the case\n';
    }

    const unverifiedEvidence = caseData.evidence.filter((e: any) => !e.verified).length;
    if (unverifiedEvidence > 0) {
      recommendations += `- Verify ${unverifiedEvidence} pending evidence items\n`;
    }

    const pendingTasks = caseData.tasks.filter((t: any) => t.status !== 'done').length;
    if (pendingTasks > 0) {
      recommendations += `- Complete ${pendingTasks} remaining tasks\n`;
    }

    if (recommendations === '') {
      recommendations = '- Case appears complete. Proceed with closure.\n';
    }

    return recommendations;
  }

  /**
   * Générer recommandations post-incident
   */
  private static generatePostIncidentRecommendations(caseData: any): string {
    let recommendations = '';

    // Basé sur severity
    if (caseData.severity === 'critical' || caseData.severity === 'high') {
      recommendations += '- Conduct security awareness training\n';
      recommendations += '- Review and update security policies\n';
      recommendations += '- Implement additional monitoring controls\n';
    }

    // Basé sur type
    if (caseData.type === 'incident') {
      recommendations += '- Update incident response playbook\n';
      recommendations += '- Schedule post-incident review meeting\n';
    }

    if (recommendations === '') {
      recommendations = '- Document findings and share with team\n';
    }

    return recommendations;
  }
}



