const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Initialize database connection
const db = new Sequelize({
    dialect: 'sqlite', 
    storage: `./database/${process.env.DB_NAME || 'task_management.db'}`,
    logging: false
});

// User Model
const User = db.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING, // FIXED: Removed the stray 'n'
        allowNull: false
    },
    // IMPLEMENTED: Role field with validation (Step 11)
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'employee',
        validate: {
            // This ensures only these three strings can be saved
            isIn: [['employee', 'manager', 'admin']] 
        }
    }
});

// Project Model
const Project = db.define('Project', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'active'
    }
});

// Task Model
const Task = db.define('Task', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending'
    },
    priority: {
        type: DataTypes.STRING,
        defaultValue: 'medium'
    }
});

// --- RELATIONSHIPS ---
User.hasMany(Project, { foreignKey: 'managerId', as: 'managedProjects' });
Project.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });

Project.hasMany(Task, { foreignKey: 'projectId' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

User.hasMany(Task, { foreignKey: 'assignedUserId', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assignedUserId', as: 'assignedUser' });

// Export models
module.exports = {
    db,
    User,
    Project,
    Task
};