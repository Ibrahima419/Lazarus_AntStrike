/**
 * ✅ Task Management Service
 * Gestion des tâches dans les cases d'investigation
 */

import { logger } from '../utils/logger';
import { prisma } from '../config/database';

interface TaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  dueDate?: Date;
  estimatedTime?: number; // minutes
  dependsOn?: string[];
  checklist?: any[];
  tags?: string[];
}

export class TaskManagementService {
  /**
   * Créer une task
   */
  static async createTask(
    tenantId: string,
    caseId: string,
    input: TaskInput,
    userId?: string
  ): Promise<any> {
    try {
      logger.info(`Creating task for case ${caseId}: ${input.title}`);

      const task = await prisma.caseTask.create({
        data: {
          caseId,
          tenantId,
          title: input.title,
          description: input.description,
          priority: input.priority || 'medium',
          assignee: input.assignee,
          dueDate: input.dueDate,
          estimatedTime: input.estimatedTime,
          dependsOn: input.dependsOn || [],
          checklist: input.checklist || [],
          tags: input.tags || [],
          status: 'todo'
        }
      });

      logger.info(`Task created: ${task.id}`);
      return task;
    } catch (error: any) {
      logger.error('Error creating task:', error.message);
      throw error;
    }
  }

  /**
   * Obtenir les tasks d'un case
   */
  static async getTasksByCase(
    tenantId: string,
    caseId: string
  ): Promise<any[]> {
    return await prisma.caseTask.findMany({
      where: { caseId, tenantId },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ]
    });
  }

  /**
   * Obtenir une task
   */
  static async getTask(
    tenantId: string,
    taskId: string
  ): Promise<any> {
    return await prisma.caseTask.findFirst({
      where: { id: taskId, tenantId }
    });
  }

  /**
   * Mettre à jour une task
   */
  static async updateTask(
    tenantId: string,
    taskId: string,
    updates: Partial<TaskInput>
  ): Promise<any> {
    try {
      const task = await prisma.caseTask.updateMany({
        where: { id: taskId, tenantId },
        data: {
          ...updates,
          updatedAt: new Date()
        }
      });

      logger.info(`Task updated: ${taskId}`);
      return task;
    } catch (error: any) {
      logger.error('Error updating task:', error.message);
      throw error;
    }
  }

  /**
   * Assigner une task
   */
  static async assignTask(
    tenantId: string,
    taskId: string,
    assignee: string
  ): Promise<any> {
    try {
      const task = await prisma.caseTask.updateMany({
        where: { id: taskId, tenantId },
        data: {
          assignee,
          assignedAt: new Date(),
          updatedAt: new Date()
        }
      });

      logger.info(`Task assigned to ${assignee}: ${taskId}`);
      return task;
    } catch (error: any) {
      logger.error('Error assigning task:', error.message);
      throw error;
    }
  }

  /**
   * Démarrer une task
   */
  static async startTask(
    tenantId: string,
    taskId: string
  ): Promise<any> {
    try {
      const task = await prisma.caseTask.updateMany({
        where: { id: taskId, tenantId, status: 'todo' },
        data: {
          status: 'in_progress',
          updatedAt: new Date()
        }
      });

      logger.info(`Task started: ${taskId}`);
      return task;
    } catch (error: any) {
      logger.error('Error starting task:', error.message);
      throw error;
    }
  }

  /**
   * Compléter une task
   */
  static async completeTask(
    tenantId: string,
    taskId: string,
    actualTime?: number
  ): Promise<any> {
    try {
      const task = await prisma.caseTask.updateMany({
        where: { id: taskId, tenantId },
        data: {
          status: 'done',
          completedAt: new Date(),
          actualTime,
          updatedAt: new Date()
        }
      });

      logger.info(`Task completed: ${taskId}`);
      return task;
    } catch (error: any) {
      logger.error('Error completing task:', error.message);
      throw error;
    }
  }

  /**
   * Bloquer une task
   */
  static async blockTask(
    tenantId: string,
    taskId: string,
    reason: string,
    blockedBy?: string
  ): Promise<any> {
    try {
      const task = await prisma.caseTask.updateMany({
        where: { id: taskId, tenantId },
        data: {
          status: 'blocked',
          blockedBy,
          blockedReason: reason,
          updatedAt: new Date()
        }
      });

      logger.info(`Task blocked: ${taskId}`);
      return task;
    } catch (error: any) {
      logger.error('Error blocking task:', error.message);
      throw error;
    }
  }

  /**
   * Obtenir tasks d'un utilisateur
   */
  static async getMyTasks(
    tenantId: string,
    userId: string
  ): Promise<any[]> {
    return await prisma.caseTask.findMany({
      where: {
        tenantId,
        assignee: userId,
        status: { in: ['todo', 'in_progress', 'blocked'] }
      },
      include: {
        case: {
          select: { id: true, title: true, severity: true, status: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' }
      ]
    });
  }

  /**
   * Obtenir tasks en retard
   */
  static async getOverdueTasks(tenantId: string): Promise<any[]> {
    const now = new Date();

    return await prisma.caseTask.findMany({
      where: {
        tenantId,
        dueDate: { lt: now },
        status: { not: 'done' }
      },
      include: {
        case: {
          select: { id: true, title: true, severity: true }
        }
      },
      orderBy: { dueDate: 'asc' }
    });
  }

  /**
   * Calculer progress d'un case (%)
   */
  static async calculateCaseProgress(
    tenantId: string,
    caseId: string
  ): Promise<number> {
    const tasks = await prisma.caseTask.findMany({
      where: { caseId, tenantId }
    });

    if (tasks.length === 0) return 0;

    const completedTasks = tasks.filter(t => t.status === 'done').length;
    return Math.round((completedTasks / tasks.length) * 100);
  }

  /**
   * Bulk assign tasks
   */
  static async bulkAssign(
    tenantId: string,
    taskIds: string[],
    assignee: string
  ): Promise<any> {
    try {
      const result = await prisma.caseTask.updateMany({
        where: {
          id: { in: taskIds },
          tenantId
        },
        data: {
          assignee,
          assignedAt: new Date(),
          updatedAt: new Date()
        }
      });

      logger.info(`Bulk assigned ${result.count} tasks to ${assignee}`);
      return { updated: result.count };
    } catch (error: any) {
      logger.error('Error bulk assigning tasks:', error.message);
      throw error;
    }
  }
}



