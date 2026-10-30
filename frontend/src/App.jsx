import React from 'react'
import axios from 'axios'
import cloudPlus from './assets/cloudPlus.svg'
import './App.css'

const App = () => {
  const [file, setFile] = React.useState([])
  const [previews, setPreviews] = React.useState([])
  const [message, setMessage] = React.useState("")
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [uploading, setUploading] = React.useState(false)
  const [isUploadingAttempted, setIsUploadingAttempted] = React.useState(false)
  const handleFileChange = (e) => {
    const selectedFile = Array.from(e.target.files)
    previews.forEach((preview) => URL.revokeObjectURL(preview))
    setFile(selectedFile)
    setPreviews(selectedFile.map((file) => URL.createObjectURL(file)))
    setUploadProgress(0)
    setIsUploadingAttempted(false)
    setMessage("")
  }

  const handleFileRemove = (indexToRemove) => {
    const updatedFile = file.filter((_, index) => index !== indexToRemove)
    const updatePreviews = previews.filter((_, index) => index !== indexToRemove)
    setFile(updatedFile)
    setPreviews(updatePreviews)
    URL.revokeObjectURL(previews[indexToRemove])
    setIsUploadingAttempted(false)
    setMessage("")
    setUploadProgress(0)
  }


  const handleUpload = async () => {
    if (file.length === 0) {
      setMessage("no files seleted to upload")
      setIsUploadingAttempted(true)
      return
    }
    setUploading(true)
    setUploadProgress(0)
    setIsUploadingAttempted(true)
    const formData = new FormData()
    file.forEach((files) => {
      formData.append("images", files)
    })
    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        onUploadProgress: (event) => {
          if (event.total) {
            setUploadProgress(Math.round((event.loaded * 100) / event.total))
          }
        },
      })
      setUploadProgress(100)
      setMessage(response.data.message)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }
  return (
    <>
      <div className="file-upload-App">
        <h2>
          Build a File Upload App in React with Preview & Progress Bar
        </h2>
        <div className="file-input-wrapper">
        </div>
        <input type="file" accept="image/*" multiple onChange={handleFileChange} id="browse-btn" />
        <label htmlFor="browse-btn" className="browse-btn">
          <img src={cloudPlus} />
          Browse
        </label>
        <span className="file-count"> {file.length > 0 ? `${file.length} file${file.length == 1 ? "" : "S"} selected` : "no files selected"} </span>
      </div>
      <div className="file-preview-container">
        {previews.map((src, index) => (
          <div key={index} className="preview-wapper">
            <img src={src} alt="..." className="preview-img" />
            <button className="remove-btn" onClick={() => handleFileRemove(index)}>Remove</button>
          </div>
        ))}
      </div>
      <button className="upload-btn" onClick={handleUpload} disabled={uploading}>
        Upload Files
      </button>
      {
        uploading &&
        (
          <div className="progress-container">
            <div className="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={uploadProgress}>
              <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
            </div>
            <span className="progress-text">{uploadProgress}%</span>
          </div>
        )
      }
      {
        isUploadingAttempted && <p className="message" role="status">{message}</p >
      }
    </>
  )
}

export default App
