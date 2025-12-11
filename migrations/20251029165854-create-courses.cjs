'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('courses', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            course_title: {
                type: Sequelize.STRING(255),
                allowNull: false,
                unique: true,
            },
            sub_title: {
                type: Sequelize.STRING(255),
                allowNull: true,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            category: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            course_level: {
                type: Sequelize.ENUM('Beginner', 'Medium', 'Advanced'),
                allowNull: true,
            },
            course_price: {
                type: Sequelize.FLOAT,
                allowNull: true,
                defaultValue: 0, // ✅ Added default
            },
            course_thumbnail: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            is_published: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            course_type: { // ✅ Added missing field
                type: Sequelize.ENUM('free', 'paid'),
                allowNull: false,
                defaultValue: 'paid',
            },
            creator_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false, // ✅ Added
                defaultValue: Sequelize.fn('NOW'),
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false, // ✅ Added
                defaultValue: Sequelize.fn('NOW'),
            },
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('courses');
        // ✅ Drop both ENUM types
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_courses_course_level";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_courses_course_type";');
    },
};