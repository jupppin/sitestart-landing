/**
 * Admin Customer DNS Configuration API Route
 *
 * POST /api/admin/customers/[id]/deployment/dns
 * Configures DNS records for a custom domain via Cloudflare API.
 * Adds the custom domain to the Pages project and creates necessary DNS records.
 * Body: { customDomain: string }
 *
 * GET /api/admin/customers/[id]/deployment/dns
 * Retrieves current DNS records for the customer's custom domain.
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
  addCustomDomain,
  getCustomDomains,
  getDnsRecords,
  createDnsRecord,
} from '@/lib/cloudflare';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/customers/[id]/deployment/dns
 * Configure DNS for a custom domain
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

    // Parse request body
    const body = await request.json();
    const { customDomain } = body;

    // Validate custom domain
    if (!customDomain || typeof customDomain !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Custom domain is required' },
        { status: 400 }
      );
    }

    // Basic domain validation
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
    if (!domainRegex.test(customDomain)) {
      return NextResponse.json(
        { success: false, error: 'Invalid domain format' },
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

    // Check if deployment is initialized
    if (!deployment.cfProjectName || !deployment.cfProjectId) {
      return NextResponse.json(
        { success: false, error: 'Deployment not initialized. Please initialize deployment first.' },
        { status: 400 }
      );
    }

    // Update status to DNS_PENDING
    await updateDeployment(customerId, {
      customDomain,
      domainStatus: 'DNS_PENDING',
    });

    // Step 1: Add custom domain to Cloudflare Pages project
    let pagesDomain;
    try {
      pagesDomain = await addCustomDomain(deployment.cfProjectName, customDomain);
    } catch (cfError) {
      console.error('Error adding custom domain to Pages:', cfError);

      // Check if domain already exists (not an error)
      if (
        cfError instanceof Error &&
        cfError.message.includes('already exists')
      ) {
        // Domain already added, continue with DNS setup
        const existingDomains = await getCustomDomains(deployment.cfProjectName);
        pagesDomain = existingDomains.find((d) => d.name === customDomain);
      } else {
        const errorMessage =
          cfError instanceof Error ? cfError.message : 'Failed to add custom domain';

        await updateDeployment(customerId, {
          domainStatus: 'ERROR',
        });

        return NextResponse.json(
          { success: false, error: errorMessage },
          { status: 502 }
        );
      }
    }

    // Step 2: Create CNAME record pointing to Pages
    // The CNAME should point to: {project-name}.pages.dev
    const pagesDevDomain = `${deployment.cfProjectName}.pages.dev`;

    // Determine if this is a root domain or subdomain
    const domainParts = customDomain.split('.');
    const isRootDomain = domainParts.length === 2;

    // For root domains, we need to handle differently (CNAME flattening)
    // For subdomains (like www.example.com), create a standard CNAME
    const recordName = isRootDomain ? '@' : domainParts[0];

    let dnsRecord;
    try {
      // Check if record already exists
      // Pass the custom domain - zone ID is looked up automatically
      const existingRecords = await getDnsRecords(
        customDomain,
        customDomain,
        'CNAME'
      );

      if (existingRecords.length > 0) {
        // Record exists, update it if needed
        dnsRecord = existingRecords[0];
      } else {
        // Create new CNAME record
        // Pass the custom domain - zone ID is looked up automatically
        dnsRecord = await createDnsRecord(
          customDomain,
          'CNAME',
          customDomain, // Full domain name for the record
          pagesDevDomain,
          true, // Proxied through Cloudflare
          1 // Auto TTL
        );
      }
    } catch (dnsError) {
      console.error('Error creating DNS record:', dnsError);

      // DNS creation failed, but domain was added to Pages
      // This might be because the zone is not in the same Cloudflare account
      await updateDeployment(customerId, {
        domainStatus: 'DNS_PENDING',
      });

      return NextResponse.json({
        success: true,
        data: {
          domain: pagesDomain,
          dnsConfigured: false,
          message:
            'Custom domain added to Pages project. Please configure DNS manually.',
          requiredRecord: {
            type: 'CNAME',
            name: recordName,
            content: pagesDevDomain,
            proxied: true,
          },
        },
      });
    }

    // Step 3: Update deployment status
    const updatedDeployment = await updateDeployment(customerId, {
      customDomain,
      domainStatus: 'DNS_CONFIGURED',
    });

    return NextResponse.json({
      success: true,
      data: {
        deployment: updatedDeployment,
        domain: pagesDomain,
        dnsRecord,
        dnsConfigured: true,
        message: `DNS configured successfully. ${customDomain} now points to ${pagesDevDomain}`,
      },
    });
  } catch (error) {
    console.error('Error configuring DNS:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to configure DNS' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/customers/[id]/deployment/dns
 * Get DNS status and records for the customer's custom domain
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

    // If no custom domain configured
    if (!deployment.customDomain) {
      return NextResponse.json({
        success: true,
        data: {
          hasCustomDomain: false,
          customDomain: null,
          domainStatus: deployment.domainStatus,
          dnsRecords: [],
          pagesDomains: [],
        },
      });
    }

    // Get Pages domains if project exists
    let pagesDomains: Awaited<ReturnType<typeof getCustomDomains>> = [];
    if (deployment.cfProjectName) {
      try {
        pagesDomains = await getCustomDomains(deployment.cfProjectName);
      } catch (error) {
        console.error('Error fetching Pages domains:', error);
      }
    }

    // Check domain status in Pages
    const pagesDomain = pagesDomains.find(
      (d) => d.name === deployment.customDomain
    );

    // Determine overall domain status
    let currentDomainStatus = deployment.domainStatus;

    if (pagesDomain) {
      if (pagesDomain.status === 'active') {
        currentDomainStatus = 'ACTIVE';
      } else if (pagesDomain.status === 'pending') {
        currentDomainStatus = 'DNS_PENDING';
      }
    }

    // Update status if changed
    if (currentDomainStatus !== deployment.domainStatus) {
      await updateDeployment(customerId, {
        domainStatus: currentDomainStatus,
      });
    }

    // Get DNS records for the domain
    // Zone ID is looked up automatically from the domain
    let dnsRecords: Awaited<ReturnType<typeof getDnsRecords>> = [];
    try {
      dnsRecords = await getDnsRecords(
        deployment.customDomain,
        deployment.customDomain
      );
    } catch (error) {
      console.error('Error fetching DNS records:', error);
    }

    // Required DNS record info
    const pagesDevDomain = deployment.cfProjectName
      ? `${deployment.cfProjectName}.pages.dev`
      : null;

    return NextResponse.json({
      success: true,
      data: {
        hasCustomDomain: true,
        customDomain: deployment.customDomain,
        domainStatus: currentDomainStatus,
        pagesDomain: pagesDomain || null,
        dnsRecords,
        requiredRecord: pagesDevDomain
          ? {
              type: 'CNAME',
              name: deployment.customDomain,
              content: pagesDevDomain,
              proxied: true,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Error fetching DNS status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch DNS status' },
      { status: 500 }
    );
  }
}
