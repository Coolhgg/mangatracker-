import { test, expect } from "@playwright/test";

// These tests validate the client-side auth pattern and UI behavior for the demo
// Components under test: CommentRatingDemo, RatingWidget, CommentForm
// Behavior expected when no bearer_token in localStorage: redirect to /login?redirect=<current-path>

test.describe("Comment & Rating Demo", () => {
  test("shows empty states before slug is entered", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Comment & Rating Demo" })).toBeVisible();

    await expect(page.getByText("Enter a slug to enable rating.")).toBeVisible();
    await expect(page.getByText("Enter a slug to enable comments.")).toBeVisible();
  });

  test("rating redirects unauthenticated users to /login with redirect back", async ({ page }) => {
    await page.goto("/");

    // Ensure no token
    await page.evaluate(() => localStorage.removeItem("bearer_token"));

    // Enter a slug
    const slugInput = page.getByPlaceholder("e.g. one-piece");
    await slugInput.fill("one-piece");

    // Click the first star (Rate 1 star)
    await page.getByRole("button", { name: "Rate 1 star" }).click();

    await expect(page).toHaveURL(/\/login\?redirect=%2F/);
  });

  test("comment submission redirects unauthenticated users to /login with redirect back", async ({ page }) => {
    await page.goto("/");

    // Ensure no token
    await page.evaluate(() => localStorage.removeItem("bearer_token"));

    // Enter a slug
    const slugInput = page.getByPlaceholder("e.g. one-piece");
    await slugInput.fill("one-piece");

    // Type a comment
    const textarea = page.getByRole("textbox", { name: "Add a comment" });
    await textarea.fill("This is a test comment.");

    // Submit
    await page.getByRole("button", { name: "Post comment" }).click();

    await expect(page).toHaveURL(/\/login\?redirect=%2F/);
  });

  // Authenticated flows with API stubbing
  test("rating succeeds for authenticated users and shows success message", async ({ page }) => {
    const token = "mock_token_123";
    let sawAuthHeader = false;
    let sawCorrectBody = false;

    // Stub the rating POST endpoint
    await page.route("**/api/series/**/rating", async (route) => {
      const req = route.request();
      const auth = req.headers()["authorization"];
      if (auth === `Bearer ${token}`) sawAuthHeader = true;
      try {
        const body = req.postDataJSON() as { rating?: number };
        if (body?.rating === 5) sawCorrectBody = true;
      } catch {}
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });

    await page.goto("/");

    // Inject token
    await page.evaluate((t) => localStorage.setItem("bearer_token", t), token);

    // Enter a slug and rate 5 stars
    const slugInput = page.getByPlaceholder("e.g. one-piece");
    await slugInput.fill("one-piece");

    await page.getByRole("button", { name: "Rate 5 stars" }).click();

    // Assert UI feedback and stub assertions
    await expect(page.getByText("Rating saved")).toBeVisible();
    expect(sawAuthHeader).toBeTruthy();
    expect(sawCorrectBody).toBeTruthy();
  });

  test("comment submission succeeds for authenticated users and clears input", async ({ page }) => {
    const token = "mock_token_456";
    let sawAuthHeader = false;
    let sawCorrectBody = false;
    let hitCorrectSeries = false;

    // Stub the comments POST endpoint
    await page.route("**/api/series/**/comments", async (route) => {
      const req = route.request();
      const url = req.url();
      if (url.includes("one-piece")) hitCorrectSeries = true;
      const auth = req.headers()["authorization"];
      if (auth === `Bearer ${token}`) sawAuthHeader = true;
      try {
        const body = req.postDataJSON() as { content?: string };
        if (body?.content === "This is a test comment.") sawCorrectBody = true;
      } catch {}
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });

    await page.goto("/");

    // Inject token
    await page.evaluate((t) => localStorage.setItem("bearer_token", t), token);

    // Enter slug and submit comment
    const slugInput = page.getByPlaceholder("e.g. one-piece");
    await slugInput.fill("one-piece");

    const textarea = page.getByRole("textbox", { name: "Add a comment" });
    await textarea.fill("This is a test comment.");
    await page.getByRole("button", { name: "Post comment" }).click();

    // Assert UI feedback (success message) and that textarea cleared
    await expect(page.getByText("Comment posted")).toBeVisible();
    await expect(textarea).toHaveValue("");

    // Assert stub expectations
    expect(hitCorrectSeries).toBeTruthy();
    expect(sawAuthHeader).toBeTruthy();
    expect(sawCorrectBody).toBeTruthy();
  });

  test("rating shows error on 401 and succeeds on retry", async ({ page }) => {
    const token = "mock_token_err_401";
    let calls = 0;

    await page.route("**/api/series/**/rating", async (route) => {
      calls++;
      if (calls === 1) {
        await route.fulfill({ status: 401, contentType: "text/plain", body: "Unauthorized" });
      } else {
        await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      }
    });

    await page.goto("/");
    await page.evaluate((t) => localStorage.setItem("bearer_token", t), token);

    const slugInput = page.getByPlaceholder("e.g. one-piece");
    await slugInput.fill("one-piece");

    await page.getByRole("button", { name: "Rate 4 stars" }).click();
    await expect(page.getByText("Unauthorized")).toBeVisible();

    await page.getByRole("button", { name: "Rate 4 stars" }).click();
    await expect(page.getByText("Rating saved")).toBeVisible();
  });

  test("rating shows error on 500 and succeeds on retry", async ({ page }) => {
    const token = "mock_token_err_500";
    let calls = 0;

    await page.route("**/api/series/**/rating", async (route) => {
      calls++;
      if (calls === 1) {
        await route.fulfill({ status: 500, contentType: "text/plain", body: "Server error" });
      } else {
        await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      }
    });

    await page.goto("/");
    await page.evaluate((t) => localStorage.setItem("bearer_token", t), token);

    const slugInput = page.getByPlaceholder("e.g. one-piece");
    await slugInput.fill("one-piece");

    await page.getByRole("button", { name: "Rate 5 stars" }).click();
    await expect(page.getByText("Server error")).toBeVisible();

    await page.getByRole("button", { name: "Rate 5 stars" }).click();
    await expect(page.getByText("Rating saved")).toBeVisible();
  });

  test("comment shows error on 401 and succeeds on retry", async ({ page }) => {
    const token = "mock_token_c401";
    let calls = 0;

    await page.route("**/api/series/**/comments", async (route) => {
      calls++;
      if (calls === 1) {
        await route.fulfill({ status: 401, contentType: "text/plain", body: "Unauthorized" });
      } else {
        await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      }
    });

    await page.goto("/");
    await page.evaluate((t) => localStorage.setItem("bearer_token", t), token);

    const slugInput = page.getByPlaceholder("e.g. one-piece");
    await slugInput.fill("one-piece");

    const textarea = page.getByRole("textbox", { name: "Add a comment" });
    await textarea.fill("Retry comment once");
    await page.getByRole("button", { name: "Post comment" }).click();

    await expect(page.getByText("Unauthorized")).toBeVisible();
    await expect(textarea).toHaveValue("Retry comment once");

    await page.getByRole("button", { name: "Post comment" }).click();
    await expect(page.getByText("Comment posted")).toBeVisible();
    await expect(textarea).toHaveValue("");
  });

  test("comment shows error on 500 and succeeds on retry", async ({ page }) => {
    const token = "mock_token_c500";
    let calls = 0;

    await page.route("**/api/series/**/comments", async (route) => {
      calls++;
      if (calls === 1) {
        await route.fulfill({ status: 500, contentType: "text/plain", body: "Server error" });
      } else {
        await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      }
    });

    await page.goto("/");
    await page.evaluate((t) => localStorage.setItem("bearer_token", t), token);

    const slugInput = page.getByPlaceholder("e.g. one-piece");
    await slugInput.fill("one-piece");

    const textarea = page.getByRole("textbox", { name: "Add a comment" });
    await textarea.fill("Retry after server error");
    await page.getByRole("button", { name: "Post comment" }).click();

    await expect(page.getByText("Server error")).toBeVisible();
    await expect(textarea).toHaveValue("Retry after server error");

    await page.getByRole("button", { name: "Post comment" }).click();
    await expect(page.getByText("Comment posted")).toBeVisible();
    await expect(textarea).toHaveValue("");
  });
});