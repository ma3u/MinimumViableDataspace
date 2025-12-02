/*
 *  Copyright (c) 2024 Aerospace DPP Demo
 *
 *  This program and the accompanying materials are made available under the
 *  terms of the Apache License, Version 2.0 which is available at
 *  https://www.apache.org/licenses/LICENSE-2.0
 *
 *  SPDX-License-Identifier: Apache-2.0
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
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
})
