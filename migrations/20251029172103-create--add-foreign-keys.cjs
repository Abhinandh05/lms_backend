'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Add foreign key constraint from users.selected_course_id to courses.id
        await queryInterface.addConstraint('users', {
            fields: ['selected_course_id'],
            type: 'foreign key',
            name: 'users_selected_course_id_fkey',
            references: {
                table: 'courses',
                field: 'id',
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        });
    },

    async down(queryInterface, Sequelize) {
        // Remove the foreign key constraint
        await queryInterface.removeConstraint('users', 'users_selected_course_id_fkey');
    },
};