/**
 * Cloudflare API Integration Library
 *
 * Provides wrapper functions for interacting with Cloudflare's API
 * for Pages deployments, DNS management, and custom domain configuration.
 *
 * Required environment variables:
 * - CLOUDFLARE_API_TOKEN: API token with Pages and DNS permissions
 * - CLOUDFLARE_ACCOUNT_ID: Your Cloudflare account ID
 * - CLOUDFLARE_ZONE_ID: Zone ID for DNS record management
 */

// Cloudflare API base URL
const CF_API_BASE = 'https://api.cloudflare.com/client/v4';

// ============================================================================
// Types
// ============================================================================

/**
 * Standard Cloudflare API response wrapper
 */
export interface CloudflareResponse<T> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: Array<{ code: number; message: string }>;
  result: T;
  result_info?: {
    page: number;
    per_page: number;
    total_pages: number;
    count: number;
    total_count: number;
  };
}

/**
 * Pages project configuration
 */
export interface PagesProject {
  id: string;
  name: string;
  subdomain: string;
  domains: string[];
  source?: {
    type: 'github' | 'gitlab';
    config: {
      owner: string;
      repo_name: string;
      production_branch: string;
      pr_comments_enabled?: boolean;
      deployments_enabled?: boolean;
      preview_deployment_setting?: 'all' | 'none' | 'custom';
      preview_branch_includes?: string[];
      preview_branch_excludes?: string[];
    };
  };
  build_config: {
    build_command?: string;
    destination_dir?: string;
    root_dir?: string;
    web_analytics_tag?: string;
    web_analytics_token?: string;
  };
  deployment_configs: {
    preview: PagesDeploymentConfig;
    production: PagesDeploymentConfig;
  };
  latest_deployment?: PagesDeployment;
  canonical_deployment?: PagesDeployment;
  production_script_name?: string;
  created_on: string;
  production_branch?: string;
}

/**
 * Pages deployment configuration (environment variables, compatibility flags, etc.)
 */
export interface PagesDeploymentConfig {
  compatibility_date?: string;
  compatibility_flags?: string[];
  env_vars?: Record<string, { value: string; type?: 'plain_text' | 'secret_text' }>;
  kv_namespaces?: Record<string, { namespace_id: string }>;
  durable_object_namespaces?: Record<string, { namespace_id: string; class_name: string }>;
  r2_buckets?: Record<string, { name: string }>;
  d1_databases?: Record<string, { id: string }>;
  services?: Record<string, { service: string; environment: string }>;
  queue_producers?: Record<string, { name: string }>;
  analytics_engine_datasets?: Record<string, { dataset: string }>;
  ai_bindings?: Record<string, unknown>;
  fail_open?: boolean;
  always_use_latest_compatibility_date?: boolean;
  usage_model?: 'bundled' | 'unbound';
  placement?: { mode: 'smart' };
}

/**
 * Pages deployment details
 */
export interface PagesDeployment {
  id: string;
  short_id: string;
  project_id: string;
  project_name: string;
  environment: 'production' | 'preview';
  url: string;
  created_on: string;
  modified_on: string;
  latest_stage: {
    name: string;
    started_on: string | null;
    ended_on: string | null;
    status: 'idle' | 'active' | 'canceled' | 'success' | 'failure';
  };
  deployment_trigger: {
    type: 'ad_hoc' | 'github' | 'gitlab';
    metadata: {
      branch?: string;
      commit_hash?: string;
      commit_message?: string;
    };
  };
  stages: Array<{
    name: string;
    started_on: string | null;
    ended_on: string | null;
    status: 'idle' | 'active' | 'canceled' | 'success' | 'failure';
  }>;
  build_config: PagesProject['build_config'];
  source: PagesProject['source'];
  env_vars?: Record<string, { value: string; type?: 'plain_text' | 'secret_text' }>;
  aliases?: string[];
  is_skipped?: boolean;
  production_branch?: string;
}

/**
 * DNS record structure
 */
