import React, { useRef, useState } from "react";
import styles from "./FileUpload.module.scss";

const FileUpload = () => {
  const formRef = useRef();
  const [file, setFile] = useState(null);

  const onDragEnter = (e) => {
    formRef.current.parentElement.dataset["dragover"] = true;
    console.log("drag entered");
    console.log(e);
  };

  // const onDragLeave = (e) => {
  //   formRef.current.removeAttribute("data-dragover");
  //   console.log("drag left");
  //   console.log(e);
  // };

  const onDrop = (e) => {
    formRef.current.parentElement.removeAttribute("data-dragover");
    console.log("dropped");
  };

  const onFileDrop = (e) => {
    const newFile = e.target.files[0];
    if (newFile) {
      const updatedList = newFile;
      setFile(updatedList);
      console.log(newFile);
      // props.onFileChange(updatedList);
    }
  };

  return (
    <div
      className={styles.fileUploadDiv}
      onDragStart={onDragEnter}
      // onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <form
        className={styles.fileUploadForm}
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          console.log(e);
        }}
      >
        <label htmlFor="file">Upload a csv file here.</label>
        <input
          type="file"
          name="file"
          id="file"
          accept=".csv"
          onChange={onFileDrop}
        />
        <button>Upload</button>
      </form>
    </div>
  );
};

export default FileUpload;
