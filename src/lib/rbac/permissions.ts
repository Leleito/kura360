/**
 * RBAC Permission System for KURA360
 *
 * Roles (from campaign_members.role):
 *   campaign_owner    — Full access, can manage members and settings
 *   finance_officer   — Financial operations: transactions, donations, compliance
 *   agent_coordinator — Agent management, evidence, incidents
 *   agent             — Field operations: check-in, evidence upload, incident reports
 *   viewer            — Read-only access to all dashboards
 *
 * Permissions are additive — each role grants a set of actions.
 */

export type CampaignRole =
  | 'campaign_owner'
  | 'finance_officer'
  | 'agent_coordinator'
  | 'agent'
  | 'viewer';

export type Permission =
  // Campaign
  | 'campaign:read'
  | 'campaign:update'
  | 'campaign:manage_members'
  // Transactions
  | 'transactions:read'
  | 'transactions:create'
  | 'transactions:approve'
  | 'transactions:delete'
  // Donations
  | 'donations:read'
  | 'donations:create'
  | 'donations:import'
  // Agents
  | 'agents:read'
  | 'agents:create'
  | 'agents:update'
  | 'agents:delete'
  // Evidence
  | 'evidence:read'
  | 'evidence:create'
  | 'evidence:verify'
  // Incidents
  | 'incidents:read'
  | 'incidents:create'
  | 'incidents:update'
  // Compliance
  | 'compliance:read'
  // Audit
  | 'audit:read'
  // Settings
  | 'settings:read'
  | 'settings:update';

/**
 * Permission matrix — maps each role to its granted permissions.
 */
const ROLE_PERMISSIONS: Record<CampaignRole, readonly Permission[]> = {
  campaign_owner: [
    'campaign:read', 'campaign:update', 'campaign:manage_members',
    'transactions:read', 'transactions:create', 'transactions:approve', 'transactions:delete',
    'donations:read', 'donations:create', 'donations:import',
    'agents:read', 'agents:create', 'agents:update', 'agents:delete',
    'evidence:read', 'evidence:create', 'evidence:verify',
    'incidents:read', 'incidents:create', 'incidents:update',
    'compliance:read',
    'audit:read',
    'settings:read', 'settings:update',
  ],
  finance_officer: [
    'campaign:read',
    'transactions:read', 'transactions:create', 'transactions:approve',
    'donations:read', 'donations:create', 'donations:import',
    'compliance:read',
    'audit:read',
    'settings:read',
  ],
  agent_coordinator: [
    'campaign:read',
    'agents:read', 'agents:create', 'agents:update',
    'evidence:read', 'evidence:verify',
    'incidents:read', 'incidents:update',
    'compliance:read',
    'settings:read',
  ],
  agent: [
    'campaign:read',
    'agents:read',
    'evidence:read', 'evidence:create',
    'incidents:read', 'incidents:create',
  ],
  viewer: [
    'campaign:read',
    'transactions:read',
    'donations:read',
    'agents:read',
    'evidence:read',
    'incidents:read',
    'compliance:read',
    'audit:read',
  ],
} as const;

/**
 * Route-level access — minimum permissions required for each app route.
 */
export const ROUTE_PERMISSIONS: Record<string, Permission[]> = {
  '/dashboard':    ['campaign:read'],
  '/finance':      ['transactions:read'],
  '/finance/transactions': ['transactions:read'],
  '/donations':    ['donations:read'],
  '/agents':       ['agents:read'],
  '/evidence':     ['evidence:read'],
  '/compliance':   ['compliance:read'],
  '/settings':     ['settings:read'],
  '/help':         ['campaign:read'],
};

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: CampaignRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has ALL of the specified permissions.
 */
export function hasAllPermissions(role: CampaignRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Check if a role has ANY of the specified permissions.
 */
export function hasAnyPermission(role: CampaignRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Get all permissions for a role.
 */
export function getPermissions(role: CampaignRole): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Check if a string is a valid CampaignRole.
 */
export function isValidRole(role: string): role is CampaignRole {
  return role in ROLE_PERMISSIONS;
}

/**
 * Human-readable role labels for UI display.
 */
export const ROLE_LABELS: Record<CampaignRole, string> = {
  campaign_owner: 'Campaign Owner',
  finance_officer: 'Finance Officer',
  agent_coordinator: 'Agent Coordinator',
  agent: 'Field Agent',
  viewer: 'Viewer',
};

/**
 * Role hierarchy — higher index = more privileges.
 * Used for "can this role manage that role" checks.
 */
const ROLE_HIERARCHY: CampaignRole[] = [
  'viewer',
  'agent',
  'agent_coordinator',
  'finance_officer',
  'campaign_owner',
];

/**
 * Check if roleA outranks roleB in the hierarchy.
 */
export function outranks(roleA: CampaignRole, roleB: CampaignRole): boolean {
  return ROLE_HIERARCHY.indexOf(roleA) > ROLE_HIERARCHY.indexOf(roleB);
}
