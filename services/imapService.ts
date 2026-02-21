import Imap from "imap";
import { simpleParser } from "mailparser";
import { Op } from "sequelize";
import { createOAuthClient } from "../config/passport";
import { AppError } from "../middleware/errorHandle";
import EmailMetadata from "../models/EmailMetadata";
import User from "../models/User";

interface ParsedEmail {
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
}

// Normalizes mailparser address-like objects into a readable comma-separated string.
const addressText = (value: unknown): string | null => {
  if (!value) {
    return null;
  }
  if (Array.isArray(value)) {
    return (
      value
        .map((entry) => {
          if (entry && typeof entry === "object" && "text" in entry) {
            return String((entry as { text?: string }).text || "");
          }
          return "";
        })
        .filter(Boolean)
        .join(", ") || null
    );
  }
  if (
    typeof value === "object" &&
    "text" in (value as Record<string, unknown>)
  ) {
    return String((value as { text?: string }).text || "") || null;
  }
  return null;
};

class EmailService {
  // Returns a non-expired Google access token, refreshing with stored refresh token if needed.
  private async ensureValidAccessToken(user: User): Promise<string> {
    const now = Date.now();
    const expiry = user.tokenExpiry ? new Date(user.tokenExpiry).getTime() : 0;

    if (user.accessToken && expiry > now + 60_000) {
      return user.accessToken;
    }

    if (!user.refreshToken) {
      throw new AppError(
        "Missing refresh token. Re-authentication is required.",
        401,
      );
    }

    try {
      const oauthClient = createOAuthClient();
      oauthClient.setCredentials({ refresh_token: user.refreshToken });
      const refreshed = await oauthClient.refreshAccessToken();
      const credentials = refreshed.credentials;

      if (!credentials.access_token) {
        throw new AppError("Could not refresh access token", 401);
      }

      user.accessToken = credentials.access_token;
      if (credentials.expiry_date) {
        user.tokenExpiry = new Date(credentials.expiry_date);
      }
      await user.save();

      return user.accessToken;
    } catch (error) {
      throw new AppError(
        "Failed to refresh access token. Please log out and sign in again.",
        401,
      );
    }
  }

  // Builds SASL XOAUTH2 payload required by Gmail IMAP authentication.
  private buildXOAuth2(email: string, accessToken: string): string {
    return Buffer.from(
      `user=${email}\u0001auth=Bearer ${accessToken}\u0001\u0001`,
    ).toString("base64");
  }

  // Establishes an authenticated TLS IMAP connection to Gmail.
  private connectImap(userEmail: string, xoauth2: string): Promise<Imap> {
    return new Promise((resolve, reject) => {
      const imap = new Imap({
        user: userEmail,
        password: "",
        xoauth2,
        host: "imap.gmail.com",
        port: 993,
        tls: true,
        tlsOptions: {
          servername: "imap.gmail.com",
        },
      });

      imap.once("ready", () => resolve(imap));
      imap.once("error", (error: Error) => {
        const errorMessage = error.message.toLowerCase();
        if (
          errorMessage.includes("invalid credentials") ||
          errorMessage.includes("authentication failed")
        ) {
          reject(
            new AppError(
              "Gmail authentication failed. Please log out and sign in again to refresh your credentials.",
              401,
            ),
          );
        } else {
          reject(new AppError(error.message, 400));
        }
      });
      imap.connect();
    });
  }

  // Opens a mailbox in read-only mode.
  private openBox(imap: Imap, folder: string): Promise<Imap.Box> {
    return new Promise((resolve, reject) => {
      imap.openBox(folder, true, (error, box) => {
        if (error) {
          reject(new AppError(`Unable to open folder ${folder}`, 400));
          return;
        }
        resolve(box);
      });
    });
  }

