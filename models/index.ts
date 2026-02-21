import EmailMetadata from "./EmailMetadata";
import User from "./User";
import UserPreferences from "./UserPreferences";

User.hasMany(EmailMetadata, {
  foreignKey: "userId",
  sourceKey: "id",
  as: "emails",
  onDelete: "CASCADE",
});
EmailMetadata.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "id",
  as: "user",
});

User.hasOne(UserPreferences, {
  foreignKey: "userId",
  sourceKey: "id",
  as: "preferences",
  onDelete: "CASCADE",
});
UserPreferences.belongsTo(User, {
  foreignKey: "userId",
  targetKey: "id",
  as: "user",
});

export { User, EmailMetadata, UserPreferences };
