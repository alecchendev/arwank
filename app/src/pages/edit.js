
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

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);
// const baseAccount = web3.Keypair.generate();

// Get our program's id form the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devent.
const network = clusterApiUrl('devnet');
// const network = 'http://localhost:8899';

// Control's how we want to acknowledge when a trasnaction is "done".
const opts = {
  preflightCommitment: "processed" // can also "finalized"
}


const Edit = ({ arweave }) => {

  const [ key, setKey ] = useState(null);
  const [ pubkey, setPubkey ] = useState(null);
  const [ text, setText ] = useState("");
  const [ title, setTitle ] = useState("");

  const [walletAddress, setWalletAddress] = useState(null);

  const [ story, setStory ] = useState(null);

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
    // form story data as JSON
    const data = {

      title: title,
      content: ((story && story !== "New") ? (story.content + ' ') : '') + text,
    }

    // base64 encode

    // create transaction
    let transaction = await arweave.createTransaction({ data: JSON.stringify(data) }, key);

    // sign transaction
    await arweave.transactions.sign(transaction, key);

    // submit to arweave
    const response = await arweave.transactions.post(transaction);


    // check/wait for status?
    // arweave.transactions.getStatus('bNbA3TEQVL60xlgCcqdz4ZPHFZ711cZ3hmkpGttDt_U').then(res => {
    //   console.log(res);
    //   // {
    //   //  status: 200,
    //   //  confirmed: {
    //   //    block_height: 140151,
    //   //    block_indep_hash: 'OR1wue3oBSg3XWvH0GBlauAtAjBICVs2F_8YLYQ3aoAR7q6_3fFeuBOw7d-JTEdR',
    //   //    number_of_confirmations: 20
    //   //  }
    //   //}
    // })

    console.log("transaction:", transaction);
    console.log("response:", response);

    console.log("Published.");

    // smart contract part
    const provider = getProvider();
    const program = new Program(idl, programID, provider);

    let account = await program.account.baseAccount.fetch(baseAccount.publicKey);
    const pointer = account.data.toString();
    console.log('Pointer: ', account.data.toString());

    let storyIds = [];
    if (pointer !== '') {
      // use array from transaction
      try {
        const dataStr = await arweave.transactions.getData(pointer, {decode: true, string: true});
        const data = JSON.parse(dataStr);
        storyIds = data.txids;
      } catch (err) {
        console.log(err);
      }
    }

    storyIds.push(transaction.id);
    const newData = { txids: storyIds };
    console.log("newData:", newData);
    let pointerTransaction = await arweave.createTransaction({ data: JSON.stringify(newData) }, key);

    // // sign transaction
    await arweave.transactions.sign(pointerTransaction, key);
    console.log("pointerTransaction", pointerTransaction);

    // submit to arweave
    let pointerResponse = await arweave.transactions.post(pointerTransaction);
    console.log("pointerResponse:", pointerResponse);

    const newPointer = pointerTransaction.id;
    console.log("newPointer:", newPointer);
    await program.rpc.setPointer(newPointer, {
      accounts: {
        baseAccount: baseAccount.publicKey,
      },
    });
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
      await program.rpc.initialize({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
  
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
        (pubkey && walletAddress)
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
