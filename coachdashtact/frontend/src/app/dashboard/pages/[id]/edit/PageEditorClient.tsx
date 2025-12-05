'use client';

import { useEffect } from 'react';
import { PageEditor } from '@/components/pages/PageEditor';
import { useMetadata } from '@/contexts/MetadataContext';

interface PageEditorClientProps {
  pageId: string;
  pageTitle?: string;
}

export function PageEditorClient({ pageId, pageTitle }: PageEditorClientProps) {
  const { setDynamicValues } = useMetadata();
  
  // Update breadcrumb with page title
  useEffect(() => {
    if (pageTitle) {
      setDynamicValues({ pageTitle });
    }
  }, [pageTitle, setDynamicValues]);
  
  return <PageEditor mode="edit" pageId={pageId} />;
}
