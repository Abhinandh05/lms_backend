'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('enrollments', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            course_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'courses',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            granted_by: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            },
            enrollment_date: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW'),
            },
            expiry_date: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
            payment_status: {
                type: Sequelize.ENUM('pending', 'paid', 'free'),
                defaultValue: 'pending',
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW'),
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW'),
            },
        });

        // Add unique composite index for user_id and course_id
        await queryInterface.addIndex('enrollments', ['user_id', 'course_id'], {
            unique: true,
            name: 'unique_user_course_enrollment',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('enrollments');
        // Drop ENUM type
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_enrollments_payment_status";');
    },
};