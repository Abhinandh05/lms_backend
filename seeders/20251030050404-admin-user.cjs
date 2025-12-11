'use strict';

const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

module.exports = {
    async up(queryInterface, Sequelize) {
        console.log('Starting admin seed process...');

        try {
            // Check if admin already exists
            const [existingAdmins] = await queryInterface.sequelize.query(
                `SELECT email FROM users WHERE role = 'superadmin' LIMIT 1;`
            );

            if (existingAdmins.length > 0) {
                console.log('Super admin already exists:', existingAdmins[0].email);
                console.log('Skipping seed');
                return;
            }

            // Validate environment variables
            if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASS) {
                throw new Error('ADMIN_EMAIL and ADMIN_PASS must be set in .env file');
            }

            console.log(`Creating admin with email: ${process.env.ADMIN_EMAIL}`);

            // Hash password
            console.log('Hashing password...');
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS, 10);

            // Insert admin user
            console.log('Inserting super admin...');
            await queryInterface.bulkInsert('users', [
                {
                    name: 'Super Admin',
                    email: process.env.ADMIN_EMAIL,
                    password: hashedPassword,
                    role: 'superadmin',
                    verify_otp: '',
                    verify_otp_expires_at: 0,
                    reset_otp: '',
                    reset_otp_expires_at: 0,
                    selected_course_id: null,
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            ]);

            console.log('Super admin seeded successfully!');
            console.log(`Email: ${process.env.ADMIN_EMAIL}`);
            console.log(`Role: superadmin`);
        } catch (error) {
            console.error('Seeding failed:', error.message);
            throw error;
        }
    },

    async down(queryInterface, Sequelize) {
        console.log(' Removing super admin...');

        await queryInterface.bulkDelete('users', {
            role: 'superadmin'
        }, {});

        console.log('Super admin removed');
    }
};