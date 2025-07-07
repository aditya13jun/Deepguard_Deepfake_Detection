import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, AlertTriangle, CheckCircle } from 'lucide-react';

const Detection = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ type: 'fake' | 'real'; confidence: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
  
    setAnalyzing(true);
    setResult(null);
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await fetch('http://127.0.0.1:5000/detect', {
        method: 'POST',
        body: formData,
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setResult({
          type: data.type,
          confidence: data.confidence,
        });
      } else {
        console.error('Detection error:', data.error);
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error('Server error:', error);
      alert('Server error');
    }
  
    setAnalyzing(false);
  };
  

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-xl"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">Deepfake Detection</h1>
            <p className="text-gray-400">Upload an image or video to analyze for potential manipulation</p>
          </div>

          <div className="space-y-8">
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="h-12 w-12 text-purple-500 mb-4" />
                <span className="text-sm text-gray-400">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </span>
              </label>
            </div>

            {preview && (
              <div className="space-y-4">
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-900">
                  {file?.type.startsWith('image/') ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <video
                      src={preview}
                      controls
                      className="w-full h-full"
                    />
                  )}
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {analyzing ? 'Analyzing...' : 'Analyze'}
                </button>

                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg ${
                      result.type === 'fake'
                        ? 'bg-red-900/50 border border-red-700'
                        : 'bg-green-900/50 border border-green-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {result.type === 'fake' ? (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      <span className="text-white font-medium">
                        {result.type === 'fake'
                          ? `This media appears to be manipulated with ${result.confidence}% confidence`
                          : `This media appears to be authentic with ${result.confidence}% confidence`}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Detection;
