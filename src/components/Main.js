import React, { Component } from 'react';
import { convertBytes } from './helpers';
import moment from 'moment'
import { FileEncryption } from './encryption';
import { Download, Share2, Upload } from 'lucide-react';

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      dragActive: false,
      accessType: 'PUBLIC',
      recipients: [''],
      shouldEncrypt: false,
      showShareModal: false,
      shareFileId: null,
      shareRecipient: '',
      showRecipientsModal: false,
      selectedFileRecipients: [],
      showUploadModal: false
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

  // Reset the entire form
  resetForm = () => {
    this.clearSelectedFile();
    // Clear the description input
    if (this.fileDescription) this.fileDescription.value = '';
    // Reset access type to default
    this.setState({
      accessType: 'PUBLIC',
      recipients: [''],
      shouldEncrypt: false
    });
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

  // Handle access type change
  handleAccessTypeChange = (e) => {
    const accessType = e.target.value;
    this.setState({ 
      accessType,
      recipients: accessType === 'RESTRICTED' ? [''] : []
    });
  }

  // Handle recipients change
  handleRecipientChange = (index, value) => {
    const newRecipients = [...this.state.recipients];
    newRecipients[index] = value;
    this.setState({ recipients: newRecipients });
  }

  // Add recipient field
  addRecipient = () => {
    this.setState({ 
      recipients: [...this.state.recipients, ''] 
    });
  }

  // Remove recipient field
  removeRecipient = (index) => {
    const newRecipients = this.state.recipients.filter((_, i) => i !== index);
    this.setState({ recipients: newRecipients });
  }

  // Open share modal
  openShareModal = (fileId) => {
    this.setState({ 
      showShareModal: true, 
      shareFileId: fileId,
      shareRecipient: ''
    });
  }

  // Close share modal
  closeShareModal = () => {
    this.setState({ 
      showShareModal: false, 
      shareFileId: null,
      shareRecipient: ''
    });
  }

  // Handle share file
  handleShareFile = () => {
    if (this.state.shareRecipient.trim() && this.state.shareFileId) {
      this.props.shareFile(this.state.shareFileId, this.state.shareRecipient.trim());
      this.closeShareModal();
    }
  }

  // Open upload modal
  openUploadModal = () => {
    this.setState({ showUploadModal: true });
  }

  // Close upload modal
  closeUploadModal = () => {
    this.setState({ showUploadModal: false });
    this.resetForm(); // Reset form when closing modal
  }

  // Validate Ethereum address
  isValidAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // Extract file type from filename
  getFileType = (fileName) => {
    if (!fileName) return 'unknown';
    const extension = fileName.split('.').pop();
    if (!extension || extension === fileName) return 'unknown';
    return extension.toLowerCase();
  }

  render() {
    const { selectedFile, dragActive, accessType, recipients, shouldEncrypt } = this.state;

    return (
      <div className="main-content">
        {/* Upload Button Section */}
        <div className="upload-button-section">
          <button 
            onClick={this.openUploadModal}
            className="upload-new-file-btn"
          >
            <Upload size={20} style={{ marginRight: '0.5rem' }} />
            Upload New File
          </button>
        </div>

        {/* Files Section */}
        <div className="files-section">
          <div className="files-header">
            <h3 className="files-title">📚 Accessible Files</h3>
            <span className="files-count">{this.props.files.length} files</span>
          </div>

          {this.props.files.length > 0 ? (
            <div className="files-table-wrapper">
              <table className="files-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>ID</th>
                    <th style={{ width: '200px' }}>Name</th>
                    <th style={{ width: '200px' }}>Description</th>
                    <th style={{ width: '80px' }}>Type</th>
                    <th style={{ width: '80px' }}>Size</th>
                    <th style={{ width: '100px' }}>Access</th>
                    <th style={{ width: '120px' }}>Uploaded</th>
                    <th style={{ width: '120px' }}>Uploader</th>
                    <th style={{ width: '150px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {this.props.files.map((file, key) => {
                    const accessTypeLabels = {
                      '0': '🌍 Public',
                      '1': '🔐 Private', 
                      '2': '👥 Restricted'
                    };
                    
                    return (
                      <tr key={key}>
                        <td className="file-id">#{file.fileId}</td>
                        <td title={file.fileName}>
                          {file.fileName}
                          {file.isEncrypted && <span className="encrypted-badge">🔐</span>}
                        </td>
                        <td title={file.fileDescription || 'No description'}>
                          {file.fileDescription || 'No description'}
                        </td>
                        <td>
                          <span className="file-type">{this.getFileType(file.fileName)}</span>
                        </td>
                        <td className="file-size">{convertBytes(file.fileSize)}</td>
                        <td>
                          <span className="access-type">
                            {accessTypeLabels[file.accessType] || '🌍 Public'}
                          </span>
                        </td>
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
                          {file.isOwner}
                        </td>
                        <td className="actions-cell">
                          <button
                            onClick={() => this.props.downloadFile(file)}
                            className="action-btn download-btn"
                            title="Download file"
                          >
                            <Download size={16} />
                          </button>
                          
                          <button
                            onClick={() => file.isOwner ? this.openShareModal(file.fileId) : null}
                            className={`action-btn share-btn ${!file.isOwner ? 'disabled' : ''}`}
                            title={file.isOwner ? "Share with someone" : "Only owner can share"}
                            disabled={!file.isOwner}
                          >
                            <Share2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-text">No accessible files yet</div>
              <div className="empty-state-subtext">
                Upload your first file or wait for someone to share with you
              </div>
            </div>
          )}
        </div>

        {/* Share Modal */}
        {this.state.showShareModal && (
          <div className="modal-overlay" onClick={this.closeShareModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>📤 Share File</h3>
                <button onClick={this.closeShareModal} className="modal-close">✕</button>
              </div>
              <div className="modal-body">
                <p>Enter the Ethereum address to share this file with:</p>
                <input
                  type="text"
                  placeholder="0x..."
                  value={this.state.shareRecipient}
                  onChange={(e) => this.setState({ shareRecipient: e.target.value })}
                  className={`share-input ${this.state.shareRecipient && !this.isValidAddress(this.state.shareRecipient) ? 'invalid' : ''}`}
                />
                {this.state.shareRecipient && !this.isValidAddress(this.state.shareRecipient) && (
                  <small className="error-text">Please enter a valid Ethereum address</small>
                )}
              </div>
              <div className="modal-footer">
                <button onClick={this.closeShareModal} className="btn-secondary">Cancel</button>
                <button 
                  onClick={this.handleShareFile} 
                  className="btn-primary"
                  disabled={!this.state.shareRecipient || !this.isValidAddress(this.state.shareRecipient)}
                >
                  Share File
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {this.state.showUploadModal && (
          <div className="modal-overlay" onClick={this.closeUploadModal}>
            <div className="modal-content upload-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3><Upload size={20} style={{display: 'inline', marginRight: '8px'}} />Upload File to IPFS</h3>
                <button onClick={this.closeUploadModal} className="modal-close">✕</button>
              </div>
              <div className="modal-body">
                <form onSubmit={(event) => {
                  event.preventDefault()
                  const description = this.fileDescription.value
                  
                  // Validate recipients for restricted access
                  if (accessType === 'RESTRICTED') {
                    const validRecipients = recipients.filter(addr => addr.trim() !== '')
                    if (validRecipients.length === 0) {
                      alert('Please add at least one recipient for restricted access')
                      return
                    }
                    
                    const invalidRecipients = validRecipients.filter(addr => !this.isValidAddress(addr))
                    if (invalidRecipients.length > 0) {
                      alert('Please enter valid Ethereum addresses for recipients')
                      return
                    }
                  }
                  
                  this.props.uploadFile(description, accessType, recipients, shouldEncrypt)
                  this.closeUploadModal()
                }}>
                  <div className="form-group">
                    <label className="form-label">File Description</label>
                    <input
                      id="fileDescription"
                      type="text"
                      ref={(input) => { this.fileDescription = input }}
                      className="form-input"
                      placeholder="Enter file description..."
                      required 
                    />
                  </div>

                  {/* Access Control Section */}
                  <div className="access-control-section">
                    <h4>🔒 Access Control</h4>
                    
                    <div className="form-group">
                      <label htmlFor="accessType" className="form-label">Select Access Level:</label>
                      <select
                        id="accessType"
                        name="accessType"
                        value={accessType}
                        onChange={this.handleAccessTypeChange}
                        className="form-select"
                        required
                      >
                        <option value="PUBLIC">🌍 Public - Anyone can view and download</option>
                        <option value="PRIVATE">🔐 Private - Only you can access</option>
                        <option value="RESTRICTED">👥 Restricted - Specific people only</option>
                      </select>
                    </div>

                    {/* Recipients Section */}
                    {accessType === 'RESTRICTED' && (
                      <div className="recipients-section">
                        <h5>Recipients (Ethereum Addresses)</h5>
                        {recipients.map((recipient, index) => (
                          <div key={index} className="recipient-input-group">
                            <input
                              type="text"
                              placeholder="0x..."
                              value={recipient}
                              onChange={(e) => this.handleRecipientChange(index, e.target.value)}
                              className={`recipient-input ${recipient && !this.isValidAddress(recipient) ? 'invalid' : ''}`}
                            />
                            {recipients.length > 1 && (
                              <button
                                type="button"
                                onClick={() => this.removeRecipient(index)}
                                className="remove-recipient-btn"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={this.addRecipient}
                          className="add-recipient-btn"
                        >
                          + Add Recipient
                        </button>
                      </div>
                    )}

                    {/* Encryption Option */}
                    <div className="encryption-section">
                      <label className="encryption-option">
                        <input
                          type="checkbox"
                          checked={shouldEncrypt}
                          onChange={(e) => this.setState({ shouldEncrypt: e.target.checked })}
                          disabled={!FileEncryption.isSupported()}
                        />
                        <span className="checkbox-custom"></span>
                        <div className="encryption-details">
                          <strong>🔐 Encrypt File</strong>
                          <small>
                            {FileEncryption.isSupported() 
                              ? 'File will be encrypted before uploading'
                              : 'Encryption not supported in this browser'
                            }
                          </small>
                        </div>
                      </label>
                    </div>
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
                  
                  <div className="modal-footer">
                    <button 
                      type="submit" 
                      className="btn-primary upload-btn"
                      disabled={this.props.loading || !selectedFile}
                    >
                      {this.props.loading ? (
                        <>
                          <span className="loading-spinner"></span>
                          &nbsp; Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={16} style={{ marginRight: '0.5rem' }} />
                          Upload to IPFS
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Main;