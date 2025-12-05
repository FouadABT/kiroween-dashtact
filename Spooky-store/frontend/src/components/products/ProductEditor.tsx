'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, CreateProductDto, UpdateProductDto, ProductStatus, ProductVariant, CreateProductVariantDto, UpdateProductVariantDto } from '@/types/ecommerce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createProduct, updateProduct, addProductVariant, updateProductVariant, deleteProductVariant } from '@/lib/api';
import { ImageGallery } from './ImageGallery';
import { VariantManager } from './VariantManager';

interface ProductEditorProps {
  product?: Product;
  mode: 'create' | 'edit';
}

export function ProductEditor({ product, mode }: ProductEditorProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<CreateProductDto>>({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    shortDescription: product?.shortDescription || '',
    basePrice: product?.basePrice ? parseFloat(product.basePrice) : 0,
    compareAtPrice: product?.compareAtPrice ? parseFloat(product.compareAtPrice) : undefined,
    cost: product?.cost ? parseFloat(product.cost) : undefined,
    sku: product?.sku || '',
    barcode: product?.barcode || '',
    featuredImage: product?.featuredImage || '',
    images: product?.images || [],
    status: product?.status || ProductStatus.DRAFT,
    isVisible: product?.isVisible ?? true,
    isFeatured: product?.isFeatured ?? false,
    metaTitle: product?.metaTitle || '',
    metaDescription: product?.metaDescription || '',
  });

  const [variants, setVariants] = useState<ProductVariant[]>(product?.variants || []);

  // Auto-generate slug from name
  useEffect(() => {
    if (mode === 'create' && formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.name, mode, formData.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug || formData.basePrice === undefined) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      if (mode === 'create') {
        const newProduct = await createProduct(formData as CreateProductDto);
        toast.success('Product created successfully');
        router.push(`/dashboard/ecommerce/products/${newProduct.id}/edit`);
      } else if (product) {
        await updateProduct(product.id, formData as UpdateProductDto);
        toast.success('Product updated successfully');
        router.refresh();
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(`Failed to ${mode === 'create' ? 'create' : 'update'} product`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddVariant = async (variantData: Omit<CreateProductVariantDto, 'productId'>) => {
    if (!product) {
      toast.error('Please save the product before adding variants');
      return;
    }

    try {
      const newVariant = await addProductVariant(product.id, variantData);
      setVariants([...variants, newVariant]);
      toast.success('Variant added successfully');
    } catch (error) {
      console.error('Add variant error:', error);
      toast.error('Failed to add variant');
    }
  };

  const handleUpdateVariant = async (variantId: string, variantData: UpdateProductVariantDto) => {
    if (!product) return;

    try {
      const updatedVariant = await updateProductVariant(product.id, variantId, variantData);
      setVariants(variants.map((v) => (v.id === variantId ? updatedVariant : v)));
      toast.success('Variant updated successfully');
    } catch (error) {
      console.error('Update variant error:', error);
      toast.error('Failed to update variant');
    }
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!product) return;

    try {
      await deleteProductVariant(product.id, variantId);
      setVariants(variants.filter((v) => v.id !== variantId));
      toast.success('Variant deleted successfully');
    } catch (error) {
      console.error('Delete variant error:', error);
      toast.error('Failed to delete variant');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">
            {mode === 'create' ? 'Create Product' : 'Edit Product'}
          </h1>
        </div>
        <Button type="submit" disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Product'}
        </Button>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="variants" disabled={mode === 'create'}>
            Variants {mode === 'create' && '(Save product first)'}
          </TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="product-slug"
                  required
                />
              </div>

              <div>
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief product description"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed product description"
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="SKU-001"
                  />
                </div>
                <div>
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="123456789"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as ProductStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ProductStatus.DRAFT}>Draft</SelectItem>
                    <SelectItem value={ProductStatus.PUBLISHED}>Published</SelectItem>
                    <SelectItem value={ProductStatus.ARCHIVED}>Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isVisible"
                  checked={formData.isVisible}
                  onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
                />
                <Label htmlFor="isVisible">Visible in store</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                />
                <Label htmlFor="isFeatured">Featured product</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="basePrice">Base Price *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="compareAtPrice">Compare At Price</Label>
                  <Input
                    id="compareAtPrice"
                    type="number"
                    step="0.01"
                    value={formData.compareAtPrice || ''}
                    onChange={(e) => setFormData({ ...formData, compareAtPrice: parseFloat(e.target.value) || undefined })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="cost">Cost</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost || ''}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || undefined })}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageGallery
                images={formData.images || []}
                featuredImage={formData.featuredImage || null}
                onImagesChange={(images) => setFormData({ ...formData, images })}
                onFeaturedImageChange={(featuredImage) => setFormData({ ...formData, featuredImage: featuredImage || undefined })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variants Tab */}
        <TabsContent value="variants">
          <Card>
            <CardHeader>
              <CardTitle>Product Variants</CardTitle>
            </CardHeader>
            <CardContent>
              {mode === 'edit' && product ? (
                <VariantManager
                  variants={variants}
                  onAdd={handleAddVariant}
                  onUpdate={handleUpdateVariant}
                  onDelete={handleDeleteVariant}
                />
              ) : (
                <p className="text-muted-foreground">
                  Save the product first to add variants
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  placeholder="SEO title"
                />
              </div>
              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="SEO description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}
