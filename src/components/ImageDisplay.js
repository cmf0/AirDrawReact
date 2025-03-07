import { toast } from "react-toastify";
import { useGallery } from "../context/GalleryContext";
import { useState, useEffect } from "react";

export default function ImageDisplay() {
  const { files, loading, deleteFile } = useGallery();
  const API_URL = process.env.NEXT_PUBLIC_APIS_URL_REMOTE;
  const [imageErrors, setImageErrors] = useState({});

  // Debug: Log the files data structure
  useEffect(() => {
    console.log("Files in ImageDisplay:", files);
  }, [files]);

  // Handle delete button click
  const handleDelete = async (hash) => {
    const confirmDelete = window.confirm("Tem a certeza que deseja apagar este ficheiro?");
    if (!confirmDelete) return;

    toast.info("A apagar ficheiro na Blockchain ...");
    const success = await deleteFile(hash);
    
    if (success) {
      toast.success("Ficheiro apagado com sucesso !");
    }
  };

  // Handle image error by trying alternative gateways
  const handleImageError = (hash, index) => {
    console.error(`Error loading image ${hash} from gateway ${index}`);
    
    // Update the error state to try the next gateway
    setImageErrors(prev => ({
      ...prev,
      [hash]: (prev[hash] || 0) + 1
    }));
  };

  // Get the appropriate gateway URL based on error count
  const getImageUrl = (hash) => {
    const errorCount = imageErrors[hash] || 0;
    const gateways = [
      `https://ipfs.io/ipfs/${hash}`,
      `https://cloudflare-ipfs.com/ipfs/${hash}`,
      `https://gateway.pinata.cloud/ipfs/${hash}`,
      `https://ipfs.infura.io/ipfs/${hash}`,
      `https://dweb.link/ipfs/${hash}`
    ];
    
    // If we've tried all gateways, return a placeholder
    if (errorCount >= gateways.length) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjYWFhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSI+SW1hZ2UgTm90IEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
    }
    
    return gateways[errorCount];
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <p style={{ fontSize: "18px", color: "#555" }}>
          Please Wait a Moment, Blockchain is Synchronizing the Data Storage...
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3>2. Ficheiro Armazenados na Blockchain (IPFS)</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        {files && files.length > 0 ? (
          files.map((file, index) => {
            // Debug: Log each file object
            console.log(`File ${index}:`, file);
            
            // Check if ipfsHash exists
            if (!file || !file.ipfsHash) {
              console.error(`File ${index} has no ipfsHash:`, file);
              return null;
            }
            
            return (
              <div
                key={file.ipfsHash || index}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  overflow: "hidden",
                  textAlign: "center",
                }}
              >
                <img
                  src={getImageUrl(file.ipfsHash)}
                  alt={`Image ${file.ipfsHash}`}
                  style={{ width: "100%", height: "150px", objectFit: "cover" }}
                  onError={() => handleImageError(file.ipfsHash, imageErrors[file.ipfsHash] || 0)}
                />
                <div style={{ padding: "5px", fontSize: "12px", color: "#666" }}>
                  {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'No date'}
                </div>
                <button
                  onClick={() => handleDelete(file.ipfsHash)}
                  style={{
                    marginTop: "5px",
                    marginBottom: "10px",
                    padding: "5px 10px",
                    border: "none",
                    background: "#ff4d4d",
                    color: "#fff",
                    cursor: "pointer",
                    borderRadius: "3px",
                  }}
                >
                  Apagar
                </button>
              </div>
            );
          })
        ) : (
          <p>Não há ficheiros disponíveis na Blockchain IPFS.</p>
        )}
      </div>
    </div>
  );
}