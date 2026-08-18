import React, { useState } from "react";
import "./Documents.css";

const documents = [
  {
    id: 1,
    title: "Farming Guidelines",
    date: "18 Aug 2026",
    time: "10:30 AM",
    file: "/docs/Farming-Guidelines.pdf",
  },
  {
    id: 2,
    title: "Crop Information",
    date: "18 Aug 2026",
    time: "11:15 AM",
    file: "/docs/Crop-Information.pdf",
  },
  {
    id: 3,
    title: "Pest Management",
    date: "18 Aug 2026",
    time: "12:00 PM",
    file: "/docs/Pest-Management.pdf",
  },
  {
    id: 4,
    title: "Farmer-Review-Form-English",
    date: "18 Aug 2026",
    time: "10:30 AM",
    file: "/docs/Farmer-Review-Form-English.pdf",
  },
  {
    id: 5,
    title: "किसान-समीक्षा-फ़ॉर्म-हिंदी",
    date: "18 Aug 2026",
    time: "11:15 AM",
    file: "/docs/Farmer-Review-Form-Hindi.pdf",
  },
  {
    id: 6,
    title: "ખેડૂત સમીક્ષા ફોર્મ - ગુજરાતી",
    date: "18 Aug 2026",
    time: "12:00 PM",
    file: "/docs/Farmer-Review-Form-Gujarati.pdf",
  },
];

function Documents() {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [zoom, setZoom] = useState(1);

  const openDocument = (doc) => {
    setSelectedDoc(doc);
    setZoom(1);
  };

  const closeDocument = () => {
    setSelectedDoc(null);
    setZoom(1);
  };

  const zoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2.5));
  };

  const zoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.6));
  };

  const resetZoom = () => {
    setZoom(1);
  };

  const handleDoubleClick = () => {
    zoomIn();
  };

  return (
    <div className="documents-page">

      {/* HEADER */}
      <section className="documents-hero">
        <div className="hero-decoration leaf-one">🌿</div>
        <div className="hero-decoration leaf-two">🍃</div>

        <div className="documents-hero-content">
          <span className="documents-badge">
            📚 Krishak Sarathi Resources
          </span>

          <h1>
            Relate to This <span>Page</span>
          </h1>

          <p>
            Explore useful farming documents, crop information and
            pest management guidelines for better agricultural decisions.
          </p>
        </div>
      </section>

      {/* GUIDELINES SECTION */}
      <section className="documents-section">

        <div className="section-heading">
          <div>
            <span>📋 Farming Resources</span>
            <h2>Guidelines</h2>
          </div>

          <p>
            Essential farming guidelines and best practices for better yields.
          </p>
        </div>

        <div className="documents-grid">

          {documents.slice(0, 3).map((doc) => (
            <div
              className="document-card"
              key={doc.id}
              onClick={() => openDocument(doc)}
            >

              <div className="document-top">
                <div className="pdf-icon">
                  <span>PDF</span>
                </div>

                <div className="document-type">
                  GUIDELINE
                </div>
              </div>

              <div className="document-preview">
                <div className="paper">
                  <div className="paper-header">
                    <span>KRISHAK SARATHI</span>
                  </div>

                  <div className="paper-line large"></div>
                  <div className="paper-line"></div>
                  <div className="paper-line"></div>
                  <div className="paper-line short"></div>

                  <div className="paper-box">
                    <span>PDF</span>
                  </div>

                  <div className="paper-line"></div>
                  <div className="paper-line short"></div>
                </div>
              </div>

              <div className="document-info">
                <h3>{doc.title}</h3>

                <div className="document-meta">
                  <span>📅 {doc.date}</span>
                  <span>🕐 {doc.time}</span>
                </div>
              </div>

              <div className="document-footer">
                <span>Click to open</span>
                <span className="open-arrow">→</span>
              </div>

            </div>
          ))}

        </div>
      </section>

      {/* DOCUMENTS SECTION */}
      <section className="documents-section">

        <div className="section-heading">
          <div>
            <span>📚 Official Forms</span>
            <h2>Documents</h2>
          </div>

          <p>
            Download and review official farmer review forms in multiple languages.
          </p>
        </div>

        <div className="documents-grid">

          {documents.slice(3, 6).map((doc) => (
            <div
              className="document-card"
              key={doc.id}
              onClick={() => openDocument(doc)}
            >

              <div className="document-top">
                <div className="pdf-icon">
                  <span>PDF</span>
                </div>

                <div className="document-type">
                  DOCUMENT
                </div>
              </div>

              <div className="document-preview">
                <div className="paper">
                  <div className="paper-header">
                    <span>KRISHAK SARATHI</span>
                  </div>

                  <div className="paper-line large"></div>
                  <div className="paper-line"></div>
                  <div className="paper-line"></div>
                  <div className="paper-line short"></div>

                  <div className="paper-box">
                    <span>PDF</span>
                  </div>

                  <div className="paper-line"></div>
                  <div className="paper-line short"></div>
                </div>
              </div>

              <div className="document-info">
                <h3>{doc.title}</h3>

                <div className="document-meta">
                  <span>📅 {doc.date}</span>
                  <span>🕐 {doc.time}</span>
                </div>
              </div>

              <div className="document-footer">
                <span>Click to open</span>
                <span className="open-arrow">→</span>
              </div>

            </div>
          ))}

        </div>
      </section>

      {/* PDF FULL SCREEN VIEWER */}
      {selectedDoc && (
        <div className="pdf-modal">

          <div className="pdf-modal-header">

            <div className="pdf-modal-title">
              <div className="small-pdf-icon">PDF</div>

              <div>
                <h3>{selectedDoc.title}</h3>
                <p>
                  {selectedDoc.date} • {selectedDoc.time}
                </p>
              </div>
            </div>

            <button
              className="close-pdf"
              onClick={closeDocument}
              title="Close"
            >
              ✕
            </button>

          </div>

          {/* PDF AREA */}
          <div
            className="pdf-viewer-area"
            onDoubleClick={handleDoubleClick}
          >
            <div
              className="pdf-frame-wrapper"
              style={{
                transform: `scale(${zoom})`,
              }}
            >
              <iframe
                src={`${selectedDoc.file}#toolbar=0&navpanes=0`}
                title={selectedDoc.title}
                className="pdf-frame"
              ></iframe>
            </div>
          </div>

          {/* PDF CONTROLS */}
          <div className="pdf-controls">

            <div className="pdf-controls-left">
              <button
                onClick={zoomOut}
                className="pdf-control-btn"
                title="Zoom Out"
              >
                −
              </button>

              <span className="zoom-value">
                {Math.round(zoom * 100)}%
              </span>

              <button
                onClick={zoomIn}
                className="pdf-control-btn"
                title="Zoom In"
              >
                +
              </button>

              <button
                onClick={resetZoom}
                className="reset-btn"
              >
                Reset
              </button>
            </div>

            <div className="pdf-controls-right">

              <a
                href={selectedDoc.file}
                download
                className="download-pdf-btn"
              >
                <span>⬇</span>
                Download PDF
              </a>

              <button
                className="close-bottom-btn"
                onClick={closeDocument}
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Documents;