// Credentials go through env first, demo defaults second. Even for a
// public demo repo the pattern matters — at work these all become vault
// lookups or secret-manager reads without touching callers.
//
// Framework code imports from `credentials`, never from process.env
// directly. Greps for `admin123` / `secret_sauce` in any POM or step
// file should return zero hits outside this file.

export const credentials = {
  sauceDemo: {
    // SauceDemo's test users are baked into the demo site and listed on
    // its login page — they're part of the public contract, not secrets.
    users: {
      standard: 'standard_user',
      lockedOut: 'locked_out_user',
      problem: 'problem_user',
      performanceGlitch: 'performance_glitch_user',
      error: 'error_user',
      visual: 'visual_user',
    },
    password: process.env.SAUCEDEMO_PASSWORD ?? 'secret_sauce',
  },

  orangeHRM: {
    admin: {
      username: process.env.ORANGEHRM_ADMIN_USER ?? 'Admin',
      password: process.env.ORANGEHRM_ADMIN_PASSWORD ?? 'admin123',
    },
  },
} as const;

export type SauceDemoUser = keyof typeof credentials.sauceDemo.users;
