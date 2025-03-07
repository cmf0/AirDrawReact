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
      console.log("Fetching images with auth token...");
      const response = await axiosInstance.get(`/api/pinata?timestamp=${new Date().getTime()}`);
      
      // Log the raw response for debugging
      console.log("Raw API Response:", response);
      console.log("API Response Data:", JSON.stringify(response.data, null, 2));
      
      // Check the structure of the response
      if (response.data && response.data.success === true && Array.isArray(response.data.images)) {
        const images = response.data.images;
        console.log(`Found ${images.length} images in response`);
        
        if (images.length === 0) {
          console.log("No images found in the response");
          setFiles([]);
          return;
        }
        
        // Log the first image to see its structure
        console.log("First image in response:", images[0]);
        
        // Process the images from the response
        const processedImages = images
          .filter(img => img && typeof img === 'object') // Ensure we have valid objects
          .map(img => {
            // Ensure we have the correct property names
            if (!img.ipfsHash) {
              console.error("Missing ipfsHash in image:", img);
              return null;
            }
            
            return {
              ipfsHash: img.ipfsHash,
              createdAt: img.createdAt || new Date().toISOString()
            };
          })
          .filter(Boolean); // Remove any null entries
        
        console.log("Processed images:", processedImages);
        
        if (processedImages.length === 0) {
          console.error("No valid images found after processing");
          setFiles([]);
          return;
        }
        
        // Filter out any files that were deleted in this session
        const filteredFiles = processedImages.filter(
          file => !deletedFilesRef.current.has(file.ipfsHash)
        );
        
        setFiles(filteredFiles);
      } else {
        console.error("Unexpected response format:", response.data);
        setFiles([]);
        showMessage("Error: Unexpected response format from server");
      }
    } catch (error) {
      console.error("Error fetching files:", error);
      console.error("Error details:", error.response?.data || error.message);
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
      // Get the token if we don't have it yet
      const token = authToken || await fetchAuthToken();
      
      if (!token) {
        console.error("No authentication token available");
        showMessage("Authentication required to delete files");
        return false;
      }
      
      console.log(`Deleting file with hash: ${ipfsHash}`);
      const response = await axiosInstance.delete(`/api/pinata?hash=${ipfsHash}`);
      
      console.log("Delete response:", response.data);
      
      // Add to deleted files set to prevent it from reappearing
      deletedFilesRef.current.add(ipfsHash);
      
      // Remove from current files
      setFiles(prevFiles => prevFiles.filter(file => file.ipfsHash !== ipfsHash));
      
      showMessage("File deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      console.error("Error details:", error.response?.data || error.message);
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
