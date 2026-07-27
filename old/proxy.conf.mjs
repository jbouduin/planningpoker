/*
 * API proxy configuration.
 * This allows you to proxy HTTP request like `http.get('/api/stuff')` to another server/port.
 * This is especially useful during app development to avoid CORS issues while running a local server.
 * For more details and options, see https://angular.io/guide/build#using-corporate-proxy
 */
const PROXY_CONFIG = [
  {
    context: ['/api'],
    pathRewrite: { '^/api': '' },
    target: 'http://localhost:3001',
    changeOrigin: true,
    secure: false
  }
];

export default PROXY_CONFIG;
