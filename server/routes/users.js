const express = require('express');
const router = express.Router();

module.exports = (dataSource, db) => {
    // TypeORM routes
    // PUT /api/users/:userId (TypeORM version)
    router.put('/:userId', async (req, res) => {
        try {
            const userId = req.params.userId;
            const { username, email, roles, is_active } = req.body;

            // Get repositories
            const userRepository = dataSource.getRepository('User');

            // Find existing user with relations
            const existingUser = await userRepository.findOne({
                where: { user_id: userId },
                relations: ["roles"]
            });

            if (!existingUser) {
                return res.status(404).json({ error: 'User not found' });
            }

            // If email is being changed, check for duplicates
            if (email && email !== existingUser.email) {
                const duplicateEmail = await userRepository.findOne({
                    where: {
                        email: email,
                        user_id: Not(userId) // Exclude current user from check
                    }
                });

                if (duplicateEmail) {
                    return res.status(400).json({
                        error: 'This email address is already being used by another user'
                    });
                }
            }

            // Find roles if provided
            let roleEntities = [];
            if (roles && roles.length > 0) {
                const roleRepository = dataSource.getRepository("Role");
                roleEntities = await roleRepository
                    .createQueryBuilder("role")
                    .where("role.role_id IN (:...roles)", { roles })
                    .getMany();

                if (roleEntities.length !== roles.length) {
                    return res.status(400).json({ error: 'One or more invalid role IDs' });
                }
            }

            // Update user properties
            existingUser.username = username || existingUser.username;
            existingUser.email = email || existingUser.email;
            existingUser.is_active = is_active !== undefined ? is_active : existingUser.is_active;

            // Only update roles if new roles were provided
            if (roleEntities.length > 0) {
                existingUser.roles = roleEntities;
            }

            // Save updated user
            await userRepository.save(existingUser);

            // Fetch updated user with roles
            const updatedUser = await userRepository.findOne({
                where: { user_id: userId },
                relations: ["roles"]
            });

            // Return response
            res.json({
                user_id: updatedUser.user_id,
                username: updatedUser.username,
                email: updatedUser.email,
                is_active: updatedUser.is_active,
                roles: updatedUser.roles.map(role => role.role_id),
                role_names: updatedUser.roles.map(role => role.role_name),
                created_on: updatedUser.created_on,
                updated_on: updatedUser.updated_on
            });

        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Get all users api/users
    router.get('/', async (req, res) => {
        try {
            const userRepository = dataSource.getRepository(users);
            console.log('Fetching users with roles...');

            const users = await userRepository.find({
                relations: ["roles"],  // This includes the roles relationship
                select: {  // Specify which fields to return
                    user_id: true,
                    username: true,
                    email: true,
                    is_active: true,
                    created_on: true,
                    updated_on: true,
                    roles: {
                        role_id: true,
                        role_name: true
                    }
                }
            });
            console.log('Found users:', users.length);
            console.log('Sample user with roles:', JSON.stringify(users[0], null, 2));

            res.json(users);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: error.message });
        }
    });


    // Get user by ID api/users/:id
    router.get('/:id', (req, res) => {
        db.get('SELECT * FROM users WHERE user_id = ?', [req.params.id], (err, row) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            if (!row) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.json(row);
        });
    });



    // User creation endpoint api.users
    router.post('/', async (req, res) => {
        try {
            const { username, email, password, roles, is_active } = req.body;
            const user_id = uuidv4().substring(0, 8);

            console.log('Received user data:', { username, email, password, is_active, roles });

            if (!password) {
                return res.status(400).json({ error: 'Password is required' });
            }

            if (!roleRepository) {
                return res.status(500).json({ error: 'Database not initialized' });
            }

            const password_hash = await bcrypt.hash(password, 10);

            // Find roles using IN clause
            const roleEntities = await roleRepository
                .createQueryBuilder()
                .where("role_id IN (:...roles)", { roles })
                .getMany();

            console.log('Found roles:', roleEntities);

            if (roleEntities.length !== roles.length) {
                return res.status(400).json({ error: 'One or more invalid role IDs' });
            }

            // Create user with roles
            const user = userRepository.create({
                user_id,
                username,
                email,
                password_hash,
                is_active,
                roles: roleEntities
            });

            // Save user
            await userRepository.save(user);

            // Fetch saved user with roles
            const savedUser = await userRepository.findOne({
                where: { user_id: user_id },
                relations: ["roles"]
            });

            // Return response
            res.status(201).json({
                user_id: savedUser.user_id,
                username: savedUser.username,
                email: savedUser.email,
                is_active: savedUser.is_active,
                roles: savedUser.roles.map(role => role.role_id),
                role_names: savedUser.roles.map(role => role.role_name),
                created_on: savedUser.created_on,
                updated_on: savedUser.updated_on
            });

        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).json({ error: error.message });
        }
    });


    // DELETE /api/users/:id (SQLite version)
    router.delete('/:id', (req, res) => {
        const { id } = req.params;

        db.run(
            'DELETE FROM users WHERE user_id = ?',
            [id],
            function (err) {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                }
                if (this.changes === 0) {
                    res.status(404).json({ error: 'User not found' });
                    return;
                }
                res.status(200).json({ message: 'User deleted successfully' });
            }
        );
    });

    return router;
};
