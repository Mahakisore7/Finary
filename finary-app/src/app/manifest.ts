import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Finary AI - Autonomous Finance',
    short_name: 'Finary',
    description: 'The autonomous financial cockpit powered by Gemini 2.5',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#10b981', // Your Emerald Green theme color
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}