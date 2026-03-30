const bcrypt = require('bcryptjs');
// Ensure this path matches where your setup.js is located
const { db, User, Project, Task } = require('./setup'); 

async function seedDatabase() {
    try {
        // 1. Sync and Reset the database
        // Force: true drops the tables and recreates them with the new 'role' column
        await db.sync({ force: true });
        console.log('Database reset successfully.');

        // 2. Hash Password once for all seed users
        const hashedPassword = await bcrypt.hash('password123', 10);

        // 3. Create Users with specific roles (Step 11 requirement)
        console.log('Creating users with roles...');
        const john = await User.create({
            name: 'John Employee',
            email: 'john@company.com',
            password: hashedPassword,
            role: 'employee' // Correctly assigned
        });

        const sarah = await User.create({
            name: 'Sarah Manager',
            email: 'sarah@company.com',
            password: hashedPassword,
            role: 'manager' // Correctly assigned
        });

        const mike = await User.create({
            name: 'Mike Admin',
            email: 'mike@company.com',
            password: hashedPassword,
            role: 'admin' // Correctly assigned
        });

        // 4. Create projects
        console.log('Creating projects...');
        const websiteProject = await Project.create({
            name: 'Website Redesign',
            description: 'Complete overhaul of company website',
            managerId: sarah.id,
            status: 'active'
        });

        const mobileProject = await Project.create({
            name: 'Mobile App Development',
            description: 'New mobile app for customers',
            managerId: sarah.id,
            status: 'active'
        });

        const dbProject = await Project.create({
            name: 'Database Migration',
            description: 'Migrate legacy database to new system',
            managerId: mike.id,
            status: 'planning'
        });

        // 5. Create tasks
        console.log('Creating tasks...');
        await Task.bulkCreate([
            {
                title: 'Design homepage mockup',
                description: 'Create wireframes and mockups for new homepage',
                projectId: websiteProject.id,
                assignedUserId: john.id,
                status: 'in-progress',
                priority: 'high'
            },
            {
                title: 'Set up development environment',
                description: 'Configure local development setup',
                projectId: mobileProject.id,
                assignedUserId: john.id,
                status: 'completed',
                priority: 'medium'
            },
            {
                title: 'Review database schema',
                description: 'Analyze current database structure',
                projectId: dbProject.id,
                assignedUserId: sarah.id,
                status: 'pending',
                priority: 'high'
            }
        ]);

        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        // Close the connection so the script exits properly
        await db.close();
    }
}

// Execute the seeding script
seedDatabase()
    .then(() => console.log("Seed process finished successfully."))
    .catch(err => console.error("Seed process failed:", err));