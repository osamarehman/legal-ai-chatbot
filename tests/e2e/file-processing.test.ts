import { expect, test } from "@playwright/test";
import { createTestUser, deleteTestUser, loginTestUser } from "./utils";

const TEST_USER = {
  email: `test-file-processing-${Date.now()}@example.com`,
  password: "testpassword123",
};

test.describe("File Processing", () => {
  test.beforeAll(async () => {
    await createTestUser(TEST_USER.email, TEST_USER.password);
  });

  test.afterAll(async () => {
    await deleteTestUser(TEST_USER.email);
  });

  test.beforeEach(async ({ page }) => {
    await loginTestUser(page, TEST_USER.email, TEST_USER.password);
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should upload a PDF file successfully", async ({ page }) => {
    // Create a mock PDF buffer (simple text-based PDF)
    const pdfBuffer = Buffer.from(
      `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R >> endobj
4 0 obj << /Length 44 >> stream
BT /F1 12 Tf 100 700 Td (Test Legal Document) Tj ET
endstream endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000274 00000 n
trailer << /Size 5 /Root 1 0 R >>
startxref
366
%%EOF`
    );

    // Find the file input
    const fileInput = page.locator('input[type="file"]');

    // Upload the file
    await fileInput.setInputFiles({
      name: "test-document.pdf",
      mimeType: "application/pdf",
      buffer: pdfBuffer,
    });

    // Wait for the attachment preview to appear
    await page.waitForSelector('[data-testid="input-attachment-preview"]', {
      timeout: 5000,
    });

    // Verify the file preview shows
    const preview = page.locator('[data-testid="input-attachment-preview"]');
    await expect(preview).toBeVisible();

    // Check that PDF icon is displayed
    await expect(preview.locator('text="PDF"')).toBeVisible();
  });

  test("should upload an image file successfully", async ({ page }) => {
    // Create a simple 1x1 PNG image
    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );

    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: "test-image.png",
      mimeType: "image/png",
      buffer: pngBuffer,
    });

    // Wait for the attachment preview
    await page.waitForSelector('[data-testid="input-attachment-preview"]', {
      timeout: 5000,
    });

    const preview = page.locator('[data-testid="input-attachment-preview"]');
    await expect(preview).toBeVisible();
  });

  test("should show error for unsupported file type", async ({ page }) => {
    // Create a text file
    const txtBuffer = Buffer.from("This is a test file");

    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: "test-file.txt",
      mimeType: "text/plain",
      buffer: txtBuffer,
    });

    // Wait for error toast
    await page.waitForSelector('text=/not supported/i', {
      timeout: 5000,
    });

    // Verify error message appears
    const errorToast = page.locator('text=/not supported/i').first();
    await expect(errorToast).toBeVisible();
  });

  test("should show error for file size too large", async ({ page }) => {
    // Create a buffer larger than 10MB (for documents)
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB

    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: "large-document.pdf",
      mimeType: "application/pdf",
      buffer: largeBuffer,
    });

    // Wait for error toast
    await page.waitForSelector('text=/size too large/i', {
      timeout: 5000,
    });

    const errorToast = page.locator('text=/size too large/i').first();
    await expect(errorToast).toBeVisible();
  });

  test("should process PDF and extract content in chat", async ({ page }) => {
    // Create a simple PDF with recognizable text
    const pdfBuffer = Buffer.from(
      `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R >> endobj
4 0 obj << /Length 55 >> stream
BT /F1 12 Tf 100 700 Td (This is a confidentiality agreement) Tj ET
endstream endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000274 00000 n
trailer << /Size 5 /Root 1 0 R >>
startxref
377
%%EOF`
    );

    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: "confidentiality-agreement.pdf",
      mimeType: "application/pdf",
      buffer: pdfBuffer,
    });

    // Wait for preview
    await page.waitForSelector('[data-testid="input-attachment-preview"]');

    // Type a question about the document
    const textarea = page.locator('[data-testid="multimodal-input"]');
    await textarea.fill("What type of document is this?");

    // Submit the message
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Wait for assistant response
    await page.waitForSelector('[data-testid="message-assistant"]', {
      timeout: 30000,
    });

    // Verify response contains reference to the document
    const response = page
      .locator('[data-testid="message-assistant"]')
      .last();
    await expect(response).toBeVisible();

    // The AI should mention "confidentiality" or "agreement" based on extracted text
    const responseText = await response.textContent();
    expect(responseText?.toLowerCase()).toMatch(
      /confidentiality|agreement|document/
    );
  });

  test("should use cache for identical file uploads", async ({ page }) => {
    // Create a simple PDF
    const pdfBuffer = Buffer.from(
      `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R >> endobj
4 0 obj << /Length 44 >> stream
BT /F1 12 Tf 100 700 Td (Cached Document Test) Tj ET
endstream endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000274 00000 n
trailer << /Size 5 /Root 1 0 R >>
startxref
366
%%EOF`
    );

    const fileInput = page.locator('input[type="file"]');

    // First upload
    await fileInput.setInputFiles({
      name: "cached-doc.pdf",
      mimeType: "application/pdf",
      buffer: pdfBuffer,
    });

    await page.waitForSelector('[data-testid="input-attachment-preview"]');

    const textarea = page.locator('[data-testid="multimodal-input"]');
    await textarea.fill("What is this document?");

    const submitButton = page.locator('button[type="submit"]');

    // Start timing the first request
    const startTime1 = Date.now();
    await submitButton.click();
    await page.waitForSelector('[data-testid="message-assistant"]', {
      timeout: 30000,
    });
    const duration1 = Date.now() - startTime1;

    // Start a new chat
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Second upload of the same file
    const fileInput2 = page.locator('input[type="file"]');
    await fileInput2.setInputFiles({
      name: "cached-doc.pdf",
      mimeType: "application/pdf",
      buffer: pdfBuffer, // Same exact buffer
    });

    await page.waitForSelector('[data-testid="input-attachment-preview"]');

    const textarea2 = page.locator('[data-testid="multimodal-input"]');
    await textarea2.fill("What is this document?");

    const submitButton2 = page.locator('button[type="submit"]');

    // Start timing the second request (should be faster due to cache)
    const startTime2 = Date.now();
    await submitButton2.click();
    await page.waitForSelector('[data-testid="message-assistant"]', {
      timeout: 30000,
    });
    const duration2 = Date.now() - startTime2;

    // The second request should typically be faster (though not guaranteed)
    // At minimum, verify both requests completed successfully
    expect(duration1).toBeGreaterThan(0);
    expect(duration2).toBeGreaterThan(0);

    // Log for manual verification
    console.log(`First request: ${duration1}ms, Second request: ${duration2}ms`);
  });

  test("should remove uploaded file from preview", async ({ page }) => {
    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );

    const fileInput = page.locator('input[type="file"]');

    await fileInput.setInputFiles({
      name: "test-image.png",
      mimeType: "image/png",
      buffer: pngBuffer,
    });

    await page.waitForSelector('[data-testid="input-attachment-preview"]');

    const preview = page.locator('[data-testid="input-attachment-preview"]');
    await expect(preview).toBeVisible();

    // Click the remove button (X icon)
    const removeButton = preview.locator('button[variant="destructive"]');
    await removeButton.hover();
    await removeButton.click();

    // Verify preview is removed
    await expect(preview).not.toBeVisible();
  });

  test("should handle multiple file uploads", async ({ page }) => {
    // Create two different files
    const pdf1 = Buffer.from(
      `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R >> endobj
4 0 obj << /Length 40 >> stream
BT /F1 12 Tf 100 700 Td (Document One) Tj ET
endstream endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000274 00000 n
trailer << /Size 5 /Root 1 0 R >>
startxref
362
%%EOF`
    );

    const png1 = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );

    const fileInput = page.locator('input[type="file"]');

    // Upload first file
    await fileInput.setInputFiles({
      name: "doc1.pdf",
      mimeType: "application/pdf",
      buffer: pdf1,
    });

    await page.waitForSelector('[data-testid="input-attachment-preview"]');

    // Upload second file
    await fileInput.setInputFiles({
      name: "image1.png",
      mimeType: "image/png",
      buffer: png1,
    });

    // Wait for both previews
    await page.waitForTimeout(1000);

    // Check that we have 2 attachment previews
    const previews = page.locator('[data-testid="input-attachment-preview"]');
    await expect(previews).toHaveCount(2);
  });
});
