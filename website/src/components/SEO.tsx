import React from 'react';

interface SEOProps {
  title?: string;
  description?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = '@oxog/deps - Zero-Dependency NPM Package Analyzer',
  description = 'Zero-dependency analyzer for Node.js projects with circular, unused, duplicate detection, security audit, and monorepo support',
}) => {
  React.useEffect(() => {
    document.title = title;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
  }, [title, description]);

  return null;
};
