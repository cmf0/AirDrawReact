import axios from "axios";
import { createContext, useState, useContext, useEffect, useRef } from "react";
import axiosInstance from "../lib/axiosInstance"; // Import the axios instance with credentials

const GalleryContext = createContext();

export function GalleryProvider({ children }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(false);
  const [message, setMessage] = useState("");
  const [authToken, setAuthToken] = useState(null);
  const API_URL = process.env.NEXT_PUBLIC_APIS_URL_REMOTE;
  
  // Keep track of deleted files to prevent them from reappearing
  const deletedFilesRef = useRef(new Set());

  // Fetch the JWT token from the session
  const fetchAuthToken = async () => {
    try {
      const { data } = await axiosInstance.get("/api/session");
      if (data.valid && data.token) {
        console.log("Auth token obtained successfully");
        setAuthToken(data.token);
        return data.token;
      } else {
        console.error("Failed to get valid session data");
        return null;
      }
    } catch (error) {
      console.error("Error fetching auth token:", error.message);
      return null;
    }
  };

  const fetchFiles = async () => {
    setLoading(true);
    try {
      // Get the token if we don't have it yet
      const token = authToken || await fetchAuthToken();
      
      if (!token) {
        console.error("No authentication token available");
        setFiles([]);
        showMessage("Authentication required to view gallery");
        setLoading(false);
        return;
      }
      
      // Make the request with the auth token
      const response = await axios.get(`${API_URL}/api/pinata?timestamp=${new Date().getTime()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("Files fetched successfully:", response.data);
      
      // Filter out any files that were deleted in this session
      const filteredFiles = response.data.images ? response.data.images.filter(
        file => !deletedFilesRef.current.has(file.ipfsHash)
      ) : [];
      
      setFiles(filteredFiles);
    } catch (error) {
      console.error("Error fetching files:", error.message);
      setFiles([]);
      showMessage("Error loading gallery: " + (error.response?.data?.error || error.message));
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
          if (!newFiles.some(newFile => newFile.ipfsHash === prevFile.ipfsHash)) {
            deletedFilesRef.current.add(prevFile.ipfsHash);
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

  // Delete a file using the auth token
  const deleteFile = async (ipfsHash) => {
    try {
      const token = authToken || await fetchAuthToken();
      
      if (!token) {
        showMessage("Authentication required to delete files");
        return false;
      }
      
      await axios.delete(`${API_URL}/api/pinata?hash=${ipfsHash}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Add to deleted files set
      deletedFilesRef.current.add(ipfsHash);
      
      // Remove from current files
      setFiles(prevFiles => prevFiles.filter(file => file.ipfsHash !== ipfsHash));
      
      showMessage("File deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      showMessage("Error deleting file: " + (error.response?.data?.error || error.message));
      return false;
    }
  };

  useEffect(() => {
    fetchAuthToken().then(() => fetchFiles());
  }, [refreshSignal]);

  return (
    <GalleryContext.Provider value={{ 
      files, 
      setFiles: setFilesWithTracking, 
      loading, 
      triggerRefresh, 
      message, 
      showMessage,
      deleteFile,
      authToken
    }}>
      {children}
    </GalleryContext.Provider>
  );
}

export function useGallery() {
  return useContext(GalleryContext);
}
