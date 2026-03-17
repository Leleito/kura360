-- ==========================================================================
-- KURA360 Demo Seed Data
-- Run against demo Supabase project only
-- Campaign: Jane Wanjiku for Governor, Nakuru (2026)
-- ==========================================================================

-- 1. Campaign
INSERT INTO campaigns (id, candidate_name, campaign_name, position, county, party, spending_limit_kes, created_at)
VALUES (
  'demo-campaign-nakuru-2026',
  'Jane Wanjiku',
  'Jane Wanjiku for Governor, Nakuru',
  'Governor',
  'Nakuru',
  'UDA',
  433000000,
  '2026-01-15T08:00:00Z'
) ON CONFLICT (id) DO NOTHING;

-- 2. Campaign Member (demo user as campaign_owner)
INSERT INTO campaign_members (id, campaign_id, user_id, role, created_at)
VALUES (
  'demo-member-001',
  'demo-campaign-nakuru-2026',
  'demo-user-jane-wanjiku',
  'campaign_owner',
  '2026-01-15T08:00:00Z'
) ON CONFLICT (id) DO NOTHING;

-- 3. Transactions (~50 across 6 ECFA categories)
INSERT INTO transactions (id, campaign_id, description, category, amount_kes, transaction_date, status, type, recorded_by, vendor_name, reference, receipt_url, flagged_reason)
VALUES
  -- Venue Hire
  ('txn-001', 'demo-campaign-nakuru-2026', 'Afraha Stadium rally venue hire & security', 'Venue Hire', 850000, '2026-02-25', 'approved', 'expenditure', 'demo-user-jane-wanjiku', 'Afraha Events Ltd', 'VH-2026-001', '/receipts/txn-001.pdf', NULL),
  ('txn-002', 'demo-campaign-nakuru-2026', 'Nakuru Town Hall stakeholders dinner (300 guests)', 'Venue Hire', 390000, '2026-02-20', 'approved', 'expenditure', 'demo-user-jane-wanjiku', 'Merica Hotel', 'VH-2026-002', '/receipts/txn-002.pdf', NULL),
  ('txn-003', 'demo-campaign-nakuru-2026', 'Naivasha rally sound & stage equipment', 'Venue Hire', 280000, '2026-02-17', 'approved', 'expenditure', 'demo-user-jane-wanjiku', 'Sound Masters EA', 'VH-2026-003', '/receipts/txn-003.pdf', NULL),
  ('txn-004', 'demo-campaign-nakuru-2026', 'Gilgil constituency meet & greet venue', 'Venue Hire', 120000, '2026-02-12', 'approved', 'expenditure', 'demo-user-jane-wanjiku', 'Gilgil Social Hall', 'VH-2026-004', NULL, NULL),
  ('txn-005', 'demo-campaign-nakuru-2026', 'Njoro farmers forum tent hire', 'Venue Hire', 95000, '2026-02-08', 'pending', 'expenditure', 'demo-user-jane-wanjiku', 'Tent City Rentals', 'VH-2026-005', NULL, NULL),
  -- Publicity
  ('txn-006', 'demo-campaign-nakuru-2026', 'Campaign T-shirts 10,000 units - Rivatex Eldoret', 'Publicity', 650000, '2026-02-22', 'approved', 'expenditure', 'demo-user-jane-wanjiku', 'Rivatex East Africa', 'PB-2026-001', '/receipts/txn-006.pdf', NULL),
  ('txn-007', 'demo-campaign-nakuru-2026', 'Printing 50,000 campaign flyers - A5 full colour', 'Publicity', 375000, '2026-02-24', 'approved', 'expenditure', 'demo-user-jane-wanjiku', 'Kul Graphics', 'PB-2026-002', '/receipts/txn-007.pdf', NULL),
  ('txn-008', 'demo-campaign-nakuru-2026', 'Billboard printing (6 units) - Nakuru-Nairobi highway', 'Publicity', 720000, '2026-02-16', 'rejected', 'expenditure', 'demo-user-jane-wanjiku', 'Sign Africa Ltd', 'PB-2026-003', NULL, 'Vendor not in approved supplier list'),
  ('txn-009', 'demo-campaign-nakuru-2026', 'Campaign caps 5,000 units with embroidery', 'Publicity', 225000, '2026-02-10', 'approved', 'expenditure', 'demo-user-jane-wanjiku', 'Branded Merch Kenya', 'PB-2026-004', '/receipts/txn-009.pdf', NULL),
  ('txn-010', 'demo-campaign-nakuru-2026', 'Banners & posters for ward offices', 'Publicity', 180000, '2026-02-06', 'approved', 'expenditure', 'demo-user-jane-wanjiku', 'Print Hub Nakuru', 'PB-2026-005', '/receipts/txn-010.pdf', NULL),
  -- Advertising
  ('txn-011', 'demo-campaign-nakuru-2026', 'NTV prime-time 30s campaign advert (7-day run)', 'Advertising', 1200000, '2026-02-23', 'approved', 'expenditure', 'demo-user-jane-wanjiku', 'MediaMax Agency', 'AD-2026-001', '/receipts/txn-011.pdf', NULL),
  ('txn-012', 'demo-campaign-nakuru-2026', 'Radio Citizen vernacular ads - Kikuyu slots', 'Advertising', 320000, '2026-02-19', 'pending', 'expenditure', 'demo-user-jane-wanjiku', 'Royal Media Services', 'AD-2026-002', NULL, NULL),
  ('txn-013', 'demo-campaign-nakuru-2026', 'SMS bulk messaging - Safaricom 200K subscribers', 'Advertising', 160000, '2026-02-14', 'approved', 'expenditure', 'demo-user-jane-wanjiku', 'Africastalking', 'AD-2026-003', '/receipts/txn-013.pdf', NULL),
  ('txn-014', 'demo-campaign-nakuru-2026', 'Social media management - February retainer', 'Advertising', 275000, '2026-02-11', 'approved', 'expenditure', 'demo-user-jane-wanjiku', 'Digital Edge Kenya', 'AD-2026-004', '/receipts/txn-014.pdf', NULL),
  ('txn-015', 'demo-campaign-nakuru-2026', 'Facebook & Instagram boosted posts (2 weeks)', 'Advertising', 150000, '2026-02-05', 'approved', 'expenditure', 'demo-user-jane-wanjiku', 'Meta Business', 'AD-2026-005', '/receipts/txn-015.pdf', NULL),
  ('txn-016', 'demo-campaign-nakuru-2026', 'Campaign jingle production & radio placement', 'Advertising', 480000, '2026-02-03', 'approved', 'expenditure', 'demo-user-jane-wanjiku', 'Homeboyz Music', 'AD-2026-006', '/receipts/txn-016.pdf', NULL),
  -- Transport
  ('txn-017', 'demo-campaign-nakuru-2026', 'Fuel & vehicle hire - Rift Valley tour (5 vehicles)', 'Transport', 420000, '2026-02-21', 'approved', 'expenditure', 'demo-user-jane-wanjiku', 'AutoXpress Kenya', 'TR-2026-001', '/receipts/txn-017.pdf', NULL),
  ('txn-018', 'demo-campaign-nakuru-2026', 'Chartered bus hire - Nakuru to Nairobi supporters', 'Transport', 185000, '2026-02-15', 'approved', 'expenditure', 'demo-user-jane-wanjiku', 'Modern Coast Express', 'TR-2026-002', '/receipts/txn-018.pdf', NULL),
  ('txn-019', 'demo-campaign-nakuru-2026', 'Helicopter charter - rejected per transport policy', 'Transport', 980000, '2026-02-09', 'rejected', 'expenditure', 'demo-user-jane-wanjiku', 'Kenya Helicopter', 'TR-2026-003', NULL, 'Exceeds per-trip transport policy limit'),
  ('txn-020', 'demo-campaign-nakuru-2026', 'Campaign convoy fuel for February', 'Transport', 145000, '2026-02-28', 'approved', 'expenditure', 'demo-user-jane-wanjiku', 'Total Energies', 'TR-2026-004', '/receipts/txn-020.pdf', NULL),
  -- Personnel
  ('txn-021', 'demo-campaign-nakuru-2026', 'Monthly agent stipends - 18 constituency coordinators', 'Personnel', 540000, '2026-02-20', 'approved', 'expenditure', 'demo-user-jane-wanjiku', 'Payroll', 'PE-2026-001', '/receipts/txn-021.pdf', NULL),
  ('txn-022', 'demo-campaign-nakuru-2026', 'Campaign manager salary - February', 'Personnel', 350000, '2026-02-28', 'approved', 'expenditure', 'demo-user-jane-wanjiku', 'Payroll', 'PE-2026-002', '/receipts/txn-022.pdf', NULL),
  ('txn-023', 'demo-campaign-nakuru-2026', 'IT support team (3 persons) - February', 'Personnel', 180000, '2026-02-28', 'approved', 'expenditure', 'demo-user-jane-wanjiku', 'Payroll', 'PE-2026-003', '/receipts/txn-023.pdf', NULL),
  ('txn-024', 'demo-campaign-nakuru-2026', 'Security detail - 4 guards for candidate', 'Personnel', 240000, '2026-02-28', 'approved', 'expenditure', 'demo-user-jane-wanjiku', 'G4S Kenya', 'PE-2026-004', '/receipts/txn-024.pdf', NULL),
  -- Admin & Other
  ('txn-025', 'demo-campaign-nakuru-2026', 'Campaign office rent - Milimani, Nakuru (3 months)', 'Admin & Other', 450000, '2026-02-18', 'approved', 'expenditure', 'demo-user-jane-wanjiku', 'Milimani Properties', 'AO-2026-001', '/receipts/txn-025.pdf', NULL),
  ('txn-026', 'demo-campaign-nakuru-2026', 'Office supplies & IT equipment', 'Admin & Other', 185000, '2026-02-13', 'approved', 'expenditure', 'demo-user-jane-wanjiku', 'Naivas Supermarket', 'AO-2026-002', '/receipts/txn-026.pdf', NULL),
  ('txn-027', 'demo-campaign-nakuru-2026', 'Legal consultation - ECFA compliance review', 'Admin & Other', 200000, '2026-02-07', 'approved', 'expenditure', 'demo-user-jane-wanjiku', 'Kamau & Associates', 'AO-2026-003', '/receipts/txn-027.pdf', NULL),
  ('txn-028', 'demo-campaign-nakuru-2026', 'Internet & cloud services (monthly)', 'Admin & Other', 45000, '2026-02-01', 'approved', 'expenditure', 'demo-user-jane-wanjiku', 'Safaricom Fibre', 'AO-2026-004', '/receipts/txn-028.pdf', NULL)
