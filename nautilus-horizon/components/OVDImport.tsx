// OVD Import Component - File upload and validation
import React, { useState, useRef, useEffect } from 'react';
import { uploadOVDFile } from '../services/ovdService';
import { OVDImportResult } from '../types/ovd';

interface Vessel {
  id: string;
  name: string;
  imo_number: string;
  ship_type: string;
  fleet_name?: string;
}

interface Fleet {
  id: string;
  name: string;
  description: string;
}

interface OVDImportProps {
  voyageId?: string;
  onImportComplete?: (result: OVDImportResult) => void;
}

const OVDImport: React.FC<OVDImportProps> = ({ voyageId, onImportComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFleet, setSelectedFleet] = useState<string>('');
  const [selectedVessel, setSelectedVessel] = useState<string>('');
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [allVessels, setAllVessels] = useState<Vessel[]>([]);
  const [filteredVessels, setFilteredVessels] = useState<Vessel[]>([]);
  const [loadingFleets, setLoadingFleets] = useState(true);
  const [loadingVessels, setLoadingVessels] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<OVDImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch fleets from database
  useEffect(() => {
    const fetchFleets = async () => {
      try {
        const response = await fetch('http://localhost:8080/vessels/api/fleets', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setFleets(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch fleets:', err);
      } finally {
        setLoadingFleets(false);
      }
    };
    fetchFleets();
  }, []);
  
  // Fetch vessels from database
  useEffect(() => {
    const fetchVessels = async () => {
      try {
        const response = await fetch('http://localhost:8080/vessels/api/vessels', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setAllVessels(data.data || []);
          setFilteredVessels(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch vessels:', err);
      } finally {
        setLoadingVessels(false);
      }
    };
    fetchVessels();
  }, []);
  
  // Filter vessels by selected fleet
  useEffect(() => {
    if (selectedFleet) {
      const filtered = allVessels.filter(v => v.fleet_name === selectedFleet);
      setFilteredVessels(filtered);
      setSelectedVessel(''); // Reset vessel selection when fleet changes
    } else {
      setFilteredVessels(allVessels);
    }
  }, [selectedFleet, allVessels]);
  
  const handleFileSelect = (file: File) => {
    // Validate file type
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setError('Invalid file type. Please upload an Excel file (.xlsx or .xls)');
      return;
    }
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size exceeds 10MB limit');
      return;
    }
    
    setSelectedFile(file);
    setError(null);
    setResult(null);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }
    
    if (!selectedVessel) {
      setError('Please select a vessel first');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      // Simulate progress (in real implementation, use XMLHttpRequest for progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      const importResult = await uploadOVDFile(selectedFile, voyageId, selectedVessel);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setResult(importResult);
      
      if (onImportComplete) {
        onImportComplete(importResult);
      }
      
      // Reset after success
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };
  
  return (
    <div className="space-y-4">
      {/* Fleet Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-secondary">
          Filter by Fleet (Optional)
        </label>
        <select
          value={selectedFleet}
          onChange={(e) => setSelectedFleet(e.target.value)}
          className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={loadingFleets}
        >
          <option value="">-- All Fleets --</option>
          {fleets.map((fleet) => (
            <option key={fleet.id} value={fleet.name}>
              {fleet.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Vessel Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-text-secondary">
          Select Vessel *
        </label>
        <select
          value={selectedVessel}
          onChange={(e) => setSelectedVessel(e.target.value)}
          className="w-full px-3 py-2 bg-card border border-subtle rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={loadingVessels}
        >
          <option value="">-- Select a vessel --</option>
          {filteredVessels.map((vessel) => (
            <option key={vessel.id} value={vessel.id}>
              {vessel.name} • IMO: {vessel.imo_number} • {vessel.ship_type}
              {vessel.fleet_name && ` • ${vessel.fleet_name}`}
            </option>
          ))}
        </select>
        {selectedFleet && filteredVessels.length === 0 && (
          <p className="text-xs text-warning">No vessels in selected fleet</p>
        )}
        {filteredVessels.length === 0 && !loadingVessels && !selectedFleet && (
          <p className="text-xs text-warning">No vessels found in database</p>
        )}
        {selectedFleet && filteredVessels.length > 0 && (
          <p className="text-xs text-text-secondary">
            {filteredVessels.length} vessel{filteredVessels.length !== 1 ? 's' : ''} in {selectedFleet}
          </p>
        )}
      </div>
      
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-subtle hover:border-primary/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="text-5xl">📄</div>
          <div>
            <p className="text-lg font-medium text-text-primary">
              Drop OVD Excel file here or click to browse
            </p>
            <p className="text-sm text-text-secondary mt-1">
              Supports .xlsx and .xls files (max 10MB)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileInputChange}
            className="hidden"
            id="ovd-file-input"
          />
          <label
            htmlFor="ovd-file-input"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 cursor-pointer transition-colors"
          >
            Browse Files
          </label>
        </div>
      </div>
      
      {/* Selected File Info */}
      {selectedFile && (
        <div className="p-4 bg-card border border-subtle rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📊</div>
              <div>
                <p className="font-medium text-text-primary">{selectedFile.name}</p>
                <p className="text-sm text-text-secondary">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedFile(null);
                setError(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="text-text-secondary hover:text-text-primary"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Uploading...</span>
            <span className="text-text-primary font-medium">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-subtle rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-error/10 border border-error rounded-lg">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}
      
      {/* Success Result */}
      {result && (
        <div className="p-4 bg-success/10 border border-success rounded-lg space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">✅</span>
            <p className="font-medium text-success">Import Successful!</p>
          </div>
          <div className="text-sm text-text-secondary space-y-1">
            <p>Records Processed: {result.recordsProcessed}</p>
            <p className="text-success">Records Imported: {result.recordsImported}</p>
            {result.recordsFailed > 0 && (
              <p className="text-warning">Records Failed: {result.recordsFailed}</p>
            )}
          </div>
          {result.errors && result.errors.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-text-secondary hover:text-text-primary">
                View Errors ({result.errors.length})
              </summary>
              <div className="mt-2 p-2 bg-card rounded text-xs max-h-40 overflow-y-auto">
                {result.errors.map((err, idx) => (
                  <p key={idx} className="text-error">{err}</p>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
      
      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || !selectedVessel || isUploading}
        className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
          selectedFile && selectedVessel && !isUploading
            ? 'bg-primary text-white hover:bg-primary/80'
            : 'bg-subtle text-text-muted cursor-not-allowed'
        }`}
      >
        {isUploading ? 'Uploading...' : 'Upload and Import'}
      </button>
    </div>
  );
};

export default OVDImport;

