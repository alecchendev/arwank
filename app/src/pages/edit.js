
import '../styles/edit.css';
import { useState, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
// import axios from 'axios';
import idl from '../data/idl.json';

import { Connection, PublicKey, clusterApiUrl} from '@solana/web3.js';
import {
  Program, Provider, web3
} from '@project-serum/anchor';
import kp from '../data/keypair.json'
import { BN } from 'bn.js';

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;


// Get our program's id form the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Create a keypair for the account that will hold the GIF data.
// const arr = Object.values(kp._keypair.secretKey);
// const secret = new Uint8Array(arr);
// const baseAccount = web3.Keypair.fromSecretKey(secret);
// const baseAccount = web3.Keypair.generate();

// Set our network to devent.
const network = clusterApiUrl('devnet');
// const network = 'http://localhost:8899';

// Control's how we want to acknowledge when a trasnaction is "done".
const opts = {
  preflightCommitment: "processed" // can also "finalized"
}


const Edit = ({ arweave }) => {

  const [ baseAccount, setBaseAccount ] = useState();
  const [ baseAccountBump, setBaseAccountBump ] = useState();

  const [ key, setKey ] = useState(null);
  const [ pubkey, setPubkey ] = useState(null);
  const [ text, setText ] = useState("");
  const [ title, setTitle ] = useState("");

  const [walletAddress, setWalletAddress] = useState(null);

  const [ story, setStory ] = useState(null);

  const [ published, setPublished ] = useState(false);

  const { storyId } = useParams();

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }
  
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

    // NEW FORMAT
    let contributors = [];
    let content = [];
    const tags = ["arwankv0.0.1", "arwankStory"]
    if (story && story != "New") {
      contributors = story.contributors;
      content = story.content;
    } else {

    }
    contributors.unshift(pubkey);
    content.push({ contributor: pubkey, text: text })
    const storyData = {
      title: title,
      contributors: contributors,
      content: content,
    };

    console.log("storyData:", storyData);

    try {

      let transaction = await arweave.createTransaction({ data: JSON.stringify(storyData) }, key);
      await arweave.transactions.sign(transaction, key);
      const response = await arweave.transactions.post(transaction);

      setPublished(true);

    } catch (err) {

      console.log("Publish failed:", err);
      setPublished(null);

    }

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

  /*
   * This function holds the logic for deciding if a Phantom Wallet is
   * connected or not
   */
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
        }

        /*
         * The solana object gives us a function that will allow us to connect
         * directly with the user's wallet!
         */
        const response = await solana.connect({ onlyIfTrusted: true });
        console.log(
          'Connected with Public Key:',
          response.publicKey.toString()
        );

        /*
           * Set the user's publicKey in state to be used later!
           */
        setWalletAddress(response.publicKey.toString());

      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  /*
   * Let's define this method so our code doesn't break.
   * We will write the logic for this next!
   */
  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  useEffect(async () => {
    // const result = await arweave.blocks.get("zbUPQFA4ybnd8h99KI9Iqh4mogXJibr0syEwuJPrFHhOhld7XBMOUDeXfsIGvYDp"); 
    // console.log(result);

    // let key = await arweave.wallets.generate();
    // console.log(key);

    const [ baseAccountTemp, baseAccountBumpTemp ] = await web3.PublicKey.findProgramAddress(
      [Buffer.from("base_account")],
      programID
    );
    setBaseAccount(baseAccountTemp);
    setBaseAccountBump(baseAccountBumpTemp);

    // Check wallet onload
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    window.removeEventListener('load', onLoad);

    // load story data
    if (storyId === undefined) {
      setStory("New");
    } else {
      try {
        const dataStr = await arweave.transactions.getData(storyId, {decode: true, string: true});
        const data = JSON.parse(dataStr);
        setStory(data);
        setTitle(data.title);
      } catch (err) {
        console.log(err);
        setStory("New");
      }
    }

  }, [])

  const createAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping")
      await program.rpc.initialize(new BN(baseAccountBump), {
        accounts: {
          baseAccount: baseAccount,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.toString())
  
    } catch(error) {
      console.log("Error creating BaseAccount account:", error)
    }
  }

  return (
    <div className="app">

      {/* <button onClick={createAccount}>One time creat account</button> */}

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
          <button id="upload-button" onClick={() => document.getElementById("select-files").click()}>Select Wallet</button>
        </div>
      }
    
      <div>
      {
        walletAddress
        ?
        <button>Connected</button>
        :
        <button onClick={connectWallet}>Connect Wallet</button>
      }
      </div>
      
      <div className="publish-container">
      {
        (pubkey && walletAddress && !published)
        ?
        <button onClick={publishStory}>Publish</button>
        :
        <button className="invalid-button">Publish</button>
      }
      </div>

      {
        published
        &&
        <p>Published</p>
      }


      <div className="text-editor">
        <input
          type="text"
          className="title-input"
          value={title}
          placeholder={"Type your title here..."}
          onChange={updateTitle}
        />

        {
          story
          ?
          (
            story !== "New"
            &&
            <div className="prev-story-container">
              <p>{story.content}</p>
            </div>
          )
          :
          <p>Loading...</p>
        }

        <textarea
          // type="text"
          id="textarea"
          className="text-input"
          value={text}
          placeholder={(story && story !== "New") ? "Add your contribution here..." : "Type your story here..."}
          onChange={updateText}
        />
      </div>


      
    </div>
  );
}

export default Edit;
