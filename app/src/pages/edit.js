

import { useState, useEffect } from 'react';
import Arweave from 'arweave';
import { Link } from "react-router-dom";

// Since v1.5.1 you're now able to call the init function for the web version without options. The current URL path will be used by default. This is recommended when running from a gateway.
const arweave = Arweave.init({});

function Edit() {

  useEffect(async () => {
    const result = await arweave.blocks.get("zbUPQFA4ybnd8h99KI9Iqh4mogXJibr0syEwuJPrFHhOhld7XBMOUDeXfsIGvYDp"); 
    console.log(result);

  }, [])

  return (
    <div className="app">

      <h1>Edit</h1>
      <Link to="/">Home</Link>
      
    </div>
  );
}

export default Edit;
