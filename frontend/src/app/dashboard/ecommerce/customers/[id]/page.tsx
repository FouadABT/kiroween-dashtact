'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Customer, Order } from '@/types/ecommerce';
import { CustomersApi } from '@/lib/api';
import { CustomerDetails } from '@/components/customers/CustomerDetails';
import { CustomerOrderHistory } from '@/components/customers/CustomerOrderHistory';
import { CustomerStats } from '@/components/customers/CustomerStats';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  // toast is imported directly
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<{
    totalOrders: number;
    lifetimeValue: string;
    averageOrderValue: string;
    lastOrderDate?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [portalDialogOpen, setPortalDialogOpen] = useState(false);
  const [portalLink, setPortalLink] = useState('');
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [customerData, ordersData, statsData] = await Promise.all([
          CustomersApi.getById(customerId),
          CustomersApi.getOrderHistory(customerId),
          CustomersApi.getStatistics(customerId),
        ]);
        setCustomer(customerData);
        setOrders(ordersData);
        setStats(statsData);
      } catch (error) {
        toast.error('Failed to load customer details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [customerId]);

  const handleGeneratePortalToken = async () => {
    try {
      setIsGeneratingToken(true);
      const updatedCustomer = await CustomersApi.generatePortalToken(customerId);
      setCustomer(updatedCustomer);
      
      if (updatedCustomer.portalToken) {
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/portal/orders/${updatedCustomer.portalToken}`;
        setPortalLink(link);
        setPortalDialogOpen(true);
      }

      toast.success('Portal token generated successfully');
    } catch (error) {
      toast.error('Failed to generate portal token');
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleCopyPortalLink = () => {
    navigator.clipboard.writeText(portalLink);
    toast.success('Portal link copied to clipboard');
  };

  if (isLoading) {
    return (
      <PermissionGuard permission="customers:read">
        <div className="space-y-6">
          <Skeleton className="h-20" />
          <Skeleton className="h-96" />
        </div>
      </PermissionGuard>
    );
  }

  if (!customer) {
    return (
      <PermissionGuard permission="customers:read">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Customer not found</p>
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/ecommerce/customers')}
            className="mt-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Button>
        </div>
      </PermissionGuard>
    );
  }

  return (
    <PermissionGuard permission="customers:read">
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title={`${customer.firstName} ${customer.lastName}`}
          description={customer.email}
          actions={
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/ecommerce/customers')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <PermissionGuard permission="customers:write" fallback={null}>
                <Button
                  variant="outline"
                  onClick={handleGeneratePortalToken}
                  disabled={isGeneratingToken}
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  {isGeneratingToken ? 'Generating...' : 'Generate Portal Link'}
                </Button>
              </PermissionGuard>
              <PermissionGuard permission="customers:write" fallback={null}>
                <Button onClick={() => router.push(`/dashboard/ecommerce/customers/${customerId}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </PermissionGuard>
            </div>
          }
        />

        {/* Stats */}
        {stats && <CustomerStats stats={stats} />}

        {/* Tabs */}
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <CustomerDetails customer={customer} />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <CustomerOrderHistory orders={orders || []} />
          </TabsContent>
        </Tabs>

        {/* Portal Link Dialog */}
        <Dialog open={portalDialogOpen} onOpenChange={setPortalDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Customer Portal Link</DialogTitle>
              <DialogDescription>
                Share this link with the customer to allow them to view their orders.
                The link will expire in 30 days.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Portal Link</Label>
                <div className="flex gap-2">
                  <Input value={portalLink} readOnly />
                  <Button onClick={handleCopyPortalLink}>Copy</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PermissionGuard>
  );
}
