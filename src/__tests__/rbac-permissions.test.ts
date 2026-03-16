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
} from '@/lib/rbac/permissions';

/* -------------------------------------------------------------------------- */
/*  Role validation                                                            */
/* -------------------------------------------------------------------------- */

describe('isValidRole', () => {
  it('accepts all 5 valid roles', () => {
    const roles: CampaignRole[] = ['campaign_owner', 'finance_officer', 'agent_coordinator', 'agent', 'viewer'];
    roles.forEach((role) => expect(isValidRole(role)).toBe(true));
  });

  it('rejects invalid roles', () => {
    expect(isValidRole('admin')).toBe(false);
    expect(isValidRole('')).toBe(false);
    expect(isValidRole('superuser')).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/*  Campaign Owner — full access                                               */
/* -------------------------------------------------------------------------- */

describe('campaign_owner permissions', () => {
  const role: CampaignRole = 'campaign_owner';

  it('has all permissions', () => {
    const allPerms = getPermissions(role);
    expect(allPerms.length).toBeGreaterThan(20); // Owner should have everything
  });

  it('can manage members', () => {
    expect(hasPermission(role, 'campaign:manage_members')).toBe(true);
  });

  it('can CRUD transactions', () => {
    expect(hasPermission(role, 'transactions:create')).toBe(true);
    expect(hasPermission(role, 'transactions:approve')).toBe(true);
    expect(hasPermission(role, 'transactions:delete')).toBe(true);
  });

  it('can manage agents', () => {
    expect(hasPermission(role, 'agents:create')).toBe(true);
    expect(hasPermission(role, 'agents:delete')).toBe(true);
  });

  it('can verify evidence', () => {
    expect(hasPermission(role, 'evidence:verify')).toBe(true);
  });

  it('can update settings', () => {
    expect(hasPermission(role, 'settings:update')).toBe(true);
  });
});

/* -------------------------------------------------------------------------- */
/*  Finance Officer — financial ops only                                       */
/* -------------------------------------------------------------------------- */

describe('finance_officer permissions', () => {
  const role: CampaignRole = 'finance_officer';

  it('can manage transactions', () => {
    expect(hasPermission(role, 'transactions:read')).toBe(true);
    expect(hasPermission(role, 'transactions:create')).toBe(true);
    expect(hasPermission(role, 'transactions:approve')).toBe(true);
  });

  it('CANNOT delete transactions', () => {
    expect(hasPermission(role, 'transactions:delete')).toBe(false);
  });

  it('can manage donations', () => {
    expect(hasPermission(role, 'donations:read')).toBe(true);
    expect(hasPermission(role, 'donations:create')).toBe(true);
    expect(hasPermission(role, 'donations:import')).toBe(true);
  });

  it('CANNOT manage agents', () => {
    expect(hasPermission(role, 'agents:create')).toBe(false);
    expect(hasPermission(role, 'agents:update')).toBe(false);
  });

  it('CANNOT manage members', () => {
    expect(hasPermission(role, 'campaign:manage_members')).toBe(false);
  });

  it('CANNOT update settings', () => {
    expect(hasPermission(role, 'settings:update')).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/*  Agent Coordinator — agent & evidence ops                                   */
/* -------------------------------------------------------------------------- */

describe('agent_coordinator permissions', () => {
  const role: CampaignRole = 'agent_coordinator';

  it('can manage agents', () => {
    expect(hasPermission(role, 'agents:read')).toBe(true);
    expect(hasPermission(role, 'agents:create')).toBe(true);
    expect(hasPermission(role, 'agents:update')).toBe(true);
  });

  it('CANNOT delete agents (owner-only)', () => {
    expect(hasPermission(role, 'agents:delete')).toBe(false);
  });

  it('can verify evidence', () => {
    expect(hasPermission(role, 'evidence:verify')).toBe(true);
  });

  it('CANNOT manage finances', () => {
    expect(hasPermission(role, 'transactions:create')).toBe(false);
    expect(hasPermission(role, 'donations:create')).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/*  Agent — field operations only                                              */
/* -------------------------------------------------------------------------- */

describe('agent permissions', () => {
  const role: CampaignRole = 'agent';

  it('can upload evidence', () => {
    expect(hasPermission(role, 'evidence:create')).toBe(true);
  });

  it('can create incidents', () => {
    expect(hasPermission(role, 'incidents:create')).toBe(true);
  });

  it('CANNOT verify evidence', () => {
    expect(hasPermission(role, 'evidence:verify')).toBe(false);
  });

  it('CANNOT view compliance', () => {
    expect(hasPermission(role, 'compliance:read')).toBe(false);
  });

  it('CANNOT manage finances', () => {
    expect(hasPermission(role, 'transactions:read')).toBe(false);
    expect(hasPermission(role, 'donations:read')).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/*  Viewer — read-only                                                         */
/* -------------------------------------------------------------------------- */

describe('viewer permissions', () => {
  const role: CampaignRole = 'viewer';

  it('can read everything public', () => {
    expect(hasPermission(role, 'transactions:read')).toBe(true);
    expect(hasPermission(role, 'donations:read')).toBe(true);
    expect(hasPermission(role, 'agents:read')).toBe(true);
    expect(hasPermission(role, 'evidence:read')).toBe(true);
    expect(hasPermission(role, 'compliance:read')).toBe(true);
    expect(hasPermission(role, 'audit:read')).toBe(true);
  });

  it('CANNOT create anything', () => {
    const writePerms: Permission[] = [
      'transactions:create', 'donations:create', 'agents:create',
      'evidence:create', 'incidents:create',
    ];
    writePerms.forEach((p) => expect(hasPermission(role, p)).toBe(false));
  });

  it('CANNOT update settings', () => {
    expect(hasPermission(role, 'settings:update')).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/*  Compound permission checks                                                 */
/* -------------------------------------------------------------------------- */

describe('hasAllPermissions', () => {
  it('returns true when role has all listed permissions', () => {
    expect(hasAllPermissions('finance_officer', ['transactions:read', 'donations:read'])).toBe(true);
  });

  it('returns false when role lacks one permission', () => {
    expect(hasAllPermissions('viewer', ['transactions:read', 'transactions:create'])).toBe(false);
  });
});

describe('hasAnyPermission', () => {
  it('returns true when role has at least one permission', () => {
    expect(hasAnyPermission('agent', ['transactions:create', 'evidence:create'])).toBe(true);
  });

  it('returns false when role has none of the permissions', () => {
    expect(hasAnyPermission('viewer', ['transactions:create', 'agents:create'])).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/*  Role hierarchy                                                             */
/* -------------------------------------------------------------------------- */

describe('outranks', () => {
  it('owner outranks all other roles', () => {
    expect(outranks('campaign_owner', 'finance_officer')).toBe(true);
    expect(outranks('campaign_owner', 'viewer')).toBe(true);
  });

  it('viewer does not outrank anyone', () => {
    expect(outranks('viewer', 'agent')).toBe(false);
    expect(outranks('viewer', 'campaign_owner')).toBe(false);
  });

  it('agent_coordinator outranks agent', () => {
    expect(outranks('agent_coordinator', 'agent')).toBe(true);
  });

  it('same role does not outrank itself', () => {
    expect(outranks('finance_officer', 'finance_officer')).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/*  Route permissions coverage                                                 */
/* -------------------------------------------------------------------------- */

describe('ROUTE_PERMISSIONS', () => {
  it('covers all main app routes', () => {
    const routes = ['/dashboard', '/finance', '/donations', '/agents', '/evidence', '/compliance', '/settings'];
    routes.forEach((route) => {
      expect(ROUTE_PERMISSIONS[route]).toBeDefined();
      expect(ROUTE_PERMISSIONS[route].length).toBeGreaterThan(0);
    });
  });
});

/* -------------------------------------------------------------------------- */
/*  Role labels                                                                */
/* -------------------------------------------------------------------------- */

describe('ROLE_LABELS', () => {
  it('provides human-readable label for each role', () => {
    expect(ROLE_LABELS.campaign_owner).toBe('Campaign Owner');
    expect(ROLE_LABELS.viewer).toBe('Viewer');
    expect(ROLE_LABELS.agent).toBe('Field Agent');
  });
});
