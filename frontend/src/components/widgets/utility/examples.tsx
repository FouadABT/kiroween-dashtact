/**
 * Utility Widgets Examples
 * 
 * Comprehensive examples demonstrating all utility widget features.
 */

'use client';

import React, { useState } from 'react';
import { Badge } from './Badge';
import { Avatar } from './Avatar';
import { Tooltip } from './Tooltip';
import { Modal } from './Modal';
import {
  Check,
  X,
  AlertTriangle,
  Info,
  Star,
  Heart,
  Zap,
  HelpCircle,
} from 'lucide-react';

export function UtilityWidgetsExamples() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);

  return (
    <div className="space-y-12 p-8">
      {/* Badge Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Badge Component</h2>
        
        <div className="space-y-6">
          {/* Variants */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Variants</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Sizes</h3>
            <div className="flex flex-wrap items-center gap-2">
              <Badge size="sm">Small</Badge>
              <Badge size="md">Medium</Badge>
              <Badge size="lg">Large</Badge>
            </div>
          </div>

          {/* With Icons */}
          <div>
            <h3 className="text-lg font-semibold mb-3">With Icons</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="success" icon={Check}>
                Verified
              </Badge>
              <Badge variant="error" icon={X}>
                Failed
              </Badge>
              <Badge variant="warning" icon={AlertTriangle}>
                Warning
              </Badge>
              <Badge variant="info" icon={Info}>
                Information
              </Badge>
              <Badge variant="default" icon={Star}>
                Featured
              </Badge>
            </div>
          </div>

          {/* Real-world Examples */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Real-world Examples</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">User Status:</span>
                <Badge variant="success" icon={Check} size="sm">
                  Active
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Order Status:</span>
                <Badge variant="warning" icon={AlertTriangle} size="sm">
                  Pending
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Payment Status:</span>
                <Badge variant="error" icon={X} size="sm">
                  Failed
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Feature:</span>
                <Badge variant="info" icon={Zap} size="sm">
                  New
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Avatar Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Avatar Component</h2>
        
        <div className="space-y-6">
          {/* Sizes */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Sizes</h3>
            <div className="flex flex-wrap items-end gap-4">
              <div className="text-center">
                <Avatar fallback="XS" size="xs" />
                <p className="text-xs mt-1">XS</p>
              </div>
              <div className="text-center">
                <Avatar fallback="SM" size="sm" />
                <p className="text-xs mt-1">SM</p>
              </div>
              <div className="text-center">
                <Avatar fallback="MD" size="md" />
                <p className="text-xs mt-1">MD</p>
              </div>
              <div className="text-center">
                <Avatar fallback="LG" size="lg" />
                <p className="text-xs mt-1">LG</p>
              </div>
              <div className="text-center">
                <Avatar fallback="XL" size="xl" />
                <p className="text-xs mt-1">XL</p>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Status Indicators</h3>
            <div className="flex flex-wrap gap-4">
              <div className="text-center">
                <Avatar fallback="JD" size="md" status="online" />
                <p className="text-xs mt-1">Online</p>
              </div>
              <div className="text-center">
                <Avatar fallback="AB" size="md" status="away" />
                <p className="text-xs mt-1">Away</p>
              </div>
              <div className="text-center">
                <Avatar fallback="CD" size="md" status="offline" />
                <p className="text-xs mt-1">Offline</p>
              </div>
            </div>
          </div>

          {/* Real-world Examples */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Real-world Examples</h3>
            <div className="space-y-3">
              {/* User list */}
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <Avatar fallback="JD" size="md" status="online" />
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-muted-foreground">john@example.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <Avatar fallback="AS" size="md" status="away" />
                <div>
                  <p className="font-medium">Alice Smith</p>
                  <p className="text-sm text-muted-foreground">alice@example.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <Avatar fallback="BJ" size="md" status="offline" />
                <div>
                  <p className="font-medium">Bob Johnson</p>
                  <p className="text-sm text-muted-foreground">bob@example.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tooltip Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Tooltip Component</h2>
        
        <div className="space-y-6">
          {/* Positions */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Positions</h3>
            <div className="flex flex-wrap gap-4">
              <Tooltip content="Top tooltip" side="top">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded">
                  Top
                </button>
              </Tooltip>
              <Tooltip content="Bottom tooltip" side="bottom">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded">
                  Bottom
                </button>
              </Tooltip>
              <Tooltip content="Left tooltip" side="left">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded">
                  Left
                </button>
              </Tooltip>
              <Tooltip content="Right tooltip" side="right">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded">
                  Right
                </button>
              </Tooltip>
            </div>
          </div>

          {/* With Icons */}
          <div>
            <h3 className="text-lg font-semibold mb-3">With Icons</h3>
            <div className="flex flex-wrap gap-4">
              <Tooltip content="Get help with this feature">
                <HelpCircle className="h-5 w-5 text-muted-foreground cursor-help" />
              </Tooltip>
              <Tooltip content="Important information">
                <Info className="h-5 w-5 text-blue-500 cursor-help" />
              </Tooltip>
              <Tooltip content="Warning: This action cannot be undone">
                <AlertTriangle className="h-5 w-5 text-yellow-500 cursor-help" />
              </Tooltip>
            </div>
          </div>

          {/* Rich Content */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Rich Content</h3>
            <Tooltip
              content={
                <div className="space-y-1">
                  <p className="font-semibold">Premium Feature</p>
                  <p className="text-sm">Upgrade to access advanced analytics</p>
                  <p className="text-xs text-muted-foreground">Starting at $9/month</p>
                </div>
              }
            >
              <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded flex items-center gap-2">
                <Star className="h-4 w-4" />
                Premium
              </button>
            </Tooltip>
          </div>

          {/* Real-world Examples */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Real-world Examples</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">User permissions</span>
                <Tooltip content="This user has read-only access">
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">API rate limit</span>
                <Tooltip content="1000 requests per hour">
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Modal Component</h2>
        
        <div className="space-y-6">
          {/* Basic Modal */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Basic Modal</h3>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded"
            >
              Open Modal
            </button>
            
            <Modal
              open={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Example Modal"
              size="md"
            >
              <div className="space-y-4">
                <p>This is a basic modal with some content.</p>
                <p className="text-sm text-muted-foreground">
                  You can close it by clicking the X button, pressing ESC, or clicking outside.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </Modal>
          </div>

          {/* Form Modal */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Form Modal</h3>
            <button
              onClick={() => setFormModalOpen(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded"
            >
              Open Form Modal
            </button>
            
            <Modal
              open={formModalOpen}
              onClose={() => setFormModalOpen(false)}
              title="Create New Item"
              size="lg"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setFormModalOpen(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-border rounded bg-background"
                    placeholder="Enter title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-border rounded bg-background"
                    rows={4}
                    placeholder="Enter description"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setFormModalOpen(false)}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded"
                  >
                    Create
                  </button>
                </div>
              </form>
            </Modal>
          </div>

          {/* Size Examples */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Different Sizes</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Available sizes: sm, md, lg, xl, full
            </p>
          </div>
        </div>
      </section>

      {/* Combined Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Combined Examples</h2>
        
        <div className="space-y-4">
          {/* User card with multiple utility widgets */}
          <div className="p-4 border border-border rounded-lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar fallback="JD" size="lg" status="online" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">John Doe</h3>
                    <Badge variant="success" icon={Check} size="sm">
                      Verified
                    </Badge>
                    <Tooltip content="Premium member since 2023">
                      <Badge variant="info" icon={Star} size="sm">
                        Premium
                      </Badge>
                    </Tooltip>
                  </div>
                  <p className="text-sm text-muted-foreground">john@example.com</p>
                </div>
              </div>
              <Tooltip content="View profile details">
                <button className="p-2 hover:bg-accent rounded">
                  <Info className="h-4 w-4" />
                </button>
              </Tooltip>
            </div>
            <div className="flex gap-2">
              <Badge size="sm" icon={Heart}>
                125 followers
              </Badge>
              <Badge size="sm" icon={Zap}>
                Active today
              </Badge>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
