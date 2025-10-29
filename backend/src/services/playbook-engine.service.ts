/**
 * 🤖 Playbook Engine Service
 * Moteur d'exécution de playbooks SOAR
 */

import { logger } from '../utils/logger';
import { prisma } from '../config/database';
import { EventEmitter } from 'events';

interface PlaybookStep {
  id: string;
  type: 'action' | 'condition' | 'approval' | 'loop' | 'parallel' | 'end';
  name: string;
  actionType?: string;
  actionConfig?: any;
  condition?: string;
  nextStepOnSuccess?: string;
  nextStepOnFailure?: string;
  requiresApproval?: boolean;
  timeout?: number;
  retryCount?: number;
}

interface ExecutionContext {
  variables: Record<string, any>;
  results: Record<string, any>;
  errors: any[];
}

export class PlaybookEngineService {
  private static emitter = new EventEmitter();

  /**
   * Exécuter un playbook
   */
  static async executePlaybook(
    tenantId: string,
    playbookId: string,
    triggerData: any,
    triggeredBy: string = 'manual'
  ): Promise<any> {
    try {
      logger.info(`Executing playbook: ${playbookId}`);

      // Récupérer playbook
      const playbook = await prisma.playbook.findFirst({
        where: { id: playbookId, tenantId, isActive: true }
      });

      if (!playbook) {
        throw new Error('Playbook not found or inactive');
      }

      // Créer execution record
      const execution = await prisma.playbookExecution.create({
        data: {
          playbookId,
          tenantId,
          triggeredBy,
          triggerSource: triggerData.source,
          triggerData,
          status: 'running'
        }
      });

      // Initialiser contexte
      const context: ExecutionContext = {
        variables: {
          ...triggerData,
          ...(playbook.variables as any)
        },
        results: {},
        errors: []
      };

      try {
        // Exécuter steps
        const steps = (playbook.steps as any as PlaybookStep[]) || [];
        await this.executeSteps(execution.id, steps, context);

        // Marquer complété
        const completedAt = new Date();
        const executionTime = completedAt.getTime() - execution.startedAt.getTime();

        await prisma.playbookExecution.update({
          where: { id: execution.id },
          data: {
            status: 'completed',
            completedAt,
            executionTime,
            results: context.results
          }
        });

        // Update playbook metrics
        await this.updatePlaybookMetrics(playbookId, executionTime, true);

        logger.info(`Playbook execution completed: ${execution.id}`);
        
        return {
          executionId: execution.id,
          status: 'completed',
          executionTime,
          results: context.results
        };
      } catch (error: any) {
        // Marquer failed
        await prisma.playbookExecution.update({
          where: { id: execution.id },
          data: {
            status: 'failed',
            completedAt: new Date(),
            errors: [...context.errors, { message: error.message, timestamp: new Date() }]
          }
        });

        await this.updatePlaybookMetrics(playbookId, 0, false);

        logger.error(`Playbook execution failed: ${error.message}`);
        throw error;
      }
    } catch (error: any) {
      logger.error('Error executing playbook:', error.message);
      throw error;
    }
  }

  /**
   * Exécuter les steps séquentiellement
   */
  private static async executeSteps(
    executionId: string,
    steps: PlaybookStep[],
    context: ExecutionContext
  ): Promise<void> {
    let currentStepId: string | undefined = steps[0]?.id;

    while (currentStepId) {
      const step = steps.find(s => s.id === currentStepId);
      if (!step) break;

      // Update current step
      await prisma.playbookExecution.update({
        where: { id: executionId },
        data: { currentStep: step.id }
      });

      try {
        const stepResult = await this.executeStep(executionId, step, context);
        
        // Déterminer next step
        if (step.type === 'condition') {
          currentStepId = (stepResult.success 
            ? step.nextStepOnSuccess 
            : step.nextStepOnFailure) || undefined;
        } else if (step.type === 'end') {
          break;
        } else {
          currentStepId = step.nextStepOnSuccess || this.findNextStep(steps, currentStepId) || undefined;
        }
      } catch (error: any) {
        context.errors.push({
          step: step.id,
          error: error.message,
          timestamp: new Date()
        });

        // Retry logic
        if (step.retryCount && step.retryCount > 0) {
          logger.info(`Retrying step ${step.id}`);
          // TODO: Implement retry with backoff
        }

        throw error;
      }
    }
  }

