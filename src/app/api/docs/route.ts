import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Minimal OpenAPI JSON describing our REST API surface
export async function GET() {
  const spec = {
    openapi: "3.0.3",
    info: {
      title: "App API",
      version: "1.0.0",
    },
    paths: {
      "/api/health": {
        get: { summary: "Health check", responses: { "200": { description: "OK" } } },
      },
      "/api/series": {
        get: {
          summary: "List/search series",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
            { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
            { name: "q", in: "query", schema: { type: "string" } },
            { name: "slug", in: "query", schema: { type: "string" } },
          ],
          responses: { "200": { description: "List of series" } },
        },
        post: {
          summary: "Create series",
          requestBody: { required: true },
          responses: { "201": { description: "Created" }, "409": { description: "Slug exists" } },
        },
      },
      "/api/series/{slug}": {
        get: { summary: "Get series by slug", parameters: [{ name: "slug", in: "path", required: true }], responses: { "200": { description: "Series" }, "404": { description: "Not found" } } },
        patch: { summary: "Update series", parameters: [{ name: "slug", in: "path", required: true }], requestBody: { required: true }, responses: { "200": { description: "Updated" } } },
        delete: { summary: "Delete series", parameters: [{ name: "slug", in: "path", required: true }], responses: { "200": { description: "Deleted" } } },
      },
      "/api/chapters": {
        get: {
          summary: "List chapters for a series",
          parameters: [
            { name: "seriesId", in: "query", required: true, schema: { type: "integer" } },
            { name: "page", in: "query", schema: { type: "integer" } },
            { name: "pageSize", in: "query", schema: { type: "integer" } },
          ],
          responses: { "200": { description: "List of chapters" } },
        },
      },
      "/api/chapters/{id}/mark-read": {
        post: { summary: "Mark chapter read", parameters: [{ name: "id", in: "path", required: true }], responses: { "200": { description: "OK" } } },
      },
      "/api/chapters/{id}/mark-unread": {
        post: { summary: "Mark chapter unread", parameters: [{ name: "id", in: "path", required: true }], responses: { "200": { description: "OK" } } },
      },
      "/api/comments": {
        get: {
          summary: "List comments",
          parameters: [
            { name: "seriesId", in: "query", schema: { type: "integer" } },
            { name: "threadId", in: "query", schema: { type: "integer" } },
            { name: "page", in: "query", schema: { type: "integer" } },
            { name: "pageSize", in: "query", schema: { type: "integer" } },
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CommentListResponse" }
                }
              }
            }
          },
        },
        post: {
          summary: "Create comment",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    seriesId: { type: "integer" },
                    threadId: { type: "integer" },
                    parentId: { type: "integer" },
                    content: { type: "string", maxLength: 2000 },
                  },
                  required: ["seriesId", "content"],
                },
              },
            },
          },
          responses: { "201": { description: "Created" }, "429": { description: "Too Many Requests" } },
        },
      },
      "/api/comments/stream": {
        get: { summary: "Realtime comments (SSE)", responses: { "200": { description: "Event stream" } } },
      },
      "/api/comments/{id}": {
        patch: { summary: "Edit comment", parameters: [{ name: "id", in: "path", required: true }], requestBody: { required: true }, responses: { "200": { description: "Updated" } } },
        delete: { summary: "Delete comment", parameters: [{ name: "id", in: "path", required: true }], responses: { "200": { description: "Deleted" } } },
      },
      "/api/comments/{id}/react": {
        post: { summary: "React to comment", parameters: [{ name: "id", in: "path", required: true }], requestBody: { required: true }, responses: { "200": { description: "OK" } } },
      },
      "/api/threads": {
        get: {
          summary: "List threads for a series",
          parameters: [
            { name: "seriesId", in: "query", schema: { type: "integer", minimum: 1 } },
            { name: "slug", in: "query", schema: { type: "string" } },
            { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
            { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } }
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ThreadListResponse" }
                }
              }
            },
            "400": { description: "Bad request" },
            "404": { description: "Series not found for provided slug" }
          }
        },
        post: {
          summary: "Create thread",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ThreadCreateBody" }
              }
            }
          },
          responses: {
            "201": {
              description: "Created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Thread" }
                }
              }
            },
            "400": { description: "Validation error" },
            "401": { description: "Unauthorized" },
            "404": { description: "Series not found" }
          }
        }
      },
      "/api/threads/{id}/pin": {
        post: { summary: "Pin/unpin thread", parameters: [{ name: "id", in: "path", required: true }], requestBody: { required: true }, responses: { "200": { description: "OK" } } },
      },
      "/api/reports": {
        get: {
          summary: "List reports (admin)",
          parameters: [
            { name: "status", in: "query", schema: { type: "string", enum: ["open", "reviewing", "resolved", "rejected"] } },
            { name: "seriesId", in: "query", schema: { type: "integer", minimum: 1 } },
            { name: "commentId", in: "query", schema: { type: "integer", minimum: 1 } },
            { name: "threadId", in: "query", schema: { type: "integer", minimum: 1 } },
            { name: "type", in: "query", schema: { type: "string", enum: ["series", "comment", "thread"] } }
          ],
          responses: { "200": { description: "OK" }, "403": { description: "Forbidden" } }
        },
        post: {
          summary: "Create report",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateReportBody" }
              }
            }
          },
          responses: { "201": { description: "Created" }, "401": { description: "Unauthorized" }, "429": { description: "Too Many Requests" } }
        },
        patch: {
          summary: "Update report status (admin)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "integer", minimum: 1 },
                    status: { type: "string", enum: ["open", "reviewing", "resolved", "rejected"] }
                  },
                  required: ["id", "status"]
                }
              }
            }
          },
          responses: {
            "200": { description: "Updated" },
            "400": { description: "Validation error" },
            "401": { description: "Unauthorized" },
            "403": { description: "Forbidden" },
            "404": { description: "Not found" },
            "429": { description: "Too Many Requests" }
          }
        }
      },
      "/api/sources": {
        get: { summary: "List sources", responses: { "200": { description: "OK" } } },
      },
      // ... keep existing paths ...
      "/api/sources/{id}/trust": {
        patch: {
          summary: "Update source trust score",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SourceTrustBody" }
              }
            }
          },
          responses: {
            "200": {
              description: "Updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SourceTrustResponse" }
                }
              }
            },
            "400": { description: "Validation error" },
            "401": { description: "Unauthorized" },
            "404": { description: "Source not found" }
          }
        }
      },
      "/api/sources/{id}/sync": {
        post: {
          summary: "Trigger source sync",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } }
          ],
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SourceSyncBody" }
              }
            }
          },
          responses: {
            "200": {
              description: "Queued",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/SourceSyncResponse" }
                }
              }
            },
            "401": { description: "Unauthorized" },
            "404": { description: "Source not found" }
          }
        }
      },
      "/api/subscriptions": {
        get: { summary: "Get current user's subscription", responses: { "200": { description: "OK" }, "401": { description: "Auth required" } } },
        patch: { summary: "Change plan (stub)", requestBody: { required: true }, responses: { "200": { description: "OK" } } },
      },
      "/api/admin": {
        get: { summary: "Admin dashboard stats", responses: { "200": { description: "OK" }, "403": { description: "Forbidden" } } },
      },
      "/api/series/{slug}/comments": {
        get: {
          summary: "List comments for a series",
          parameters: [
            { name: "slug", in: "path", required: true, schema: { type: "string" } },
            { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
            { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
            { name: "threadId", in: "query", schema: { type: "integer", minimum: 1 } },
          ],
          responses: {
            "200": {
              description: "OK",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CommentListResponse" }
                }
              }
            },
            "404": { description: "Series not found" }
          },
        },
        post: {
          summary: "Create comment for a series",
          parameters: [
            { name: "slug", in: "path", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    content: { type: "string", maxLength: 2000 },
                    threadId: { type: "integer", minimum: 1 },
                    parentId: { type: "integer", minimum: 1 },
                  },
                  required: ["content"],
                },
              },
            },
          },
          responses: { "201": { description: "Created" }, "401": { description: "Unauthorized" }, "404": { description: "Series/Thread not found" }, "429": { description: "Too Many Requests" } },
        },
      },
    },
    components: {
      schemas: {
        Thread: {
          type: "object",
          properties: {
            id: { type: "integer" },
            seriesId: { type: "integer" },
            title: { type: "string" },
            pinned: { type: "boolean" },
            createdBy: { type: "integer" },
            createdAt: { oneOf: [{ type: "string", format: "date-time" }, { type: "string" }, { type: "number" }] },
            updatedAt: { oneOf: [{ type: "string", format: "date-time" }, { type: "string" }, { type: "number" }] }
          },
          required: ["id", "seriesId", "title", "pinned", "createdBy", "createdAt"]
        },
        ThreadListResponse: {
          type: "object",
          properties: {
            data: { type: "array", items: { $ref: "#/components/schemas/Thread" } },
            total: { type: "integer" },
            page: { type: "integer" },
            pageSize: { type: "integer" }
          },
          required: ["data", "total", "page", "pageSize"]
        },
        ThreadCreateBody: {
          type: "object",
          properties: {
            seriesId: { type: "integer" },
            title: { type: "string", maxLength: 200 }
          },
          required: ["seriesId", "title"]
        },
        // ... keep existing schemas ...
        CreateReportBody: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["open", "reviewing", "resolved", "rejected"] },
            reason: { type: "string", maxLength: 500 },
            seriesId: { type: "integer" },
            commentId: { type: "integer" },
            threadId: { type: "integer" },
          },
          required: ["reason"]
        },
        AdminReport: {
          type: "object",
          properties: {
            id: { type: "integer" },
            status: { type: "string", enum: ["open", "reviewing", "resolved", "rejected"] },
            reason: { type: "string" },
            userId: { type: "integer" },
            seriesId: { type: "integer", nullable: true },
            commentId: { type: "integer", nullable: true },
            threadId: { type: "integer", nullable: true },
            createdAt: { oneOf: [{ type: "string", format: "date-time" }, { type: "string" }, { type: "number" }] }
          },
          required: ["id", "status", "userId", "createdAt"]
        },
        Source: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            domain: { type: "string" },
            apiType: { type: "string", enum: ["api", "scrape"] },
            verified: { type: "boolean" },
            legalRisk: { type: "string" },
            trustScore: { type: "integer", minimum: 0, maximum: 100 },
            enabled: { type: "boolean" },
            robotsAllowed: { type: "boolean" },
            tosSummary: { type: "string" },
            metadata: { type: "object", additionalProperties: true },
            lastChecked: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          },
          required: ["id", "name", "domain", "verified", "trustScore", "enabled"]
        },
        SourceTrustBody: {
          type: "object",
          properties: {
            trustScore: { type: "integer", minimum: 0, maximum: 100 }
          },
          required: ["trustScore"]
        },
        SourceTrustResponse: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            source: { $ref: "#/components/schemas/Source" }
          },
          required: ["ok", "source"]
        },
        SourceSyncBody: {
          type: "object",
          properties: {
            full: { type: "boolean" }
          }
        },
        SourceSyncResponse: {
          type: "object",
          properties: {
            ok: { type: "boolean" },
            job: {
              type: "object",
              properties: {
                id: { type: "string" },
                action: { type: "string", enum: ["sync"] },
                full: { type: "boolean" },
                status: { type: "string", enum: ["queued", "running", "completed", "failed"] },
                queuedAt: { oneOf: [{ type: "string", format: "date-time" }, { type: "number" }] }
              },
              required: ["id", "action", "status", "queuedAt"]
            }
          },
          required: ["ok", "job"]
        },
        Comment: {
          type: "object",
          properties: {
            id: { type: "integer" },
            seriesId: { type: "integer" },
            threadId: { type: "integer", nullable: true },
            parentId: { type: "integer", nullable: true },
            content: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { oneOf: [{ type: "string", format: "date-time" }, { type: "string" }, { type: "number" }], nullable: true }
          },
          required: ["id", "content", "createdAt"]
        },
        CommentListResponse: {
          type: "object",
          properties: {
            items: { type: "array", items: { $ref: "#/components/schemas/Comment" } },
            hasMore: { type: "boolean" }
          },
          required: ["items", "hasMore"]
        }
      }
    }
  } as const;

  return NextResponse.json(spec);
}