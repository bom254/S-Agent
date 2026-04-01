import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'S-Agent | DeFi Research Autonomous Agent',
  description: 'AI-powered DeFi research and analysis agent',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
}