  /**
   * Exécuter un step individuel
   */
  private static async executeStep(
    executionId: string,
    step: PlaybookStep,
    context: ExecutionContext
  ): Promise<any> {
    const startedAt = new Date();

    try {
      logger.debug(`Executing step: ${step.name} (${step.type})`);

      let result: any = {};

      switch (step.type) {
        case 'action':
          result = await this.executeAction(step, context);
          break;

        case 'condition':
          result = await this.evaluateCondition(step, context);
          break;

        case 'approval':
          result = await this.requestApproval(step, context);
          break;

        case 'parallel':
          result = await this.executeParallel(step, context);
          break;

        default:
          result = { success: true };
      }

      // Enregistrer step execution
      const completedAt = new Date();
      const executionTime = completedAt.getTime() - startedAt.getTime();

      await prisma.playbookStepExecution.create({
        data: {
          executionId,
          stepId: step.id,
          status: 'completed',
          result,
          startedAt,
          completedAt,
          executionTime,
          output: result
        }
      });

      // Stocker result dans context
      context.results[step.id] = result;

      return result;
    } catch (error: any) {
      logger.error(`Step execution failed: ${error.message}`);
      
      await prisma.playbookStepExecution.create({
        data: {
          executionId,
          stepId: step.id,
          status: 'failed',
          error: error.message,
          startedAt
        }
      });

      throw error;
    }
  }

  /**
   * Exécuter une action
   */
  private static async executeAction(
    step: PlaybookStep,
    context: ExecutionContext
  ): Promise<any> {
    const actionType = step.actionType;
    const config = this.interpolateVariables(step.actionConfig, context.variables);

    logger.info(`Executing action: ${actionType}`);

    // Simuler exécution (TODO: Implémenter vraies actions)
    switch (actionType) {
      case 'block_ip':
        return {
          success: true,
          action: 'block_ip',
          ip: config.ip,
          message: `IP ${config.ip} blocked on firewall`
        };

      case 'send_email':
        return {
          success: true,
          action: 'send_email',
          to: config.to,
          message: 'Email sent successfully'
        };

      case 'create_alert':
        return {
          success: true,
          action: 'create_alert',
          alertId: `alert-${Date.now()}`,
          message: 'Alert created'
        };

      default:
        return {
          success: true,
          action: actionType,
          message: `Action ${actionType} executed`
        };
    }
  }

  /**
   * Évaluer une condition
   */
  private static async evaluateCondition(
    step: PlaybookStep,
    context: ExecutionContext
  ): Promise<any> {
    const condition = this.interpolateVariables(step.condition, context.variables);
    
    // Simple evaluation (TODO: Implémenter vrai moteur d'évaluation)
    let success = false;
    
    try {
      // Évaluation basique
      if (condition.includes('==')) {
        const [left, right] = condition.split('==').map((s: string) => s.trim());
        const leftVal = this.resolveValue(left, context);
        const rightVal = right.replace(/['"]/g, '');
        success = leftVal === rightVal;
      } else if (condition.includes('>')) {
        const [left, right] = condition.split('>').map((s: string) => s.trim());
        const leftVal = parseFloat(this.resolveValue(left, context));
        const rightVal = parseFloat(right);
        success = leftVal > rightVal;
      } else {
        // Default true si pas de condition
        success = true;
      }
    } catch (error) {
      logger.warn(`Condition evaluation error: ${error}`);
      success = false;
    }

    return {
      success,
      condition,
      result: success
    };
  }

  /**
   * Requête d'approbation (simulation)
   */
  private static async requestApproval(
    step: PlaybookStep,
    context: ExecutionContext
  ): Promise<any> {
    logger.info('Approval required - simulating auto-approval for now');
    
    // TODO: Implémenter vrai système d'approbation
    return {
      success: true,
      approved: true,
      approver: 'system',
      timestamp: new Date()
    };
  }

  /**
   * Exécution parallèle (simulation)
   */
  private static async executeParallel(
    step: PlaybookStep,
    context: ExecutionContext
  ): Promise<any> {
    // TODO: Implémenter vraie exécution parallèle
    return {
      success: true,
      message: 'Parallel execution completed'
    };
  }

  /**
   * Interpoler variables {{var}}
   */
  private static interpolateVariables(data: any, variables: Record<string, any>): any {
    if (typeof data === 'string') {
      return data.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
        return this.resolveValue(path, { variables });
      });
    }
    if (typeof data === 'object' && data !== null) {
      const result: any = Array.isArray(data) ? [] : {};
      for (const key in data) {
        result[key] = this.interpolateVariables(data[key], variables);
      }
      return result;
    }
    return data;
  }

