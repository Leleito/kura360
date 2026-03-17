import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getPermissions,
  isValidRole,
  outranks,
  ROLE_LABELS,
  ROUTE_PERMISSIONS,
  type CampaignRole,
  type Permission,
} from '../permissions';

/* -------------------------------------------------------------------------- */
/*  All permissions (used for exhaustive checks)                               */
/* -------------------------------------------------------------------------- */

const ALL_PERMISSIONS: Permission[] = [
  'campaign:read', 'campaign:update', 'campaign:manage_members',
  'transactions:read', 'transactions:create', 'transactions:approve', 'transactions:delete',
  'donations:read', 'donations:create', 'donations:import',
  'agents:read', 'agents:create', 'agents:update', 'agents:delete',
  'evidence:read', 'evidence:create', 'evidence:verify',
  'incidents:read', 'incidents:create', 'incidents:update',
  'compliance:read',
  'audit:read',
  'settings:read', 'settings:update',
];

/* -------------------------------------------------------------------------- */
/*  campaign_owner — full access                                               */
/* -------------------------------------------------------------------------- */

describe('campaign_owner permissions', () => {
  it('has ALL permissions', () => {
    for (const perm of ALL_PERMISSIONS) {
      expect(hasPermission('campaign_owner', perm)).toBe(true);
    }
  });

  it('getPermissions returns all permissions', () => {
    const perms = getPermissions('campaign_owner');
    expect(perms.length).toBe(ALL_PERMISSIONS.length);
    for (const p of ALL_PERMISSIONS) {
      expect(perms).toContain(p);
    }
  });
});

/* -------------------------------------------------------------------------- */
/*  finance_officer                                                            */
/* -------------------------------------------------------------------------- */

