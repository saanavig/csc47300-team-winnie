import React from 'react';
import { useState } from "react";
import Masonry from "react-masonry-css";
import Modal from "react-modal";
import "../styles/PhotoGrid.css";
import { Photo } from "../types";

Modal.setAppElement("#root");

interface PhotoGridProps {
  photos: Photo[];
  filterTag?: string | null;
}

export default function PhotoGrid({ photos, filterTag }: PhotoGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const filteredPhotos = filterTag
    ? photos.filter((photo) => (photo.tags || []).includes(filterTag))
    : photos;

  const openModal = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };

  const breakpointColumns = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  return (
    <div className="photo-grid-container">
      {filteredPhotos.length === 0 ? (
        <div className="no-photos">
          <p>No photos to display. Upload some memories to get started!</p>
        </div>
      ) : (
        <Masonry
          breakpointCols={breakpointColumns}
          className="photo-masonry-grid"
          columnClassName="photo-masonry-column"
        >
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="photo-item"
              onClick={() => openModal(photo)}
            >
              <img src={photo.url} alt="Memory" />
              <div className="photo-overlay">
                {/* Map tags array to small badges for each photo */}
                {(photo.tags || []).map((tag) => (
                  <span key={tag} className="photo-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </Masonry>
      )}

      <Modal
        isOpen={!!selectedPhoto}
        onRequestClose={closeModal}
        contentLabel="Photo Details"
        className="photo-modal"
        overlayClassName="photo-modal-overlay"
      >
        {selectedPhoto && (
          <div className="modal-content">
            <button className="close-button" onClick={closeModal}>
              ✕
            </button>
            <img src={selectedPhoto.url} alt="Full size" />
            <div className="modal-info">
              <div className="modal-tags">
                {(selectedPhoto.tags || []).map((tag) => (
                  <span key={tag} className="modal-tag">
                    {tag}
                  </span>
                ))}
              </div>
              {selectedPhoto.uploadDate && (
                <p className="upload-date">
                  Uploaded: {new Date(selectedPhoto.uploadDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}