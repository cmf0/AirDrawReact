import axios from "axios";
import { createContext, useState, useContext, useEffect, useRef } from "react";

const GalleryContext = createContext();

export function GalleryProvider({ children }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(false);
  const [message, setMessage] = useState("");
  const API_URL = process.env.NEXT_PUBLIC_APIS_URL_REMOTE;
  
  // Keep track of deleted files to prevent them from reappearing
  const deletedFilesRef = useRef(new Set());

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/pinata?timestamp=${new Date().getTime()}`);
      console.log("Ficheiros obtidos com sucesso:", response.data);
      
      // Filter out any files that were deleted in this session
      const filteredFiles = response.data.filter(
        file => !deletedFilesRef.current.has(file.ipfs_pin_hash)
      );
      
      setFiles(filteredFiles);
    } catch (error) {
      console.error("Erro ao buscar os ficheiros:", error.message);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const triggerRefresh = () => setRefreshSignal((prev) => !prev);
  
  // Override the setFiles function to track deleted files
  const setFilesWithTracking = (newFilesOrUpdater) => {
    if (typeof newFilesOrUpdater === 'function') {
      setFiles(prevFiles => {
        const newFiles = newFilesOrUpdater(prevFiles);
        
        // Find files that were removed in this update
        prevFiles.forEach(prevFile => {
          if (!newFiles.some(newFile => newFile.ipfs_pin_hash === prevFile.ipfs_pin_hash)) {
            deletedFilesRef.current.add(prevFile.ipfs_pin_hash);
          }
        });
        
        return newFiles;
      });
    } else {
      setFiles(newFilesOrUpdater);
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  useEffect(() => {
    fetchFiles();
  }, [refreshSignal]);

  return (
    <GalleryContext.Provider value={{ 
      files, 
      setFiles: setFilesWithTracking, 
      loading, 
      triggerRefresh, 
      message, 
      showMessage 
    }}>
      {children}
    </GalleryContext.Provider>
  );
}

export function useGallery() {
  return useContext(GalleryContext);
}
