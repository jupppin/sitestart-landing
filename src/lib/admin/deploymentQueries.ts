/**
 * Customer Deployment Database Queries
 *
 * Centralized database query functions for customer deployment management.
 * All queries use Prisma client for type-safe database access.
 */

import { prisma } from '@/lib/db';
import type {
  CustomerDeployment,
  InitializeDeploymentInput,
  DomainStatus,
  DeploymentStatus,
} from '@/types/admin';

/**
 * Get deployment configuration for a customer
 */
export async function getDeploymentByCustomerId(
  customerId: number
): Promise<CustomerDeployment | null> {
  const deployment = await prisma.customerDeployment.findUnique({
    where: { customerId },
  });

  if (!deployment) {
    return null;
  }

  return {
    id: deployment.id,
    createdAt: deployment.createdAt,
    updatedAt: deployment.updatedAt,
    customerId: deployment.customerId,
    cfProjectId: deployment.cfProjectId,
    cfProjectName: deployment.cfProjectName,
    cfProductionUrl: deployment.cfProductionUrl,
    customDomain: deployment.customDomain,
    domainStatus: deployment.domainStatus as DomainStatus,
    deploymentStatus: deployment.deploymentStatus as DeploymentStatus,
    lastDeploymentAt: deployment.lastDeploymentAt,
    lastDeploymentId: deployment.lastDeploymentId,
    lastDeploymentError: deployment.lastDeploymentError,
    gitRepoUrl: deployment.gitRepoUrl,
    gitBranch: deployment.gitBranch,
  };
}

/**
 * Create a new deployment configuration for a customer
 */
export async function createDeployment(
  customerId: number,
  data: InitializeDeploymentInput
): Promise<CustomerDeployment> {
  const deployment = await prisma.customerDeployment.create({
    data: {
      customerId,
      cfProjectName: data.cfProjectName || null,
      gitRepoUrl: data.gitRepoUrl || null,
      gitBranch: data.gitBranch || 'main',
      customDomain: data.customDomain || null,
      domainStatus: 'NONE',
      deploymentStatus: 'NOT_DEPLOYED',
    },
  });

  return {
    id: deployment.id,
    createdAt: deployment.createdAt,
    updatedAt: deployment.updatedAt,
    customerId: deployment.customerId,
    cfProjectId: deployment.cfProjectId,
    cfProjectName: deployment.cfProjectName,
    cfProductionUrl: deployment.cfProductionUrl,
    customDomain: deployment.customDomain,
    domainStatus: deployment.domainStatus as DomainStatus,
    deploymentStatus: deployment.deploymentStatus as DeploymentStatus,
    lastDeploymentAt: deployment.lastDeploymentAt,
    lastDeploymentId: deployment.lastDeploymentId,
    lastDeploymentError: deployment.lastDeploymentError,
    gitRepoUrl: deployment.gitRepoUrl,
    gitBranch: deployment.gitBranch,
  };
}

/**
 * Update deployment configuration
 */
export async function updateDeployment(
  customerId: number,
  data: Partial<{
    cfProjectId: string | null;
    cfProjectName: string | null;
    cfProductionUrl: string | null;
    customDomain: string | null;
    domainStatus: DomainStatus;
    deploymentStatus: DeploymentStatus;
    lastDeploymentAt: Date | null;
    lastDeploymentId: string | null;
    lastDeploymentError: string | null;
    gitRepoUrl: string | null;
    gitBranch: string;
  }>
): Promise<CustomerDeployment> {
  const deployment = await prisma.customerDeployment.update({
    where: { customerId },
    data,
  });

  return {
    id: deployment.id,
    createdAt: deployment.createdAt,
    updatedAt: deployment.updatedAt,
    customerId: deployment.customerId,
    cfProjectId: deployment.cfProjectId,
    cfProjectName: deployment.cfProjectName,
    cfProductionUrl: deployment.cfProductionUrl,
    customDomain: deployment.customDomain,
    domainStatus: deployment.domainStatus as DomainStatus,
    deploymentStatus: deployment.deploymentStatus as DeploymentStatus,
    lastDeploymentAt: deployment.lastDeploymentAt,
    lastDeploymentId: deployment.lastDeploymentId,
    lastDeploymentError: deployment.lastDeploymentError,
    gitRepoUrl: deployment.gitRepoUrl,
    gitBranch: deployment.gitBranch,
  };
}

/**
 * Delete deployment configuration
 */
export async function deleteDeployment(customerId: number): Promise<void> {
  await prisma.customerDeployment.delete({
    where: { customerId },
  });
}

/**
 * Check if a customer has a deployment configured
 */
export async function hasDeployment(customerId: number): Promise<boolean> {
  const deployment = await prisma.customerDeployment.findUnique({
    where: { customerId },
    select: { id: true },
  });
  return deployment !== null;
}

/**
 * Get all deployments with a specific status
 */
export async function getDeploymentsByStatus(
  status: DeploymentStatus
): Promise<CustomerDeployment[]> {
  const deployments = await prisma.customerDeployment.findMany({
    where: { deploymentStatus: status },
    orderBy: { updatedAt: 'desc' },
  });

  return deployments.map((deployment) => ({
    id: deployment.id,
    createdAt: deployment.createdAt,
    updatedAt: deployment.updatedAt,
    customerId: deployment.customerId,
    cfProjectId: deployment.cfProjectId,
    cfProjectName: deployment.cfProjectName,
    cfProductionUrl: deployment.cfProductionUrl,
    customDomain: deployment.customDomain,
    domainStatus: deployment.domainStatus as DomainStatus,
    deploymentStatus: deployment.deploymentStatus as DeploymentStatus,
    lastDeploymentAt: deployment.lastDeploymentAt,
    lastDeploymentId: deployment.lastDeploymentId,
    lastDeploymentError: deployment.lastDeploymentError,
    gitRepoUrl: deployment.gitRepoUrl,
    gitBranch: deployment.gitBranch,
  }));
}
