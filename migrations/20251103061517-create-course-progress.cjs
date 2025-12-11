'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('course_progress', {
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
            completed: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
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

        // Add unique composite index to prevent duplicate progress entries
        await queryInterface.addIndex('course_progress', ['user_id', 'course_id'], {
            unique: true,
            name: 'unique_user_course_progress',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('course_progress');
    },
};