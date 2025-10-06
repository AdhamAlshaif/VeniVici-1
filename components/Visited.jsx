import React from "react";

const Visited = ({ photos }) => {
  return (
    <div>
      <h2>Mars Rover Photo Gallery!</h2>
      <div className="image-container">
        {photos && photos.length > 0 ? (
          photos.map((photo, index) => (
            <div className="gallery-item" key={index}>
              <img
                className="gallery-photo"
                src={photo.img_src}
                alt={`Mars Rover Photo taken by ${photo.camera.full_name}`}
                width="500"
              />
              <p className="camera-name">
                <strong>Camera:</strong> {photo.camera.full_name}
              </p>

            </div>
          ))
        ) : (
          <div>
            <h3>No Mars Rover photos available to display!</h3>
          </div>
        )}
      </div>
    </div>
  );
};


export default Visited; 