/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, User, MapPin, Zap, Settings, ClipboardList, CheckCircle2, XCircle, Phone, PenTool, Eye, X, Share2, History, Trash2, ShieldCheck, Database, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import SignatureCanvas from 'react-signature-canvas';
import { saveReport, getAllReports, deleteReport, getReportBlob, SavedReport } from './services/db';
import { GoogleGenAI } from "@google/genai";

interface ReportData {
  date: string;
  customerName: string;
  address: string;
  kvaRating: string;
  engineHours: string;
  engineMake: string;
  engineModel: string;
  engineSrNo: string;
  alternatorMake: string;
  alternatorModel: string;
  alternatorSrNo: string;
  remarks: string;
  status: 'Done' | 'Not Done';
  engineerName: string;
  customerRemarks: string;
  customerSignatureName: string;
  customerSignature?: string;
  mobileNo: string;
}

const initialData: ReportData = {
  date: new Date().toISOString().split('T')[0],
  customerName: '',
  address: '',
  kvaRating: '',
  engineHours: '',
  engineMake: '',
  engineModel: '',
  engineSrNo: '',
  alternatorMake: '',
  alternatorModel: '',
  alternatorSrNo: '',
  remarks: '',
  status: 'Done',
  engineerName: '',
  customerRemarks: '',
  customerSignatureName: '',
  customerSignature: '',
  mobileNo: '',
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
};

