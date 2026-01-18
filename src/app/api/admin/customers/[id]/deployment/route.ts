/**
 * Admin Customer Deployment API Route
 *
 * GET /api/admin/customers/[id]/deployment
 * Retrieves deployment configuration for a customer.
 *
 * POST /api/admin/customers/[id]/deployment
 * Initializes deployment by creating a Cloudflare Pages project and storing config.
 * Body: { cfProjectName?: string, gitRepoUrl?: string, gitBranch?: string, customDomain?: string }
 *
 * Authentication: Required (handled by isAuthenticated)
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth/session';
import {
  getDeploymentByCustomerId,
  createDeployment,
  updateDeployment,
  deleteDeployment,
} from '@/lib/admin/deploymentQueries';
import {
  createPagesProject,
  deletePagesProject,
  getPagesUrl,
} from '@/lib/cloudflare';
import type { InitializeDeploymentInput } from '@/types/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/customers/[id]/deployment
 * Get deployment configuration for a customer
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

    // Fetch deployment configuration
    const deployment = await getDeploymentByCustomerId(customerId);

    return NextResponse.json({
      success: true,
      data: deployment, // Will be null if no deployment exists
    });
  } catch (error) {
    console.error('Error fetching deployment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch deployment configuration' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/customers/[id]/deployment
 * Initialize deployment by creating a Cloudflare Pages project
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

    // Check if deployment already exists
    const existingDeployment = await getDeploymentByCustomerId(customerId);
    if (existingDeployment?.cfProjectId) {
      return NextResponse.json(
        { success: false, error: 'Deployment already initialized for this customer' },
        { status: 409 }
      );
    }

    // Parse request body
    const body = await request.json();
    const input: InitializeDeploymentInput = {
      cfProjectName: body.cfProjectName,
      gitRepoUrl: body.gitRepoUrl,
      gitBranch: body.gitBranch || 'main',
      customDomain: body.customDomain,
    };

    // Validate project name
    if (!input.cfProjectName) {
      return NextResponse.json(
        { success: false, error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Validate project name format (alphanumeric and hyphens only)
    const projectNameRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;
    if (!projectNameRegex.test(input.cfProjectName)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Project name must be lowercase, start and end with alphanumeric characters, and contain only letters, numbers, and hyphens',
        },
        { status: 400 }
      );
    }

    // Create Cloudflare Pages project
    let cfProject;
    try {
      cfProject = await createPagesProject(
        input.cfProjectName,
        input.gitRepoUrl,
        input.gitBranch
      );
    } catch (cfError) {
      console.error('Cloudflare API error:', cfError);
      const errorMessage =
        cfError instanceof Error ? cfError.message : 'Failed to create Cloudflare Pages project';
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 502 }
      );
    }

    // Create or update deployment record in database
    let deployment;
    if (existingDeployment) {
      // Update existing record with Cloudflare project details
      deployment = await updateDeployment(customerId, {
        cfProjectId: cfProject.id,
        cfProjectName: cfProject.name,
        cfProductionUrl: getPagesUrl(cfProject.name),
        gitRepoUrl: input.gitRepoUrl || null,
        gitBranch: input.gitBranch || 'main',
        customDomain: input.customDomain || null,
        deploymentStatus: 'NOT_DEPLOYED',
        domainStatus: input.customDomain ? 'DNS_PENDING' : 'NONE',
      });
    } else {
      // Create new deployment record
      deployment = await createDeployment(customerId, input);
      // Update with Cloudflare project details
      deployment = await updateDeployment(customerId, {
        cfProjectId: cfProject.id,
        cfProjectName: cfProject.name,
        cfProductionUrl: getPagesUrl(cfProject.name),
      });
    }

    return NextResponse.json({
      success: true,
      data: deployment,
      message: `Cloudflare Pages project "${cfProject.name}" created successfully`,
    });
  } catch (error) {
    console.error('Error initializing deployment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize deployment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/customers/[id]/deployment
 * Delete deployment configuration and optionally the Cloudflare Pages project
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Check if deployment exists
    const deployment = await getDeploymentByCustomerId(customerId);
    if (!deployment) {
      return NextResponse.json(
        { success: false, error: 'No deployment found for this customer' },
        { status: 404 }
      );
    }

    // Check query param to see if we should delete the CF project too
    const url = new URL(request.url);
    const deleteCloudflareProject = url.searchParams.get('deleteProject') === 'true';

    // Delete Cloudflare Pages project if requested and exists
    if (deleteCloudflareProject && deployment.cfProjectName) {
      try {
        await deletePagesProject(deployment.cfProjectName);
      } catch (cfError) {
        console.error('Error deleting Cloudflare project:', cfError);
        // Continue with DB deletion even if CF deletion fails
        // The project might have already been deleted manually
      }
    }

    // Delete deployment record from database
    await deleteDeployment(customerId);

    return NextResponse.json({
      success: true,
      message: deleteCloudflareProject
        ? 'Deployment and Cloudflare project deleted successfully'
        : 'Deployment configuration deleted (Cloudflare project preserved)',
    });
  } catch (error) {
    console.error('Error deleting deployment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete deployment' },
      { status: 500 }
    );
  }
}
