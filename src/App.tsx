import React, { useState } from 'react';
import { FileText, Brain, Download, Sparkles, LogOut, User } from 'lucide-react';
import { FileUploader } from './components/FileUploader';
import { ProcessingStatus } from './components/ProcessingStatus';
import { InvoiceTable } from './components/InvoiceTable';
import { ExportButton } from './components/ExportButton';
import { ApiKeyInput } from './components/ApiKeyInput';
import { AuthWrapper } from './components/AuthWrapper';
import { geminiService } from './services/geminiService';
import { authService } from './services/authService';
import { InvoiceData, ProcessingStatus as ProcessingStatusType } from './types/invoice';

interface AppProps {
  onLogout?: () => void;
}

function AppContent({ onLogout }: AppProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatusType>({
    status: 'idle'
  });
  const [invoiceData, setInvoiceData] = useState<InvoiceData[]>([]);

  const currentUser = authService.getCurrentUser();

  const handleApiKeySet = (key: string) => {
    setApiKey(key);
    try {
      geminiService.initialize(key);
      setApiKeyValid(true);
      localStorage.setItem('gemini-api-key', key);
    } catch (error) {
      setApiKeyValid(false);
      console.error('Failed to initialize Gemini API:', error);
    }
  };

  // Load API key from localStorage on component mount
  React.useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini-api-key');
    if (savedApiKey) {
      handleApiKeySet(savedApiKey);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setInvoiceData([]);
  };

  const processInvoice = async () => {
    if (!selectedFile || !apiKey) return;

    setProcessingStatus({ status: 'processing', message: 'Analyzing invoice with AI...' });

    try {
      const extractedData = await geminiService.processInvoice(selectedFile);
      setInvoiceData(extractedData);
      setProcessingStatus({ 
        status: 'completed', 
        message: `Successfully extracted ${extractedData.length} item(s) from the invoice` 
      });
    } catch (error) {
      console.error('Error processing invoice:', error);
      setProcessingStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to process invoice'
      });
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  if (!apiKeyValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* User Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm text-gray-600">{currentUser?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI Invoice Processor
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Extract structured data from invoices using advanced AI technology
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <ApiKeyInput onApiKeySet={handleApiKeySet} isValid={apiKeyValid} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* User Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <User className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600">{currentUser?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Invoice Processor
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Extract structured data from invoices using AI and export to Excel
          </p>
          
          {/* Quick Stats */}
          <div className="flex justify-center space-x-8 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">AI-Powered</div>
              <div className="text-sm text-gray-500">Latest Models</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">Multi-Format</div>
              <div className="text-sm text-gray-500">PDF, JPEG, PNG</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">Excel Export</div>
              <div className="text-sm text-gray-500">Ready to Use</div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* File Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Upload Invoice</h2>
            </div>
            
            <FileUploader 
              onFileSelect={handleFileSelect}
              processing={processingStatus.status === 'processing'}
            />

            {selectedFile && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={processInvoice}
                  disabled={processingStatus.status === 'processing'}
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Process Invoice with AI
                  <Brain className="h-5 w-5 ml-2" />
                </button>
              </div>
            )}
          </div>

          {/* Processing Status */}
          {processingStatus.status !== 'idle' && (
            <ProcessingStatus status={processingStatus} />
          )}

          {/* Data Display and Export Section */}
          {invoiceData.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-emerald-600 font-semibold">2</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Review & Export Data</h2>
                </div>
                
                <ExportButton 
                  data={invoiceData}
                  disabled={processingStatus.status === 'processing'}
                />
              </div>

              <InvoiceTable 
                data={invoiceData}
                onDataChange={setInvoiceData}
              />
            </div>
          )}

          {/* Features Section */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
              Powerful Features
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">AI-Powered Extraction</h4>
                <p className="text-sm text-gray-600">
                  Advanced OCR and natural language processing to extract accurate data
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-emerald-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Multi-Format Support</h4>
                <p className="text-sm text-gray-600">
                  Process invoices in PDF, JPEG, PNG formats with high accuracy
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Download className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Excel Export</h4>
                <p className="text-sm text-gray-600">
                  Export processed data directly to Excel for further analysis
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthWrapper>
      <AppContent />
    </AuthWrapper>
  );
}

export default App;