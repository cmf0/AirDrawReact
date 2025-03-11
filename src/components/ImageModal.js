import React from 'react';
import axiosInstance from '../lib/axiosInstance';

const ImageModal = ({ imageUrl, onClose, ipfsHash, onDelete }) => {
  const handleDelete = async () => {
    try {
      const response = await axiosInstance.delete(`/api/pinata?hash=${ipfsHash}`);
      if (response.status === 200) {
        alert('Image deleted successfully');
        onDelete(ipfsHash); // Notify parent component to update the gallery
        onClose();
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image. Please try again.');
    }
  };

  const handleSaveLocally = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image_${ipfsHash}.png`; // You can customize the filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Error saving image. Please try again.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        position: 'relative',
        maxWidth: '90%',
        maxHeight: '90%',
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '10px',
            top: '10px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: 1,
          }}
        >
          ×
        </button>
        <img
          src={imageUrl}
          alt="Focused"
          style={{
            maxWidth: '100%',
            maxHeight: 'calc(90vh - 100px)',
            objectFit: 'contain',
          }}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '15px',
        }}>
          <button
            onClick={handleSaveLocally}
            style={{
              background: '#28a745',
              color: '#fff',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Save Locally
          </button>
          <button
            onClick={handleDelete}
            style={{
              background: '#dc3545',
              color: '#fff',
              border: 'none',
              padding: '8px 15px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageModal; 