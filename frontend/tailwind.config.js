/*
 *  Copyright (c) 2024 Aerospace DPP Demo
 *
 *  SPDX-License-Identifier: Apache-2.0
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ApexPropulsion Systems brand colors
        'rr-blue': '#002f6c',
        'rr-gold': '#b8860b',
        // Horizon Aviation Group brand colors
        'airbus-blue': '#00205b',
        'airbus-cyan': '#00b5e2',
      }
    },
  },
  plugins: [],
}
