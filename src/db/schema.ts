// Auth tables for better-auth
import { pgTable, serial, text, boolean, timestamp, integer, real, unique, index } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => new Date(),
  ),
});

// Manga tracker application tables (serial PKs for PostgreSQL)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  roles: text('roles').$type<string[]>().array().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const series = pgTable('series', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  coverImageUrl: text('cover_image_url'),
  sourceName: text('source_name'),
  sourceUrl: text('source_url'),
  tags: text('tags').$type<string[]>().array().default([]),
  rating: real('rating'),
  year: integer('year'),
  status: text('status'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const mangaChapters = pgTable('manga_chapters', {
  id: serial('id').primaryKey(),
  seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  number: real('number').notNull(),
  title: text('title'),
  language: text('language').default('en'),
  publishedAt: timestamp('published_at'),
  pages: integer('pages'),
  externalId: text('external_id'),
  sourceId: text('source_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  seriesNumberIdx: unique().on(table.seriesId, table.number),
}));

export const library = pgTable('library', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  status: text('status').default('reading'),
  rating: integer('rating'),
  notes: text('notes'),
  notifications: boolean('notifications').default(true),
  lastReadChapterId: integer('last_read_chapter_id').references(() => mangaChapters.id),
  lastReadAt: timestamp('last_read_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userSeriesIdx: unique().on(table.userId, table.seriesId),
}));

export const progress = pgTable('progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  chapterId: integer('chapter_id').notNull().references(() => mangaChapters.id, { onDelete: 'cascade' }),
  currentPage: integer('current_page').default(0),
  completed: boolean('completed').default(false),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userSeriesChapterIdx: unique().on(table.userId, table.seriesId, table.chapterId),
}));

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  seriesId: integer('series_id').notNull().references(() => series.id),
  parentId: integer('parent_id').references(() => comments.id),
  threadId: integer('thread_id'),
  content: text('content').notNull(),
  edited: boolean('edited').default(false).notNull(),
  deleted: boolean('deleted').default(false).notNull(),
  flagsCount: integer('flags_count').default(0).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const reactions = pgTable('reactions', {
  id: serial('id').primaryKey(),
  commentId: integer('comment_id').notNull().references(() => comments.id),
  userId: integer('user_id').notNull().references(() => users.id),
  type: text('type').notNull(),
});

export const mangaComments = pgTable('manga_comments', {
  id: serial('id').primaryKey(),
  seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const mangaLibrary = pgTable('manga_library', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  status: text('status').default('reading'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userSeriesIdx: unique().on(table.userId, table.seriesId),
}));

export const readingProgress = pgTable('reading_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  chapterId: integer('chapter_id').notNull().references(() => mangaChapters.id, { onDelete: 'cascade' }),
  readAt: timestamp('read_at').notNull().defaultNow(),
}, (table) => ({
  userChapterIdx: unique().on(table.userId, table.chapterId),
}));

export const mangaNotes = pgTable('manga_notes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  body: text('body').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const mangaRatings = pgTable('manga_ratings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  value: integer('value').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userSeriesIdx: unique().on(table.userId, table.seriesId),
}));

export const readingHistory = pgTable('reading_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  chapterId: integer('chapter_id').notNull().references(() => mangaChapters.id, { onDelete: 'cascade' }),
  readAt: integer('read_at').notNull(),
}, (table) => ({
  userIdx: index('reading_history_user_idx').on(table.userId),
  seriesIdx: index('reading_history_series_idx').on(table.seriesId),
  chapterIdx: index('reading_history_chapter_idx').on(table.chapterId),
  readAtIdx: index('reading_history_read_at_idx').on(table.readAt),
  userReadAtIdx: index('reading_history_user_read_at_idx').on(table.userId, table.readAt),
}));

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').default('active'),
  productId: text('product_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const adminReports = pgTable('admin_reports', {
  id: serial('id').primaryKey(),
  status: text('status').default('open').notNull(),
  reason: text('reason'),
  userId: integer('user_id').notNull().references(() => users.id),
  seriesId: integer('series_id').references(() => series.id),
  commentId: integer('comment_id').references(() => comments.id),
  threadId: integer('thread_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const threads = pgTable('threads', {
  id: serial('id').primaryKey(),
  seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  pinned: boolean('pinned').default(false).notNull(),
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const pushSubscriptions = pgTable('push_subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh'),
  auth: text('auth'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  endpointUnique: unique().on(table.endpoint),
}));

export const sources = pgTable('sources', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  domain: text('domain').notNull().unique(),
  apiType: text('api_type'),
  verified: boolean('verified').default(false).notNull(),
  legalRisk: text('legal_risk'),
  trustScore: integer('trust_score').default(50).notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  robotsAllowed: boolean('robots_allowed').default(true).notNull(),
  tosSummary: text('tos_summary'),
  metadata: text('metadata').$type<Record<string, any>>(),
  lastChecked: timestamp('last_checked'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const syncLogs = pgTable('sync_logs', {
  id: serial('id').primaryKey(),
  sourceId: integer('source_id').notNull().references(() => sources.id, { onDelete: 'cascade' }),
  status: text('status').notNull(),
  seriesSynced: integer('series_synced').default(0).notNull(),
  chaptersSynced: integer('chapters_synced').default(0).notNull(),
  errorMessage: text('error_message'),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  metadata: text('metadata').$type<Record<string, any>>(),
});

export const dmcaReports = pgTable('dmca_reports', {
  id: serial('id').primaryKey(),
  reporterName: text('reporter_name').notNull(),
  reporterEmail: text('reporter_email').notNull(),
  reporterOrganization: text('reporter_organization'),
  contentType: text('content_type').notNull(),
  contentUrl: text('content_url'), // nullable - this is correct
  complaintDetails: text('complaint_details').notNull(),
  status: text('status').default('pending').notNull(),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Provide aliases expected by some API routes
export { mangaChapters as chapters, library as libraries };

export const schema = { 
  user, 
  session, 
  account, 
  verification, 
  users,
  series,
  mangaChapters,
  library,
  progress,
  comments,
  reactions,
  mangaComments,
  mangaLibrary,
  readingProgress,
  mangaNotes,
  mangaRatings,
  readingHistory,
  subscriptions,
  adminReports,
  threads,
  pushSubscriptions,
  sources,
  syncLogs,
  dmcaReports,
};