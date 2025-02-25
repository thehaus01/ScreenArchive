// Create SVG data URLs for placeholder images
export const placeholderDashboard = `data:image/svg+xml,${encodeURIComponent(`
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f0f0f0"/>
  <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#666" text-anchor="middle">Dashboard Placeholder</text>
</svg>
`)}`;

export const placeholderFeed = `data:image/svg+xml,${encodeURIComponent(`
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f0f0f0"/>
  <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#666" text-anchor="middle">Feed Placeholder</text>
</svg>
`)}`;
