
import '../styles/home.css';
import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

const Home = ({ arweave }) => {

  const [ txids, setTxids ] = useState([]);
  const [ stories, setStories ] = useState(null);

  const [ batchSize, setBatchSize ] = useState(6);
  const [ nLoaded, setNLoaded ] = useState(0);
  const [ loading, setLoading ] = useState(true);


  useEffect(async () => {

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
      setLoading(true);
      const queryRes = await arweave.api.post(`arql`, query);
      setTxids(queryRes.data);
      console.log("queryRes:", queryRes);
      const newStories = [];
      let loaded = 0;
      for (let i = 0; i < queryRes.data.length && i < batchSize; i += 1) {
        const txid = queryRes.data[i];
        const txdata = await arweave.transactions.getData(txid, { decode: true, string: true });
        console.log(txdata);
        const data = JSON.parse(txdata);
        data.txid = txid;
        newStories.push(data);
        loaded += 1;
      }
      setStories(newStories);
      setNLoaded(loaded);
      setLoading(false);

    } catch (err) {
      console.log("query err:", err);
    }

    
  }, [])


  const loadMore = async () => {
    console.log("loading more...");
    setLoading(true);
    const newStories = [];
    let loaded = nLoaded;
    for (let i = nLoaded; i < txids.length && i < stories.length + batchSize; i += 1) {
      const txid = txids[i];
      const txdata = await arweave.transactions.getData(txid, { decode: true, string: true });
      console.log(i);
      const data = JSON.parse(txdata);
      data.txid = txid;
      newStories.push(data);
      loaded += 1;
    }
    setStories(prevStories => [...prevStories, ...newStories]);
    setNLoaded(loaded);
    const newBatchSize = batchSize + 3;
    setBatchSize(newBatchSize);
    setLoading(false);
  }

  return (
    <div className="app">

      <div className="top-bar">
        <Link to="/"><h1>weavewrite</h1></Link>
      </div>

      <p>
        Weavewrite is a collaborative storytelling platform, where you can contribute to and fork other people's
        writing to create community-made pieces. See who contributed what parts, and if you don't like them,
        you can write your own endings!
      </p>

      <div className="create-button-container">
        <Link to="/edit"><button>Create</button></Link>
      </div>

      <h2>Explore</h2>
      {
        stories
        &&
        <div className="gallery-container">
          {stories.map((story) => (
            <div className="story-card">
                <h3>{story.title}</h3>
                <p>By: {story.contributors[0].slice(0, 12) + "..."}</p>
                <p>{story.content.length > 0 && (story.content[0].text.slice(0, 50) + "...")}</p>
                <Link to={"/story/" + story.txid}>Go to story</Link>
            </div>
          ))
        }
        </div>
      }

      {
        loading
        &&
        <p>Loading...</p>
      }

      {
        (nLoaded > 0 && nLoaded < txids.length && !loading)
        &&
        <div className="load-more-container">
          <button onClick={loadMore}>Load More</button>
        </div>
      }
      
    </div>
  );
}

export default Home;
