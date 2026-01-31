import React, { useState, useCallback } from 'react';
import { createWorker } from 'tesseract.js';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../supabase/config';

type VerificationResult = {
  status: 'Verified' | 'NotFound' | 'Mismatch' | 'Error' | 'Idle';
  message: string;
  data?: any;
};

const VerifyLegacyPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<VerificationResult>({ status: 'Idle', message: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResult({ status: 'Idle', message: '' });
      setProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png'], 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  const handleVerification = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setResult({ status: 'Idle', message: 'Starting verification...' });

    const worker = await createWorker('eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          setProgress(Math.round(m.progress * 100));
        }
      },
    });
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();

    const rollNumberMatch = text.match(/Roll No[:\s]+([\w-]+)/i);
    const nameMatch = text.match(/Name[:\s]+([a-zA-Z\s]+)/i);
    const extractedRollNumber = rollNumberMatch ? rollNumberMatch[1] : null;
    const extractedName = nameMatch ? nameMatch[1].trim() : null;

    if (!extractedRollNumber) {
      setResult({ status: 'Error', message: 'Could not extract Roll Number from the document.' });
      setIsProcessing(false);
      return;
    }

    const { data, error } = await supabase
      .from('certificates')
      .select(`*, universities(name)`)
      .eq('roll_number', extractedRollNumber)
      .single();

    const logPayload = {
        extracted_details: { extractedRollNumber, extractedName, fullText: text },
        status: '',
        matched_certificate_id: data?.id || null
    };

    if (error || !data) {
      logPayload.status = 'NotFound';
      setResult({ status: 'NotFound', message: `No official record found for Roll Number: ${extractedRollNumber}.` });
    } else if (extractedName && data.issued_to.toLowerCase() !== extractedName.toLowerCase()) {
      logPayload.status = 'Mismatch';
      setResult({
        status: 'Mismatch',
        message: 'Record found, but the name does not match. Potential tampering detected.',
        data: data,
      });
    } else {
      logPayload.status = 'Verified';
      setResult({ status: 'Verified', message: 'Certificate is authentic and matches official records.', data: data });
    }
    
    await supabase.from('verification_logs').insert(logPayload);
    setIsProcessing(false);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Legacy Certificate Validator</h1>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        {file ? <p>{file.name}</p> : <p>Drag & drop a certificate file here, or click to select</p>}
      </div>

      {file && (
        <button onClick={handleVerification} disabled={isProcessing} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400">
          {isProcessing ? `Processing... ${progress}%` : 'Verify Certificate'}
        </button>
      )}

      {result.status !== 'Idle' && (
        <div className={`mt-6 p-4 rounded border ${
            result.status === 'Verified' ? 'bg-green-100 border-green-500 text-green-800' : 
            'bg-red-100 border-red-500 text-red-800'
        }`}>
            <h3 className="font-bold text-lg">{result.status}</h3>
            <p>{result.message}</p>
            {result.data && <pre className="mt-2 bg-gray-100 p-2 rounded text-sm text-black">{JSON.stringify(result.data, null, 2)}</pre>}
        </div>
      )}
    </div>
  );
};

export default VerifyLegacyPage;
