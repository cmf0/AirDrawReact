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
    <div style={{
      padding: "20px",
      backgroundColor: "#f8f9fa",
      borderRadius: "10px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      marginBottom: "20px"
    }}>
      <h3 style={{
        fontSize: "1.2rem",
        color: "#333",
        marginBottom: "15px",
        fontWeight: "600"
      }}>Upload de Ficheiros para Blockchain</h3>
      
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <div style={{
            position: "relative",
            flex: "1"
          }}>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{
                flex: "1",
                padding: "8px",
                border: "2px dashed #ccc",
                borderRadius: "5px",
                backgroundColor: "white",
                cursor: "pointer",
                width: "100%"
              }}
            />
          </div>
          <button 
            onClick={handleUpload} 
            disabled={loading}
            style={{
              backgroundColor: loading ? "#ccc" : "#007bff",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "500",
              transition: "background-color 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap"
            }}
          >
            {loading ? (
              <>
                <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⌛</span>
                A carregar...
              </>
            ) : (
              <>
                <span>📤</span>
                Upload para Blockchain
              </>
            )}
          </button>
        </div>
        {selectedFile && (
          <div style={{
            fontSize: "0.9rem",
            color: "#666",
            display: "flex",
            alignItems: "center",
            gap: "5px"
          }}>
            <span>📎</span>
            <span>Ficheiro selecionado: {selectedFile.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

