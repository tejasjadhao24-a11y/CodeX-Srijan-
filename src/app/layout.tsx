import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'FraudGuard — Real-Time Fraud-Risk Detection & Adaptive Intervention',
  description: 'Full-stack transaction fraud detection system powered by heuristic multipliers, contextual social engineering intervention, and deepfake telemetry.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="bg-[#0B0E14] text-slate-100 h-screen w-screen overflow-hidden antialiased flex flex-row">
        {/* Left Column: Fixed-width Sidebar (never shrinks, never absolute) */}
        <Sidebar />

        {/* Right Column: Independent scroll area for main content */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Top Navbar */}
          <Navbar />
          
          {/* Scrollable Page Canvas */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8 w-full">
            <div className="max-w-7xl mx-auto w-full pb-12">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