ON CONFLICT (id) DO NOTHING;

-- 4. Agents (~30 across 5 counties)
INSERT INTO agents (id, campaign_id, full_name, phone, national_id, county, constituency, polling_station, status, deployed_at)
VALUES
  ('agt-001', 'demo-campaign-nakuru-2026', 'Wanjiku Kamau', '+254712345001', '32456789', 'Nakuru', 'Nakuru Town East', 'Afraha Primary School', 'checked-in', '2026-02-27T06:42:00Z'),
  ('agt-002', 'demo-campaign-nakuru-2026', 'Peter Ochieng', '+254722345002', '28765432', 'Nakuru', 'Nakuru Town West', 'Menengai Secondary', 'deployed', '2026-02-27T05:30:00Z'),
  ('agt-003', 'demo-campaign-nakuru-2026', 'Amina Hassan', '+254733345003', '34567890', 'Nakuru', 'Naivasha', 'Naivasha Primary School', 'active', '2026-02-27T07:15:00Z'),
  ('agt-004', 'demo-campaign-nakuru-2026', 'Kipchoge Ruto', '+254745345004', '29876543', 'Nakuru', 'Gilgil', 'Gilgil Public Hall', 'checked-in', '2026-02-27T06:58:00Z'),
  ('agt-005', 'demo-campaign-nakuru-2026', 'Njeri Muthoni', '+254756345005', '31234567', 'Nakuru', 'Njoro', 'Njoro Farmers Hall', 'deployed', '2026-02-26T16:20:00Z'),
  ('agt-006', 'demo-campaign-nakuru-2026', 'Barasa Wekesa', '+254712345006', '27654321', 'Nakuru', 'Molo', 'Molo Township Primary', 'inactive', '2026-02-25T10:00:00Z'),
  ('agt-007', 'demo-campaign-nakuru-2026', 'Akinyi Ouma', '+254722345007', '33456789', 'Nakuru', 'Subukia', 'Subukia Community Centre', 'active', '2026-02-27T07:02:00Z'),
  ('agt-008', 'demo-campaign-nakuru-2026', 'James Mwangi', '+254733345008', '30123456', 'Nairobi', 'Langata', 'Kibera Primary School', 'checked-in', '2026-02-27T06:35:00Z'),
  ('agt-009', 'demo-campaign-nakuru-2026', 'Fatuma Ali', '+254745345009', '35678901', 'Nairobi', 'Westlands', 'Parklands Primary', 'active', '2026-02-27T07:10:00Z'),
  ('agt-010', 'demo-campaign-nakuru-2026', 'Kosgei Chebet', '+254756345010', '26543210', 'Nairobi', 'Starehe', 'Uhuru Primary School', 'deployed', '2026-02-27T05:50:00Z'),
  ('agt-011', 'demo-campaign-nakuru-2026', 'Grace Nyambura', '+254712345011', '28901234', 'Kisumu', 'Kisumu Central', 'Oginga Odinga Grounds', 'checked-in', '2026-02-27T06:45:00Z'),
  ('agt-012', 'demo-campaign-nakuru-2026', 'Hassan Omar', '+254722345012', '31567890', 'Kisumu', 'Nyando', 'Ahero Market Centre', 'deployed', '2026-02-27T05:55:00Z'),
  ('agt-013', 'demo-campaign-nakuru-2026', 'Mercy Atieno', '+254733345013', '29012345', 'Kisumu', 'Muhoroni', 'Muhoroni Primary School', 'active', '2026-02-27T07:20:00Z'),
  ('agt-014', 'demo-campaign-nakuru-2026', 'David Kiprop', '+254745345014', '33789012', 'Mombasa', 'Mvita', 'Majengo Community Hall', 'checked-in', '2026-02-27T06:30:00Z'),
  ('agt-015', 'demo-campaign-nakuru-2026', 'Halima Yusuf', '+254756345015', '27890123', 'Mombasa', 'Changamwe', 'Port Reitz Hall', 'deployed', '2026-02-27T05:45:00Z'),
  ('agt-016', 'demo-campaign-nakuru-2026', 'Odhiambo Otieno', '+254712345016', '30234567', 'Mombasa', 'Likoni', 'Likoni Primary School', 'active', '2026-02-27T07:05:00Z'),
  ('agt-017', 'demo-campaign-nakuru-2026', 'Sarah Wanjiru', '+254722345017', '34012345', 'Uasin Gishu', 'Ainabkoi', 'Eldoret ASK Grounds', 'checked-in', '2026-02-27T06:50:00Z'),
  ('agt-018', 'demo-campaign-nakuru-2026', 'Abdi Mohamed', '+254733345018', '28234567', 'Uasin Gishu', 'Kesses', 'University of Eldoret', 'deployed', '2026-02-27T05:40:00Z'),
  ('agt-019', 'demo-campaign-nakuru-2026', 'Ester Cherop', '+254745345019', '32678901', 'Nakuru', 'Bahati', 'Bahati Primary School', 'active', '2026-02-27T07:25:00Z'),
  ('agt-020', 'demo-campaign-nakuru-2026', 'Patrick Kamau', '+254756345020', '29345678', 'Nakuru', 'Rongai', 'Rongai Community Hall', 'deployed', '2026-02-26T16:10:00Z'),
  ('agt-021', 'demo-campaign-nakuru-2026', 'Lucy Wairimu', '+254712345021', '31890123', 'Nakuru', 'Kuresoi North', 'Kuresoi Primary School', 'pending', NULL),
  ('agt-022', 'demo-campaign-nakuru-2026', 'Joseph Mutai', '+254722345022', '33012345', 'Nakuru', 'Kuresoi South', 'Kuresoi South Hall', 'pending', NULL),
  ('agt-023', 'demo-campaign-nakuru-2026', 'Agnes Wangui', '+254733345023', '27123456', 'Nairobi', 'Dagoretti', 'Waithaka Primary School', 'active', '2026-02-27T07:12:00Z'),
  ('agt-024', 'demo-campaign-nakuru-2026', 'Moses Kibet', '+254745345024', '30567890', 'Uasin Gishu', 'Moiben', 'Moiben Secondary School', 'deployed', '2026-02-27T05:35:00Z'),
  ('agt-025', 'demo-campaign-nakuru-2026', 'Jane Achieng', '+254756345025', '34345678', 'Kisumu', 'Seme', 'Seme Primary School', 'inactive', '2026-02-24T14:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- 5. Evidence Items (~20)
INSERT INTO evidence_items (id, campaign_id, title, description, type, file_url, sha256_hash, gps_lat, gps_lon, verification_status, captured_at, file_size_bytes)
VALUES
  ('ev-001', 'demo-campaign-nakuru-2026', 'Afraha Stadium Rally - Crowd Aerial View', 'Aerial drone photograph of campaign rally at Afraha Stadium showing crowd turnout.', 'photo', 'https://storage.kura360.co.ke/evidence/ev-001.jpg', 'a3f2b8c4e5d6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0d91c', -0.3031, 36.0800, 'verified', '2026-02-15T09:30:00Z', 4500000),
  ('ev-002', 'demo-campaign-nakuru-2026', 'Ballot Counting - Nakuru Town East', 'Video recording of ballot counting at Afraha Primary School polling station.', 'video', 'https://storage.kura360.co.ke/evidence/ev-002.mp4', 'b7e4d2f1a8c3e6b9d5f0a2c4e7b1d3f6a9c2e5b8d0f3a6c9e1b4d7f0a3c6e9b2', -0.2833, 36.0667, 'verified', '2026-02-20T17:15:00Z', 25000000),
  ('ev-003', 'demo-campaign-nakuru-2026', 'T-Shirt Distribution Delivery Note', 'Signed delivery note for 5,000 campaign T-shirts distributed to ward coordinators.', 'document', 'https://storage.kura360.co.ke/evidence/ev-003.pdf', 'c1d8e5f2a9b6c3d0e7f4a1b8c5d2e9f6a3b0c7d4e1f8a5b2c9d6e3f0a7b4c1d8', -0.3031, 36.0800, 'pending', '2026-02-22T11:00:00Z', 850000),
  ('ev-004', 'demo-campaign-nakuru-2026', 'Voter Intimidation Incident - Naivasha', 'Photographic evidence of unauthorized persons obstructing voters near polling station.', 'photo', 'https://storage.kura360.co.ke/evidence/ev-004.jpg', 'd4e1f8a5b2c9d6e3f0a7b4c1d8e5f2a9b6c3d0e7f4a1b8c5d2e9f6a3b0c7d4e1', -0.7177, 36.4317, 'flagged', '2026-02-18T14:45:00Z', 3200000),
  ('ev-005', 'demo-campaign-nakuru-2026', 'Billboard Permit - Nakuru County', 'County government approval permit for campaign billboards on A104 highway.', 'document', 'https://storage.kura360.co.ke/evidence/ev-005.pdf', 'e7f4a1b8c5d2e9f6a3b0c7d4e1f8a5b2c9d6e3f0a7b4c1d8e5f2a9b6c3d0e7f4', -0.3031, 36.0800, 'verified', '2026-02-10T08:20:00Z', 1200000),
  ('ev-006', 'demo-campaign-nakuru-2026', 'Town Hall Meeting Audio - Gilgil', 'Full audio recording of candidate town hall meeting covering education policy.', 'audio', 'https://storage.kura360.co.ke/evidence/ev-006.mp3', 'f0a3c6e9b2d5f8a1c4e7b0d3f6a9c2e5b8d1f4a7c0e3b6d9f2a5c8e1b4d7f0a3', -0.4949, 36.3228, 'verified', '2026-02-12T16:30:00Z', 18000000),
  ('ev-007', 'demo-campaign-nakuru-2026', 'Agent Deployment Roster - Nakuru County', 'Signed deployment roster for 25 polling station agents across Nakuru County.', 'document', 'https://storage.kura360.co.ke/evidence/ev-007.pdf', 'a1b4d7f0a3c6e9b2d5f8a1c4e7b0d3f6a9c2e5b8d1f4a7c0e3b6d9f2a5c8e1b4', -0.3031, 36.0800, 'pending', '2026-02-24T10:00:00Z', 650000),
  ('ev-008', 'demo-campaign-nakuru-2026', 'Rally Stage Setup - Molo', 'Pre-event photograph documenting stage setup and branding compliance.', 'photo', 'https://storage.kura360.co.ke/evidence/ev-008.jpg', 'b8d1f4a7c0e3b6d9f2a5c8e1b4d7f0a3c6e9b2d5f8a1c4e7b0d3f6a9c2e5b8d1', -0.2460, 35.7310, 'verified', '2026-02-19T07:45:00Z', 5100000),
  ('ev-009', 'demo-campaign-nakuru-2026', 'Suspicious Expenditure Receipt', 'Flagged receipt showing possible inflated costs for campaign materials from vendor.', 'document', 'https://storage.kura360.co.ke/evidence/ev-009.pdf', 'c0e3b6d9f2a5c8e1b4d7f0a3c6e9b2d5f8a1c4e7b0d3f6a9c2e5b8d1f4a7c0e3', -0.3031, 36.0800, 'flagged', '2026-02-23T13:20:00Z', 420000),
  ('ev-010', 'demo-campaign-nakuru-2026', 'M-Pesa Donation Drive - Supporter Testimonial', 'Video testimonial recorded during M-Pesa micro-donation campaign launch in Nakuru.', 'video', 'https://storage.kura360.co.ke/evidence/ev-010.mp4', 'd3f6a9c2e5b8d1f4a7c0e3b6d9f2a5c8e1b4d7f0a3c6e9b2d5f8a1c4e7b0d3f6', -0.3031, 36.0800, 'pending', '2026-02-25T15:10:00Z', 32000000),
  ('ev-011', 'demo-campaign-nakuru-2026', 'Njoro Farmers Forum Photo', 'Campaign rally at Njoro farmers forum showing engagement.', 'photo', 'https://storage.kura360.co.ke/evidence/ev-011.jpg', 'e1b4d7f0a3c6e9b2d5f8a1c4e7b0d3f6a9c2e5b8d1f4a7c0e3b6d9f2a5c8e1b4', -0.3303, 35.9469, 'verified', '2026-02-08T11:30:00Z', 3800000),
  ('ev-012', 'demo-campaign-nakuru-2026', 'Campaign Vehicle Branding Compliance', 'Documentation of vehicle branding per ECFA regulations.', 'photo', 'https://storage.kura360.co.ke/evidence/ev-012.jpg', 'f4a7c0e3b6d9f2a5c8e1b4d7f0a3c6e9b2d5f8a1c4e7b0d3f6a9c2e5b8d1f4a7', -0.3031, 36.0800, 'verified', '2026-02-14T09:00:00Z', 2900000)
ON CONFLICT (id) DO NOTHING;

-- 6. Donations (~40: M-Pesa 30, Bank 6, Cash 4, includes 3 flagged)
INSERT INTO donations (id, campaign_id, donor_name, donor_phone, amount_kes, mpesa_ref, is_anonymous, kyc_status, compliance_status, flagged_reason, donated_at, receipt_number, source)
VALUES
  -- M-Pesa donations (30)
  ('don-001', 'demo-campaign-nakuru-2026', 'Grace Wanjiku Muthoni', '+254712345678', 250000, 'QJH7T2KXMR', false, 'verified', 'compliant', NULL, '2026-02-27T09:30:00Z', 'RCP-2026-0001', 'mpesa'),
  ('don-002', 'demo-campaign-nakuru-2026', 'Akinyi Nyambura', '+254734567890', 75000, 'RNL4P8VBZQ', false, 'verified', 'compliant', NULL, '2026-02-25T11:45:00Z', 'RCP-2026-0003', 'mpesa'),
  ('don-003', 'demo-campaign-nakuru-2026', 'Njeri Mwangi', '+254756789012', 45000, 'TYK9M3HDWF', false, 'pending', 'flagged', 'KYC verification incomplete', '2026-02-22T08:30:00Z', 'RCP-2026-0006', 'mpesa'),
  ('don-004', 'demo-campaign-nakuru-2026', 'Fatuma Hassan', '+254778901234', 25000, 'BNX2L6JCPA', false, 'verified', 'compliant', NULL, '2026-02-20T12:10:00Z', 'RCP-2026-0008', 'mpesa'),
  ('don-005', 'demo-campaign-nakuru-2026', 'Chebet Langat', '+254790123456', 12000, 'WSG5R1PMNE', false, 'pending', 'flagged', 'KYC verification incomplete', '2026-02-18T17:30:00Z', 'RCP-2026-0010', 'mpesa'),
  ('don-006', 'demo-campaign-nakuru-2026', 'Moses Kiprono', '+254711111111', 50000, 'ABC1D2E3FG', false, 'verified', 'compliant', NULL, '2026-02-26T10:00:00Z', 'RCP-2026-0011', 'mpesa'),
  ('don-007', 'demo-campaign-nakuru-2026', 'Mary Achieng', '+254722222222', 30000, 'HIJ4K5L6MN', false, 'verified', 'compliant', NULL, '2026-02-24T14:30:00Z', 'RCP-2026-0012', 'mpesa'),
  ('don-008', 'demo-campaign-nakuru-2026', 'John Kiplagat', '+254733333333', 15000, 'OPQ7R8S9TU', false, 'verified', 'compliant', NULL, '2026-02-23T09:15:00Z', 'RCP-2026-0013', 'mpesa'),
  ('don-009', 'demo-campaign-nakuru-2026', 'Elizabeth Wambui', '+254744444444', 100000, 'VWX1Y2Z3AB', false, 'verified', 'compliant', NULL, '2026-02-21T16:45:00Z', 'RCP-2026-0014', 'mpesa'),
  ('don-010', 'demo-campaign-nakuru-2026', 'Samuel Rotich', '+254755555555', 20000, 'CDE4F5G6HI', false, 'verified', 'compliant', NULL, '2026-02-19T11:20:00Z', 'RCP-2026-0015', 'mpesa'),
  ('don-011', 'demo-campaign-nakuru-2026', 'Rachel Maina', '+254766666666', 8000, 'JKL7M8N9OP', false, 'verified', 'compliant', NULL, '2026-02-17T08:00:00Z', 'RCP-2026-0016', 'mpesa'),
  ('don-012', 'demo-campaign-nakuru-2026', 'Peter Ndungu', '+254777777777', 35000, 'QRS1T2U3VW', false, 'verified', 'compliant', NULL, '2026-02-16T13:30:00Z', 'RCP-2026-0017', 'mpesa'),
  ('don-013', 'demo-campaign-nakuru-2026', 'Joyce Nyokabi', '+254788888888', 5000, 'XYZ4A5B6CD', false, 'verified', 'compliant', NULL, '2026-02-15T07:45:00Z', 'RCP-2026-0018', 'mpesa'),
  ('don-014', 'demo-campaign-nakuru-2026', 'Daniel Korir', '+254799999999', 60000, 'EFG7H8I9JK', false, 'verified', 'compliant', NULL, '2026-02-14T15:00:00Z', 'RCP-2026-0019', 'mpesa'),
  ('don-015', 'demo-campaign-nakuru-2026', 'Catherine Chepkoech', '+254710101010', 22000, 'LMN1O2P3QR', false, 'verified', 'compliant', NULL, '2026-02-13T10:30:00Z', 'RCP-2026-0020', 'mpesa'),
  ('don-016', 'demo-campaign-nakuru-2026', 'Joseph Onyango', '+254720202020', 18000, 'STU4V5W6XY', false, 'verified', 'compliant', NULL, '2026-02-12T12:00:00Z', 'RCP-2026-0021', 'mpesa'),
  ('don-017', 'demo-campaign-nakuru-2026', 'Susan Waithera', '+254730303030', 40000, 'ZAB7C8D9EF', false, 'verified', 'compliant', NULL, '2026-02-11T09:00:00Z', 'RCP-2026-0022', 'mpesa'),
  ('don-018', 'demo-campaign-nakuru-2026', 'Michael Karanja', '+254740404040', 10000, 'GHI1J2K3LM', false, 'verified', 'compliant', NULL, '2026-02-10T14:15:00Z', 'RCP-2026-0023', 'mpesa'),
  ('don-019', 'demo-campaign-nakuru-2026', 'Ann Wangari', '+254750505050', 7000, 'NOP4Q5R6ST', false, 'verified', 'compliant', NULL, '2026-02-09T11:45:00Z', 'RCP-2026-0024', 'mpesa'),
  ('don-020', 'demo-campaign-nakuru-2026', 'William Mutuku', '+254760606060', 28000, 'UVW7X8Y9ZA', false, 'verified', 'compliant', NULL, '2026-02-08T08:30:00Z', 'RCP-2026-0025', 'mpesa'),
  ('don-021', 'demo-campaign-nakuru-2026', 'Margaret Njoki', '+254770707070', 55000, 'BCD1E2F3GH', false, 'verified', 'compliant', NULL, '2026-02-07T16:00:00Z', 'RCP-2026-0026', 'mpesa'),
  ('don-022', 'demo-campaign-nakuru-2026', 'James Ndirangu', '+254780808080', 3000, 'IJK4L5M6NO', false, 'verified', 'compliant', NULL, '2026-02-06T10:00:00Z', 'RCP-2026-0027', 'mpesa'),
  ('don-023', 'demo-campaign-nakuru-2026', 'Esther Jepchumba', '+254790909090', 15000, 'PQR7S8T9UV', false, 'verified', 'compliant', NULL, '2026-02-05T13:30:00Z', 'RCP-2026-0028', 'mpesa'),
  ('don-024', 'demo-campaign-nakuru-2026', 'George Omondi', '+254711112222', 42000, 'WXY1Z2A3BC', false, 'verified', 'compliant', NULL, '2026-02-04T09:45:00Z', 'RCP-2026-0029', 'mpesa'),
  ('don-025', 'demo-campaign-nakuru-2026', 'Lydia Cherotich', '+254722223333', 9000, 'DEF4G5H6IJ', false, 'verified', 'compliant', NULL, '2026-02-03T15:20:00Z', 'RCP-2026-0030', 'mpesa'),
  ('don-026', 'demo-campaign-nakuru-2026', 'Philip Mwathi', '+254733334444', 33000, 'KLM7N8O9PQ', false, 'verified', 'compliant', NULL, '2026-02-02T11:00:00Z', 'RCP-2026-0031', 'mpesa'),
  ('don-027', 'demo-campaign-nakuru-2026', 'Irene Nyambura', '+254744445555', 6500, 'RST1U2V3WX', false, 'verified', 'compliant', NULL, '2026-02-01T08:30:00Z', 'RCP-2026-0032', 'mpesa'),
  ('don-028', 'demo-campaign-nakuru-2026', 'Thomas Kipruto', '+254755556666', 48000, 'YZA4B5C6DE', false, 'verified', 'compliant', NULL, '2026-01-31T14:00:00Z', 'RCP-2026-0033', 'mpesa'),
  ('don-029', 'demo-campaign-nakuru-2026', 'Betty Wanjala', '+254766667777', 11000, 'FGH7I8J9KL', false, 'verified', 'compliant', NULL, '2026-01-30T10:30:00Z', 'RCP-2026-0034', 'mpesa'),
  ('don-030', 'demo-campaign-nakuru-2026', 'Charles Kimani', '+254777778888', 4500, 'MNO1P2Q3RS', false, 'verified', 'compliant', NULL, '2026-01-29T16:15:00Z', 'RCP-2026-0035', 'mpesa'),
  -- Bank donations (6)
  ('don-031', 'demo-campaign-nakuru-2026', 'Ochieng Otieno', '+254723456789', 150000, NULL, false, 'verified', 'compliant', NULL, '2026-02-26T14:15:00Z', 'RCP-2026-0002', 'bank'),
  ('don-032', 'demo-campaign-nakuru-2026', 'Kipchoge Ruto', '+254767890123', 180000, NULL, false, 'verified', 'compliant', NULL, '2026-02-21T15:45:00Z', 'RCP-2026-0007', 'bank'),
  ('don-033', 'demo-campaign-nakuru-2026', 'Omondi Juma', '+254789012345', 320000, NULL, false, 'verified', 'compliant', NULL, '2026-02-19T09:00:00Z', 'RCP-2026-0009', 'bank'),
  ('don-034', 'demo-campaign-nakuru-2026', 'Diana Kemunto', '+254711223344', 200000, NULL, false, 'verified', 'compliant', NULL, '2026-02-15T10:00:00Z', 'RCP-2026-0036', 'bank'),
  ('don-035', 'demo-campaign-nakuru-2026', 'Martin Githae', '+254722334455', 125000, NULL, false, 'verified', 'compliant', NULL, '2026-02-10T11:30:00Z', 'RCP-2026-0037', 'bank'),
  ('don-036', 'demo-campaign-nakuru-2026', 'Rebecca Wairimu', '+254733445566', 85000, NULL, false, 'verified', 'compliant', NULL, '2026-02-05T14:00:00Z', 'RCP-2026-0038', 'bank'),
  -- Cash donations (4, including 1 anonymous violation)
  ('don-037', 'demo-campaign-nakuru-2026', 'Mutua Kioko', '+254745678901', 100000, NULL, false, 'verified', 'compliant', NULL, '2026-02-23T10:00:00Z', 'RCP-2026-0005', 'cash'),
  ('don-038', 'demo-campaign-nakuru-2026', NULL, NULL, 8000, NULL, true, 'failed', 'violation', 'Anonymous donation exceeds KES 5,000 ECFA threshold', '2026-02-24T16:20:00Z', 'RCP-2026-0004', 'cash'),
  ('don-039', 'demo-campaign-nakuru-2026', 'Paul Njenga', '+254744556677', 3500, NULL, false, 'verified', 'compliant', NULL, '2026-02-16T09:00:00Z', 'RCP-2026-0039', 'cash'),
  ('don-040', 'demo-campaign-nakuru-2026', NULL, NULL, 4800, NULL, true, 'verified', 'compliant', NULL, '2026-02-12T11:00:00Z', 'RCP-2026-0040', 'cash')
ON CONFLICT (id) DO NOTHING;

-- 7. Incidents (~10)
INSERT INTO incidents (id, campaign_id, title, description, severity, status, reported_by, reported_at, location)
VALUES
  ('inc-001', 'demo-campaign-nakuru-2026', 'Voter intimidation near Naivasha polling station', 'Unauthorized persons blocking access to polling station entrance.', 'high', 'investigating', 'demo-user-jane-wanjiku', '2026-02-18T14:45:00Z', 'Naivasha Primary School'),
  ('inc-002', 'demo-campaign-nakuru-2026', 'Unauthorized campaign spending - Molo rally', 'Vendor invoice for rally catering exceeds approved budget by 40%.', 'medium', 'resolved', 'demo-user-jane-wanjiku', '2026-02-20T10:00:00Z', 'Molo Township'),
  ('inc-003', 'demo-campaign-nakuru-2026', 'Campaign vehicle accident - Gilgil', 'Minor accident involving branded campaign vehicle on A104 highway.', 'medium', 'resolved', 'demo-user-jane-wanjiku', '2026-02-15T16:30:00Z', 'A104 Gilgil'),
  ('inc-004', 'demo-campaign-nakuru-2026', 'Agent phone stolen at Njoro event', 'Field agent reporting phone stolen during crowded campaign event.', 'low', 'resolved', 'demo-user-jane-wanjiku', '2026-02-08T18:00:00Z', 'Njoro Farmers Market'),
  ('inc-005', 'demo-campaign-nakuru-2026', 'Suspicious receipt flagged - print vendor', 'Receipt from Sign Africa Ltd shows inflated pricing compared to market rate.', 'high', 'investigating', 'demo-user-jane-wanjiku', '2026-02-23T13:20:00Z', 'Nakuru HQ'),
  ('inc-006', 'demo-campaign-nakuru-2026', 'Opposition leaflets distributed at rally', 'Opposition campaign materials found being distributed inside campaign event venue.', 'medium', 'open', 'demo-user-jane-wanjiku', '2026-02-25T11:00:00Z', 'Afraha Stadium'),
  ('inc-007', 'demo-campaign-nakuru-2026', 'M-Pesa reconciliation discrepancy', 'KES 15,000 difference between M-Pesa statement and recorded donations.', 'high', 'investigating', 'demo-user-jane-wanjiku', '2026-02-27T09:00:00Z', 'Finance Office'),
  ('inc-008', 'demo-campaign-nakuru-2026', 'Generator failure at Subukia rally', 'Backup generator failed during evening rally, disrupting PA system.', 'low', 'resolved', 'demo-user-jane-wanjiku', '2026-02-19T19:30:00Z', 'Subukia Community Centre'),
  ('inc-009', 'demo-campaign-nakuru-2026', 'Anonymous donation ECFA violation', 'Anonymous cash donation of KES 8,000 recorded exceeding KES 5,000 threshold.', 'high', 'open', 'demo-user-jane-wanjiku', '2026-02-24T17:00:00Z', 'Nakuru HQ'),
  ('inc-010', 'demo-campaign-nakuru-2026', 'Agent deployment overlap in Bahati', 'Two agents assigned to same polling station creating confusion.', 'low', 'resolved', 'demo-user-jane-wanjiku', '2026-02-22T08:00:00Z', 'Bahati Primary School')
ON CONFLICT (id) DO NOTHING;

-- 8. Audit Log (~15 entries)
INSERT INTO audit_log (id, campaign_id, user_id, action, table_name, record_id, created_at)
VALUES
  ('aud-001', 'demo-campaign-nakuru-2026', 'demo-user-jane-wanjiku', 'INSERT', 'transactions', 'txn-001', '2026-02-25T10:00:00Z'),
  ('aud-002', 'demo-campaign-nakuru-2026', 'demo-user-jane-wanjiku', 'INSERT', 'transactions', 'txn-011', '2026-02-23T14:00:00Z'),
  ('aud-003', 'demo-campaign-nakuru-2026', 'demo-user-jane-wanjiku', 'INSERT', 'agents', 'agt-001', '2026-02-15T08:00:00Z'),
  ('aud-004', 'demo-campaign-nakuru-2026', 'demo-user-jane-wanjiku', 'INSERT', 'agents', 'agt-008', '2026-02-16T09:00:00Z'),
  ('aud-005', 'demo-campaign-nakuru-2026', 'demo-user-jane-wanjiku', 'UPDATE', 'agents', 'agt-001', '2026-02-27T06:42:00Z'),
  ('aud-006', 'demo-campaign-nakuru-2026', 'demo-user-jane-wanjiku', 'INSERT', 'evidence_items', 'ev-001', '2026-02-15T09:35:00Z'),
  ('aud-007', 'demo-campaign-nakuru-2026', 'demo-user-jane-wanjiku', 'UPDATE', 'evidence_items', 'ev-001', '2026-02-15T11:00:00Z'),
  ('aud-008', 'demo-campaign-nakuru-2026', 'demo-user-jane-wanjiku', 'INSERT', 'donations', 'don-001', '2026-02-27T09:35:00Z'),
  ('aud-009', 'demo-campaign-nakuru-2026', 'demo-user-jane-wanjiku', 'INSERT', 'donations', 'don-031', '2026-02-26T14:20:00Z'),
  ('aud-010', 'demo-campaign-nakuru-2026', 'demo-user-jane-wanjiku', 'INSERT', 'incidents', 'inc-001', '2026-02-18T15:00:00Z'),
  ('aud-011', 'demo-campaign-nakuru-2026', 'demo-user-jane-wanjiku', 'UPDATE', 'incidents', 'inc-002', '2026-02-21T09:00:00Z'),
  ('aud-012', 'demo-campaign-nakuru-2026', 'demo-user-jane-wanjiku', 'UPDATE', 'transactions', 'txn-008', '2026-02-17T10:00:00Z'),
  ('aud-013', 'demo-campaign-nakuru-2026', 'demo-user-jane-wanjiku', 'INSERT', 'evidence_items', 'ev-004', '2026-02-18T15:00:00Z'),
  ('aud-014', 'demo-campaign-nakuru-2026', 'demo-user-jane-wanjiku', 'UPDATE', 'evidence_items', 'ev-004', '2026-02-18T16:00:00Z'),
  ('aud-015', 'demo-campaign-nakuru-2026', 'demo-user-jane-wanjiku', 'INSERT', 'agents', 'agt-021', '2026-02-26T14:00:00Z')
ON CONFLICT (id) DO NOTHING;
