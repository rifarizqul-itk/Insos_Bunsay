/**
 * Lighthouse CI configuration — Core Web Vitals budgets for Plaza Kebun Sayur Payment.
 *
 * Enforces Google's "good" Core Web Vitals thresholds and category score floors.
 * Configured for Windows compatibility and Vite preview server.
 */

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

/** Target URLs audited in CI / local performance gate. */
const AUDIT_URLS = [
  `${BASE_URL}/`,
  `${BASE_URL}/auth`,
];

/**
 * Core Web Vitals budgets — Google's "good" thresholds.
 */
const LCP_BUDGET_MS = 3500; // Mobile LCP threshold (≤ 3.5s under mobile throttling)
const INP_BUDGET_MS = 250;  // Good TBT (lab proxy for INP ≤ 250ms)
const CLS_BUDGET = 0.1;     // Good CLS (≤ 0.1)

module.exports = {
  ci: {
    collect: {
      // Build and preview the Vite production app on port 3100
      startServerCommand: `npx vite preview --port ${PORT} --strictPort`,
      startServerReadyPattern: `${PORT}`,
      startServerReadyTimeout: 30000,
      url: AUDIT_URLS,
      // Median of 3 runs eliminates flakiness and jitter
      numberOfRuns: 3,
      settings: {
        preset: process.env.LHCI_FORM_FACTOR === "desktop" ? "desktop" : undefined,
        chromeFlags: "--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage",
        onlyCategories: [
          "performance",
          "seo",
          "accessibility",
          "best-practices",
        ],
      },
    },
    assert: {
      aggregationMethod: "median-run",
      assertions: {
        // --- Core Web Vitals Budgets ---
        "largest-contentful-paint": ["warn", { maxNumericValue: LCP_BUDGET_MS }],
        "cumulative-layout-shift": ["error", { maxNumericValue: CLS_BUDGET }],
        "total-blocking-time": ["warn", { maxNumericValue: INP_BUDGET_MS }],
        "interaction-to-next-paint": ["warn", { maxNumericValue: INP_BUDGET_MS }],

        // --- Category Score Floors ---
        "categories:performance": ["warn", { minScore: 0.80 }],
        "categories:seo": ["error", { minScore: 0.90 }],
        "categories:accessibility": ["error", { minScore: 0.90 }],
        "categories:best-practices": ["error", { minScore: 0.90 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./.lighthouseci",
    },
  },
};
