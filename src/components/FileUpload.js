import { useState, useRef } from "react";
import { useGallery } from "../context/GalleryContext";
import { toast } from "react-toastify";
import axiosInstance from "../lib/axiosInstance"; // Import the axios instance with credentials

export default function FileUpload() {
  // Define a URL da API com base no ambiente
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const { triggerRefresh } = useGallery();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files[0];

    if (!file) {
      toast.warn("Por favor, selecione um ficheiro para carregar!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      toast.info("A carregar ficheiro na Blockchain ...");
      
      console.log('Uploading file to blockchain...'); // Debug message
      const response = await axiosInstance.post('/api/pinata', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Axios throws on 4xx/5xx responses, so if we get here, it was successful
      console.log('Upload response:', response.data); // Debug response
      toast.success("Ficheiro carregado com sucesso na Blockchain.");
      triggerRefresh(); // Atualiza a galeria após upload
    } catch (error) {
      console.error("Erro ao carregar o ficheiro:", error.response?.data || error.message);
      
      // Check if the error is related to a duplicate file
      const errorDetails = error.response?.data?.details;
      
      // Check various ways Pinata might report a duplicate file
      if (errorDetails) {
        console.log("Error details:", errorDetails); // Debug log
        
        // Check if it's a duplicate file error
        const isDuplicateError = 
          (typeof errorDetails === 'object' && errorDetails.error === 'File with the same hash already exists') ||
          (typeof errorDetails === 'string' && errorDetails.includes('already pinned')) ||
          (typeof errorDetails === 'object' && errorDetails.error && errorDetails.error.includes('already pinned'));
        
        if (isDuplicateError) {
          toast.warning("Esta imagem já existe na Blockchain. Não é possível duplicar o mesmo conteúdo.");
          return;
        }
      }
      
      // Default error message
      toast.error(error.response?.data?.error || "Erro ao carregar o ficheiro na Blockchain");
    } finally {
      setLoading(false);
      setSelectedFile(null);
      fileInputRef.current.value = ""; // Resetar o campo de input
    }
  };

  return (
    <div className="p-5 bg-gray-50 rounded-lg shadow-sm mb-5">
      <h3 className="text-lg md:text-xl text-gray-800 mb-4 font-semibold">
        Upload de Ficheiros para Blockchain
      </h3>
      
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center border-2 border-dashed border-gray-300 rounded bg-white p-2 gap-2">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="w-[140px] flex-shrink-0"
            />
            {selectedFile && (
              <div className="flex-1 text-gray-600 truncate min-w-0">
                {selectedFile.name}
              </div>
            )}
          </div>
        </div>
        
        <button 
          onClick={handleUpload} 
          disabled={loading}
          className={`
            flex items-center gap-2 px-4 py-2 rounded
            font-medium text-white whitespace-nowrap
            transition-colors duration-300
            ${loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
            }
          `}
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin">⌛</span>
              A carregar...
            </>
          ) : (
            'Upload para Blockchain'
          )}
        </button>
      </div>
    </div>
  );
}

