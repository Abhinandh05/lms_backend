// config/swagger.config.js
import path from "path";
import { fileURLToPath } from "url";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "LMS API Documentation",
            version: "1.0.0",
            description: "API documentation for the Learning Management System (LMS)",
            contact: { name: "Abhinandh C" },
        },
        servers: [{ url: "http://localhost:8080" }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: [
        // your route folders
        path.resolve(__dirname, "../user/*.js"),
        path.resolve(__dirname, "../course/*.js"),
        path.resolve(__dirname, "../lecture/*.js"),
        path.resolve(__dirname, "../courseProgress/*.js"),

        // 👇 include this for separate Swagger files
        path.resolve(__dirname, "../swagger/*.js"),
    ],
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);
export { swaggerUi, swaggerSpec };
