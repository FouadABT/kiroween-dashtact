"use client";

import { useEffect } from "react";
import { DataTable } from "@/components/dashboard/DataTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { useMetadata } from "@/contexts/MetadataContext";

export default function DataPage() {
  const { updateMetadata } = useMetadata();

  // Set page metadata on mount
  useEffect(() => {
    updateMetadata({
      title: "Data Management",
      description: "Manage your data and records",
      keywords: ["data", "management", "records"],
    });
  }, [updateMetadata]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Management"
        description="Manage and view your data in organized tables."
      />

      <DataTable />
    </div>
  );
}