import '../styles/story.css';
import React, { useState, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from 'react-markdown'

const Story = ({ arweave }) => {

  const [ story, setStory ] = useState(null);

  const [ hoveringContributor, setHoveringContributor ] = useState("");

  const { storyId } = useParams();

  useEffect(async () => {

    const dataStr = await arweave.transactions.getData(storyId, {decode: true, string: true});
    const data = JSON.parse(dataStr);
    console.log(data);
    setStory(data);
  }, [])

  const goToStory = (newStoryId) => {
    // because useNavigate wasn't working
    window.location.href = window.location.href.replace(window.location.pathname, "/story/" + newStoryId);
  }

  return (
    <div className="app app-wide">

      <div className="top-bar">
        <Link to="/"><h1>Arwank</h1></Link>
      </div>

      <div className="story-mint-container">

        <div className="story-container">
          {
            story
            ?
            <div>
              <h1 className="story-title">{story.title}</h1>
              {
                Object.entries(story.content).map(([index, section]) => {
                  return (
                    section.txid
                    ?
                    <div className={hoveringContributor === (section.contributor + index) ? "highlight clickable" : ""} onClick={() => goToStory(section.txid)} onMouseEnter={() => setHoveringContributor(section.contributor + index)} onMouseLeave={() => setHoveringContributor("")}><ReactMarkdown children={section.text} /></div>
                    :
                    <div className={hoveringContributor === (section.contributor + index) ? "highlight" : ""} onMouseEnter={() => setHoveringContributor(section.contributor + index)} onMouseLeave={() => setHoveringContributor("")}><ReactMarkdown children={section.text} /></div>
                  )
                })
              }
            </div>
            :
            <p>Loading...</p>
          }

        </div>

        <div className="mint-contributors-container">

          <div className="button-container">
            <Link to={"/edit/" + storyId}><button>Edit</button></Link>
          </div>

          <div className="contributors-container">
          {
            story
            ?
            <div>
              <h3>Contributors:</h3>
              {
                Object.entries(story.content).map(([index, section]) => <p className={hoveringContributor === (section.contributor + index) ? "highlight" : ""} onMouseEnter={() => setHoveringContributor(section.contributor + index)}
                onMouseLeave={() => setHoveringContributor("")}>{section.contributor}</p>)
              }
            </div>
            :
            <p>Loading...</p>
          }


          </div>

        </div>

      </div>
      
    </div>
  );
}

export default Story;
