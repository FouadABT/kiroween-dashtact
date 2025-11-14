'use client';

import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Maximize2 } from 'lucide-react';

interface ImageSizeControlsProps {
  editor: Editor;
}

export function ImageSizeControls({ editor }: ImageSizeControlsProps) {
  const setImageSize = (width: string) => {
    const { state } = editor;
    const { selection } = state;
    const { $from } = selection;
    
    // Find the image node
    let imageNode: any = null;
    let imagePos: number | null = null;
    
    state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
      if (node.type.name === 'image') {
        imageNode = node;
        imagePos = pos;
        return false;
      }
    });
    
    if (imageNode && imagePos !== null) {
      const tr = state.tr.setNodeMarkup(imagePos, null, {
        ...imageNode.attrs,
        width,
        height: null, // Let height auto-adjust
      });
      editor.view.dispatch(tr);
    }
  };

  const hasImageSelected = () => {
    const { state } = editor;
    const { selection } = state;
    let hasImage = false;
    
    state.doc.nodesBetween(selection.from, selection.to, (node) => {
      if (node.type.name === 'image') {
        hasImage = true;
        return false;
      }
    });
    
    return hasImage;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!hasImageSelected()}
          title="Image Size"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Image Size</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setImageSize('25%')}>
          Small (25%)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setImageSize('50%')}>
          Medium (50%)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setImageSize('75%')}>
          Large (75%)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setImageSize('100%')}>
          Full Width (100%)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setImageSize('300px')}>
          300px
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setImageSize('500px')}>
          500px
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setImageSize('800px')}>
          800px
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
