'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('user_forms', {
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
            },
            first_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            last_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: "User's email address",
            },
            phone_number: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: "User's phone number",
            },
            education_level: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: "Plus Two, Degree, Master's, Diploma, etc.",
            },
            education_details: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: null,
                comment: "Details like institution, field of study, year of completion",
            },
            current_course: {
                type: Sequelize.STRING,
                allowNull: false,
                comment: "Currently enrolled course/stack",
            },
            previous_courses: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: null,
                comment: "Array of previously completed courses in platform",
            },
            experience_level: {
                type: Sequelize.STRING,
                allowNull: true,
                comment: "Beginner, Intermediate, Advanced",
            },
            comments: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            last_edited_by: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'SET NULL',
                comment: "ID of mentor/admin who last edited",
            },
            edit_history: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: null,
                comment: "History of all edits made to this form",
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

        // Add indexes for better query performance
        await queryInterface.addIndex('user_forms', ['user_id'], {
            name: 'user_forms_user_id_index',
        });

        await queryInterface.addIndex('user_forms', ['email'], {
            name: 'user_forms_email_index',
        });

        await queryInterface.addIndex('user_forms', ['phone_number'], {
            name: 'user_forms_phone_number_index',
        });

        await queryInterface.addIndex('user_forms', ['current_course'], {
            name: 'user_forms_current_course_index',
        });

        await queryInterface.addIndex('user_forms', ['education_level'], {
            name: 'user_forms_education_level_index',
        });
    },

    async down(queryInterface, Sequelize) {
        // Drop indexes first
        await queryInterface.removeIndex('user_forms', 'user_forms_user_id_index');
        await queryInterface.removeIndex('user_forms', 'user_forms_email_index');
        await queryInterface.removeIndex('user_forms', 'user_forms_phone_number_index');
        await queryInterface.removeIndex('user_forms', 'user_forms_current_course_index');
        await queryInterface.removeIndex('user_forms', 'user_forms_education_level_index');

        // Drop table
        await queryInterface.dropTable('user_forms');
    },
};