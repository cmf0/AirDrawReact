import { useState, useRef } from "react";
import { useGallery } from "../context/GalleryContext";
import { toast } from "react-toastify";
import axios from "axios";

export default function FileUpload() {
  // Define a URL da API com base no ambiente
  const API_URL = process.env.NEXT_PUBLIC_APIS_URL_REMOTE;
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const { triggerRefresh } = useGallery();

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
      
      console.log('Uploading to:', `${API_URL}/api/pinata`); // Debug URL
      const response = await axios.post(`${API_URL}/api/pinata`, formData, {
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
      fileInputRef.current.value = ""; // Resetar o campo de input
    }
  };

  return (
    <div>
      <h3>1. Upload de Ficheiros "Localhost" para Blockchain (IPFS)</h3>
      <input type="file" ref={fileInputRef} />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "A carregar..." : "Upload do ficheiro na Blockchain (IPFS)"}
      </button>
    </div>
  );
}

