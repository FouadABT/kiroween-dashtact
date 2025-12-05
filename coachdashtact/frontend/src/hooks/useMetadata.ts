/**
 * useMetadata Hook
 * 
 * Convenience hook for accessing metadata context.
 * Provides access to metadata state and update functions.
 * 
 * This hook must be used within a MetadataProvider.
 * 
 * @example
 * ```tsx
 * function UserProfilePage({ userId }: { userId: string }) {
 *   const { updateMetadata, setDynamicValues } = useMetadata();
 *   const [user, setUser] = useState(null);
 *   
 *   useEffect(() => {
 *     async function loadUser() {
 *       const userData = await fetchUser(userId);
 *       setUser(userData);
 *       
 *       // Update page metadata dynamically
 *       updateMetadata({
 *         title: `${userData.name} - User Profile`,
 *         description: `View profile for ${userData.name}`,
 *       });
 *       
 *       // Update breadcrumb labels
 *       setDynamicValues({
 *         userName: userData.name,
 *         userId: userId,
 *       });
 *     }
 *     
 *     loadUser();
 *   }, [userId, updateMetadata, setDynamicValues]);
 *   
 *   return <div>{user?.name}</div>;
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // Update only specific metadata fields
 * function ArticlePage() {
 *   const { updateMetadata } = useMetadata();
 *   
 *   useEffect(() => {
 *     updateMetadata({
 *       openGraph: {
 *         type: 'article',
 *         images: [{ url: '/article-image.jpg' }],
 *       },
 *       twitter: {
 *         card: 'summary_large_image',
 *       },
 *     });
 *   }, [updateMetadata]);
 *   
 *   return <article>Content</article>;
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // Reset metadata when component unmounts
 * function TemporaryPage() {
 *   const { updateMetadata, resetMetadata } = useMetadata();
 *   
 *   useEffect(() => {
 *     updateMetadata({
 *       title: 'Temporary Page',
 *       robots: { index: false, follow: false },
 *     });
 *     
 *     return () => {
 *       resetMetadata();
 *     };
 *   }, [updateMetadata, resetMetadata]);
 *   
 *   return <div>Temporary content</div>;
 * }
 * ```
 */

import { useMetadata as useMetadataContext } from '@/contexts/MetadataContext';

/**
 * Access metadata context
 * 
 * @throws {Error} If used outside of MetadataProvider
 * @returns Metadata context value with state and update functions
 */
export function useMetadata() {
  return useMetadataContext();
}

export default useMetadata;
