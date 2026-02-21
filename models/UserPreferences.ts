import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface UserPreferencesAttributes {
  id: number;
  userId: number;
  defaultFolder: string;
  pageSize: number;
  updatedAt?: Date;
  createdAt?: Date;
}

type UserPreferencesCreationAttributes = Optional<
  UserPreferencesAttributes,
  "id"
>;

class UserPreferences
  extends Model<UserPreferencesAttributes, UserPreferencesCreationAttributes>
  implements UserPreferencesAttributes
{
  declare id: number;
  declare userId: number;
  declare defaultFolder: string;
  declare pageSize: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

UserPreferences.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
      field: "user_id",
    },
    defaultFolder: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "INBOX",
      field: "default_folder",
    },
    pageSize: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 20,
      field: "page_size",
      validate: {
        min: 5,
        max: 100,
      },
    },
  },
  {
    sequelize,
    tableName: "user_preferences",
    modelName: "UserPreferences",
  },
);

export default UserPreferences;
