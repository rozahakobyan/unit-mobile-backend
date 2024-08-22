import { DataTypes, Model } from "sequelize";
import sequelize from "../services/sequelize.js";
import Users from "./Users.js";

class Posts extends Model {

}

Posts.init({
        id: {
            type: DataTypes.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        photos: {
            type: DataTypes.JSON,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'posts',
        modelName: 'posts'
    })

Posts.belongsTo(Users,
    {
        foreignKey: "userId",
        onDelete: "CASCADE",
        onUpdate: 'CASCADE',
    })
Users.hasMany(Posts,
    {
        foreignKey: 'userId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    });

export default Posts