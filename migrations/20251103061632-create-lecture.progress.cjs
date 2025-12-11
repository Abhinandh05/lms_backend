'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('lecture_progress', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            course_progress_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'course_progress',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            lecture_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'lectures',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            viewed: {
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

        // Optional: Add composite index to prevent duplicate progress entries
        await queryInterface.addIndex('lecture_progress', ['course_progress_id', 'lecture_id'], {
            unique: true,
            name: 'unique_course_progress_lecture',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('lecture_progress');
    },
};