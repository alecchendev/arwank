
import '../styles/home.css';
import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

import idl from '../data/idl.json';

import { Connection, PublicKey, clusterApiUrl} from '@solana/web3.js';
import {
  Program, Provider, web3
} from '@project-serum/anchor';
import kp from '../data/keypair.json'

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram, Keypair } = web3;

// Create a keypair for the account that will hold the GIF data.
// const arr = Object.values(kp._keypair.secretKey);
// const secret = new Uint8Array(arr);
// const baseAccount = web3.Keypair.fromSecretKey(secret);
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

const Home = ({ arweave }) => {

  const [ baseAccount, setBaseAccount ] = useState();
  const [ baseAccountBump, setBaseAccountBump ] = useState();

  const [ txids, setTxids ] = useState(['Gw9amRZUgcvJ3qttddDzoFaabcEMvR2ySptthzlEsIU']);
  const [ stories, setStories ] = useState(null);

  const [walletAddress, setWalletAddress] = useState(null);

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
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

    // get pointer
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    let account = await program.account.baseAccount.fetch(baseAccountTemp);
    const pointer = account.data.toString();
    console.log('Pointer:', account.data.toString());

    // new get using arql
    const query = {
      op: "and",
      expr1: {
        op: "and",
        expr1: {
          op: 'equals',
          expr1: 'App-Name',
          expr2: 'arwank'
        },
        expr2: {
          op: 'equals',
          expr1: 'App-Version',
          expr2: '0.0.1'
        }
      },
      expr2: {
        op: "equals",
        expr1: "Type",
        expr2: "story",
      }
    };

    try {

      const queryRes = await arweave.api.post(`arql`, query);
      console.log("queryRes:", queryRes);
      const newStories = [];
      for (let i = 0; i < queryRes.data.length; i += 1) {
        const txid = queryRes.data[i];
        const txdata = await arweave.transactions.getData(txid, { decode: true, string: true });
        console.log(txdata);
        const data = JSON.parse(txdata);
        data.txid = txid;
        newStories.push(data);
      }
      setStories(newStories);

    } catch (err) {
      console.log("query err:", err);
    }

    
  }, [])

  return (
    <div className="app">

      <h1>Hello Arweave!</h1>
      <Link to="/edit">Create</Link>

      <div>
      {
        walletAddress
        ?
        <button>Connected</button>
        :
        <button onClick={connectWallet}>Connect Wallet</button>
      }
      </div>

      <h2>Gallery</h2>
      {
        stories
        ?
        <div className="gallery-container">
          {stories.map((story) => (
            <div className="story-card">
                <h4>{story.title}</h4>
                <p>By: {story.contributors[0]}</p>
                <p>{story.content.length > 0 && (story.content[0].text.slice(0, 25) + "...")}</p>
                <Link to={"/story/" + story.txid}>Go to story</Link>
            </div>
          ))
        }
        </div>
        :
        <p>Loading...</p>
      }
      
    </div>
  );
}

export default Home;
