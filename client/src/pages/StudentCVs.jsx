
import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Upload,
  Download,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { apiRequest, API_URL } from "../api";

function formatSize(bytes) {
  if (!bytes) return "0 KB";

  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function StudentCVs() {
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadCVs();
  }, []);

  async function loadCVs() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/students/me/cvs");
      setDocuments(data.documents || []);
    } catch (err) {
      setError(err.message || "Unable to retrieve your CVs.");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    setError("");
    setSuccess("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const extension = file.name
      .slice(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setError("Please select a PDF, DOC or DOCX file.");
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload(event) {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please select a CV first.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("cv", selectedFile);

    try {
      const data = await apiRequest("/students/me/cv", {
        method: "POST",
        body: formData,
      });

      setSuccess(data.message || "CV uploaded successfully.");
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadCVs();
    } catch (err) {
      setError(err.message || "CV upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(document) {
    setDownloadingId(document.id);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/students/me/cvs/${document.id}/download`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        let message = "Unable to download this CV.";

        try {
          const data = await response.json();
          message = data.message || message;
        } catch {
          // Keep the default error message.
        }

        throw new Error(message);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");

      link.href = url;
      link.download = document.originalName;
      window.document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "CV download failed.");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="portal-page">
      <section className="welcome-section">
        <div>
          <p className="eyebrow">STUDENT DOCUMENTS</p>
          <h1>My CVs</h1>
          <p className="welcome-description">
            Upload and manage the CV documents you use when applying
            for attachment opportunities.
          </p>
        </div>
      </section>

      {error && (
        <div className="profile-message profile-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="profile-message profile-success" role="status">
          {success}
        </div>
      )}

      <section className="content-card">
        <div className="card-heading">
          <div>
            <h2>Upload a CV</h2>
            <p>Select a document from your device.</p>
          </div>
        </div>

        <form onSubmit={handleUpload} className="cv-upload-form">
          <div className="cv-file-picker">
            <FileText size={28} />

            <div>
              <strong>
                {selectedFile
                  ? selectedFile.name
                  : "Choose your CV document"}
              </strong>

              <p>Supported formats: PDF, DOC and DOCX</p>
            </div>

            <button
              type="button"
              className="profile-refresh"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse files
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              hidden
            />
          </div>

          {selectedFile && (
            <button
              type="submit"
              className="profile-save"
              disabled={uploading}
            >
              <Upload size={17} />
              {uploading ? "Uploading..." : "Upload CV"}
            </button>
          )}
        </form>
      </section>

      <section className="content-card cv-list-card">
        <div className="card-heading">
          <div>
            <h2>Uploaded Documents</h2>
            <p>Your saved CV documents.</p>
          </div>

          <button
            type="button"
            className="profile-refresh"
            onClick={loadCVs}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading your documents...</p>
        ) : documents.length === 0 ? (
          <div className="activity-empty">
            <FileText size={35} />
            <h3>No CVs uploaded yet</h3>
            <p>Upload your first CV to get started.</p>
          </div>
        ) : (
          <div className="cv-document-list">
            {documents.map((document) => (
              <div className="cv-document" key={document.id}>
                <div className="cv-document-icon">
                  <FileText size={23} />
                </div>

                <div className="cv-document-details">
                  <strong>{document.originalName}</strong>

                  <span>
                    {formatSize(document.sizeBytes)} · Uploaded{" "}
                    {new Date(document.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <button
                  type="button"
                  className="cv-download-button"
                  onClick={() => handleDownload(document)}
                  disabled={downloadingId === document.id}
                >
                  <Download size={17} />
                  {downloadingId === document.id
                    ? "Downloading..."
                    : "Download"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
