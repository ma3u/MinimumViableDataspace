/*
 *  Copyright (c) 2024 Aerospace DPP Demo
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 */

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages base path (repository name)
const base = process.env.GITHUB_PAGES === 'true' ? '/MinimumViableDataspace/' : '/'

export default defineConfig(({ mode }) => {
  // Load env file based on mode (e.g., .env.standalone for dev:local)
  const env = loadEnv(mode, process.cwd(), '')
  const edcApiUrl = env.VITE_EDC_API_URL || 'http://localhost:4002'
  
  return {
    plugins: [react()],
    base,
    server: {
      port: 3000,
      proxy: {
        // Backend-EDC Events API (SSE + REST for Dataspace Insider Panel)
        '/api/events': {
          target: edcApiUrl,
          changeOrigin: true,
          ws: true
        },
      // Consumer Management API
      '/consumer/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/consumer/, '')
      },
      // Consumer Catalog Query API
      '/consumer/catalog': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/consumer\/catalog/, '/api/catalog')
      },
      // Provider QNA Management API
      '/provider-qna/api': {
        target: 'http://localhost:8191',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/provider-qna/, '')
      },
      // Provider Manufacturing Management API
      '/provider-mf/api': {
        target: 'http://localhost:8291',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/provider-mf/, '')
      },
      // Provider Public API (data plane)
      '/provider-public': {
        target: 'http://localhost:11002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/provider-public/, '')
      }
    }
  }
  }
})