const ReportContent = React.forwardRef<HTMLDivElement, { data: ReportData }>(({ data }, ref) => (
  <div 
    ref={ref}
    className="bg-white mx-auto overflow-hidden"
    style={{ 
      width: '210mm', 
      minHeight: '297mm', 
      padding: '15mm',
      fontFamily: "'Helvetica', 'Arial', sans-serif",
      color: '#000000',
      backgroundColor: '#ffffff',
      border: '1px solid #000000'
    }}
  >
    {/* Header */}
    <div className="flex justify-between items-start mb-4 pb-4" style={{ borderBottom: '2px solid #000000' }}>
      <div className="flex-1">
        <div className="text-[10px] font-bold mb-1">JAY SWAMINARAYAN</div>
        <div className="flex items-center w-full">
          <div className="flex flex-col">
            {/* Logo SVG Reconstruction */}
            <svg width="350" height="60" viewBox="0 0 350 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* SUSHIL ENGINEERS - Stylized Text */}
              <text x="0" y="35" fontFamily="Arial Black, sans-serif" fontSize="32" fontWeight="900" fill="#312e81" letterSpacing="-1">SUSHIL ENGINEERS</text>
              
              {/* Three Lines */}
              <line x1="0" y1="45" x2="140" y2="45" stroke="#dc2626" strokeWidth="1.5" />
              <line x1="0" y1="50" x2="140" y2="50" stroke="#312e81" strokeWidth="1.5" />
              <line x1="0" y1="55" x2="140" y2="55" stroke="#dc2626" strokeWidth="1.5" />
              
              {/* Tagline */}
              <text x="145" y="55" fontFamily="Georgia, serif" fontSize="18" fontStyle="italic" fontWeight="bold" fill="#dc2626">We Generate POWER</text>
            </svg>
          </div>
        </div>
        <div className="text-[9px] mt-2 leading-tight">
          Plot No. 324, HSIIDC, Rai Industrial Estate,<br />
          Distt. Sonipat, Haryana -131029<br />
          Website : www.sushilengineers.net<br />
          Email- power@sushilengineers.net
        </div>
      </div>
    </div>

    <div className="text-center mb-6">
      <h2 
        className="text-2xl font-bold inline-block pb-1" 
        style={{ borderBottom: '2px solid #000000' }}
      >
        FIELD SERVICE REPORT
      </h2>
    </div>

    <div className="flex justify-end mb-4 pr-4">
      <div className="flex items-center text-sm font-bold">
        DATE:- 
        <span 
          className="font-normal px-6 inline-block min-w-[140px] text-center" 
          style={{ borderBottom: '1px solid #000000', paddingBottom: '4px', marginLeft: '8px', lineHeight: '1.4' }}
        >
          {formatDate(data.date)}
        </span>
      </div>
    </div>

    {/* Main Table */}
    <div style={{ border: '1px solid #000000' }} className="text-sm">
      {/* Customer Info */}
      <div className="flex" style={{ borderBottom: '1px solid #000000' }}>
        <div className="w-1/4 p-2 font-bold" style={{ borderRight: '1px solid #000000' }}>Customer's Name:-</div>
        <div className="w-3/4 p-2 font-bold uppercase">{data.customerName || '________________________________'}</div>
      </div>
      <div className="flex min-h-[60px]" style={{ borderBottom: '1px solid #000000' }}>
        <div className="w-1/4 p-2 font-bold flex items-center" style={{ borderRight: '1px solid #000000' }}>Address:-</div>
        <div className="w-3/4 p-2 whitespace-pre-wrap">{data.address || '________________________________'}</div>
      </div>

      {/* KVA & Engine Hours */}
      <div className="flex" style={{ borderBottom: '1px solid #000000' }}>
        <div className="w-1/4 p-2 font-bold" style={{ borderRight: '1px solid #000000' }}>KVA RATING:</div>
        <div className="w-1/4 p-2 text-center font-bold" style={{ borderRight: '1px solid #000000' }}>{data.kvaRating || '____'} KVA</div>
        <div className="w-1/4 p-2 font-bold" style={{ borderRight: '1px solid #000000' }}>Engine Hours:-</div>
        <div className="w-1/4 p-2 text-center">{data.engineHours || '____'}</div>
      </div>

      {/* Engine Specs */}
      <div className="flex" style={{ borderBottom: '1px solid #000000' }}>
        <div className="w-1/4 p-2 font-bold flex flex-col justify-center" style={{ borderRight: '1px solid #000000' }}>
          <span>Engine Make</span>
          <span>Model No:-</span>
          <span>Sr.No:-</span>
        </div>
        <div className="w-3/4 p-2 flex flex-col justify-center font-bold uppercase">
          <span>{data.engineMake || '________________'}</span>
          <span>{data.engineModel || '________________'}</span>
          <span>{data.engineSrNo || '________________'}</span>
        </div>
      </div>

      {/* Alternator Specs */}
      <div className="flex" style={{ borderBottom: '1px solid #000000' }}>
        <div className="w-1/4 p-2 font-bold flex flex-col justify-center" style={{ borderRight: '1px solid #000000' }}>
          <span>Alternator make</span>
          <span>Model no:-</span>
          <span>Sr. No:-</span>
        </div>
        <div className="w-3/4 p-2 flex flex-col justify-center font-bold uppercase">
          <span>{data.alternatorMake || '________________'}</span>
          <span>{data.alternatorModel || '________________'}</span>
          <span>{data.alternatorSrNo || '________________'}</span>
        </div>
      </div>

      {/* Remarks Section */}
      <div className="flex min-h-[200px]" style={{ borderBottom: '1px solid #000000' }}>
        <div className="w-1/4 p-2 font-bold" style={{ borderRight: '1px solid #000000' }}>Remarks/Work Done:</div>
        <div className="w-3/4 p-2 whitespace-pre-wrap">{data.remarks || ''}</div>
      </div>

      {/* Status & Engineer */}
      <div className="flex" style={{ borderBottom: '1px solid #000000' }}>
        <div className="w-1/4 p-2 font-bold flex flex-col justify-center" style={{ borderRight: '1px solid #000000' }}>
          <span>Work/complaint</span>
          <span>status:</span>
        </div>
        <div className="w-1/4 p-2 flex flex-col justify-center gap-1" style={{ borderRight: '1px solid #000000' }}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3" style={{ border: '1px solid #000000', backgroundColor: data.status === 'Done' ? '#000000' : 'transparent' }}></div>
            <span>Done</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3" style={{ border: '1px solid #000000', backgroundColor: data.status === 'Not Done' ? '#000000' : 'transparent' }}></div>
            <span>Not Done</span>
          </div>
        </div>
        <div className="w-1/4 p-2 font-bold flex flex-col justify-center text-center" style={{ borderRight: '1px solid #000000' }}>
          <span>Engineer's Name &</span>
          <span>Signature</span>
        </div>
        <div className="w-1/4 p-2 flex items-center justify-center font-bold italic">
          {data.engineerName}
        </div>
      </div>

      {/* Customer Remarks */}
      <div className="flex min-h-[80px]" style={{ borderBottom: '1px solid #000000' }}>
        <div className="w-1/4 p-2 font-bold flex flex-col justify-center" style={{ borderRight: '1px solid #000000' }}>
          <span>Customer's Remarks/</span>
          <span>Suggestion:</span>
        </div>
        <div className="w-3/4 p-2 whitespace-pre-wrap italic">
          {data.customerRemarks}
        </div>
      </div>

      {/* Customer Signature & Mobile */}
      <div className="flex">
        <div className="w-1/4 p-2 font-bold flex flex-col justify-center" style={{ borderRight: '1px solid #000000' }}>
          <span>Customer's Name &</span>
          <span>Signature</span>
        </div>
        <div className="w-1/4 p-2 flex flex-col items-center justify-center font-bold italic" style={{ borderRight: '1px solid #000000' }}>
          {data.customerSignature ? (
            <img src={data.customerSignature} alt="Signature" className="max-h-12 object-contain" referrerPolicy="no-referrer" />
          ) : (
            <div className="h-12"></div>
          )}
          <span className="text-[10px] mt-1">{data.customerSignatureName}</span>
        </div>
        <div className="w-1/4 p-2 font-bold flex items-center justify-center" style={{ borderRight: '1px solid #000000' }}>
          Mobile no :
        </div>
        <div className="w-1/4 p-2 flex items-center justify-center font-bold">
          {data.mobileNo}
        </div>
      </div>
    </div>
  </div>
));

