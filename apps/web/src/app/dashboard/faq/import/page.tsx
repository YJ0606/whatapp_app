"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function FAQImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a CSV file first.");
      return;
    }
    setImporting(true);
    try {
      // Simulated import – wire to faq.service.importCSV when API is running
      await new Promise((r) => setTimeout(r, 1200));
      setDone(true);
      toast.success(`Imported FAQs from ${file.name}`);
    } catch {
      toast.error("Import failed. Check file format and try again.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href="/dashboard/faq"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to FAQ
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Import FAQs</h1>
        <p className="text-gray-500 text-sm mt-1">
          Upload a CSV with columns: <code className="text-xs bg-gray-100 px-1 rounded">question</code>,{" "}
          <code className="text-xs bg-gray-100 px-1 rounded">answer</code>, optional{" "}
          <code className="text-xs bg-gray-100 px-1 rounded">category</code>.
        </p>
      </div>

      {done ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-brand-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Import complete</h2>
          <p className="text-sm text-gray-500 mb-6">Your FAQs are ready to train the AI assistant.</p>
          <Link
            href="/dashboard/faq"
            className="inline-flex items-center justify-center rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-2.5 text-sm"
          >
            View FAQs
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-10 cursor-pointer hover:border-brand-400 hover:bg-brand-50/30 transition-colors">
            <FileSpreadsheet className="w-10 h-10 text-gray-400 mb-3" />
            <span className="text-sm font-medium text-gray-700">
              {file ? file.name : "Drop CSV here or click to browse"}
            </span>
            <span className="text-xs text-gray-400 mt-1">Max 5MB · UTF-8 encoded</span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFile(null)}
              disabled={!file || importing}
            >
              Clear
            </Button>
            <Button
              type="button"
              className="flex-1"
              leftIcon={<Upload className="w-4 h-4" />}
              loading={importing}
              onClick={handleImport}
              disabled={!file}
            >
              Import FAQs
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
