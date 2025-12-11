import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Lecture = sequelize.define(
    "Lecture",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        lectureTitle: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        videoUrl: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        publicId: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        isPreviewFree: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        // REMOVED courseId - using many-to-many only
    },
    {
        tableName: "lectures",
        timestamps: true,
        underscored: true,
    }
);

export default Lecture;