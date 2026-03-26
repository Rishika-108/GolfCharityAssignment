# Testing & QA Guide

## Running Tests

### Draw Engine Tests
```bash
node __tests__/drawEngine.test.js
```

Expected output:
```
✅ PASS: Match count: 2 matches from [5,10,15,20,25] vs [5,10,30,35,40]
✅ PASS: Match 5 gets 40% of pool
...
✅ All tests passed!
```

### Validation Tests
```bash
node __tests__/validation.test.js
```

Expected output:
```
✅ PASS: Valid email passes
✅ PASS: Invalid email fails
...
✅ All validation tests passed!
```

### Run All Tests
```bash
npm run test
```

## Integration Testing (Manual)

### 1. Registration & Subscription Flow
```bash
# Register user
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John Doe","email":"john@example.com","country":"US","charity_id":"<uuid>","contribution_percentage":15}'

# Create subscription
curl -X POST http://localhost:3000/api/subscription/create \
  -H "Content-Type: application/json" \
  -d '{"user_id":"<user_id>","plan_type":"monthly"}'
```

### 2. Score Entry & Management
```bash
# Add score
curl -X POST http://localhost:3000/api/scores \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"<user_id>","score":27,"played_at":"2026-03-20"}'

# List scores
curl "http://localhost:3000/api/scores?user_id=<user_id>" \
  -H "Authorization: Bearer <token>"
```

### 3. Draw Execution
```bash
# Run draw (admin only)
curl -X POST http://localhost:3000/api/draw/run \
  -H "x-admin-token: <ADMIN_API_TOKEN>"

# Simulate draw
curl -X POST http://localhost:3000/api/draw/simulate \
  -H "x-admin-token: <ADMIN_API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"draw_id":"<draw_id>"}'

# Finalize draw
curl -X POST http://localhost:3000/api/draw/finalize \
  -H "x-admin-token: <ADMIN_API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"draw_id":"<draw_id>"}'
```

### 4. Winner Workflow
```bash
# Upload proof
curl -X POST http://localhost:3000/api/winners/proof \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"winner_id":"<winner_id>","file_url":"https://..."}'

# Approve winner (admin)
curl -X PATCH http://localhost:3000/api/winners/review \
  -H "x-admin-token: <ADMIN_API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"winner_id":"<winner_id>","action":"approve"}'

# Payout
curl -X POST http://localhost:3000/api/winners/payout \
  -H "x-admin-token: <ADMIN_API_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"winner_id":"<winner_id>"}'
```

### 5. Reporting
```bash
# Get metrics
curl http://localhost:3000/api/reports/metrics

# Export winners as CSV
curl "http://localhost:3000/api/reports/export?report=winners&format=csv" > winners.csv

# Export charities as JSON
curl "http://localhost:3000/api/reports/export?report=charities&format=json"
```

## Security Testing

### Test Admin Token Validation
```bash
# Should fail (no token)
curl -X POST http://localhost:3000/api/draw/run

# Should fail (invalid token)
curl -X POST http://localhost:3000/api/draw/run \
  -H "x-admin-token: invalid"

# Should succeed
curl -X POST http://localhost:3000/api/draw/run \
  -H "x-admin-token: $ADMIN_API_TOKEN"
```

### Test User Token Validation
```bash
# Should fail (no token)
curl -X POST http://localhost:3000/api/scores

# Should fail (invalid format)
curl -X POST http://localhost:3000/api/scores \
  -H "Authorization: invalid"

# Should succeed with Bearer token
curl -X POST http://localhost:3000/api/scores \
  -H "Authorization: Bearer <valid_jwt_token>"
```

## Database Validation

### Check RLS Policies
```sql
-- Verify user can only see own data
select * from auth.authorization_override;

-- Test row-level security
select * from profiles where id != auth.uid(); -- Should be empty if RLS works
```

### Check Schema
```sql
-- Verify all tables exist
select table_name from information_schema.tables 
where table_schema = 'public' order by table_name;

-- Check constraints
select constraint_name, table_name from information_schema.table_constraints 
where table_schema = 'public' and constraint_type = 'CHECK';
```

## Performance Testing

### Load test draw execution
```bash
# Generate 100 concurrent requests
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/draw/run \
    -H "x-admin-token: $ADMIN_API_TOKEN" &
done
wait
```

### Query performance
```sql
-- Check score query speed (should be <100ms with index)
explain analyze
select * from scores where user_id = '<user_id>' 
order by played_at desc limit 5;
```

## Coverage Checklist

- [ ] Unit tests pass (draw engine, validation)
- [ ] API endpoints respond correctly
- [ ] Admin auth prevents unauthorized access
- [ ] User auth protects private data
- [ ] Score rolling works (max 5)
- [ ] Draw generation is deterministic
- [ ] Prize allocation matches business rules (40/35/25)
- [ ] Subscription statuses transition correctly
- [ ] Charity donations recorded accurately
- [ ] Reports export without errors
- [ ] RLS policies enforce ownership
- [ ] Stripe webhook integration tested
- [ ] Notifications log properly
- [ ] Admin logs capture actions

