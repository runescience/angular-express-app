# Get all roles
curl -X GET http://localhost:3000/api/roles

# Create a new role
curl -X POST http://localhost:3000/api/roles \
-H "Content-Type: application/json" \
-d '{
    "role_name": "Admin",
    "description": "Administrator role with full access",
    "is_active": true
}'

# Retrieve a role by ID (replace <role_id> with the actual ID)
curl -X GET http://localhost:3000/api/roles/<role_id>

# Update a role by ID (replace <role_id> with the actual ID)
curl -X PUT http://localhost:3000/api/roles/<role_id> \
-H "Content-Type: application/json" \
-d '{
    "role_name": "Updated Role Name",
    "description": "Updated description",
    "is_active": false
}'

# Delete a role by ID (replace <role_id> with the actual ID)
curl -X DELETE http://localhost:3000/api/roles/<role_id>


