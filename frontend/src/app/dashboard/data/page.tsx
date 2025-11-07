"use client";

import { DataTable } from "@/components/dashboard/DataTable";

export default function DataPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Data Management
          </h1>
          <p className="text-gray-600">
            Manage and view your data in organized tables.
          </p>
        </div>
      </div>

      <DataTable />
    </div>
  );
}