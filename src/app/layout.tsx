import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: {
    default: 'Garden Center PWA',
    template: '%s | Garden Center PWA',
  },
  description: 'Professional garden center management system with e-commerce and inventory management',
  keywords: [
    'garden center',
    'plants',
    'nursery',
    'gardening',
    'landscaping',
    'inventory management',
    'e-commerce',
    'PWA',
  ],
  authors: [{ name: 'Garden Center PWA Team' }],
  creator: 'Garden Center PWA',
  publisher: 'Garden Center PWA',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Garden Center PWA',
    description: 'Professional garden center management system with e-commerce and inventory management',
    siteName: 'Garden Center PWA',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Garden Center PWA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Garden Center PWA',
    description: 'Professional garden center management system with e-commerce and inventory management',
    images: ['/images/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/icons/safari-pinned-tab.svg',
        color: '#22c55e',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Garden Center PWA',
  },
  applicationName: 'Garden Center PWA',
  verification: {
    google: 'your-google-verification-code',
    // Add other verification codes as needed
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#22c55e' },
    { media: '(prefers-color-scheme: dark)', color: '#16a34a' },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Garden Center PWA" />
        <meta name="application-name" content="Garden Center PWA" />
        <meta name="msapplication-TileColor" content="#22c55e" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon and touch icons */}
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        
        {/* Microsoft tiles */}
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        
        {/* Chrome/Android */}
        <meta name="theme-color" content="#22c55e" />
        
        {/* iOS Safari */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Windows */}
        <meta name="msapplication-navbutton-color" content="#22c55e" />
        
        {/* Disable automatic detection and formatting of possible phone numbers */}
        <meta name="format-detection" content="telephone=no" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* Referrer policy */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body className={`${outfit.variable} ${outfit.className} font-sans antialiased`}>
        {/* Skip to main content for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary-500 text-white px-4 py-2 rounded-md"
        >
          Skip to main content
        </a>
        
        {/* Main application wrapper */}
        <div id="__next" className="min-h-screen bg-system-background">
          {children}
        </div>
        
        {/* Service worker registration script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
