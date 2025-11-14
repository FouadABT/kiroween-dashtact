'use client';

import { CustomPage } from '@/types/pages';

interface PageContentProps {
  page: CustomPage;
}

export function PageContent({ page }: PageContentProps) {
  return (
    <article className="page-content">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Modern content container with theme-aware styling */}
          <div 
            className="
              prose prose-lg 
              dark:prose-invert 
              max-w-none
              
              /* Headings */
              prose-headings:font-bold
              prose-headings:tracking-tight
              prose-h1:text-4xl prose-h1:lg:text-5xl prose-h1:mb-6 prose-h1:mt-8
              prose-h2:text-3xl prose-h2:lg:text-4xl prose-h2:mb-5 prose-h2:mt-7
              prose-h3:text-2xl prose-h3:lg:text-3xl prose-h3:mb-4 prose-h3:mt-6
              
              /* Paragraphs */
              prose-p:text-foreground
              prose-p:leading-relaxed
              prose-p:mb-6
              
              /* Links */
              prose-a:text-primary
              prose-a:no-underline
              prose-a:font-medium
              hover:prose-a:underline
              prose-a:transition-all
              
              /* Lists */
              prose-ul:my-6
              prose-ol:my-6
              prose-li:text-foreground
              prose-li:my-2
              
              /* Blockquotes */
              prose-blockquote:border-l-4
              prose-blockquote:border-primary
              prose-blockquote:pl-6
              prose-blockquote:italic
              prose-blockquote:text-muted-foreground
              prose-blockquote:my-6
              
              /* Code */
              prose-code:bg-muted
              prose-code:text-foreground
              prose-code:px-2
              prose-code:py-1
              prose-code:rounded
              prose-code:text-sm
              prose-code:font-mono
              prose-code:before:content-none
              prose-code:after:content-none
              
              /* Pre (code blocks) */
              prose-pre:bg-muted
              prose-pre:text-foreground
              prose-pre:p-6
              prose-pre:rounded-lg
              prose-pre:overflow-x-auto
              prose-pre:my-6
              prose-pre:border
              prose-pre:border-border
              
              /* Images */
              prose-img:rounded-lg
              prose-img:shadow-lg
              prose-img:my-8
              prose-img:mx-auto
              
              /* Strong/Bold */
              prose-strong:text-foreground
              prose-strong:font-semibold
              
              /* Emphasis/Italic */
              prose-em:text-foreground
              
              /* HR */
              prose-hr:border-border
              prose-hr:my-12
              
              /* Tables */
              prose-table:my-8
              prose-thead:border-b-2
              prose-thead:border-border
              prose-th:bg-muted
              prose-th:px-4
              prose-th:py-3
              prose-th:text-left
              prose-th:font-semibold
              prose-td:border-t
              prose-td:border-border
              prose-td:px-4
              prose-td:py-3
            "
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </div>
    </article>
  );
}