export interface DnsRecord {
  id: string;
  zone_id: string;
  zone_name: string;
  name: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX' | 'NS' | 'SRV' | 'CAA';
  content: string;
  proxiable: boolean;
  proxied: boolean;
  ttl: number;
  locked: boolean;
  meta: {
    auto_added: boolean;
    managed_by_apps: boolean;
    managed_by_argo_tunnel: boolean;
  };
  comment?: string;
  tags?: string[];
  created_on: string;
  modified_on: string;
}

/**
 * Custom domain for Pages
 */
export interface PagesDomain {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'moved' | 'deleting' | 'deleted';
  verification_data?: {
    status: 'pending' | 'active' | 'zone_pending' | 'zone_active';
  };
  validation_data?: {
    status: 'initializing' | 'pending' | 'active' | 'error';
    method: 'http' | 'txt';
  };
  certificate_authority: 'lets_encrypt' | 'google' | 'ssl_com';
  created_on: string;
}

// ============================================================================
// Configuration Helpers
// ============================================================================

/**
 * Get Cloudflare API token from environment
 * @throws Error if token is not configured
 */
function getApiToken(): string {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) {
    throw new Error(
      'CLOUDFLARE_API_TOKEN is not set. Please add it to your environment variables.'
    );
  }
  return token;
}

/**
 * Get Cloudflare Account ID from environment
 * @throws Error if account ID is not configured
 */
function getAccountId(): string {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!accountId) {
    throw new Error(
      'CLOUDFLARE_ACCOUNT_ID is not set. Please add it to your environment variables.'
    );
  }
  return accountId;
}

/**
 * Get Cloudflare Zone ID from environment (optional fallback)
 */
function getZoneIdFromEnv(): string | null {
  return process.env.CLOUDFLARE_ZONE_ID || null;
}

/**
 * Look up Zone ID by domain name
 * This allows managing multiple customer domains without hardcoding zone IDs
 *
 * @param domain - The domain name (e.g., 'example.com' or 'sub.example.com')
 * @returns Zone ID for the domain
 * @throws Error if domain is not found in the Cloudflare account
 */
export async function getZoneIdByDomain(domain: string): Promise<string> {
  // Extract the root domain (e.g., 'sub.example.com' -> 'example.com')
  const parts = domain.split('.');
  const rootDomain = parts.length > 2 ? parts.slice(-2).join('.') : domain;

  const response = await cfFetch<Array<{ id: string; name: string }>>(
    `/zones?name=${encodeURIComponent(rootDomain)}`
  );

  if (!response.result || response.result.length === 0) {
    throw new Error(
      `Domain "${rootDomain}" not found in your Cloudflare account. ` +
      `Please add the domain to Cloudflare first.`
    );
  }

  return response.result[0].id;
}

/**
 * Get Zone ID - tries domain lookup first, falls back to env var
 */
async function resolveZoneId(domain?: string): Promise<string> {
  if (domain) {
    return getZoneIdByDomain(domain);
  }

  const envZoneId = getZoneIdFromEnv();
  if (envZoneId) {
    return envZoneId;
  }

  throw new Error(
    'No domain provided and CLOUDFLARE_ZONE_ID is not set. ' +
    'Either provide a domain or set the environment variable.'
  );
}

/**
 * Make an authenticated request to the Cloudflare API
 */
