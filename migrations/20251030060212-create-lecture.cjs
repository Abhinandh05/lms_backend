'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('lectures', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            lecture_title: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            video_url: {
                type: Sequelize.STRING(500),
                allowNull: true,
            },
            public_id: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            is_preview_free: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            // ✅ REMOVED course_id to match model
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
        await queryInterface.dropTable('lectures');
    },
};