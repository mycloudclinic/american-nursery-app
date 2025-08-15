import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to Garden Center PWA - Your complete garden center management solution',
};

/**
 * Home Page Component
 * Displays the main landing page with hero section, featured products, and quick access
 * Following Apple Human Interface Guidelines for clean, modern design
 */
export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="container-wide py-24 sm:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-6xl">
              Garden Center
              <span className="text-primary-600"> PWA</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-neutral-600">
              Professional garden center management system with modern e-commerce capabilities, 
              inventory management, and customer engagement tools.
            </p>
            <div className="mt-10 flex items-center justify-center gap-6">
              <button className="btn-primary btn-xl animate-spring">
                Get Started
              </button>
              <button className="btn-outline btn-xl">
                Learn More
              </button>
            </div>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary-400 to-secondary-400 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="container-wide">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Everything you need to run your garden center
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              From inventory management to customer orders, our PWA provides all the tools 
              you need in one seamless platform.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-7xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1: E-commerce */}
              <div className="card hover-lift animate-fade-in">
                <div className="card-body">
                  <div className="flex h-12 w-12 items-center justify-center rounded-apple-lg bg-primary-100">
                    <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-neutral-900">E-commerce Platform</h3>
                  <p className="mt-2 text-sm text-neutral-600">
                    Complete online store with product catalog, shopping cart, and secure checkout process.
                  </p>
                </div>
              </div>

              {/* Feature 2: Inventory Management */}
              <div className="card hover-lift animate-fade-in" style={{ animationDelay: '100ms' }}>
                <div className="card-body">
                  <div className="flex h-12 w-12 items-center justify-center rounded-apple-lg bg-secondary-100">
                    <svg className="h-6 w-6 text-secondary-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-neutral-900">Inventory Management</h3>
                  <p className="mt-2 text-sm text-neutral-600">
                    Track stock levels, manage suppliers, and automate reordering with advanced inventory tools.
                  </p>
                </div>
              </div>

              {/* Feature 3: Customer Management */}
              <div className="card hover-lift animate-fade-in" style={{ animationDelay: '200ms' }}>
                <div className="card-body">
                  <div className="flex h-12 w-12 items-center justify-center rounded-apple-lg bg-accent-100">
                    <svg className="h-6 w-6 text-accent-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-neutral-900">Customer Management</h3>
                  <p className="mt-2 text-sm text-neutral-600">
                    Manage customer relationships, loyalty programs, and provide personalized service.
                  </p>
                </div>
              </div>

              {/* Feature 4: Order Processing */}
              <div className="card hover-lift animate-fade-in" style={{ animationDelay: '300ms' }}>
                <div className="card-body">
                  <div className="flex h-12 w-12 items-center justify-center rounded-apple-lg bg-green-100">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-neutral-900">Order Processing</h3>
                  <p className="mt-2 text-sm text-neutral-600">
                    Streamlined order fulfillment from placement to delivery with real-time tracking.
                  </p>
                </div>
              </div>

              {/* Feature 5: Mobile PWA */}
              <div className="card hover-lift animate-fade-in" style={{ animationDelay: '400ms' }}>
                <div className="card-body">
                  <div className="flex h-12 w-12 items-center justify-center rounded-apple-lg bg-blue-100">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                    </svg>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-neutral-900">Mobile PWA</h3>
                  <p className="mt-2 text-sm text-neutral-600">
                    Native app experience with offline capabilities, push notifications, and responsive design.
                  </p>
                </div>
              </div>

              {/* Feature 6: Analytics */}
              <div className="card hover-lift animate-fade-in" style={{ animationDelay: '500ms' }}>
                <div className="card-body">
                  <div className="flex h-12 w-12 items-center justify-center rounded-apple-lg bg-purple-100">
                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-neutral-900">Analytics & Reports</h3>
                  <p className="mt-2 text-sm text-neutral-600">
                    Comprehensive reporting and analytics to track performance and make data-driven decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600">
        <div className="container-wide py-16 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to modernize your garden center?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
              Join hundreds of garden centers already using our platform to streamline operations 
              and grow their business.
            </p>
            <div className="mt-10 flex items-center justify-center gap-6">
              <button className="btn bg-white text-primary-600 hover:bg-primary-50 btn-xl">
                Start Free Trial
              </button>
              <button className="btn-outline border-white text-white hover:bg-white hover:text-primary-600 btn-xl">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
