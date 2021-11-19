
import '../styles/edit.css';
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from "react-router-dom";

const Edit = ({ arweave }) => {

  const [ pubkey, setPubkey] = useState(null);
  const [ key, setKey ] = useState(null);
  const [ text, setText ] = useState("");
  const [ title, setTitle ] = useState("");

  const [ story, setStory ] = useState(null);

  const [ published, setPublished ] = useState(false);

  const { storyId } = useParams();
  const navigate = useNavigate();
  
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

    if (title === "" || text === "") return;

    setPublished("publishing");
    console.log("Publishing...");

    // NEW FORMAT
    let contributors = [];
    let content = [];
    const tags = ["arwankv0.0.1", "arwankStory"]
    if (story && story != "New") {
      contributors = story.contributors;
      content = story.content;
      content[content.length - 1].txid = storyId;
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
      transaction.addTag("App-Name", "arwank");
      transaction.addTag("App-Version", "0.0.1");
      transaction.addTag('Type', 'story')
      await arweave.transactions.sign(transaction, key);
      const response = await arweave.transactions.post(transaction);

      setPublished(true);
      setText("");
      navigate("/story/" + transaction.id);

    } catch (err) {

      console.log("Publish failed:", err);
      setPublished(false);

    }

  }

  const selectFiles = () => {
    console.log("clicked");
    var files = document.getElementById('select-files').files;
    if (files.length <= 0) {
      return false;
    }

    var fr = new FileReader();

    fr.onload = function(e) {
      const result = JSON.parse(e.target.result);
      setKey(result);
          
      arweave.wallets.jwkToAddress(result).then((address) => {
          console.log(address);
          setPubkey(address);
      });   
    };
    fr.readAsText(files.item(0));
  }

  useEffect(async () => {
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

  return (
    <div className="app">

      <div className="top-bar">
        <Link to="/"><h1>weavewrite</h1></Link>
        <div className="button-container">
          <div className="publish-container">
            {
              pubkey
              ?
              (
                !published
                ?
                <div>
                  <button onClick={publishStory}>Publish</button>
                </div>
                :
                (published === "publishing")
                ?
                <div>
                  <button>Publishing...</button>
                </div>
                :
                <div>
                  <button>Published!</button>
                </div>
              )
              :
              <div className="file-upload-container">
                <input type="file" title=" " value="" id="select-files" className="file-upload-input" onChange={selectFiles}/>
                <button id="upload-button" onClick={() => document.getElementById("select-files").click()}>Select Wallet to Publish</button>
              </div>
            }
            </div>
        </div>
      </div>

      {
        pubkey
        &&
        <p>Logged in: {pubkey}</p>
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
            story.content.map((section) => <p>{section.text}</p>)
          )
          :
          <p>Loading...</p>
        }

        <textarea
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
