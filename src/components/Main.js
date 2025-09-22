import React, { Component } from 'react';
import { convertBytes } from './helpers';
import moment from 'moment'

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      dragActive: false
    };
  }

  handleFileSelect = (event) => {
    const file = event.target.files[0];
    this.setState({ selectedFile: file });
    this.props.captureFile(event);
  }

  clearSelectedFile = () => {
    this.setState({ selectedFile: null });
    // Reset the file input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
  }

  handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      this.setState({ dragActive: true });
    } else if (e.type === "dragleave") {
      this.setState({ dragActive: false });
    }
  }

  handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ dragActive: false });
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      this.setState({ selectedFile: file });
      
      // Create a synthetic event to pass to captureFile
      const syntheticEvent = {
        target: { files: [file] }
      };
      this.props.captureFile(syntheticEvent);
    }
  }

  render() {
    const { selectedFile, dragActive } = this.state;

    return (
      <div className="main-content">
        {/* Upload Section */}
        <div className="upload-card">
          <h2>📁 Upload File to IPFS</h2>
          <form onSubmit={(event) => {
            event.preventDefault()
            const description = this.fileDescription.value
            this.props.uploadFile(description)
          }}>
            <div className="form-group">
              <input
                id="fileDescription"
                type="text"
                ref={(input) => { this.fileDescription = input }}
                className="form-input"
                placeholder="Enter file description..."
                required 
              />
            </div>
            
            {selectedFile ? (
              <div className="selected-file-info">
                <div className="file-info-details">
                  <span className="file-info-icon">📄</span>
                  <div>
                    <div>{selectedFile.name}</div>
                    <small style={{ opacity: 0.7 }}>
                      {convertBytes(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                    </small>
                  </div>
                </div>
                <button 
                  type="button" 
                  className="clear-file-btn"
                  onClick={this.clearSelectedFile}
                  title="Remove file"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div 
                className={`file-input-wrapper ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={this.handleDrag}
                onDragLeave={this.handleDrag}
                onDragOver={this.handleDrag}
                onDrop={this.handleDrop}
              >
                <input 
                  type="file" 
                  onChange={this.handleFileSelect} 
                  className="file-input"
                  id="fileInput"
                />
                <label htmlFor="fileInput" className="file-input-label">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {dragActive ? 'Drop file here' : 'Choose file or drag & drop'}
                </label>
              </div>
            )}
            
            <button 
              type="submit" 
              className="upload-btn"
              disabled={this.props.loading || !selectedFile}
            >
              {this.props.loading ? (
                <>
                  <span className="loading-spinner"></span>
                  &nbsp; Uploading...
                </>
              ) : (
                <>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: '0.5rem' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4" />
                  </svg>
                  Upload to IPFS
                </>
              )}
            </button>
          </form>
        </div>

        {/* Files Section */}
        <div className="files-section">
          <div className="files-header">
            <h3 className="files-title">📚 Stored Files</h3>
            <span className="files-count">{this.props.files.length} files</span>
          </div>

          {this.props.files.length > 0 ? (
            <div className="files-table-wrapper">
              <table className="files-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>ID</th>
                    <th style={{ width: '200px' }}>Name</th>
                    <th style={{ width: '250px' }}>Description</th>
                    <th style={{ width: '100px' }}>Type</th>
                    <th style={{ width: '80px' }}>Size</th>
                    <th style={{ width: '120px' }}>Uploaded</th>
                    <th style={{ width: '140px' }}>Uploader</th>
                    <th style={{ width: '140px' }}>IPFS Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {this.props.files.map((file, key) => (
                    <tr key={key}>
                      <td className="file-id">#{file.fileId}</td>
                      <td title={file.fileName}>{file.fileName}</td>
                      <td title={file.fileDescription}>{file.fileDescription}</td>
                      <td>
                        <span className="file-type">{file.fileType || 'unknown'}</span>
                      </td>
                      <td className="file-size">{convertBytes(file.fileSize)}</td>
                      <td className="file-date">
                        {moment.unix(file.uploadTime).format('MMM DD, YYYY')}
                        <br />
                        <small style={{ opacity: 0.7 }}>
                          {moment.unix(file.uploadTime).format('h:mm A')}
                        </small>
                      </td>
                      <td>
                        <a
                          href={"https://etherscan.io/address/" + file.uploader}
                          rel="noopener noreferrer"
                          target="_blank"
                          className="file-link"
                          title={file.uploader}
                        >
                          {file.uploader.substring(0,8)}...
                        </a>
                      </td>
                      <td>
                        <a
                          href={"http://127.0.0.1:8080/ipfs/" + file.fileHash}
                          rel="noopener noreferrer"
                          target="_blank"
                          className="file-link"
                          title={file.fileHash}
                        >
                          {file.fileHash.substring(0,12)}...
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-text">No files uploaded yet</div>
              <div className="empty-state-subtext">
                Upload your first file to get started with decentralized storage
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Main;