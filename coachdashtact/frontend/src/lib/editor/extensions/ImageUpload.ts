import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helpers';

export interface ImageUploadOptions {
  uploadFn: (file: File) => Promise<string>;
  maxSize: number;
  allowedTypes: string[];
}

export const ImageUpload = Extension.create<ImageUploadOptions>({
  name: 'imageUpload',

  addOptions() {
    return {
      uploadFn: async () => '',
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/webp',
        'image/gif',
        'image/svg+xml',
      ],
    };
  },

  addProseMirrorPlugins() {
    const uploadFn = this.options.uploadFn;
    const maxSize = this.options.maxSize;
    const allowedTypes = this.options.allowedTypes;

    const handleImageUpload = (file: File, view: any, pos?: number) => {
      // Validate file size
      if (file.size > maxSize) {
        showErrorToast(
          'File too large',
          `File size exceeds ${maxSize / 1024 / 1024}MB limit`
        );
        return false;
      }

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        showErrorToast(
          'Invalid file type',
          'Please upload PNG, JPG, WebP, GIF, or SVG images only'
        );
        return false;
      }

      // Insert placeholder at cursor or specified position
      const { schema, tr } = view.state;
      const insertPos = pos !== undefined ? pos : view.state.selection.from;
      
      // Create loading placeholder image
      const placeholderSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9hZGluZy4uLjwvdGV4dD48L3N2Zz4=';
      
      const node = schema.nodes.image.create({
        src: placeholderSrc,
        alt: 'Uploading...',
        class: 'uploading opacity-50',
      });

      const transaction = tr.insert(insertPos, node);
      view.dispatch(transaction);

      // Upload file
      uploadFn(file)
        .then((url: string) => {
          // Find the placeholder node
          const { state } = view;
          let placeholderPos: number | null = null;

          state.doc.descendants((node: any, pos: number) => {
            if (node.type.name === 'image' && node.attrs.src === placeholderSrc) {
              placeholderPos = pos;
              return false;
            }
          });

          if (placeholderPos !== null) {
            // Replace placeholder with actual image
            const tr = state.tr.setNodeMarkup(placeholderPos, null, {
              src: url,
              alt: file.name,
              class: 'editor-image',
            });
            view.dispatch(tr);

            showSuccessToast('Image uploaded', 'Image has been inserted successfully');
          }
        })
        .catch((error: any) => {
          console.error('Image upload failed:', error);

          // Find and remove the placeholder
          const { state } = view;
          let placeholderPos: number | null = null;
          let placeholderSize = 0;

          state.doc.descendants((node: any, pos: number) => {
            if (node.type.name === 'image' && node.attrs.src === placeholderSrc) {
              placeholderPos = pos;
              placeholderSize = node.nodeSize;
              return false;
            }
          });

          if (placeholderPos !== null) {
            const tr = state.tr.delete(placeholderPos, placeholderPos + placeholderSize);
            view.dispatch(tr);
          }

          showErrorToast(
            'Upload failed',
            error.message || 'Failed to upload image. Please try again.'
          );
        });

      return true;
    };

    return [
      new Plugin({
        key: new PluginKey('imageUpload'),
        props: {
          handleDOMEvents: {
            drop(view, event) {
              const hasFiles = event.dataTransfer?.files && event.dataTransfer.files.length > 0;
              
              if (!hasFiles) {
                return false;
              }

              const files = Array.from(event.dataTransfer.files);
              const imageFiles = files.filter((file) =>
                allowedTypes.includes(file.type)
              );

              if (imageFiles.length === 0) {
                showErrorToast(
                  'Invalid file type',
                  'Please drop image files only (PNG, JPG, WebP, GIF, SVG)'
                );
                return false;
              }

              event.preventDefault();
              event.stopPropagation();

              const coordinates = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              });

              imageFiles.forEach((file) => {
                handleImageUpload(file, view, coordinates?.pos);
              });

              return true;
            },
            paste(view, event) {
              const hasFiles = event.clipboardData?.files && event.clipboardData.files.length > 0;
              
              if (!hasFiles) {
                return false;
              }

              const files = Array.from(event.clipboardData.files);
              const imageFiles = files.filter((file) =>
                allowedTypes.includes(file.type)
              );

              if (imageFiles.length === 0) {
                return false;
              }

              event.preventDefault();
              event.stopPropagation();

              imageFiles.forEach((file) => {
                handleImageUpload(file, view);
              });

              return true;
            },
          },
        },
      }),
    ];
  },
});
