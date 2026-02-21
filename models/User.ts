import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface UserAttributes {
  id: number;
  googleId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  accessToken: string;
  refreshToken: string | null;
  tokenExpiry: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreationAttributes = Optional<
  UserAttributes,
  "id" | "avatarUrl" | "refreshToken" | "tokenExpiry"
>;

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: number;
  declare googleId: string;
  declare email: string;
  declare displayName: string;
  declare avatarUrl: string | null;
  declare accessToken: string;
  declare refreshToken: string | null;
  declare tokenExpiry: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    googleId: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: true,
      field: "google_id",
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    displayName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "display_name",
    },
    avatarUrl: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      field: "avatar_url",
    },
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "access_token",
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "refresh_token",
    },
    tokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "token_expiry",
    },
  },
  {
    sequelize,
    tableName: "users",
    modelName: "User",
    indexes: [
      { unique: true, fields: ["google_id"] },
      { unique: true, fields: ["email"] },
    ],
  },
);

export default User;
