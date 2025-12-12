import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notion Chart Widget',
  description: 'Embeddable chart widget for Notion',
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

