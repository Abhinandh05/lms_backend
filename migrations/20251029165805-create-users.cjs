'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING(255),
                allowNull: false,
                unique: true,
            },
            phone: {
                type: Sequelize.STRING(20),
                allowNull: true,
                unique: false,
            },
            password: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            role: {
                type: Sequelize.ENUM('mentor', 'student', 'admin', 'superadmin'),
                allowNull: false,
                defaultValue: 'student',
            },
            selected_course_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            is_account_verified: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            verify_otp: {
                type: Sequelize.STRING,
                allowNull: true, // Changed
                defaultValue: null, // Changed
            },
            verify_otp_expires_at: {
                type: Sequelize.BIGINT,
                allowNull: true, // Changed
                defaultValue: null, // Changed
            },
            reset_otp: {
                type: Sequelize.STRING,
                allowNull: true, // Changed
                defaultValue: null, // Changed
            },
            reset_otp_expires_at: {
                type: Sequelize.BIGINT,
                allowNull: true, // Changed
                defaultValue: null, // Changed
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
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
    },
};