async function cfFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<CloudflareResponse<T>> {
  const token = getApiToken();

  const response = await fetch(`${CF_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = (await response.json()) as CloudflareResponse<T>;

  if (!data.success) {
    const errorMessages = data.errors.map((e) => e.message).join(', ');
    throw new Error(`Cloudflare API Error: ${errorMessages}`);
  }

  return data;
}

// ============================================================================
// Pages Project Functions
// ============================================================================

/**
 * Create a new Cloudflare Pages project
 *
 * @param name - Project name (used in subdomain: name.pages.dev)
 * @param gitRepoUrl - Optional Git repository URL for automatic deployments
 * @param gitBranch - Optional production branch (defaults to 'main')
 * @returns Created Pages project
 *
 * @example
 * // Create a direct upload project (no git)
 * const project = await createPagesProject('my-customer-site');
 *
 * @example
 * // Create a project connected to GitHub
 * const project = await createPagesProject(
 *   'my-customer-site',
 *   'https://github.com/owner/repo',
 *   'main'
 * );
 */
export async function createPagesProject(
  name: string,
  gitRepoUrl?: string,
  gitBranch?: string
): Promise<PagesProject> {
  const accountId = getAccountId();

  // Build project configuration
  const projectConfig: {
    name: string;
    production_branch: string;
    build_config?: {
      build_command?: string;
      destination_dir?: string;
      root_dir?: string;
    };
    source?: {
      type: 'github';
      config: {
        owner: string;
        repo_name: string;
        production_branch: string;
        deployments_enabled: boolean;
        preview_deployment_setting: 'all' | 'none';
      };
    };
  } = {
    name,
    production_branch: gitBranch || 'main',
  };

  // If git repo URL is provided, parse and configure source
  if (gitRepoUrl) {
    const repoMatch = gitRepoUrl.match(
      /github\.com[/:]([^/]+)\/([^/.]+)(?:\.git)?$/
    );

    if (repoMatch) {
      const [, owner, repoName] = repoMatch;
      projectConfig.source = {
        type: 'github',
        config: {
          owner,
          repo_name: repoName,
          production_branch: gitBranch || 'main',
          deployments_enabled: true,
          preview_deployment_setting: 'all',
        },
      };
    }
  }

  const response = await cfFetch<PagesProject>(
    `/accounts/${accountId}/pages/projects`,
    {
      method: 'POST',
      body: JSON.stringify(projectConfig),
    }
  );

  return response.result;
}

/**
 * Get a Pages project by name
 *
 * @param projectName - The project name
 * @returns Pages project details or null if not found
 */
export async function getPagesProject(
  projectName: string
): Promise<PagesProject | null> {
  const accountId = getAccountId();

  try {
    const response = await cfFetch<PagesProject>(
      `/accounts/${accountId}/pages/projects/${projectName}`
    );
    return response.result;
  } catch (error) {
    // Return null for 404 errors
    if (error instanceof Error && error.message.includes('not found')) {
      return null;
    }
    throw error;
  }
}

/**
 * Delete a Pages project
 *
 * @param projectName - The project name to delete
 */
export async function deletePagesProject(projectName: string): Promise<void> {
  const accountId = getAccountId();

  await cfFetch<null>(`/accounts/${accountId}/pages/projects/${projectName}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// Deployment Functions
// ============================================================================

/**
 * Trigger a new deployment for a Pages project
 *
 * Note: For projects without git integration, this triggers a deployment
 * using the latest uploaded assets. For git-connected projects, this
 * triggers a deployment from the production branch.
 *
 * @param projectName - The project name to deploy
 * @param branch - Optional branch to deploy (for git-connected projects)
 * @returns Deployment details
 *
 * @example
 * const deployment = await triggerDeployment('my-customer-site');
 * console.log(`Deployment started: ${deployment.url}`);
 */
export async function triggerDeployment(
  projectName: string,
  branch?: string
): Promise<PagesDeployment> {
  const accountId = getAccountId();

  const response = await cfFetch<PagesDeployment>(
    `/accounts/${accountId}/pages/projects/${projectName}/deployments`,
    {
      method: 'POST',
      body: JSON.stringify({
        branch: branch || undefined,
      }),
    }
  );

  return response.result;
}

/**
 * Get deployment status and details
 *
 * @param projectName - The project name
 * @param deploymentId - The deployment ID to check
 * @returns Deployment details including status
 *
 * @example
 * const deployment = await getDeploymentStatus('my-site', 'abc123');
 * if (deployment.latest_stage.status === 'success') {
 *   console.log(`Deployed to: ${deployment.url}`);
 * }
 */
export async function getDeploymentStatus(
  projectName: string,
  deploymentId: string
): Promise<PagesDeployment> {
  const accountId = getAccountId();

  const response = await cfFetch<PagesDeployment>(
    `/accounts/${accountId}/pages/projects/${projectName}/deployments/${deploymentId}`
  );

  return response.result;
}

/**
 * Get list of deployments for a project
 *
 * @param projectName - The project name
 * @param limit - Maximum number of deployments to return (default: 10)
 * @returns List of deployments
 */
export async function getDeployments(
  projectName: string,
  limit: number = 10
): Promise<PagesDeployment[]> {
  const accountId = getAccountId();

  const response = await cfFetch<PagesDeployment[]>(
    `/accounts/${accountId}/pages/projects/${projectName}/deployments?per_page=${limit}`
  );

  return response.result;
}

/**
 * Retry a failed deployment
 *
 * @param projectName - The project name
 * @param deploymentId - The deployment ID to retry
 * @returns New deployment details
 */
export async function retryDeployment(
  projectName: string,
  deploymentId: string
): Promise<PagesDeployment> {
  const accountId = getAccountId();

  const response = await cfFetch<PagesDeployment>(
    `/accounts/${accountId}/pages/projects/${projectName}/deployments/${deploymentId}/retry`,
    {
      method: 'POST',
    }
  );

  return response.result;
}

/**
 * Cancel an in-progress deployment
 *
 * @param projectName - The project name
 * @param deploymentId - The deployment ID to cancel
 */
export async function cancelDeployment(
  projectName: string,
  deploymentId: string
): Promise<void> {
  const accountId = getAccountId();

  await cfFetch<null>(
    `/accounts/${accountId}/pages/projects/${projectName}/deployments/${deploymentId}`,
    {
      method: 'DELETE',
    }
  );
}

// ============================================================================
// Custom Domain Functions
// ============================================================================

/**
 * Add a custom domain to a Pages project
 *
 * @param projectName - The project name
 * @param domain - The custom domain to add (e.g., 'www.example.com')
 * @returns Domain configuration details
 *
 * @example
 * const domain = await addCustomDomain('my-site', 'www.example.com');
 * // Then create a CNAME record pointing to my-site.pages.dev
 */
export async function addCustomDomain(
  projectName: string,
  domain: string
): Promise<PagesDomain> {
  const accountId = getAccountId();

  const response = await cfFetch<PagesDomain>(
    `/accounts/${accountId}/pages/projects/${projectName}/domains`,
    {
      method: 'POST',
      body: JSON.stringify({ name: domain }),
    }
  );

  return response.result;
}

/**
 * Get custom domains for a Pages project
 *
 * @param projectName - The project name
 * @returns List of custom domains
 */
export async function getCustomDomains(
  projectName: string
): Promise<PagesDomain[]> {
  const accountId = getAccountId();

  const response = await cfFetch<PagesDomain[]>(
    `/accounts/${accountId}/pages/projects/${projectName}/domains`
  );

  return response.result;
}

/**
 * Remove a custom domain from a Pages project
 *
 * @param projectName - The project name
 * @param domainName - The domain to remove
 */
export async function removeCustomDomain(
  projectName: string,
  domainName: string
): Promise<void> {
  const accountId = getAccountId();

  await cfFetch<null>(
    `/accounts/${accountId}/pages/projects/${projectName}/domains/${domainName}`,
    {
      method: 'DELETE',
    }
  );
}

// ============================================================================
// DNS Record Functions
// ============================================================================

/**
 * Get DNS records for a domain
 * Automatically looks up the zone ID from the domain name
 *
 * @param domain - The domain name (e.g., 'example.com') - zone ID will be looked up automatically
 * @param name - Optional: filter by record name
 * @param type - Optional: filter by record type
 * @returns List of DNS records
 *
 * @example
 * // Get all records for example.com
 * const records = await getDnsRecords('example.com');
 *
 * @example
 * // Get CNAME records for www subdomain
 * const records = await getDnsRecords('example.com', 'www.example.com', 'CNAME');
 */
export async function getDnsRecords(
  domain: string,
  name?: string,
  type?: DnsRecord['type']
): Promise<DnsRecord[]> {
  const zoneId = await getZoneIdByDomain(domain);

  let endpoint = `/zones/${zoneId}/dns_records`;
  const params = new URLSearchParams();

  if (name) params.append('name', name);
  if (type) params.append('type', type);

  if (params.toString()) {
    endpoint += `?${params.toString()}`;
  }

  const response = await cfFetch<DnsRecord[]>(endpoint);
  return response.result;
}

/**
 * Create a DNS record
 * Automatically looks up the zone ID from the domain name
 *
 * @param domain - The domain name (zone ID will be looked up automatically)
 * @param type - Record type (A, AAAA, CNAME, TXT, etc.)
 * @param name - Record name (e.g., 'www.example.com' or 'example.com' for root)
 * @param content - Record content (IP address, hostname, etc.)
 * @param proxied - Whether to proxy through Cloudflare (default: true)
 * @param ttl - Time to live in seconds (1 = automatic, default: 1)
 * @returns Created DNS record
 *
 * @example
 * // Create a CNAME for www pointing to Pages
 * const record = await createDnsRecord(
 *   'example.com',
 *   'CNAME',
 *   'www.example.com',
 *   'my-site.pages.dev',
 *   true
 * );
 *
 * @example
 * // Create an A record for root domain
 * const record = await createDnsRecord(
 *   'example.com',
 *   'A',
 *   'example.com',
 *   '192.0.2.1',
 *   true
 * );
 */
export async function createDnsRecord(
  domain: string,
  type: DnsRecord['type'],
  name: string,
  content: string,
  proxied: boolean = true,
  ttl: number = 1
): Promise<DnsRecord> {
  const zoneId = await getZoneIdByDomain(domain);

  const response = await cfFetch<DnsRecord>(`/zones/${zoneId}/dns_records`, {
    method: 'POST',
    body: JSON.stringify({
      type,
      name,
      content,
      proxied,
      ttl,
    }),
  });

  return response.result;
}

/**
 * Update an existing DNS record
 * Automatically looks up the zone ID from the domain name
 *
 * @param domain - The domain name (zone ID will be looked up automatically)
 * @param recordId - The DNS record ID to update
 * @param data - Updated record data
 * @returns Updated DNS record
 */
export async function updateDnsRecord(
  domain: string,
  recordId: string,
  data: {
    type?: DnsRecord['type'];
    name?: string;
    content?: string;
    proxied?: boolean;
    ttl?: number;
  }
): Promise<DnsRecord> {
  const zoneId = await getZoneIdByDomain(domain);

  const response = await cfFetch<DnsRecord>(
    `/zones/${zoneId}/dns_records/${recordId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    }
  );

  return response.result;
}

/**
 * Delete a DNS record
 * Automatically looks up the zone ID from the domain name
 *
 * @param domain - The domain name (zone ID will be looked up automatically)
 * @param recordId - The DNS record ID to delete
 *
 * @example
 * await deleteDnsRecord('example.com', 'record_id_here');
 */
export async function deleteDnsRecord(
  domain: string,
  recordId: string
): Promise<void> {
  const zoneId = await getZoneIdByDomain(domain);

  await cfFetch<{ id: string }>(`/zones/${zoneId}/dns_records/${recordId}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get the Pages.dev subdomain URL for a project
 *
 * @param projectName - The project name
 * @returns The production URL (e.g., 'https://my-site.pages.dev')
 */
export function getPagesUrl(projectName: string): string {
  return `https://${projectName}.pages.dev`;
}

/**
 * Verify API token has required permissions
 *
 * @returns Verification result with token details
 */
export async function verifyApiToken(): Promise<{
  valid: boolean;
  status: string;
  notBefore?: string;
  expiresOn?: string;
}> {
  try {
    const response = await cfFetch<{
      id: string;
      status: string;
      not_before?: string;
      expires_on?: string;
    }>('/user/tokens/verify');

    return {
      valid: true,
      status: response.result.status,
      notBefore: response.result.not_before,
      expiresOn: response.result.expires_on,
    };
  } catch (error) {
    return {
      valid: false,
      status: error instanceof Error ? error.message : 'Invalid token',
    };
  }
}

/**
 * Check if a project name is available
 *
 * @param projectName - The project name to check
 * @returns True if the name is available
 */
export async function isProjectNameAvailable(
  projectName: string
): Promise<boolean> {
  const project = await getPagesProject(projectName);
  return project === null;
}