  private async fetchLatestMessages(
    imap: Imap,
    folder: string,
    limit: number,
  ): Promise<ParsedEmail[]> {
    // Resolve sequence range to fetch the newest `limit` messages.
    const box = await this.openBox(imap, folder);
    const total = box.messages.total;
    if (total === 0) {
      return [];
    }

    const start = Math.max(1, total - limit + 1);
    const sequenceRange = `${start}:${total}`;

    return new Promise((resolve, reject) => {
      const emails: ParsedEmail[] = [];
      // Track async parsing completion per message before resolving the fetch.
      const pendingMessages = new Set<number>();
      let fetcherEnded = false;

      const tryResolve = () => {
        if (fetcherEnded && pendingMessages.size === 0) {
          emails.sort(
            (a, b) => b.receivedAt.getTime() - a.receivedAt.getTime(),
          );
          resolve(emails);
        }
      };

      const fetcher = imap.seq.fetch(sequenceRange, {
        bodies: "",
        struct: true,
      });

      fetcher.on("message", (message, sequenceNumber) => {
        pendingMessages.add(sequenceNumber);
        let attributes: Imap.ImapMessageAttributes | null = null;
        let rawBody = "";

        message.on("body", (stream) => {
          stream.on("data", (chunk: Buffer) => {
            rawBody += chunk.toString("utf8");
          });
        });

        message.once("attributes", (attrs) => {
          attributes = attrs;
        });

        message.once("end", () => {
          // Process message asynchronously but track completion
          (async () => {
            try {
              if (!attributes) {
                return;
              }

              const parsed = await simpleParser(rawBody);
              const fromEmail = addressText(parsed.from) || "Unknown";
              const toEmail = addressText(parsed.to) || "";
              const ccEmail = addressText(parsed.cc);
              const bccEmail = addressText(parsed.bcc);
              const subject = parsed.subject || "(No subject)";
              const text = parsed.text || null;
              const html = typeof parsed.html === "string" ? parsed.html : null;

              const rawAttributes = attributes as Imap.ImapMessageAttributes & {
                "x-gm-msgid"?: string | number;
                "x-gm-thrid"?: string | number;
              };

              // Prefer Gmail message/thread IDs when available for stable deduplication.
              emails.push({
                gmailMessageId: rawAttributes["x-gm-msgid"]
                  ? String(rawAttributes["x-gm-msgid"])
                  : `${folder}-${attributes.uid}`,
                imapUid: attributes.uid,
                threadId: rawAttributes["x-gm-thrid"]
                  ? String(rawAttributes["x-gm-thrid"])
                  : null,
                fromEmail,
                toEmail,
                ccEmail,
                bccEmail,
                subject,
                snippet: text ? text.slice(0, 200) : null,
                bodyText: text,
                bodyHtml: html,
                receivedAt: parsed.date || new Date(),
                folder,
                isRead: Boolean(attributes.flags?.includes("\\Seen")),
                flags: attributes.flags?.join(",") || null,
              });
            } catch (error) {
              // Log error but don't reject entire promise
              console.error(`Error parsing message ${sequenceNumber}:`, error);
            } finally {
              pendingMessages.delete(sequenceNumber);
              tryResolve();
            }
          })();
        });
      });

      fetcher.once("error", (error) =>
        reject(new AppError(error.message, 500)),
      );
      fetcher.once("end", () => {
        fetcherEnded = true;
        tryResolve();
      });
    });
  }

  async syncEmails(
    userId: number,
    folder = "INBOX",
    limit = 50,
  ): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const accessToken = await this.ensureValidAccessToken(user);
    const xoauth2 = this.buildXOAuth2(user.email, accessToken);
    const imap = await this.connectImap(user.email, xoauth2);

    try {
      // Upsert keeps metadata current without duplicating previously synced messages.
      const emails = await this.fetchLatestMessages(imap, folder, limit);
      await Promise.all(
        emails.map((email) =>
          EmailMetadata.upsert({
            userId,
            ...email,
          }),
        ),
      );
    } finally {
      imap.end();
    }
  }

  async getEmails(userId: number, page = 1, limit = 20, folder?: string) {
    const whereClause: {
      userId: number;
      folder?: string;
    } = { userId };

    if (folder) {
      whereClause.folder = folder;
    }

    const offset = (page - 1) * limit;
    // Return newest-first paginated results for mailbox browsing.
    const { rows, count } = await EmailMetadata.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["receivedAt", "DESC"]],
    });

    return {
      emails: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async searchEmails(userId: number, query: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    // Search common preview fields and keep results paginated.
    const { rows, count } = await EmailMetadata.findAndCountAll({
      where: {
        userId,
        [Op.or]: [
          { subject: { [Op.like]: `%${query}%` } },
          { fromEmail: { [Op.like]: `%${query}%` } },
          { snippet: { [Op.like]: `%${query}%` } },
        ],
      },
      limit,
      offset,
      order: [["receivedAt", "DESC"]],
    });

    return {
      emails: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async getEmailById(userId: number, id: number) {
    return EmailMetadata.findOne({ where: { id, userId } });
  }

  async getFolders(userId: number): Promise<string[]> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const accessToken = await this.ensureValidAccessToken(user);
    const xoauth2 = this.buildXOAuth2(user.email, accessToken);
    const imap = await this.connectImap(user.email, xoauth2);

    try {
      const boxes = await new Promise<Imap.MailBoxes>((resolve, reject) => {
        imap.getBoxes((error, mailboxTree) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(mailboxTree);
        });
      });

      const folders: string[] = [];
      // Flatten nested mailbox tree into IMAP folder path names.
      const walkBoxes = (prefix: string, node: Imap.MailBoxes) => {
        Object.keys(node).forEach((name) => {
          const fullName = prefix ? `${prefix}${name}` : name;
          folders.push(fullName);
          const children = node[name].children;
          if (children) {
            const delimiter = node[name].delimiter || "/";
            walkBoxes(`${fullName}${delimiter}`, children);
          }
        });
      };

      walkBoxes("", boxes);
      return folders;
    } finally {
      imap.end();
    }
  }

  async getEmailStats(userId: number) {
    // Aggregate totals, unread counts, and per-folder message counts.
    const total = await EmailMetadata.count({ where: { userId } });
    const unread = await EmailMetadata.count({
      where: {
        userId,
        isRead: false,
      },
    });
    const folderCounts = await EmailMetadata.findAll({
      where: { userId },
      attributes: [
        "folder",
        [
          EmailMetadata.sequelize!.fn(
            "COUNT",
            EmailMetadata.sequelize!.col("id"),
          ),
          "count",
        ],
      ],
      group: ["folder"],
      order: [["folder", "ASC"]],
    });

    return {
      total,
      unread,
      folders: folderCounts,
    };
  }
}

export default new EmailService();
