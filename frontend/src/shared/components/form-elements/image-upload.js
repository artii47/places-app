import React, { useRef, useState, useEffect } from 'react';
import './image-upload.css';

const ImageUpload = (props) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    if (!file) {
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  }, [file]);

  const pickImageHandler = () => {
    inputRef.current.click();
  };

  const pickedHandler = (e) => {
    let pickedFile;
    let fileIsValid = isValid;

    if (e.target.files || e.target.files.length === 1) {
      pickedFile = e.target.files[0];
      setFile(pickedFile);
      setIsValid(true);
      fileIsValid = true;
      return;
    } else {
      setIsValid(false);
      fileIsValid = false;
    }
    // props.onInput(props.id, pickedFile, fileIsValid);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flex: '1',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <label
        className='upload-button'
        style={{ marginBottom: previewUrl ? '2rem' : '3rem' }}
      >
        <input
          // ref={inputRef}
          ref={props.register}
          {...props}
          id={props.id}
          // style={{ display: 'none' }}
          type='file'
          accept='.jpg,.png,.jpeg'
          className='choose'
          // onClick={pickImageHandler}
          onChange={pickedHandler}
        />
        Upload profile picture
      </label>
      <div>
        <div>
          {previewUrl && (
            <img
              className='img'
              style={{ width: '100%', height: '100%', marginBottom: '2rem' }}
              src={previewUrl}
              alt='Preview'
            />
          )}
        </div>
        {/* <button stype='button' onClick={pickImageHandler}>
          Pick image
        </button> */}
      </div>
      {/* {!isValid && 'error kurwaa'} */}
    </div>
  );
};

export default ImageUpload;
