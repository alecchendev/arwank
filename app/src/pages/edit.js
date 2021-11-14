

import { useState, useEffect } from 'react';
import Arweave from 'arweave';
import { Link } from "react-router-dom";

// Since v1.5.1 you're now able to call the init function for the web version without options. The current URL path will be used by default. This is recommended when running from a gateway.
const arweave = Arweave.init({});

const Edit = () => {

  const [ key, setKey ] = useState(null);
  const [ pubkey, setPubkey ] = useState(null);

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
    const result = await arweave.blocks.get("zbUPQFA4ybnd8h99KI9Iqh4mogXJibr0syEwuJPrFHhOhld7XBMOUDeXfsIGvYDp"); 
    console.log(result);

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
        <p>Logged in: {pubkey}</p>
        :
        <div className="file-upload-container">
          <label>
            Drag Or Select Wallet
          </label>
          <input type="file" id="select-files" className="file-upload-input" onChange={selectFiles} />
        </div>
      }

      
    </div>
  );
}

export default Edit;