describe('finance_officer permissions', () => {
  const role: CampaignRole = 'finance_officer';

  it('can read campaigns', () => {
    expect(hasPermission(role, 'campaign:read')).toBe(true);
  });

  it('can create and approve transactions', () => {
    expect(hasPermission(role, 'transactions:read')).toBe(true);
    expect(hasPermission(role, 'transactions:create')).toBe(true);
    expect(hasPermission(role, 'transactions:approve')).toBe(true);
  });

  it('CANNOT delete transactions', () => {
    expect(hasPermission(role, 'transactions:delete')).toBe(false);
  });

  it('can manage donations (read, create, import)', () => {
    expect(hasPermission(role, 'donations:read')).toBe(true);
    expect(hasPermission(role, 'donations:create')).toBe(true);
    expect(hasPermission(role, 'donations:import')).toBe(true);
  });

  it('CANNOT create agents', () => {
    expect(hasPermission(role, 'agents:create')).toBe(false);
  });

  it('CANNOT manage agents at all', () => {
    expect(hasPermission(role, 'agents:read')).toBe(false);
    expect(hasPermission(role, 'agents:update')).toBe(false);
    expect(hasPermission(role, 'agents:delete')).toBe(false);
  });

  it('CANNOT manage evidence', () => {
    expect(hasPermission(role, 'evidence:read')).toBe(false);
    expect(hasPermission(role, 'evidence:create')).toBe(false);
    expect(hasPermission(role, 'evidence:verify')).toBe(false);
  });

  it('can read compliance and audit', () => {
    expect(hasPermission(role, 'compliance:read')).toBe(true);
    expect(hasPermission(role, 'audit:read')).toBe(true);
  });

  it('can read settings but CANNOT update', () => {
    expect(hasPermission(role, 'settings:read')).toBe(true);
    expect(hasPermission(role, 'settings:update')).toBe(false);
  });

  it('CANNOT manage campaign members', () => {
    expect(hasPermission(role, 'campaign:manage_members')).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/*  agent_coordinator                                                          */
/* -------------------------------------------------------------------------- */

describe('agent_coordinator permissions', () => {
  const role: CampaignRole = 'agent_coordinator';

  it('can read, create, and update agents', () => {
    expect(hasPermission(role, 'agents:read')).toBe(true);
    expect(hasPermission(role, 'agents:create')).toBe(true);
    expect(hasPermission(role, 'agents:update')).toBe(true);
  });

  it('CANNOT delete agents', () => {
    expect(hasPermission(role, 'agents:delete')).toBe(false);
  });

  it('can verify evidence but CANNOT create evidence', () => {
    expect(hasPermission(role, 'evidence:read')).toBe(true);
    expect(hasPermission(role, 'evidence:verify')).toBe(true);
    expect(hasPermission(role, 'evidence:create')).toBe(false);
  });

  it('can read and update incidents but CANNOT create', () => {
    expect(hasPermission(role, 'incidents:read')).toBe(true);
    expect(hasPermission(role, 'incidents:update')).toBe(true);
    expect(hasPermission(role, 'incidents:create')).toBe(false);
  });

  it('CANNOT manage transactions or donations', () => {
    expect(hasPermission(role, 'transactions:create')).toBe(false);
    expect(hasPermission(role, 'donations:create')).toBe(false);
  });

  it('can read compliance and settings', () => {
    expect(hasPermission(role, 'compliance:read')).toBe(true);
    expect(hasPermission(role, 'settings:read')).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/*  agent (field agent)                                                        */
/* -------------------------------------------------------------------------- */

describe('agent permissions', () => {
  const role: CampaignRole = 'agent';

  it('can read campaigns and agents', () => {
    expect(hasPermission(role, 'campaign:read')).toBe(true);
    expect(hasPermission(role, 'agents:read')).toBe(true);
  });

  it('can create evidence and incidents', () => {
    expect(hasPermission(role, 'evidence:read')).toBe(true);
    expect(hasPermission(role, 'evidence:create')).toBe(true);
    expect(hasPermission(role, 'incidents:read')).toBe(true);
    expect(hasPermission(role, 'incidents:create')).toBe(true);
  });

  it('CANNOT verify evidence', () => {
    expect(hasPermission(role, 'evidence:verify')).toBe(false);
  });

  it('CANNOT access transactions or donations', () => {
    expect(hasPermission(role, 'transactions:read')).toBe(false);
    expect(hasPermission(role, 'donations:read')).toBe(false);
  });

  it('CANNOT access compliance, audit, or settings', () => {
    expect(hasPermission(role, 'compliance:read')).toBe(false);
    expect(hasPermission(role, 'audit:read')).toBe(false);
    expect(hasPermission(role, 'settings:read')).toBe(false);
  });

  it('CANNOT create or manage agents', () => {
    expect(hasPermission(role, 'agents:create')).toBe(false);
    expect(hasPermission(role, 'agents:update')).toBe(false);
    expect(hasPermission(role, 'agents:delete')).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/*  viewer — read-only                                                         */
/* -------------------------------------------------------------------------- */

describe('viewer permissions', () => {
  const role: CampaignRole = 'viewer';

  it('has only read permissions', () => {
    const perms = getPermissions(role);
    for (const perm of perms) {
      expect(perm).toMatch(/:read$/);
    }
  });

  it('can read campaigns, transactions, donations, agents, evidence, incidents, compliance, audit', () => {
    expect(hasPermission(role, 'campaign:read')).toBe(true);
    expect(hasPermission(role, 'transactions:read')).toBe(true);
    expect(hasPermission(role, 'donations:read')).toBe(true);
    expect(hasPermission(role, 'agents:read')).toBe(true);
    expect(hasPermission(role, 'evidence:read')).toBe(true);
    expect(hasPermission(role, 'incidents:read')).toBe(true);
    expect(hasPermission(role, 'compliance:read')).toBe(true);
    expect(hasPermission(role, 'audit:read')).toBe(true);
  });

  it('CANNOT create, update, or delete anything', () => {
    const writePermissions: Permission[] = [
      'campaign:update', 'campaign:manage_members',
      'transactions:create', 'transactions:approve', 'transactions:delete',
      'donations:create', 'donations:import',
      'agents:create', 'agents:update', 'agents:delete',
      'evidence:create', 'evidence:verify',
      'incidents:create', 'incidents:update',
      'settings:update',
    ];
    for (const perm of writePermissions) {
      expect(hasPermission(role, perm)).toBe(false);
    }
  });

  it('CANNOT read settings', () => {
    expect(hasPermission(role, 'settings:read')).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/*  hasAnyPermission                                                           */
/* -------------------------------------------------------------------------- */

describe('hasAnyPermission', () => {
  it('returns true if role has at least one of the permissions', () => {
    expect(
      hasAnyPermission('viewer', ['transactions:create', 'transactions:read'])
    ).toBe(true);
  });

  it('returns false if role has none of the permissions', () => {
    expect(
      hasAnyPermission('viewer', ['transactions:create', 'settings:update'])
    ).toBe(false);
  });

  it('returns true for campaign_owner with any permission set', () => {
    expect(
      hasAnyPermission('campaign_owner', ['agents:delete', 'settings:update'])
    ).toBe(true);
  });

  it('returns false for empty permission array', () => {
    expect(hasAnyPermission('campaign_owner', [])).toBe(false);
  });

  it('agent has any of evidence:create or transactions:create', () => {
    expect(
      hasAnyPermission('agent', ['evidence:create', 'transactions:create'])
    ).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/*  hasAllPermissions                                                          */
/* -------------------------------------------------------------------------- */

describe('hasAllPermissions', () => {
  it('campaign_owner passes any combination', () => {
    expect(
      hasAllPermissions('campaign_owner', ['campaign:read', 'settings:update', 'agents:delete'])
    ).toBe(true);
  });

  it('viewer fails if any write permission is included', () => {
    expect(
      hasAllPermissions('viewer', ['campaign:read', 'transactions:create'])
    ).toBe(false);
  });

  it('finance_officer has all financial read + create permissions', () => {
    expect(
      hasAllPermissions('finance_officer', [
        'transactions:read', 'transactions:create', 'donations:read', 'donations:create',
      ])
    ).toBe(true);
  });

  it('returns true for empty permission array', () => {
    expect(hasAllPermissions('viewer', [])).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/*  isValidRole                                                                */
/* -------------------------------------------------------------------------- */

describe('isValidRole', () => {
  it.each([
    'campaign_owner',
    'finance_officer',
    'agent_coordinator',
    'agent',
    'viewer',
  ])('recognizes "%s" as valid', (role) => {
    expect(isValidRole(role)).toBe(true);
  });

  it.each([
    'admin',
    'superuser',
    'Campaign_Owner',
    'VIEWER',
    '',
    'campaign_ownerx',
    'owner',
  ])('rejects "%s" as invalid', (role) => {
    expect(isValidRole(role)).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/*  outranks                                                                   */
/* -------------------------------------------------------------------------- */

describe('outranks', () => {
  it('campaign_owner outranks everyone else', () => {
    expect(outranks('campaign_owner', 'finance_officer')).toBe(true);
    expect(outranks('campaign_owner', 'agent_coordinator')).toBe(true);
    expect(outranks('campaign_owner', 'agent')).toBe(true);
    expect(outranks('campaign_owner', 'viewer')).toBe(true);
  });

  it('viewer does not outrank anyone', () => {
    expect(outranks('viewer', 'agent')).toBe(false);
    expect(outranks('viewer', 'campaign_owner')).toBe(false);
  });

  it('same role does not outrank itself', () => {
    expect(outranks('agent', 'agent')).toBe(false);
    expect(outranks('campaign_owner', 'campaign_owner')).toBe(false);
  });

  it('agent_coordinator outranks agent and viewer', () => {
    expect(outranks('agent_coordinator', 'agent')).toBe(true);
    expect(outranks('agent_coordinator', 'viewer')).toBe(true);
  });

  it('finance_officer outranks agent_coordinator', () => {
    expect(outranks('finance_officer', 'agent_coordinator')).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/*  ROLE_LABELS                                                                */
/* -------------------------------------------------------------------------- */

describe('ROLE_LABELS', () => {
  it('has a label for every role', () => {
    const roles: CampaignRole[] = [
      'campaign_owner', 'finance_officer', 'agent_coordinator', 'agent', 'viewer',
    ];
    for (const role of roles) {
      expect(ROLE_LABELS[role]).toBeDefined();
      expect(typeof ROLE_LABELS[role]).toBe('string');
      expect(ROLE_LABELS[role].length).toBeGreaterThan(0);
    }
  });
});

/* -------------------------------------------------------------------------- */
/*  ROUTE_PERMISSIONS                                                          */
/* -------------------------------------------------------------------------- */

describe('ROUTE_PERMISSIONS', () => {
  it('dashboard requires campaign:read', () => {
    expect(ROUTE_PERMISSIONS['/dashboard']).toContain('campaign:read');
  });

  it('finance route requires transactions:read', () => {
    expect(ROUTE_PERMISSIONS['/finance']).toContain('transactions:read');
  });

  it('settings route requires settings:read', () => {
    expect(ROUTE_PERMISSIONS['/settings']).toContain('settings:read');
  });

  it('all routes have at least one permission', () => {
    for (const [route, perms] of Object.entries(ROUTE_PERMISSIONS)) {
      expect(perms.length).toBeGreaterThan(0);
    }
  });
});