ReportContent.displayName = 'ReportContent';

export default function App() {
  const [data, setData] = useState<ReportData>(initialData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'preview' | 'history'>('form');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [history, setHistory] = useState<SavedReport[]>([]);
  const [storageStatus, setStorageStatus] = useState<{ persisted: boolean; usage: number; quota: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signaturePadRef = useRef<SignatureCanvas>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
    checkStorageStatus();
  }, []);

  const checkStorageStatus = async () => {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const persisted = await navigator.storage.persisted?.() || false;
      setStorageStatus({
        persisted,
        usage: estimate.usage || 0,
        quota: estimate.quota || 0
      });
    }
  };

  const requestPersistentStorage = async () => {
    if (navigator.storage && navigator.storage.persist) {
      const persisted = await navigator.storage.persist();
      if (persisted) {
        alert('Persistent storage permission granted! Your reports will not be deleted by the browser.');
      } else {
        alert('Persistent storage permission denied. The browser may delete old reports if device storage is low.');
      }
      checkStorageStatus();
    }
  };

  const loadHistory = async () => {
    const reports = await getAllReports();
    setHistory(reports);
  };

  const handleDeleteHistory = async (id: string) => {
    if (confirm('Are you sure you want to delete this report from history?')) {
      await deleteReport(id);
      loadHistory();
    }
  };

  const handleViewHistory = async (report: SavedReport) => {
    try {
      const blob = await getReportBlob(report.id);
      const url = URL.createObjectURL(blob);
      setPdfBlob(blob);
      setPdfUrl(url);
      setShowPdfModal(true);
    } catch (error) {
      console.error('Failed to view report:', error);
      alert('Failed to load report from server.');
    }
  };

  const handleImportReport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file.');
      return;
    }

    try {
      const reportId = typeof crypto.randomUUID === 'function' 
        ? crypto.randomUUID() 
        : Date.now().toString(36) + Math.random().toString(36).substring(2);

      await saveReport({
        id: reportId,
        customerName: file.name.replace('.pdf', '').replace(/_/g, ' '),
        date: new Date().toISOString().split('T')[0],
        blob: file,
        timestamp: Date.now()
      });
      loadHistory();
      checkStorageStatus();
      alert('Report imported successfully!');
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import report.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const loadSampleData = () => {
    setData({
      date: '2024-03-09',
      customerName: 'M/s ONE PRASTHA REALTY LLP',
      address: 'Tajpur, Murthal RD, Sonipat Haryana .',
      kvaRating: '82.5',
      engineHours: '1245',
      engineMake: 'CUMMINS',
      engineModel: 'QSB4.5-G1',
      engineSrNo: '52G95525809',
      alternatorMake: 'Stamford',
      alternatorModel: '82.5KVA',
      alternatorSrNo: 'G25E220143',
      remarks: '1. Checked engine oil level and coolant level.\n2. Replaced fuel filters and air filters.\n3. Tested the generator under load for 30 minutes.\n4. All parameters found within normal range.',
      status: 'Done',
      engineerName: 'Rajesh Kumar',
      customerRemarks: 'Service was satisfactory. Engineer was professional.',
      customerSignatureName: 'Amit Singh',
      customerSignature: '',
      mobileNo: '9876543210',
    });
    signaturePadRef.current?.clear();
  };

  const handleAiAssist = async () => {
    if (!data.remarks.trim()) {
      alert('Please enter some basic remarks first.');
      return;
    }

    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a professional service engineer. Improve and polish the following field service report remarks to be more professional, technical, and clear. Keep the core information but fix grammar and use industry-standard terminology.
        
        Remarks: ${data.remarks}
        
        Return ONLY the polished remarks text.`,
      });

      if (response.text) {
        setData(prev => ({ ...prev, remarks: response.text }));
      }
    } catch (error) {
      console.error('AI Assist failed:', error);
      alert('Failed to connect to AI Assistant. Please try again later.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const clearSignature = () => {
    signaturePadRef.current?.clear();
    setData(prev => ({ ...prev, customerSignature: '' }));
  };

  const saveSignature = () => {
    if (signaturePadRef.current?.isEmpty()) return;
    const signatureData = signaturePadRef.current?.getTrimmedCanvas().toDataURL('image/png');
    setData(prev => ({ ...prev, customerSignature: signatureData }));
  };

  const downloadPDF = async () => {
    if (!captureRef.current) return;
    
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    let pdfWindow: Window | null = null;
    
    // Only try pre-opening on mobile to bypass popup blockers
    if (isMobile) {
      try {
        pdfWindow = window.open('', '_blank');
      } catch (e) {
        console.warn('Popup blocked or failed to open');
      }
    }

    setIsGenerating(true);
    try {
      // Small delay to ensure any pending renders are complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(captureRef.current, {
        scale: isMobile ? 2 : 3, // Lower scale on mobile to save memory
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: captureRef.current.offsetWidth,
        height: captureRef.current.offsetHeight,
        allowTaint: true,
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
      
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const fileName = `Field_Service_Report_${data.customerName.replace(/\s+/g, '_') || 'Report'}.pdf`;
      
      // Save to local DB with fallback for randomUUID
      const reportId = typeof crypto.randomUUID === 'function' 
        ? crypto.randomUUID() 
        : Date.now().toString(36) + Math.random().toString(36).substring(2);

      await saveReport({
        id: reportId,
        customerName: data.customerName || 'Untitled Report',
        date: data.date,
        blob: blob,
        timestamp: Date.now()
      });
      loadHistory();

      setPdfBlob(blob);
      setPdfUrl(url);
      setShowPdfModal(true);
      
      if (pdfWindow && !pdfWindow.closed) {
        pdfWindow.location.href = url;
      } else {
        // Fallback for desktop or if popup was blocked
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Final attempt to open for mobile if not already opened
        if (isMobile) {
          setTimeout(() => {
            window.open(url, '_blank');
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      if (pdfWindow) pdfWindow.close();
      alert('Failed to generate PDF. This can happen if the report is too large or device memory is low. Try again or reduce the amount of text in remarks.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!pdfBlob) return;
    try {
      const fileName = `Field_Service_Report_${data.customerName.replace(/\s+/g, '_') || 'Report'}.pdf`;
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
      
      // Check if sharing is supported and if the file is shareable
      if (navigator.share) {
        // Some browsers support navigator.share but not sharing files
        // We try sharing with files first
        try {
          await navigator.share({
            files: [file],
            title: 'Field Service Report',
            text: `Service report for ${data.customerName}`,
          });
          return; // Success
        } catch (shareError) {
          console.log('File sharing failed, trying text sharing:', shareError);
          // Fallback to sharing just the URL if file sharing fails
          if (pdfUrl) {
            await navigator.share({
              title: 'Field Service Report',
              text: `Service report for ${data.customerName}`,
              url: window.location.href // Sharing the app URL as a last resort if file fails
            });
          }
        }
      } else {
        throw new Error('Web Share API not supported');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Final fallback: trigger download
      if (pdfUrl) {
        const fileName = `Field_Service_Report_${data.customerName.replace(/\s+/g, '_') || 'Report'}.pdf`;
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = fileName;
        link.click();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="text-indigo-600 h-6 w-6 sm:h-8 sm:w-8" />
              Field Service Report Pro
            </h1>
            <p className="text-sm sm:text-base text-slate-500 mt-1">Generate professional engineering service reports instantly.</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-xl shadow-sm transition-all duration-200 ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white border-transparent'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <History className="mr-2 h-4 w-4" />
              History
            </button>
            <button
              onClick={loadSampleData}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-xl shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <ClipboardList className="mr-2 h-4 w-4 text-slate-500" />
              Load Sample
            </button>
            <button
              onClick={downloadPDF}
              disabled={isGenerating}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-200"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Export PDF
                </>
              )}
            </button>
          </div>
        </header>

        {/* Mobile Tabs */}
        <div className="xl:hidden flex mb-6 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'form' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Settings className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'preview' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Eye className="h-4 w-4" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'history' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <History className="h-4 w-4" />
            History
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* History Section (Full width when active on mobile, or side by side on desktop) */}
          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-1 xl:col-span-2 bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-indigo-500" />
                  <h2 className="text-lg font-semibold text-slate-800">Recent Reports</h2>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Import PDF
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImportReport} 
                      accept=".pdf" 
                      className="hidden" 
                    />
                    
                    {storageStatus && (
                      <>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg">
                          <Database className="h-3.5 w-3.5 text-slate-400" />
                          {(storageStatus.usage / (1024 * 1024)).toFixed(1)}MB used
                        </div>
                        
                        {storageStatus.persisted ? (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-lg">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Storage Permission: Granted
                          </div>
                        ) : (
                          <button 
                            onClick={requestPersistentStorage}
                            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-2.5 py-1.5 rounded-lg transition-all"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Request Storage Permission
                          </button>
                        )}
                      </>
                    )}
                  </div>
              </div>
              <div className="p-6">
                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500">No reports saved yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {history.map((item) => (
                      <div 
                        key={item.id}
                        className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-indigo-200 transition-all group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="bg-white p-2 rounded-lg shadow-sm">
                            <FileText className="h-6 w-6 text-indigo-600" />
                          </div>
                          <button 
                            onClick={() => handleDeleteHistory(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <h3 className="font-bold text-slate-900 truncate mb-1">{item.customerName}</h3>
                        <p className="text-xs text-slate-500 mb-4">{formatDate(item.date)}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewHistory(item)}
                            className="flex-1 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all"
                          >
                            View
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const blob = await getReportBlob(item.id);
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `Field_Service_Report_${item.customerName.replace(/\s+/g, '_')}.pdf`;
                                link.click();
                              } catch (error) {
                                console.error('Download failed:', error);
                                alert('Failed to download report.');
                              }
                            }}
                            className="p-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden ${
              activeTab === 'form' ? 'block' : (activeTab === 'history' ? 'hidden' : 'hidden xl:block')
            }`}
          >
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-500" />
                Report Details
              </h2>
            </div>
            <div className="p-4 sm:p-6 space-y-6 xl:max-h-[calc(100vh-300px)] xl:overflow-y-auto custom-scrollbar">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Customer Name
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={data.customerName}
                    onChange={handleChange}
                    placeholder="e.g. M/s One Prastha Realty LLP"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <ClipboardList className="h-3.5 w-3.5" /> Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={data.date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Address
                </label>
                <textarea
                  name="address"
                  value={data.address}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Full site address..."
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              {/* Technical Specs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" /> KVA Rating
                  </label>
                  <input
                    type="text"
                    name="kvaRating"
                    value={data.kvaRating}
                    onChange={handleChange}
                    placeholder="e.82.5 KVA"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <ClipboardList className="h-3.5 w-3.5" /> Engine Hours
                  </label>
                  <input
                    type="text"
                    name="engineHours"
                    value={data.engineHours}
                    onChange={handleChange}
                    placeholder="Current reading..."
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Engine Details */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Engine Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Make</label>
                    <input
                      type="text"
                      name="engineMake"
                      value={data.engineMake}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Model No</label>
                    <input
                      type="text"
                      name="engineModel"
                      value={data.engineModel}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Serial No</label>
                    <input
                      type="text"
                      name="engineSrNo"
                      value={data.engineSrNo}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Alternator Details */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Alternator Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Make</label>
                    <input
                      type="text"
                      name="alternatorMake"
                      value={data.alternatorMake}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Model No</label>
                    <input
                      type="text"
                      name="alternatorModel"
                      value={data.alternatorModel}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Serial No</label>
                    <input
                      type="text"
                      name="alternatorSrNo"
                      value={data.alternatorSrNo}
                      onChange={handleChange}
                      className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Remarks & Observations */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <PenTool className="h-3.5 w-3.5" /> Remarks / Work Done
                  </label>
                  <button
                    onClick={handleAiAssist}
                    disabled={isAiLoading || !data.remarks.trim()}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 disabled:opacity-50 transition-colors"
                  >
                    {isAiLoading ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-indigo-600 border-t-transparent" />
                    ) : (
                      <Zap className="h-3 w-3" />
                    )}
                    AI Polish
                  </button>
                </div>
                <textarea
                  name="remarks"
                  value={data.remarks}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Detailed observations and work performed..."
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Work Status</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="Done"
                        checked={data.status === 'Done'}
                        onChange={handleChange}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Done
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="Not Done"
                        checked={data.status === 'Not Done'}
                        onChange={handleChange}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700 flex items-center gap-1">
                        <XCircle className="h-4 w-4 text-rose-500" /> Not Done
                      </span>
                    </label>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Engineer's Name</label>
                  <input
                    type="text"
                    name="engineerName"
                    value={data.engineerName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Customer Feedback */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Customer's Remarks / Suggestions</label>
                <textarea
                  name="customerRemarks"
                  value={data.customerRemarks}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Customer's Name & Signature</label>
                  <input
                    type="text"
                    name="customerSignatureName"
                    value={data.customerSignatureName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none mb-2"
                  />
                  
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500">Draw Signature Below:</label>
                    <div className="border border-slate-300 rounded-lg bg-white overflow-hidden">
                      <SignatureCanvas 
                        ref={signaturePadRef}
                        penColor="black"
                        canvasProps={{
                          className: "w-full h-32 cursor-crosshair",
                        }}
                        onEnd={saveSignature}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                        Clear Signature
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Mobile No
                  </label>
                  <input
                    type="text"
                    name="mobileNo"
                    value={data.mobileNo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Preview Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`xl:sticky xl:top-8 ${
              activeTab === 'preview' ? 'block' : (activeTab === 'history' ? 'hidden' : 'hidden xl:block')
            }`}
          >
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden p-4 sm:p-8 min-h-[500px] sm:min-h-[800px] flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Live Preview
                </h2>
                <span className="text-xs text-slate-400 italic">A4 Format</span>
              </div>
              
              <div className="flex-1 overflow-auto custom-scrollbar bg-slate-100 rounded-xl p-4 sm:p-8">
              <div 
                className="mx-auto origin-top"
                style={{ 
                  transform: 'scale(var(--preview-scale, 1))',
                  width: '210mm',
                }}
              >
                <ReportContent ref={reportRef} data={data} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>

      {/* Hidden container for PDF capture - always 1:1 scale */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', overflow: 'hidden', width: '210mm', height: '297mm' }}>
        <ReportContent ref={captureRef} data={data} />
      </div>

      {/* PDF Modal */}
      <AnimatePresence>
        {showPdfModal && pdfUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Report Generated</h3>
                    <p className="text-xs text-slate-500">View, download or share your report</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPdfModal(false)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-slate-500" />
                </button>
              </div>
              
              <div className="flex-1 bg-slate-100 relative overflow-hidden">
                {/* PDF Preview Area */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-10 w-10 text-indigo-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-2">PDF Document Ready</h4>
                  <p className="text-sm text-slate-500 max-w-xs mb-6">
                    Your field service report has been generated successfully.
                  </p>
                  
                  {/* Embedded PDF for desktop only */}
                  <div className="hidden md:block absolute inset-0 bg-white">
                    <iframe 
                      src={pdfUrl} 
                      className="w-full h-full border-none"
                      title="PDF Preview"
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => window.open(pdfUrl, '_blank')}
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
                >
                  <Eye className="mr-2 h-5 w-5" />
                  View Full PDF
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  <Share2 className="mr-2 h-5 w-5" />
                  Share Report
                </button>
                <a
                  href={pdfUrl}
                  download={`Field_Service_Report_${data.customerName.replace(/\s+/g, '_') || 'Report'}.pdf`}
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        
        @media (max-width: 1279px) {
          :root {
            --preview-scale: 0.45;
          }
        }
        @media (max-width: 1023px) {
          :root {
            --preview-scale: 0.4;
          }
        }
        @media (max-width: 767px) {
          :root {
            --preview-scale: 0.35;
          }
        }
        @media (max-width: 639px) {
          :root {
            --preview-scale: 0.28;
          }
        }
        @media (min-width: 1280px) {
          :root {
            --preview-scale: 0.6;
          }
        }
        @media (min-width: 1536px) {
          :root {
            --preview-scale: 0.75;
          }
        }
      `}</style>
    </div>
  );
}