  /**
   * Résoudre valeur depuis path (ex: alert.severity)
   */
  private static resolveValue(path: string, context: any): any {
    const parts = path.split('.');
    let value = context;
    
    for (const part of parts) {
      value = value?.[part];
    }
    
    return value;
  }

  /**
   * Trouver next step
   */
  private static findNextStep(steps: PlaybookStep[], currentStepId: string): string | undefined {
    const currentIndex = steps.findIndex(s => s.id === currentStepId);
    return steps[currentIndex + 1]?.id;
  }

  /**
   * Update playbook metrics
   */
  private static async updatePlaybookMetrics(
    playbookId: string,
    executionTime: number,
    success: boolean
  ): Promise<void> {
    try {
      const playbook = await prisma.playbook.findUnique({
        where: { id: playbookId }
      });

      if (!playbook) return;

      const executionCount = playbook.executionCount + 1;
      const successCount = success 
        ? Math.round(playbook.successRate * playbook.executionCount / 100) + 1
        : Math.round(playbook.successRate * playbook.executionCount / 100);
      
      const successRate = (successCount / executionCount) * 100;
      const avgExecutionTime = success
        ? Math.round((playbook.avgExecutionTime * playbook.executionCount + executionTime) / executionCount)
        : playbook.avgExecutionTime;

      await prisma.playbook.update({
        where: { id: playbookId },
        data: {
          executionCount,
          successRate,
          avgExecutionTime
        }
      });
    } catch (error: any) {
      logger.error('Error updating playbook metrics:', error.message);
    }
  }

  /**
   * Obtenir executions
   */
  static async getExecutions(
    tenantId: string,
    playbookId?: string,
    limit: number = 50
  ): Promise<any[]> {
    const where: any = { tenantId };
    if (playbookId) where.playbookId = playbookId;

    return await prisma.playbookExecution.findMany({
      where,
      include: {
        playbook: {
          select: { name: true, category: true }
        },
        stepExecutions: true
      },
      orderBy: { startedAt: 'desc' },
      take: limit
    });
  }

  /**
   * Obtenir détails execution
   */
  static async getExecutionDetails(
    tenantId: string,
    executionId: string
  ): Promise<any> {
    return await prisma.playbookExecution.findFirst({
      where: { id: executionId, tenantId },
      include: {
        playbook: true,
        stepExecutions: {
          orderBy: { startedAt: 'asc' }
        }
      }
    });
  }

  /**
   * Pause execution (TODO)
   */
  static async pauseExecution(
    tenantId: string,
    executionId: string
  ): Promise<any> {
    return await prisma.playbookExecution.updateMany({
      where: { id: executionId, tenantId, status: 'running' },
      data: {
        status: 'paused'
      }
    });
  }

  /**
   * Resume execution (TODO)
   */
  static async resumeExecution(
    tenantId: string,
    executionId: string
  ): Promise<any> {
    return await prisma.playbookExecution.updateMany({
      where: { id: executionId, tenantId, status: 'paused' },
      data: {
        status: 'running'
      }
    });
  }

  /**
   * Cancel execution
   */
  static async cancelExecution(
    tenantId: string,
    executionId: string
  ): Promise<any> {
    return await prisma.playbookExecution.updateMany({
      where: { id: executionId, tenantId, status: { in: ['running', 'paused'] } },
      data: {
        status: 'cancelled',
        completedAt: new Date()
      }
    });
  }
}

