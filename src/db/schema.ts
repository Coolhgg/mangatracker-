// Auth tables for better-auth
import { sqliteTable, integer, text, real, unique, index } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// Manga tracker application tables (integer PKs)
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  roles: text('roles', { mode: 'json' }).$type<string[]>().default([]),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const series = sqliteTable('series', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  coverImageUrl: text('cover_image_url'),
  sourceName: text('source_name'),
  sourceUrl: text('source_url'),
  tags: text('tags', { mode: 'json' }).$type<string[]>().default([]),
  rating: real('rating'),
  year: integer('year'),
  status: text('status'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  slugIdx: unique().on(table.slug),
}));

export const mangaChapters = sqliteTable('manga_chapters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  number: real('number').notNull(),
  title: text('title'),
  language: text('language').default('en'),
  publishedAt: text('published_at'),
  pages: integer('pages'),
  externalId: text('external_id'),
  sourceId: text('source_id'),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  // Ensure idempotent inserts in seed by enforcing uniqueness per (series, number)
  seriesNumberIdx: unique().on(table.seriesId, table.number),
}));

export const library = sqliteTable('library', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  status: text('status').default('reading'),
  rating: integer('rating'),
  notes: text('notes'),
  notifications: integer('notifications', { mode: 'boolean' }).default(true),
  lastReadChapterId: integer('last_read_chapter_id').references(() => mangaChapters.id),
  lastReadAt: text('last_read_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  userSeriesIdx: unique().on(table.userId, table.seriesId),
}));

export const progress = sqliteTable('progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  chapterId: integer('chapter_id').notNull().references(() => mangaChapters.id, { onDelete: 'cascade' }),
  currentPage: integer('current_page').default(0),
  completed: integer('completed', { mode: 'boolean' }).default(false),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  userSeriesChapterIdx: unique().on(table.userId, table.seriesId, table.chapterId),
}));

export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  seriesId: integer('series_id').notNull().references(() => series.id),
  parentId: integer('parent_id').references(() => comments.id),
  threadId: integer('thread_id'),
  content: text('content').notNull(),
  edited: integer('edited', { mode: 'boolean' }).default(false).notNull(),
  deleted: integer('deleted', { mode: 'boolean' }).default(false).notNull(),
  flagsCount: integer('flags_count').default(0).notNull(),
  createdAt: text('created_at').notNull(),
});

export const reactions = sqliteTable('reactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  commentId: integer('comment_id').notNull().references(() => comments.id),
  userId: integer('user_id').notNull().references(() => users.id),
  type: text('type').notNull(),
});

export const mangaComments = sqliteTable('manga_comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull(),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
});

export const mangaLibrary = sqliteTable('manga_library', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  status: text('status').default('reading'),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  userSeriesIdx: unique().on(table.userId, table.seriesId),
}));

export const readingProgress = sqliteTable('reading_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  chapterId: integer('chapter_id').notNull().references(() => mangaChapters.id, { onDelete: 'cascade' }),
  readAt: text('read_at').notNull(),
}, (table) => ({
  userChapterIdx: unique().on(table.userId, table.chapterId),
}));

export const mangaNotes = sqliteTable('manga_notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  body: text('body').notNull(),
  createdAt: text('created_at').notNull(),
});

export const mangaRatings = sqliteTable('manga_ratings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  value: integer('value').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  userSeriesIdx: unique().on(table.userId, table.seriesId),
}));

export const readingHistory = sqliteTable('reading_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
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

// Add minimal tables to satisfy API imports
export const subscriptions = sqliteTable('subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status').default('active'),
  productId: text('product_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const adminReports = sqliteTable('admin_reports', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // status enum as text
  status: text('status').default('open').notNull(), // open | reviewing | resolved | rejected
  reason: text('reason'),
  userId: integer('user_id').notNull().references(() => users.id),
  seriesId: integer('series_id').references(() => series.id),
  commentId: integer('comment_id').references(() => comments.id),
  threadId: integer('thread_id'),
  createdAt: text('created_at').notNull(),
});

// New: forum threads (migrate from Prisma model)
export const threads = sqliteTable('threads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  seriesId: integer('series_id').notNull().references(() => series.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  pinned: integer('pinned', { mode: 'boolean' }).default(false).notNull(),
  createdBy: integer('created_by').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// New: web push subscriptions for notifications
export const pushSubscriptions = sqliteTable('push_subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh'),
  auth: text('auth'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  endpointUnique: unique().on(table.endpoint),
}));

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
  // extras
  subscriptions,
  adminReports,
  // forum
  threads,
  // notifications
  pushSubscriptions,
};