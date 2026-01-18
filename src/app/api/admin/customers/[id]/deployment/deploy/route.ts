/**
 * Admin Customer Deployment Trigger API Route
 *
 * POST /api/admin/customers/[id]/deployment/deploy
 * Triggers a new deployment via Cloudflare Pages API.
 * Updates deployment status in database.
 *
 * Authentication: Required (handled by isAuthenticated)
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth/session';
import {
  getDeploymentByCustomerId,
  updateDeployment,
} from '@/lib/admin/deploymentQueries';
import {
  triggerDeployment,
  getDeploymentStatus,
} from '@/lib/cloudflare';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/customers/[id]/deployment/deploy
 * Trigger a new deployment for the customer's site
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate ID
    const { id } = await params;
    const customerId = parseInt(id, 10);
    if (isNaN(customerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid customer ID' },
        { status: 400 }
      );
    }

    // Get existing deployment configuration
    const deployment = await getDeploymentByCustomerId(customerId);
    if (!deployment) {
      return NextResponse.json(
        { success: false, error: 'No deployment configuration found for this customer' },
        { status: 404 }
      );
    }

    // Check if deployment is initialized (has Cloudflare project)
    if (!deployment.cfProjectName || !deployment.cfProjectId) {
      return NextResponse.json(
        { success: false, error: 'Deployment not initialized. Please initialize deployment first.' },
        { status: 400 }
      );
    }

    // Check if a deployment is already in progress
    if (deployment.deploymentStatus === 'DEPLOYING') {
      return NextResponse.json(
        { success: false, error: 'A deployment is already in progress' },
        { status: 409 }
      );
    }

    // Update status to DEPLOYING before triggering
    await updateDeployment(customerId, {
      deploymentStatus: 'DEPLOYING',
      lastDeploymentError: null,
    });

    // Trigger deployment via Cloudflare API
    let cfDeployment;
    try {
      cfDeployment = await triggerDeployment(
        deployment.cfProjectName,
        deployment.gitBranch || 'main'
      );
    } catch (cfError) {
      console.error('Cloudflare deployment error:', cfError);
      const errorMessage =
        cfError instanceof Error ? cfError.message : 'Failed to trigger deployment';

      // Update deployment status to FAILED
      await updateDeployment(customerId, {
        deploymentStatus: 'FAILED',
        lastDeploymentError: errorMessage,
      });

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 502 }
      );
    }

    // Update deployment record with deployment details
    const updatedDeployment = await updateDeployment(customerId, {
      lastDeploymentId: cfDeployment.id,
      lastDeploymentAt: new Date(),
      deploymentStatus: 'DEPLOYING',
      cfProductionUrl: cfDeployment.url || deployment.cfProductionUrl,
    });

    return NextResponse.json({
      success: true,
      data: updatedDeployment,
      deployment: {
        id: cfDeployment.id,
        url: cfDeployment.url,
        status: cfDeployment.latest_stage.status,
        environment: cfDeployment.environment,
      },
      message: 'Deployment triggered successfully',
    });
  } catch (error) {
    console.error('Error triggering deployment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to trigger deployment' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/customers/[id]/deployment/deploy
 * Get the current deployment status from Cloudflare
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate ID
    const { id } = await params;
    const customerId = parseInt(id, 10);
    if (isNaN(customerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid customer ID' },
        { status: 400 }
      );
    }

    // Get existing deployment configuration
    const deployment = await getDeploymentByCustomerId(customerId);
    if (!deployment) {
      return NextResponse.json(
        { success: false, error: 'No deployment configuration found' },
        { status: 404 }
      );
    }

    // If no deployment has been triggered yet
    if (!deployment.lastDeploymentId || !deployment.cfProjectName) {
      return NextResponse.json({
        success: true,
        data: {
          hasActiveDeployment: false,
          deployment: null,
        },
      });
    }

    // Get deployment status from Cloudflare
    let cfDeploymentStatus;
    try {
      cfDeploymentStatus = await getDeploymentStatus(
        deployment.cfProjectName,
        deployment.lastDeploymentId
      );
    } catch (cfError) {
      console.error('Error fetching Cloudflare deployment status:', cfError);
      return NextResponse.json({
        success: true,
        data: {
          hasActiveDeployment: true,
          deployment: null,
          error: 'Could not fetch deployment status from Cloudflare',
        },
      });
    }

    // Map Cloudflare status to our deployment status
    const stageStatus = cfDeploymentStatus.latest_stage.status;
    let newDeploymentStatus: 'NOT_DEPLOYED' | 'DEPLOYING' | 'DEPLOYED' | 'FAILED';

    switch (stageStatus) {
      case 'success':
        newDeploymentStatus = 'DEPLOYED';
        break;
      case 'failure':
      case 'canceled':
        newDeploymentStatus = 'FAILED';
        break;
      case 'active':
        newDeploymentStatus = 'DEPLOYING';
        break;
      default:
        newDeploymentStatus = deployment.deploymentStatus;
    }

    // Update local deployment status if it changed
    if (newDeploymentStatus !== deployment.deploymentStatus) {
      await updateDeployment(customerId, {
        deploymentStatus: newDeploymentStatus,
        cfProductionUrl: cfDeploymentStatus.url || deployment.cfProductionUrl,
        lastDeploymentError:
          newDeploymentStatus === 'FAILED'
            ? `Deployment ${stageStatus}: ${cfDeploymentStatus.latest_stage.name}`
            : null,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        hasActiveDeployment: true,
        deployment: {
          id: cfDeploymentStatus.id,
          url: cfDeploymentStatus.url,
          environment: cfDeploymentStatus.environment,
          status: stageStatus,
          stages: cfDeploymentStatus.stages,
          latestStage: cfDeploymentStatus.latest_stage,
          createdOn: cfDeploymentStatus.created_on,
        },
        localStatus: newDeploymentStatus,
      },
    });
  } catch (error) {
    console.error('Error fetching deployment status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deployment status' },
      { status: 500 }
    );
  }
}
