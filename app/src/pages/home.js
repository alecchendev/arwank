
import '../styles/home.css';
import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

const Home = ({ arweave }) => {

  const [ txids, setTxids ] = useState(['Gw9amRZUgcvJ3qttddDzoFaabcEMvR2ySptthzlEsIU']);
  const [ stories, setStories ] = useState(null);

  useEffect(async () => {
    const result = await arweave.blocks.get("zbUPQFA4ybnd8h99KI9Iqh4mogXJibr0syEwuJPrFHhOhld7XBMOUDeXfsIGvYDp"); 
    console.log(result);

    for (let i = 0; i < txids.length; i++) {
      arweave.transactions.getData(txids[i], {decode: true, string: true}).then(data => {
        console.log(data);
        // <!DOCTYPE HTML>...
        const json = JSON.parse(data);
        json.txid = txids[i];
        let newStories = stories;
        if (newStories === null) {
          newStories = [];
        }
        newStories.push(json);
        newStories.push(json);
        newStories.push(json);
        newStories.push(json);
        newStories.push(json);
        setStories(newStories);
      });
    }
  }, [])

  return (
    <div className="app">

      <h1>Hello Arweave!</h1>
      <Link to="/edit">Edit</Link>

      <h2>Gallery</h2>
      {
        stories
        ?
        <div className="gallery-container">
          {stories.map((story) => (
            <div className="story-card">
                <h4>{story.title}</h4>
                <p>{story.content.slice(0, 25) + "..."}</p>
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
