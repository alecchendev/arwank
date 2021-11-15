
import '../styles/edit.css';
import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
// import axios from 'axios';



const Edit = ({ arweave }) => {

  const [ key, setKey ] = useState(null);
  const [ pubkey, setPubkey ] = useState(null);
  const [ text, setText ] = useState("");
  const [ title, setTitle ] = useState("");
  
  const updateTitle = (event) => {
    const newTitle = event.target.value;
    setTitle(newTitle);
  }

  const updateText = (event) => {
    const newText = event.target.value;
    setText(newText);
    const textarea = document.getElementById("textarea");
    textarea.style.height = textarea.scrollHeight + 3 + "px";
  }

  const publishStory = async () => {
    console.log("Publishing...");
    // form story data as JSON
    const data = {

      title: title,
      content: text
    }

    // base64 encode

    // create transaction
    let transaction = await arweave.createTransaction({ data: JSON.stringify(data) }, key);

    // sign transaction
    await arweave.transactions.sign(transaction, key);

    // submit to arweave
    const response = await arweave.transactions.post(transaction);
    // const headers = {
    //   'Content-Type': 'application/json',
    //   'Authorization': 'JWT fefege...'
    // }
    
    // axios.post(Helper.getUserAPI(), data, {
    //     headers: headers
    //   })
    //   .then((response) => {
    //     dispatch({
    //       type: FOUND_USER,
    //       data: response.data[0]
    //     })
    //   })
    //   .catch((error) => {
    //     dispatch({
    //       type: ERROR_FINDING_USER
    //     })
    //   })


    // check/wait for status?
    arweave.transactions.getStatus('bNbA3TEQVL60xlgCcqdz4ZPHFZ711cZ3hmkpGttDt_U').then(res => {
      console.log(res);
      // {
      //  status: 200,
      //  confirmed: {
      //    block_height: 140151,
      //    block_indep_hash: 'OR1wue3oBSg3XWvH0GBlauAtAjBICVs2F_8YLYQ3aoAR7q6_3fFeuBOw7d-JTEdR',
      //    number_of_confirmations: 20
      //  }
      //}
    })

    console.log("transaction:", transaction);
    console.log("response:", response);

    console.log("Published.");
  }

  const selectFiles = () => {
    console.log("clicked");
    var files = document.getElementById('select-files').files;
    //console.log(files);
    if (files.length <= 0) {
      return false;
    }

    var fr = new FileReader();

    fr.onload = function(e) {
      //console.log(e.target.result);
      const result = JSON.parse(e.target.result);
      // console.log("result: ", result);
      setKey(result);
      //console.log(result.kty);
      //var formatted = JSON.stringify(e, null, 2);
      //document.write(formatted);
      //document.getElementById('result').value = formatted;
          
      arweave.wallets.jwkToAddress(result).then((address) => {
          console.log(address);
          // document.getElementById("loggedInAddress").textContent = address
          setPubkey(address);
      });   
    };
    fr.readAsText(files.item(0));
  }

  useEffect(async () => {
    // const result = await arweave.blocks.get("zbUPQFA4ybnd8h99KI9Iqh4mogXJibr0syEwuJPrFHhOhld7XBMOUDeXfsIGvYDp"); 
    // console.log(result);

    // let key = await arweave.wallets.generate();
    // console.log(key);

  }, [])

  return (
    <div className="app">

      <h1>Edit</h1>

      <Link to="/">Home</Link>

      {
        pubkey
        ?
        <div>
          <p>Logged in: {pubkey}</p>
        </div>
        :
        <div className="file-upload-container">
          <input type="file" title=" " value="" id="select-files" className="file-upload-input" onChange={selectFiles}/>
          <button id="upload-button" onClick={() => document.getElementById("select-files").click()}>Drag or select Wallet</button>
        </div>
      }
      <div className="publish-container">
      {
        pubkey
        ?
        <button onClick={publishStory}>Publish</button>
        :
        <button className="invalid-button">Publish</button>
      }
      </div>

      <div className="text-editor">
        <input
          type="text"
          className="title-input"
          value={title}
          placeholder={"Type your title here..."}
          onChange={updateTitle}
        />
        <textarea
          // type="text"
          id="textarea"
          className="text-input"
          value={text}
          placeholder={"Type your story here..."}
          onChange={updateText}
        />
      </div>


      
    </div>
  );
}

export default Edit;
