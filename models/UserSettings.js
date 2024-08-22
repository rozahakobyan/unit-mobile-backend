import { DataTypes, Model, Op } from "sequelize";
import sequelize from "../services/sequelize.js";
import Users from "./Users.js";

class UserSettings extends Model {

    static async  removeExpiredRecoveryCodes(){
        try {
            const oneDayLeft = new Date(Date.now() - 24 * 60 * 60 * 1000); 
            await UserSettings.destroy({
                where: {
                    createdAt: { [Op.lt]: oneDayLeft }
                }
            });
           
        } catch (error) {
            console.error('Error removing expired recovery codes:', error);
        }
    }

 }

UserSettings.init({
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    recoveryCode: {
        type: DataTypes.INTEGER(6),
        allowNull: false
    }
},
    {
        sequelize,
        tableName: 'usersettings',
        modelName: 'usersettings'
    })

UserSettings.belongsTo(Users,
    {
        foreignKey: "userId",
        onDelete: "CASCADE",
        onUpdate: 'CASCADE',
    });
Users.hasMany(UserSettings, { foreignKey: "userId" });

export default UserSettings;