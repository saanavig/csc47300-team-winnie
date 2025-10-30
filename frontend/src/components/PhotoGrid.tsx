import "../styles/PhotoGrid.css";

import Masonry from "react-masonry-css";
import Modal from "react-modal";
import { useState } from "react";

Modal.setAppElement("#root");

export interface Photo {
    id: string | number;
    url: string;
    tags: string[];
    uploadDate?: string | number | Date;
    }

    interface PhotoGridProps {
    photos: Photo[];
    filterTag?: string | null;
    }

    export default function PhotoGrid({ photos, filterTag }: PhotoGridProps) {
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

    const filteredPhotos = filterTag
        ? photos.filter((photo) => photo.tags.includes(filterTag))
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
            <p className="no-photos">No photos available. Upload some memories!</p>
        ) : (
            <Masonry
            breakpointCols={breakpointColumns}
            className="photo-grid"
            columnClassName="photo-grid-column"
            >
            {filteredPhotos.map((photo) => (
                <div
                key={photo.id}
                className="photo-item"
                onClick={() => openModal(photo)}
                >
                <img src={photo.url} alt="" />
                <div className="photo-overlay">
                    <div className="photo-tags">
                    {photo.tags.map((tag) => (
                        <span key={tag} className="photo-tag">
                        {tag}
                        </span>
                    ))}
                    </div>
                </div>
                </div>
            ))}
            </Masonry>
        )}

        <Modal
            isOpen={selectedPhoto !== null}
            onRequestClose={closeModal}
            className="photo-modal"
            overlayClassName="photo-modal-overlay"
        >
            {selectedPhoto && (
            <div className="photo-modal-content">
                <button className="close-modal" onClick={closeModal}>
                ×
                </button>
                <img src={selectedPhoto.url} alt="" />
                <div className="photo-details">
                <div className="photo-modal-tags">
                    {selectedPhoto.tags.map((tag) => (
                    <span key={tag} className="photo-tag">
                        {tag}
                    </span>
                    ))}
                </div>
                {selectedPhoto.uploadDate && (
                    <p className="photo-date">
                    Uploaded on{" "}
                    {new Date(selectedPhoto.uploadDate).toLocaleDateString()}
                    </p>
                )}
                </div>
            </div>
            )}
        </Modal>
        </div>
    );
}
