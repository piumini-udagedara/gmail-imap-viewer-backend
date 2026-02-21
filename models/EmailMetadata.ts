import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

/**
 * Email metadata attributes interface
 * Defines the structure of an email record in the database
 */
interface EmailMetadataAttributes {
  id: number;
  userId: number;
  gmailMessageId: string;
  imapUid: number;
  threadId: string | null;
  fromEmail: string;
  toEmail: string;
  ccEmail: string | null;
  bccEmail: string | null;
  subject: string;
  snippet: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
  receivedAt: Date;
  folder: string;
  isRead: boolean;
  flags: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Creation attributes type
 * Makes optional fields that are auto-generated or nullable
 */
type EmailMetadataCreationAttributes = Optional<
  EmailMetadataAttributes,
  | "id"
  | "threadId"
  | "ccEmail"
  | "bccEmail"
  | "snippet"
  | "bodyText"
  | "bodyHtml"
  | "flags"
>;

/**
 * EmailMetadata model
 * Stores email data synced from Gmail IMAP
 */
class EmailMetadata
  extends Model<EmailMetadataAttributes, EmailMetadataCreationAttributes>
  implements EmailMetadataAttributes
{
  declare id: number;
  declare userId: number;
  declare gmailMessageId: string;
  declare imapUid: number;
  declare threadId: string | null;
  declare fromEmail: string;
  declare toEmail: string;
  declare ccEmail: string | null;
  declare bccEmail: string | null;
  declare subject: string;
  declare snippet: string | null;
  declare bodyText: string | null;
  declare bodyHtml: string | null;
  declare receivedAt: Date;
  declare folder: string;
  declare isRead: boolean;
  declare flags: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

/**
 * Initialize EmailMetadata model with schema definition
 * Defines table structure, field types, and indexes
 */
EmailMetadata.init(
  {
    // Primary key
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    // Foreign key to users table
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "user_id",
    },
    // Unique Gmail message identifier
    gmailMessageId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "gmail_message_id",
    },
    // IMAP UID for the message
    imapUid: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "imap_uid",
    },
    // Gmail thread identifier
    threadId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "thread_id",
    },
    // Email addresses
    fromEmail: {
      type: DataTypes.STRING(512),
      allowNull: false,
      field: "from_email",
    },
    toEmail: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "to_email",
    },
    ccEmail: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "cc_email",
    },
    bccEmail: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "bcc_email",
    },
    // Email content
    subject: {
      type: DataTypes.STRING(191),
      allowNull: false,
    },
    snippet: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    bodyText: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
      field: "body_text",
    },
    bodyHtml: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
      field: "body_html",
    },
    receivedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "received_at",
    },
    folder: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "INBOX",
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_read",
    },
    flags: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "email_metadata",
    modelName: "EmailMetadata",
    indexes: [
      {
        unique: true,
        fields: ["user_id", "gmail_message_id", "folder"],
      },
      {
        fields: ["user_id", "folder", "received_at"],
      },
      {
        fields: ["user_id", "subject"],
      },
      {
        fields: ["user_id", "from_email"],
      },
    ],
  },
);

export default EmailMetadata;
